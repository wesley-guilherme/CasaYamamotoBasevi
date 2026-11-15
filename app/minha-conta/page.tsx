import AccountBar from "../account-bar";
import { redirect } from "next/navigation";
import { currentAccount } from "../account-session";
import { accountDatabase } from "../../db/accounts";
import { formatPeriod } from "../agenda/agenda-data";
import styles from "../login/login.module.css";
export const dynamic = "force-dynamic";
export const metadata = { title: "Minha conta | Casa Yamamoto Basevi", robots: { index: false } };
export default async function MyAccount() {
  const user = await currentAccount();
  if (!user) redirect("/login?returnTo=%2Fminha-conta");
  if (user.role === "host") redirect("/admin/agenda");
  const reservations = await (await accountDatabase()).prepare("SELECT a.start_date, a.end_date FROM access_reservations r JOIN house_agenda a ON a.id = r.reservation_id WHERE r.account_id = ? AND lower(trim(a.email)) = ? AND a.kind = 'reservation' AND a.published = 1 ORDER BY a.start_date DESC").bind(user.id, user.email).all<{ start_date: string; end_date: string }>();
  return <main className={styles.loginPage}><AccountBar floating /><section className={styles.loginCard}><a className={styles.brand} href="/"><img src="/logo-symbol.png" alt="" /><span><strong>Casa Yamamoto Basevi</strong><small>Área do hóspede</small></span></a><p className={styles.eyebrow}>Sua próxima pausa</p><h1>Bem-vindo, {user.name.split(" ")[0]}.</h1><p className={styles.intro}>Sua conta está ativa. Os benefícios ficam disponíveis entre a entrada e o dia da saída de uma reserva vinculada.</p><div className={styles.benefits}>{reservations.results.map((item, i) => <span key={i}>{formatPeriod(item.start_date, item.end_date)}</span>)}</div><a className={styles.primaryAction} href="/parceiros">Consultar benefícios da estadia</a><p className={styles.formHint}>Precisa ajustar uma reserva? Fale com o anfitrião.</p><a href="/">Voltar ao site</a></section></main>;
}
