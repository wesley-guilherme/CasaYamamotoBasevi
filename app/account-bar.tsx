"use client";
import { useEffect, useState } from "react";
import styles from "./account-bar.module.css";
type User = { name: string; role: string; destination: string; native: boolean; signOut: string | null };
export default function AccountBar() {
  const [user, setUser] = useState<User | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    const refresh = () => { void fetch("/api/auth/me", { cache: "no-store" }).then(r => r.json()).then((data: { user: User | null }) => { if (active) setUser(data.user); }).catch(() => { if (active) setUser(null); }); };
    refresh();
    const timer = window.setInterval(refresh, 60_000);
    window.addEventListener("focus", refresh);
    return () => { active = false; window.clearInterval(timer); window.removeEventListener("focus", refresh); };
  }, []);
  useEffect(() => {
    if (user) document.documentElement.dataset.accountSignedIn = "true";
    else delete document.documentElement.dataset.accountSignedIn;
    return () => { delete document.documentElement.dataset.accountSignedIn; };
  }, [user]);
  if (!user) return null;
  async function logout() {
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/auth/session", { method: "DELETE" });
      if (!response.ok) throw new Error();
      window.location.assign("/");
    } catch { setError("Não foi possível sair. Tente novamente."); setBusy(false); }
  }
  return <div className={styles.bar} aria-label="Sua conta"><div className={styles.inner}>
    <a className={styles.identity} href={user.destination}><span className={styles.avatar} aria-hidden="true">{user.name.trim().charAt(0).toLocaleUpperCase("pt-BR")}</span><span className={styles.name}>Olá, <strong>{user.name}</strong></span><span className={styles.role}>{user.role === "host" ? "Anfitrião" : "Hóspede"}</span></a>
    {user.native && user.signOut ? <a className={styles.logout} href={user.signOut} target="_top">Sair</a> : <button className={styles.logout} type="button" disabled={busy} onClick={() => void logout()}>{busy ? "Saindo…" : "Sair"}</button>}
    {error && <span role="alert">{error}</span>}
  </div></div>;
}
