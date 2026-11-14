export type AccountRole = "host" | "guest" | "partner";

export function normalizeEmail(value: unknown): string {
  if (typeof value !== "string") throw new Error("Informe um e-mail válido.");
  const email = value.trim().toLowerCase();
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Informe um e-mail válido.");
  return email;
}

export function safeDestination(value: unknown, fallback = "/parceiros"): string {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) return fallback;
  try {
    const url = new URL(value, "https://app.local");
    if (url.origin !== "https://app.local" || /^\/(api|login|logout|signin-with-chatgpt|signout-with-chatgpt|callback)(\/|$)/.test(url.pathname)) return fallback;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch { return fallback; }
}

export function passwordError(value: unknown): string | null {
  return typeof value !== "string" || value.length < 12 || value.length > 128
    ? "Use uma senha com 12 a 128 caracteres. Uma frase longa é uma boa opção."
    : null;
}

export function destinationFor(role: AccountRole, value?: unknown): string {
  if (role === "partner") return "/";
  const path = safeDestination(value, role === "host" ? "/admin/agenda" : "/parceiros");
  return role === "guest" && /^\/admin(\/|$)/.test(path) ? "/parceiros" : path;
}

export function sameOriginMutation(request: Request): boolean {
  const origin = request.headers.get("origin");
  return !!origin && origin === new URL(request.url).origin && request.headers.get("sec-fetch-site") !== "cross-site";
}
