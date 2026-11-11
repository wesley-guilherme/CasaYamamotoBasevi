import { defaultHomeEventCard, parseHomeEventCard, type HomeEventCardData } from "../app/home-event-card-data";

async function database(): Promise<D1Database> {
  const { env } = await import("cloudflare:workers");
  if (!env.DB) throw new Error("Banco de dados indisponível.");
  return env.DB;
}

export async function getHomeEventCard(): Promise<HomeEventCardData> {
  const row = await (await database()).prepare(
    "SELECT month, title, description, status FROM home_event_card WHERE id = 1",
  ).first<HomeEventCardData>();
  return row ? parseHomeEventCard(row) : { ...defaultHomeEventCard };
}

export async function saveHomeEventCard(input: HomeEventCardData, actor: string): Promise<HomeEventCardData> {
  const card = parseHomeEventCard(input);
  await (await database()).prepare(
    `INSERT INTO home_event_card (id, month, title, description, status, updated_by)
     VALUES (1, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET month = excluded.month, title = excluded.title,
     description = excluded.description, status = excluded.status,
     updated_by = excluded.updated_by, updated_at = CURRENT_TIMESTAMP`,
  ).bind(card.month, card.title, card.description, card.status, actor).run();
  return card;
}
