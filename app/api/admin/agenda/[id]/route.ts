// API administrativa de reservas e feriados, com validação de dados e de acesso do anfitrião.
import { getAdminActor } from "../../../../temporary-admin";
import { parseAgendaInput } from "../../../../agenda/agenda-data";
import { saveAgenda, deleteAgenda } from "../../../../../db/agenda";
// Parâmetros dinâmicos recebidos pela rota para identificar o registro solicitado.
type Context = { params: Promise<{id:string}> };
// Converte e valida o identificador numérico recebido pela rota.
function validId(value:string) { const id=Number(value); return Number.isSafeInteger(id)&&id>0?id:null; }
// Exige acesso autorizado e valida os dados antes de atualizar o registro solicitado.
export async function PATCH(request:Request, context:Context) {
  const actor=await getAdminActor(request); if(!actor) return Response.json({error:"Acesso não autorizado."},{status:401});
  const id=validId((await context.params).id); if(!id) return Response.json({error:"Período inválido."},{status:400});
  let input; try { input=parseAgendaInput(await request.json()); } catch(e) { return Response.json({error:e instanceof Error?e.message:"Dados inválidos."},{status:400}); }
  try { const item=await saveAgenda(input,actor,id); return item?Response.json({item}):Response.json({error:"Período não encontrado."},{status:404}); } catch(e) { console.error("Agenda update failed",e); return Response.json({error:e instanceof Error&&e.message.startsWith("Esse período")?e.message:"Não foi possível salvar. Tente novamente."},{status:409}); }
}
// Exige acesso autorizado e exclui o registro solicitado, tratando ausência e impedimentos.
export async function DELETE(request:Request, context:Context) {
  if(!await getAdminActor(request)) return Response.json({error:"Acesso não autorizado."},{status:401});
  const id=validId((await context.params).id); if(!id) return Response.json({error:"Período inválido."},{status:400});
  try { return await deleteAgenda(id)?Response.json({ok:true}):Response.json({error:"Período não encontrado."},{status:404}); } catch(e) { console.error("Agenda delete failed",e); return Response.json({error:"Não foi possível excluir. Tente novamente."},{status:503}); }
}
