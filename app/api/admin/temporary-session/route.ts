import {
  TEMPORARY_ADMIN_COOKIE,
  verifyTemporaryAdminPassword,
} from "../../../temporary-admin";

export async function POST(request: Request) {
  try {
    const payload = await request.json() as { password?: unknown };
    if (typeof payload.password !== "string") {
      return Response.json({ error: "Informe a senha temporária." }, { status: 400 });
    }
    const session = await verifyTemporaryAdminPassword(payload.password);
    if (!session) {
      return Response.json({ error: "Senha temporária incorreta." }, { status: 401 });
    }
    const response = Response.json({ ok: true });
    response.headers.set(
      "Set-Cookie",
      `${TEMPORARY_ADMIN_COOKIE}=${encodeURIComponent(session)}; Path=/; Max-Age=2592000; HttpOnly; Secure; SameSite=Strict`,
    );
    return response;
  } catch {
    return Response.json({ error: "Não foi possível liberar o acesso." }, { status: 400 });
  }
}

export async function DELETE() {
  const response = Response.json({ ok: true });
  response.headers.set(
    "Set-Cookie",
    `${TEMPORARY_ADMIN_COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict`,
  );
  return response;
}
