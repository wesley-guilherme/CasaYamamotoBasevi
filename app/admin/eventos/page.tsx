import type { Metadata } from "next";
import { ADMIN_EMAIL, isAdminUser } from "../../admin-access";
import { chatGPTSignOutPath, requireChatGPTUser } from "../../chatgpt-auth";
import { listAllEvents, type EventRecord } from "../../../db/events";
import NativeBackToSection from "../../native-back-to-section";
import EventManager from "./event-manager";
import styles from "./eventos.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Eventos | Painel do anfitrião",
  description: "Gerencie os eventos exibidos aos hóspedes da Casa Yamamoto Basevi.",
};

export default async function AdminEventsPage({
  searchParams,
}: {
  searchParams: Promise<{ demo?: string }>;
}) {
  const demoMode = (await searchParams).demo === "1";
  const user = demoMode ? null : await requireChatGPTUser("/admin/eventos");

  if (!demoMode && !isAdminUser(user)) {
    return (
      <main className={styles.accessPage}>
        <section className={styles.accessCard}>
          <span className={styles.eyebrow}>Área restrita</span>
          <h1>Este login não tem acesso ao painel.</h1>
          <p>
            Entre com a conta <strong>{ADMIN_EMAIL}</strong> para administrar os eventos.
          </p>
          <a className={styles.primaryButton} href={chatGPTSignOutPath("/admin/eventos")}>
            Trocar de conta
          </a>
          <a className={styles.textLink} href="/">Voltar ao site</a>
        </section>
      </main>
    );
  }

  let events: EventRecord[] = [];
  let loadError: string | null = null;
  if (!demoMode) {
    try {
      events = await listAllEvents();
    } catch {
      loadError = "A agenda não pôde ser carregada agora. Tente novamente em alguns instantes.";
    }
  }

  return (
    <main className={styles.adminPage}>
      <NativeBackToSection returnHash="#planeje" />
      <header className="site-header album-header">
        <div className="shell header-inner">
          <a className="brand-symbol" href="/#planeje" aria-label="Casa Yamamoto Basevi — início">
            <span className="brand-mark" aria-hidden="true"><img src="/logo-symbol.png" alt="" /></span>
          </a>
          <a className="brand-name" href="/admin/eventos" aria-label="Painel do anfitrião">
            <span className={`brand-name-text ${styles.adminHeaderTitle}`}><span>Painel do anfitrião</span></span>
            <span className="brand-rule" aria-hidden="true"><span /></span>
          </a>
        </div>
      </header>

      <section className={styles.workspace}>
        <nav className={styles.panelNav} aria-label="Seções do painel do anfitrião">
          <span className={styles.panelNavActive} aria-current="page">Eventos</span>
          <span className={styles.panelNavFuture}>Parceiros <small>em breve</small></span>
          <span className={styles.panelNavFuture}>Agenda da casa <small>em breve</small></span>
          {!demoMode && <a className={styles.signOut} href={chatGPTSignOutPath("/")}>Sair</a>}
        </nav>
        <div className={styles.intro}>
          <div>
            <span className={styles.eyebrow}>Agenda local</span>
            <h1>Eventos para os hóspedes</h1>
          </div>
          <p>
            Cadastre a programação de Prado e publique apenas o que já estiver confirmado.
            Eventos publicados aparecem no site e no aviso das datas da hospedagem.
          </p>
        </div>

        {demoMode && (
          <div className={styles.demoBanner} role="status">
            <strong>Demonstração sem login</strong>
            <span>Você pode testar todos os controles. As alterações desaparecem ao atualizar a página e não são publicadas no site.</span>
          </div>
        )}

        <EventManager initialEvents={events} loadError={loadError} demoMode={demoMode} />
      </section>
    </main>
  );
}
