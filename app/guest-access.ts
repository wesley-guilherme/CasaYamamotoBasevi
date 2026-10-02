import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const GUEST_ACCESS_COOKIE = "cyb-guest-access";
const SESSION_PREFIX = "casa-yamamoto-guest-access-v1:";

async function getGuestPassword(): Promise<string | null> {
  const { env } = await import("cloudflare:workers");
  return env.GUEST_ACCESS_PASSWORD?.trim() || null;
}

async function sessionValue(password: string): Promise<string> {
  const bytes = new TextEncoder().encode(`${SESSION_PREFIX}${password}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

function cookieValue(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(";")) {
    const [key, ...value] = part.trim().split("=");
    if (key === name) return decodeURIComponent(value.join("="));
  }
  return null;
}

function safeEqual(left: string, right: string): boolean {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return difference === 0;
}

export async function verifyGuestPassword(value: string): Promise<string | null> {
  const password = await getGuestPassword();
  if (!password || !safeEqual(value, password)) return null;
  return sessionValue(password);
}

export async function isGuestRequest(request?: Request): Promise<boolean> {
  const password = await getGuestPassword();
  if (!password) return false;

  const cookieHeader = request?.headers.get("cookie") ?? (await headers()).get("cookie");
  const received = cookieValue(cookieHeader, GUEST_ACCESS_COOKIE);
  if (!received) return false;

  return safeEqual(received, await sessionValue(password));
}

export async function requireGuestAccess(returnTo: string): Promise<void> {
  if (await isGuestRequest()) return;
  redirect(`/login?returnTo=${encodeURIComponent(safeReturnTo(returnTo))}`);
}

export function safeReturnTo(value: string | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/parceiros";

  try {
    const url = new URL(value, "https://app.local");
    if (url.origin !== "https://app.local") return "/parceiros";
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return "/parceiros";
  }
}
