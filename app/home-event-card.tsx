import { eventMonths, type HomeEventCardData } from "./home-event-card-data";

export default function HomeEventCard({ card }: { card: HomeEventCardData }) {
  return (
    <article className="event-card">
      <span className="tag light-tag">Evento previsto</span>
      <p className="event-month">{eventMonths[card.month - 1].slice(0, 3).toUpperCase()}</p>
      <h3>{card.title}</h3>
      <p>{card.description}</p>
      <span className="event-status">{card.status}</span>
      <a className="event-card-agenda" href="/eventos">Conhecer o calendário de Prado →</a>
    </article>
  );
}
