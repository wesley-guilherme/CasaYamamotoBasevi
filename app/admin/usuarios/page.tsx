import { requireHost } from "../../account-session";
import UsersManager from "./users-manager";
import styles from "../eventos/eventos.module.css";
export const dynamic = "force-dynamic";
export const metadata = { title: "Usuários e acessos | Casa Yamamoto Basevi", robots: { index: false } };
export default async function UsersPage() {
  const user = await requireHost("/admin/usuarios");
  return <main className={styles.adminPage}>
    <header className="site-header album-header"><div className="shell header-inner"><a className="brand-symbol" href="/"><span className="brand-mark"><img src="/logo-symbol.png" alt="Casa Yamamoto Basevi" /></span></a><a className="brand-name" href="/admin/agenda"><span className={`brand-name-text ${styles.adminHeaderTitle}`}>Painel do anfitrião</span></a></div></header>
    <div className={styles.panelBar}><nav className={styles.panelNav} aria-label="Seções do painel do anfitrião"><a href="/admin/eventos">Eventos</a><a href="/admin/parceiros">Parceiros</a><a href="/admin/agenda">Agenda da casa</a><span className={styles.panelNavActive} aria-current="page">Usuários e acessos</span></nav></div>
    <section className={styles.workspace}><div className={styles.intro}><div><span className={styles.eyebrow}>Cuidado com cada acesso</span><h1>Usuários e acessos</h1></div><p>Convide hóspedes pelo cadastro da reserva, acompanhe a ativação e controle os acessos à casa.</p></div><UsersManager owner={user.owner} /></section>
  </main>;
}
