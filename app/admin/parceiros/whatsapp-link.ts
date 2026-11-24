// Conversão entre telefone, mensagem e links de WhatsApp dos parceiros.
// Mensagem inicial sugerida nos contatos de parceiros pelo WhatsApp.
export const DEFAULT_WHATSAPP_MESSAGE =
  "Olá, tudo bem? 😀\nConheci vocês por indicação da Casa Yamamoto Basevi";

// Normaliza o telefone e codifica a mensagem para montar o link de WhatsApp.
export function buildWhatsAppLink(phone: string, message: string): string | null {
  const typedDigits = phone.replace(/\D/g, "");
  if (!typedDigits) return null;

  const internationalDigits = typedDigits.length === 10 || typedDigits.length === 11
    ? `55${typedDigits}`
    : typedDigits;
  const cleanMessage = message.trim();
  return `https://wa.me/${internationalDigits}${cleanMessage ? `?text=${encodeURIComponent(cleanMessage)}` : ""}`;
}

// Recupera telefone e mensagem de um link existente para preencher a edição.
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
