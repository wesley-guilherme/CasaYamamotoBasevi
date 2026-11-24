// Página de endereço não encontrado com opções de retorno ao site.
import AccountBar from "./account-bar";
import SiteFooter from "./site-footer";
import styles from "./not-found.module.css";

// Apresenta a página de endereço não encontrado e os caminhos de retorno ao site.
export default function NotFound() {
  // Renderiza a interface com os dados e as ações preparados acima.
  return <>
    {/* Cabeçalho com identidade e ações de navegação desta página. */}
    <header className="site-header album-header"><div className="shell header-inner">
      <a className="brand-symbol" href="/" aria-label="Casa Yamamoto Basevi — início"><span className="brand-mark" aria-hidden="true"><img src="/logo-symbol.png" alt="" /></span></a>
      <a className="brand-name" href="/"><span className="brand-name-text">Casa Yamamoto Basevi</span><span className="brand-rule" aria-hidden="true"><span /></span></a>
      <div className="header-account"><AccountBar compact /></div>
    </div></header>
    <main className={styles.page}>
      <span className={styles.code}>404</span>
      <h1>Ops! Página não encontrada</h1>
      <p>Este endereço pode ter mudado ou não estar mais disponível. A sua próxima experiência em Prado começa na nossa página inicial.</p>
      <a href="/">Ir para a página inicial <span aria-hidden="true">→</span></a>
    </main>
    <SiteFooter />
  </>;
}
