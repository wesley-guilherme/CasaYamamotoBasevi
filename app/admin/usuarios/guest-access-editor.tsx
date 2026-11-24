// Formulário de edição do nome e bloqueio da conta de um hóspede.
"use client";
import { useId, useState, type FormEvent } from "react";
import styles from "../eventos/eventos.module.css";
import local from "./users.module.css";

// Permite editar o nome e o bloqueio do acesso de um hóspede.
export default function GuestAccessEditor({ account, busy, save }: {
  account: { id: string; name: string; blocked: number };
  busy: boolean;
  save: (changes: { id: string; name: string; blocked?: boolean }) => Promise<boolean>;
}) {
  // Estado e referências usados para acompanhar a interação e atualizar este componente.
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(account.name);
  const [blocked, setBlocked] = useState(!!account.blocked);
  const formId = useId();
  // Intercepta o envio do formulário e executa a operação correspondente ao modo atual.
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (await save({ id: account.id, name: name.trim(), ...(blocked !== !!account.blocked ? { blocked } : {}) })) setEditing(false);
  }
  // Renderiza a interface com os dados e as ações preparados acima.
  return <>
    <button type="button" disabled={busy} aria-expanded={editing} aria-controls={editing ? formId : undefined} onClick={() => {
      setName(account.name); setBlocked(!!account.blocked); setEditing(!editing);
    }}>Editar acesso</button>
    {editing && <form id={formId} className={local.editor} onSubmit={submit} aria-label={`Editar acesso de ${account.name}`}>
      <h4>Editar acesso do hóspede</h4>
      <div className={local.fields}>
        <label>Nome do hóspede<input required maxLength={120} value={name} onChange={event => setName(event.target.value)} /></label>
        <label>Situação do acesso<select value={blocked ? "blocked" : "active"} onChange={event => setBlocked(event.target.value === "blocked")}><option value="active">Ativo</option><option value="blocked">Bloqueado</option></select></label>
      </div>
      <p className={styles.fieldHint}>A mudança de situação encerra as sessões anteriores deste hóspede.</p>
      <div className={styles.itemActions}><button type="submit" className={styles.primaryButton} disabled={busy || !name.trim()}>Salvar alterações</button><button type="button" disabled={busy} onClick={() => setEditing(false)}>Cancelar</button></div>
    </form>}
  </>;
}
