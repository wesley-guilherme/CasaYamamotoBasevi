"use client";

import { useEffect, useMemo, useState } from "react";
import { guideDestinations, routeSideLabels, type Destination, type GuideTrait, type RouteSide } from "../guide-data";
import styles from "./montar.module.css";

type ItineraryDay = { title: string; subtitle: string; places: Destination[]; nightOption?: Destination; mixedDirections: boolean };

const groupTraits: Record<string, GuideTrait> = {
  Casal: "casal",
  "Família com crianças": "familia-criancas",
  "Grupo de amigos": "grupo-amigos",
  "Com idosos": "idoso",
};

const directionGroups: Array<{ side: RouteSide; title: string; description: string }> = [
  { side: "alcobaca", title: "Litoral Sul", description: "Guaratiba, Quati, Alcobaça e Caravelas" },
  { side: "cumuruxatiba", title: "Litoral Norte", description: "Praias de Prado, Cumuruxatiba, Parque Nacional e Corumbau" },
];

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR");
}

function isSafeAtNight(destination: Destination) {
  const title = normalize(destination.title);
  const category = normalize(destination.category);
  return !destination.traits.includes("rio")
    && !title.includes("praia")
    && !category.startsWith("praia")
    && !category.startsWith("rio");
}

function preferenceScore(destination: Destination, group: string, selected: string[]) {
  const groupTrait = groupTraits[group];
  const groupScore = groupTrait && destination.traits.includes(groupTrait) ? 18 : 0;
  const selectedScore = selected.includes(destination.id) ? 1000 : 0;
  const accessPenalty = group === "Com idosos" && normalize(destination.access).includes("nao paviment") ? -20 : 0;
  return selectedScore + groupScore + accessPenalty - destination.distanceKm / 100;
}

function generateItinerary(availability: string, group: string, pace: string, selected: string[]) {
  const halfDay = availability === "meio-periodo";
  const dayCount = halfDay ? 1 : Number(availability);
  const defaultLimit = halfDay ? 2 : pace === "Intenso" ? 3 : 2;
  const ranked = guideDestinations
    .map((place) => ({
      place,
      score: preferenceScore(place, group, selected) + (selected.length ? 0 : Math.random() * 8),
    }))
    .sort((a, b) => b.score - a.score)
    .map(({ place }) => place);
  const remaining = [...ranked];
  const itinerary: ItineraryDay[] = [];
  const usedPrimarySides = new Set<RouteSide>();

  for (let day = 0; day < dayCount && remaining.length; day += 1) {
    const groupEntries = (Object.keys(routeSideLabels) as RouteSide[]).map((side) => ({
      side,
      candidates: remaining.filter((place) => place.routeSide === side),
      randomOrder: Math.random(),
    })).filter((entry) => entry.candidates.length);
    const chosenGroup = groupEntries.sort((a, b) => {
      const selectedA = a.candidates.filter((place) => selected.includes(place.id)).length;
      const selectedB = b.candidates.filter((place) => selected.includes(place.id)).length;
      const usedA = usedPrimarySides.has(a.side) ? 1 : 0;
      const usedB = usedPrimarySides.has(b.side) ? 1 : 0;
      return selectedB - selectedA
        || usedA - usedB
        || (selected.length ? b.candidates.length - a.candidates.length : b.randomOrder - a.randomOrder);
    })[0];
    if (!chosenGroup) break;
    usedPrimarySides.add(chosenGroup.side);

    const requiredForSide = chosenGroup.candidates.filter((place) => selected.includes(place.id));
    const fullDayRequired = requiredForSide.find((place) => place.durationFilter === "dia-inteiro");
    let places = fullDayRequired ? [fullDayRequired] : requiredForSide.slice(0, defaultLimit);
    const firstRecommendation = chosenGroup.candidates.find((place) => !selected.includes(place.id));
    const limit = places[0]?.durationFilter === "dia-inteiro" || (!places.length && firstRecommendation?.durationFilter === "dia-inteiro") ? 1 : defaultLimit;
    if (!places.length && firstRecommendation) places = [firstRecommendation];
    if (places.length < limit) places.push(...chosenGroup.candidates.filter((place) => !places.some((current) => current.id === place.id)).slice(0, limit - places.length));

    if (day === dayCount - 1) {
      const pendingRequired = remaining.filter((place) => selected.includes(place.id) && !places.some((current) => current.id === place.id));
      places.push(...pendingRequired);
    }

    let nightOption = places.length > 1
      ? places.find((place) => selected.includes(place.id) && place.traits.includes("bom-noite") && isSafeAtNight(place))
      : undefined;
    if (nightOption) places = places.filter((place) => place.id !== nightOption?.id);
    places.sort((a, b) => a.distanceKm - b.distanceKm);
    places.forEach((place) => remaining.splice(remaining.findIndex((item) => item.id === place.id), 1));
    nightOption ??= remaining.find((place) => !selected.includes(place.id) && place.traits.includes("bom-noite") && isSafeAtNight(place) && (place.routeSide === chosenGroup.side || place.routeSide === "prado"));
    if (nightOption) remaining.splice(remaining.findIndex((item) => item.id === nightOption.id), 1);
    const placeSides = new Set([...places, ...(nightOption ? [nightOption] : [])].map((place) => place.routeSide).filter((side) => side !== "prado"));
    const mixedDirections = placeSides.has("alcobaca") && placeSides.has("cumuruxatiba");

    itinerary.push({
      title: halfDay ? mixedDirections ? "Meio período · roteiro combinado" : `Meio período · ${routeSideLabels[chosenGroup.side]}` : mixedDirections ? `Dia ${day + 1} · roteiro combinado` : `Dia ${day + 1} · ${routeSideLabels[chosenGroup.side]}`,
      subtitle: mixedDirections ? "Escolha mantida · haverá mais deslocamento" : places.some((place) => place.durationFilter === "dia-inteiro") ? "Saída cedo recomendada" : "Paradas na mesma direção",
      places,
      nightOption,
      mixedDirections,
    });
  }

  return itinerary;
}

