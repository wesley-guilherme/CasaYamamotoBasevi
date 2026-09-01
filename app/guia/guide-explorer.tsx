"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { casaAddress, casaPlusCode, guideAreas, guideDestinations, type GuideArea } from "./guide-data";
import styles from "./guia.module.css";

type AreaFilter = GuideArea | "Todos";

function routeUrls(destination: string) {
  const target = encodeURIComponent(destination);
  const google = `https://www.google.com/maps/dir/?api=1&destination=${target}&travelmode=driving`;
  return {
    google,
    apple: `https://maps.apple.com/?daddr=${target}&dirflg=d`,
    waze: `https://www.waze.com/ul?q=${target}&navigate=yes`,
    android: `geo:0,0?q=${target}`,
  };
}

function devicePlatform() {
  const agent = navigator.userAgent;
  if (/Android/i.test(agent)) return "android" as const;
  if (/iPhone|iPad|iPod/i.test(agent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)) return "ios" as const;
  const isMobileDevice = /Mobile/i.test(agent)
    || (navigator.maxTouchPoints > 1 && window.matchMedia("(pointer: coarse)").matches);
  return isMobileDevice ? "mobile" as const : "desktop" as const;
}

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR");
}

function destinationScore(destination: (typeof guideDestinations)[number], query: string) {
  const normalizedQuery = normalize(query).trim();
  if (!normalizedQuery) return 1;
  const title = normalize(destination.title);
  const area = normalize(destination.area);
  const category = normalize(destination.category);
  if (title.startsWith(normalizedQuery)) return 4;
  if (title.includes(normalizedQuery)) return 3;
  if (area.includes(normalizedQuery)) return 2;
  if (category.includes(normalizedQuery)) return 1;
  return 0;
}

