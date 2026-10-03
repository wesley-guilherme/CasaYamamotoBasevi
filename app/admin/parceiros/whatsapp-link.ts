export const DEFAULT_WHATSAPP_MESSAGE =
  "Olá, tudo bem? 😀\nConheci vocês por indicação da Casa Yamamoto Basevi";

export function buildWhatsAppLink(phone: string, message: string): string | null {
  const typedDigits = phone.replace(/\D/g, "");
  if (!typedDigits) return null;

  const internationalDigits = typedDigits.length === 10 || typedDigits.length === 11
    ? `55${typedDigits}`
    : typedDigits;
  const cleanMessage = message.trim();
  return `https://wa.me/${internationalDigits}${cleanMessage ? `?text=${encodeURIComponent(cleanMessage)}` : ""}`;
}

export function readWhatsAppLink(value: string | null): { phone: string; message: string } {
  if (!value) return { phone: "", message: DEFAULT_WHATSAPP_MESSAGE };

  try {
    const url = new URL(value);
    return {
      phone: url.pathname.replace(/\D/g, ""),
      message: url.searchParams.get("text") || DEFAULT_WHATSAPP_MESSAGE,
    };
  } catch {
    return {
      phone: value.replace(/\D/g, ""),
      message: DEFAULT_WHATSAPP_MESSAGE,
    };
  }
}
