import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

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

export const partnerCategories = sqliteTable(
  "partner_categories",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    position: integer("position").notNull().default(0),
    active: integer("active", { mode: "boolean" }).notNull().default(true),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex("idx_partner_categories_slug").on(table.slug),
    index("idx_partner_categories_active_position").on(table.active, table.position),
  ],
);

export const partners = sqliteTable(
  "partners",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    categoryId: integer("category_id")
      .notNull()
      .references(() => partnerCategories.id),
    name: text("name").notNull(),
    description: text("description").notNull().default(""),
    address: text("address").notNull().default(""),
    benefit: text("benefit").notNull(),
    openingHours: text("opening_hours").notNull().default(""),
    locationUrl: text("contact_url"),
    instagramUrl: text("instagram_url"),
    whatsappUrl: text("whatsapp_url"),
    imageKey: text("image_key"),
    published: integer("published", { mode: "boolean" }).notNull().default(false),
    updatedBy: text("updated_by").notNull(),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("idx_partners_published_category_name").on(
      table.published,
      table.categoryId,
      table.name,
    ),
  ],
);

export const houseAgenda = sqliteTable("house_agenda", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  kind: text("kind", { enum: ["reservation", "holiday"] }).notNull(),
  title: text("title").notNull(),
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  description: text("description").notNull().default(""),
  published: integer("published", { mode: "boolean" }).notNull().default(true),
  updatedBy: text("updated_by").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [index("idx_house_agenda_kind_dates").on(table.kind,table.published,table.startDate,table.endDate)]);
