export async function POST() { return Response.json({ error: "A senha compartilhada foi substituída pelo acesso individual. Entre em /login." }, { status: 410 }); }
