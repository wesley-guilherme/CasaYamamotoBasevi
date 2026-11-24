// API administrativa de eventos, com validação de dados e de acesso do anfitrião.
import type { EventInput } from "../../../../db/events";

// Formato esperado para datas recebidas no cadastro de eventos.
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
// Formato esperado para os horários recebidos no cadastro de eventos.
const TIME_PATTERN = /^\d{2}:\d{2}$/;

// Normaliza entradas de texto e limita seu comprimento para o cadastro.
function text(value: unknown, maxLength: number): string {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

// Valida os campos, o intervalo de datas, o horário e o link de um evento.
export function parseEventPayload(value: unknown): EventInput {
  if (!value || typeof value !== "object") {
    throw new Error("Preencha os dados do evento.");
  }

  const payload = value as Record<string, unknown>;
  const title = text(payload.title, 120);
  const startDate = text(payload.startDate, 10);
  const endDate = text(payload.endDate, 10) || startDate;
  const startTime = text(payload.startTime, 5) || null;
  const location = text(payload.location, 140) || "Prado — BA";
  const description = text(payload.description, 500);
  const detailsUrlValue = text(payload.detailsUrl, 500);
  const detailsUrl = detailsUrlValue || null;

  if (!title) throw new Error("Informe o nome do evento.");
  if (!DATE_PATTERN.test(startDate) || !DATE_PATTERN.test(endDate)) {
    throw new Error("Informe uma data inicial válida.");
  }
  if (endDate < startDate) {
    throw new Error("A data final não pode ser anterior à data inicial.");
  }
  if (startTime && !TIME_PATTERN.test(startTime)) {
    throw new Error("Informe um horário válido.");
  }
  if (detailsUrl) {
    let parsed: URL;
    try {
      parsed = new URL(detailsUrl);
    } catch {
      throw new Error("Informe um link válido para os detalhes.");
    }
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      throw new Error("O link do evento precisa começar com http:// ou https://.");
    }
  }

  return {
    title,
    startDate,
    endDate,
    startTime,
    location,
    description,
    detailsUrl,
    published: payload.published === true,
  };
}
