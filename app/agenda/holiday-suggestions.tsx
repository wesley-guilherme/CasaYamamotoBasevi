import { addDays, formatPeriod, overlapsStay, type ReservedPeriod, type AgendaRecord } from "./agenda-data";
import styles from "./agenda.module.css";
export default function HolidaySuggestions({holidays,reservations,loadError,today}:{holidays:AgendaRecord[];reservations:ReservedPeriod[];loadError:boolean;today:string}) {
  return <aside className={styles.holidays} aria-labelledby="holiday-title"><span className={styles.eyebrow}>Sugestões do anfitrião</span><h3 id="holiday-title">Feriados prolongados</h3><p>Ideias para sua viagem. Confira as noites disponíveis no calendário antes de consultar.</p>
    {loadError?<p role="status">As sugestões estão indisponíveis no momento.</p>:holidays.length===0?<p className={styles.empty}>Os próximos feriados prolongados serão publicados aqui pelo anfitrião.</p>:holidays.map(h=>{const end=addDays(h.endDate,1);const blocked=reservations.some(r=>overlapsStay(h.startDate,end,r));return <article key={h.id} className={styles.holiday}><h4>{h.title}</h4><time>{formatPeriod(h.startDate,h.endDate)}</time>{h.description&&<p>{h.description}</p>}<span className={styles.availability}>{blocked?"Há noites reservadas nesse período":"Sem reserva registrada nesse período"}</span>{!blocked&&h.startDate>=today&&<a href={"/?entrada="+h.startDate+"&saida="+end+"#contato"}>Consultar esse período</a>}</article>;})}
  </aside>;
}
