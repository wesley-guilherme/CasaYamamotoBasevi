// Estrutura comum que adiciona o rodapé às páginas internas.
import type { ReactNode } from "react";
import SiteFooter from "./site-footer";

// Acrescenta o rodapé compartilhado ao conteúdo das páginas internas.
export default function InternalPageLayout({ children }: { children: ReactNode }) {
  // Renderiza a interface com os dados e as ações preparados acima.
  return <>{children}<SiteFooter /></>;
}
