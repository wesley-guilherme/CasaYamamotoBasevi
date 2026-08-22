import MobileNavigation from "./mobile-navigation";

// Conteúdo repetido da página. Esses dados são percorridos com `map` para
// evitar repetir manualmente a mesma estrutura visual para cada item.
const amenities = [
  ["14", "hóspedes"],
  ["4", "suítes climatizadas"],
  ["1,40 m", "piscina privativa"],
  ["300 m", "da praia"],
];

const gallery = [
  ["Piscina e área externa", "Foto principal da piscina"],
  ["Suítes climatizadas", "Fotos por acomodação"],
  ["Área gourmet", "Churrasqueira e convivência"],
  ["Cozinha completa", "Estrutura para a família"],
];

const beaches = [
  [
    "Barra do Cahy",
    "Falésias, coqueiros e encontro do rio com o mar",
    "1h 20 de carro",
  ],
  [
    "Praia do Tororão",
    "Queda-d’água doce na faixa de areia",
    "25 min de carro",
  ],
  [
    "Cumuruxatiba",
    "Vila tranquila, píer e praias de águas calmas",
    "45 min de carro",
  ],
];

// Componente principal da rota `/`. No modelo App Router, o arquivo
// `app/page.tsx` corresponde automaticamente à página inicial do site.
export default function Home() {
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
            <div className="hero-actions">
              <a className="button button-primary" href="#contato">
                Consultar disponibilidade
              </a>
              <a className="button button-ghost" href="#casa">
                Conhecer a casa
              </a>
            </div>
            <p className="microcopy">
              Valores mediante consulta · Atendimento direto com o proprietário
            </p>
          </div>
          <div
            className="hero-visual"
            aria-label="Área reservada para fotografia principal da casa"
          >
            <span>Foto principal da casa</span>
            <small>Imagem panorâmica da piscina ou fachada</small>
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
            {gallery.map(([title, subtitle], index) => (
              <article
                className={`photo-card photo-${index + 1}`}
                key={title}
              >
                <div aria-hidden="true" className="photo-placeholder">
                  Foto
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
              <span key={item}>✓ {item}</span>
            ))}
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
            <div className="cards-three">
              {beaches.map(([title, text, distance]) => (
                <article className="destination-card" key={title}>
                  <div className="destination-image">Foto do destino</div>
                  <div className="card-body">
                    <span className="tag">Praia</span>
                    <h3>{title}</h3>
                    <p>{text}</p>
                    <strong>{distance}</strong>
                  </div>
                </article>
              ))}
            </div>
            <div className="center">
              <a className="text-link" href="#">
                Explorar o guia completo de Prado →
              </a>
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
            <article className="weather-card">
              <span className="card-kicker">Clima em Prado</span>
              <strong className="temperature">28°</strong>
              <p>Ensolarado · Sensação de 30°</p>
              <div className="weather-meta">
                <span>Chuva<br /><strong>15%</strong></span>
                <span>Vento<br /><strong>14 km/h</strong></span>
              </div>
              <small>Dados demonstrativos do protótipo</small>
            </article>

            <article className="tide-card">
              <span className="card-kicker">Marés de hoje</span>
              <div className="tide-row">
                <span>Maré baixa</span>
                <strong>08:42 · 0,4 m</strong>
              </div>
              <div className="tide-row">
                <span>Maré alta</span>
                <strong>14:58 · 1,7 m</strong>
              </div>
              <p>Dados demonstrativos · A estação e a fonte serão identificadas.</p>
            </article>

            <article className="event-card">
              <span className="tag light-tag">Evento previsto</span>
              <p className="event-month">OUT</p>
              <h3>Evento Gastronômico de Prado</h3>
              <p>Sabores e experiências locais. Data e programação em confirmação.</p>
              <a href="#">Ver detalhes →</a>
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
            <form className="contact-form">
              <label>
                Nome completo
                <input type="text" name="nome" autoComplete="name" />
              </label>
              <div className="form-row">
                <label>Data de entrada<input type="date" name="entrada" /></label>
                <label>Data de saída<input type="date" name="saida" /></label>
              </div>
              <label>
                Quantidade de hóspedes
                <input type="number" name="hospedes" min="1" max="14" />
              </label>
              <button className="button button-light" type="button">
                Continuar pelo WhatsApp
              </button>
              <small>
                Esta é uma solicitação. A reserva será confirmada pelo proprietário.
              </small>
            </form>
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
