import { isAdminUser } from "../../../../admin-access";
import { getChatGPTUser } from "../../../../chatgpt-auth";
import { deleteEvent, getEvent, updateEvent } from "../../../../../db/events";
import { parseEventPayload } from "../event-payload";

function parseId(value: string): number | null {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

async function requireAdminResponse() {
  const user = await getChatGPTUser();
  if (!user) return { response: Response.json({ error: "Entre para continuar." }, { status: 401 }) };
  if (!isAdminUser(user)) {
    return { response: Response.json({ error: "Este usuário não tem acesso ao painel." }, { status: 403 }) };
  }
  return { user };
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdminResponse();
  if ("response" in auth) return auth.response;

  const id = parseId((await params).id);
  if (!id) return Response.json({ error: "Evento inválido." }, { status: 400 });

  try {
    const input = parseEventPayload(await request.json());
    const event = await updateEvent(id, input, auth.user.email);
    if (!event) return Response.json({ error: "Evento não encontrado." }, { status: 404 });
    return Response.json({ event });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Não foi possível atualizar o evento.";
    return Response.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdminResponse();
  if ("response" in auth) return auth.response;

  const id = parseId((await params).id);
  if (!id) return Response.json({ error: "Evento inválido." }, { status: 400 });

  try {
    const event = await getEvent(id);
    const deleted = await deleteEvent(id);
    if (!deleted) return Response.json({ error: "Evento não encontrado." }, { status: 404 });
    if (event?.posterKey) {
      const { env } = await import("cloudflare:workers");
      await env.BUCKET?.delete(event.posterKey).catch(() => {});
    }
    return Response.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Não foi possível excluir o evento.";
    return Response.json({ error: message }, { status: 400 });
  }
}
