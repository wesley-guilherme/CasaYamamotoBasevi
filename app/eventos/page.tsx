import type { Metadata } from "next";
import NativeBackToSection from "../native-back-to-section";
import { listPublishedEvents, type EventRecord } from "../../db/events";
import styles from "./eventos.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Eventos em Prado | Casa Yamamoto Basevi",
  description: "Consulte os próximos eventos confirmados e o calendário tradicional de Prado e Cumuruxatiba.",
};

type TraditionalEvent = {
  title: string;
  when: string;
  summary: string;
  months: number[];
};

const traditionalEvents: TraditionalEvent[] = [
  { title: "São Sebastião — padroeiro de Cumuruxatiba", when: "20 de janeiro", summary: "Celebração tradicional de Cumuruxatiba.", months: [1] },
  { title: "Nossa Senhora da Purificação — padroeira de Prado", when: "2 de fevereiro", summary: "Festa religiosa dedicada à padroeira do município.", months: [2] },
  { title: "Carnaval de Prado", when: "Fevereiro ou março", summary: "A data varia a cada ano conforme o calendário do Carnaval.", months: [2, 3] },
  { title: "Prado Moto Rock", when: "Março", summary: "Encontro de motociclistas e programação musical na cidade.", months: [3] },
  { title: "Festa de São Benedito", when: "Abril, após a Semana Santa", summary: "Celebração realizada depois da Semana Santa.", months: [4] },
  { title: "São João de Prado", when: "Entre junho e julho", summary: "Festejos juninos com programação distribuída entre os dois meses.", months: [6, 7] },
  { title: "Visita às baleias-jubarte", when: "Julho a novembro", summary: "Temporada anual de observação; o auge da movimentação ocorre entre agosto e setembro.", months: [7, 8, 9, 10, 11] },
  { title: "Festival Gastronômico e Cultural de Prado", when: "Todo o mês de outubro", summary: "Gastronomia, cultura e experiências locais durante o mês.", months: [10] },
  { title: "Réveillon de Prado", when: "31 de dezembro ao início de janeiro", summary: "Conforme o dia da semana, a programação pode seguir até o primeiro fim de semana de janeiro.", months: [12, 1] },
];

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

function dateAtNoon(date: string) {
  return new Date(`${date}T12:00:00-03:00`);
}

function dateRange(event: EventRecord) {
  const start = dateFormatter.format(dateAtNoon(event.startDate));
  return event.startDate === event.endDate ? start : `${start} a ${dateFormatter.format(dateAtNoon(event.endDate))}`;
}

function currentPradoMonth() {
  return Number(new Intl.DateTimeFormat("en", { month: "numeric", timeZone: "America/Bahia" }).format(new Date()));
}

function currentPradoMonthKey() {
  const parts = new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit", timeZone: "America/Bahia" }).formatToParts(new Date());
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  return `${year}-${month}`;
}

function isEventInMonth(event: EventRecord, monthKey: string) {
  return event.startDate.slice(0, 7) <= monthKey && event.endDate.slice(0, 7) >= monthKey;
}

function ConfirmedEventCard({ event, featured = false }: { event: EventRecord; featured?: boolean }) {
  return (
    <article className={`${styles.confirmedCard} ${featured ? styles.confirmedFeatured : ""}`}>
      {event.posterKey ? (
        <a className={styles.posterLink} href={`/api/events/${event.id}/poster`} target="_blank" rel="noopener noreferrer" aria-label={`Abrir cartaz de ${event.title}`}>
          <img src={`/api/events/${event.id}/poster`} alt={`Cartaz de ${event.title}`} loading="lazy" />
        </a>
      ) : <div className={styles.dateMark} aria-hidden="true"><span>{dateAtNoon(event.startDate).getDate()}</span><small>{new Intl.DateTimeFormat("pt-BR", { month: "short" }).format(dateAtNoon(event.startDate)).replace(".", "")}</small></div>}
      <div className={styles.confirmedCopy}>
        {featured && <span className={styles.nowTag}>Destaque do mês</span>}
        <h3>{event.title}</h3>
        <p className={styles.eventMeta}>{dateRange(event)}{event.startTime ? ` · ${event.startTime}` : ""}</p>
        <p>{event.description || "Programação confirmada pelo anfitrião."}</p>
        <small>{event.location}</small>
        {event.detailsUrl && <a className={styles.detailsLink} href={event.detailsUrl} target="_blank" rel="noopener noreferrer">Mais detalhes →</a>}
      </div>
    </article>
  );
}

