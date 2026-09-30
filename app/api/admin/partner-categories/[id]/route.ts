import { getAdminActor } from "../../../../temporary-admin";
import { deletePartnerCategory, updatePartnerCategory } from "../../../../../db/partners";
import { parseCategoryPayload } from "../../partners/partner-payload";

function parseId(value: string): number | null {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const actor = await getAdminActor(request);
  if (!actor) return Response.json({ error: "Acesso não autorizado." }, { status: 401 });
  const id = parseId((await params).id);
  if (!id) return Response.json({ error: "Categoria inválida." }, { status: 400 });
  try {
    const category = await updatePartnerCategory(id, parseCategoryPayload(await request.json()));
    if (!category) return Response.json({ error: "Categoria não encontrada." }, { status: 404 });
    return Response.json({ category });
  } catch (error) {
    const duplicate = error instanceof Error && /unique/i.test(error.message);
    return Response.json(
      { error: duplicate ? "Já existe uma categoria com este nome." : error instanceof Error ? error.message : "Não foi possível atualizar a categoria." },
      { status: 400 },
    );
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const actor = await getAdminActor(request);
  if (!actor) return Response.json({ error: "Acesso não autorizado." }, { status: 401 });
  const id = parseId((await params).id);
  if (!id) return Response.json({ error: "Categoria inválida." }, { status: 400 });
  try {
    const deleted = await deletePartnerCategory(id);
    if (!deleted) return Response.json({ error: "Categoria não encontrada." }, { status: 404 });
    return Response.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Não foi possível excluir a categoria.";
    return Response.json({ error: message }, { status: 400 });
  }
}
