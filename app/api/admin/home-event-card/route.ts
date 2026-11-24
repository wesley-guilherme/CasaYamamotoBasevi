// API administrativa de destaque da página inicial, com validação de dados e de acesso do anfitrião.
import { getAdminActor } from "../../../temporary-admin";
import { parseHomeEventCard, type HomeEventCardData } from "../../../home-event-card-data";
import { saveHomeEventCard } from "../../../../db/home-event-card";

// Exige um anfitrião e valida o conteúdo antes de salvar a configuração enviada.
export async function PUT(request: Request) {
  const actor = await getAdminActor(request);
  if (!actor) return Response.json({ error: "Acesso não autorizado." }, { status: 401 });
  let card: HomeEventCardData;
  try {
    card = parseHomeEventCard(await request.json());
  } catch (error) {
    return Response.json({ error: error instanceof SyntaxError ? "Dados inválidos." : error instanceof Error ? error.message : "Confira os dados do cartão." }, { status: 400 });
  }
  try {
    return Response.json({ card: await saveHomeEventCard(card, actor) });
  } catch (error) {
    console.error("Home event card save failed", error);
    return Response.json({ error: "Não foi possível salvar o cartão. Tente novamente." }, { status: 500 });
  }
}
