import { isAdminUser } from "../../../admin-access";
import { getChatGPTUser } from "../../../chatgpt-auth";
import { createEvent } from "../../../../db/events";
import { parseEventPayload } from "./event-payload";

export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Entre para continuar." }, { status: 401 });
  if (!isAdminUser(user)) {
    return Response.json({ error: "Este usuário não tem acesso ao painel." }, { status: 403 });
  }

  try {
    const input = parseEventPayload(await request.json());
    const event = await createEvent(input, user.email);
    return Response.json({ event }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Não foi possível salvar o evento.";
    return Response.json({ error: message }, { status: 400 });
  }
}
