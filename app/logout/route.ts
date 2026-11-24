// Rotas de saída da conta e redirecionamento após o encerramento da sessão.
import { ACCOUNT_COOKIE, revokeCurrentSession } from "../account-session";
import { sameOriginMutation } from "../auth-policy";
// GET never mutates a session. Signing out requires a same-origin POST.
export async function GET(request: Request) { return Response.redirect(new URL("/minha-conta", request.url), 303); }
// Processa o pedido de saída e encaminha a navegação após encerrar o acesso.
export async function POST(request: Request) {
  if (!sameOriginMutation(request)) return new Response(null, { status: 403 });
  await revokeCurrentSession(request);
  return new Response(null, { status: 303, headers: { Location: "/", "Cache-Control": "no-store", "Set-Cookie": `${ACCOUNT_COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax` } });
}
