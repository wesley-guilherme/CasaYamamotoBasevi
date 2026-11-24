// Rotas de compatibilidade que encerram o acesso administrativo de teste e removem seu cookie.
// Informa o encerramento do acesso administrativo de teste.
export async function POST() { return Response.json({ error: "O acesso de teste foi encerrado. Entre com sua conta em /login." }, { status: 410 }); }
// Expira o cookie legado de administração temporária.
export async function DELETE() { return Response.json({ ok: true }, { headers: { "Set-Cookie": "cyb-temporary-admin=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict" } }); }
