"use client";

import { useEffect } from "react";

const returnStateKey = "__casaYamamotoReturnTarget";

export default function NativeBackToSection({ returnHash }: { returnHash: `#${string}` }) {
  useEffect(() => {
    const destination = `/${returnHash}`;
    const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    const currentState = typeof window.history.state === "object" && window.history.state
      ? window.history.state
      : {};

    if (currentState[returnStateKey] !== destination) {
      window.history.replaceState({ ...currentState, [returnStateKey]: "return" }, "", destination);
      window.history.pushState({ ...currentState, [returnStateKey]: destination }, "", currentUrl);
    }

    const handleNativeBack = () => {
      if (window.location.pathname === "/" && window.location.hash === returnHash) {
        window.location.replace(destination);
      }
    };

    window.addEventListener("popstate", handleNativeBack);
    return () => window.removeEventListener("popstate", handleNativeBack);
  }, [returnHash]);

  return null;
}
