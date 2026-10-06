import { defaultRentalOrigins, parseRentalOrigin, type AgendaInput, type AgendaRecord, type ReservedPeriod } from "../app/agenda/agenda-data";
type Row = { id: number; kind: "reservation" | "holiday"; title: string; start_date: string; end_date: string; description: string; published: number; responsible: string; email: string; city: string; state: string; rental_origin: string; rental_amount_cents: number | null };
async function database(): Promise<D1Database> { const { env } = await import("cloudflare:workers"); if (!env.DB) throw new Error("A agenda está temporariamente indisponível."); return env.DB; }
const columns = "id, kind, title, start_date, end_date, description, published, responsible, email, city, state, rental_origin, rental_amount_cents";
function record(r: Row): AgendaRecord { return { id:r.id, kind:r.kind, title:r.title, startDate:r.start_date, endDate:r.end_date, description:r.description, published:r.published===1, responsible:r.responsible, email:r.email, city:r.city, state:r.state, rentalOrigin:r.rental_origin, rentalAmountCents:r.rental_amount_cents }; }
export async function listRentalOrigins(): Promise<string[]> {
  const result = await (await database()).prepare("SELECT name FROM rental_origins ORDER BY name").all<{name:string}>();
  return [...defaultRentalOrigins, ...result.results.map(row => row.name).filter(name => !defaultRentalOrigins.includes(name))];
}
export async function createRentalOrigin(value: string): Promise<string> {
  const name = parseRentalOrigin(value);
  if (defaultRentalOrigins.includes(name)) return name;
  const db = await database();
  const key = name.toLocaleLowerCase("pt-BR");
  await db.prepare("INSERT INTO rental_origins (name, name_key) VALUES (?, ?) ON CONFLICT(name_key) DO NOTHING").bind(name, key).run();
  const origin = await db.prepare("SELECT name FROM rental_origins WHERE name_key = ?").bind(key).first<{name:string}>();
  if (!origin) throw new Error("Não foi possível cadastrar a origem.");
  return origin.name;
}
export async function listAgenda(): Promise<AgendaRecord[]> { const result = await (await database()).prepare("SELECT " + columns + " FROM house_agenda ORDER BY start_date, id").all<Row>(); return result.results.map(record); }
export async function publicAgenda(): Promise<{ reservations: ReservedPeriod[]; holidays: AgendaRecord[] }> {
  const db = await database();
  const results = await Promise.all([
    db.prepare("SELECT id, start_date, end_date FROM house_agenda WHERE kind = 'reservation' AND published = 1 ORDER BY start_date").all(),
    db.prepare("SELECT " + columns + " FROM house_agenda WHERE kind = 'holiday' AND published = 1 AND end_date >= date('now', '-3 hours') ORDER BY start_date").all(),
  ]);
  return { reservations: (results[0].results as {id:number;start_date:string;end_date:string}[]).map(r=>({id:r.id,startDate:r.start_date,endDate:r.end_date})), holidays: (results[1].results as Row[]).map(record) };
}
export async function saveAgenda(input: AgendaInput, actor: string, id?: number): Promise<AgendaRecord | null> {
  const db = await database();
  const origin = input.kind === "reservation" && input.rentalOrigin ? await createRentalOrigin(input.rentalOrigin) : "";
  const conflict = "NOT EXISTS (SELECT 1 FROM house_agenda WHERE kind = 'reservation' AND published = 1 AND start_date < ? AND end_date > ? AND id != ?)";
  const values = [input.kind,input.title,input.startDate,input.endDate,input.description,input.published?1:0,actor,input.responsible||"",input.email||"",input.city||"",input.state||"",origin,input.rentalAmountCents??null];
  const row = id ? await db.prepare("UPDATE house_agenda SET kind=?, title=?, start_date=?, end_date=?, description=?, published=?, updated_by=?, responsible=?, email=?, city=?, state=?, rental_origin=?, rental_amount_cents=?, updated_at=CURRENT_TIMESTAMP WHERE id=? AND kind=? AND (? = 'holiday' OR " + conflict + ") RETURNING " + columns).bind(...values,id,input.kind,input.kind,input.endDate,input.startDate,id).first<Row>() : await db.prepare("INSERT INTO house_agenda (kind,title,start_date,end_date,description,published,updated_by,responsible,email,city,state,rental_origin,rental_amount_cents) SELECT ?,?,?,?,?,?,?,?,?,?,?,?,? WHERE (? = 'holiday' OR " + conflict + ") RETURNING " + columns).bind(...values,input.kind,input.endDate,input.startDate,0).first<Row>();
  if (!row) { if (id && !(await db.prepare("SELECT id FROM house_agenda WHERE id=? AND kind=?").bind(id,input.kind).first())) return null; throw new Error("Esse período coincide com uma reserva existente. Ajuste as datas."); }
  return record(row);
}
export async function deleteAgenda(id: number) { const result = await (await database()).prepare("DELETE FROM house_agenda WHERE id=?").bind(id).run(); return result.meta.changes > 0; }
