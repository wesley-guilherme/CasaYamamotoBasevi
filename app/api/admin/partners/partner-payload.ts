import type { PartnerInput } from "../../../../db/partners";

function text(value: unknown, maxLength: number): string {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function positiveInteger(value: unknown): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 0;
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
  const contactUrlValue = text(payload.contactUrl, 500);
  const contactUrl = contactUrlValue || null;

  if (!categoryId) throw new Error("Selecione uma categoria.");
  if (!name) throw new Error("Informe o nome do parceiro.");
  if (!benefit) throw new Error("Informe o benefício oferecido ao hóspede.");
  if (contactUrl) {
    let url: URL;
    try {
      url = new URL(contactUrl);
    } catch {
      throw new Error("Informe um link válido para contato ou localização.");
    }
    if (url.protocol !== "https:" && url.protocol !== "http:") {
      throw new Error("O link precisa começar com http:// ou https://.");
    }
  }

  return {
    categoryId,
    name,
    description,
    address,
    benefit,
    openingHours,
    contactUrl,
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