function itineraryPlaceSignature(value: ItineraryDay[]) {
  return value
    .flatMap((day) => [...day.places, ...(day.nightOption ? [day.nightOption] : [])])
    .map((place) => place.id)
    .sort()
    .join("|");
}

function currentLocationUrls(destination: string) {
  const target = encodeURIComponent(destination);
  return { google: `https://www.google.com/maps/dir/?api=1&destination=${target}&travelmode=driving`, waze: `https://www.waze.com/ul?q=${target}&navigate=yes` };
}

function timeForStop(place: Destination, index: number, availability: string) {
  if (place.durationFilter === "dia-inteiro") return "08:00";
  const times = availability === "meio-periodo" ? ["09:00", "11:30"] : ["08:00", "10:30", "13:30", "15:30", "17:00"];
  return times[Math.min(index, times.length - 1)];
}

function wrapCanvasText(context: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  words.forEach((word) => {
    const attempt = line ? `${line} ${word}` : word;
    if (context.measureText(attempt).width > maxWidth && line) { lines.push(line); line = word; } else { line = attempt; }
  });
  if (line) lines.push(line);
  return lines;
}

export default function BuilderForm({ displayName }: { displayName: string; email: string }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [days, setDays] = useState("3");
  const [group, setGroup] = useState("Casal");
  const [pace, setPace] = useState("Tranquilo");
  const [itinerary, setItinerary] = useState<ItineraryDay[]>([]);
  const [generatedSelectedCount, setGeneratedSelectedCount] = useState(0);
  const [directionDialogOpen, setDirectionDialogOpen] = useState(false);
  const [downloadState, setDownloadState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const selectedPlaces = useMemo(() => guideDestinations.filter((item) => selected.includes(item.id)), [selected]);
  const mixesMainDirections = useMemo(() => {
    const directions = new Set(selectedPlaces.map((place) => place.routeSide).filter((side) => side !== "prado"));
    return directions.has("alcobaca") && directions.has("cumuruxatiba");
  }, [selectedPlaces]);
  const availabilityLabel = days === "meio-periodo" ? "meio período" : `${days} ${days === "1" ? "dia" : "dias"}`;
  const showTimes = generatedSelectedCount <= 5 && pace !== "Intenso";

  useEffect(() => {
    if (!directionDialogOpen) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") setDirectionDialogOpen(false); };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKeyDown); document.body.style.overflow = previousOverflow; };
  }, [directionDialogOpen]);

  function toggle(id: string) {
    setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
    setItinerary([]);
    setGeneratedSelectedCount(0);
  }

  function commitGuide() {
    setDirectionDialogOpen(false);
    let nextItinerary = generateItinerary(days, group, pace, selected);
    if (!selected.length && itinerary.length) {
      const previousSignature = itineraryPlaceSignature(itinerary);
      for (let attempt = 0; attempt < 8 && itineraryPlaceSignature(nextItinerary) === previousSignature; attempt += 1) {
        nextItinerary = generateItinerary(days, group, pace, selected);
      }
    }
    setItinerary(nextItinerary);
    setGeneratedSelectedCount(selected.length);
    setSelected([]);
    window.setTimeout(() => document.querySelector("#roteiro-pronto")?.scrollIntoView({ behavior: "smooth" }), 80);
  }

  function buildGuide() {
    if (mixesMainDirections) { setDirectionDialogOpen(true); return; }
    commitGuide();
  }

  async function saveOrShareItinerary() {
    if (!itinerary.length || downloadState === "saving") return;
    setDownloadState("saving");
    const width = 1400;
    const padding = 72;
    const stopHeight = 134;
    const dayGap = 34;
    const headerHeight = 250;
    const dayHeights = itinerary.map((day) => 112 + (day.places.length + (day.nightOption ? 1 : 0)) * stopHeight);
    const height = headerHeight + dayHeights.reduce((sum, value) => sum + value, 0) + Math.max(0, itinerary.length - 1) * dayGap + 90;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) { setDownloadState("error"); return; }

    context.fillStyle = "#f7f4ed"; context.fillRect(0, 0, width, height);
    context.fillStyle = "#16363a"; context.fillRect(0, 0, width, 176);
    context.fillStyle = "#ffffff"; context.font = "700 25px Arial, sans-serif"; context.fillText("CASA YAMAMOTO BASEVI", padding, 60);
    context.font = "500 48px Georgia, serif"; context.fillText("Seu roteiro sugerido", padding, 122);
    context.fillStyle = "#b91639"; context.fillRect(padding, 143, 245, 4);
    context.fillStyle = "#516568"; context.font = "22px Arial, sans-serif";
    context.fillText(`${availabilityLabel} · ${group} · ritmo ${pace.toLocaleLowerCase("pt-BR")}${generatedSelectedCount ? ` · ${generatedSelectedCount} lugares prioritários` : ""}`, padding, 215);

    let y = headerHeight;
    itinerary.forEach((day, dayIndex) => {
      const dayHeight = dayHeights[dayIndex];
      context.fillStyle = "#ffffff"; context.fillRect(padding, y, width - padding * 2, dayHeight);
      context.fillStyle = "#e7f4ef"; context.fillRect(padding, y, width - padding * 2, 112);
      context.fillStyle = "#38716c"; context.font = "700 17px Arial, sans-serif"; context.fillText(day.subtitle.toLocaleUpperCase("pt-BR"), padding + 28, y + 36);
      context.fillStyle = "#16363a"; context.font = "500 34px Georgia, serif"; context.fillText(day.title, padding + 28, y + 78);
      let stopY = y + 112;
      const drawStop = (place: Destination, index: number, night = false) => {
        if (night) { context.fillStyle = "#16363a"; context.fillRect(padding, stopY, width - padding * 2, stopHeight); }
        const label = showTimes ? (night ? "19:30" : timeForStop(place, index, days)) : (night ? "NOITE" : `PARADA ${index + 1}`);
        context.fillStyle = night ? "#f5cdd6" : "#b91639"; context.font = "700 19px Arial, sans-serif"; context.fillText(label, padding + 28, stopY + 39);
        const textX = padding + 182;
        context.fillStyle = night ? "#c7d7d5" : "#65777a"; context.font = "17px Arial, sans-serif"; context.fillText(`${night ? "Opção para a noite · " : ""}${place.area} · ${place.distance} da Casa`, textX, stopY + 31);
        context.fillStyle = night ? "#ffffff" : "#16363a"; context.font = "700 25px Arial, sans-serif"; context.fillText(place.title, textX, stopY + 65);
        context.fillStyle = night ? "#c7d7d5" : "#65777a"; context.font = "17px Arial, sans-serif";
        wrapCanvasText(context, place.access, width - textX - padding - 20).slice(0, 2).forEach((line, lineIndex) => context.fillText(line, textX, stopY + 96 + lineIndex * 21));
        context.strokeStyle = night ? "rgba(255,255,255,.16)" : "rgba(22,54,58,.10)"; context.beginPath(); context.moveTo(padding + 28, stopY + stopHeight - 1); context.lineTo(width - padding - 28, stopY + stopHeight - 1); context.stroke();
        stopY += stopHeight;
      };
      day.places.forEach((place, index) => drawStop(place, index));
      if (day.nightOption) drawStop(day.nightOption, day.places.length, true);
      y += dayHeight + dayGap;
    });

    context.fillStyle = "#65777a"; context.font = "17px Arial, sans-serif";
    context.fillText("Leve esta imagem com você. Reconfirme maré, estrada e funcionamento antes de sair.", padding, height - 42);
    const dataUrl = canvas.toDataURL("image/png");
    const binary = window.atob(dataUrl.split(",")[1]);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
    const file = new File([bytes], "roteiro-casa-yamamoto.png", { type: "image/png" });
    const shareData = { title: "Meu roteiro — Casa Yamamoto Basevi", text: "Roteiro preparado pelo Guia Turístico da Casa Yamamoto Basevi.", files: [file] };

    try {
      if (navigator.share && navigator.canShare?.(shareData)) {
        await navigator.share(shareData);
      } else {
        const url = URL.createObjectURL(file);
        const link = document.createElement("a");
        link.href = url;
        link.download = file.name;
        link.click();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
      setDownloadState("saved");
      window.setTimeout(() => setDownloadState("idle"), 2400);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        setDownloadState("idle");
        return;
      }
      const url = URL.createObjectURL(file);
      const link = document.createElement("a");
      link.href = url;
      link.download = file.name;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setDownloadState("saved");
      window.setTimeout(() => setDownloadState("idle"), 2400);
    }
  }

  function placeButton(destination: Destination) {
    const active = selected.includes(destination.id);
    return <button className={active ? styles.selected : undefined} type="button" aria-pressed={active} onClick={() => toggle(destination.id)} key={destination.id}><span>{active ? "✓" : "+"}</span><div><small>{routeSideLabels[destination.routeSide]} · {destination.area} · {destination.distance}</small><strong>{destination.title}</strong></div></button>;
  }

  return (
    <div className={styles.builder}>
      <section className={styles.intro}>
        <p className={styles.eyebrow}>Olá, {displayName}</p>
        <h1>Seu guia prepara o passeio.</h1>
        <p>Informe o perfil da viagem e marque apenas os lugares indispensáveis. O guia automatizado completa as sugestões e organiza os dias para evitar deslocamentos desnecessários.</p>
      </section>

      <section className={styles.preferences} aria-label="Preferências do passeio">
        <label><span>Tempo disponível</span><select value={days} onChange={(event) => { setDays(event.target.value); setItinerary([]); }}><option value="meio-periodo">Meio período</option><option value="1">1 dia</option><option value="3">3 dias</option><option value="5">5 dias</option><option value="7">7 dias</option></select></label>
        <label><span>Quem vai</span><select value={group} onChange={(event) => { setGroup(event.target.value); setItinerary([]); }}><option>Casal</option><option>Família com crianças</option><option>Grupo de amigos</option><option>Com idosos</option></select></label>
        <label><span>Ritmo desejado</span><select value={pace} onChange={(event) => { setPace(event.target.value); setItinerary([]); }}><option>Tranquilo</option><option>Intenso</option></select></label>
      </section>

      <section className={styles.selection}>
        <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>Opcional</p><h2>Seus lugares indispensáveis</h2></div><span>{selected.length} selecionados</span></div>
        <p className={styles.selectionHint}>Se não marcar nenhum, o guia escolhe tudo com base no perfil da viagem. Abra uma direção para ver os lugares.</p>
        <div className={styles.routeGuide} aria-label="Direções dos passeios">
          {directionGroups.map((route) => {
            const places = guideDestinations.filter((destination) => destination.routeSide === route.side);
            const selectedCount = places.filter((destination) => selected.includes(destination.id)).length;
            return <details className={styles.routePanel} key={route.side}><summary><div><strong>{route.title}</strong><span>{route.description}</span><small>{selectedCount ? `${selectedCount} selecionado${selectedCount > 1 ? "s" : ""}` : `${places.length} lugares`}</small></div><b aria-hidden="true">+</b></summary><div className={styles.placeGrid}>{places.map(placeButton)}</div></details>;
          })}
          <details className={`${styles.routePanel} ${styles.nearbyPanel}`}>
            <summary><div><strong>Prado e arredores</strong><span>Centro histórico, rio, baleias e opções próximas da Casa</span><small>{guideDestinations.filter((destination) => destination.routeSide === "prado" && selected.includes(destination.id)).length || guideDestinations.filter((destination) => destination.routeSide === "prado").length} {guideDestinations.some((destination) => destination.routeSide === "prado" && selected.includes(destination.id)) ? "selecionados" : "lugares"}</small></div><b aria-hidden="true">+</b></summary>
            <div className={styles.placeGrid}>{guideDestinations.filter((destination) => destination.routeSide === "prado").map(placeButton)}</div>
          </details>
        </div>
      </section>

      {itinerary.length ? (
        <section className={styles.itinerary} id="roteiro-pronto" aria-live="polite">
          <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>Gerado automaticamente</p><h2>Seu roteiro sugerido</h2></div><span>{days === "meio-periodo" ? "meio período" : `${itinerary.length} ${itinerary.length === 1 ? "dia" : "dias"}`}</span></div>
          <p className={styles.itineraryIntro}>O roteiro considera <strong>{availabilityLabel}</strong>, o perfil <strong>{group}</strong>, ritmo <strong>{pace.toLocaleLowerCase("pt-BR")}</strong>{generatedSelectedCount ? ` e ${generatedSelectedCount} lugares indispensáveis` : " e as melhores combinações do guia"}. Reconfirme maré, estrada e funcionamento no dia.</p>
          {!showTimes ? <p className={styles.timeNotice}>Os horários foram retirados para manter o roteiro flexível e não criar uma previsão imprecisa.</p> : null}
          <div className={styles.dayGrid}>
            {itinerary.map((day) => (
              <article className={styles.dayCard} key={day.title}>
                <header><div><small>{day.subtitle}</small><h3>{day.title}</h3></div><span>{day.places.length} {day.places.length === 1 ? "parada" : "paradas"}</span></header>
                <ol>
                  {day.places.map((place, index) => {
                    const urls = currentLocationUrls(place.routeQuery);
                    const label = showTimes ? timeForStop(place, index, days) : `Parada ${index + 1}`;
                    return <li key={place.id}><span>{label}</span><div><small>{place.area} · {place.distance} da Casa</small><strong>{place.title}</strong><p>{place.access}</p>{place.alert ? <em>{place.alert}</em> : null}<nav aria-label={`Abrir rota para ${place.title}`}><a href={urls.google} target="_blank" rel="noreferrer">Google Maps</a><a href={urls.waze} target="_blank" rel="noreferrer">Waze</a></nav></div></li>;
                  })}
                  {day.nightOption ? (() => { const urls = currentLocationUrls(day.nightOption.routeQuery); return <li className={styles.nightStop} key={`night-${day.nightOption.id}`}><span>{showTimes ? "19:30" : "Noite"}</span><div><small>Opção para a noite · {day.nightOption.area}</small><strong>{day.nightOption.title}</strong><p>{day.nightOption.access}</p><nav aria-label={`Abrir rota para ${day.nightOption.title}`}><a href={urls.google} target="_blank" rel="noreferrer">Google Maps</a><a href={urls.waze} target="_blank" rel="noreferrer">Waze</a></nav></div></li>; })() : null}
                </ol>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <aside className={`${styles.summary} ${itinerary.length ? styles.summaryReady : ""}`}>
        <div><small>{itinerary.length ? "Roteiro pronto" : "Guia automatizado"}</small><strong>{itinerary.length ? "Leve com você" : selected.length ? `${selected.length} lugares prioritários` : `${availabilityLabel} · escolha automática`}</strong></div>
        {itinerary.length ? (
          <div className={styles.summaryActions}>
            <button className={styles.secondaryAction} type="button" onClick={buildGuide}>Gerar outro</button>
            <button className={styles.shareAction} type="button" onClick={saveOrShareItinerary} disabled={downloadState === "saving"}>{downloadState === "saving" ? "Preparando…" : downloadState === "saved" ? "Concluído" : "Salvar / compartilhar"}</button>
          </div>
        ) : <button type="button" onClick={buildGuide}>Gerar meu roteiro</button>}
      </aside>

      {directionDialogOpen ? (
        <div className={styles.dialogBackdrop} onMouseDown={() => setDirectionDialogOpen(false)}>
          <section className={styles.directionDialog} role="dialog" aria-modal="true" aria-labelledby="direction-dialog-title" onMouseDown={(event) => event.stopPropagation()}>
            <button className={styles.dialogClose} type="button" aria-label="Fechar aviso" onClick={() => setDirectionDialogOpen(false)}>×</button>
            <p className={styles.eyebrow}>Só um lembrete</p>
            <h2 id="direction-dialog-title">Você escolheu lugares em direções diferentes.</h2>
            <p>Para aproveitar mais e passar menos tempo no carro, vale escolher um lado por dia. O guia separará os lados quando houver tempo; se não houver, manterá sua escolha sem bloquear o roteiro.</p>
            <div className={styles.dialogActions}><button type="button" onClick={() => setDirectionDialogOpen(false)}>Revisar lugares</button><button className={styles.dialogPrimary} type="button" onClick={commitGuide} autoFocus>Continuar e gerar</button></div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
