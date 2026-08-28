"use client";

import { useMemo, useState } from "react";
import { casaAddress, casaPlusCode, guideAreas, guideDestinations, type DurationFilter, type GuideArea } from "./guide-data";
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
  const target = encodeURIComponent(destination);
  return {
    google: `https://www.google.com/maps/dir/?api=1&destination=${target}&travelmode=driving`,
    waze: `https://www.waze.com/ul?q=${target}&navigate=yes`,
    apple: `https://maps.apple.com/?daddr=${target}&dirflg=d`,
    other: `geo:0,0?q=${target}`,
  };
}

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR");
}

const ignoredWords = new Set(["com", "para", "uma", "que", "onde", "quero", "lugar", "lugares"]);
const searchSynonyms: Record<string, string[]> = {
  baleia: ["abrolhos", "barco", "mar", "natureza"],
  baleias: ["abrolhos", "barco", "mar", "natureza"],
  crianca: ["familia", "estrutura", "educativo", "praticidade"],
  criancas: ["familia", "estrutura", "educativo", "praticidade"],
  comer: ["gastronomia", "restaurantes", "alimentacao"],
  almocar: ["gastronomia", "restaurantes", "alimentacao"],
  tranquilo: ["sossego", "descanso", "praia tranquila"],
  tranquila: ["sossego", "descanso", "praia tranquila"],
  perto: ["prado", "rapido", "centro"],
  historia: ["historico", "cultura", "casario", "igrejas"],
  aventura: ["trilha", "mergulho", "barco", "natureza"],
  nadar: ["banho de mar", "praia", "piscinas"],
};

function destinationScore(destination: (typeof guideDestinations)[number], query: string) {
  const normalizedQuery = normalize(query).trim();
  if (!normalizedQuery) return 1;
  const baseTokens = normalizedQuery.split(/\s+/).filter((token) => token.length > 2 && !ignoredWords.has(token));
  const tokens = [...new Set(baseTokens.flatMap((token) => [token, ...(searchSynonyms[token] ?? [])]))];
  const searchable = normalize([
    destination.title,
    destination.area,
    destination.category,
    destination.summary,
    destination.durationFilter,
    ...destination.bestFor,
    ...destination.features,
  ].join(" "));
  return tokens.reduce((score, token) => score + (searchable.includes(token) ? 1 : 0), 0);
}

export default function GuideExplorer() {
  const [area, setArea] = useState<AreaFilter>("Todos");
  const [time, setTime] = useState<TimeFilter>("todos");
  const [query, setQuery] = useState("");

  const destinations = useMemo(() => {
    return guideDestinations.map((destination) => ({ destination, score: destinationScore(destination, query) })).filter(({ destination, score }) => {
      const matchesArea = area === "Todos" || destination.area === area;
      const matchesTime = time === "todos" || destination.durationFilter === time;
      return matchesArea && matchesTime && score > 0;
    }).sort((a, b) => b.score - a.score || a.destination.distanceKm - b.destination.distanceKm).map(({ destination }) => destination);
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
              <input type="search" value={query} placeholder="Ex.: praia tranquila com crianças" onChange={(event) => setQuery(event.target.value)} />
            </label>
            <p><strong>Busca inteligente:</strong> descreva o que deseja e o guia interpreta interesses como praia, crianças, gastronomia, história e baleias.</p>
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
            <p>Conte quem vai com você e o guia automatizado prepara o roteiro, priorizando seus interesses e reduzindo deslocamentos.</p>
            <ul><li>Roteiro gerado na hora</li><li>Ordem inteligente de paradas</li><li>Cuidados de estrada e maré</li></ul>
            <a href="/login?returnTo=%2Fguia%2Fmontar">Gerar meu roteiro</a>
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
                        <div><p className={styles.gpsNote}>O aplicativo usará sua localização atual como ponto de partida.</p><a href={urls.google} target="_blank" rel="noreferrer">Google Maps</a><a href={urls.waze} target="_blank" rel="noreferrer">Waze</a><a href={urls.apple} target="_blank" rel="noreferrer">Apple Maps</a><a href={urls.other}>Outro GPS</a></div>
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
        <p className={styles.originNote}><strong>Referência das distâncias:</strong> {casaAddress} · Plus Code {casaPlusCode}. São estimativas rodoviárias a partir da Casa; ao abrir um GPS, a navegação parte da localização atual do aparelho e mostra a condição real daquele momento.</p>
      </section>

      <aside className={styles.mobileAction}><span><small>Exclusivo para hóspedes</small><strong>Gere seu roteiro</strong></span><a href="/login?returnTo=%2Fguia%2Fmontar">Começar</a></aside>
    </>
  );
}
