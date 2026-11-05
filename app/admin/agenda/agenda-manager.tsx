"use client";
import { useEffect, useState, type FormEvent } from "react";
import { defaultRentalOrigins, filterHistoryPeriod, formatPeriod, formatRentalAmount, formatRentalAmountInput, historyPeriodError, houseToday, partitionReservations, rentalAmountToCents, rentalSummaryPeriodError, summarizeRentalOrigins, type AgendaRecord, type AgendaKind, type AgendaInput } from "../../agenda/agenda-data";
import { parseBrazilLocation } from "../../agenda/brazil-location";
import LocationFields from "./location-fields";
import styles from "../eventos/eventos.module.css";
import agendaStyles from "../../agenda/agenda.module.css";

const blank = (kind: AgendaKind): AgendaInput => ({ kind, title: "", startDate: "", endDate: "", description: "", published: true, responsible: "", email: "", city: "", state: "", rentalOrigin: "", rentalAmountCents: null });

function RevenueSummary({ items, origins, loadError }: { items: AgendaRecord[]; origins: string[]; loadError: string | null }) {
  const [startMonth, setStartMonth] = useState("");
  const [endMonth, setEndMonth] = useState("");
  const periodError = rentalSummaryPeriodError({ startMonth, endMonth });
  const filtered = !!(startMonth || endMonth);
  const summary = periodError ? [] : summarizeRentalOrigins(items, origins, { startMonth, endMonth });
  const total = summary.reduce((sum, group) => sum + group.amountCents, 0);
  const missing = summary.reduce((sum, group) => sum + group.missingAmounts, 0);
  const count = summary.reduce((sum, group) => sum + group.count, 0);
  return <section className={agendaStyles.revenueSummary} aria-labelledby="rental-summary-title">
    <div className={agendaStyles.revenueHeading}><div><h3 id="rental-summary-title">Aluguéis por origem</h3><p>{filtered ? "Período selecionado" : "Todos os períodos"} · valores cadastrados, sem desconto de taxas ou despesas.</p></div><div className={agendaStyles.revenueTotal} aria-live="polite" aria-atomic="true"><span>Total dos aluguéis</span><strong>{loadError ? "Indisponível" : periodError ? "—" : formatRentalAmount(total)}</strong></div></div>
    <div className={agendaStyles.revenueFilters}>
      <label>Mês inicial<input type="month" min="2000-01" max="2100-12" value={startMonth} disabled={!!loadError} aria-describedby={periodError ? "rental-period-hint rental-period-error" : "rental-period-hint"} aria-invalid={!!periodError} onChange={event => setStartMonth(event.target.value)} /></label>
      <label>Mês final<input type="month" min={startMonth || "2000-01"} max="2100-12" value={endMonth} disabled={!!loadError} aria-describedby={periodError ? "rental-period-hint rental-period-error" : "rental-period-hint"} aria-invalid={!!periodError} onChange={event => setEndMonth(event.target.value)} /></label>
      <button type="button" disabled={!!loadError || !filtered} onClick={() => { setStartMonth(""); setEndMonth(""); }}>Limpar filtro</button>
    </div>
    <p className={agendaStyles.periodHint} id="rental-period-hint">O filtro considera o mês da entrada e inclui os meses inicial e final. Deixe os campos vazios para ver todos os períodos.</p>
    {loadError ? <p role="status">{loadError}</p> : periodError ? <p className={styles.formStatus} id="rental-period-error" role="alert">{periodError}</p> : <>
      {filtered && count === 0 && <p className={agendaStyles.summaryHint} role="status">Nenhuma reserva com entrada no período selecionado.</p>}
      <div className={agendaStyles.revenueTableWrap}><table className={agendaStyles.revenueTable}><thead><tr><th scope="col">Origem do aluguel</th><th scope="col">Reservas</th><th scope="col">Valor total</th></tr></thead><tbody>{summary.map(group => <tr key={group.origin}><th scope="row">{group.origin}{group.missingAmounts > 0 && <small>{group.missingAmounts} {group.missingAmounts === 1 ? "reserva sem valor" : "reservas sem valor"}</small>}</th><td>{group.count}</td><td>{formatRentalAmount(group.amountCents)}</td></tr>)}</tbody></table></div>
      {missing > 0 && <p className={agendaStyles.summaryHint}>{missing} {missing === 1 ? "reserva ainda não tem valor informado e não entra" : "reservas ainda não têm valor informado e não entram"} no total. Edite as reservas para completar os dados.</p>}
    </>}
  </section>;
}

