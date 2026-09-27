"use client";

import { useState } from "react";
import styles from "./eventos.module.css";

export type TraditionalEvent = {
  title: string;
  when: string;
  summary: string;
  months: number[];
};

const MOBILE_BATCH_SIZE = 3;

export default function TraditionalCalendar({
  events,
  currentMonth,
}: {
  events: TraditionalEvent[];
  currentMonth: number;
}) {
  const [visibleCount, setVisibleCount] = useState(0);
  const allVisible = visibleCount >= events.length;
  const nextBatchSize = Math.min(MOBILE_BATCH_SIZE, events.length - visibleCount);

  function toggleCalendar() {
    setVisibleCount((count) => count >= events.length ? 0 : Math.min(count + MOBILE_BATCH_SIZE, events.length));
  }

  return (
    <>
      <div className={styles.calendarGrid} id="traditional-events-list">
        {events.map((event, index) => (
          <article
            className={`${styles.traditionalCard} ${event.months.includes(currentMonth) ? styles.currentTraditional : ""} ${index >= visibleCount ? styles.mobileCalendarHidden : ""}`}
            key={event.title}
          >
            <strong>{event.when}</strong>
            <h3>{event.title}</h3>
            <p>{event.summary}</p>
          </article>
        ))}
      </div>
      <div className={styles.calendarControls}>
        <span aria-live="polite">{visibleCount} de {events.length} eventos exibidos</span>
        <button
          type="button"
          className={`${styles.calendarToggle} ${allVisible ? styles.calendarToggleOpen : ""}`}
          aria-controls="traditional-events-list"
          onClick={toggleCalendar}
        >
          {allVisible ? "Recolher calendário" : visibleCount === 0 ? `Ver ${nextBatchSize} eventos` : `Ver mais ${nextBatchSize} eventos`}
        </button>
      </div>
    </>
  );
}
