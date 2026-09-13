"use client";

import type { MouseEvent, ReactNode } from "react";

type SectionDepartureLinkProps = {
  children: ReactNode;
  className?: string;
  href: string;
  returnHash: `#${string}`;
};

export default function SectionDepartureLink({ children, className, href, returnHash }: SectionDepartureLinkProps) {
  function rememberSection(event: MouseEvent<HTMLAnchorElement>) {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const currentUrl = `${window.location.pathname}${window.location.search}${returnHash}`;
    window.history.replaceState(window.history.state, "", currentUrl);
  }

  return <a className={className} href={href} onClick={rememberSection}>{children}</a>;
}
