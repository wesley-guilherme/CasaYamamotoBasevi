// Definição das tabelas, relacionamentos e índices do banco de dados do site.
import { sql } from "drizzle-orm";
import { check, index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

// Tabela do destaque de evento configurável na página inicial.
export const homeEventCard = sqliteTable("home_event_card", {
  id: integer("id").primaryKey(),
  month: integer("month").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull(),
  updatedBy: text("updated_by").notNull(),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  check("home_event_card_singleton", sql`${table.id} = 1`),
  check("home_event_card_month", sql`${table.month} BETWEEN 1 AND 12`),
]);

// Tabela dos eventos, períodos, cartazes e informações de publicação.
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

// Tabela das categorias que organizam os estabelecimentos parceiros.
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

// Tabela dos parceiros, benefícios e canais de contato vinculados às categorias.
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

// Tabela dos períodos de reserva e dos feriados apresentados como sugestões.
export const houseAgenda = sqliteTable("house_agenda", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  kind: text("kind", { enum: ["reservation", "holiday"] }).notNull(),
  title: text("title").notNull(),
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  description: text("description").notNull().default(""),
  published: integer("published", { mode: "boolean" }).notNull().default(true),
  responsible: text("responsible").notNull().default(""),
  email: text("email").notNull().default(""),
  city: text("city").notNull().default(""),
  state: text("state").notNull().default(""),
  rentalOrigin: text("rental_origin").notNull().default(""),
  rentalAmountCents: integer("rental_amount_cents"),
  updatedBy: text("updated_by").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [index("idx_house_agenda_kind_dates").on(table.kind,table.published,table.startDate,table.endDate)]);

// Tabela das origens de reserva com chave normalizada para evitar duplicações.
export const rentalOrigins = sqliteTable("rental_origins", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  nameKey: text("name_key").notNull(),
}, (table) => [uniqueIndex("idx_rental_origins_name_key").on(table.nameKey)]);

// Tabela das contas individuais, papéis e situação de acesso.
export const accessAccounts = sqliteTable("access_accounts", {
  id: text("id").primaryKey(),
  authId: text("auth_id"),
  email: text("email").notNull(),
  name: text("name").notNull(),
  role: text("role", { enum: ["host", "guest", "partner"] }).notNull(),
  blocked: integer("blocked").notNull().default(0),
  verifiedAt: text("verified_at"),
  invitedAt: text("invited_at"),
  lastLoginAt: text("last_login_at"),
}, table => [uniqueIndex("access_accounts_email").on(table.email), uniqueIndex("access_accounts_auth_id").on(table.authId), check("access_accounts_role", sql`${table.role} IN ('host', 'guest', 'partner')`)]);

// Tabela de hashes de sessão, contas vinculadas e prazo de expiração.
export const accessSessions = sqliteTable("access_sessions", {
  tokenHash: text("token_hash").primaryKey(),
  accountId: text("account_id").notNull().references(() => accessAccounts.id, { onDelete: "cascade" }),
  expiresAt: integer("expires_at").notNull(),
}, table => [index("access_sessions_account").on(table.accountId), index("access_sessions_expiry").on(table.expiresAt)]);

// Vínculo entre contas individuais e reservas da agenda.
export const accessReservations = sqliteTable("access_reservations", {
  reservationId: integer("reservation_id").primaryKey().references(() => houseAgenda.id, { onDelete: "cascade" }),
  accountId: text("account_id").notNull().references(() => accessAccounts.id, { onDelete: "cascade" }),
}, table => [index("access_reservations_account").on(table.accountId)]);

// Contadores e expiração das janelas de limite de tentativas.
export const accessRateLimits = sqliteTable("access_rate_limits", {
  key: text("key").primaryKey(),
  attempts: integer("attempts").notNull(),
  expiresAt: integer("expires_at").notNull(),
});

// Histórico do responsável e das ações administrativas sobre contas.
export const accessAudit = sqliteTable("access_audit", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  actor: text("actor").notNull(),
  action: text("action").notNull(),
  accountId: text("account_id").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
