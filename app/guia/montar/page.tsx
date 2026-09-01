import type { Metadata } from "next";
import { getChatGPTUser } from "../../chatgpt-auth";
import BuilderForm from "./builder-form";
import styles from "./montar.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Monte seu passeio | Casa Yamamoto Basevi",
  description: "Área exclusiva para hóspedes planejarem sua experiência em Prado.",
};

export default async function BuildGuidePage() {
  const user = await getChatGPTUser();
  const displayName = user?.displayName ?? "Visitante";
  const email = user?.email ?? "";
  return (
    <main className={styles.page}>
      <header className="site-header album-header">
        <div className="shell header-inner">
          <a className="brand-symbol" href="/" aria-label="Casa Yamamoto Basevi — início">
            <span className="brand-mark" aria-hidden="true"><img src="/logo-symbol.png" alt="" /></span>
          </a>
          <a className="brand-name" href="/guia/montar" aria-label="Monte seu roteiro">
            <span className={`brand-name-text ${styles.routeTitle}`}><span>Monte seu roteiro</span></span>
            <span className="brand-rule" aria-hidden="true"><span /></span>
          </a>
        </div>
      </header>
      <a className={styles.backLink} href="/guia">← Voltar ao guia</a>
      <BuilderForm displayName={displayName} email={email} />
    </main>
  );
}
