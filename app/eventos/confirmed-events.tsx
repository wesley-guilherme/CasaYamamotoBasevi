// Cartões e listagem dos eventos confirmados apresentados aos visitantes.
"use client";

import type { EventRecord } from "../../db/events";
import styles from "./eventos.module.css";

// Chave de compatibilidade dos eventos demonstrativos armazenados no navegador.
export const DEMO_EVENTS_STORAGE_KEY = "casa-yamamoto-demo-events-v1";

// Formatador reutilizável de datas no padrão brasileiro.
const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

// Interpreta a data ao meio-dia no fuso -03:00 para evitar mudanças de dia na formatação.
function dateAtNoon(date: string) {
  return new Date(`${date}T12:00:00-03:00`);
}

// Formata o dia ou intervalo de datas exibido no cartão do evento.
function dateRange(event: EventRecord) {
  const start = dateFormatter.format(dateAtNoon(event.startDate));
  return event.startDate === event.endDate
    ? start
    : `${start} a ${dateFormatter.format(dateAtNoon(event.endDate))}`;
}

// Apresenta os dados e o cartaz de um evento confirmado.
export function ConfirmedEventCard({
  event,
  featured = false,
}: {
  event: EventRecord;
  featured?: boolean;
}) {
  const posterUrl = event.posterKey ? `/api/events/${event.id}/poster` : null;

  // Renderiza a interface com os dados e as ações preparados acima.
  return (
    <article className={`${styles.confirmedCard} ${featured ? styles.confirmedFeatured : ""} ${posterUrl ? styles.confirmedCardWithPoster : ""}`}>
      {posterUrl ? (
        <div className={styles.posterMedia}>
          <img src={posterUrl} alt={`Folder de divulgação de ${event.title}`} loading="lazy" />
        </div>
      ) : <div className={styles.dateMark} aria-hidden="true"><span>{dateAtNoon(event.startDate).getDate()}</span><small>{new Intl.DateTimeFormat("pt-BR", { month: "short" }).format(dateAtNoon(event.startDate)).replace(".", "")}</small></div>}
      <div className={styles.confirmedCopy}>
        {featured && <span className={styles.nowTag}>Destaque do mês</span>}
        <h3>{event.title}</h3>
        <p className={styles.eventMeta}>{dateRange(event)}{event.startTime ? ` · ${event.startTime}` : ""}</p>
        <p>{event.description || "Programação confirmada pelo anfitrião."}</p>
        <small>{event.location}</small>
        {posterUrl && <span className={styles.folderHint}>Ver folder de divulgação</span>}
        {event.detailsUrl && <a className={styles.detailsLink} href={event.detailsUrl} target="_blank" rel="noopener noreferrer">Mais detalhes →</a>}
      </div>
      {posterUrl && (
        <a
          className={styles.posterCardLink}
          href={posterUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Abrir folder de divulgação de ${event.title}`}
        />
      )}
    </article>
  );
}

// Organiza os próximos eventos e o estado sem eventos disponíveis.
export function UpcomingEvents({ events, loadError }: { events: EventRecord[]; loadError: boolean }) {
  const confirmed = [...events]
    .sort((a, b) => a.startDate.localeCompare(b.startDate) || (a.startTime ?? "").localeCompare(b.startTime ?? ""));

  if (loadError && !confirmed.length) {
    // Renderiza a interface com os dados e as ações preparados acima.
    return <p className={styles.emptyState}>A agenda está temporariamente indisponível. Tente novamente em alguns instantes.</p>;
  }
  if (!confirmed.length) {
    // Renderiza a interface com os dados e as ações preparados acima.
    return <p className={styles.emptyState}>Nenhum evento adicional foi confirmado por enquanto. O calendário tradicional continua disponível abaixo.</p>;
  }

  // Renderiza a interface com os dados e as ações preparados acima.
  return (
    <div className={styles.confirmedGrid}>
      {confirmed.map((event) => (
        <ConfirmedEventCard
          key={event.id}
          event={event}
        />
      ))}
    </div>
  );
}
