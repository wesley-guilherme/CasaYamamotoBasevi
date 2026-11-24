// Página de autenticação e preparação do modo de acesso solicitado.
import AccountBar from "../account-bar";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { currentAccount } from "../account-session";
import { authConfiguration } from "../auth-provider";
import { destinationFor } from "../auth-policy";
import LoginForm from "./login-form";
import LoginGallery from "./login-gallery";
import styles from "./login.module.css";

// Renderiza a cada requisição para refletir a identidade ou os dados atuais do servidor.
export const dynamic = "force-dynamic";
// Título, descrição e demais metadados usados na apresentação e indexação desta página.
export const metadata: Metadata = { title: "Entrar | Casa Yamamoto Basevi", description: "Acesse sua conta da Casa Yamamoto Basevi.", robots: { index: false, follow: false }, referrer: "no-referrer" };
// Lê o modo de acesso solicitado e prepara a página e o formulário de autenticação.
export default async function LoginPage({ searchParams }: { searchParams: Promise<{ returnTo?: string; mode?: string }> }) {
  const params = await searchParams;
  const user = await currentAccount();
  if (user && params.mode !== "password") redirect(destinationFor(user.role, params.returnTo));
  // Renderiza a interface com os dados e as ações preparados acima.
  return <main className={styles.loginPage}><AccountBar floating />
    <a className={styles.backLink} href="/">← Voltar ao site</a>
    {/* Seção de conteúdo: Que bom ter você aqui. */}
    <section className={styles.loginCard}>
      <a className={styles.brand} href="/"><img src="/logo-symbol.png" alt="" /><span><strong>Casa Yamamoto Basevi</strong><small>Um lugar para receber bem</small></span></a>
      <p className={styles.eyebrow}>Seu acesso à casa</p><h1>Que bom ter você aqui.</h1>
      <p className={styles.intro}>Hóspedes e anfitriões entram pelo mesmo lugar. Sua conta abre os espaços preparados para você.</p>
      <LoginForm returnTo={params.returnTo} configured={!!await authConfiguration()} initialMode={params.mode === "password" ? "password" : "login"} />
      <small className={styles.privacy}>Sua senha é pessoal. A equipe da casa nunca solicita sua senha.</small>
    </section>
    <LoginGallery />
  </main>;
}
