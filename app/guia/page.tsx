import type { Metadata } from "next";
import GuideExplorer from "./guide-explorer";
import styles from "./guia.module.css";

export const metadata: Metadata = {
  title: "Guia de Prado e Costa das Baleias | Casa Yamamoto Basevi",
  description:
    "Descubra praias, vilas, passeios e experiências em Prado, Alcobaça e Caravelas com rotas a partir da Casa Yamamoto Basevi.",
};

export default function GuidePage() {
  return (
    <main className={styles.guidePage}>
      <a className={styles.skipLink} href="#lugares">Pular para os lugares</a>
      <header className="site-header album-header">
        <div className="shell header-inner">
          <a className="brand-symbol" href="/" aria-label="Casa Yamamoto Basevi — início">
            <span className="brand-mark" aria-hidden="true"><img src="/logo-symbol.png" alt="" /></span>
          </a>
          <a className="brand-name" href="/guia" aria-label="Guia turístico">
            <span className="brand-name-text"><span>Guia</span> <span>Turístico</span></span>
            <span className="brand-rule" aria-hidden="true"><span /></span>
          </a>
        </div>
      </header>

      <GuideExplorer />

      <footer className={styles.guideFooter}>
        <div><img src="/logo-yamamoto.png" alt="Casa Yamamoto Basevi" /><p>Seu refúgio e seu ponto de partida em Prado.</p></div>
        <div><a href="/">Conhecer a Casa</a><a href="/a-casa">Ver ambientes</a><a href="/guia/montar">Montar roteiro</a></div>
      </footer>
    </main>
  );
}
