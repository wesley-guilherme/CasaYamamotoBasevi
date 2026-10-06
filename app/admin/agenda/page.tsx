import type { Metadata } from "next";
import { isAdminUser, ADMIN_EMAIL } from "../../admin-access";
import { requireChatGPTUser, chatGPTSignOutPath } from "../../chatgpt-auth";
import { isTemporaryAdminRequest } from "../../temporary-admin";
import { listAgenda, listRentalOrigins } from "../../../db/agenda";
import type { AgendaRecord } from "../../agenda/agenda-data";
import TemporaryAccess from "../eventos/temporary-access";
import AgendaManager from "./agenda-manager";
import styles from "../eventos/eventos.module.css";
export const dynamic="force-dynamic";
export const metadata:Metadata={title:"Agenda da casa | Painel do anfitrião",description:"Gerencie reservas e sugestões de feriados prolongados da Casa Yamamoto Basevi."};
export default async function AgendaPage({searchParams}:{searchParams:Promise<{demo?:string}>}) {
  const demo=(await searchParams).demo==="1"; const temporary=demo&&await isTemporaryAdminRequest();
  if(demo&&!temporary) return <TemporaryAccess returnTo="/admin/agenda?demo=1"/>;
  const user=demo?null:await requireChatGPTUser("/admin/agenda");
  if(!demo&&!isAdminUser(user)) return <main className={styles.accessPage}><section className={styles.accessCard}><h1>Área restrita ao anfitrião</h1><p>Entre com a conta {ADMIN_EMAIL} para administrar a agenda.</p><a className={styles.primaryButton} href={chatGPTSignOutPath("/admin/agenda")}>Trocar de conta</a><a className={styles.textLink} href="/">Voltar ao site</a></section></main>;
  let items:AgendaRecord[]=[]; let origins:string[]=[]; let error:string|null=null; try {[items,origins]=await Promise.all([listAgenda(),listRentalOrigins()]);}catch(e){console.error("Agenda load failed",e);error="A agenda não pôde ser carregada. Recarregue a página para tentar novamente.";}
  const suffix=demo?"?demo=1":"";
  return <main className={styles.adminPage}><header className="site-header album-header"><div className="shell header-inner"><a className="brand-symbol" href="/#agenda-da-casa" aria-label="Voltar ao site"><span className="brand-mark"><img src="/logo-symbol.png" alt="Casa Yamamoto Basevi"/></span></a><a className="brand-name" href={"/admin/agenda"+suffix}><span className={"brand-name-text "+styles.adminHeaderTitle}>Painel do anfitrião</span><span className="brand-rule" aria-hidden="true"><span/></span></a></div></header>
    <div className={styles.panelBar}><nav className={styles.panelNav} aria-label="Seções do painel do anfitrião"><a href={"/admin/eventos"+suffix}>Eventos</a><a href={"/admin/parceiros"+suffix}>Parceiros</a><span className={styles.panelNavActive} aria-current="page">Agenda da casa</span>{!demo&&<a className={styles.signOut} href={chatGPTSignOutPath("/")}>Sair</a>}</nav></div>
    <section className={styles.workspace}><div className={styles.intro}><div><a className="album-breadcrumb" href="/#agenda-da-casa">Início</a><span className={styles.eyebrow}>Disponibilidade e aluguéis</span><h1>Agenda da casa</h1></div><p>Cadastre reservas com os dados do responsável e acompanhe os valores dos aluguéis por origem. Publique também sugestões de feriados prolongados.</p></div>{temporary&&<div className={styles.demoBanner}>Acesso temporário ativo. As alterações são salvas no site.</div>}<AgendaManager initial={items} initialOrigins={origins} loadError={error}/><a className={styles.textLink} href="/#agenda-da-casa">Ver agenda no site</a></section>
  </main>;
}
