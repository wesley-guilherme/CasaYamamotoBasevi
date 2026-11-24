// API administrativa de eventos, com validação de dados e de acesso do anfitrião.
import { getAdminActor } from "../../../../temporary-admin";
import { deleteEvent, getEvent, updateEvent } from "../../../../../db/events";
import { parseEventPayload } from "../event-payload";

// Aceita somente um identificador inteiro positivo para consultar ou alterar o registro.
function parseId(value: string): number | null {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

// Verifica a identidade administrativa e devolve uma resposta de bloqueio quando necessário.
async function requireAdminResponse(request: Request) {
  const actor = await getAdminActor(request);
  if (!actor) return { response: Response.json({ error: "Acesso não autorizado." }, { status: 401 }) };
  return { actor };
}

// Exige acesso autorizado e valida os dados antes de atualizar o registro solicitado.
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdminResponse(request);
  if ("response" in auth) return auth.response;

  const id = parseId((await params).id);
  if (!id) return Response.json({ error: "Evento inválido." }, { status: 400 });

  try {
    const input = parseEventPayload(await request.json());
    const event = await updateEvent(id, input, auth.actor);
    if (!event) return Response.json({ error: "Evento não encontrado." }, { status: 404 });
    return Response.json({ event });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Não foi possível atualizar o evento.";
    return Response.json({ error: message }, { status: 400 });
  }
}

// Exige acesso autorizado e exclui o registro solicitado, tratando ausência e impedimentos.
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdminResponse(request);
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
