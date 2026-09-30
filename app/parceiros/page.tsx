import type { Metadata } from "next";
import { chatGPTSignOutPath, requireChatGPTUser } from "../chatgpt-auth";
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
  const user = await requireChatGPTUser("/parceiros");
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
          <a href={chatGPTSignOutPath("/")}>Sair</a>
        </nav>
      </header>

      <section className={styles.hero}>
        <div>
          <span className={styles.eyebrow}>Parceiros Casa Yamamoto</span>
          <h1>Benefícios reservados para a sua estadia.</h1>
          <p>Olá, {user.displayName}. Apresente esta página ao parceiro para consultar a condição disponível.</p>
        </div>
        <div className={styles.emblem} aria-hidden="true">
          <img src="/logo-symbol.png" alt="" />
          <span>+</span>
          <svg viewBox="0 0 64 64">
            <path d="M19 28h26v24H19z" />
            <path d="M15 20h34v10H15zM32 20v32M22 20c-5-7 3-12 10 0M42 20c5-7-3-12-10 0" />
          </svg>
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
