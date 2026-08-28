"use client";

import { useMemo, useState } from "react";
import { guideDestinations, type Destination } from "../guide-data";
import styles from "./montar.module.css";

type ItineraryDay = { title: string; subtitle: string; places: Destination[] };

const areaGroups: Record<string, string[]> = {
  "Prado e arredores": ["Prado", "Guaratiba", "Quati"],
  "Litoral norte": ["Cumuruxatiba", "Corumbau"],
  "Costa sul": ["Alcobaça", "Caravelas"],
};

const groupTerms: Record<string, string[]> = {
  Casal: ["casal", "fotografia", "gastronomia", "sossego"],
  "Família com crianças": ["família", "crianças", "estrutura", "educativo", "praticidade"],
  "Grupo de amigos": ["aventura", "gastronomia", "mergulho", "trilha"],
  "Com idosos": ["passeio leve", "carro comum", "estrutura", "centro", "orla"],
};

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR");
}

function preferenceScore(destination: Destination, group: string, notes: string, selected: string[]) {
  const searchable = normalize([destination.title, destination.area, destination.category, destination.summary, ...destination.bestFor, ...destination.features].join(" "));
  const noteTerms = normalize(notes).split(/\s+/).filter((term) => term.length > 3);
  const groupScore = (groupTerms[group] ?? []).reduce((score, term) => score + (searchable.includes(normalize(term)) ? 3 : 0), 0);
  const noteScore = noteTerms.reduce((score, term) => score + (searchable.includes(term) ? 2 : 0), 0);
  const selectedScore = selected.includes(destination.id) ? 100 : 0;
  const accessPenalty = group === "Com idosos" && normalize(destination.access).includes("nao paviment") ? -8 : 0;
  return selectedScore + groupScore + noteScore + accessPenalty - destination.distanceKm / 100;
}

