import { currentAccount, hostActor, privateJson } from "../../../account-session";
import { normalizeEmail } from "../../../auth-policy";
import { authConfiguration, sendAccountEmail } from "../../../auth-provider";
import { accountDatabase, auditAccess, consumeRateLimit, findAccount, type Account } from "../../../../db/accounts";

export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  const actor = await currentAccount(request);
  if (actor?.role !== "host") return privateJson({ error: "Acesso não autorizado." }, 403);
  const accounts = await (await accountDatabase()).prepare("SELECT id, email, name, role, blocked, verified_at, invited_at, last_login_at FROM access_accounts ORDER BY name, id").all();
  return privateJson({ accounts: accounts.results, configured: !!(await authConfiguration())?.emailEnabled, owner: actor.owner, viewerId: actor.id });
}

export async function POST(request: Request) {
  const actor = await hostActor(request);
  if (!actor) return privateJson({ error: "Acesso não autorizado." }, 403);
  if (!(await authConfiguration())?.emailEnabled) return privateJson({ error: "O envio de convites ainda não foi ativado. Configure o remetente no serviço de autenticação." }, 503);
  try {
    if (!await consumeRateLimit(`invite:${actor.id}`, 30, 3600)) return privateJson({ error: "Limite de envios atingido. Tente mais tarde." }, 429);
    const input = await request.json() as { reservationId?: unknown; email?: unknown; name?: unknown; role?: unknown; accountId?: unknown };
    const db = await accountDatabase();
    let account: Account | null = null;
    let reservationId: number | null = null;
    if (input.accountId) {
      if (typeof input.accountId !== "string") throw new Error("Conta inválida.");
      account = await db.prepare("SELECT * FROM access_accounts WHERE id = ?").bind(input.accountId).first<Account>();
      if (!account || !actor.owner && account.role !== "guest") return privateJson({ error: "Acesso não autorizado." }, 403);
      if (account.blocked || account.role === "partner") throw new Error("Este acesso está bloqueado.");
    } else {
      let email: string;
      let name: string;
      let role: "host" | "guest" = "guest";
      if (input.reservationId !== undefined) {
        if (!Number.isSafeInteger(input.reservationId) || Number(input.reservationId) < 1) throw new Error("Reserva inválida.");
        const reservation = await db.prepare("SELECT id, email, responsible FROM house_agenda WHERE id = ? AND kind = 'reservation'").bind(input.reservationId).first<{ id: number; email: string; responsible: string }>();
        if (!reservation) throw new Error("Reserva não encontrada.");
        email = normalizeEmail(reservation.email); name = reservation.responsible.trim(); reservationId = reservation.id;
      } else {
        if (!actor.owner || input.role !== "host" && input.role !== "guest") return privateJson({ error: "Convide hóspedes pelo cadastro da reserva." }, 403);
        email = normalizeEmail(input.email); name = typeof input.name === "string" ? input.name.trim() : ""; role = input.role;
      }
      if (!name || name.length > 120) throw new Error("Preencha o nome do responsável antes de enviar o convite.");
      await db.prepare("INSERT INTO access_accounts (id, email, name, role) VALUES (?, ?, ?, ?) ON CONFLICT(email) DO NOTHING").bind(crypto.randomUUID(), email, name, role).run();
      account = await findAccount(email);
      if (!account || account.role !== role || account.blocked) throw new Error("Este e-mail já possui outro perfil ou está bloqueado. Revise o cadastro de usuários.");
      if (reservationId) await db.prepare("INSERT INTO access_reservations (reservation_id, account_id) VALUES (?, ?) ON CONFLICT(reservation_id) DO UPDATE SET account_id = excluded.account_id").bind(reservationId, account.id).run();
    }
    const providerUser = await sendAccountEmail(account.email, !account.verified_at, account.name);
    if (providerUser?.id) await db.prepare("UPDATE access_accounts SET auth_id = COALESCE(auth_id, ?) WHERE id = ?").bind(providerUser.id, account.id).run();
    await db.prepare("UPDATE access_accounts SET invited_at = CURRENT_TIMESTAMP WHERE id = ?").bind(account.id).run();
    await auditAccess(actor.email, account.verified_at ? "recovery_sent" : "invitation_sent", account.id);
    return privateJson({ message: account.verified_at ? "Instruções enviadas ao e-mail cadastrado. A reserva está vinculada à conta existente." : "Convite enviado. Confirme o e-mail e crie a senha para ativar a conta." });
  } catch (error) {
    const message = error instanceof Error && /^(Informe|Preencha|Reserva|Este|Convide)/.test(error.message) ? error.message : "Não foi possível enviar o e-mail. Confira a configuração e tente novamente.";
    return privateJson({ error: message }, 400);
  }
}

export async function PATCH(request: Request) {
  const actor = await hostActor(request);
  if (!actor) return privateJson({ error: "Acesso não autorizado." }, 403);
  try {
    const input = await request.json() as { id?: unknown; blocked?: unknown };
    if (typeof input.id !== "string" || typeof input.blocked !== "boolean") return privateJson({ error: "Dados inválidos." }, 400);
    const db = await accountDatabase();
    const account = await db.prepare("SELECT * FROM access_accounts WHERE id = ?").bind(input.id).first<Account>();
    if (!account || !actor.owner && account.role !== "guest" || account.id === actor.id) return privateJson({ error: "Esta alteração não é permitida." }, 403);
    await db.prepare("UPDATE access_accounts SET blocked = ? WHERE id = ?").bind(input.blocked ? 1 : 0, input.id).run();
    await db.prepare("DELETE FROM access_sessions WHERE account_id = ?").bind(input.id).run();
    await auditAccess(actor.email, input.blocked ? "blocked" : "unblocked", input.id);
    return privateJson({ ok: true });
  } catch { return privateJson({ error: "Não foi possível atualizar o acesso." }, 400); }
}
