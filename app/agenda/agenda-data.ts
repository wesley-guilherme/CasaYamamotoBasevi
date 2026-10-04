export type AgendaKind = "reservation" | "holiday";
export type AgendaInput = { kind: AgendaKind; title: string; startDate: string; endDate: string; description: string; published: boolean };
export type AgendaRecord = AgendaInput & { id: number };
export type ReservedPeriod = { id: number; startDate: string; endDate: string };
export function validDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value + "T12:00:00Z");
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0,10) === value && value >= "2000-01-01" && value <= "2100-12-31";
}
export function parseAgendaInput(value: unknown): AgendaInput {
  if (!value || typeof value !== "object") throw new Error("Preencha os dados do período.");
  const p = value as Record<string, unknown>;
  if (p.kind !== "reservation" && p.kind !== "holiday") throw new Error("Tipo de período inválido.");
  if (!validDate(p.startDate) || !validDate(p.endDate)) throw new Error("Informe datas válidas.");
  if (p.endDate < p.startDate || (p.kind === "reservation" && p.endDate === p.startDate)) throw new Error(p.kind === "reservation" ? "A saída deve ser depois da entrada." : "O fim não pode ser anterior ao início.");
  const title = typeof p.title === "string" ? p.title.trim() : "";
  const description = typeof p.description === "string" ? p.description.trim() : "";
  if (!title || title.length > 120 || description.length > 500) throw new Error("Informe um nome de até 120 caracteres e uma descrição de até 500.");
  return { kind: p.kind, title, description, startDate: p.startDate, endDate: p.endDate, published: p.kind === "reservation" || p.published === true };
}
export function overlapsStay(start: string, end: string, period: ReservedPeriod) { return start < period.endDate && end > period.startDate; }
export function isReserved(date: string, periods: ReservedPeriod[]) { return periods.some(p => p.startDate <= date && date < p.endDate); }
export function addDays(date: string, count: number) { const d = new Date(date + "T12:00:00Z"); d.setUTCDate(d.getUTCDate() + count); return d.toISOString().slice(0,10); }
export function formatPeriod(start: string, end: string) {
  const f = new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
  return f.format(new Date(start + "T12:00:00Z")) + " a " + f.format(new Date(end + "T12:00:00Z"));
}