function generateItinerary(dayCount: number, group: string, pace: string, notes: string, selected: string[]) {
  const ranked = [...guideDestinations].sort((a, b) => preferenceScore(b, group, notes, selected) - preferenceScore(a, group, notes, selected));
  const required = selected.length ? ranked.filter((item) => selected.includes(item.id)) : [];
  const recommendations = ranked.filter((item) => !selected.includes(item.id));
  const pool = [...required, ...recommendations].slice(0, Math.max(dayCount * (pace === "Intenso" ? 3 : 2), dayCount));
  const remaining = [...pool];
  const itinerary: ItineraryDay[] = [];

  for (let day = 0; day < dayCount && remaining.length; day += 1) {
    const groupEntries = Object.entries(areaGroups).map(([label, areas]) => ({
      label,
      candidates: remaining.filter((place) => areas.includes(place.area)),
    })).filter((entry) => entry.candidates.length);
    const chosenGroup = groupEntries.sort((a, b) => {
      const selectedA = a.candidates.filter((place) => selected.includes(place.id)).length;
      const selectedB = b.candidates.filter((place) => selected.includes(place.id)).length;
      return selectedB - selectedA || b.candidates.length - a.candidates.length;
    })[0];
    if (!chosenGroup) break;

    const first = chosenGroup.candidates[0];
    const limit = first.durationFilter === "dia-inteiro" ? 1 : pace === "Intenso" ? 3 : 2;
    const places = chosenGroup.candidates.slice(0, limit).sort((a, b) => a.distanceKm - b.distanceKm);
    places.forEach((place) => remaining.splice(remaining.findIndex((item) => item.id === place.id), 1));
    itinerary.push({
      title: `Dia ${day + 1} · ${chosenGroup.label}`,
      subtitle: places.some((place) => place.durationFilter === "dia-inteiro") ? "Saída cedo recomendada" : "Paradas próximas agrupadas",
      places,
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

  function toggle(id: string) {
    setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
    setItinerary([]);
  }

  function buildGuide() {
    setItinerary(generateItinerary(Number(days), group, pace, notes, selected));
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
        <label><span>Tempo disponível</span><select value={days} onChange={(event) => { setDays(event.target.value); setItinerary([]); }}><option value="1">1 dia</option><option value="3">3 dias</option><option value="5">5 dias</option><option value="7">7 dias</option></select></label>
        <label><span>Quem vai</span><select value={group} onChange={(event) => { setGroup(event.target.value); setItinerary([]); }}><option>Casal</option><option>Família com crianças</option><option>Grupo de amigos</option><option>Com idosos</option></select></label>
        <label><span>Ritmo desejado</span><select value={pace} onChange={(event) => { setPace(event.target.value); setItinerary([]); }}><option>Tranquilo</option><option>Intenso</option></select></label>
      </section>

      <section className={styles.selection}>
        <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>Opcional</p><h2>Seus lugares indispensáveis</h2></div><span>{selected.length} selecionados</span></div>
        <p className={styles.selectionHint}>Se não marcar nenhum, o guia escolhe tudo com base no perfil da viagem.</p>
        <div className={styles.placeGrid}>
          {guideDestinations.map((destination) => {
            const active = selected.includes(destination.id);
            return <button className={active ? styles.selected : undefined} type="button" aria-pressed={active} onClick={() => toggle(destination.id)} key={destination.id}><span>{active ? "✓" : "+"}</span><div><small>{destination.area} · {destination.distance}</small><strong>{destination.title}</strong></div></button>;
          })}
        </div>
      </section>

      <section className={styles.notes}>
        <label><span>O que o guia precisa considerar?</span><textarea value={notes} onChange={(event) => { setNotes(event.target.value); setItinerary([]); }} placeholder="Ex.: criança pequena, queremos praia tranquila, gastronomia e evitar estrada de terra…" rows={4} /></label>
      </section>

      {itinerary.length ? (
        <section className={styles.itinerary} id="roteiro-pronto" aria-live="polite">
          <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>Gerado automaticamente</p><h2>Seu roteiro sugerido</h2></div><span>{itinerary.length} {itinerary.length === 1 ? "dia" : "dias"}</span></div>
          <p className={styles.itineraryIntro}>O roteiro considera o perfil <strong>{group}</strong>, ritmo <strong>{pace.toLocaleLowerCase("pt-BR")}</strong>{selectedPlaces.length ? ` e ${selectedPlaces.length} lugares indispensáveis` : " e as melhores combinações do guia"}. Reconfirme maré, estrada e funcionamento no dia.</p>
          <div className={styles.dayGrid}>
            {itinerary.map((day) => (
              <article className={styles.dayCard} key={day.title}>
                <header><div><small>{day.subtitle}</small><h3>{day.title}</h3></div><span>{day.places.length} {day.places.length === 1 ? "parada" : "paradas"}</span></header>
                <ol>
                  {day.places.map((place, index) => {
                    const urls = currentLocationUrls(place.routeQuery);
                    const time = place.durationFilter === "dia-inteiro" ? "08:00" : index === 0 ? "09:00" : index === 1 ? "14:00" : "17:00";
                    return <li key={place.id}><span>{time}</span><div><small>{place.area} · {place.distance} da Casa</small><strong>{place.title}</strong><p>{place.access}</p>{place.alert ? <em>{place.alert}</em> : null}<nav aria-label={`Abrir rota para ${place.title}`}><a href={urls.google} target="_blank" rel="noreferrer">Google Maps</a><a href={urls.waze} target="_blank" rel="noreferrer">Waze</a></nav></div></li>;
                  })}
                </ol>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <aside className={styles.summary}>
        <div><small>Guia automatizado</small><strong>{selected.length ? `${selected.length} lugares prioritários` : `${days} ${days === "1" ? "dia" : "dias"} · escolha automática`}</strong></div>
        <button type="button" onClick={buildGuide}>{itinerary.length ? "Gerar novamente" : "Gerar meu roteiro"}</button>
      </aside>
    </div>
  );
}