function ReservationDetails({ item }: { item: AgendaRecord }) {
  return <dl className={agendaStyles.reservationDetails}>
    <div><dt>Responsável</dt><dd>{item.responsible || "Não informado"}</dd></div>
    {item.email && <div><dt>E-mail</dt><dd>{item.email}</dd></div>}
    {(item.city || item.state) && <div><dt>Cidade / estado</dt><dd>{[item.city, item.state].filter(Boolean).join(" / ")}</dd></div>}
    <div><dt>Origem</dt><dd>{item.rentalOrigin || "Não informada"}</dd></div>
    <div><dt>Valor do aluguel</dt><dd>{item.rentalAmountCents == null ? "Não informado" : formatRentalAmount(item.rentalAmountCents)}</dd></div>
  </dl>;
}

function ReservationHistory({ items, disabled, loadError, onEdit, onRemove }: { items: AgendaRecord[]; disabled: boolean; loadError: string | null; onEdit: (item: AgendaRecord) => void; onRemove: (item: AgendaRecord) => void }) {
  const [query, setQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const periodError = historyPeriodError({ startDate, endDate });
  const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR");
  const search = normalize(query.trim());
  const filtered = periodError ? [] : filterHistoryPeriod(items, { startDate, endDate }).filter(item => normalize([item.title, item.responsible, item.email, item.city, item.state, item.rentalOrigin, item.startDate, item.endDate, formatPeriod(item.startDate, item.endDate)].join(" ")).includes(search));
  return <details className={styles.eventList + " " + agendaStyles.historyPanel}>
    <summary className={agendaStyles.historyHeading}><span>Histórico de reservas</span><span className={styles.counter}>{items.length}</span></summary>
    <p className={agendaStyles.historyHint}>Estadias encerradas após a data de saída. Abra uma reserva para consultar os detalhes.</p>
    {loadError ? <p className={styles.emptyState}>{loadError}</p> : !items.length ? <p className={styles.emptyState}>Nenhuma estadia encerrada.</p> : <>
      <label className={agendaStyles.historySearch}>Buscar no histórico<input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Nome, responsável ou origem" /></label>
      <div className={agendaStyles.historyPeriod}>
        <label>Data inicial<input type="date" min="2000-01-01" max="2100-12-31" value={startDate} onChange={event => setStartDate(event.target.value)} aria-invalid={!!periodError} aria-describedby="history-period-hint" /></label>
        <label>Data final<input type="date" min={startDate || "2000-01-01"} max="2100-12-31" value={endDate} onChange={event => setEndDate(event.target.value)} aria-invalid={!!periodError} aria-describedby="history-period-hint" /></label>
      </div>
      <p className={agendaStyles.historyHint} id="history-period-hint">Inclui reservas com alguma noite entre as datas escolhidas. Os dois limites são opcionais.</p>
      <button className={agendaStyles.historyClear} type="button" disabled={!query && !startDate && !endDate} onClick={() => { setQuery(""); setStartDate(""); setEndDate(""); }}>Limpar filtros</button>
      {periodError ? <p className={styles.formStatus} role="alert">{periodError}</p> : <p className={agendaStyles.historyHint} role="status">{filtered.length} {filtered.length === 1 ? "reserva encontrada" : "reservas encontradas"}</p>}
      {!periodError && !filtered.length && <p className={styles.emptyState}>Nenhuma reserva encontrada para esta busca.</p>}
      {filtered.map(item => <details className={agendaStyles.historyRow} key={item.id}>
        <summary><span className={agendaStyles.historyMain}><strong>{item.title}</strong><span>{formatPeriod(item.startDate, item.endDate)}</span><span>{item.rentalOrigin || "Origem não informada"}</span></span><strong className={agendaStyles.historyAmount}>{item.rentalAmountCents == null ? "Valor não informado" : formatRentalAmount(item.rentalAmountCents)}</strong></summary>
        <ReservationDetails item={item} />
        {item.description && <p className={agendaStyles.reservationNotes}>{item.description}</p>}
        <div className={styles.itemActions}><button type="button" disabled={disabled} onClick={() => onEdit(item)}>Editar</button><button type="button" disabled={disabled} className={styles.deleteButton} onClick={() => onRemove(item)}>Excluir</button></div>
      </details>)}
    </>}
  </details>;
}

function Editor({ kind, initial, initialOrigins = [], today, loadError }: { kind: AgendaKind; initial: AgendaRecord[]; initialOrigins?: string[]; today: string; loadError: string | null }) {
  const [items, setItems] = useState(initial);
  const [draft, setDraft] = useState(blank(kind));
  const [amount, setAmount] = useState("");
  const [origins, setOrigins] = useState([...new Set([...defaultRentalOrigins, ...initialOrigins, ...initial.map(item => item.rentalOrigin).filter(Boolean)])]);
  const [newOrigin, setNewOrigin] = useState("");
  const [addingOrigin, setAddingOrigin] = useState(false);
  const [originStatus, setOriginStatus] = useState<string | null>(null);
  const [originBusy, setOriginBusy] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [status, setStatus] = useState(loadError);
  const [busy, setBusy] = useState(false);
  const reservation = kind === "reservation";
  const disabled = busy || originBusy || !!loadError;
  const reservations = partitionReservations(items, today);
  const visibleItems = reservation ? reservations.current : items;

  function field<K extends keyof AgendaInput>(key: K, value: AgendaInput[K]) { setDraft(d => ({ ...d, [key]: value })); }
  function reset() { setDraft(blank(kind)); setAmount(""); setEditId(null); setAddingOrigin(false); setNewOrigin(""); setOriginStatus(null); }
  function rememberOrigin(name: string) { setOrigins(old => old.includes(name) ? old : [...old, name]); }
  function changeAmount(value: string) {
    try { setAmount(formatRentalAmountInput(value)); setStatus(null); }
    catch (error) { setStatus(error instanceof Error ? error.message : "Informe um valor válido."); }
  }
  function edit(item: AgendaRecord) {
    setEditId(item.id); setDraft({ ...item }); setAmount(item.rentalAmountCents == null ? "" : formatRentalAmountInput(String(item.rentalAmountCents))); setAddingOrigin(false); setNewOrigin(""); setOriginStatus(null); setStatus(null);
  }

  async function addOrigin() {
    setOriginBusy(true); setOriginStatus(null);
    try {
      const response = await fetch("/api/admin/agenda/origins", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: newOrigin }) });
      const result = await response.json() as { name: string; error?: string };
      if (!response.ok) throw new Error(result.error || "Não foi possível cadastrar a origem.");
      rememberOrigin(result.name); field("rentalOrigin", result.name); setNewOrigin(""); setAddingOrigin(false); setOriginStatus("Origem cadastrada e selecionada.");
    } catch (error) { setOriginStatus(error instanceof Error ? error.message : "Não foi possível cadastrar a origem."); }
    finally { setOriginBusy(false); }
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setStatus(null);
    try {
      const original = items.find(item => item.id === editId);
      const location = reservation && (draft.state !== original?.state || draft.city !== original?.city) ? parseBrazilLocation(draft.state, draft.city) : { state: draft.state, city: draft.city };
      const input = { ...draft, ...location, rentalAmountCents: reservation ? rentalAmountToCents(amount) : null };
      const response = await fetch("/api/admin/agenda" + (editId ? "/" + editId : ""), { method: editId ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
      const result = await response.json() as { item: AgendaRecord; error?: string };
      if (!response.ok) throw new Error(result.error || "Não foi possível salvar.");
      setItems(old => [...old.filter(i => i.id !== result.item.id), result.item].sort((a, b) => a.startDate.localeCompare(b.startDate)));
      if (result.item.rentalOrigin) rememberOrigin(result.item.rentalOrigin);
      reset(); setStatus(reservation ? "Reserva salva. Calendário e totais por origem atualizados." : result.item.published ? "Feriado publicado na área de sugestões." : "Feriado salvo como rascunho.");
    } catch (error) { setStatus(error instanceof Error ? error.message : "Não foi possível salvar."); }
    finally { setBusy(false); }
  }

  async function remove(item: AgendaRecord) {
    if (!window.confirm(reservation ? "Excluir esta reserva, liberar as noites no calendário e retirar o valor dos totais?" : "Excluir este feriado prolongado?")) return;
    setBusy(true);
    try {
      const response = await fetch("/api/admin/agenda/" + item.id, { method: "DELETE" });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || "Não foi possível excluir.");
      setItems(old => old.filter(i => i.id !== item.id));
      if (editId === item.id) reset();
      setStatus(reservation ? "Reserva excluída. Calendário e totais por origem atualizados." : "Período excluído.");
    } catch (error) { setStatus(error instanceof Error ? error.message : "Não foi possível excluir."); }
    finally { setBusy(false); }
  }

  return <section aria-labelledby={kind + "-title"}>
    <h2 className={agendaStyles.editorHeading} id={kind + "-title"}>{reservation ? "Reservas da casa" : "Feriados prolongados"}</h2>
    {reservation && <RevenueSummary items={items} origins={origins} loadError={loadError} />}
    <div className={styles.managerGrid}>
      <form className={styles.eventForm} onSubmit={save}>
        <div className={styles.formHeading}><h3>{editId ? reservation ? "Editar reserva" : "Editar feriado" : reservation ? "Cadastrar reserva" : "Cadastrar feriado"}</h3></div>
        <fieldset className={agendaStyles.editorFields} disabled={disabled}>
          <label>{reservation ? "Identificação interna da reserva" : "Nome do feriado"}<input required maxLength={120} value={draft.title} onChange={e => field("title", e.target.value)} placeholder={reservation ? "Ex.: Reserva de outubro" : "Ex.: Feriado de outubro"} /></label>
          {reservation && <>
            <p className={styles.fieldHint}>Os dados do responsável, a origem, o valor e as observações ficam apenas no painel do anfitrião.</p>
            <div className={styles.formRow}><label>Responsável<input autoComplete="name" maxLength={120} value={draft.responsible} onChange={e => field("responsible", e.target.value)} placeholder="Nome do responsável pela reserva" /></label><label>E-mail<input type="email" autoComplete="email" maxLength={254} value={draft.email} onChange={e => field("email", e.target.value)} placeholder="nome@exemplo.com" /></label></div>
            <LocationFields state={draft.state} city={draft.city} onChange={location => setDraft(current => ({ ...current, ...location }))} />
            <div className={styles.formRow}>
              <label>Origem do aluguel<select className={agendaStyles.originSelect} value={draft.rentalOrigin} onChange={e => field("rentalOrigin", e.target.value)}><option value="">Selecione a origem</option>{origins.map(origin => <option key={origin} value={origin}>{origin}</option>)}</select></label>
              <label>Valor do aluguel (R$)<input type="text" inputMode="numeric" maxLength={40} value={amount} onChange={e => changeAmount(e.target.value)} placeholder="0,00" /><span className={styles.fieldHint}>Digite só os números: 150000 vira 1.500,00. Deixe vazio se o valor ainda não foi definido.</span></label>
            </div>
            <button className={agendaStyles.originToggle} type="button" aria-expanded={addingOrigin} onClick={() => { setAddingOrigin(!addingOrigin); setOriginStatus(null); }}>Cadastrar nova origem</button>
            {addingOrigin && <div className={agendaStyles.originForm}><label>Nova origem<input maxLength={80} value={newOrigin} onChange={e => setNewOrigin(e.target.value)} placeholder="Ex.: Indicação" onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); if (newOrigin.trim()) void addOrigin(); } }} /></label><button type="button" className={agendaStyles.originButton} disabled={!newOrigin.trim()} onClick={() => void addOrigin()}>Cadastrar origem</button></div>}
          </>}
          <div className={styles.formRow}><label>{reservation ? "Data de entrada" : "Início do período"}<input required type="date" min="2000-01-01" max="2100-12-31" value={draft.startDate} onChange={e => field("startDate", e.target.value)} /></label><label>{reservation ? "Data de saída" : "Fim do período"}<input required type="date" min={draft.startDate || "2000-01-01"} max="2100-12-31" value={draft.endDate} onChange={e => field("endDate", e.target.value)} /></label></div>
          <p className={styles.fieldHint}>{reservation ? "As noites entre a entrada e a saída ficam reservadas. O dia da saída fica livre para uma nova entrada." : "Inclua os dias de emenda sugeridos. O cadastro não bloqueia o calendário."}</p>
          <label>{reservation ? "Observações internas (opcional)" : "Descrição para o visitante (opcional)"}<textarea maxLength={500} rows={3} value={draft.description} onChange={e => field("description", e.target.value)} /></label>
          {!reservation && <label className={styles.publishToggle}><input type="checkbox" checked={draft.published} onChange={e => field("published", e.target.checked)} /><span>Publicar para os visitantes<small>Desmarque para guardar como rascunho.</small></span></label>}
        </fieldset>
        {originStatus && <p className={styles.formStatus} role="status">{originStatus}</p>}
        {status && <p className={styles.formStatus} role="status">{status}</p>}
        <button className={styles.primaryButton} disabled={disabled}>{busy ? "Salvando…" : originBusy ? "Cadastrando origem…" : reservation ? "Salvar reserva" : "Salvar feriado"}</button>
        {editId && <button type="button" className={styles.cancelButton} disabled={disabled} onClick={() => { reset(); setStatus(null); }}>Cancelar edição</button>}
      </form>
      <div className={agendaStyles.agendaLists}>
      <div className={styles.eventList}>
        <div className={styles.listHeading}><h3>{reservation ? "Reservas cadastradas" : "Feriados cadastrados"}</h3><span className={styles.counter}>{visibleItems.length}</span></div>
        {reservation && <p className={agendaStyles.historyHint}>Próximas reservas e estadias em andamento.</p>}
        {!visibleItems.length && <p className={styles.emptyState}>{loadError || (reservation ? "Nenhuma reserva próxima ou em andamento." : "Nenhum período cadastrado.")}</p>}
        {visibleItems.map(item => <article key={item.id} className={styles.eventItem + (reservation ? " " + agendaStyles.compactReservation : "")}>
          <div className={styles.eventItemTop}><span className={item.published ? styles.published : styles.draft}>{reservation ? "Reservado" : item.published ? "Publicado" : "Rascunho"}</span></div>
          <h3>{item.title}</h3><p>{formatPeriod(item.startDate, item.endDate)}{reservation ? " · entrada / saída" : ""}</p>
          {reservation && <ReservationDetails item={item} />}
          {item.description && <p style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{item.description}</p>}
          <div className={styles.itemActions}><button type="button" disabled={disabled} onClick={() => edit(item)}>Editar</button><button type="button" disabled={disabled} className={styles.deleteButton} onClick={() => void remove(item)}>Excluir</button></div>
        </article>)}
      </div>
      {reservation && <ReservationHistory items={reservations.history} disabled={disabled} loadError={loadError} onEdit={edit} onRemove={item => void remove(item)} />}
      </div>
    </div>
  </section>;
}

export default function AgendaManager({ initial, initialOrigins, initialToday, loadError }: { initial: AgendaRecord[]; initialOrigins: string[]; initialToday: string; loadError: string | null }) {
  const [today, setToday] = useState(initialToday);
  useEffect(() => {
    const refresh = () => setToday(houseToday());
    refresh();
    const timer = window.setInterval(refresh, 60_000);
    window.addEventListener("focus", refresh);
    return () => { window.clearInterval(timer); window.removeEventListener("focus", refresh); };
  }, []);
  return <div className={agendaStyles.editorSections}><Editor kind="reservation" initial={initial.filter(i => i.kind === "reservation")} initialOrigins={initialOrigins} today={today} loadError={loadError} /><Editor kind="holiday" initial={initial.filter(i => i.kind === "holiday")} today={today} loadError={loadError} /></div>;
}
