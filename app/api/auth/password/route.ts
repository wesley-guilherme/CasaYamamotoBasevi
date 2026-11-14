import { createAccountSession, digest, privateJson } from "../../../account-session";
import { destinationFor, normalizeEmail, passwordError, sameOriginMutation } from "../../../auth-policy";
import { providerRequest, type ProviderSession } from "../../../auth-provider";
import { accountDatabase, consumeRateLimit, findAccount, auditAccess } from "../../../../db/accounts";

export async function POST(request: Request) {
  if (!sameOriginMutation(request)) return privateJson({ error: "Solicitação inválida." }, 403);
  try {
    const input = await request.json() as { tokenHash?: unknown; type?: unknown; password?: unknown };
    const error = passwordError(input.password);
    if (error) return privateJson({ error }, 400);
    if (typeof input.tokenHash !== "string" || !/^[a-zA-Z0-9_-]{20,256}$/.test(input.tokenHash) || !["invite", "recovery"].includes(String(input.type))) return privateJson({ error: "Link inválido. Solicite um novo e-mail de acesso." }, 400);
    if (!await consumeRateLimit(`password:${await digest(request.headers.get("cf-connecting-ip") || "unknown")}`, 15, 900)) return privateJson({ error: "Muitas tentativas. Aguarde alguns minutos." }, 429);
    // Supabase consumes the one-time email token here, after an explicit form
    // submission. Link scanners and GET requests cannot activate an account.
    const verified = await providerRequest<ProviderSession>("verify", { token_hash: input.tokenHash, type: input.type });
    const email = normalizeEmail(verified.user.email);
    const db = await accountDatabase();
    let account = await findAccount(email);
    // An invitation issued directly by the Supabase administrator can create
    // only a guest account. invited_at comes from Auth, not editable metadata.
    // Existing accounts retain their server-side role and blocked status.
    if (!account && verified.user.email_confirmed_at && verified.user.invited_at && Number.isFinite(Date.parse(verified.user.invited_at))) {
      const suppliedName = verified.user.user_metadata?.name;
      const name = typeof suppliedName === "string" && suppliedName.trim() ? suppliedName.trim().slice(0, 120) : email.split("@")[0];
      await db.prepare("INSERT INTO access_accounts (id, auth_id, email, name, role, invited_at) VALUES (?, ?, ?, ?, 'guest', ?) ON CONFLICT(email) DO NOTHING").bind(crypto.randomUUID(), verified.user.id, email, name, verified.user.invited_at).run();
      account = await findAccount(email);
    }
    if (!account || account.blocked || account.role === "partner" || !verified.user.email_confirmed_at || account.auth_id && account.auth_id !== verified.user.id) throw new Error("Invalid account");
    await providerRequest("user", { password: input.password }, { token: verified.access_token, method: "PUT" });
    await db.prepare("UPDATE access_accounts SET auth_id = ?, verified_at = COALESCE(verified_at, CURRENT_TIMESTAMP) WHERE id = ? AND blocked = 0").bind(verified.user.id, account.id).run();
    await db.prepare("DELETE FROM access_sessions WHERE account_id = ?").bind(account.id).run();
    await auditAccess(account.id, input.type === "invite" ? "activated" : "password_reset", account.id);
    const response = privateJson({ returnTo: destinationFor(account.role) });
    response.headers.set("Set-Cookie", await createAccountSession(account.id));
    return response;
  } catch { return privateJson({ error: "O link expirou, já foi utilizado ou não permite este acesso. Solicite um novo e-mail." }, 400); }
}
