import { validDate } from "./agenda/agenda-data";
import { buildWhatsAppLink } from "./admin/parceiros/whatsapp-link";

const hostPhone = "5573998376874";
const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

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
