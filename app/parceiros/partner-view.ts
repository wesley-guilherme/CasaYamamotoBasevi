// Conversão de registros de parceiros para os dados utilizados na interface.
import type { PartnerRecord } from "../../db/partners";

// Dados do parceiro preparados para apresentação, respeitando o acesso aos benefícios.
export type PartnerView = Pick<PartnerRecord, "id" | "categoryId" | "categoryName" | "name" | "description" | "address" | "benefit" | "openingHours" | "locationUrl" | "instagramUrl" | "whatsappUrl" | "imageKey" | "updatedAt">;

// Transforma o registro do parceiro nos dados usados para sua apresentação.
export function partnerView(partner: PartnerRecord, benefitsAvailable: boolean): PartnerView {
  const { id, categoryId, categoryName, name, description, address, openingHours, locationUrl, instagramUrl, whatsappUrl, updatedAt } = partner;
  return { id, categoryId, categoryName, name, description, address, openingHours, locationUrl, instagramUrl, whatsappUrl, updatedAt,
    benefit: benefitsAvailable ? partner.benefit : "Disponível durante a sua estadia.",
    imageKey: benefitsAvailable ? partner.imageKey : null };
}