export default async function EventsPage() {
  let events: EventRecord[] = [];
  let loadError = false;
  try {
    events = await listPublishedEvents();
  } catch {
    loadError = true;
  }

  const month = currentPradoMonth();
  const monthKey = currentPradoMonthKey();
  const monthName = new Intl.DateTimeFormat("pt-BR", { month: "long", timeZone: "America/Bahia" }).format(new Date());
  const monthEvents = events.filter((event) => isEventInMonth(event, monthKey));
  const monthTraditions = traditionalEvents.filter((event) => event.months.includes(month));

  return (
    <main className={styles.eventsPage}>
      <NativeBackToSection returnHash="#planeje" />
      <a className="skip-link" href="#agenda">Pular para a agenda</a>
      <header className="site-header album-header">
        <div className="shell header-inner">
          <a className="brand-symbol" href="/#planeje" aria-label="Casa Yamamoto Basevi — início">
            <span className="brand-mark" aria-hidden="true"><img src="/logo-symbol.png" alt="" /></span>
          </a>
          <a className="brand-name" href="/eventos" aria-label="Eventos em Prado">
            <span className={`brand-name-text ${styles.headerTitle}`}><span>Eventos em Prado</span></span>
            <span className="brand-rule" aria-hidden="true"><span /></span>
          </a>
        </div>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <a className="album-breadcrumb" href="/#planeje">Início</a>
          <span className={styles.eyebrow}>Agenda local</span>
          <h1>Prado tem histórias para viver o ano inteiro.</h1>
          <p>Veja o que acontece durante a sua estadia e conheça as celebrações que fazem parte do calendário da cidade.</p>
        </div>
        <figure className={styles.heroImage}>
          <img src="/images/guia/prado/baleia_jubarte.webp" alt="Baleia-jubarte na costa de Prado" />
          <figcaption>Temporada das baleias-jubarte · julho a novembro</figcaption>
        </figure>
      </section>

      <section className={styles.monthSection} aria-labelledby="month-title">
        <div className={styles.sectionIntro}>
          <span className={styles.eyebrow}>Agora em Prado</span>
          <h2 id="month-title">Destaques de {monthName}</h2>
        </div>
        {(monthEvents.length || monthTraditions.length) ? (
          <div className={styles.monthGrid}>
            {monthEvents.map((event) => <ConfirmedEventCard key={event.id} event={event} featured />)}
            {monthTraditions.map((event) => (
              <article className={styles.traditionalFeatured} key={event.title}>
                <span className={styles.nowTag}>Calendário tradicional</span>
                <h3>{event.title}</h3><strong>{event.when}</strong><p>{event.summary}</p>
              </article>
            ))}
          </div>
        ) : <p className={styles.monthEmpty}>Ainda não há evento confirmado para este mês. Consulte abaixo a próxima programação e o calendário tradicional.</p>}
      </section>

      <section className={styles.agendaSection} id="agenda" aria-labelledby="agenda-title">
        <div className={styles.sectionIntro}>
          <span className={styles.eyebrow}>Programação confirmada</span>
          <h2 id="agenda-title">Próximos eventos</h2>
          <p>Esta agenda é atualizada pelo anfitrião da Casa Yamamoto Basevi.</p>
        </div>
        {loadError ? <p className={styles.emptyState}>A agenda está temporariamente indisponível. Tente novamente em alguns instantes.</p>
          : events.length ? <div className={styles.confirmedGrid}>{events.map((event) => <ConfirmedEventCard key={event.id} event={event} />)}</div>
          : <p className={styles.emptyState}>Nenhum evento adicional foi confirmado por enquanto. O calendário tradicional continua disponível abaixo.</p>}
      </section>

      <section className={styles.calendarSection} aria-labelledby="calendar-title">
        <div className={styles.sectionIntro}>
          <span className={styles.eyebrow}>Referência anual</span>
          <h2 id="calendar-title">Calendário tradicional de Prado</h2>
          <p>Datas recorrentes para ajudar no planejamento. Eventos com calendário variável devem ser confirmados antes da viagem.</p>
        </div>
        <div className={styles.calendarGrid}>
          {traditionalEvents.map((event) => (
            <article className={`${styles.traditionalCard} ${event.months.includes(month) ? styles.currentTraditional : ""}`} key={event.title}>
              <strong>{event.when}</strong><h3>{event.title}</h3><p>{event.summary}</p>
            </article>
          ))}
        </div>
      </section>

      <footer className={styles.footer}>
        <img src="/logo-yamamoto.png" alt="Casa Yamamoto Basevi" />
        <a href="/#reservas">Consultar disponibilidade</a>
      </footer>
    </main>
  );
}
