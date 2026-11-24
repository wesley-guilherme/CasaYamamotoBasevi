// Link reutilizável para abrir a seleção de datas da hospedagem.
"use client";

import type { MouseEvent, ReactNode } from "react";
import { scrollToBooking } from "./booking-scroll";

// Oferece um link que conduz o visitante à seleção de datas da página inicial.
export default function BookingSectionLink({ className, children }: { className?: string; children: ReactNode }) {
  // Trata a navegação do link e aplica o comportamento específico deste componente.
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const target = document.getElementById("escolher-datas");
    if (!target) return;

    event.preventDefault();
    scrollToBooking(target);
  }

  // Renderiza a interface com os dados e as ações preparados acima.
  return <a className={className} href="#escolher-datas" onClick={handleClick}>{children}</a>;
}
