import type { PartnerInput } from "../../../../db/partners";

function text(value: unknown, maxLength: number): string {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function positiveInteger(value: unknown): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 0;
}

function optionalUrl(value: unknown, label: string, maxLength = 500): string | null {
  const urlValue = text(value, maxLength);
  if (!urlValue) return null;

  let url: URL;
  try {
    url = new URL(urlValue);
  } catch {
    throw new Error(`Informe um link válido para ${label}.`);
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error(`O link de ${label} precisa começar com http:// ou https://.`);
  }
  return urlValue;
}

export function parsePartnerPayload(value: unknown): PartnerInput {
  if (!value || typeof value !== "object") {
    throw new Error("Preencha os dados do parceiro.");
  }
  const payload = value as Record<string, unknown>;
  const categoryId = positiveInteger(payload.categoryId);
  const name = text(payload.name, 120);
  const description = text(payload.description, 700);
  const address = text(payload.address, 240);
  const benefit = text(payload.benefit, 300);
  const openingHours = text(payload.openingHours, 240);
  const locationUrl = optionalUrl(payload.locationUrl ?? payload.contactUrl, "localização");
  const instagramUrl = optionalUrl(payload.instagramUrl, "Instagram");
  const whatsappUrl = optionalUrl(payload.whatsappUrl, "WhatsApp", 4000);

  if (!categoryId) throw new Error("Selecione uma categoria.");
  if (!name) throw new Error("Informe o nome do parceiro.");
  if (!benefit) throw new Error("Informe o benefício oferecido ao hóspede.");
  return {
    categoryId,
    name,
    description,
    address,
    benefit,
    openingHours,
    locationUrl,
    instagramUrl,
    whatsappUrl,
    published: payload.published === true,
  };
}

export function parseCategoryPayload(value: unknown): { name: string; active: boolean } {
  if (!value || typeof value !== "object") throw new Error("Informe a categoria.");
  const payload = value as Record<string, unknown>;
  const name = text(payload.name, 80);
  if (name.length < 2) throw new Error("Informe um nome de categoria com pelo menos 2 caracteres.");
  return { name, active: payload.active !== false };
}
