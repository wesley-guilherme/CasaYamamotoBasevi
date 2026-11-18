import AccountBar from "../account-bar";
import type { Metadata } from "next";
import { canSeeBenefits, requireAccount } from "../account-session";
import { listPartnerCategories, listPublishedPartners } from "../../db/partners";
import PartnerExplorer from "./partner-explorer";
import { partnerView } from "./partner-view";
import NativeBackToSection from "../native-back-to-section";
import styles from "./parceiros.module.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Parceiros e Benefícios | Casa Yamamoto Basevi", description: "Conheça os parceiros e as vantagens para os hóspedes da Casa Yamamoto Basevi." };

export default async function PartnersPage() {
  await requireAccount();
  const benefitsAvailable = await canSeeBenefits();
  let content;
  try {
    const [categories, partners] = await Promise.all([listPartnerCategories(), listPublishedPartners()]);
    content = partners.length ? <>
      <section className={styles.hero} aria-labelledby="partnerships-title">
        <a className="album-breadcrumb" href="/">Início</a>
        <span className={styles.eyebrow}>Para aproveitar Prado</span>
        <h1 id="partnerships-title">Parceiros e Benefícios</h1>
        <p>Boas indicações e vantagens especiais para tornar sua estadia ainda melhor.</p>
        {!benefitsAvailable && <p role="status">Conheça nossos parceiros. Os benefícios exclusivos ficam disponíveis durante a sua estadia, com a reserva vinculada à sua conta.</p>}
      </section>
      <section className={styles.content} aria-label="Parceiros cadastrados">
        <PartnerExplorer categories={categories.filter(category => partners.some(partner => partner.categoryId === category.id)).map(({id, name}) => ({id, name}))} partners={partners.map(partner => partnerView(partner, benefitsAvailable))} />
      </section>
    </> : <section className={styles.comingSoon} aria-labelledby="partnerships-title">
      <div className={styles.comingSoonCopy}>
        <a className="album-breadcrumb" href="/">Início</a>
        <span className={styles.eyebrow}>Boas experiências estão a caminho</span>
        <h1 id="partnerships-title">Mais motivos para aproveitar sua estadia.</h1>
        <p>Ainda não temos parcerias disponíveis, mas em breve vamos compartilhar novidades e vantagens especiais para os nossos hóspedes.</p>
        <p className={styles.comingSoonNote}>Um cuidado a mais para você viver Prado com leveza.</p>
      </div>
      <figure className={styles.comingSoonPhoto}><img src="/images/guia/prado/praia_do_centro_coqueiral_1.webp" alt="Coqueiros à beira da praia em Prado, Bahia" /><figcaption>Prado espera por você.</figcaption></figure>
    </section>;
  } catch {
    content = <section className={styles.hero}><h1>Parceiros e Benefícios</h1><p role="alert">Não foi possível carregar os parceiros agora. Atualize a página para tentar novamente.</p></section>;
  }
  return <>
    <main className={styles.page}>
      <NativeBackToSection returnHash="#parceiros" />
      <header className="site-header album-header"><div className="shell header-inner">
        <a className="brand-symbol" href="/" aria-label="Casa Yamamoto Basevi — início"><span className="brand-mark" aria-hidden="true"><img src="/logo-symbol.png" alt="" /></span></a>
        <a className="brand-name" href="/parceiros"><span className={["brand-name-text",styles.headerTitle].join(" ")}><span>Parceiros e Benefícios</span></span><span className="brand-rule" aria-hidden="true"><span /></span></a>
        <div className="header-account"><AccountBar compact /></div>
      </div></header>
      {content}
    </main>
  </>;
}
