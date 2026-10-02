import {
  GUEST_ACCESS_COOKIE,
  verifyGuestPassword,
} from "../../../guest-access";

export async function POST(request: Request) {
  try {
    const payload = await request.json() as { password?: unknown };
    if (typeof payload.password !== "string" || !payload.password) {
      return Response.json({ error: "Informe a senha de acesso." }, { status: 400 });
    }

    const session = await verifyGuestPassword(payload.password);
    if (!session) {
      return Response.json({ error: "Senha incorreta. Confira e tente novamente." }, { status: 401 });
    }

    const response = Response.json({ ok: true });
    response.headers.set(
      "Set-Cookie",
      `${GUEST_ACCESS_COOKIE}=${encodeURIComponent(session)}; Path=/; Max-Age=604800; HttpOnly; Secure; SameSite=Strict`,
    );
    return response;
  } catch {
    return Response.json({ error: "Não foi possível liberar o acesso agora." }, { status: 400 });
  }
}
