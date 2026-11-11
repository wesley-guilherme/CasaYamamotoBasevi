"use client";

import type { MouseEvent, ReactNode } from "react";

export default function BookingSectionLink({ className, children }: { className?: string; children: ReactNode }) {
  function scrollToBooking(event: MouseEvent<HTMLAnchorElement>) {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const target = document.getElementById("escolher-datas");
    if (!target) return;

    event.preventDefault();
    target.focus({ preventScroll: true });
    target.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
    if (window.location.hash !== "#escolher-datas") {
      window.history.pushState(window.history.state, "", "#escolher-datas");
    }
  }

  return <a className={className} href="#escolher-datas" onClick={scrollToBooking}>{children}</a>;
}
