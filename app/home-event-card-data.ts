export type HomeEventCardData = {
  month: number;
  title: string;
  description: string;
  status: string;
};

export const eventMonths = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

export const defaultHomeEventCard: HomeEventCardData = {
  month: 10,
  title: "Evento Gastronômico de Prado",
  description: "Sabores e experiências locais. Data e programação em confirmação.",
  status: "Programação sujeita a alteração",
};

export function parseHomeEventCard(value: unknown): HomeEventCardData {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Informe os dados do cartão.");
  const input = value as Record<string, unknown>;
  if (!Number.isInteger(input.month) || Number(input.month) < 1 || Number(input.month) > 12) throw new Error("Selecione um mês válido.");
  function field(key: string, label: string, max: number) {
    const text = typeof input[key] === "string" ? input[key].trim() : "";
    if (!text) throw new Error(`Preencha ${label}.`);
    if (text.length > max) throw new Error(`O campo ${label} deve ter até ${max} caracteres.`);
    return text;
  }
  return {
    month: Number(input.month),
    title: field("title", "nome do evento", 120),
    description: field("description", "frase do evento", 500),
    status: field("status", "aviso", 140),
  };
}