export default function GuideExplorer() {
  const [area, setArea] = useState<AreaFilter>("Todos");
  const [query, setQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [routePicker, setRoutePicker] = useState<string | null>(null);
  const [showDesktopAction, setShowDesktopAction] = useState(false);
  const desktopPlannerRef = useRef<HTMLElement>(null);

  const destinations = useMemo(() => {
    return guideDestinations.map((destination) => ({ destination, score: destinationScore(destination, query) })).filter(({ destination, score }) => {
      const matchesArea = area === "Todos" || destination.area === area;
      return matchesArea && score > 0;
    }).sort((a, b) => b.score - a.score || a.destination.distanceKm - b.destination.distanceKm).map(({ destination }) => destination);
  }, [area, query]);

  const suggestions = useMemo(() => {
    if (normalize(query).trim().length < 2) return [];
    return guideDestinations
      .map((destination) => ({ destination, score: destinationScore(destination, query) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score || a.destination.distanceKm - b.destination.distanceKm)
      .slice(0, 5)
      .map(({ destination }) => destination);
  }, [query]);

  useEffect(() => {
    const planner = desktopPlannerRef.current;
    if (!planner) return;
    const desktop = window.matchMedia("(min-width: 760px)");
    let hasBeenVisible = false;
    const observer = new IntersectionObserver(([entry]) => {
      if (!desktop.matches) {
        setShowDesktopAction(false);
        return;
      }
      if (entry.isIntersecting) {
        hasBeenVisible = true;
        setShowDesktopAction(false);
        return;
      }
      setShowDesktopAction(hasBeenVisible && entry.boundingClientRect.bottom <= 0);
    }, { threshold: 0.08 });
    observer.observe(planner);
    const handleViewportChange = () => {
      if (!desktop.matches) setShowDesktopAction(false);
    };
    desktop.addEventListener("change", handleViewportChange);
    return () => {
      observer.disconnect();
      desktop.removeEventListener("change", handleViewportChange);
    };
  }, []);

  function updateSearch(value: string) {
    setQuery(value);
    setArea("Todos");
  }

  function chooseSuggestion(title: string) {
    setQuery(title);
    setArea("Todos");
    setSearchFocused(false);
    document.querySelector("#lugares")?.scrollIntoView({ behavior: "smooth" });
  }

  function openRoute(destination: string) {
    const platform = devicePlatform();
    const urls = routeUrls(destination);

    if (platform === "android") {
      window.location.href = urls.android;
      return;
    }

    if (platform === "ios" || platform === "mobile") {
      setRoutePicker(destination);
      return;
    }

    window.open(urls.google, "_blank", "noopener,noreferrer");
  }

  return (
    <>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroCopy}>
            <a className="album-breadcrumb" href="/">Início</a>
            <p className={styles.eyebrow}>Seu tempo em Prado, bem aproveitado</p>
            <h1>O que você quer fazer hoje?</h1>
            <p>Pesquise um lugar ou escolha uma região. O guia mostra o essencial e abre o caminho no seu GPS.</p>
          </div>
          <div className={styles.heroPanel} onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setSearchFocused(false);
          }}>
            <label className={styles.searchBox}>
              <span aria-hidden="true">⌕</span>
              <span className={styles.srOnly}>Pesquisar lugares</span>
              <input type="search" value={query} placeholder="Ex.: Centro Histórico, Cumuruxatiba..." onFocus={() => setSearchFocused(true)} onChange={(event) => updateSearch(event.target.value)} />
            </label>
            {searchFocused && suggestions.length > 0 ? (
              <div className={styles.searchSuggestions} role="listbox" aria-label="Sugestões de lugares">
                {suggestions.map((destination) => (
                  <button type="button" role="option" aria-selected={query === destination.title} onClick={() => chooseSuggestion(destination.title)} key={destination.id}>
                    <span><strong>{destination.title}</strong><small>{destination.area} · {destination.category}</small></span>
                    <small>{destination.distance}</small>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <div className={styles.quickChoices} aria-label="Opções disponíveis no roteiro para hóspedes">
          <div className={styles.quickChoice}><span aria-hidden="true">⌖</span><strong>Perto da Casa</strong><small>até 4 horas</small></div>
          <div className={styles.quickChoice}><span aria-hidden="true">◒</span><strong>Meio período</strong><small>vá sem pressa</small></div>
          <div className={styles.quickChoice}><span aria-hidden="true">☀</span><strong>Dia inteiro</strong><small>saia cedo</small></div>
          <div className={styles.quickChoice}><span aria-hidden="true">☺</span><strong>Com crianças</strong><small>escolhas práticas</small></div>
        </div>
      </section>

      <section className={styles.explorer} id="lugares">
        <div className={styles.filterShell}>
          <div className={styles.areaScroller} aria-label="Filtrar por localidade">
            {["Todos" as const, ...guideAreas].map((item) => (
              <button className={area === item ? styles.activeChip : undefined} type="button" aria-pressed={area === item} onClick={() => { setArea(item); setQuery(""); setSearchFocused(false); }} key={item}>{item}</button>
            ))}
          </div>
        </div>

        <div className={styles.contentGrid}>
          <aside className={styles.desktopPlanner} id="planeje" ref={desktopPlannerRef}>
            <p className={styles.eyebrow}>Exclusivo para hóspedes</p>
            <h2>Seu passeio, do seu jeito.</h2>
            <p>Conte quem vai com você e o guia automatizado prepara o roteiro, priorizando seus interesses e reduzindo deslocamentos.</p>
            <ul><li>Roteiro gerado na hora</li><li>Ordem inteligente de paradas</li><li>Cuidados de estrada e maré</li></ul>
            <a href="/guia/montar">Gerar meu roteiro</a>
            <small>Visualização temporariamente aberta para revisão.</small>
          </aside>

          <div className={styles.results}>
            <div className={styles.resultsHeading}>
              <div><p className={styles.eyebrow}>Explore no seu ritmo</p><h2>{query ? "Lugares encontrados" : area === "Todos" ? "Todos os lugares" : area}</h2></div>
              <span>{destinations.length} {destinations.length === 1 ? "resultado" : "resultados"}</span>
            </div>

            <div className={styles.cards}>
              {destinations.map((destination) => {
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
                      <div className={styles.accessLine}><span aria-hidden="true">↝</span><p><small>Acesso</small>{destination.access}</p></div>
                      <div className={styles.featureList}>{destination.features.map((feature) => <span key={feature}>{feature}</span>)}</div>
                      {destination.tide ? <p className={styles.tideNote}><strong>Maré:</strong> {destination.tide}</p> : null}
                      {destination.alert ? <p className={styles.alertNote}><strong>Confira antes:</strong> {destination.alert}</p> : null}
                      <div className={styles.gpsAction}>
                        <button type="button" onClick={() => openRoute(destination.routeQuery)}>Como chegar <span className={styles.routeIcon} aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 21s6-5.2 6-11a6 6 0 1 0-12 0c0 5.8 6 11 6 11Z" /><circle cx="12" cy="10" r="2.2" /></svg></span></button>
                        <p className={styles.gpsNote}>O aplicativo usará sua localização atual como ponto de partida.</p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {destinations.length === 0 ? (
              <div className={styles.emptyState}><strong>Nenhum lugar encontrado.</strong><p>Tente outro nome ou escolha uma região.</p><button type="button" onClick={() => { setArea("Todos"); setQuery(""); }}>Limpar pesquisa</button></div>
            ) : null}
          </div>
        </div>
      </section>

      <section className={styles.guideNotes}>
        <div><p className={styles.eyebrow}>Antes de sair</p><h2>Informação boa é informação conferida.</h2></div>
        <div className={styles.noteCards}>
          <article><strong>Maré e mar</strong><p>Confira a previsão no dia. Passeios marítimos podem mudar ou ser cancelados.</p></article>
          <article><strong>Estradas</strong><p>Chuva altera acessos não pavimentados. Consulte a previsão antes de seguir.</p></article>
          <article><strong>Acesso responsável</strong><p>Cumuruxatiba e Corumbau exigem confirmação atual de acesso e segurança.</p></article>
        </div>
        <p className={styles.originNote}><strong>Referência das distâncias:</strong> {casaAddress} · Plus Code {casaPlusCode}. São estimativas rodoviárias a partir da Casa; ao abrir um GPS, a navegação parte da localização atual do aparelho e mostra a condição real daquele momento.</p>
      </section>

      <aside className={`${styles.mobileAction} ${showDesktopAction ? styles.desktopActionVisible : ""}`}><span><small>Visualização liberada</small><strong>Gerar meu roteiro</strong></span><a href="/guia/montar">Começar</a></aside>

      {routePicker ? (
        <div className={styles.routePicker} role="dialog" aria-modal="true" aria-labelledby="route-picker-title">
          <button className={styles.routePickerBackdrop} type="button" aria-label="Fechar escolha de GPS" onClick={() => setRoutePicker(null)} />
          <div className={styles.routePickerPanel}>
            <span className={styles.routePickerHandle} aria-hidden="true" />
            <div className={styles.routePickerHeading}>
              <div><small>Abrir fora do site</small><h2 id="route-picker-title">Escolha seu GPS</h2></div>
              <button type="button" aria-label="Fechar" onClick={() => setRoutePicker(null)}>×</button>
            </div>
            <p>O aplicativo escolhido usará sua localização atual como ponto de partida.</p>
            <div className={styles.routePickerApps}>
              <a href={routeUrls(routePicker).apple} onClick={() => setRoutePicker(null)}><span aria-hidden="true">A</span><strong>Mapas da Apple</strong><small>iPhone e iPad</small></a>
              <a href={routeUrls(routePicker).google} onClick={() => setRoutePicker(null)}><span aria-hidden="true">G</span><strong>Google Maps</strong><small>Aplicativo ou navegador</small></a>
              <a href={routeUrls(routePicker).waze} onClick={() => setRoutePicker(null)}><span aria-hidden="true">W</span><strong>Waze</strong><small>Aplicativo ou navegador</small></a>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
