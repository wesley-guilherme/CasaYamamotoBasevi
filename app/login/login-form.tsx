"use client";
import { useEffect, useState, type FormEvent } from "react";
import styles from "./login.module.css";
import { passwordError } from "../auth-policy";

export default function LoginForm({ returnTo, configured }: { returnTo?: string; configured: boolean }) {
  const [mode, setMode] = useState<"login" | "recovery" | "password">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [link, setLink] = useState<{ tokenHash: string; type: string } | null>(null);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("mode") === "password") {
      const linkParams = new URLSearchParams(window.location.hash.slice(1));
      const tokenHash = linkParams.get("token_hash");
      const type = linkParams.get("type");
      setMode("password");
      if (tokenHash && (type === "invite" || type === "recovery")) setLink({ tokenHash, type });
      else setStatus("O link não está completo ou expirou. Solicite um novo e-mail de acesso.");
      window.history.replaceState(null, "", "/login?mode=password");
    }
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (mode === "password") { const error = passwordError(password); if (error) { setStatus(error); return; } }
    if (mode === "password" && password !== confirmation) { setStatus("As senhas precisam ser iguais."); return; }
    setBusy(true); setStatus("");
    try {
      const endpoint = mode === "password" ? "password" : mode === "recovery" ? "recovery" : "session";
      const response = await fetch(`/api/auth/${endpoint}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(mode === "password" ? { ...link, password } : { email, password, returnTo }) });
      const result = await response.json() as { error?: string; message?: string; returnTo?: string };
      if (!response.ok) throw new Error(result.error || "Não foi possível concluir. Tente novamente.");
      if (result.returnTo) window.location.assign(result.returnTo);
      else setStatus(result.message || "Confira seu e-mail.");
    } catch (error) { setStatus(error instanceof Error ? error.message : "Não foi possível conectar. Tente novamente."); }
    finally { setBusy(false); }
  }
  return <form className={styles.loginForm} onSubmit={submit}>
    <h2 className={styles.formTitle}>{mode === "password" ? "Crie sua nova senha" : mode === "recovery" ? "Recuperar meu acesso" : "Entre na sua conta"}</h2>
    {mode !== "password" && <><label htmlFor="account-email">E-mail</label><input id="account-email" type="email" autoComplete="email" maxLength={254} required value={email} onChange={e => setEmail(e.target.value)} /></>}
    {mode !== "recovery" && <><label htmlFor="account-password">{mode === "password" ? "Nova senha" : "Senha"}</label><input id="account-password" type="password" autoComplete={mode === "password" ? "new-password" : "current-password"} minLength={mode === "password" ? 8 : undefined} maxLength={mode === "password" ? 12 : 128} required value={password} onChange={e => setPassword(e.target.value)} /></>}
    {mode === "password" && <><p className={styles.formHint}>Use de 8 a 12 caracteres, com pelo menos uma letra maiúscula, um número e um caractere especial.</p><label htmlFor="confirm-password">Confirme a senha</label><input id="confirm-password" type="password" autoComplete="new-password" required minLength={8} maxLength={12} value={confirmation} onChange={e => setConfirmation(e.target.value)} /></>}
    {!configured && <p className={styles.formHint} role="status">O acesso por e-mail está temporariamente indisponível. Tente novamente em instantes.</p>}
    {status && <p className={styles.formError} role="status" aria-live="polite">{status}</p>}
    <button className={styles.primaryAction} disabled={busy || !configured || mode === "password" && !link}>{busy ? "Aguarde…" : mode === "password" ? "Salvar senha e entrar" : mode === "recovery" ? "Enviar instruções" : "Entrar"}</button>
    <button className={styles.secondaryAction} type="button" disabled={busy} onClick={() => { setMode(mode === "login" || mode === "password" ? "recovery" : "login"); setStatus(""); setPassword(""); setConfirmation(""); }}>{mode === "login" || mode === "password" ? "Esqueci minha senha" : "Voltar para o login"}</button>
    <p className={styles.formHint}>Primeiro acesso? Abra o convite enviado ao seu e-mail para confirmar seu endereço e criar sua senha pessoal.</p>
  </form>;
}
