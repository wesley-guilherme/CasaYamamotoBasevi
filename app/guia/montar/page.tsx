// Página de acesso ao gerador de roteiros turísticos personalizados.
import AccountBar from "../../account-bar";
import type { Metadata } from "next";
import { requireAccount } from "../../account-session";
import BuilderForm from "./builder-form";
import styles from "./montar.module.css";

// Renderiza a cada requisição para refletir a identidade ou os dados atuais do servidor.
export const dynamic = "force-dynamic";

// Título, descrição e demais metadados usados na apresentação e indexação desta página.
export const metadata: Metadata = {
  title: "Monte seu passeio | Casa Yamamoto Basevi",
  description: "Área exclusiva para hóspedes planejarem sua experiência em Prado.",
};

// Verifica o acesso e prepara a página de montagem do roteiro personalizado.
export default async function BuildGuidePage() {
  const user = await requireAccount();
  const displayName = user.name;
  const email = user.email;
  // Renderiza a interface com os dados e as ações preparados acima.
  return (
    <main className={styles.page}>
      {/* Cabeçalho com identidade e ações de navegação desta página. */}
      <header className="site-header album-header">
        <div className="shell header-inner">
          <a className="brand-symbol" href="/" aria-label="Casa Yamamoto Basevi — início">
            <span className="brand-mark" aria-hidden="true"><img src="/logo-symbol.png" alt="" /></span>
          </a>
          <a className="brand-name" href="/guia/montar" aria-label="Monte seu roteiro">
            <span className={`brand-name-text ${styles.routeTitle}`}><span>Monte seu roteiro</span></span>
            <span className="brand-rule" aria-hidden="true"><span /></span>
          </a>
        <div className="header-account"><AccountBar compact /></div></div>
      </header>
      <a className={styles.backLink} href="/guia">← Voltar ao guia</a>
      <BuilderForm displayName={displayName} email={email} />
    </main>
  );
}
