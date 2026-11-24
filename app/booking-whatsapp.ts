// Validação dos dados da estadia e montagem da mensagem de consulta ao anfitrião.
import { validDate } from "./agenda/agenda-data";
import { buildWhatsAppLink } from "./admin/parceiros/whatsapp-link";

// Telefone do anfitrião usado no encaminhamento das consultas de reserva.
const hostPhone = "5573998376874";
// Formatador reutilizável de datas no padrão brasileiro.
const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

// Valida datas e quantidade de hóspedes e monta a mensagem de consulta ao anfitrião.
export function buildBookingWhatsAppLink(arrival: string, departure: string, guests: number, today: string): string | null {
  if (!validDate(arrival) || !validDate(departure) || arrival < today || departure <= arrival) return null;
  if (!Number.isInteger(guests) || guests < 1 || guests > 14) return null;

  const start = dateFormatter.format(new Date(`${arrival}T12:00:00Z`));
  const end = dateFormatter.format(new Date(`${departure}T12:00:00Z`));
  const message = [
    "Olá tudo bem,",
    "Tenho interesse em alugar a casa",
    `Do dia ${start} ao dia ${end}`,
    `Quantidade de hóspedes: ${guests}`,
  ].join("\n");

  return buildWhatsAppLink(hostPhone, message);
}
