// Link que memoriza a seção de origem antes de abrir uma página interna.
"use client";

import type { MouseEvent, ReactNode } from "react";

// Propriedades do link que registra a seção de origem antes da navegação.
type SectionDepartureLinkProps = {
  children: ReactNode;
  className?: string;
  href: string;
  returnHash: `#${string}`;
};

// Registra a seção de origem ao navegar para uma página interna.
export default function SectionDepartureLink({ children, className, href, returnHash }: SectionDepartureLinkProps) {
  // Guarda a seção atual para restaurar a posição no retorno da navegação.
  function rememberSection(event: MouseEvent<HTMLAnchorElement>) {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const currentUrl = `${window.location.pathname}${window.location.search}${returnHash}`;
    window.history.replaceState(window.history.state, "", currentUrl);
  }

  // Renderiza a interface com os dados e as ações preparados acima.
  return <a className={className} href={href} onClick={rememberSection}>{children}</a>;
}
