import { headers } from "next/headers";
import { isAdminUser } from "./admin-access";
import { getChatGPTUser } from "./chatgpt-auth";

export const TEMPORARY_ADMIN_COOKIE = "cyb-temporary-admin";
const SESSION_PREFIX = "casa-yamamoto-temporary-admin-v1:";

async function getTemporaryPassword(): Promise<string | null> {
  const { env } = await import("cloudflare:workers");
  return env.TEMPORARY_ADMIN_PASSWORD?.trim() || null;
}

async function sessionValue(password: string): Promise<string> {
  const bytes = new TextEncoder().encode(`${SESSION_PREFIX}${password}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
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

export async function verifyTemporaryAdminPassword(value: string): Promise<string | null> {
  const password = await getTemporaryPassword();
  if (!password || !safeEqual(value.trim(), password)) return null;
  return sessionValue(password);
}

export async function isTemporaryAdminRequest(request?: Request): Promise<boolean> {
  const password = await getTemporaryPassword();
  if (!password) return false;
  const cookieHeader = request?.headers.get("cookie") ?? (await headers()).get("cookie");
  const received = cookieValue(cookieHeader, TEMPORARY_ADMIN_COOKIE);
  if (!received) return false;
  return safeEqual(received, await sessionValue(password));
}

export async function getAdminActor(request?: Request): Promise<string | null> {
  const user = await getChatGPTUser();
  if (isAdminUser(user)) return user.email;
  if (await isTemporaryAdminRequest(request)) return "acesso-temporario";
  return null;
}
