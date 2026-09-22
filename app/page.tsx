import MobileNavigation from "./mobile-navigation";
import HeroVideo from "./hero-video";
import SectionDepartureLink from "./section-departure-link";
import BookingForm from "./booking-form";
import { listPublishedEvents } from "../db/events";
import {
  formatPrecipitation,
  formatWeatherTime,
  getPradoWeather,
} from "./weather";

// Conteúdo repetido da página. Esses dados são percorridos com `map` para
// evitar repetir manualmente a mesma estrutura visual para cada item.
const amenities = [
  ["14", "hóspedes"],
  ["4", "suítes climatizadas"],
  ["1,40 m", "piscina privativa"],
  ["300 m", "da praia"],
];

const gallery = [
  ["Piscina e área externa", "Lazer privativo", "/images/casa/piscina/02-thumb.webp"],
  ["Suítes climatizadas", "Quatro acomodações", "/images/casa/suite-4/01-thumb.webp"],
  ["Área gourmet", "Churrasqueira e convivência", "/images/casa/area-gourmet/01-thumb.webp"],
  ["Sala de estar", "Conforto para a família", "/images/casa/sala-de-estar/02-thumb.webp"],
];

const beaches = [
  [
    "Arquipélago de Abrolhos",
    "Recifes, ilhas e vida marinha em um passeio com saída por Caravelas",
    "Reserva antecipada",
    "/images/guia/caravelas/arquipelago_de_abrolhos.webp",
  ],
  [
    "Centro Histórico do Prado",
    "Casario, praça, gastronomia e o melhor do fim de tarde em Prado",
    "6 min de carro",
    "/images/guia/prado/centro_historico_beco_das_garrafas_1.webp",
  ],
  [
    "Baleias-jubarte",
    "Passeio náutico sazonal para observar as visitantes mais famosas da costa",
    "Na temporada",
    "/images/guia/prado/baleia_jubarte.webp",
  ],
];

const monthFormatter = new Intl.DateTimeFormat("pt-BR", { month: "short" });
const eventDateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "long",
});

function dateAtNoon(date: string) {
  return new Date(`${date}T12:00:00-03:00`);
}

function eventMonth(date: string) {
  return monthFormatter.format(dateAtNoon(date)).replace(".", "").toUpperCase();
}

function eventDateRange(startDate: string, endDate: string) {
  const start = eventDateFormatter.format(dateAtNoon(startDate));
  if (startDate === endDate) return start;
  return `${start} a ${eventDateFormatter.format(dateAtNoon(endDate))}`;
}

