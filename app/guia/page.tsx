// Página pública de apresentação e pesquisa do guia turístico.
import AccountBar from "../account-bar";
import type { Metadata } from "next";
import NativeBackToSection from "../native-back-to-section";
import GuideExplorer from "./guide-explorer";
import styles from "./guia.module.css";

// Título, descrição e demais metadados usados na apresentação e indexação desta página.
export const metadata: Metadata = {
  title: "Guia de Prado e Costa das Baleias | Casa Yamamoto Basevi",
  description:
    "Descubra praias, vilas, passeios e experiências em Prado, Alcobaça e Caravelas com rotas a partir da Casa Yamamoto Basevi.",
};

// Monta a página pública de exploração dos destinos turísticos.
export default function GuidePage() {
  // Renderiza a interface com os dados e as ações preparados acima.
  return (
    <main className={styles.guidePage}>
      <NativeBackToSection returnHash="#experiencias" />
      <a className={styles.skipLink} href="#lugares">Pular para os lugares</a>
      {/* Cabeçalho com identidade e ações de navegação desta página. */}
      <header className="site-header album-header">
        <div className="shell header-inner">
          <a className="brand-symbol" href="/#experiencias" aria-label="Casa Yamamoto Basevi — início">
            <span className="brand-mark" aria-hidden="true"><img src="/logo-symbol.png" alt="" /></span>
          </a>
          <a className="brand-name" href="/guia" aria-label="Guia turístico">
            <span className={`brand-name-text ${styles.guideTitle}`}><span>Guia Turístico</span></span>
            <span className="brand-rule" aria-hidden="true"><span /></span>
          </a>
        <div className="header-account"><AccountBar compact /></div></div>
      </header>

      <GuideExplorer />

    </main>
  );
}
