// Rota de compatibilidade que informa a substituição da senha compartilhada por acesso individual.
// Informa que o acesso compartilhado foi descontinuado e orienta a entrada individual.
export async function POST() { return Response.json({ error: "A senha compartilhada foi substituída pelo acesso individual. Entre em /login." }, { status: 410 }); }
