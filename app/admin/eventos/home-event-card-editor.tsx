"use client";

import { useEffect, useState, type FormEvent } from "react";
import HomeEventCard from "../../home-event-card";
import { eventMonths, type HomeEventCardData } from "../../home-event-card-data";
import styles from "./eventos.module.css";
import editor from "./home-event-card-editor.module.css";

export default function HomeEventCardEditor({ initialCard, loadError }: { initialCard: HomeEventCardData; loadError: string | null }) {
  const [draft, setDraft] = useState(initialCard);
  const [ready, setReady] = useState(false);
  useEffect(() => { setReady(true); }, []);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);
  function update<K extends keyof HomeEventCardData>(key: K, value: HomeEventCardData[K]) {
    setDraft(current => ({ ...current, [key]: value }));
    setMessage("");
  }
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving || loadError) return;
    setSaving(true); setMessage(""); setFailed(false);
    try {
      const response = await fetch("/api/admin/home-event-card", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(draft) });
      const result = await response.json() as { card?: HomeEventCardData; error?: string };
      if (!response.ok || !result.card) throw new Error(result.error || "Não foi possível salvar o cartão.");
      setDraft(result.card);
      setMessage("Cartão atualizado na página inicial.");
    } catch (error) {
      setFailed(true);
      setMessage(error instanceof Error ? error.message : "Não foi possível salvar. Confira sua conexão e tente novamente.");
    } finally { setSaving(false); }
  }
  return (
    <section className={editor.section} aria-labelledby="home-event-card-heading">
      <div className={editor.heading}>
        <h2 id="home-event-card-heading">Evento previsto na página inicial</h2>
        <p>Edite o destaque da seção Planeje sua estadia. O rótulo “EVENTO PREVISTO” e o link para o calendário de Prado permanecem no cartão.</p>
      </div>
      <div className={editor.grid}>
        <form className={styles.eventForm} onSubmit={save} aria-busy={saving || !ready}>
          {loadError && <p className={styles.formStatus} role="alert">{loadError} <a href="">Recarregar painel</a></p>}
          <fieldset className={editor.fields} disabled={!ready || saving || !!loadError}>
            <legend className={editor.legend}>Conteúdo do cartão</legend>
            <label>Mês<select value={draft.month} onChange={event => update("month", Number(event.target.value))}>{eventMonths.map((month, index) => <option key={month} value={index + 1}>{month}</option>)}</select></label>
            <label>Nome do evento<input required maxLength={120} value={draft.title} onChange={event => update("title", event.target.value)} /></label>
            <label>Frase do evento<textarea required rows={3} maxLength={500} value={draft.description} onChange={event => update("description", event.target.value)} /></label>
            <label>Aviso<input required maxLength={140} value={draft.status} onChange={event => update("status", event.target.value)} /></label>
            <button className={styles.primaryButton} type="submit">{saving ? "Salvando…" : "Salvar cartão na página inicial"}</button>
          </fieldset>
          {message && <p className={styles.formStatus} role={failed ? "alert" : "status"}>{message}</p>}
        </form>
        <div className={editor.preview}>
          <p className={editor.previewLabel}>Prévia do cartão</p>
          <HomeEventCard card={draft} />
          <p className={styles.fieldHint}>A prévia acompanha a edição. Para publicar os textos, clique em Salvar cartão na página inicial.</p>
          <a className={editor.viewLink} href="/#planeje" target="_blank" rel="noreferrer">Ver na página inicial ↗</a>
        </div>
      </div>
    </section>
  );
}
