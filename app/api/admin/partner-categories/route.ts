import { getAdminActor } from "../../../temporary-admin";
import { createPartnerCategory } from "../../../../db/partners";
import { parseCategoryPayload } from "../partners/partner-payload";

export async function POST(request: Request) {
  const actor = await getAdminActor(request);
  if (!actor) return Response.json({ error: "Acesso não autorizado." }, { status: 401 });
  try {
    const input = parseCategoryPayload(await request.json());
    const category = await createPartnerCategory(input.name);
    return Response.json({ category }, { status: 201 });
  } catch (error) {
    const duplicate = error instanceof Error && /unique/i.test(error.message);
    return Response.json(
      { error: duplicate ? "Esta categoria já existe." : error instanceof Error ? error.message : "Não foi possível criar a categoria." },
      { status: 400 },
    );
  }
}
