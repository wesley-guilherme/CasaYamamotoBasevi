"use client";

import { useEffect, useMemo, useState } from "react";
import type { EventRecord } from "../../db/events";
import styles from "./eventos.module.css";

export const DEMO_EVENTS_STORAGE_KEY = "casa-yamamoto-demo-events-v1";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

function dateAtNoon(date: string) {
  return new Date(`${date}T12:00:00-03:00`);
}

function dateRange(event: EventRecord) {
  const start = dateFormatter.format(dateAtNoon(event.startDate));
  return event.startDate === event.endDate
    ? start
    : `${start} a ${dateFormatter.format(dateAtNoon(event.endDate))}`;
}

function isDemoEvent(value: unknown): value is EventRecord {
  if (!value || typeof value !== "object") return false;
  const event = value as Partial<EventRecord>;
  return (
    typeof event.id === "number" &&
    event.id > 0 &&
    typeof event.title === "string" &&
    typeof event.startDate === "string" &&
    typeof event.endDate === "string" &&
    typeof event.location === "string" &&
    typeof event.description === "string" &&
    typeof event.published === "boolean"
  );
}

function todayInPrado() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "America/Bahia",
  }).formatToParts(new Date());
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";
  return `${value("year")}-${value("month")}-${value("day")}`;
}

export function ConfirmedEventCard({
  event,
  featured = false,
  preview = false,
}: {
  event: EventRecord;
  featured?: boolean;
  preview?: boolean;
}) {
  return (
    <article className={`${styles.confirmedCard} ${featured ? styles.confirmedFeatured : ""}`}>
      {event.posterKey ? (
        <a className={styles.posterLink} href={`/api/events/${event.id}/poster`} target="_blank" rel="noopener noreferrer" aria-label={`Abrir cartaz de ${event.title}`}>
          <img src={`/api/events/${event.id}/poster`} alt={`Cartaz de ${event.title}`} loading="lazy" />
        </a>
      ) : <div className={styles.dateMark} aria-hidden="true"><span>{dateAtNoon(event.startDate).getDate()}</span><small>{new Intl.DateTimeFormat("pt-BR", { month: "short" }).format(dateAtNoon(event.startDate)).replace(".", "")}</small></div>}
      <div className={styles.confirmedCopy}>
        {featured && <span className={styles.nowTag}>Destaque do mês</span>}
        {preview && <span className={styles.previewTag}>Prévia neste navegador</span>}
        <h3>{event.title}</h3>
        <p className={styles.eventMeta}>{dateRange(event)}{event.startTime ? ` · ${event.startTime}` : ""}</p>
        <p>{event.description || "Programação confirmada pelo anfitrião."}</p>
        <small>{event.location}</small>
        {event.detailsUrl && <a className={styles.detailsLink} href={event.detailsUrl} target="_blank" rel="noopener noreferrer">Mais detalhes →</a>}
      </div>
    </article>
  );
}

export function UpcomingEvents({ events, loadError }: { events: EventRecord[]; loadError: boolean }) {
  const [demoEvents, setDemoEvents] = useState<EventRecord[]>([]);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(DEMO_EVENTS_STORAGE_KEY);
      if (!stored) return;
      const parsed = JSON.parse(stored) as unknown;
      if (!Array.isArray(parsed)) return;
      const today = todayInPrado();
      setDemoEvents(parsed.filter(isDemoEvent).filter((event) => event.published && event.endDate >= today));
    } catch {
      setDemoEvents([]);
    }
  }, []);

  const confirmed = useMemo(() => [...events, ...demoEvents]
    .sort((a, b) => a.startDate.localeCompare(b.startDate) || (a.startTime ?? "").localeCompare(b.startTime ?? "")), [events, demoEvents]);

  if (loadError && !confirmed.length) {
    return <p className={styles.emptyState}>A agenda está temporariamente indisponível. Tente novamente em alguns instantes.</p>;
  }
  if (!confirmed.length) {
    return <p className={styles.emptyState}>Nenhum evento adicional foi confirmado por enquanto. O calendário tradicional continua disponível abaixo.</p>;
  }

  const serverIds = new Set(events.map((event) => event.id));
  return (
    <div className={styles.confirmedGrid}>
      {confirmed.map((event) => (
        <ConfirmedEventCard
          key={`${serverIds.has(event.id) ? "published" : "preview"}-${event.id}`}
          event={event}
          preview={!serverIds.has(event.id)}
        />
      ))}
    </div>
  );
}
