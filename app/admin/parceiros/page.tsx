import { requireHost } from "../../account-session";
import UsersNav from "../users-nav";
import type { Metadata } from "next";
import {
  ensureDefaultPartnerCategories,
  listAllPartners,
  listPartnerCategories,
  type PartnerCategoryRecord,
  type PartnerRecord,
} from "../../../db/partners";
import NativeBackToSection from "../../native-back-to-section";
import PartnerManager from "./partner-manager";
import baseStyles from "../eventos/eventos.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Parceiros | Painel do anfitrião",
  description: "Gerencie categorias, parceiros e benefícios exclusivos da Casa Yamamoto Basevi.",
};

export default async function AdminPartnersPage({ searchParams }: { searchParams: Promise<{ demo?: string }> }) {
  await searchParams;
  await requireHost("/admin/parceiros");

  let categories: PartnerCategoryRecord[] = [];
  let partners: PartnerRecord[] = [];
  let loadError: string | null = null;
  try {
    await ensureDefaultPartnerCategories();
    [categories, partners] = await Promise.all([listPartnerCategories(true), listAllPartners()]);
  } catch {
    loadError = "Os parceiros não puderam ser carregados agora. Tente novamente em alguns instantes.";
  }

  const demoSuffix = "";
  return (
    <main className={baseStyles.adminPage}>
      <NativeBackToSection returnHash="#parceiros" />
      <header className="site-header album-header">
        <div className="shell header-inner">
          <a className="brand-symbol" href="/#parceiros" aria-label="Casa Yamamoto Basevi — início">
            <span className="brand-mark" aria-hidden="true"><img src="/logo-symbol.png" alt="" /></span>
          </a>
          <a className="brand-name" href={`/admin/parceiros${demoSuffix}`} aria-label="Painel do anfitrião">
            <span className={`brand-name-text ${baseStyles.adminHeaderTitle}`}><span>Painel do anfitrião</span></span>
            <span className="brand-rule" aria-hidden="true"><span /></span>
          </a>
        </div>
      </header>

      <div className={baseStyles.panelBar}>
        <nav className={baseStyles.panelNav} aria-label="Seções do painel do anfitrião">
          <a href={`/admin/eventos${demoSuffix}`}>Eventos</a>
          <span className={baseStyles.panelNavActive} aria-current="page">Parceiros</span>
          <a href={`/admin/agenda${demoSuffix}`}>Agenda da casa</a>
          <UsersNav />
        </nav>
      </div>

      <section className={baseStyles.workspace}>
        <div className={baseStyles.intro}>
          <div>
            <a className="album-breadcrumb" href="/#parceiros">Início</a>
            <span className={baseStyles.eyebrow}>Benefícios exclusivos</span>
            <h1>Parceiros para os hóspedes</h1>
          </div>
          <p>Cadastre categorias, estabelecimentos e condições. Só parceiros publicados aparecem na área protegida do hóspede.</p>
        </div>

        <PartnerManager initialCategories={categories} initialPartners={partners} loadError={loadError} />
      </section>
    </main>
  );
}
