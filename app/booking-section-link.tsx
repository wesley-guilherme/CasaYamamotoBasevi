"use client";

import type { MouseEvent, ReactNode } from "react";
import { scrollToBooking } from "./booking-scroll";

export default function BookingSectionLink({ className, children }: { className?: string; children: ReactNode }) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const target = document.getElementById("escolher-datas");
    if (!target) return;

    event.preventDefault();
    scrollToBooking(target);
  }

  return <a className={className} href="#escolher-datas" onClick={handleClick}>{children}</a>;
}
