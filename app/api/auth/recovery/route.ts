// API de solicitação de recuperação de acesso, com limite de tentativas.
import { digest, privateJson } from "../../../account-session";
import { normalizeEmail, sameOriginMutation } from "../../../auth-policy";
import { authConfiguration, sendAccountEmail } from "../../../auth-provider";
import { consumeRateLimit } from "../../../../db/accounts";

// Limita as tentativas e solicita instruções sem revelar a existência de uma conta.
export async function POST(request: Request) {
  if (!sameOriginMutation(request)) return privateJson({ error: "Solicitação inválida." }, 403);
  const config = await authConfiguration();
  if (!config?.emailEnabled) return privateJson({ error: "O envio de e-mails ainda não foi ativado. Entre em contato com o anfitrião." }, 503);
  try {
    const email = normalizeEmail((await request.json() as { email?: unknown }).email);
    const ip = request.headers.get("cf-connecting-ip") || "unknown";
    const [byEmail, byIp] = await Promise.all([consumeRateLimit(`recovery:${await digest(email)}`, 3, 900), consumeRateLimit(`recovery-ip:${await digest(ip)}`, 15, 900)]);
    if (!byEmail || !byIp) return privateJson({ error: "Aguarde alguns minutos antes de tentar novamente." }, 429);
    // Always contact the provider: same response and code path for registered
    // and unknown addresses, without revealing account membership.
    await sendAccountEmail(email, false, "").catch(() => {});
    return privateJson({ message: "Se houver uma conta para este e-mail, você receberá as instruções de acesso." });
  } catch { return privateJson({ error: "Informe um e-mail válido." }, 400); }
}
