"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import styles from "./login.module.css";
import { normalizeEmail, passwordError, passwordRequirements } from "../auth-policy";

export default function LoginForm({ returnTo, configured, initialMode = "login" }: { returnTo?: string; configured: boolean; initialMode?: "login" | "password" }) {
  const [mode, setMode] = useState<"login" | "recovery" | "password">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [link, setLink] = useState<{ tokenHash: string; type: string } | null>(null);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [passwordEditable, setPasswordEditable] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmationTouched, setConfirmationTouched] = useState(false);
  const passwordInput = useRef<HTMLInputElement>(null);
  const confirmationInput = useRef<HTMLInputElement>(null);
  function clearPasswords() {
    setPassword(""); setConfirmation(""); setPasswordEditable(false);
    setPasswordTouched(false); setConfirmationTouched(false);
    if (passwordInput.current) passwordInput.current.value = "";
    if (confirmationInput.current) confirmationInput.current.value = "";
  }
  useEffect(() => {
    clearPasswords();
    const onPageShow = (event: PageTransitionEvent) => { if (event.persisted) clearPasswords(); };
    window.addEventListener("pageshow", onPageShow);
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
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (mode !== "password") {
      try { normalizeEmail(email); } catch { setStatus("Informe um e-mail válido."); return; }
      if (mode === "login" && !password) { setStatus("Informe sua senha."); passwordInput.current?.focus(); return; }
    }
    if (mode === "password") { setPasswordTouched(true); setConfirmationTouched(true); const error = passwordError(password); if (error) { setStatus(error); passwordInput.current?.focus(); return; } }
    if (mode === "password" && password !== confirmation) { setStatus("As senhas precisam ser iguais."); confirmationInput.current?.focus(); return; }
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
  const invalidPassword = mode === "password" && passwordTouched && !!passwordError(password);
  const invalidConfirmation = mode === "password" && confirmationTouched && confirmation !== password;
  return <form className={styles.loginForm} onSubmit={submit} autoComplete="off" noValidate>
    <h2 className={styles.formTitle}>{mode === "password" ? "Crie sua nova senha" : mode === "recovery" ? "Recuperar meu acesso" : "Entre na sua conta"}</h2>
    {mode !== "password" && <><label htmlFor="account-email">E-mail</label><input id="account-email" type="email" autoComplete="email" maxLength={254} required value={email} onChange={e => setEmail(e.target.value)} /></>}
    {mode !== "recovery" && <><label htmlFor="account-password">{mode === "password" ? "Nova senha" : "Senha"}</label><input ref={passwordInput} id="account-password" type="password" autoComplete={mode === "password" ? "new-password" : "off"} readOnly={mode === "login" && !passwordEditable} onPointerDown={() => setPasswordEditable(true)} onFocus={() => setPasswordEditable(true)} onBlur={() => setPasswordTouched(true)} maxLength={128} required aria-invalid={invalidPassword} aria-describedby={mode === "password" ? "password-requirements password-feedback" : undefined} value={password} onChange={e => { if (mode === "login" && !passwordEditable) { e.target.value = ""; return; } setPassword(e.target.value); setStatus(""); }} /></>}
    {mode === "password" && <>
      <div className={styles.requirements} id="password-requirements"><p>Sua senha precisa ter:</p><ul>{passwordRequirements(password).map(rule => <li key={rule.label} data-met={rule.met}><span aria-hidden="true">{rule.met ? "✓" : "○"}</span><span>{rule.label}<span className={styles.visuallyHidden}>{rule.met ? " — atendido" : " — pendente"}</span></span></li>)}</ul></div>
      <p id="password-feedback" className={invalidPassword ? styles.formError : styles.formHint} aria-live="polite">{password ? passwordError(password) || "Sua senha atende a todos os requisitos." : invalidPassword ? "Preencha a nova senha seguindo os requisitos acima." : ""}</p>
      <label htmlFor="confirm-password">Confirme a senha</label><input ref={confirmationInput} id="confirm-password" type="password" autoComplete="new-password" required maxLength={128} aria-invalid={invalidConfirmation} aria-describedby="confirmation-feedback" value={confirmation} onBlur={() => setConfirmationTouched(true)} onChange={e => { setConfirmation(e.target.value); setStatus(""); }} />
      <p id="confirmation-feedback" className={styles.formError} aria-live="polite">{invalidConfirmation ? "As senhas precisam ser iguais." : ""}</p>
    </>}
    {!configured && <p className={styles.formHint} role="status">O acesso por e-mail está temporariamente indisponível. Tente novamente em instantes.</p>}
    {status && <p className={styles.formError} role="status" aria-live="polite">{status}</p>}
    <button className={styles.primaryAction} disabled={busy || !configured || mode === "password" && !link}>{busy ? "Aguarde…" : mode === "password" ? "Salvar senha e entrar" : mode === "recovery" ? "Enviar instruções" : "Entrar"}</button>
    <button className={styles.secondaryAction} type="button" disabled={busy} onClick={() => { setMode(mode === "login" || mode === "password" ? "recovery" : "login"); setStatus(""); clearPasswords(); }}>{mode === "login" || mode === "password" ? "Esqueci minha senha" : "Voltar para o login"}</button>
    <p className={styles.formHint}>Primeiro acesso? Abra o convite enviado ao seu e-mail para confirmar seu endereço e criar sua senha pessoal.</p>
  </form>;
}
