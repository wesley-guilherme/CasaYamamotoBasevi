// Ação flutuante de reserva cuja visibilidade acompanha as seções da página.
"use client";

import { useEffect, useState } from "react";
import BookingSectionLink from "./booking-section-link";
import styles from "./floating-booking.module.css";

// Mostra a ação flutuante de reserva quando a apresentação passou e o contato está fora da tela.
export default function FloatingBooking() {
  // Estado e referências usados para acompanhar a interação e atualizar este componente.
  const [visible, setVisible] = useState(false);

  // Observa a visibilidade das seções e remove observadores e eventos ao desmontar.
  useEffect(() => {
    const contact = document.getElementById("contato");
    const introduction = document.getElementById("inicio");
    if (!contact || !introduction) return;

    let observer: IntersectionObserver;

    // Recalcula a altura do cabeçalho e observa as seções que controlam a ação flutuante.
    function observeSections() {
      observer?.disconnect();
      const headerHeight = document.querySelector(".site-header")?.getBoundingClientRect().height ?? 0;
      // Exibe a ação de reserva quando a introdução passou e o contato está fora da área visível.
      const updateVisibility = () => {
        const contactBounds = contact!.getBoundingClientRect();
        const introductionPassed = introduction!.getBoundingClientRect().bottom <= headerHeight;
        const contactOutside = contactBounds.top >= window.innerHeight || contactBounds.bottom <= headerHeight;
        setVisible(introductionPassed && contactOutside);
      };
      updateVisibility();
      observer = new IntersectionObserver(
        updateVisibility,
        { rootMargin: `-${headerHeight}px 0px 0px 0px` },
      );
      observer.observe(contact!);
      observer.observe(introduction!);
    }

    observeSections();
    window.addEventListener("resize", observeSections);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", observeSections);
    };
  }, []);

  if (!visible) return null;

  // Renderiza a interface com os dados e as ações preparados acima.
  return (
    <aside className={styles.floating} aria-label="Consultar disponibilidade da casa">
      <span className={styles.copy}>
        <small>Sua próxima estadia</small>
        <strong>Casa Yamamoto Basevi</strong>
      </span>
      <BookingSectionLink className={styles.action}>
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" focusable="false">
          <rect x="3" y="5" width="18" height="16" rx="3" />
          <path d="M7 3v4M17 3v4M3 11h18m-14 4h3m4 0h3m-10 3h3" strokeLinecap="round" />
        </svg>
        Escolher datas
      </BookingSectionLink>
    </aside>
  );
}
