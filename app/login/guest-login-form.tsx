"use client";

import { type FormEvent, useState } from "react";
import styles from "./login.module.css";

export default function GuestLoginForm({ returnTo }: { returnTo: string }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/guest/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const result = await response.json() as { error?: string };

      if (!response.ok) {
        setError(result.error ?? "Não foi possível liberar o acesso.");
        return;
      }

      window.location.assign(returnTo);
    } catch {
      setError("Não foi possível liberar o acesso agora. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className={styles.loginForm} onSubmit={submit}>
      <label htmlFor="guest-password">Senha de acesso</label>
      <input
        id="guest-password"
        name="password"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        required
        autoFocus
      />
      {error && <p className={styles.formError} role="alert">{error}</p>}
      <button className={styles.primaryAction} type="submit" disabled={loading}>
        {loading ? "Validando…" : "Entrar"}
      </button>
    </form>
  );
}
