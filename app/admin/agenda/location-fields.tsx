"use client";
import { useEffect, useId, useState, type KeyboardEvent } from "react";
import { brazilStates, findBrazilState, normalizeLocation } from "../../agenda/brazil-location";
import styles from "../eventos/eventos.module.css";
import agendaStyles from "../../agenda/agenda.module.css";

type Option = { value: string; label: string; search: string };
const stateOptions: Option[] = brazilStates.map(state => ({ value: state.name, label: `${state.name} (${state.code})`, search: `${state.name} ${state.code}` }));

function SearchableLocation({ label, value, options, onChange, placeholder, disabled = false }: { label: string; value: string; options: Option[]; onChange: (value: string) => void; placeholder: string; disabled?: boolean }) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const query = normalizeLocation(value);
  const matches = options.filter(option => normalizeLocation(option.search).includes(query));
  const expanded = open && !disabled;
  const activeIndex = active < matches.length ? active : -1;
  useEffect(() => {
    if (expanded && activeIndex >= 0) document.getElementById(`${id}-option-${activeIndex}`)?.scrollIntoView({ block: "nearest" });
  }, [id, activeIndex, expanded]);
  function choose(option: Option) { onChange(option.value); setOpen(false); setActive(-1); }
  function keyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault(); setOpen(true);
      setActive(index => event.key === "ArrowDown" ? Math.min(index + 1, matches.length - 1) : index <= 0 ? matches.length - 1 : index - 1);
    } else if (event.key === "Enter" && expanded) {
      event.preventDefault();
      if (activeIndex >= 0) choose(matches[activeIndex]);
      else if (matches.length === 1) choose(matches[0]);
    } else if (event.key === "Escape") { event.preventDefault(); setOpen(false); setActive(-1); }
  }
  return <div className={agendaStyles.locationField}>
    <label htmlFor={id}>{label}</label>
    <div className={agendaStyles.locationCombo}>
      <input id={id} role="combobox" autoComplete="off" aria-autocomplete="list" aria-expanded={expanded} aria-controls={expanded ? `${id}-list` : undefined} aria-activedescendant={expanded && activeIndex >= 0 ? `${id}-option-${activeIndex}` : undefined} disabled={disabled} maxLength={100} value={value} placeholder={placeholder} onFocus={() => { setOpen(true); setActive(-1); }} onBlur={() => { setOpen(false); setActive(-1); }} onChange={event => { onChange(event.target.value); setOpen(true); setActive(-1); }} onKeyDown={keyDown} />
      {expanded && <ul id={`${id}-list`} role="listbox" aria-label={`${label}: opções`} className={agendaStyles.locationOptions}>
        {matches.map((option, index) => <li key={option.value} id={`${id}-option-${index}`} role="option" aria-selected={index === activeIndex} onMouseDown={event => event.preventDefault()} onClick={() => choose(option)}>{option.label}</li>)}
        {!matches.length && <li role="presentation" className={agendaStyles.locationEmpty}>Nenhum resultado encontrado.</li>}
      </ul>}
    </div>
  </div>;
}

export default function LocationFields({ state, city, onChange }: { state: string; city: string; onChange: (location: { state: string; city: string }) => void }) {
  const selectedState = findBrazilState(state);
  const cities = selectedState?.cities.map(name => ({ value: name, label: name, search: name })) || [];
  return <div className={styles.formRow}>
    <SearchableLocation label="Estado" value={state} options={stateOptions} placeholder="Digite o nome ou a sigla" onChange={nextState => onChange({ state: nextState, city: selectedState?.code && selectedState.code === findBrazilState(nextState)?.code ? city : "" })} />
    <SearchableLocation key={selectedState?.code || "no-state"} label="Cidade" value={city} options={cities} disabled={!selectedState} placeholder={selectedState ? "Digite para buscar a cidade" : "Selecione o estado primeiro"} onChange={nextCity => onChange({ state, city: nextCity })} />
  </div>;
}
