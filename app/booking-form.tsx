"use client";

import { useEffect, useMemo, useState } from "react";
import { overlapsStay, validDate, type ReservedPeriod } from "./agenda/agenda-data";
import HouseCalendar from "./agenda/house-calendar";

type StayEvent = {
  id: number;
  title: string;
  startDate: string;
  endDate: string;
  location: string;
};

function formatEventDates(event: StayEvent) {
  const formatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long" });
  const start = formatter.format(new Date(`${event.startDate}T12:00:00-03:00`));
  if (event.endDate === event.startDate) return start;
  const end = formatter.format(new Date(`${event.endDate}T12:00:00-03:00`));
  return `${start} a ${end}`;
}

export default function BookingForm({ events, reservations, agendaAvailable, today }: { events: StayEvent[]; reservations: ReservedPeriod[]; agendaAvailable: boolean; today: string }) {
  const [arrival, setArrival] = useState("");
  const [departure, setDeparture] = useState("");

  useEffect(() => { const params = new URLSearchParams(window.location.search); const start = params.get("entrada"); const end = params.get("saida"); if (validDate(start) && validDate(end) && end > start) { setArrival(start); setDeparture(end); } }, []);
  function selectDate(date: string) {
    if (arrival && !departure && date > arrival) { setDeparture(date); }
    else { setArrival(date); setDeparture(""); }
  }
  const blocked = Boolean(arrival && departure && reservations.some(period => overlapsStay(arrival, departure, period)));

  const matchingEvents = useMemo(() => {
    if (!arrival || !departure || departure < arrival) return [];
    return events.filter((event) => event.startDate <= departure && event.endDate >= arrival);
  }, [arrival, departure, events]);

  const datesReady = Boolean(arrival && departure && departure > arrival);

  return (
    <form className="contact-form">
      <label>
        Nome completo
        <input type="text" name="nome" autoComplete="name" />
      </label>
      <HouseCalendar reservations={reservations} loadError={!agendaAvailable} today={today} arrival={arrival} departure={departure} onSelect={selectDate} />
      <div className="form-row">
        <label>
          Data de entrada
          <input
            type="date"
            name="entrada"
            min={today}
            value={arrival}
            onChange={(event) => { setArrival(event.target.value); setDeparture(""); }}
          />
        </label>
        <label>
          Data de saída
          <input
            type="date"
            name="saida"
            min={arrival || today}
            value={departure}
            onChange={(event) => setDeparture(event.target.value)}
          />
        </label>
      </div>

      {arrival && departure && departure <= arrival && <p role="alert">A data de saída deve ser depois da entrada.</p>}
      {datesReady && <div className="stay-events" role="status">{!agendaAvailable ? "A agenda está indisponível. Confirme suas datas com o anfitrião." : blocked ? "Estas datas incluem noites já reservadas. Escolha outro período no calendário." : "Não há reserva registrada para essas noites. Consulte o anfitrião para confirmar."}</div>}
      {datesReady && (
        <div className={matchingEvents.length > 0 ? "stay-events has-events" : "stay-events"} aria-live="polite">
          {matchingEvents.length > 0 ? (
            <>
              <strong>{matchingEvents.length === 1 ? "Há um evento no seu período" : "Há eventos no seu período"}</strong>
              {matchingEvents.map((event) => (
                <span key={event.id}>
                  <b>{event.title}</b>
                  <small>{formatEventDates(event)} · {event.location}</small>
                </span>
              ))}
            </>
          ) : (
            <span>Nenhum evento publicado coincide com estas datas.</span>
          )}
        </div>
      )}

      <label>
        Quantidade de hóspedes
        <input type="number" name="hospedes" min="1" max="14" />
      </label>
      <button className="button button-light" type="button" disabled={blocked || !datesReady}>
        Continuar pelo WhatsApp
      </button>
      <small>
        Esta é uma solicitação. A reserva será confirmada pelo proprietário.
      </small>
    </form>
  );
}
