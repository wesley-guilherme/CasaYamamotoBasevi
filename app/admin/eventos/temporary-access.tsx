"use client";

import { FormEvent, useState } from "react";
import styles from "./eventos.module.css";

export default function TemporaryAccess() {
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      const response = await fetch("/api/admin/temporary-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Não foi possível entrar.");
      window.location.assign("/admin/eventos?demo=1");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Não foi possível entrar.");
      setLoading(false);
    }
  }

  return (
    <main className={styles.accessPage}>
      <form className={styles.accessCard} onSubmit={submit}>
        <span className={styles.eyebrow}>Acesso temporário</span>
        <h1>Painel do anfitrião</h1>
        <p>Use a senha temporária para cadastrar eventos e folders antes da ativação do acesso por e-mail.</p>
        <label className={styles.accessLabel}>
          Senha temporária
          <input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        {status && <p className={styles.formStatus} role="alert">{status}</p>}
        <button className={styles.primaryButton} type="submit" disabled={loading}>
          {loading ? "Entrando..." : "Entrar no painel"}
        </button>
        <a className={styles.textLink} href="/#planeje">Voltar ao site</a>
      </form>
    </main>
  );
}
