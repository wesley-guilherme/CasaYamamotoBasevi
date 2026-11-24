// Listagem de contas e ações administrativas de convite e permissões.
"use client";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import styles from "../eventos/eventos.module.css";
import local from "./users.module.css";
import GuestAccessEditor from "./guest-access-editor";
// Dados resumidos da conta usados para apresentar a identidade e as ações de acesso.
type User = { id: string; name: string; email: string; role: string; blocked: number; verified_at: string | null; invited_at: string | null; last_login_at: string | null; permissions: { edit: boolean; sendEmail: boolean; changeStatus: boolean } };
// Carrega as contas e controla convites, edições e alterações de acesso.
export default function UsersManager({ owner }: { owner: boolean }) {
  // Estado e referências usados para acompanhar a interação e atualizar este componente.
  const [users, setUsers] = useState<User[]>([]);
  const [configured, setConfigured] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"guest" | "host">("guest");
  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/accounts", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Não foi possível carregar os usuários.");
      setUsers(data.accounts); setConfigured(data.configured);
    } catch (e) { setStatus(e instanceof Error ? e.message : "Falha ao carregar."); }
    finally { setLoading(false); }
  }, []);
  // Sincroniza o componente com as dependências e executa a limpeza quando necessária.
  useEffect(() => { void load(); }, [load]);
  // Executa uma ação na API de contas e atualiza os dados e as mensagens do painel.
  async function action(body: object, method = "POST") {
    setBusy(true); setStatus("");
    try {
      const response = await fetch("/api/admin/accounts", { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Não foi possível concluir.");
      setStatus(result.message || "Acesso atualizado."); await load(); return true;
    } catch (e) { setStatus(e instanceof Error ? e.message : "Não foi possível concluir."); return false; }
    finally { setBusy(false); }
  }
  // Renderiza a interface com os dados e as ações preparados acima.
  return <div className={local.workspace}>
    {!loading && !configured && <div className={styles.demoBanner} role="status"><strong>Configuração de autenticação pendente</strong><span>Conecte o Supabase Auth e configure o envio de e-mails para habilitar convites e senhas individuais.</span></div>}
    {owner && <form className={styles.eventForm} onSubmit={(e: FormEvent) => { e.preventDefault(); void action({ name, email, role }); }}><h2>Convidar usuário</h2><div className={local.fields}><label>Perfil<select value={role} onChange={e => setRole(e.target.value as "guest" | "host")}><option value="guest">Hóspede</option><option value="host">Anfitrião</option></select></label></div><p className={styles.fieldHint}>{role === "host" ? "O anfitrião poderá administrar reservas, eventos, parceiros e acessos de hóspedes. Somente o administrador principal pode convidar outros anfitriões." : "O hóspede terá uma conta pessoal. Os benefícios só serão liberados quando uma reserva publicada estiver vinculada à conta, durante a estadia. Para vincular, use “Convidar hóspede” no cadastro da reserva."}</p><div className={local.fields}><label>Nome<input required maxLength={120} value={name} onChange={e => setName(e.target.value)} /></label><label>E-mail<input required type="email" maxLength={254} value={email} onChange={e => setEmail(e.target.value)} /></label></div><button className={styles.primaryButton} disabled={busy || !configured}>Enviar convite</button></form>}
    <div className={styles.eventList}><div className={styles.listHeading}><h2>Contas cadastradas</h2><span className={styles.counter}>{users.length}</span></div><p className={styles.fieldHint}>Todos os anfitriões podem editar o acesso de todos os hóspedes, independentemente de quem enviou o convite. E-mail confirmado significa que o usuário utilizou o convite. Os benefícios do hóspede ficam disponíveis entre a entrada e o dia da saída da reserva vinculada.</p>
      {loading ? <p role="status">Carregando acessos…</p> : !users.length && <p className={styles.emptyState}>Nenhum convite cadastrado. Abra uma reserva e selecione “Convidar hóspede”.</p>}
      {users.map(user => <article key={user.id} className={styles.eventItem}><div className={styles.eventItemTop}><span className={user.blocked ? styles.draft : styles.published}>{user.blocked ? "Bloqueado" : user.verified_at ? "Conta ativada · e-mail confirmado" : user.invited_at ? "Convite pendente" : "Convite não enviado"}</span><span>{user.role === "host" ? "Anfitrião" : user.role === "guest" ? "Hóspede" : "Parceiro · indisponível"}</span></div><h3>{user.name}</h3><p className={local.email}>{user.email}</p><p className={styles.fieldHint}>{user.last_login_at ? `Último acesso: ${new Date(user.last_login_at.replace(" ", "T") + "Z").toLocaleString("pt-BR", { timeZone: "America/Bahia" })}` : "Ainda não acessou"}</p>{(user.permissions.edit || user.permissions.sendEmail || user.permissions.changeStatus) && <div className={`${styles.itemActions} ${local.accessActions}`}>{user.permissions.edit && <GuestAccessEditor account={user} busy={busy} save={changes => action(changes, "PATCH")} />}{user.permissions.sendEmail && <button type="button" disabled={busy || !configured || !!user.blocked || user.role === "partner"} onClick={() => void action({ accountId: user.id })}>{user.verified_at ? "Enviar recuperação de senha" : "Reenviar convite"}</button>}{user.permissions.changeStatus && <button type="button" disabled={busy} onClick={() => { if (window.confirm(user.blocked ? "Reativar o acesso desta conta?" : "Bloquear o acesso e encerrar as sessões desta conta?")) void action({ id: user.id, blocked: !user.blocked }, "PATCH"); }}>{user.blocked ? "Reativar acesso" : "Bloquear acesso"}</button>}</div>}</article>)}
    </div>
    <p className={styles.fieldHint}>A área de parceiros será disponibilizada em uma próxima atualização. Nenhum parceiro recebe acesso à lista de hóspedes nesta versão.</p>
    {status && <p className={styles.formStatus} role="status" aria-live="polite">{status}</p>}
  </div>;
}
