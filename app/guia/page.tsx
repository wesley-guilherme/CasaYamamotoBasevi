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
      <header className={styles.header}>
        <a className={styles.brand} href="/" aria-label="Voltar para Casa Yamamoto Basevi">
          <img src="/logo-symbol.png" alt="" />
          <span><strong>Casa Yamamoto Basevi</strong><small>Guia de Prado</small></span>
        </a>
        <nav className={styles.headerNav} aria-label="Navegação do guia">
          <a href="#lugares">Lugares</a>
          <a href="#planeje">Planeje</a>
          <a className={styles.loginLink} href="/login?returnTo=%2Fguia%2Fmontar">Entrar</a>
        </nav>
      </header>

      <GuideExplorer />

      <footer className={styles.guideFooter}>
        <div><img src="/logo-yamamoto.png" alt="Casa Yamamoto Basevi" /><p>Seu refúgio e seu ponto de partida em Prado.</p></div>
        <div><a href="/">Conhecer a Casa</a><a href="/a-casa">Ver ambientes</a><a href="/login?returnTo=%2Fguia%2Fmontar">Área do hóspede</a></div>
      </footer>
    </main>
  );
}
