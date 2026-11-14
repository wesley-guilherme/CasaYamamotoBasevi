// Supabase Auth is contacted only by the Worker. No provider keys or tokens
// are serialized into a page or persisted in browser storage.
export type ProviderUser = { id: string; email?: string; email_confirmed_at?: string | null; invited_at?: string | null; user_metadata?: { name?: unknown } };
export type ProviderSession = { access_token: string; user: ProviderUser };

export async function authConfiguration() {
  const { env } = await import("cloudflare:workers");
  const url = env.SUPABASE_URL?.replace(/\/$/, "");
  const publicKey = env.SUPABASE_ANON_KEY;
  const secretKey = env.SUPABASE_SERVICE_ROLE_KEY;
  const origin = env.AUTH_SITE_URL?.replace(/\/$/, "");
  if (!url || !publicKey || !secretKey || !origin) return null;
  if (new URL(url).protocol !== "https:" || new URL(origin).protocol !== "https:") return null;
  return { url, publicKey, secretKey, origin, emailEnabled: env.AUTH_EMAIL_ENABLED === "true" };
}

export async function providerRequest<T>(path: string, body: object, options: { admin?: boolean; token?: string; method?: string } = {}): Promise<T> {
  const config = await authConfiguration();
  if (!config) throw new Error("O acesso por e-mail está em configuração. Tente novamente mais tarde.");
  const key = options.admin ? config.secretKey : config.publicKey;
  const bearer = options.token ?? (key.startsWith("eyJ") ? key : null);
  const response = await fetch(`${config.url}/auth/v1/${path}`, {
    method: options.method ?? "POST",
    headers: { apikey: key, ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}), "Content-Type": "application/json" },
    body: JSON.stringify(body), signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) throw new Error("Não foi possível concluir a autenticação.");
  return response.json() as Promise<T>;
}

export async function sendAccountEmail(email: string, invite: boolean, name: string) {
  const config = await authConfiguration();
  if (!config || !config.emailEnabled) throw new Error("O envio de e-mails ainda não foi ativado.");
  const redirect = encodeURIComponent(`${config.origin}/login?mode=password`);
  if (invite) return providerRequest<ProviderUser>(`invite?redirect_to=${redirect}`, { email, data: { name } }, { admin: true });
  await providerRequest(`recover?redirect_to=${redirect}`, { email });
  return null;
}
