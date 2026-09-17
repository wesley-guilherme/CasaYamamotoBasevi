export type EventRecord = {
  id: number;
  title: string;
  startDate: string;
  endDate: string;
  startTime: string | null;
  location: string;
  description: string;
  detailsUrl: string | null;
  posterKey: string | null;
  published: boolean;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
};

export type EventInput = Omit<EventRecord, "id" | "posterKey" | "updatedBy" | "createdAt" | "updatedAt">;

type EventRow = {
  id: number;
  title: string;
  start_date: string;
  end_date: string;
  start_time: string | null;
  location: string;
  description: string;
  details_url: string | null;
  poster_key: string | null;
  published: number;
  updated_by: string;
  created_at: string;
  updated_at: string;
};

const EVENT_COLUMNS = `
  id, title, start_date, end_date, start_time, location, description,
  details_url, poster_key, published, updated_by, created_at, updated_at
`;

async function getDatabase(): Promise<D1Database> {
  const { env } = await import("cloudflare:workers");
  if (!env.DB) {
    throw new Error("A agenda de eventos está temporariamente indisponível.");
  }
  return env.DB;
}

function mapEvent(row: EventRow): EventRecord {
  return {
    id: row.id,
    title: row.title,
    startDate: row.start_date,
    endDate: row.end_date,
    startTime: row.start_time,
    location: row.location,
    description: row.description,
    detailsUrl: row.details_url,
    posterKey: row.poster_key,
    published: row.published === 1,
    updatedBy: row.updated_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listPublishedEvents(): Promise<EventRecord[]> {
  const result = await (await getDatabase())
    .prepare(
      `SELECT ${EVENT_COLUMNS}
       FROM events
       WHERE published = 1 AND end_date >= date('now')
       ORDER BY start_date ASC, start_time ASC, id ASC
       LIMIT 50`,
    )
    .all<EventRow>();

  return result.results.map(mapEvent);
}

export async function listAllEvents(): Promise<EventRecord[]> {
  const result = await (await getDatabase())
    .prepare(
      `SELECT ${EVENT_COLUMNS}
       FROM events
       ORDER BY start_date DESC, start_time DESC, id DESC`,
    )
    .all<EventRow>();

  return result.results.map(mapEvent);
}

export async function getEvent(id: number): Promise<EventRecord | null> {
  const row = await (await getDatabase())
    .prepare(`SELECT ${EVENT_COLUMNS} FROM events WHERE id = ?`)
    .bind(id)
    .first<EventRow>();
  return row ? mapEvent(row) : null;
}

export async function setEventPoster(id: number, key: string | null): Promise<void> {
  await (await getDatabase())
    .prepare("UPDATE events SET poster_key = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
    .bind(key, id)
    .run();
}

export async function createEvent(
  input: EventInput,
  updatedBy: string,
): Promise<EventRecord> {
  const row = await (await getDatabase())
    .prepare(
      `INSERT INTO events (
         title, start_date, end_date, start_time, location, description,
         details_url, published, updated_by
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       RETURNING ${EVENT_COLUMNS}`,
    )
    .bind(
      input.title,
      input.startDate,
      input.endDate,
      input.startTime,
      input.location,
      input.description,
      input.detailsUrl,
      input.published ? 1 : 0,
      updatedBy,
    )
    .first<EventRow>();

  if (!row) throw new Error("Não foi possível cadastrar o evento.");
  return mapEvent(row);
}

export async function updateEvent(
  id: number,
  input: EventInput,
  updatedBy: string,
): Promise<EventRecord | null> {
  const row = await (await getDatabase())
    .prepare(
      `UPDATE events
       SET title = ?, start_date = ?, end_date = ?, start_time = ?,
           location = ?, description = ?, details_url = ?, published = ?,
           updated_by = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?
       RETURNING ${EVENT_COLUMNS}`,
    )
    .bind(
      input.title,
      input.startDate,
      input.endDate,
      input.startTime,
      input.location,
      input.description,
      input.detailsUrl,
      input.published ? 1 : 0,
      updatedBy,
      id,
    )
    .first<EventRow>();

  return row ? mapEvent(row) : null;
}

export async function deleteEvent(id: number): Promise<boolean> {
  const result = await (await getDatabase())
    .prepare("DELETE FROM events WHERE id = ?")
    .bind(id)
    .run();

  return result.meta.changes > 0;
}
