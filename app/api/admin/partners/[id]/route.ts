import { getAdminActor } from "../../../../temporary-admin";
import { deletePartner, getPartner, updatePartner } from "../../../../../db/partners";
import { parsePartnerPayload } from "../partner-payload";

function parseId(value: string): number | null {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const actor = await getAdminActor(request);
  if (!actor) return Response.json({ error: "Acesso não autorizado." }, { status: 401 });
  const id = parseId((await params).id);
  if (!id) return Response.json({ error: "Parceiro inválido." }, { status: 400 });
  try {
    const partner = await updatePartner(id, parsePartnerPayload(await request.json()), actor);
    if (!partner) return Response.json({ error: "Parceiro não encontrado." }, { status: 404 });
    return Response.json({ partner });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Não foi possível atualizar o parceiro.";
    return Response.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const actor = await getAdminActor(request);
  if (!actor) return Response.json({ error: "Acesso não autorizado." }, { status: 401 });
  const id = parseId((await params).id);
  if (!id) return Response.json({ error: "Parceiro inválido." }, { status: 400 });
  try {
    const partner = await getPartner(id);
    const deleted = await deletePartner(id);
    if (!deleted) return Response.json({ error: "Parceiro não encontrado." }, { status: 404 });
    if (partner?.imageKey) {
      const { env } = await import("cloudflare:workers");
      await env.BUCKET?.delete(partner.imageKey).catch(() => {});
    }
    return Response.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Não foi possível excluir o parceiro.";
    return Response.json({ error: message }, { status: 400 });
  }
}
