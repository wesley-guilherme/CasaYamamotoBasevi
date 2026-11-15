"use client";
import { createContext, useContext, useEffect, useId, useRef, useState, type ReactNode } from "react";
import styles from "./account-bar.module.css";

type User = { name: string; role: string; destination: string; native: boolean; signOut: string | null };
const AccountContext = createContext<{ user: User | null; loading: boolean }>({ user: null, loading: true });

export function AccountProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    const refresh = async () => {
      try {
        const response = await fetch("/api/auth/me", { cache: "no-store" });
        if (!response.ok) return;
        const data = await response.json() as { user: User | null };
        if (active) setUser(data.user);
      } catch { /* Keep the last confirmed identity during a transient failure. */ }
      finally { if (active) setLoading(false); }
    };
    void refresh();
    const timer = window.setInterval(() => void refresh(), 60_000);
    const onFocus = () => void refresh();
    window.addEventListener("focus", onFocus);
    return () => { active = false; window.clearInterval(timer); window.removeEventListener("focus", onFocus); };
  }, []);
  return <AccountContext.Provider value={{ user, loading }}>{children}</AccountContext.Provider>;
}

export default function AccountBar({ showLogin = false, loginClassName = "", compact = false, floating = false, onNavigate }: { showLogin?: boolean; loginClassName?: string; compact?: boolean; floating?: boolean; onNavigate?: () => void }) {
  const { user, loading } = useContext(AccountContext);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const id = useId();
  useEffect(() => {
    if (!open) return;
    const closeOutside = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false); };
    document.addEventListener("pointerdown", closeOutside);
    return () => document.removeEventListener("pointerdown", closeOutside);
  }, [open]);
  if (loading) return showLogin ? <span className={styles.pending} aria-hidden="true" /> : null;
  if (!user) return showLogin ? <a href="/login?returnTo=%2Fparceiros" className={loginClassName} aria-label="Fazer login" onClick={onNavigate}>Login</a> : null;
  async function logout() {
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/auth/session", { method: "DELETE" });
      if (!response.ok) throw new Error();
      window.location.assign("/");
    } catch { setError("Não foi possível sair. Tente novamente."); setBusy(false); }
  }
  const className = [styles.account, compact ? styles.compact : "", floating ? styles.floating : ""].filter(Boolean).join(" ");
  return <div className={className} data-account-control ref={root} onBlur={event => { if (event.relatedTarget instanceof Node && !event.currentTarget.contains(event.relatedTarget)) setOpen(false); }} onKeyDown={event => { if (event.key === "Escape" && open) { event.stopPropagation(); setOpen(false); trigger.current?.focus(); } }}>
    <button ref={trigger} className={styles.trigger} type="button" aria-label={"Conta de " + user.name} aria-expanded={open} aria-controls={id} title={user.name} onClick={() => setOpen(value => !value)}>
      <span className={styles.avatar} aria-hidden="true">{user.name.trim().charAt(0).toLocaleUpperCase("pt-BR")}</span>
      <span className={styles.name}>{user.name}</span>
      <svg className={styles.chevron} viewBox="0 0 16 16" aria-hidden="true"><path d="m4 6 4 4 4-4" /></svg>
    </button>
    {open && <div className={styles.popover} id={id} role="region" aria-label="Sua conta">
      <div className={styles.details}><strong>{user.name}</strong><span>{user.role === "host" ? "Anfitrião" : "Hóspede"}</span></div>
      <a className={styles.action} href={user.destination} onClick={() => { setOpen(false); onNavigate?.(); }}>{user.role === "host" ? "Painel do anfitrião" : "Minha conta"}<span aria-hidden="true">↗</span></a>
      {user.native && user.signOut ? <a className={[styles.action, styles.logout].join(" ")} href={user.signOut} target="_top">Sair da conta<span aria-hidden="true">→</span></a> : <button className={[styles.action, styles.logout].join(" ")} type="button" disabled={busy} onClick={() => void logout()}>{busy ? "Saindo…" : "Sair da conta"}<span aria-hidden="true">→</span></button>}
      {error && <p className={styles.error} role="alert">{error}</p>}
    </div>}
  </div>;
}
