"use client";

import { FormEvent, useState } from "react";
import styles from "./eventos.module.css";

type AdminEvent = {
  id: number;
  title: string;
  startDate: string;
  endDate: string;
  startTime: string | null;
  location: string;
  description: string;
  detailsUrl: string | null;
  published: boolean;
  updatedAt: string;
};

type EventDraft = Omit<AdminEvent, "id" | "updatedAt">;

const gastronomicDraft: EventDraft = {
  title: "Evento Gastronômico de Prado",
  startDate: "",
  endDate: "",
  startTime: null,
  location: "Prado — BA",
  description: "Sabores e experiências locais.",
  detailsUrl: null,
  published: false,
};

const blankDraft: EventDraft = {
  title: "",
  startDate: "",
  endDate: "",
  startTime: null,
  location: "Prado — BA",
  description: "",
  detailsUrl: null,
  published: false,
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" })
    .format(new Date(`${date}T12:00:00-03:00`));
}

export default function EventManager({
  initialEvents,
  loadError,
  demoMode = false,
}: {
  initialEvents: AdminEvent[];
  loadError: string | null;
  demoMode?: boolean;
}) {
  const [events, setEvents] = useState(initialEvents);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState<EventDraft>(
    initialEvents.length === 0 ? gastronomicDraft : blankDraft,
  );
  const [status, setStatus] = useState<string | null>(loadError);
  const [saving, setSaving] = useState(false);

  function updateDraft<K extends keyof EventDraft>(key: K, value: EventDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function startEditing(event: AdminEvent) {
    setEditingId(event.id);
    setDraft({
      title: event.title,
      startDate: event.startDate,
      endDate: event.endDate,
      startTime: event.startTime,
      location: event.location,
      description: event.description,
      detailsUrl: event.detailsUrl,
      published: event.published,
    });
    setStatus(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setEditingId(null);
    setDraft(blankDraft);
    setStatus(null);
  }

  async function saveEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setStatus(null);

    if (demoMode) {
      const demoEvent: AdminEvent = {
        id: editingId ?? Date.now(),
        ...draft,
        updatedAt: new Date().toISOString(),
      };
      setEvents((current) =>
        editingId
          ? current.map((item) => (item.id === editingId ? demoEvent : item))
          : [demoEvent, ...current],
      );
      setEditingId(null);
      setDraft(blankDraft);
      setSaving(false);
      setStatus("Demonstração atualizada. Nenhuma alteração foi gravada no site.");
      return;
    }

    try {
      const response = await fetch(
        editingId ? `/api/admin/events/${editingId}` : "/api/admin/events",
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(draft),
        },
      );
      const result = (await response.json()) as { event?: AdminEvent; error?: string };
      if (!response.ok || !result.event) throw new Error(result.error ?? "Não foi possível salvar.");

      setEvents((current) =>
        editingId
          ? current.map((item) => (item.id === editingId ? result.event! : item))
          : [result.event!, ...current],
      );
      setEditingId(null);
      setDraft(blankDraft);
      setStatus(editingId ? "Evento atualizado com sucesso." : "Evento cadastrado com sucesso.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Não foi possível salvar o evento.");
    } finally {
      setSaving(false);
    }
  }

  async function removeEvent(event: AdminEvent) {
    if (!window.confirm(`Excluir “${event.title}”?`)) return;
    setStatus(null);
    if (demoMode) {
      setEvents((current) => current.filter((item) => item.id !== event.id));
      if (editingId === event.id) resetForm();
      setStatus("Evento removido da demonstração. Nada foi alterado no site.");
      return;
    }
    try {
      const response = await fetch(`/api/admin/events/${event.id}`, { method: "DELETE" });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Não foi possível excluir.");
      setEvents((current) => current.filter((item) => item.id !== event.id));
      if (editingId === event.id) resetForm();
      setStatus("Evento excluído.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Não foi possível excluir o evento.");
    }
  }

  return (
    <div className={styles.managerGrid}>
      <form className={styles.eventForm} onSubmit={saveEvent}>
        <div className={styles.formHeading}>
          <div>
            <span className={styles.eyebrow}>{editingId ? "Editando" : "Novo evento"}</span>
            <h2>{editingId ? "Atualize a programação" : "Cadastre um evento"}</h2>
          </div>
          {editingId && <button type="button" className={styles.cancelButton} onClick={resetForm}>Cancelar</button>}
        </div>

        <label>
          Nome do evento
          <input required maxLength={120} value={draft.title} onChange={(e) => updateDraft("title", e.target.value)} />
        </label>
        <div className={styles.formRow}>
          <label>Data inicial<input required type="date" value={draft.startDate} onChange={(e) => updateDraft("startDate", e.target.value)} /></label>
          <label>Data final<input required type="date" min={draft.startDate || undefined} value={draft.endDate} onChange={(e) => updateDraft("endDate", e.target.value)} /></label>
        </div>
        <div className={styles.formRow}>
          <label>Horário inicial<input type="time" value={draft.startTime ?? ""} onChange={(e) => updateDraft("startTime", e.target.value || null)} /></label>
          <label>Local<input required maxLength={140} value={draft.location} onChange={(e) => updateDraft("location", e.target.value)} /></label>
        </div>
        <label>
          Descrição para o hóspede
          <textarea maxLength={500} rows={4} value={draft.description} onChange={(e) => updateDraft("description", e.target.value)} />
        </label>
        <label>
          Link com mais detalhes <span className={styles.optional}>(opcional)</span>
          <input type="url" inputMode="url" placeholder="https://..." value={draft.detailsUrl ?? ""} onChange={(e) => updateDraft("detailsUrl", e.target.value || null)} />
        </label>
        <label className={styles.publishToggle}>
          <input type="checkbox" checked={draft.published} onChange={(e) => updateDraft("published", e.target.checked)} />
          <span><strong>Publicar no site</strong><small>Desmarque para manter como rascunho.</small></span>
        </label>

        {status && <p className={styles.formStatus} role="status">{status}</p>}
        <button className={styles.primaryButton} type="submit" disabled={saving}>
          {saving
            ? "Salvando..."
            : demoMode
              ? editingId ? "Atualizar demonstração" : "Adicionar à demonstração"
              : editingId ? "Salvar alterações" : "Cadastrar evento"}
        </button>
      </form>

      <section className={styles.eventList} aria-labelledby="event-list-title">
        <div className={styles.listHeading}>
          <div><span className={styles.eyebrow}>Programação</span><h2 id="event-list-title">Eventos cadastrados</h2></div>
          <span className={styles.counter}>{events.length}</span>
        </div>

        {events.length === 0 ? (
          <div className={styles.emptyState}>
            <strong>Nenhum evento cadastrado.</strong>
            <p>O Evento Gastronômico já está preparado no formulário. Informe as datas e publique quando confirmar.</p>
          </div>
        ) : (
          events.map((event) => (
            <article className={styles.eventItem} key={event.id}>
              <div className={styles.eventItemTop}>
                <span className={event.published ? styles.published : styles.draft}>
                  {event.published ? "Publicado" : "Rascunho"}
                </span>
                <span>{formatDate(event.startDate)}</span>
              </div>
              <h3>{event.title}</h3>
              <p>{event.location}{event.startTime ? ` · ${event.startTime}` : ""}</p>
              <div className={styles.itemActions}>
                <button type="button" onClick={() => startEditing(event)}>Editar</button>
                <button type="button" className={styles.deleteButton} onClick={() => removeEvent(event)}>Excluir</button>
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  );
}
