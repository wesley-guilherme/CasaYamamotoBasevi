// API administrativa de categorias de parceiros, com validação de dados e de acesso do anfitrião.
import { getAdminActor } from "../../../temporary-admin";
import { createPartnerCategory } from "../../../../db/partners";
import { parseCategoryPayload } from "../partners/partner-payload";

// Exige acesso autorizado, valida a entrada e executa a criação ou ação solicitada.
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
