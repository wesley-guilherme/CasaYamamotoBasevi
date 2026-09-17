import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const events = sqliteTable(
  "events",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    title: text("title").notNull(),
    startDate: text("start_date").notNull(),
    endDate: text("end_date").notNull(),
    startTime: text("start_time"),
    location: text("location").notNull().default("Prado — BA"),
    description: text("description").notNull().default(""),
    detailsUrl: text("details_url"),
    posterKey: text("poster_key"),
    published: integer("published", { mode: "boolean" }).notNull().default(false),
    updatedBy: text("updated_by").notNull(),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_events_published_dates").on(
      table.published,
      table.startDate,
      table.endDate,
    ),
  ],
);