// Componente principal da rota `/`. No modelo App Router, o arquivo
// `app/page.tsx` corresponde automaticamente à página inicial do site.
export default async function Home() {
  const [weather, publishedEvents] = await Promise.all([
    getPradoWeather(),
    listPublishedEvents().catch(() => []),
  ]);
  const featuredEvent = publishedEvents[0] ?? null;

  return (
    <main>
      {/* Atalho de acessibilidade: permite ir direto ao conteúdo com o teclado. */}
      <a className="skip-link" href="#conteudo">
        Pular para o conteúdo
      </a>

      {/* Cabeçalho fixo com a marca e links para as seções da mesma página. */}
      <header className="site-header">
        <div className="shell header-inner">
          <a
            className="brand-symbol"
            href="#inicio"
            aria-label="Casa Yamamoto Basevi — início"
          >
            <span className="brand-mark" aria-hidden="true">
              <img src="/logo-symbol.png" alt="" />
            </span>
          </a>
          <a className="brand-name" href="#inicio">
            <span className="brand-name-text">
              <span>Casa</span>{" "}
              <span>Yamamoto</span>{" "}
              <span>Basevi</span>
            </span>
            <span className="brand-rule" aria-hidden="true">
              <span />
            </span>
          </a>
          <MobileNavigation />
        </div>
      </header>

      {/* Hero: primeira apresentação da casa e principais chamadas para ação. */}
      <section className="hero" id="inicio">
        <div className="shell hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">Prado · Extremo Sul da Bahia</p>
            <h1>
              Sua casa de férias entre o conforto e a calmaria do mar.
            </h1>
            <p className="hero-text">
              Quatro suítes, piscina privativa e uma localização tranquila a
              poucos passos da praia. Um refúgio pensado para famílias e grupos
              que querem viver Prado com leveza.
            </p>
            <div className="hero-actions hero-actions-single">
              <a className="button button-primary" href="#contato">
                Consultar disponibilidade
              </a>
            </div>
            <p className="microcopy">
              Valores mediante consulta · Atendimento direto com o proprietário
            </p>
          </div>
          <div
            className="hero-visual"
          >
            <HeroVideo />
          </div>
        </div>
      </section>

      {/* Resumo numérico dos principais diferenciais da hospedagem. */}
      <section className="facts" aria-label="Destaques da hospedagem">
        <div className="shell facts-grid">
          {amenities.map(([value, label]) => (
            <div className="fact" key={label}>
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Conteúdo principal. O `id` é o destino do link “Pular para o conteúdo”. */}
      <div id="conteudo">
        {/* Apresentação dos ambientes e comodidades da casa. */}
        <section className="section shell" id="casa">
          <div className="section-heading split-heading">
            <div>
              <p className="eyebrow">A casa</p>
              <h2>Privacidade para descansar. Espaço para estar junto.</h2>
            </div>
            <p>
              Planejada para até 14 hóspedes, a Casa Yamamoto Basevi combina
              ambientes modernos, lazer privativo e o clima acolhedor de uma
              casa de família.
            </p>
          </div>

          {/* Galeria gerada a partir da constante `gallery`, no início do arquivo. */}
          <div className="gallery-grid">
            {gallery.map(([title, subtitle, image], index) => (
              <article
                className={`photo-card photo-${index + 1}`}
                key={title}
              >
                <div className="photo-placeholder">
                  <img src={image} alt={title} loading="lazy" />
                </div>
                <div>
                  <h3>{title}</h3>
                  <p>{subtitle}</p>
                </div>
              </article>
            ))}
          </div>

          {/* Lista estática de recursos oferecidos pela propriedade. */}
          <div className="feature-list">
            {[
              "Ar-condicionado nas suítes e sala de TV",
              "Wi-Fi e televisão",
              "Cozinha completa",
              "Área gourmet com churrasqueira",
              "Piscina e ducha externa",
              "Garagem para até 3 carros",
              "Roupa de cama incluída",
              "Aceita crianças e animais",
            ].map((item) => (
              <span
                className={item.length > 28 ? "feature-wide" : undefined}
                key={item}
              >
                ✓ {item}
              </span>
            ))}
          </div>

          <div className="center">
            <SectionDepartureLink className="text-link" href="/a-casa" returnHash="#casa">
              Conhecer todos os cômodos da casa →
            </SectionDepartureLink>
          </div>
        </section>

        {/* Guia resumido de destinos próximos à casa. */}
        <section className="section soft-section" id="experiencias">
          <div className="shell">
            <div className="section-heading">
              <p className="eyebrow">Guia Casa Yamamoto</p>
              <h2>Prado e a Costa das Baleias ao seu alcance</h2>
              <p>
                Praias, passeios e paisagens selecionadas para aproveitar melhor
                cada dia.
              </p>
            </div>
            <div
              className="cards-three"
              aria-label="Destinos em carrossel; deslize para ver mais"
            >
              {beaches.map(([title, text, distance, image], index) => (
                <article className="destination-card" key={title}>
                  <img className={`destination-image${index === 1 ? " destination-image-prado" : ""}`} src={image} alt={title} loading="lazy" />
                  <div className="card-body">
                    <span className="tag">{index === 1 ? "Cultura" : "Passeio"}</span>
                    <h3>{title}</h3>
                    <p>{text}</p>
                    <strong>{distance}</strong>
                  </div>
                </article>
              ))}
            </div>
            <div className="center">
              <SectionDepartureLink className="text-link" href="/guia" returnHash="#experiencias">
                Explorar o guia completo de Prado →
              </SectionDepartureLink>
            </div>
          </div>
        </section>

        {/* Painel demonstrativo de clima, marés e evento local. */}
        <section className="section shell" id="planeje">
          <div className="section-heading">
            <p className="eyebrow">Planeje seu dia</p>
            <h2>Clima, marés e programação local</h2>
          </div>
          <div className="planning-grid">
            <div
              className="planning-carousel"
              role="region"
              aria-roledescription="carrossel"
              aria-label="Clima e marés de hoje"
              tabIndex={0}
            >
            <article className="weather-card">
              <span className="card-kicker">Clima em Prado</span>
              <strong className="temperature">
                {weather ? `${weather.temperature}°` : "—°"}
              </strong>
              <p>
                {weather
                  ? `${weather.condition} · Umidade ${weather.humidity}%`
                  : "Dados temporariamente indisponíveis"}
              </p>
              <div className="weather-meta">
                <span>
                  Chuva — próximas 6h
                  <br />
                  <strong>
                    {weather
                      ? `${formatPrecipitation(weather.precipitationNext6Hours)} mm`
                      : "—"}
                  </strong>
                </span>
                <span>
                  Vento
                  <br />
                  <strong>{weather ? `${weather.windSpeed} km/h` : "—"}</strong>
                </span>
              </div>
              <small>
                {weather ? `Atualizado às ${formatWeatherTime(weather.observedAt)} · ` : ""}
                Dados: {" "}
                <a
                  href="https://api.met.no/weatherapi/locationforecast/2.0/documentation"
                  target="_blank"
                  rel="noreferrer"
                >
                  MET Norway
                </a>
              </small>
            </article>

            <article className="tide-card">
              <span className="card-kicker">Marés de hoje</span>
              <div className="tide-row">
                <span>Local</span>
                <strong>Prado — BA</strong>
              </div>
              <div className="tide-row">
                <span>Previsão</span>
                <strong>Hoje + 6 dias</strong>
              </div>
              <a
                className="button tide-button"
                href="https://tabuademares.com/br/bahia/prado/previsao/mares"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Consultar marés de Prado em uma nova aba"
              >
                Consultar horários e alturas
                <svg
                  className="tide-external-icon"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path d="M7 13 13 7M8 7h5v5" />
                </svg>
              </a>
              <small>Fonte externa especializada · Não utilizar para navegação.</small>
            </article>
            </div>

            <article className="event-card">
              <span className="tag light-tag">{featuredEvent ? "Próximo evento" : "Evento previsto"}</span>
              <p className="event-month">{featuredEvent ? eventMonth(featuredEvent.startDate) : "OUT"}</p>
              <h3>{featuredEvent?.title ?? "Evento Gastronômico de Prado"}</h3>
              {featuredEvent ? (
                <>
                  {featuredEvent.posterKey && (
                    <a className="event-poster-link" href={`/api/events/${featuredEvent.id}/poster`} target="_blank" rel="noopener noreferrer" aria-label={`Abrir cartaz de ${featuredEvent.title}`}>
                      <img className="event-poster" src={`/api/events/${featuredEvent.id}/poster`} alt={`Cartaz de ${featuredEvent.title}`} loading="lazy" />
                    </a>
                  )}
                  <p className="event-date">
                    {eventDateRange(featuredEvent.startDate, featuredEvent.endDate)}
                    {featuredEvent.startTime ? ` · ${featuredEvent.startTime}` : ""}
                  </p>
                  <p>{featuredEvent.description || "Programação confirmada pelo anfitrião."}</p>
                  <small className="event-location">{featuredEvent.location}</small>
                  {featuredEvent.detailsUrl && (
                    <a href={featuredEvent.detailsUrl} target="_blank" rel="noopener noreferrer">
                      Ver detalhes →
                    </a>
                  )}
                  <a className="event-card-agenda" href="/eventos">Ver agenda de eventos →</a>
                </>
              ) : (
                <>
                  <p>Sabores e experiências locais. Data e programação em confirmação.</p>
                  <span className="event-status">Aguardando confirmação do anfitrião</span>
                  <a className="event-card-agenda" href="/eventos">Conhecer o calendário de Prado →</a>
                </>
              )}
            </article>
          </div>
        </section>

        {/* Vitrine de parceiros e benefícios disponíveis aos hóspedes. */}
        <section className="section partner-section" id="parceiros">
          <div className="shell">
            <div className="section-heading split-heading">
              <div>
                <p className="eyebrow">Benefícios para hóspedes</p>
                <h2>Parceiros Casa Yamamoto</h2>
              </div>
              <p>
                Indicações selecionadas para comer, passear e aproveitar Prado
                com vantagens exclusivas.
              </p>
            </div>

            {/* Os botões são apenas visuais por enquanto; ainda não filtram dados. */}
            <div className="filter-row" aria-label="Categorias de parceiros">
              <button className="active" type="button">Todos</button>
              <button type="button">Restaurantes</button>
              <button type="button">Bares</button>
              <button type="button">Barracas de praia</button>
              <button type="button">Passeios</button>
            </div>

            <article className="featured-partner">
              <div className="partner-image">Foto do ambiente</div>
              <div className="partner-content">
                <div>
                  <span className="tag">Restaurante</span>
                  <span className="discount">10% OFF</span>
                </div>
                <h3>Restaurante Banana da Terra</h3>
                <p>
                  Pratos para happy hour, ótimos coquetéis e opções vegetarianas
                  no coração do Beco das Garrafas.
                </p>
                <dl>
                  <div><dt>Endereço</dt><dd>Rua Rui Barbosa, 171 · Centro, Prado–BA</dd></div>
                  <div><dt>Benefício</dt><dd>10% de desconto para hóspedes da Casa Yamamoto Basevi</dd></div>
                  <div><dt>Funcionamento</dt><dd>Horários em confirmação</dd></div>
                </dl>
                <a className="button button-primary" href="#">
                  Ver parceiro e benefício
                </a>
              </div>
            </article>
          </div>
        </section>

        {/* Orientação de chegada; o vídeo e o mapa ainda são placeholders. */}
        <section className="section shell video-section" id="como-chegar">
          <div className="video-placeholder">
            <span className="play" aria-hidden="true">▶</span>
            <strong>Vídeo: como chegar</strong>
            <small>Será publicado futuramente</small>
          </div>
          <div>
            <p className="eyebrow">Como chegar</p>
            <h2>Tranquilidade desde o primeiro caminho</h2>
            <p>
              A casa fica no bairro Basevi, a aproximadamente 300 metros do mar
              e a poucos minutos do centro.
            </p>
            <p>
              Por privacidade, o endereço completo será compartilhado após a
              confirmação.
            </p>
            <a className="text-link" href="#">Ver localização aproximada →</a>
          </div>
        </section>

        {/* Formulário de consulta. Ainda não possui envio nem integração com WhatsApp. */}
        <section className="contact-section" id="contato">
          <div className="shell contact-grid">
            <div>
              <p className="eyebrow eyebrow-light">Sua próxima viagem começa aqui</p>
              <h2>Consulte as datas da Casa Yamamoto Basevi</h2>
              <p>
                Informe as datas e os hóspedes. O proprietário responderá com
                disponibilidade e valores.
              </p>
            </div>
            <BookingForm events={publishedEvents.map((event) => ({
              id: event.id,
              title: event.title,
              startDate: event.startDate,
              endDate: event.endDate,
              location: event.location,
            }))} />
          </div>
        </section>
      </div>

      {/* Rodapé com resumo da marca, navegação secundária e contato. */}
      <footer>
        <div className="shell footer-grid">
          <div>
            <img src="/logo-yamamoto.png" alt="Casa Yamamoto Basevi" />
            <p>Seu refúgio em Prado.</p>
          </div>
          <div>
            <strong>Navegação</strong>
            <a href="#casa">A casa</a>
            <a href="#experiencias">Conheça Prado</a>
            <a href="#parceiros">Parceiros</a>
            <a href="/admin/eventos?demo=1">Área do anfitrião</a>
          </div>
          <div>
            <strong>Contato</strong>
            <a href="mailto:casayamamotobasevi@gmail.com">
              casayamamotobasevi@gmail.com
            </a>
            <a href="#contato">Consultar datas</a>
          </div>
        </div>
        <div className="shell footer-bottom">
          <span>© 2026 Casa Yamamoto Basevi</span>
          <span>Privacidade · Acessibilidade · Termos</span>
        </div>
      </footer>
    </main>
  );
}
