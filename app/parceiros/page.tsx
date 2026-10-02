import type { Metadata } from "next";
import { requireGuestAccess } from "../guest-access";
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
      <header className={styles.header}>
        <a className={`${styles.headerAction} ${styles.headerBack}`} href="/#parceiros" aria-label="Voltar para a seção Parceiros da página principal">
          <span aria-hidden="true">←</span>
          <span className={styles.headerActionLabel}>Voltar</span>
        </a>
        <a className={styles.brand} href="/#parceiros" aria-label="Parceiros e Benefícios — voltar para a página principal">
          <img src="/logo-symbol.png" alt="" />
          <strong>Parceiros e Benefícios</strong>
        </a>
        <a className={`${styles.headerAction} ${styles.headerLogout}`} href="/logout?returnTo=%2F%23parceiros">Sair</a>
      </header>

      <section className={styles.hero}>
        <div>
          <span className={styles.eyebrow}>Parceiros Casa Yamamoto</span>
          <h1>Benefícios reservados para a sua estadia.</h1>
          <p>Apresente esta página ao parceiro para consultar a condição disponível.</p>
        </div>
      </section>

      <section className={styles.content} aria-label="Parceiros e benefícios">
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
