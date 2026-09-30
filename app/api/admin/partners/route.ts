import { getAdminActor } from "../../../temporary-admin";
import { createPartner } from "../../../../db/partners";
import { parsePartnerPayload } from "./partner-payload";

export async function POST(request: Request) {
  const actor = await getAdminActor(request);
  if (!actor) return Response.json({ error: "Acesso não autorizado." }, { status: 401 });
  try {
    const partner = await createPartner(parsePartnerPayload(await request.json()), actor);
    return Response.json({ partner }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Não foi possível salvar o parceiro.";
    return Response.json({ error: message }, { status: 400 });
  }
}
