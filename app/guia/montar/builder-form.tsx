"use client";

import { useMemo, useState } from "react";
import { guideDestinations } from "../guide-data";
import styles from "./montar.module.css";

export default function BuilderForm({ displayName, email }: { displayName: string; email: string }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [days, setDays] = useState("3 dias");
  const [group, setGroup] = useState("Casal");
  const [notes, setNotes] = useState("");

  const selectedPlaces = useMemo(() => guideDestinations.filter((item) => selected.includes(item.id)), [selected]);

  function toggle(id: string) {
    setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  const message = [
    `Olá! Sou ${displayName} (${email}) e gostaria de orientação para montar meu passeio.`,
    `Estadia/tempo disponível: ${days}.`,
    `Perfil do grupo: ${group}.`,
    `Lugares de interesse: ${selectedPlaces.map((item) => item.title).join(", ") || "a definir"}.`,
    notes ? `Observações: ${notes}` : "",
  ].filter(Boolean).join("\n");

  const mailto = `mailto:casayamamotobasevi@gmail.com?subject=${encodeURIComponent("Pedido de guia personalizado")}&body=${encodeURIComponent(message)}`;

  return (
    <div className={styles.builder}>
      <section className={styles.intro}>
        <p className={styles.eyebrow}>Olá, {displayName}</p>
        <h1>Vamos montar seu passeio?</h1>
        <p>Escolha os lugares que chamaram sua atenção. O anfitrião poderá ajudar a ajustar ordem, estrada, maré e tempo do grupo.</p>
      </section>

      <section className={styles.preferences} aria-label="Preferências do passeio">
        <label><span>Tempo disponível</span><select value={days} onChange={(event) => setDays(event.target.value)}><option>1 dia</option><option>3 dias</option><option>5 dias</option><option>7 dias</option></select></label>
        <label><span>Quem vai</span><select value={group} onChange={(event) => setGroup(event.target.value)}><option>Casal</option><option>Família com crianças</option><option>Grupo de amigos</option><option>Com idosos</option></select></label>
      </section>

      <section className={styles.selection}>
        <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>Seus interesses</p><h2>Escolha os lugares</h2></div><span>{selected.length} selecionados</span></div>
        <div className={styles.placeGrid}>
          {guideDestinations.map((destination) => {
            const active = selected.includes(destination.id);
            return <button className={active ? styles.selected : undefined} type="button" aria-pressed={active} onClick={() => toggle(destination.id)} key={destination.id}><span>{active ? "✓" : "+"}</span><div><small>{destination.area} · {destination.distance}</small><strong>{destination.title}</strong></div></button>;
          })}
        </div>
      </section>

      <section className={styles.notes}>
        <label><span>Conte algo importante para o anfitrião</span><textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Ex.: estamos com uma criança pequena, queremos evitar estrada de terra…" rows={4} /></label>
      </section>

      <aside className={styles.summary}>
        <div><small>Seu pedido</small><strong>{selected.length ? `${selected.length} lugares selecionados` : "Comece escolhendo um lugar"}</strong></div>
        <a className={!selected.length ? styles.disabled : undefined} href={selected.length ? mailto : undefined} aria-disabled={!selected.length}>Solicitar orientação</a>
      </aside>
    </div>
  );
}
