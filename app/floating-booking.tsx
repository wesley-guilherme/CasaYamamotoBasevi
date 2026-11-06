"use client";

import { useEffect, useState } from "react";
import styles from "./floating-booking.module.css";

export default function FloatingBooking() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const contact = document.getElementById("contato");
    if (!contact) return;

    let observer: IntersectionObserver;

    function observeContact() {
      observer?.disconnect();
      const headerHeight = document.querySelector(".site-header")?.getBoundingClientRect().height ?? 0;
      const bounds = contact!.getBoundingClientRect();
      setVisible(bounds.top >= window.innerHeight || bounds.bottom <= headerHeight);
      observer = new IntersectionObserver(
        ([entry]) => setVisible(!entry.isIntersecting),
        { rootMargin: `-${headerHeight}px 0px 0px 0px` },
      );
      observer.observe(contact!);
    }

    observeContact();
    window.addEventListener("resize", observeContact);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", observeContact);
    };
  }, []);

  if (!visible) return null;

  return (
    <aside className={styles.floating} aria-label="Consultar disponibilidade da casa">
      <span className={styles.copy}>
        <small>Sua próxima estadia</small>
        <strong>Casa Yamamoto Basevi</strong>
      </span>
      <a className={styles.action} href="#escolher-datas">
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" focusable="false">
          <rect x="3" y="5" width="18" height="16" rx="3" />
          <path d="M7 3v4M17 3v4M3 11h18m-14 4h3m4 0h3m-10 3h3" strokeLinecap="round" />
        </svg>
        Escolher datas
      </a>
    </aside>
  );
}
