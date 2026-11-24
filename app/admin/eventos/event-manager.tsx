// Formulário e listagem administrativa de eventos e cartazes.
"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { DEMO_EVENTS_STORAGE_KEY } from "../../eventos/confirmed-events";
import styles from "./eventos.module.css";

// Dados do evento exibidos e editados pelo painel administrativo.
type AdminEvent = {
  id: number;
  title: string;
  startDate: string;
  endDate: string;
  startTime: string | null;
  location: string;
  description: string;
  detailsUrl: string | null;
  posterKey: string | null;
  posterUrl?: string;
  published: boolean;
  updatedAt: string;
};
// Campos editáveis de um evento antes da persistência no servidor.
type EventDraft = Omit<AdminEvent, "id" | "posterKey" | "posterUrl" | "updatedAt">;

// Modelo de preenchimento para o evento gastronômico de Prado.
const gastronomicDraft: EventDraft = {
  title: "Evento Gastronômico de Prado", startDate: "", endDate: "", startTime: null,
  location: "Prado — BA", description: "Sabores e experiências locais.",
  detailsUrl: null, published: false,
};
// Valores iniciais do formulário antes de criar ou editar um cadastro.
const blankDraft: EventDraft = { ...gastronomicDraft, title: "", description: "" };
// Formatador reutilizável de datas no padrão brasileiro.
const monthFormatter = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" });
// Formatador reutilizável de datas no padrão brasileiro.
const dayFormatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" });

