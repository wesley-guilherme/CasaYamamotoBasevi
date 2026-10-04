import { getAdminActor } from "../../../../temporary-admin";
import { parseAgendaInput } from "../../../../agenda/agenda-data";
import { saveAgenda, deleteAgenda } from "../../../../../db/agenda";
type Context = { params: Promise<{id:string}> };
function validId(value:string) { const id=Number(value); return Number.isSafeInteger(id)&&id>0?id:null; }
export async function PATCH(request:Request, context:Context) {
  const actor=await getAdminActor(request); if(!actor) return Response.json({error:"Acesso não autorizado."},{status:401});
  const id=validId((await context.params).id); if(!id) return Response.json({error:"Período inválido."},{status:400});
  let input; try { input=parseAgendaInput(await request.json()); } catch(e) { return Response.json({error:e instanceof Error?e.message:"Dados inválidos."},{status:400}); }
  try { const item=await saveAgenda(input,actor,id); return item?Response.json({item}):Response.json({error:"Período não encontrado."},{status:404}); } catch(e) { console.error("Agenda update failed",e); return Response.json({error:e instanceof Error&&e.message.startsWith("Esse período")?e.message:"Não foi possível salvar. Tente novamente."},{status:409}); }
}
export async function DELETE(request:Request, context:Context) {
  if(!await getAdminActor(request)) return Response.json({error:"Acesso não autorizado."},{status:401});
  const id=validId((await context.params).id); if(!id) return Response.json({error:"Período inválido."},{status:400});
  try { return await deleteAgenda(id)?Response.json({ok:true}):Response.json({error:"Período não encontrado."},{status:404}); } catch(e) { console.error("Agenda delete failed",e); return Response.json({error:"Não foi possível excluir. Tente novamente."},{status:503}); }
}
