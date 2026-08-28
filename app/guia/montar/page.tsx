import type { Metadata } from "next";
import { chatGPTSignOutPath, requireChatGPTUser } from "../../chatgpt-auth";
import BuilderForm from "./builder-form";
import styles from "./montar.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Monte seu passeio | Casa Yamamoto Basevi",
  description: "Área exclusiva para hóspedes planejarem sua experiência em Prado.",
};

export default async function BuildGuidePage() {
  const user = await requireChatGPTUser("/guia/montar");
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <a href="/guia">← Voltar ao guia</a>
        <span><strong>Área do hóspede</strong><small>{user.email}</small></span>
        <a href={chatGPTSignOutPath("/guia")}>Sair</a>
      </header>
      <BuilderForm displayName={user.displayName} email={user.email} />
    </main>
  );
}
