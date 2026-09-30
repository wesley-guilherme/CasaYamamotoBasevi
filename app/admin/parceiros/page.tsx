import type { Metadata } from "next";
import { ADMIN_EMAIL, isAdminUser } from "../../admin-access";
import { chatGPTSignOutPath, requireChatGPTUser } from "../../chatgpt-auth";
import { isTemporaryAdminRequest } from "../../temporary-admin";
import {
  ensureDefaultPartnerCategories,
  listAllPartners,
  listPartnerCategories,
  type PartnerCategoryRecord,
  type PartnerRecord,
} from "../../../db/partners";
import NativeBackToSection from "../../native-back-to-section";
import TemporaryAccess from "../eventos/temporary-access";
import PartnerManager from "./partner-manager";
import baseStyles from "../eventos/eventos.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Parceiros | Painel do anfitrião",
  description: "Gerencie categorias, parceiros e benefícios exclusivos da Casa Yamamoto Basevi.",
};

export default async function AdminPartnersPage({ searchParams }: { searchParams: Promise<{ demo?: string }> }) {
  const demoMode = (await searchParams).demo === "1";
  const temporaryAccess = demoMode && await isTemporaryAdminRequest();
  if (demoMode && !temporaryAccess) return <TemporaryAccess />;
  const user = demoMode ? null : await requireChatGPTUser("/admin/parceiros");

  if (!demoMode && !isAdminUser(user)) {
    return (
      <main className={baseStyles.accessPage}>
        <section className={baseStyles.accessCard}>
          <span className={baseStyles.eyebrow}>Área restrita</span>
          <h1>Este login não tem acesso ao painel.</h1>
          <p>Entre com a conta <strong>{ADMIN_EMAIL}</strong> para administrar os parceiros.</p>
          <a className={baseStyles.primaryButton} href={chatGPTSignOutPath("/admin/parceiros")}>Trocar de conta</a>
          <a className={baseStyles.textLink} href="/">Voltar ao site</a>
        </section>
      </main>
    );
  }

  let categories: PartnerCategoryRecord[] = [];
  let partners: PartnerRecord[] = [];
  let loadError: string | null = null;
  try {
    await ensureDefaultPartnerCategories();
    [categories, partners] = await Promise.all([listPartnerCategories(true), listAllPartners()]);
  } catch {
    loadError = "Os parceiros não puderam ser carregados agora. Tente novamente em alguns instantes.";
  }

  const demoSuffix = demoMode ? "?demo=1" : "";
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
          <span className={baseStyles.panelNavFuture}>Agenda da casa <small>em breve</small></span>
          {!demoMode && <a className={baseStyles.signOut} href={chatGPTSignOutPath("/")}>Sair</a>}
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
        {temporaryAccess && <div className={baseStyles.demoBanner} role="status"><strong>Acesso temporário ativo</strong><span>As alterações são salvas no site e ficam visíveis apenas para hóspedes autenticados.</span></div>}
        <PartnerManager initialCategories={categories} initialPartners={partners} loadError={loadError} />
      </section>
    </main>
  );
}
