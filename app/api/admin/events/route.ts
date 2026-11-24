// API administrativa de eventos, com validação de dados e de acesso do anfitrião.
import { getAdminActor } from "../../../temporary-admin";
import { createEvent } from "../../../../db/events";
import { parseEventPayload } from "./event-payload";

// Exige acesso autorizado, valida a entrada e executa a criação ou ação solicitada.
export async function POST(request: Request) {
  const actor = await getAdminActor(request);
  if (!actor) return Response.json({ error: "Acesso não autorizado." }, { status: 401 });

  try {
    const input = parseEventPayload(await request.json());
    const event = await createEvent(input, actor);
    return Response.json({ event }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Não foi possível salvar o evento.";
    return Response.json({ error: message }, { status: 400 });
  }
}
