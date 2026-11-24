// Modelos e regras de validação, períodos, valores e resumos da agenda da casa.
// Tipos de período aceitos na agenda: reserva ou feriado.
export type AgendaKind = "reservation" | "holiday";
// Campos de entrada para cadastrar ou atualizar uma reserva ou feriado.
export type AgendaInput = { kind: AgendaKind; title: string; startDate: string; endDate: string; description: string; published: boolean; responsible: string; email: string; city: string; state: string; rentalOrigin: string; rentalAmountCents: number | null };
// Dados de um período da agenda acompanhados do identificador persistido.
export type AgendaRecord = AgendaInput & { id: number };
// Obtém a data corrente no fuso America/Bahia no formato ano-mês-dia.
export function houseToday(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Bahia", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}
// Separa reservas atuais e encerradas e aplica a ordenação de cada grupo.
export function partitionReservations(items: AgendaRecord[], today: string) {
  const reservations = items.filter(item => item.kind === "reservation");
  return {
    current: reservations.filter(item => item.endDate >= today).sort((a, b) => a.startDate.localeCompare(b.startDate) || a.id - b.id),
    history: reservations.filter(item => item.endDate < today).sort((a, b) => b.endDate.localeCompare(a.endDate) || b.startDate.localeCompare(a.startDate) || b.id - a.id),
  };
}
// Origens de reserva disponíveis mesmo sem cadastros adicionais no banco.
export const defaultRentalOrigins = ["Site", "Airbnb", "Booking"];
// Valida o tamanho da origem e padroniza os nomes das opções predefinidas.
export function parseRentalOrigin(value: unknown): string {
  const name = typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
  if (!name || name.length > 80) throw new Error("Informe uma origem de até 80 caracteres.");
  return defaultRentalOrigins.find(origin => origin.toLowerCase() === name.toLowerCase()) || name;
}
// Converte o valor digitado em centavos inteiros, validando formato e limite.
export function rentalAmountToCents(value: string): number | null {
  const amount = value.trim();
  if (!amount) return null;
  const brazilian = /^(?:\d+|\d{1,3}(?:\.\d{3})+)(?:,\d{1,2})?$/.test(amount);
  if (!brazilian && !/^\d+\.\d{1,2}$/.test(amount)) throw new Error("Informe um valor válido com até duas casas decimais.");
  const [whole, fraction = ""] = (brazilian ? amount.replaceAll(".", "").replace(",", ".") : amount).split(".");
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  if (!Number.isSafeInteger(cents) || cents > 99999999999) throw new Error("O valor do aluguel é muito alto.");
  return cents;
}
// Aplica a máscara brasileira de moeda aos dígitos informados.
export function formatRentalAmountInput(value: string): string {
  const input = value.trim().replace(/^R\$\s*/, "");
  if (!input) return "";
  if (!/^[\d.,\s]+$/.test(input)) throw new Error("Digite apenas números para informar o valor do aluguel.");
  const digits = input.replace(/\D/g, "").replace(/^0+(?=\d)/, "");
  if (!digits) return "";
  if (digits.length > 11) throw new Error("O valor do aluguel é muito alto.");
  const padded = digits.padStart(3, "0");
  const whole = padded.slice(0, -2).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${whole},${padded.slice(-2)}`;
}
// Formata centavos como um valor em reais no padrão brasileiro.
export function formatRentalAmount(cents: number): string { return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100); }
// Limites mensais opcionais do resumo de aluguéis por origem.
export type RentalSummaryPeriod = { startMonth?: string; endMonth?: string };
// Valida os limites mensais e a ordem do período usado no resumo de aluguéis.
export function rentalSummaryPeriodError({ startMonth, endMonth }: RentalSummaryPeriod): string | null {
  for (const month of [startMonth, endMonth]) {
    if (month && (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month) || month < "2000-01" || month > "2100-12")) return "Informe um mês e ano válidos entre 2000 e 2100.";
  }
  if (startMonth && endMonth && startMonth > endMonth) return "O mês final deve ser igual ou posterior ao mês inicial.";
  return null;
}
// Agrupa reservas pela origem e soma os valores, contando cadastros sem valor informado.
export function summarizeRentalOrigins(items: AgendaRecord[], origins: string[], period: RentalSummaryPeriod = {}) {
  const error = rentalSummaryPeriodError(period);
  if (error) throw new Error(error);
  const groups = new Map<string, { origin: string; count: number; amountCents: number; missingAmounts: number }>();
  for (const origin of [...defaultRentalOrigins, ...origins]) {
    const key = origin.toLocaleLowerCase("pt-BR");
    if (!groups.has(key)) groups.set(key, { origin, count: 0, amountCents: 0, missingAmounts: 0 });
  }
  for (const item of items.filter(item => item.kind === "reservation" && (!period.startMonth || item.startDate.slice(0, 7) >= period.startMonth) && (!period.endMonth || item.startDate.slice(0, 7) <= period.endMonth))) {
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
// Identificador e datas públicas de um período reservado, sem dados pessoais.
export type ReservedPeriod = { id: number; startDate: string; endDate: string };
// Confere o formato, a existência da data e o intervalo de anos permitido.
export function validDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value + "T12:00:00Z");
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0,10) === value && value >= "2000-01-01" && value <= "2100-12-31";
}
// Limites opcionais de datas para consultar o histórico de reservas.
export type HistoryPeriod = { startDate?: string; endDate?: string };
// Verifica a validade e a ordem das datas usadas na pesquisa do histórico.
export function historyPeriodError({ startDate, endDate }: HistoryPeriod): string | null {
  if ((startDate && !validDate(startDate)) || (endDate && !validDate(endDate))) return "Informe datas válidas para pesquisar no histórico.";
  if (startDate && endDate && startDate > endDate) return "A data final deve ser igual ou posterior à data inicial.";
  return null;
}
// Seleciona reservas que tenham noites dentro dos limites opcionais da pesquisa.
export function filterHistoryPeriod(items: AgendaRecord[], period: HistoryPeriod): AgendaRecord[] {
  const error = historyPeriodError(period);
  if (error) throw new Error(error);
  return items.filter(item => item.kind === "reservation" && (!period.startDate || item.endDate > period.startDate) && (!period.endDate || item.startDate <= period.endDate));
}
// Valida o período e os dados da reserva ou feriado antes de persistir o cadastro.
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
// Detecta sobreposição de noites, permitindo nova entrada na data de saída anterior.
export function overlapsStay(start: string, end: string, period: ReservedPeriod) { return start < period.endDate && end > period.startDate; }
// Verifica se o dia pertence a uma reserva, excluindo a data de saída.
export function isReserved(date: string, periods: ReservedPeriod[]) { return periods.some(p => p.startDate <= date && date < p.endDate); }
// Desloca uma data em dias usando UTC para evitar efeitos do fuso do navegador.
export function addDays(date: string, count: number) { const d = new Date(date + "T12:00:00Z"); d.setUTCDate(d.getUTCDate() + count); return d.toISOString().slice(0,10); }
// Formata o início e o fim do período para leitura em português.
export function formatPeriod(start: string, end: string) {
  const f = new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
  return f.format(new Date(start + "T12:00:00Z")) + " a " + f.format(new Date(end + "T12:00:00Z"));
}
