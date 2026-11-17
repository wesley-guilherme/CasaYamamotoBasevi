import AccountBar from "../account-bar";
import type { Metadata } from "next";
import { requireAccount } from "../account-session";
import NativeBackToSection from "../native-back-to-section";
import SiteFooter from "../site-footer";
import styles from "./parceiros.module.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Parceiros e Benefícios | Casa Yamamoto Basevi", description: "Em breve, novas parcerias e vantagens para os hóspedes da Casa Yamamoto Basevi." };

export default async function PartnersPage() {
  await requireAccount();
  return <>
    <main className={styles.page}>
      <NativeBackToSection returnHash="#parceiros" />
      <header className="site-header album-header"><div className="shell header-inner">
        <a className="brand-symbol" href="/" aria-label="Casa Yamamoto Basevi — início"><span className="brand-mark" aria-hidden="true"><img src="/logo-symbol.png" alt="" /></span></a>
        <a className="brand-name" href="/parceiros"><span className={["brand-name-text",styles.headerTitle].join(" ")}><span>Parceiros e Benefícios</span></span><span className="brand-rule" aria-hidden="true"><span /></span></a>
        <div className="header-account"><AccountBar compact /></div>
      </div></header>
      <section className={styles.comingSoon} aria-labelledby="partnerships-title">
        <div className={styles.comingSoonCopy}>
          <a className="album-breadcrumb" href="/">Início</a>
          <span className={styles.eyebrow}>Boas experiências estão a caminho</span>
          <h1 id="partnerships-title">Mais motivos para aproveitar sua estadia.</h1>
          <p>Ainda não temos parcerias disponíveis, mas em breve vamos compartilhar novidades e vantagens especiais para os nossos hóspedes.</p>
          <p className={styles.comingSoonNote}>Um cuidado a mais para você viver Prado com leveza.</p>
          <a className={styles.backHome} href="/">Voltar ao início <span aria-hidden="true">→</span></a>
        </div>
        <figure className={styles.comingSoonPhoto}><img src="/images/guia/prado/praia_do_centro_coqueiral_1.webp" alt="Coqueiros à beira da praia em Prado, Bahia" /><figcaption>Prado espera por você.</figcaption></figure>
      </section>
    </main>
    <SiteFooter />
  </>;
}
