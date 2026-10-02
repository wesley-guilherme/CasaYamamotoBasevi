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
        <a className={styles.brand} href="/" aria-label="Voltar ao site da Casa Yamamoto Basevi">
          <img src="/logo-symbol.png" alt="" />
          <span><strong>Casa Yamamoto Basevi</strong><small>Área exclusiva do hóspede</small></span>
        </a>
        <nav aria-label="Navegação da área do hóspede">
          <a href="/">Início</a>
          <a href="/logout?returnTo=%2F">Sair</a>
        </nav>
      </header>

      <section className={styles.hero}>
        <div>
          <span className={styles.eyebrow}>Parceiros Casa Yamamoto</span>
          <h1>Benefícios reservados para a sua estadia.</h1>
          <p>Apresente esta página ao parceiro para consultar a condição disponível.</p>
        </div>
        <div className={styles.emblem} aria-hidden="true">
          <img src="/logo-symbol.png" alt="" />
          <span style={{ width: 1, height: 48, background: "#d9e0e1" }} />
          <img
            src="/benefits-symbol.svg"
            alt=""
            style={{ width: 58, height: 58, objectFit: "contain" }}
          />
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
