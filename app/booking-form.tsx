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
  const [guests, setGuests] = useState("");

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
    <form className="contact-form" onSubmit={(event) => event.preventDefault()}>
      <HouseCalendar reservations={reservations} loadError={!agendaAvailable} today={today} arrival={arrival} departure={departure} onSelect={selectDate} />
      {arrival && (
        <div className="stay-events stay-dates" aria-live="polite">
          <span><strong>Entrada</strong>{arrival.split("-").reverse().join("/")}</span>
          <span><strong>Saída</strong>{departure ? departure.split("-").reverse().join("/") : "—"}</span>
        </div>
      )}

      {arrival && departure && departure <= arrival && <p role="alert">A data de saída deve ser depois da entrada.</p>}
      {datesReady && (!agendaAvailable || blocked) && (
        <div className="stay-events" role="alert">
          {!agendaAvailable ? "A agenda está indisponível. Confirme suas datas com o anfitrião." : "Estas datas incluem noites já reservadas. Escolha outro período no calendário."}
        </div>
      )}
      {datesReady && matchingEvents.length > 0 && (
        <div className="stay-events has-events" aria-live="polite">
          <strong>{matchingEvents.length === 1 ? "Há um evento no seu período" : "Há eventos no seu período"}</strong>
          {matchingEvents.map((event) => (
            <span key={event.id}>
              <b>{event.title}</b>
              <small>{formatEventDates(event)} · {event.location}</small>
            </span>
          ))}
        </div>
      )}

      <label>
        Quantidade de hóspedes (máximo 14)
        <input
          type="number"
          name="hospedes"
          inputMode="numeric"
          min="1"
          max="14"
          step="1"
          value={guests}
          onChange={(event) => {
            const value = event.currentTarget.value;
            if (value === "") { setGuests(""); return; }
            const count = Number(value);
            if (Number.isFinite(count)) {
              setGuests(String(Math.min(14, Math.max(1, Math.trunc(count)))));
            }
          }}
        />
      </label>
      <button className="button button-light" type="button" disabled={blocked || !datesReady}>
        Continuar pelo WhatsApp
      </button>
    </form>
  );
}
