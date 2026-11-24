// Cartão de destaque do evento configurado para a página inicial.
import { eventMonths, type HomeEventCardData } from "./home-event-card-data";

// Renderiza o destaque de evento com o mês e o conteúdo configurados.
export default function HomeEventCard({ card }: { card: HomeEventCardData }) {
  // Renderiza a interface com os dados e as ações preparados acima.
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
