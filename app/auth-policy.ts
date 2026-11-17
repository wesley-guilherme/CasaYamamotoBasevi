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
  return typeof value !== "string" || value.length < 8 || value.length > 12 || !/\p{Lu}/u.test(value) || !/[0-9]/.test(value) || !/[\p{P}\p{S}]/u.test(value)
    ? "Use de 8 a 12 caracteres, com pelo menos 1 letra maiúscula, 1 número e 1 caractere especial."
    : null;
}

export function destinationFor(_role: AccountRole, _value?: unknown): string {
  return "/";
}

export function sameOriginMutation(request: Request): boolean {
  const origin = request.headers.get("origin");
  return !!origin && origin === new URL(request.url).origin && request.headers.get("sec-fetch-site") !== "cross-site";
}
