"use client";
import { useEffect, useState } from "react";
import { isReserved, overlapsStay, type ReservedPeriod } from "./agenda-data";
import styles from "./agenda.module.css";
export default function HouseCalendar({reservations,loadError,today,arrival,departure,onSelect}:{reservations:ReservedPeriod[];loadError?:boolean;today:string;arrival:string;departure:string;onSelect:(date:string)=>void}) {
  const [month,setMonth]=useState(()=>today.slice(0,7));
  useEffect(()=>{if(arrival) setMonth(arrival.slice(0,7));},[arrival]);
  const [year,m]=month.split("-").map(Number);
  const days=new Date(Date.UTC(year,m,0)).getUTCDate();
  const first=new Date(Date.UTC(year,m-1,1)).getUTCDay();
  const choosingDeparture=Boolean(arrival&&!departure);
  function move(n:number){const date=new Date(Date.UTC(year,m-1+n,1));setMonth(date.toISOString().slice(0,7));}
  const label=new Intl.DateTimeFormat("pt-BR",{month:"long",year:"numeric",timeZone:"UTC"}).format(new Date(Date.UTC(year,m-1,1)));
  return <div className={styles.calendar} aria-labelledby="house-calendar-title">
    <h3 id="house-calendar-title" className={styles.calendarTitle}>Escolha suas datas</h3>
    {loadError?<p className={styles.error} role="alert">Não foi possível consultar a agenda. Confirme as datas com o anfitrião.</p>:<>
      <div className={styles.monthNav}><button type="button" disabled={month<=today.slice(0,7)} onClick={()=>move(-1)} aria-label="Mês anterior">‹</button><strong aria-live="polite">{label}</strong><button type="button" disabled={month>="2100-12"} onClick={()=>move(1)} aria-label="Próximo mês">›</button></div>
      <div className={styles.legend}><span><i className={styles.redKey} aria-hidden="true"/>Reservado</span><span><i className={styles.freeKey} aria-hidden="true"/>Sem reserva</span><span><i className={styles.selectedKey} aria-hidden="true"/>Sua seleção</span></div>
      <table className={styles.grid} aria-label={"Disponibilidade em "+label}><thead><tr>{["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"].map(d=><th key={d} scope="col">{d}</th>)}</tr></thead><tbody>{Array.from({length:Math.ceil((first+days)/7)},(_,week)=><tr key={week}>{Array.from({length:7},(_,day)=>{
        const number=week*7+day-first+1;if(number<1||number>days)return <td key={day}/>;
        const date=month+"-"+String(number).padStart(2,"0");const booked=isReserved(date,reservations);const past=date<today;
        const checkout=choosingDeparture&&date>arrival&&!reservations.some(r=>overlapsStay(arrival,date,r));
        const crosses=choosingDeparture&&date>arrival&&!checkout;
        const disabled=past||(booked&&!checkout)||crosses;
        const boundary=date===arrival||date===departure;const selected=Boolean(arrival&&departure&&date>arrival&&date<departure);
        const status=booked?checkout?"reservado, disponível para saída":"reservado":past?"data passada":crosses?"indisponível para esta estadia":"sem reserva registrada";
        return <td key={day}><button type="button" disabled={disabled} onClick={()=>onSelect(date)} className={[styles.day,booked?styles.reserved:"",past?styles.past:"",boundary?styles.boundary:"",selected?styles.selected:"",date===today?styles.today:""].join(" ")} aria-pressed={boundary||selected} aria-label={number+" de "+label+": "+status+(date===arrival?", entrada selecionada":date===departure?", saída selecionada":"")}>{number}</button></td>;
      })}</tr>)}</tbody></table>
      <p className={styles.selectionHint} aria-live="polite">{choosingDeparture?"Agora escolha a data de saída.":arrival&&departure?"Período selecionado. Toque em outro dia para escolher novas datas.":"Selecione a entrada e depois a saída."}</p>
      <p className={styles.hint}>Vermelho indica noites já reservadas. O dia da saída pode receber uma nova entrada. A disponibilidade será confirmada pelo anfitrião.</p>
    </>}
  </div>;
}
