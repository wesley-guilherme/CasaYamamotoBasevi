import styles from "./site-footer.module.css";

export default function SiteFooter() {
  return (
    <footer className={styles.footer} id="rodape">
      <div className={`shell ${styles.grid}`}>
        <div className={styles.brand}>
          <a href="/" aria-label="Casa Yamamoto Basevi — início">
            <img className={styles.logo} src="/logo-yamamoto.png" alt="Casa Yamamoto Basevi" width="260" height="132" loading="lazy" />
          </a>
          <p>Seu refúgio em Prado.</p>
        </div>
        <div className={styles.column}>
          <strong>Navegação</strong>
          <a href="/#casa">A casa</a>
          <a href="/#experiencias">Conheça Prado</a>
          <a href="/#parceiros">Parceiros</a>
          <a href="/admin/eventos?demo=1">Área do anfitrião</a>
        </div>
        <div className={styles.column}>
          <strong>Contato</strong>
          <a href="mailto:casayamamotobasevi@gmail.com">casayamamotobasevi@gmail.com</a>
          <a href="/#agenda-da-casa">Agenda da casa</a>
          <a href="/#contato">Consultar datas</a>
        </div>
      </div>
      <div className={`shell ${styles.bottom}`}>
        <span>© {new Date().getFullYear()} Casa Yamamoto Basevi</span>
        <div className={styles.legalLinks}>
          <a href="/privacidade">Privacidade</a>
          <span aria-hidden="true">·</span>
          <a href="/termos">Termos de Uso</a>
        </div>
        <div className={styles.credit}>
          <span>Desenvolvido por <strong>Wesley Guilherme</strong></span>
          <span aria-hidden="true">–</span>
          <div className={styles.socialLinks}>
            <a href="https://www.linkedin.com/in/wesley-guilherme-b0535462/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn de Wesley Guilherme (abre em nova aba)" title="LinkedIn de Wesley Guilherme">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true" focusable="false"><path d="M20.45 2H3.55C2.69 2 2 2.68 2 3.52v16.96c0 .84.69 1.52 1.55 1.52h16.9c.86 0 1.55-.68 1.55-1.52V3.52c0-.84-.69-1.52-1.55-1.52ZM7.93 18.75H4.98V9.2h2.95v9.55ZM6.45 7.9a1.71 1.71 0 1 1 0-3.42 1.71 1.71 0 0 1 0 3.42Zm12.3 10.85H15.8V14.1c0-1.11-.02-2.54-1.55-2.54-1.55 0-1.79 1.21-1.79 2.46v4.73H9.51V9.2h2.83v1.3h.04c.39-.74 1.36-1.52 2.8-1.52 3 0 3.57 1.97 3.57 4.53v5.24Z" /></svg>
            </a>
            <a href="https://www.instagram.com/wesley.guilherme/" target="_blank" rel="noopener noreferrer" aria-label="Instagram de Wesley Guilherme (abre em nova aba)" title="Instagram de Wesley Guilherme">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" focusable="false"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
