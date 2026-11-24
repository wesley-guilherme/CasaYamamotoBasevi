// Página protegida do painel de usuários e acessos individuais.
import AccountBar from "../../account-bar";
import { requireHost } from "../../account-session";
import UsersManager from "./users-manager";
import styles from "../eventos/eventos.module.css";
// Renderiza a cada requisição para refletir a identidade ou os dados atuais do servidor.
export const dynamic = "force-dynamic";
// Título, descrição e demais metadados usados na apresentação e indexação desta página.
export const metadata = { title: "Usuários e acessos | Casa Yamamoto Basevi", robots: { index: false } };
// Exige um anfitrião autenticado e apresenta o painel de usuários e permissões.
export default async function UsersPage() {
  const user = await requireHost("/admin/usuarios");
  // Renderiza a interface com os dados e as ações preparados acima.
  return <main className={styles.adminPage}>
    {/* Cabeçalho com identidade e ações de navegação desta página. */}
    <header className="site-header album-header"><div className="shell header-inner"><a className="brand-symbol" href="/"><span className="brand-mark"><img src="/logo-symbol.png" alt="Casa Yamamoto Basevi" /></span></a><a className="brand-name" href="/admin/agenda"><span className={`brand-name-text ${styles.adminHeaderTitle}`}>Painel do anfitrião</span></a><div className="header-account"><AccountBar compact /></div></div></header>
    <div className={styles.panelBar}><nav className={styles.panelNav} aria-label="Seções do painel do anfitrião"><a href="/admin/eventos">Eventos</a><a href="/admin/parceiros">Parceiros</a><a href="/admin/agenda">Agenda da casa</a><span className={styles.panelNavActive} aria-current="page">Usuários e acessos</span></nav></div>
    {/* Seção de conteúdo: Usuários e acessos. */}
    <section className={styles.workspace}><div className={styles.intro}><div><span className={styles.eyebrow}>Cuidado com cada acesso</span><h1>Usuários e acessos</h1></div><p>Convide hóspedes pelo cadastro da reserva, acompanhe a ativação e controle os acessos à casa.</p></div><UsersManager owner={user.owner} /></section>
  </main>;
}
