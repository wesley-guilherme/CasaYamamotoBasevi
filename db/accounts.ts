// Consultas de contas, auditoria de acessos, limite de tentativas e vínculo com estadias.
import type { AccountRole } from "../app/auth-policy";

// Formato da conta individual persistida no banco de acessos.
export type Account = { id: string; auth_id: string | null; email: string; name: string; role: AccountRole; blocked: number; verified_at: string | null; invited_at: string | null; last_login_at: string | null };

// Obtém o banco D1 e informa quando o serviço de contas não está configurado.
export async function accountDatabase(): Promise<D1Database> {
  const { env } = await import("cloudflare:workers");
  if (!env.DB) throw new Error("O serviço de acesso está indisponível.");
  return env.DB;
}

// Busca uma conta pelo e-mail usando parâmetros vinculados à consulta.
export async function findAccount(email: string): Promise<Account | null> {
  return (await accountDatabase()).prepare("SELECT * FROM access_accounts WHERE email = ?").bind(email).first<Account>();
}

// Registra o autor, a ação e a conta envolvidos em uma alteração de acesso.
export async function auditAccess(actor: string, action: string, accountId: string) {
  await (await accountDatabase()).prepare("INSERT INTO access_audit (actor, action, account_id) VALUES (?, ?, ?)").bind(actor, action, accountId).run();
}

// Conta tentativas dentro de uma janela e informa se o limite ainda permite a operação.
export async function consumeRateLimit(key: string, limit: number, windowSeconds: number): Promise<boolean> {
  const now = Math.floor(Date.now() / 1000);
  const row = await (await accountDatabase()).prepare("INSERT INTO access_rate_limits (key, attempts, expires_at) VALUES (?, 1, ?) ON CONFLICT(key) DO UPDATE SET attempts = CASE WHEN expires_at <= ? THEN 1 ELSE attempts + 1 END, expires_at = CASE WHEN expires_at <= ? THEN excluded.expires_at ELSE expires_at END RETURNING attempts").bind(key, now + windowSeconds, now, now).first<{ attempts: number }>();
  return !!row && row.attempts <= limit;
}

// Verifica uma reserva vigente e publicada vinculada ao e-mail da conta não bloqueada.
export async function hasCurrentStay(accountId: string): Promise<boolean> {
  return !!await (await accountDatabase()).prepare("SELECT a.id FROM access_reservations r JOIN house_agenda a ON a.id = r.reservation_id JOIN access_accounts u ON u.id = r.account_id WHERE u.id = ? AND u.blocked = 0 AND lower(trim(a.email)) = u.email AND a.kind = 'reservation' AND a.published = 1 AND a.start_date <= date('now', '-3 hours') AND a.end_date >= date('now', '-3 hours') LIMIT 1").bind(accountId).first();
}
