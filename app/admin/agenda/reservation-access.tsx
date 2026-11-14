"use client";
import { useState } from "react";
import styles from "../eventos/eventos.module.css";
export default function ReservationAccess({ id, email, name }: { id: number; email: string; name: string }) {
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  async function invite() {
    if (!window.confirm(`Enviar instruções de acesso para ${email}?`)) return;
    setBusy(true); setStatus("");
    try {
      const response = await fetch("/api/admin/accounts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reservationId: id }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Não foi possível enviar o convite.");
      setStatus(result.message);
    } catch (e) { setStatus(e instanceof Error ? e.message : "Não foi possível enviar."); }
    finally { setBusy(false); }
  }
  return <div><div className={styles.itemActions}><button type="button" disabled={busy || !email || !name} onClick={() => void invite()}>{busy ? "Enviando…" : "Convidar hóspede"}</button><a href="/admin/usuarios">Consultar acessos</a></div>{(!email || !name) && <p className={styles.fieldHint}>Preencha nome e e-mail do responsável para enviar o convite.</p>}{status && <p className={styles.formStatus} role="status">{status}</p>}</div>;
}
