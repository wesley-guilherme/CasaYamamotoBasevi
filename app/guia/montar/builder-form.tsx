"use client";

import { useMemo, useState } from "react";
import { guideDestinations, guideTraitLabels, routeSideLabels, type Destination, type GuideTrait, type RouteSide } from "../guide-data";
import styles from "./montar.module.css";

type ItineraryDay = { title: string; subtitle: string; places: Destination[]; nightOption?: Destination; mixedDirections: boolean };

const groupTraits: Record<string, GuideTrait> = {
  Casal: "casal",
  "Família com crianças": "familia-criancas",
  "Grupo de amigos": "grupo-amigos",
  "Com idosos": "idoso",
};

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR");
}

function preferenceScore(destination: Destination, group: string, notes: string, selected: string[]) {
  const searchable = normalize([
    destination.title,
    destination.area,
    destination.category,
    destination.summary,
    ...destination.bestFor,
    ...destination.features,
    ...destination.traits.map((trait) => guideTraitLabels[trait]),
  ].join(" "));
  const noteTerms = normalize(notes).split(/\s+/).filter((term) => term.length > 3);
  const groupTrait = groupTraits[group];
  const groupScore = groupTrait && destination.traits.includes(groupTrait) ? 18 : 0;
  const noteScore = noteTerms.reduce((score, term) => score + (searchable.includes(term) ? 2 : 0), 0);
  const selectedScore = selected.includes(destination.id) ? 1000 : 0;
  const accessPenalty = group === "Com idosos" && normalize(destination.access).includes("nao paviment") ? -20 : 0;
  return selectedScore + groupScore + noteScore + accessPenalty - destination.distanceKm / 100;
}

function generateItinerary(availability: string, group: string, pace: string, notes: string, selected: string[]) {
  const halfDay = availability === "meio-periodo";
  const dayCount = halfDay ? 1 : Number(availability);
  const defaultLimit = halfDay ? 2 : pace === "Intenso" ? 3 : 2;
  const ranked = [...guideDestinations].sort((a, b) => preferenceScore(b, group, notes, selected) - preferenceScore(a, group, notes, selected));
  const remaining = [...ranked];
  const itinerary: ItineraryDay[] = [];
  const usedPrimarySides = new Set<RouteSide>();

  for (let day = 0; day < dayCount && remaining.length; day += 1) {
    const groupEntries = (Object.keys(routeSideLabels) as RouteSide[]).map((side) => ({
      side,
      candidates: remaining.filter((place) => place.routeSide === side),
    })).filter((entry) => entry.candidates.length);
    const chosenGroup = groupEntries.sort((a, b) => {
      const selectedA = a.candidates.filter((place) => selected.includes(place.id)).length;
      const selectedB = b.candidates.filter((place) => selected.includes(place.id)).length;
      const usedA = usedPrimarySides.has(a.side) ? 1 : 0;
      const usedB = usedPrimarySides.has(b.side) ? 1 : 0;
      return selectedB - selectedA || usedA - usedB || b.candidates.length - a.candidates.length;
    })[0];
    if (!chosenGroup) break;
    usedPrimarySides.add(chosenGroup.side);

    const requiredForSide = chosenGroup.candidates.filter((place) => selected.includes(place.id));
    const fullDayRequired = requiredForSide.find((place) => place.durationFilter === "dia-inteiro");
    let places = fullDayRequired
      ? [fullDayRequired]
      : requiredForSide.slice(0, defaultLimit);
    const firstRecommendation = chosenGroup.candidates.find((place) => !selected.includes(place.id));
    const limit = places[0]?.durationFilter === "dia-inteiro" || (!places.length && firstRecommendation?.durationFilter === "dia-inteiro") ? 1 : defaultLimit;
    if (!places.length && firstRecommendation) places = [firstRecommendation];
    if (places.length < limit) {
      places.push(...chosenGroup.candidates.filter((place) => !places.some((current) => current.id === place.id)).slice(0, limit - places.length));
    }

    if (day === dayCount - 1) {
      const pendingRequired = remaining.filter((place) => selected.includes(place.id) && !places.some((current) => current.id === place.id));
      places.push(...pendingRequired);
    }

    let nightOption = places.length > 1
      ? places.find((place) => selected.includes(place.id) && place.traits.includes("bom-noite"))
      : undefined;
    if (nightOption) places = places.filter((place) => place.id !== nightOption?.id);
    places.sort((a, b) => a.distanceKm - b.distanceKm);
    places.forEach((place) => remaining.splice(remaining.findIndex((item) => item.id === place.id), 1));
    nightOption ??= remaining.find((place) =>
      !selected.includes(place.id)
        && place.traits.includes("bom-noite")
        && (place.routeSide === chosenGroup.side || place.routeSide === "prado")
      );
    if (nightOption) remaining.splice(remaining.findIndex((item) => item.id === nightOption.id), 1);
    const placeSides = new Set([...places, ...(nightOption ? [nightOption] : [])].map((place) => place.routeSide).filter((side) => side !== "prado"));
    const mixedDirections = placeSides.has("alcobaca") && placeSides.has("cumuruxatiba");

    itinerary.push({
      title: halfDay
        ? mixedDirections ? "Meio período · roteiro combinado" : `Meio período · ${routeSideLabels[chosenGroup.side]}`
        : mixedDirections ? `Dia ${day + 1} · roteiro combinado` : `Dia ${day + 1} · ${routeSideLabels[chosenGroup.side]}`,
      subtitle: mixedDirections
        ? "Escolha mantida · haverá mais deslocamento"
        : places.some((place) => place.durationFilter === "dia-inteiro") ? "Saída cedo recomendada" : "Paradas na mesma direção",
      places,
      nightOption,
      mixedDirections,
    });
  }

  return itinerary;
}

