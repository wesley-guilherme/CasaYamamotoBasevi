import type { Metadata } from "next";
import { chatGPTSignOutPath, getChatGPTUser } from "../../chatgpt-auth";
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
      <header className={styles.header}>
        <a href="/guia">← Voltar ao guia</a>
        <span><strong>Guia turístico</strong><small>{user?.email ?? "Modo de visualização"}</small></span>
        {user ? <a href={chatGPTSignOutPath("/guia")}>Sair</a> : <a href="/guia">Explorar</a>}
      </header>
      <BuilderForm displayName={displayName} email={email} />
    </main>
  );
}
