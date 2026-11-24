// Calendário tradicional de eventos com expansão da lista no celular.
"use client";

import { useState } from "react";
import styles from "./eventos.module.css";

// Mês e informações de um evento do calendário tradicional de Prado.
export type TraditionalEvent = {
  title: string;
  when: string;
  summary: string;
  months: number[];
};

// Quantidade inicial de eventos tradicionais exibida na versão móvel.
const MOBILE_BATCH_SIZE = 3;

// Exibe o calendário tradicional com expansão da lista em telas menores.
export default function TraditionalCalendar({
  events,
  currentMonth,
}: {
  events: TraditionalEvent[];
  currentMonth: number;
}) {
  // Estado e referências usados para acompanhar a interação e atualizar este componente.
  const [visibleCount, setVisibleCount] = useState(0);
  const allVisible = visibleCount >= events.length;
  const nextBatchSize = Math.min(MOBILE_BATCH_SIZE, events.length - visibleCount);

  // Alterna a exibição expandida do calendário tradicional.
  function toggleCalendar() {
    setVisibleCount((count) => count >= events.length ? 0 : Math.min(count + MOBILE_BATCH_SIZE, events.length));
  }

  // Renderiza a interface com os dados e as ações preparados acima.
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