function currentLocationUrls(destination: string) {
  const target = encodeURIComponent(destination);
  return {
    google: `https://www.google.com/maps/dir/?api=1&destination=${target}&travelmode=driving`,
    waze: `https://www.waze.com/ul?q=${target}&navigate=yes`,
  };
}

export default function BuilderForm({ displayName }: { displayName: string; email: string }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [days, setDays] = useState("3");
  const [group, setGroup] = useState("Casal");
  const [pace, setPace] = useState("Tranquilo");
  const [notes, setNotes] = useState("");
  const [itinerary, setItinerary] = useState<ItineraryDay[]>([]);

  const selectedPlaces = useMemo(() => guideDestinations.filter((item) => selected.includes(item.id)), [selected]);
  const mixesMainDirections = useMemo(() => {
    const directions = new Set(selectedPlaces.map((place) => place.routeSide).filter((side) => side !== "prado"));
    return directions.has("alcobaca") && directions.has("cumuruxatiba");
  }, [selectedPlaces]);
  const availabilityLabel = days === "meio-periodo" ? "meio período" : `${days} ${days === "1" ? "dia" : "dias"}`;

  function toggle(id: string) {
    setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
    setItinerary([]);
  }

  function buildGuide() {
    setItinerary(generateItinerary(days, group, pace, notes, selected));
    window.setTimeout(() => document.querySelector("#roteiro-pronto")?.scrollIntoView({ behavior: "smooth" }), 50);
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
        <p className={styles.selectionHint}>Se não marcar nenhum, o guia escolhe tudo com base no perfil da viagem.</p>
        <div className={styles.routeGuide} aria-label="Direções dos passeios">
          <div><strong>Lado de Alcobaça</strong><span>Guaratiba, Quati, Alcobaça e Caravelas</span></div>
          <div><strong>Lado de Cumuruxatiba</strong><span>Praias de Prado, Cumuruxatiba, Parque Nacional e Corumbau</span></div>
        </div>
        {mixesMainDirections ? (
          <div className={styles.directionNotice} role="status">
            <strong>Você escolheu lugares em direções diferentes.</strong>
            <p>Para aproveitar mais e passar menos tempo no carro, vale escolher um lado por dia. O guia separará os lados quando houver tempo; se não houver, manterá sua escolha sem bloquear o roteiro.</p>
          </div>
        ) : null}
        <div className={styles.placeGrid}>
          {guideDestinations.map((destination) => {
            const active = selected.includes(destination.id);
            return <button className={active ? styles.selected : undefined} type="button" aria-pressed={active} onClick={() => toggle(destination.id)} key={destination.id}><span>{active ? "✓" : "+"}</span><div><small>{routeSideLabels[destination.routeSide]} · {destination.area} · {destination.distance}</small><strong>{destination.title}</strong></div></button>;
          })}
        </div>
      </section>

      <section className={styles.notes}>
        <label><span>O que o guia precisa considerar?</span><textarea value={notes} onChange={(event) => { setNotes(event.target.value); setItinerary([]); }} placeholder="Ex.: criança pequena, queremos praia tranquila, gastronomia e evitar estrada de terra…" rows={4} /></label>
      </section>

      {itinerary.length ? (
        <section className={styles.itinerary} id="roteiro-pronto" aria-live="polite">
          <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>Gerado automaticamente</p><h2>Seu roteiro sugerido</h2></div><span>{days === "meio-periodo" ? "meio período" : `${itinerary.length} ${itinerary.length === 1 ? "dia" : "dias"}`}</span></div>
          <p className={styles.itineraryIntro}>O roteiro considera <strong>{availabilityLabel}</strong>, o perfil <strong>{group}</strong>, ritmo <strong>{pace.toLocaleLowerCase("pt-BR")}</strong>{selectedPlaces.length ? ` e ${selectedPlaces.length} lugares indispensáveis` : " e as melhores combinações do guia"}. Reconfirme maré, estrada e funcionamento no dia.</p>
          <div className={styles.dayGrid}>
            {itinerary.map((day) => (
              <article className={styles.dayCard} key={day.title}>
                <header><div><small>{day.subtitle}</small><h3>{day.title}</h3></div><span>{day.places.length} {day.places.length === 1 ? "parada" : "paradas"}</span></header>
                <ol>
                  {day.places.map((place, index) => {
                    const urls = currentLocationUrls(place.routeQuery);
                    const time = place.durationFilter === "dia-inteiro" ? "08:00" : days === "meio-periodo" ? index === 0 ? "09:00" : "11:30" : index === 0 ? "09:00" : index === 1 ? "14:00" : index === 2 ? "17:00" : `${18 + index}:00`;
                    return <li key={place.id}><span>{time}</span><div><small>{place.area} · {place.distance} da Casa</small><strong>{place.title}</strong><p>{place.access}</p>{place.alert ? <em>{place.alert}</em> : null}<nav aria-label={`Abrir rota para ${place.title}`}><a href={urls.google} target="_blank" rel="noreferrer">Google Maps</a><a href={urls.waze} target="_blank" rel="noreferrer">Waze</a></nav></div></li>;
                  })}
                  {day.nightOption ? (() => {
                    const urls = currentLocationUrls(day.nightOption.routeQuery);
                    return <li className={styles.nightStop} key={`night-${day.nightOption.id}`}><span>19:30</span><div><small>Opção para a noite · {day.nightOption.area}</small><strong>{day.nightOption.title}</strong><p>{day.nightOption.access}</p><nav aria-label={`Abrir rota para ${day.nightOption.title}`}><a href={urls.google} target="_blank" rel="noreferrer">Google Maps</a><a href={urls.waze} target="_blank" rel="noreferrer">Waze</a></nav></div></li>;
                  })() : null}
                </ol>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <aside className={styles.summary}>
        <div><small>Guia automatizado</small><strong>{selected.length ? `${selected.length} lugares prioritários` : `${availabilityLabel} · escolha automática`}</strong></div>
        <button type="button" onClick={buildGuide}>{itinerary.length ? "Gerar novamente" : "Gerar meu roteiro"}</button>
      </aside>
    </div>
  );
}
