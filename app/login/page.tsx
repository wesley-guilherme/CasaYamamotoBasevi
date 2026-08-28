import type { Metadata } from "next";
import { chatGPTSignInPath, getChatGPTUser } from "../chatgpt-auth";
import styles from "./login.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Entrar no guia | Casa Yamamoto Basevi",
  description: "Acesse a área exclusiva para hóspedes e monte seu passeio em Prado.",
};

function safeReturnTo(value: string | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/guia/montar";
  return value;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string }>;
}) {
  const params = await searchParams;
  const returnTo = safeReturnTo(params.returnTo);
  const user = await getChatGPTUser();

  return (
    <main className={styles.loginPage}>
      <a className={styles.backLink} href="/guia">← Voltar ao guia</a>
      <section className={styles.loginCard}>
        <div className={styles.brand}>
          <img src="/logo-symbol.png" alt="" />
          <span><strong>Casa Yamamoto Basevi</strong><small>Área do hóspede</small></span>
        </div>
        <p className={styles.eyebrow}>Experiência exclusiva</p>
        <h1>Monte um passeio com a cara da sua viagem.</h1>
        <p className={styles.intro}>
          O guia completo é aberto para explorar. O login é solicitado apenas para
          combinar destinos e pedir uma orientação personalizada ao anfitrião.
        </p>
        <div className={styles.benefits}>
          <span><strong>01</strong>Selecione os lugares</span>
          <span><strong>02</strong>Conte o ritmo do grupo</span>
          <span><strong>03</strong>Envie ao anfitrião</span>
        </div>
        {user ? (
          <a className={styles.primaryAction} href={returnTo}>Continuar como {user.displayName}</a>
        ) : (
          <a className={styles.primaryAction} href={chatGPTSignInPath(returnTo)}>Entrar com ChatGPT</a>
        )}
        <small className={styles.privacy}>Seu endereço de e-mail é usado apenas para identificar a solicitação.</small>
      </section>
      <aside className={styles.sideNote}>
        <span className={styles.whale} aria-hidden="true">⌁</span>
        <p>Praias, vilas, marés e caminhos explicados por quem recebe você aqui.</p>
      </aside>
    </main>
  );
}
