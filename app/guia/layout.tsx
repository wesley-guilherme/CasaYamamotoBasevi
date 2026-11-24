// Estrutura e estilos compartilhados pelas páginas do guia turístico.
import type { ReactNode } from "react";
import InternalPageLayout from "../internal-page-layout";
import styles from "./layout.module.css";

// Aplica a estrutura compartilhada das páginas do guia turístico.
export default function GuideLayout({ children }: { children: ReactNode }) {
  // Renderiza a interface com os dados e as ações preparados acima.
  return (
    <div className={styles.page}>
      <InternalPageLayout>{children}</InternalPageLayout>
    </div>
  );
}
