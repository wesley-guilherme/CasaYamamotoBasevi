"use client";
import { useState } from "react";
import { isReserved, overlapsStay, formatPeriod, addDays, type ReservedPeriod, type AgendaRecord } from "./agenda-data";
import styles from "./agenda.module.css";
export default function HouseCalendar({reservations,holidays,loadError,today}:{reservations:ReservedPeriod[];holidays:AgendaRecord[];loadError?:boolean;today:string}) {
  const [month,setMonth]=useState(()=>today.slice(0,7));
  const [year,m]=month.split("-").map(Number);
  const days=new Date(Date.UTC(year,m,0)).getUTCDate();
  const first=new Date(Date.UTC(year,m-1,1)).getUTCDay();
  function move(n:number) { const date=new Date(Date.UTC(year,m-1+n,1)); setMonth(date.toISOString().slice(0,7)); }
  const label=new Intl.DateTimeFormat("pt-BR",{month:"long",year:"numeric",timeZone:"UTC"}).format(new Date(Date.UTC(year,m-1,1)));
  return <section className={styles.section} id="agenda-da-casa" aria-labelledby="house-agenda-title">
    <p className="eyebrow">Planeje sua estadia</p><h2 id="house-agenda-title">Agenda da casa</h2>
    <p>Confira os dias já reservados antes de consultar sua hospedagem.</p>
    {loadError ? <p className={styles.error} role="alert">Não foi possível consultar a agenda. Confirme a disponibilidade com o anfitrião.</p> : <div className={styles.layout}>
      <div className={styles.calendar}>
        <div className={styles.monthNav}><button type="button" onClick={()=>move(-1)} aria-label="Mês anterior">‹</button><h3 aria-live="polite">{label}</h3><button type="button" onClick={()=>move(1)} aria-label="Próximo mês">›</button></div>
        <div className={styles.legend}><span><i className={styles.redKey}/>Reservado</span><span><i className={styles.freeKey}/>Sem reserva registrada</span></div>
        <table className={styles.grid} aria-label={"Disponibilidade em "+label}><thead><tr>{["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"].map(d=><th key={d} scope="col">{d}</th>)}</tr></thead><tbody>{Array.from({length:Math.ceil((first+days)/7)},(_,week)=><tr key={week}>{Array.from({length:7},(_,day)=>{
          const number=week*7+day-first+1; if(number<1||number>days) return <td key={day}/>;
          const date=month+"-"+String(number).padStart(2,"0"); const booked=isReserved(date,reservations);
          return <td key={day}><span className={[styles.day,booked?styles.reserved:"",date<today?styles.past:"",date===today?styles.today:""].join(" ")} aria-label={number+" de "+label+": "+(booked?"reservado":date<today?"data passada":"sem reserva registrada")}>{number}{booked&&<small>Reservado</small>}</span></td>;
        })}</tr>)}</tbody></table>
        <p className={styles.hint}>O calendário mostra as noites reservadas. O dia da saída pode receber uma nova entrada. Datas sem reserva precisam de confirmação do anfitrião.</p>
      </div>
      <aside className={styles.holidays} aria-labelledby="holiday-title"><span className={styles.eyebrow}>Sugestões do anfitrião</span><h3 id="holiday-title">Feriados prolongados</h3><p>Períodos para planejar sua viagem. Consulte a disponibilidade no calendário ao lado.</p>
        {holidays.length===0?<p className={styles.empty}>Nenhum feriado prolongado publicado por enquanto.</p>:holidays.map(h=>{ const departure=addDays(h.endDate,1); const blocked=reservations.some(r=>overlapsStay(h.startDate,departure,r)); const past=h.startDate<today; return <article key={h.id} className={styles.holiday}><h4>{h.title}</h4><time>{formatPeriod(h.startDate,h.endDate)}</time>{h.description&&<p>{h.description}</p>}<span className={styles.availability}>{blocked?"Há datas reservadas nesse período":"Sem reserva registrada nesse período"}</span>{!blocked&&!past&&<a href={"/?entrada="+h.startDate+"&saida="+departure+"#contato"}>Consultar esse período</a>}</article>;})}
      </aside>
    </div>}
  </section>;
}