// Interpreta a data ao meio-dia no fuso -03:00 para evitar mudanças de dia na formatação.
function dateAtNoon(date: string) { return new Date(`${date}T12:00:00-03:00`); }
// Formata o mês e o ano em português com a inicial maiúscula.
function monthLabel(month: string) {
  const label = monthFormatter.format(dateAtNoon(`${month}-01`));
  return label.charAt(0).toUpperCase() + label.slice(1);
}
// Formata a data ou o intervalo de duração do evento.
function dateLabel(event: AdminEvent) {
  const start = dayFormatter.format(dateAtNoon(event.startDate));
  return event.endDate === event.startDate ? start : `${start} – ${dayFormatter.format(dateAtNoon(event.endDate))}`;
}
// Escolhe a URL disponível para o cartaz do evento.
function posterSource(event: AdminEvent) {
  return event.posterUrl ?? (event.posterKey ? `/api/events/${event.id}/poster` : null);
}
// Gerencia a edição de eventos, seus cartazes e a importação dos registros antigos.
export default function EventManager({ initialEvents, loadError, temporaryAccess = false }: {
  initialEvents: AdminEvent[]; loadError: string | null; temporaryAccess?: boolean;
}) {
  // Estado e referências usados para acompanhar a interação e atualizar este componente.
  const [events, setEvents] = useState(initialEvents);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState<EventDraft>(initialEvents.length ? blankDraft : gastronomicDraft);
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [posterPreview, setPosterPreview] = useState<string | null>(null);
  const [removePoster, setRemovePoster] = useState(false);
  const [status, setStatus] = useState<string | null>(loadError);
  const [saving, setSaving] = useState(false);
  const [monthFilter, setMonthFilter] = useState("");
  const [search, setSearch] = useState("");
  const [visibleCount, setVisibleCount] = useState(12);
  const [legacyEvents, setLegacyEvents] = useState<AdminEvent[]>([]);
  const [importingLegacy, setImportingLegacy] = useState(false);

  // Sincroniza o componente com as dependências e executa a limpeza quando necessária.
  useEffect(() => {
    if (!temporaryAccess) return;
    try {
      const stored = window.localStorage.getItem(DEMO_EVENTS_STORAGE_KEY);
      if (!stored) return;
      const parsed = JSON.parse(stored) as AdminEvent[];
      if (Array.isArray(parsed)) setLegacyEvents(parsed.filter((event) => event.id > 0));
    } catch {
      setStatus("Não foi possível recuperar os eventos da demonstração anterior.");
    }
  }, [temporaryAccess]);

  // Sincroniza o componente com as dependências e executa a limpeza quando necessária.
  useEffect(() => {
    if (!posterFile) { setPosterPreview(null); return; }
    const url = URL.createObjectURL(posterFile);
    setPosterPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [posterFile]);

  const selectedEvent = events.find((event) => event.id === editingId);
  const currentPoster = removePoster ? null : posterPreview ?? (selectedEvent ? posterSource(selectedEvent) : null);
  // Recalcula os dados derivados apenas quando as dependências relevantes mudam.
  const months = useMemo(() => [...new Set(events.map((event) => event.startDate.slice(0, 7)))].sort().reverse(), [events]);
  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("pt-BR");
    return events.filter((event) => (!monthFilter || event.startDate.startsWith(monthFilter)) &&
      (!query || `${event.title} ${event.location}`.toLocaleLowerCase("pt-BR").includes(query)))
      .sort((a, b) => b.startDate.localeCompare(a.startDate) || b.id - a.id);
  }, [events, monthFilter, search]);
  const groups = filtered.slice(0, visibleCount).reduce<Record<string, AdminEvent[]>>((result, event) => {
    (result[event.startDate.slice(0, 7)] ??= []).push(event);
    return result;
  }, {});

  // Altera um campo do rascunho sem descartar os demais dados.
  function updateDraft<K extends keyof EventDraft>(key: K, value: EventDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }
  // Encerra a edição e restaura o formulário e os anexos iniciais.
  function resetForm() {
    setEditingId(null); setDraft(blankDraft); setPosterFile(null); setRemovePoster(false);
  }
  // Preenche o rascunho e os controles auxiliares com os dados do item escolhido.
  function startEditing(event: AdminEvent) {
    setEditingId(event.id);
    setDraft({ title: event.title, startDate: event.startDate,
      endDate: event.endDate === event.startDate ? "" : event.endDate,
      startTime: event.startTime, location: event.location, description: event.description,
      detailsUrl: event.detailsUrl, published: event.published });
    setPosterFile(null); setRemovePoster(false); setStatus(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  // Aceita cartazes JPEG, PNG ou WebP de até 5 MB e informa arquivos inválidos.
  function selectPoster(file: File | null) {
    if (file && (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024)) {
      setStatus("Envie um cartaz JPG, PNG ou WebP de até 5 MB."); return;
    }
    setPosterFile(file); setRemovePoster(false); setStatus(null);
  }

  // Salva os dados do evento e sincroniza seu cartaz e a lista administrativa.
  async function saveEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (draft.endDate && draft.endDate < draft.startDate) {
      setStatus("A data final não pode ser anterior à data inicial."); return;
    }
    setSaving(true); setStatus(null);
    const payload = { ...draft, endDate: draft.endDate || draft.startDate };

    try {
      const response = await fetch(editingId ? `/api/admin/events/${editingId}` : "/api/admin/events", {
        method: editingId ? "PATCH" : "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as { event?: AdminEvent; error?: string };
      if (!response.ok || !result.event) throw new Error(result.error ?? "Não foi possível salvar.");
      let saved = result.event;
      if (posterFile) {
        const upload = await fetch(`/api/events/${saved.id}/poster`, {
          method: "PUT", headers: { "Content-Type": posterFile.type }, body: posterFile,
        });
        const uploadResult = (await upload.json()) as { posterUrl?: string; error?: string };
        if (!upload.ok) {
          setEvents((current) => editingId ? current.map((item) => item.id === saved.id ? saved : item) : [saved, ...current]);
          setEditingId(saved.id);
          throw new Error(`Evento salvo, mas o cartaz falhou: ${uploadResult.error ?? "tente novamente"}`);
        }
        saved = { ...saved, posterKey: "uploaded", posterUrl: uploadResult.posterUrl };
      } else if (removePoster && editingId) {
        const removal = await fetch(`/api/events/${saved.id}/poster`, { method: "DELETE" });
        if (!removal.ok) throw new Error("Evento salvo, mas não foi possível remover o cartaz.");
        saved = { ...saved, posterKey: null, posterUrl: undefined };
      }
      setEvents((current) => editingId ? current.map((item) => item.id === saved.id ? saved : item) : [saved, ...current]);
      resetForm(); setStatus(editingId ? "Evento atualizado com sucesso." : "Evento cadastrado com sucesso.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Não foi possível salvar o evento.");
    } finally { setSaving(false); }
  }

  // Confirma a exclusão do evento e o retira da lista após a resposta da API.
  async function removeEvent(event: AdminEvent) {
    if (!window.confirm(`Excluir “${event.title}”?`)) return;
    setStatus(null);
    try {
      const response = await fetch(`/api/admin/events/${event.id}`, { method: "DELETE" });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Não foi possível excluir.");
      setEvents((current) => current.filter((item) => item.id !== event.id));
      if (editingId === event.id) resetForm();
      setStatus("Evento excluído.");
    } catch (error) { setStatus(error instanceof Error ? error.message : "Não foi possível excluir o evento."); }
  }

  // Importa os eventos antigos pela API e atualiza a lista e o estado da operação.
  async function importLegacyEvents() {
    setImportingLegacy(true);
    setStatus(null);
    try {
      const imported: AdminEvent[] = [];
      for (const event of legacyEvents) {
        const response = await fetch("/api/admin/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: event.title,
            startDate: event.startDate,
            endDate: event.endDate,
            startTime: event.startTime,
            location: event.location,
            description: event.description,
            detailsUrl: event.detailsUrl,
            published: event.published,
          }),
        });
        const result = await response.json() as { event?: AdminEvent; error?: string };
        if (!response.ok || !result.event) throw new Error(result.error ?? "Não foi possível transferir os eventos.");
        imported.push(result.event);
      }
      setEvents((current) => [...imported, ...current]);
      setLegacyEvents([]);
      window.localStorage.removeItem(DEMO_EVENTS_STORAGE_KEY);
      setStatus(`${imported.length} ${imported.length === 1 ? "evento transferido" : "eventos transferidos"} para o site. Reenvie o folder ao editar o evento.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Não foi possível transferir os eventos.");
    } finally {
      setImportingLegacy(false);
    }
  }

  // Renderiza a interface com os dados e as ações preparados acima.
  return <>
    {legacyEvents.length > 0 && <div className={styles.legacyImport}>
      <div><strong>Eventos da demonstração encontrados</strong>
        <span>Transfira {legacyEvents.length} {legacyEvents.length === 1 ? "evento salvo" : "eventos salvos"} neste computador para o site.</span></div>
      <button type="button" onClick={importLegacyEvents} disabled={importingLegacy}>
        {importingLegacy ? "Transferindo..." : "Transferir para o site"}
      </button>
    </div>}
    <div className={styles.managerGrid}>
    {/* Campos e ações de envio do formulário, com retorno de validação. */}
    <form className={styles.eventForm} onSubmit={saveEvent}>
      <div className={styles.formHeading}>
        <div><span className={styles.eyebrow}>{editingId ? "Editando" : "Novo evento"}</span>
          <h2>{editingId ? "Atualize a programação" : "Cadastre um evento"}</h2></div>
        {editingId && <button type="button" className={styles.cancelButton} onClick={() => { resetForm(); setStatus(null); }}>Cancelar</button>}
      </div>
      <label>Nome do evento<input required maxLength={120} value={draft.title} onChange={(e) => updateDraft("title", e.target.value)} /></label>
      <div className={styles.formRow}>
        <label><span className={styles.fieldLabel}>Data inicial</span><input required type="date" value={draft.startDate} onChange={(e) => updateDraft("startDate", e.target.value)} /></label>
        <label><span className={styles.fieldLabel}>Data final <span className={styles.optional}>(opcional)</span></span>
          <input type="date" min={draft.startDate || undefined} value={draft.endDate} onChange={(e) => updateDraft("endDate", e.target.value)} /></label>
      </div>
      <p className={styles.fieldHint}>Para um evento de um dia, deixe a data final em branco.</p>
      <div className={styles.formRow}>
        <label>Horário inicial<input type="time" value={draft.startTime ?? ""} onChange={(e) => updateDraft("startTime", e.target.value || null)} /></label>
        <label>Local<input required maxLength={140} value={draft.location} onChange={(e) => updateDraft("location", e.target.value)} /></label>
      </div>
      <label>Descrição para o hóspede<textarea maxLength={500} rows={4} value={draft.description} onChange={(e) => updateDraft("description", e.target.value)} /></label>
      <label>Link com mais detalhes <span className={styles.optional}>(opcional)</span>
        <input type="url" inputMode="url" placeholder="https://..." value={draft.detailsUrl ?? ""} onChange={(e) => updateDraft("detailsUrl", e.target.value || null)} /></label>
      <label>Cartaz ou folder <span className={styles.optional}>(opcional)</span>
        <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => selectPoster(e.target.files?.[0] ?? null)} /></label>
      <p className={styles.fieldHint}>JPG, PNG ou WebP · até 5 MB</p>
      {currentPoster && <div className={styles.posterPreview}>
        <img src={currentPoster} alt="Prévia do cartaz do evento" />
        <button type="button" onClick={() => { setPosterFile(null); setRemovePoster(true); }}>Remover cartaz</button>
      </div>}
      <label className={styles.publishToggle}><input type="checkbox" checked={draft.published} onChange={(e) => updateDraft("published", e.target.checked)} />
        <span><strong>Publicar no site</strong><small>Desmarque para manter como rascunho.</small></span></label>
      {status && <p className={styles.formStatus} role="status">{status}</p>}
      <button className={styles.primaryButton} type="submit" disabled={saving}>
        {saving ? "Salvando..." : editingId ? "Salvar alterações" : "Cadastrar evento"}
      </button>
    </form>

    {/* Seção de conteúdo: Eventos cadastrados. */}
    <section className={styles.eventList} aria-labelledby="event-list-title">
      <div className={styles.listHeading}>
        <div><span className={styles.eyebrow}>Programação</span><h2 id="event-list-title">Eventos cadastrados</h2></div>
        <span className={styles.counter} aria-label={`${events.length} eventos cadastrados`}>{events.length}</span>
      </div>
      <div className={styles.listFilters}>
        <label>Buscar evento<input type="search" value={search} placeholder="Nome ou local" onChange={(e) => { setSearch(e.target.value); setVisibleCount(12); }} /></label>
        <label>Mês<select value={monthFilter} onChange={(e) => { setMonthFilter(e.target.value); setVisibleCount(12); }}>
          <option value="">Todos os meses</option>{months.map((month) => <option key={month} value={month}>{monthLabel(month)}</option>)}
        </select></label>
      </div>
      <p className={styles.resultCount}>{filtered.length} {filtered.length === 1 ? "evento encontrado" : "eventos encontrados"}</p>
      {filtered.length === 0 ? <div className={styles.emptyState}>
        <strong>{events.length === 0 ? "Nenhum evento cadastrado." : "Nenhum evento neste filtro."}</strong>
        <p>{events.length === 0 ? "O Evento Gastronômico já está preparado no formulário. Informe a data e publique quando confirmar." : "Tente buscar outro nome ou selecionar todos os meses."}</p>
      </div> : <>
        {Object.entries(groups).map(([month, monthEvents]) => <div className={styles.monthGroup} key={month}>
          <h3>{monthLabel(month)} <span>{filtered.filter((event) => event.startDate.startsWith(month)).length}</span></h3>
          <div className={styles.monthRows}>{monthEvents.map((event) => <article className={styles.eventRow} key={event.id}>
            {posterSource(event) ? <img className={styles.posterThumb} src={posterSource(event)!} alt="" /> : <span className={styles.posterPlaceholder} aria-hidden="true">EV</span>}
            <div className={styles.eventRowMain}><strong>{event.title}</strong><span>{dateLabel(event)} · {event.location}</span></div>
            <span className={event.published ? styles.published : styles.draft}>{event.published ? "Publicado" : "Rascunho"}</span>
            <div className={styles.rowActions}><button type="button" onClick={() => startEditing(event)}>Editar</button>
              <button type="button" className={styles.deleteButton} onClick={() => removeEvent(event)}>Excluir</button></div>
          </article>)}</div>
        </div>)}
        {visibleCount < filtered.length && <button className={styles.moreButton} type="button" onClick={() => setVisibleCount((count) => count + 12)}>Mostrar mais eventos</button>}
      </>}
    </section>
    </div>
  </>;
}
