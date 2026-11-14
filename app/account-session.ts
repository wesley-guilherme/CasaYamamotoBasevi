import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getChatGPTUser } from "./chatgpt-auth";
import { ADMIN_EMAIL } from "./admin-access";
import { accountDatabase, hasCurrentStay, type Account } from "../db/accounts";
import { sameOriginMutation, type AccountRole } from "./auth-policy";

export const ACCOUNT_COOKIE = "__Host-cyb-session";
export type SignedInAccount = { id: string; email: string; name: string; role: AccountRole; owner: boolean; native: boolean };

export async function digest(value: string): Promise<string> {
  return Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value))), byte => byte.toString(16).padStart(2, "0")).join("");
}

export function readSessionCookie(value: string | null): string | null {
  const token = value?.split(";").map(part => part.trim()).find(part => part.startsWith(`${ACCOUNT_COOKIE}=`))?.slice(ACCOUNT_COOKIE.length + 1);
  return token && /^[a-f0-9]{64}$/.test(token) ? token : null;
}

export async function isPrimaryHostIdentity(authId: string | null, email: string): Promise<boolean> {
  if (!authId || email !== ADMIN_EMAIL) return false;
  const { env } = await import("cloudflare:workers");
  return !!env.AUTH_PRIMARY_HOST_ID && authId === env.AUTH_PRIMARY_HOST_ID;
}

export async function currentAccount(request?: Request): Promise<SignedInAccount | null> {
  const requestHeaders = request?.headers ?? await headers();
  const token = readSessionCookie(requestHeaders.get("cookie"));
  if (token) {
    const account = await (await accountDatabase()).prepare("SELECT u.* FROM access_sessions s JOIN access_accounts u ON u.id = s.account_id WHERE s.token_hash = ? AND s.expires_at > unixepoch() AND u.blocked = 0 AND u.verified_at IS NOT NULL").bind(await digest(token)).first<Account>();
    if (account && account.role !== "partner") return { id: account.id, email: account.email, name: account.name, role: account.role, owner: account.role === "host" && await isPrimaryHostIdentity(account.auth_id, account.email), native: false };
  }
  // Preserve the existing platform-managed administrator identity. Password
  // ownership additionally requires the provider ID configured on the server.
  const native = await getChatGPTUser();
  if (native?.email.trim().toLowerCase() === ADMIN_EMAIL) return { id: native.userId, email: native.email, name: native.fullName || "Anfitrião Casa Yamamoto", role: "host", owner: true, native: true };
  return null;
}

export async function requireHost(returnTo: string): Promise<SignedInAccount> {
  const user = await currentAccount();
  if (!user) redirect(`/login?returnTo=${encodeURIComponent(returnTo)}`);
  if (user.role !== "host") redirect("/minha-conta");
  return user;
}

export async function hostActor(request: Request): Promise<SignedInAccount | null> {
  if (!["GET", "HEAD"].includes(request.method) && !sameOriginMutation(request)) return null;
  const user = await currentAccount(request);
  return user?.role === "host" ? user : null;
}

export async function canSeeBenefits(request?: Request): Promise<boolean> {
  const user = await currentAccount(request);
  return !!user && (user.role === "host" || user.role === "guest" && await hasCurrentStay(user.id));
}

export async function createAccountSession(accountId: string): Promise<string> {
  const db = await accountDatabase();
  const token = Array.from(crypto.getRandomValues(new Uint8Array(32)), byte => byte.toString(16).padStart(2, "0")).join("");
  await db.prepare("DELETE FROM access_sessions WHERE expires_at <= unixepoch()").run();
  await db.prepare("INSERT INTO access_sessions (token_hash, account_id, expires_at) VALUES (?, ?, unixepoch() + 28800)").bind(await digest(token), accountId).run();
  await db.prepare("UPDATE access_accounts SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?").bind(accountId).run();
  return `${ACCOUNT_COOKIE}=${token}; Path=/; Max-Age=28800; HttpOnly; Secure; SameSite=Lax`;
}

export async function revokeCurrentSession(request: Request) {
  const token = readSessionCookie(request.headers.get("cookie"));
  if (token) await (await accountDatabase()).prepare("DELETE FROM access_sessions WHERE token_hash = ?").bind(await digest(token)).run();
}

export function privateJson(body: unknown, status = 200): Response {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store", "Referrer-Policy": "no-referrer", "X-Content-Type-Options": "nosniff" } });
}
