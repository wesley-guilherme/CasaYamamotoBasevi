// Página protegida de administração dos eventos e do destaque inicial.
import AccountBar from "../../account-bar";
import { requireHost } from "../../account-session";
import UsersNav from "../users-nav";
import type { Metadata } from "next";
import { listAllEvents, type EventRecord } from "../../../db/events";
import NativeBackToSection from "../../native-back-to-section";
import EventManager from "./event-manager";
import HomeEventCardEditor from "./home-event-card-editor";
import { defaultHomeEventCard } from "../../home-event-card-data";
import { getHomeEventCard } from "../../../db/home-event-card";
import styles from "./eventos.module.css";

// Renderiza a cada requisição para refletir a identidade ou os dados atuais do servidor.
export const dynamic = "force-dynamic";

// Título, descrição e demais metadados usados na apresentação e indexação desta página.
export const metadata: Metadata = {
  title: "Eventos | Painel do anfitrião",
  description: "Gerencie os eventos exibidos aos hóspedes da Casa Yamamoto Basevi.",
};

// Protege o painel de eventos e carrega os eventos e o destaque da página inicial.
export default async function AdminEventsPage({
  searchParams,
}: {
  searchParams: Promise<{ demo?: string }>;
}) {
  await searchParams;
  await requireHost("/admin/eventos");

  let events: EventRecord[] = [];
  let loadError: string | null = null;
  const [eventResult, cardResult] = await Promise.allSettled([listAllEvents(), getHomeEventCard()]);
  if (eventResult.status === "fulfilled") {
    events = eventResult.value;
  } else {
    loadError = "A agenda não pôde ser carregada agora. Tente novamente em alguns instantes.";
  }
  const card = cardResult.status === "fulfilled" ? cardResult.value : defaultHomeEventCard;
  const cardLoadError = cardResult.status === "rejected" ? "O cartão não pôde ser carregado. Recarregue o painel para editar." : null;

  // Renderiza a interface com os dados e as ações preparados acima.
  return (
    <main className={styles.adminPage}>
      <NativeBackToSection returnHash="#planeje" />
      {/* Cabeçalho com identidade e ações de navegação desta página. */}
      <header className="site-header album-header">
        <div className="shell header-inner">
          <a className="brand-symbol" href="/#planeje" aria-label="Casa Yamamoto Basevi — início">
            <span className="brand-mark" aria-hidden="true"><img src="/logo-symbol.png" alt="" /></span>
          </a>
          <a className="brand-name" href="/admin/eventos" aria-label="Painel do anfitrião">
            <span className={`brand-name-text ${styles.adminHeaderTitle}`}><span>Painel do anfitrião</span></span>
            <span className="brand-rule" aria-hidden="true"><span /></span>
          </a>
        <div className="header-account"><AccountBar compact /></div></div>
      </header>

      <div className={styles.panelBar}>
        {/* Links e controles de navegação entre as opções disponíveis. */}
        <nav className={styles.panelNav} aria-label="Seções do painel do anfitrião">
          <span className={styles.panelNavActive} aria-current="page">Eventos</span>
          <a href={`/admin/parceiros`}>Parceiros</a>
          <a href={`/admin/agenda`}>Agenda da casa</a>
          <UsersNav />
        </nav>
      </div>

      {/* Seção de conteúdo: Eventos para os hóspedes. */}
      <section className={styles.workspace}>
        <div className={styles.intro}>
          <div>
            <a className="album-breadcrumb" href="/#planeje">Início</a>
            <span className={styles.eyebrow}>Agenda local</span>
            <h1>Eventos para os hóspedes</h1>
          </div>
          <p>
            Cadastre a programação de Prado e publique apenas o que já estiver confirmado.
            Eventos publicados aparecem no site e no aviso das datas da hospedagem.
          </p>
        </div>



        <HomeEventCardEditor initialCard={card} loadError={cardLoadError} />
        <EventManager initialEvents={events} loadError={loadError} temporaryAccess={false} />
      </section>
    </main>
  );
}
