import { isAdminUser } from "../../../../admin-access";
import { getChatGPTUser } from "../../../../chatgpt-auth";
import { getEvent, setEventPoster } from "../../../../../db/events";

const MAX_POSTER_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function parseId(value: string): number | null {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

async function getBucket(): Promise<R2Bucket> {
  const { env } = await import("cloudflare:workers");
  if (!env.BUCKET) throw new Error("O armazenamento de cartazes está indisponível.");
  return env.BUCKET;
}

function hasMatchingSignature(bytes: Uint8Array, type: string): boolean {
  if (type === "image/jpeg") return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (type === "image/png") return bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
  return bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 && bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const id = parseId((await params).id);
  if (!id) return new Response("Não encontrado", { status: 404 });

  try {
    const event = await getEvent(id);
    if (!event?.posterKey) return new Response("Não encontrado", { status: 404 });
    if (!event.published && !isAdminUser(await getChatGPTUser())) {
      return new Response("Não encontrado", { status: 404 });
    }

    const object = await (await getBucket()).get(event.posterKey);
    if (!object) return new Response("Não encontrado", { status: 404 });
    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("Content-Security-Policy", "default-src 'none'; sandbox");
    headers.set("X-Content-Type-Options", "nosniff");
    headers.set("Cache-Control", event.published ? "public, max-age=300" : "private, no-store");
    return new Response(object.body, { headers });
  } catch {
    return new Response("Cartaz temporariamente indisponível", { status: 503 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Entre para continuar." }, { status: 401 });
  if (!isAdminUser(user)) return Response.json({ error: "Acesso negado." }, { status: 403 });

  const id = parseId((await params).id);
  if (!id) return Response.json({ error: "Evento inválido." }, { status: 400 });

  try {
    const event = await getEvent(id);
    if (!event) return Response.json({ error: "Evento não encontrado." }, { status: 404 });
    const file = await request.blob();
    if (!ALLOWED_TYPES.has(file.type) || file.size === 0 || file.size > MAX_POSTER_BYTES) {
      return Response.json({ error: "Envie JPG, PNG ou WebP de até 5 MB." }, { status: 400 });
    }
    const bytes = await file.arrayBuffer();
    if (!hasMatchingSignature(new Uint8Array(bytes), file.type)) {
      return Response.json({ error: "O arquivo não é uma imagem válida." }, { status: 400 });
    }

    const bucket = await getBucket();
    const key = `events/${id}/${crypto.randomUUID()}`;
    await bucket.put(key, bytes, { httpMetadata: { contentType: file.type } });
    try {
      await setEventPoster(id, key);
    } catch (error) {
      await bucket.delete(key);
      throw error;
    }
    if (event.posterKey) await bucket.delete(event.posterKey).catch(() => {});
    return Response.json({ posterUrl: `/api/events/${id}/poster?version=${encodeURIComponent(key)}` });
  } catch {
    return Response.json({ error: "Não foi possível enviar o cartaz. Tente novamente." }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Entre para continuar." }, { status: 401 });
  if (!isAdminUser(user)) return Response.json({ error: "Acesso negado." }, { status: 403 });

  const id = parseId((await params).id);
  if (!id) return Response.json({ error: "Evento inválido." }, { status: 400 });
  try {
    const event = await getEvent(id);
    if (!event) return Response.json({ error: "Evento não encontrado." }, { status: 404 });
    await setEventPoster(id, null);
    if (event.posterKey) await (await getBucket()).delete(event.posterKey).catch(() => {});
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Não foi possível remover o cartaz." }, { status: 500 });
  }
}
