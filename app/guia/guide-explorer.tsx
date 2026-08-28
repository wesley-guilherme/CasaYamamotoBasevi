"use client";

import { useMemo, useState } from "react";
import { guideAreas, guideDestinations, publicNavigationOrigin, type DurationFilter, type GuideArea } from "./guide-data";
import styles from "./guia.module.css";

type AreaFilter = GuideArea | "Todos";
type TimeFilter = DurationFilter | "todos";

const timeChoices: { value: TimeFilter; label: string }[] = [
  { value: "todos", label: "Qualquer duração" },
  { value: "rápido", label: "Até 4 horas" },
  { value: "meio-dia", label: "Meio período" },
  { value: "dia-inteiro", label: "Dia inteiro" },
];

function routeUrls(destination: string) {
  const origin = encodeURIComponent(publicNavigationOrigin);
  const target = encodeURIComponent(destination);
  return {
    google: `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${target}&travelmode=driving`,
    waze: `https://www.waze.com/ul?q=${target}&navigate=yes`,
    apple: `https://maps.apple.com/?saddr=${origin}&daddr=${target}&dirflg=d`,
    other: `geo:0,0?q=${target}`,
  };
}

export default function GuideExplorer() {
  const [area, setArea] = useState<AreaFilter>("Todos");
  const [time, setTime] = useState<TimeFilter>("todos");
  const [query, setQuery] = useState("");

  const destinations = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("pt-BR");
    return guideDestinations.filter((destination) => {
      const matchesArea = area === "Todos" || destination.area === area;
      const matchesTime = time === "todos" || destination.durationFilter === time;
      const searchable = [destination.title, destination.area, destination.category, destination.summary, ...destination.bestFor, ...destination.features]
        .join(" ").toLocaleLowerCase("pt-BR");
      return matchesArea && matchesTime && searchable.includes(normalizedQuery);
    });
  }, [area, query, time]);

  function applyQuickFilter(nextTime: TimeFilter, nextQuery = "") {
    setArea("Todos");
    setTime(nextTime);
    setQuery(nextQuery);
    document.querySelector("#lugares")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>Seu tempo em Prado, bem aproveitado</p>
            <h1>O que você quer fazer hoje?</h1>
            <p>Escolha pelo tempo, pelo seu ritmo ou por onde deseja ir. O guia mostra o essencial e abre o caminho no seu GPS.</p>
          </div>
          <div className={styles.heroPanel}>
            <label className={styles.searchBox}>
              <span aria-hidden="true">⌕</span>
              <span className={styles.srOnly}>Buscar no guia</span>
              <input type="search" value={query} placeholder="Praia, vila, baleias, crianças…" onChange={(event) => setQuery(event.target.value)} />
            </label>
            <p><strong>{guideDestinations.length} experiências</strong> entre Prado, seus povoados, Alcobaça e Caravelas.</p>
          </div>
        </div>

        <div className={styles.quickChoices} aria-label="Escolhas rápidas">
          <button type="button" onClick={() => applyQuickFilter("rápido")}><span aria-hidden="true">⌖</span><strong>Perto da Casa</strong><small>até 4 horas</small></button>
          <button type="button" onClick={() => applyQuickFilter("meio-dia")}><span aria-hidden="true">◒</span><strong>Meio período</strong><small>vá sem pressa</small></button>
          <button type="button" onClick={() => applyQuickFilter("dia-inteiro")}><span aria-hidden="true">☀</span><strong>Dia inteiro</strong><small>saia cedo</small></button>
          <button type="button" onClick={() => applyQuickFilter("todos", "crianças")}><span aria-hidden="true">☺</span><strong>Com crianças</strong><small>escolhas práticas</small></button>
        </div>
      </section>

      <section className={styles.explorer} id="lugares">
        <div className={styles.filterShell}>
          <div className={styles.areaScroller} aria-label="Filtrar por localidade">
            {["Todos" as const, ...guideAreas].map((item) => (
              <button className={area === item ? styles.activeChip : undefined} type="button" aria-pressed={area === item} onClick={() => setArea(item)} key={item}>{item}</button>
            ))}
          </div>
          <label className={styles.timeSelect}>
            <span>Duração</span>
            <select value={time} onChange={(event) => setTime(event.target.value as TimeFilter)}>
              {timeChoices.map((choice) => <option value={choice.value} key={choice.value}>{choice.label}</option>)}
            </select>
          </label>
        </div>

        <div className={styles.contentGrid}>
          <aside className={styles.desktopPlanner} id="planeje">
            <p className={styles.eyebrow}>Exclusivo para hóspedes</p>
            <h2>Seu passeio, do seu jeito.</h2>
            <p>Combine lugares, conte quem vai com você e receba um roteiro mais adequado ao ritmo do grupo.</p>
            <ul><li>Ordem inteligente de paradas</li><li>Cuidados de estrada e maré</li><li>Orientação do anfitrião</li></ul>
            <a href="/login?returnTo=%2Fguia%2Fmontar">Solicitar meu guia</a>
            <small>O login protege o conteúdo exclusivo da estadia.</small>
          </aside>

          <div className={styles.results}>
            <div className={styles.resultsHeading}>
              <div><p className={styles.eyebrow}>Explore no seu ritmo</p><h2>{area === "Todos" ? "Todos os lugares" : area}</h2></div>
              <span>{destinations.length} {destinations.length === 1 ? "resultado" : "resultados"}</span>
            </div>

            <div className={styles.cards}>
              {destinations.map((destination) => {
                const urls = routeUrls(destination.routeQuery);
                return (
                  <article className={styles.card} key={destination.id}>
                    <div className={`${styles.cardVisual} ${styles[destination.color]}`}><span>{destination.area}</span><strong>{destination.category}</strong></div>
                    <div className={styles.cardBody}>
                      <span className={styles.placeTag}>{destination.area}</span>
                      <h3>{destination.title}</h3>
                      <p>{destination.summary}</p>
                      <div className={styles.cardStats}>
                        <span><small>Da Casa</small><strong>{destination.distance}</strong></span>
                        <span><small>De carro</small><strong>{destination.driveTime}</strong></span>
                        <span><small>Reserve</small><strong>{destination.duration}</strong></span>
                      </div>
                      <div className={styles.accessLine}><span aria-hidden="true">↝</span><p><small>Como chegar</small>{destination.access}</p></div>
                      <div className={styles.featureList}>{destination.features.map((feature) => <span key={feature}>{feature}</span>)}</div>
                      {destination.tide ? <p className={styles.tideNote}><strong>Maré:</strong> {destination.tide}</p> : null}
                      {destination.alert ? <p className={styles.alertNote}><strong>Confira antes:</strong> {destination.alert}</p> : null}
                      <details className={styles.gpsMenu}>
                        <summary>Como chegar pelo GPS <span aria-hidden="true">↗</span></summary>
                        <div><a href={urls.google} target="_blank" rel="noreferrer">Google Maps</a><a href={urls.waze} target="_blank" rel="noreferrer">Waze</a><a href={urls.apple} target="_blank" rel="noreferrer">Apple Maps</a><a href={urls.other}>Outro GPS</a></div>
                      </details>
                    </div>
                  </article>
                );
              })}
            </div>

            {destinations.length === 0 ? (
              <div className={styles.emptyState}><strong>Nenhum lugar encontrado.</strong><p>Tente remover um filtro ou buscar por outra experiência.</p><button type="button" onClick={() => { setArea("Todos"); setTime("todos"); setQuery(""); }}>Limpar filtros</button></div>
            ) : null}
          </div>
        </div>
      </section>

      <section className={styles.guideNotes}>
        <div><p className={styles.eyebrow}>Antes de sair</p><h2>Informação boa é informação conferida.</h2></div>
        <div className={styles.noteCards}>
          <article><strong>Maré e mar</strong><p>Confira a previsão no dia. Passeios marítimos podem mudar ou ser cancelados.</p></article>
          <article><strong>Estradas</strong><p>Chuva altera acessos não pavimentados. Consulte o anfitrião antes de seguir.</p></article>
          <article><strong>Acesso responsável</strong><p>Barra do Cahy, Cumuruxatiba e Corumbau exigem confirmação atual de acesso e segurança.</p></article>
        </div>
        <p className={styles.originNote}>As rotas públicas partem da região do bairro Basevi para preservar o endereço da Casa. Hóspedes confirmados recebem a origem exata na área exclusiva.</p>
      </section>

      <aside className={styles.mobileAction}><span><small>Exclusivo para hóspedes</small><strong>Monte seu passeio</strong></span><a href="/login?returnTo=%2Fguia%2Fmontar">Começar</a></aside>
    </>
  );
}
