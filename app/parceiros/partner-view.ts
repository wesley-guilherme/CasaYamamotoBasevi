import type { PartnerRecord } from "../../db/partners";

export type PartnerView = Pick<PartnerRecord, "id" | "categoryId" | "categoryName" | "name" | "description" | "address" | "benefit" | "openingHours" | "locationUrl" | "instagramUrl" | "whatsappUrl" | "imageKey" | "updatedAt">;

export function partnerView(partner: PartnerRecord, benefitsAvailable: boolean): PartnerView {
  const { id, categoryId, categoryName, name, description, address, openingHours, locationUrl, instagramUrl, whatsappUrl, updatedAt } = partner;
  return { id, categoryId, categoryName, name, description, address, openingHours, locationUrl, instagramUrl, whatsappUrl, updatedAt,
    benefit: benefitsAvailable ? partner.benefit : "Disponível durante a sua estadia.",
    imageKey: benefitsAvailable ? partner.imageKey : null };
}
