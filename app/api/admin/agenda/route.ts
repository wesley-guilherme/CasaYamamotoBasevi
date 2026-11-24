// API administrativa de reservas e feriados, com validação de dados e de acesso do anfitrião.
import { getAdminActor } from "../../../temporary-admin";
import { parseAgendaInput } from "../../../agenda/agenda-data";
import { saveAgenda } from "../../../../db/agenda";
// Exige acesso autorizado, valida a entrada e executa a criação ou ação solicitada.
export async function POST(request: Request) {
  const actor = await getAdminActor(request);
  if (!actor) return Response.json({error:"Acesso não autorizado."},{status:401});
  let input;
  try { input = parseAgendaInput(await request.json()); } catch(e) { return Response.json({error:e instanceof Error?e.message:"Dados inválidos."},{status:400}); }
  try { return Response.json({item:await saveAgenda(input,actor)},{status:201}); } catch(e) { console.error("Agenda save failed",e); return Response.json({error:e instanceof Error && e.message.startsWith("Esse período")?e.message:"Não foi possível salvar. Tente novamente."},{status:409}); }
}
