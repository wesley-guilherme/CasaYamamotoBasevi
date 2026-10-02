import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isGuestRequest, safeReturnTo } from "../guest-access";
import GuestLoginForm from "./guest-login-form";
import styles from "./login.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Área do hóspede | Casa Yamamoto Basevi",
  description: "Acesse os parceiros e benefícios exclusivos da Casa Yamamoto Basevi.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string }>;
}) {
  const params = await searchParams;
  const returnTo = safeReturnTo(params.returnTo);
  if (await isGuestRequest()) redirect(returnTo);

  return (
    <main className={styles.loginPage}>
      <a className={styles.backLink} href="/#parceiros">← Voltar ao site</a>
      <section className={styles.loginCard}>
        <div className={styles.brand}>
          <img src="/logo-symbol.png" alt="" />
          <span><strong>Casa Yamamoto Basevi</strong><small>Área do hóspede</small></span>
        </div>
        <p className={styles.eyebrow}>Acesso exclusivo</p>
        <h1>Parceiros e benefícios para a sua estadia.</h1>
        <p className={styles.intro}>
          Digite a senha fornecida pelo anfitrião para consultar as indicações e
          vantagens reservadas aos hóspedes da Casa Yamamoto.
        </p>
        <div className={styles.benefits}>
          <span><strong>01</strong>Indicações selecionadas</span>
          <span><strong>02</strong>Vantagens exclusivas</span>
          <span><strong>03</strong>Uso durante a hospedagem</span>
        </div>
        <GuestLoginForm returnTo={returnTo} />
        <small className={styles.privacy}>A senha é validada com segurança para liberar esta área.</small>
      </section>
      <aside className={styles.sideNote}>
        <span className={styles.whale} aria-hidden="true">⌁</span>
        <p>Boas escolhas locais para aproveitar Prado com a confiança de quem recebe você aqui.</p>
      </aside>
    </main>
  );
}
