// Modelo, valores padrão e validação do destaque de evento da página inicial.
// Mês e textos do destaque de evento apresentado na página inicial.
export type HomeEventCardData = {
  month: number;
  title: string;
  description: string;
  status: string;
};

// Nomes dos meses disponíveis para configurar o destaque de evento.
export const eventMonths = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

// Conteúdo usado no destaque quando não existe configuração persistida.
export const defaultHomeEventCard: HomeEventCardData = {
  month: 10,
  title: "Evento Gastronômico de Prado",
  description: "Sabores e experiências locais. Data e programação em confirmação.",
  status: "Programação sujeita a alteração",
};

// Valida mês, título, descrição e estado do destaque de evento da página inicial.
export function parseHomeEventCard(value: unknown): HomeEventCardData {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Informe os dados do cartão.");
  const input = value as Record<string, unknown>;
  if (!Number.isInteger(input.month) || Number(input.month) < 1 || Number(input.month) > 12) throw new Error("Selecione um mês válido.");
  // Lê um campo obrigatório, remove espaços extras e valida seu limite de caracteres.
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
