// Página protegida que carrega os dados do painel de agenda.
import AccountBar from "../../account-bar";
import { requireHost } from "../../account-session";
import UsersNav from "../users-nav";
import type { Metadata } from "next";
import { listAgenda, listRentalOrigins } from "../../../db/agenda";
import { houseToday, type AgendaRecord } from "../../agenda/agenda-data";
import AgendaManager from "./agenda-manager";
import styles from "../eventos/eventos.module.css";
// Renderiza a cada requisição para refletir a identidade ou os dados atuais do servidor.
export const dynamic="force-dynamic";
// Título, descrição e demais metadados usados na apresentação e indexação desta página.
export const metadata:Metadata={title:"Agenda da casa | Painel do anfitrião",description:"Gerencie reservas e sugestões de feriados prolongados da Casa Yamamoto Basevi."};
// Exige acesso de anfitrião e carrega reservas, feriados e origens para o painel.
export default async function AgendaPage({searchParams}:{searchParams:Promise<{demo?:string}>}) {
  await searchParams; await requireHost("/admin/agenda");
  let items:AgendaRecord[]=[]; let origins:string[]=[]; let error:string|null=null; try {[items,origins]=await Promise.all([listAgenda(),listRentalOrigins()]);}catch(e){console.error("Agenda load failed",e);error="A agenda não pôde ser carregada. Recarregue a página para tentar novamente.";}
  const suffix="";
  // Renderiza a interface com os dados e as ações preparados acima.
  return <main className={styles.adminPage}><header className="site-header album-header"><div className="shell header-inner"><a className="brand-symbol" href="/#agenda-da-casa" aria-label="Voltar ao site"><span className="brand-mark"><img src="/logo-symbol.png" alt="Casa Yamamoto Basevi"/></span></a><a className="brand-name" href={"/admin/agenda"+suffix}><span className={"brand-name-text "+styles.adminHeaderTitle}>Painel do anfitrião</span><span className="brand-rule" aria-hidden="true"><span/></span></a><div className="header-account"><AccountBar compact /></div></div></header>
    <div className={styles.panelBar}><nav className={styles.panelNav} aria-label="Seções do painel do anfitrião"><a href={"/admin/eventos"+suffix}>Eventos</a><a href={"/admin/parceiros"+suffix}>Parceiros</a><span className={styles.panelNavActive} aria-current="page">Agenda da casa</span><UsersNav /></nav></div>
    {/* Seção de conteúdo: Agenda da casa. */}
    <section className={styles.workspace}><div className={styles.intro}><div><a className="album-breadcrumb" href="/#agenda-da-casa">Início</a><span className={styles.eyebrow}>Disponibilidade e aluguéis</span><h1>Agenda da casa</h1></div><p>Cadastre reservas com os dados do responsável e acompanhe os valores dos aluguéis por origem. Publique também sugestões de feriados prolongados.</p></div><AgendaManager initial={items} initialOrigins={origins} initialToday={houseToday()} loadError={error}/><a className={styles.textLink} href="/#agenda-da-casa">Ver agenda no site</a></section>
  </main>;
}
