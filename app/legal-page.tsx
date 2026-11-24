// Estrutura reutilizável para o conteúdo das páginas legais.
import AccountBar from "./account-bar";
import type { ReactNode } from "react";
import SiteFooter from "./site-footer";
import styles from "./legal.module.css";

// Título e conteúdo de uma seção das páginas legais.
type LegalSection = { id: string; title: string; content: ReactNode };

// Aplica a estrutura comum das páginas legais e renderiza suas seções.
export default function LegalPage({ title, introduction, sections }: { title: string; introduction: string; sections: LegalSection[] }) {
  // Renderiza a interface com os dados e as ações preparados acima.
  return (
    <>
      <a className="skip-link" href="#documento">Pular para o conteúdo</a>
      {/* Cabeçalho com identidade e ações de navegação desta página. */}
      <header className="site-header album-header">
        <div className="shell header-inner">
          <a className="brand-symbol" href="/" aria-label="Casa Yamamoto Basevi — início">
            <span className="brand-mark" aria-hidden="true"><img src="/logo-symbol.png" alt="" /></span>
          </a>
          <a className="brand-name" href="/">
            <span className="brand-name-text"><span>Casa</span> <span>Yamamoto</span> <span>Basevi</span></span>
            <span className="brand-rule" aria-hidden="true"><span /></span>
          </a>
        <div className="header-account"><AccountBar compact /></div></div>
      </header>
      <main className={styles.page} id="documento">
        <div className={`shell ${styles.layout}`}>
          <div className={styles.intro}>
            <a className="album-breadcrumb" href="/#rodape">Voltar ao site</a>
            <p className="eyebrow">Casa Yamamoto Basevi · Informações legais</p>
            <h1>{title}</h1>
            <p className={styles.lead}>{introduction}</p>
            <p className={styles.updated}>Última atualização: <time dateTime="2026-11-05">5 de novembro de 2026</time></p>
          </div>
          {/* Conteúdo complementar e ações de apoio à navegação. */}
          <aside className={styles.sidebar}>
            {/* Links e controles de navegação entre as opções disponíveis. */}
            <nav className={styles.contents} aria-label={`Conteúdo: ${title}`}>
              <strong>Nesta página</strong>
              {sections.map((section, index) => <a key={section.id} href={`#${section.id}`}>{index + 1}. {section.title}</a>)}
            </nav>
            <div className={styles.contact}>
              <strong>Podemos ajudar?</strong>
              <p>Fale com a administração da casa.</p>
              <a href="mailto:casayamamotobasevi@gmail.com">casayamamotobasevi@gmail.com</a>
            </div>
          </aside>
          <article className={styles.article} aria-label={title}>
            {sections.map((section, index) => (
              <section id={section.id} key={section.id}>
                <h2>{index + 1}. {section.title}</h2>
                {section.content}
              </section>
            ))}
          </article>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
