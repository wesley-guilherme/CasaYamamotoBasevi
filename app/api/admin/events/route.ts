import { getAdminActor } from "../../../temporary-admin";
import { createEvent } from "../../../../db/events";
import { parseEventPayload } from "./event-payload";

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
