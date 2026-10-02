import type { Metadata } from "next";
import { requireGuestAccess } from "../guest-access";
import NativeBackToSection from "../native-back-to-section";
import {
  listPartnerCategories,
  listPublishedPartners,
  type PartnerCategoryRecord,
  type PartnerRecord,
} from "../../db/partners";
import PartnerExplorer from "./partner-explorer";
import styles from "./parceiros.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Parceiros e benefícios | Casa Yamamoto Basevi",
  description: "Benefícios exclusivos para hóspedes autenticados da Casa Yamamoto Basevi.",
};

export default async function PartnersPage() {
  await requireGuestAccess("/parceiros");
  let categories: PartnerCategoryRecord[] = [];
  let partners: PartnerRecord[] = [];
  let loadError: string | null = null;
  try {
    [categories, partners] = await Promise.all([
      listPartnerCategories(),
      listPublishedPartners(),
    ]);
  } catch {
    loadError = "Não foi possível carregar os benefícios agora. Tente novamente em alguns instantes.";
  }

  return (
    <main className={styles.page}>
      <NativeBackToSection returnHash="#parceiros" />
      <a className="skip-link" href="#lista-parceiros">Pular para os parceiros</a>
      <header className="site-header album-header">
        <div className="shell header-inner">
          <a className="brand-symbol" href="/#parceiros" aria-label="Casa Yamamoto Basevi — seção Parceiros">
            <span className="brand-mark" aria-hidden="true"><img src="/logo-symbol.png" alt="" /></span>
          </a>
          <a className="brand-name" href="/parceiros" aria-label="Parceiros e Benefícios">
            <span className={`brand-name-text ${styles.headerTitle}`}><span>Parceiros e Benefícios</span></span>
            <span className="brand-rule" aria-hidden="true"><span /></span>
          </a>
        </div>
      </header>

      <section className={styles.hero}>
        <div>
          <a className="album-breadcrumb" href="/#parceiros">Início</a>
          <span className={styles.eyebrow}>Parceiros Casa Yamamoto</span>
          <h1>Benefícios reservados para a sua estadia.</h1>
          <p>Apresente esta página ao parceiro para consultar a condição disponível.</p>
        </div>
      </section>

      <section className={styles.content} id="lista-parceiros" aria-label="Parceiros e benefícios">
        {loadError ? <div className={styles.message} role="alert">{loadError}</div> : (
          <PartnerExplorer categories={categories} partners={partners} />
        )}
      </section>

      <footer className={styles.footer}>
        <span>Uso exclusivo durante a hospedagem</span>
        <a href="mailto:casayamamotobasevi@gmail.com">Falar com o anfitrião</a>
      </footer>
    </main>
  );
}
