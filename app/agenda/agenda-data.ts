export type AgendaKind = "reservation" | "holiday";
export type AgendaInput = { kind: AgendaKind; title: string; startDate: string; endDate: string; description: string; published: boolean; responsible: string; email: string; city: string; state: string; rentalOrigin: string; rentalAmountCents: number | null };
export type AgendaRecord = AgendaInput & { id: number };
export const defaultRentalOrigins = ["Site", "Airbnb", "Booking"];
export function parseRentalOrigin(value: unknown): string {
  const name = typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
  if (!name || name.length > 80) throw new Error("Informe uma origem de até 80 caracteres.");
  return defaultRentalOrigins.find(origin => origin.toLowerCase() === name.toLowerCase()) || name;
}
export function rentalAmountToCents(value: string): number | null {
  if (!value.trim()) return null;
  if (!/^\d+(?:[.,]\d{1,2})?$/.test(value.trim())) throw new Error("Informe um valor válido com até duas casas decimais.");
  const [whole, fraction = ""] = value.trim().replace(",", ".").split(".");
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  if (!Number.isSafeInteger(cents) || cents > 99999999999) throw new Error("O valor do aluguel é muito alto.");
  return cents;
}
export function formatRentalAmount(cents: number): string { return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100); }
export function summarizeRentalOrigins(items: AgendaRecord[], origins: string[]) {
  const groups = new Map<string, { origin: string; count: number; amountCents: number; missingAmounts: number }>();
  for (const origin of [...defaultRentalOrigins, ...origins]) {
    const key = origin.toLocaleLowerCase("pt-BR");
    if (!groups.has(key)) groups.set(key, { origin, count: 0, amountCents: 0, missingAmounts: 0 });
  }
  for (const item of items.filter(item => item.kind === "reservation")) {
    const origin = item.rentalOrigin || "Sem origem informada";
    const key = origin.toLocaleLowerCase("pt-BR");
    const group = groups.get(key) || { origin, count: 0, amountCents: 0, missingAmounts: 0 };
    group.count++;
    if (item.rentalAmountCents == null) group.missingAmounts++;
    else group.amountCents += item.rentalAmountCents;
    groups.set(key, group);
  }
  return [...groups.values()];
}
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
  const details = { responsible: "", email: "", city: "", state: "", rentalOrigin: "", rentalAmountCents: null as number | null };
  if (p.kind === "reservation") {
    for (const [key, max] of [["responsible", 120], ["email", 254], ["city", 100], ["state", 100]] as const) {
      if (p[key] != null && typeof p[key] !== "string") throw new Error("Dados do responsável inválidos.");
      details[key] = typeof p[key] === "string" ? p[key].trim() : "";
      if (details[key].length > max) throw new Error("Os dados do responsável excedem o tamanho permitido.");
    }
    if (details.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.email)) throw new Error("Informe um e-mail válido.");
    if (p.rentalOrigin != null && p.rentalOrigin !== "") details.rentalOrigin = parseRentalOrigin(p.rentalOrigin);
    if (p.rentalAmountCents != null) {
      if (typeof p.rentalAmountCents !== "number" || !Number.isSafeInteger(p.rentalAmountCents) || p.rentalAmountCents < 0 || p.rentalAmountCents > 99999999999) throw new Error("Informe um valor de aluguel válido.");
      details.rentalAmountCents = p.rentalAmountCents;
    }
  }
  return { kind: p.kind, title, description, startDate: p.startDate, endDate: p.endDate, published: p.kind === "reservation" || p.published === true, ...details };
}
export function overlapsStay(start: string, end: string, period: ReservedPeriod) { return start < period.endDate && end > period.startDate; }
export function isReserved(date: string, periods: ReservedPeriod[]) { return periods.some(p => p.startDate <= date && date < p.endDate); }
export function addDays(date: string, count: number) { const d = new Date(date + "T12:00:00Z"); d.setUTCDate(d.getUTCDate() + count); return d.toISOString().slice(0,10); }
export function formatPeriod(start: string, end: string) {
  const f = new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
  return f.format(new Date(start + "T12:00:00Z")) + " a " + f.format(new Date(end + "T12:00:00Z"));
}
