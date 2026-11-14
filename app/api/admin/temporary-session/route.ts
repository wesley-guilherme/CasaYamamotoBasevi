export async function POST() { return Response.json({ error: "O acesso de teste foi encerrado. Entre com sua conta em /login." }, { status: 410 }); }
export async function DELETE() { return Response.json({ ok: true }, { headers: { "Set-Cookie": "cyb-temporary-admin=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict" } }); }
