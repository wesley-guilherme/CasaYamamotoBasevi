// Restauração da seção de origem ao retornar pela navegação do navegador.
"use client";

import { useEffect } from "react";

// Chave do histórico utilizada para guardar a seção de origem da navegação.
const returnStateKey = "__casaYamamotoReturnTarget";

// Restaura a seção de origem quando o visitante retorna pela navegação do navegador.
export default function NativeBackToSection({ returnHash }: { returnHash: `#${string}` }) {
  // Registra os eventos necessários à interação e os remove ao encerrar o efeito.
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

    // Restaura o destino de retorno quando a navegação volta à âncora registrada.
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
