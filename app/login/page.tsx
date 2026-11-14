import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { currentAccount } from "../account-session";
import { authConfiguration } from "../auth-provider";
import { destinationFor, safeDestination } from "../auth-policy";
import { chatGPTSignInPath } from "../chatgpt-auth";
import LoginForm from "./login-form";
import styles from "./login.module.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Entrar | Casa Yamamoto Basevi", description: "Acesse sua conta da Casa Yamamoto Basevi.", robots: { index: false, follow: false }, referrer: "no-referrer" };
export default async function LoginPage({ searchParams }: { searchParams: Promise<{ returnTo?: string; mode?: string }> }) {
  const params = await searchParams;
  const user = await currentAccount();
  if (user && params.mode !== "password") redirect(destinationFor(user.role, params.returnTo));
  return <main className={styles.loginPage}>
    <a className={styles.backLink} href="/">← Voltar ao site</a>
    <section className={styles.loginCard}>
      <a className={styles.brand} href="/"><img src="/logo-symbol.png" alt="" /><span><strong>Casa Yamamoto Basevi</strong><small>Um lugar para receber bem</small></span></a>
      <p className={styles.eyebrow}>Seu acesso à casa</p><h1>Que bom ter você aqui.</h1>
      <p className={styles.intro}>Hóspedes e anfitriões entram pelo mesmo lugar. Sua conta abre os espaços preparados para você.</p>
      <LoginForm returnTo={params.returnTo} configured={!!await authConfiguration()} />
      <div className={styles.adminAccess}><a href={chatGPTSignInPath(safeDestination(params.returnTo, "/admin/agenda"))} target="_top">Acesso do administrador com ChatGPT ↗</a></div>
      <small className={styles.privacy}>Sua senha é pessoal. A equipe da casa nunca solicita sua senha.</small>
    </section>
    <aside className={styles.sideNote}><span className={styles.whale} aria-hidden="true">⌁</span><p>O cuidado de receber você começa antes da chegada.</p><small>Casa Yamamoto Basevi · Prado, Bahia</small></aside>
  </main>;
}
