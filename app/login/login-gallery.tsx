"use client";
import { useEffect, useState } from "react";
import styles from "./login.module.css";
const photos = [
  { src:"/images/casa/piscina/02-full.webp", alt:"Piscina e área externa da Casa Yamamoto Basevi", label:"Seu refúgio na Casa" },
  { src:"/images/guia/prado/praia_do_centro_coqueiral_1.webp", alt:"Coqueiros e praia em Prado, Bahia", label:"A leveza de Prado" },
  { src:"/images/casa/area-gourmet/01-full.webp", alt:"Área gourmet da Casa Yamamoto Basevi", label:"Momentos para compartilhar" },
  { src:"/images/guia/prado/centro_historico_beco_das_garrafas_1.webp", alt:"Centro histórico e Beco das Garrafas em Prado", label:"O encanto de cada passeio" },
];
export default function LoginGallery() {
  const [active,setActive]=useState(0);
  const [playing,setPlaying]=useState(false);
  useEffect(()=>{const motion=window.matchMedia("(prefers-reduced-motion: reduce)");const update=()=>setPlaying(!motion.matches);update();motion.addEventListener("change",update);return()=>motion.removeEventListener("change",update);},[]);
  useEffect(()=>{if(!playing)return;const timer=window.setInterval(()=>{if(!document.hidden)setActive(current=>(current+1)%photos.length);},5500);return()=>window.clearInterval(timer);},[playing]);
  return <aside className={styles.sideNote} aria-label="Imagens da Casa e de Prado">
    <div className={styles.slideshow} aria-roledescription="carrossel" aria-label="Casa Yamamoto Basevi e Prado">
      {photos.map((photo,index)=><img key={photo.src} className={[styles.slide,index===active?styles.activeSlide:""].join(" ")} src={photo.src} alt={photo.alt} aria-hidden={index!==active} loading={index===0?"eager":"lazy"} fetchPriority={index===0?"high":"auto"} />)}
      <div className={styles.photoShade} aria-hidden="true" />
      <button className={styles.playPause} type="button" aria-label={playing?"Pausar carrossel de fotos":"Reproduzir carrossel de fotos"} onClick={()=>setPlaying(value=>!value)}>{playing?"Pausar fotos":"Reproduzir fotos"}</button>
      <div className={styles.slideCaption}><span>{photos[active].label}</span><div className={styles.slideDots}>{photos.map((photo,index)=><button key={photo.src} className={index===active?styles.activeDot:""} type="button" aria-label={"Ver foto: "+photo.alt} aria-pressed={index===active} onClick={()=>setActive(index)} />)}</div></div>
    </div>
    <div className={styles.galleryQuote}><p>O cuidado de receber você começa antes da chegada.</p><small>Casa Yamamoto Basevi · Prado, Bahia</small></div>
  </aside>;
}
