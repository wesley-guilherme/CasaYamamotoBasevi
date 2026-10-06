import { getAdminActor } from "../../../../temporary-admin";
import { parseRentalOrigin } from "../../../../agenda/agenda-data";
import { createRentalOrigin } from "../../../../../db/agenda";

export async function POST(request: Request) {
  if (!await getAdminActor(request)) return Response.json({ error: "Acesso não autorizado." }, { status: 401 });
  let name: string;
  try {
    const input = await request.json();
    name = parseRentalOrigin(input?.name);
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Origem inválida." }, { status: 400 });
  }
  try {
    return Response.json({ name: await createRentalOrigin(name) }, { status: 201 });
  } catch (error) {
    console.error("Rental origin save failed", error);
    return Response.json({ error: "Não foi possível cadastrar a origem. Tente novamente." }, { status: 503 });
  }
}
