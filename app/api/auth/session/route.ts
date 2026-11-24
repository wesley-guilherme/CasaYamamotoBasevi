// API de entrada com senha e encerramento da sessão individual.
import { createAccountSession, digest, privateJson, revokeCurrentSession, ACCOUNT_COOKIE } from "../../../account-session";
import { destinationFor, normalizeEmail, sameOriginMutation } from "../../../auth-policy";
import { authConfiguration, providerRequest, type ProviderSession } from "../../../auth-provider";
import { consumeRateLimit, findAccount } from "../../../../db/accounts";

// Valida a entrada, autentica no provedor e cria a sessão individual da conta.
export async function POST(request: Request) {
  if (!sameOriginMutation(request)) return privateJson({ error: "Solicitação inválida." }, 403);
  if (!await authConfiguration()) return privateJson({ error: "O acesso por e-mail está em configuração. Tente novamente mais tarde." }, 503);
  try {
    const input = await request.json() as { email?: unknown; password?: unknown; returnTo?: unknown };
    const email = normalizeEmail(input.email);
    if (typeof input.password !== "string" || !input.password || input.password.length > 128) return privateJson({ error: "Informe o e-mail e a senha." }, 400);
    const ip = request.headers.get("cf-connecting-ip") || "unknown";
    const [emailAllowed, ipAllowed] = await Promise.all([
      consumeRateLimit(`login-email:${await digest(email)}`, 10, 900),
      consumeRateLimit(`login-ip:${await digest(ip)}`, 50, 900),
    ]);
    if (!emailAllowed || !ipAllowed) return privateJson({ error: "Muitas tentativas. Aguarde alguns minutos." }, 429);
    const result = await providerRequest<ProviderSession>("token?grant_type=password", { email, password: input.password });
    const account = await findAccount(email);
    if (!account || account.blocked || account.role === "partner" || !result.user.email_confirmed_at || result.user.id !== account.auth_id || !account.verified_at) return privateJson({ error: "E-mail, senha ou acesso inválido. Confira seu convite." }, 401);
    const response = privateJson({ returnTo: destinationFor(account.role, input.returnTo) });
    response.headers.set("Set-Cookie", await createAccountSession(account.id));
    return response;
  } catch { return privateJson({ error: "E-mail, senha ou acesso inválido. Confira seu convite." }, 401); }
}

// Revoga a sessão atual e expira o cookie de autenticação.
export async function DELETE(request: Request) {
  if (!sameOriginMutation(request)) return privateJson({ error: "Solicitação inválida." }, 403);
  await revokeCurrentSession(request);
  const response = privateJson({ ok: true });
  response.headers.set("Set-Cookie", `${ACCOUNT_COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`);
  return response;
}
