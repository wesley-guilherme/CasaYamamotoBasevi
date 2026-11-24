// Consultas e manutenção de parceiros, categorias e referências de imagens no D1.
// Categorias criadas inicialmente para organizar os parceiros da casa.
export const DEFAULT_PARTNER_CATEGORIES = [
  "Restaurantes",
  "Bares",
  "Barracas",
  "Barracas de Praia",
  "Passeios",
] as const;

// Categoria persistida com ordem de exibição, estado ativo e datas de atualização.
export type PartnerCategoryRecord = {
  id: number;
  name: string;
  slug: string;
  position: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

// Parceiro persistido com sua categoria, benefício e canais de contato.
export type PartnerRecord = {
  id: number;
  categoryId: number;
  categoryName: string;
  categorySlug: string;
  name: string;
  description: string;
  address: string;
  benefit: string;
  openingHours: string;
  locationUrl: string | null;
  instagramUrl: string | null;
  whatsappUrl: string | null;
  imageKey: string | null;
  published: boolean;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
};

// Campos recebidos para criar ou atualizar o cadastro de um parceiro.
export type PartnerInput = Pick<
  PartnerRecord,
  | "categoryId"
  | "name"
  | "description"
  | "address"
  | "benefit"
  | "openingHours"
  | "locationUrl"
  | "instagramUrl"
  | "whatsappUrl"
  | "published"
>;

// Formato das colunas retornadas pelo banco antes da conversão para os dados da aplicação.
type CategoryRow = {
  id: number;
  name: string;
  slug: string;
  position: number;
  active: number;
  created_at: string;
  updated_at: string;
};

// Formato das colunas retornadas pelo banco antes da conversão para os dados da aplicação.
type PartnerRow = {
  id: number;
  category_id: number;
  category_name: string;
  category_slug: string;
  name: string;
  description: string;
  address: string;
  benefit: string;
  opening_hours: string;
  contact_url: string | null;
  instagram_url: string | null;
  whatsapp_url: string | null;
  image_key: string | null;
  published: number;
  updated_by: string;
  created_at: string;
  updated_at: string;
};

// Colunas compartilhadas pelas consultas de categorias.
const CATEGORY_COLUMNS = "id, name, slug, position, active, created_at, updated_at";
// Colunas de parceiros e categorias necessárias à montagem dos registros.
const PARTNER_COLUMNS = `
  p.id, p.category_id, c.name AS category_name, c.slug AS category_slug,
  p.name, p.description, p.address, p.benefit, p.opening_hours,
  p.contact_url, p.instagram_url, p.whatsapp_url,
  p.image_key, p.published, p.updated_by,
  p.created_at, p.updated_at
`;

// Obtém o banco D1 configurado e sinaliza indisponibilidade antes de consultar os dados.
async function getDatabase(): Promise<D1Database> {
  const { env } = await import("cloudflare:workers");
  if (!env.DB) throw new Error("Os parceiros estão temporariamente indisponíveis.");
  return env.DB;
}

// Converte o nome em um identificador de URL sem acentos ou separadores repetidos.
function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

// Converte a linha SQL da categoria para o modelo usado pela aplicação.
function mapCategory(row: CategoryRow): PartnerCategoryRecord {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    position: row.position,
    active: row.active === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Converte a linha SQL do parceiro e sua categoria para o modelo da aplicação.
function mapPartner(row: PartnerRow): PartnerRecord {
  return {
    id: row.id,
    categoryId: row.category_id,
    categoryName: row.category_name,
    categorySlug: row.category_slug,
    name: row.name,
    description: row.description,
    address: row.address,
    benefit: row.benefit,
    openingHours: row.opening_hours,
    locationUrl: row.contact_url,
    instagramUrl: row.instagram_url,
    whatsappUrl: row.whatsapp_url,
    imageKey: row.image_key,
    published: row.published === 1,
    updatedBy: row.updated_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Insere as categorias predefinidas sem duplicar as já cadastradas.
export async function ensureDefaultPartnerCategories(): Promise<void> {
  const database = await getDatabase();
  const statements = DEFAULT_PARTNER_CATEGORIES.map((name, position) =>
    database
      .prepare(
        `INSERT INTO partner_categories (name, slug, position, active)
         VALUES (?, ?, ?, 1)
         ON CONFLICT(slug) DO NOTHING`,
      )
      .bind(name, slugify(name), position),
  );
  await (database as D1Database & {
    batch(statements: D1PreparedStatement[]): Promise<unknown[]>;
  }).batch(statements);
}

// Lista categorias na ordem de exibição, incluindo inativas quando solicitado.
export async function listPartnerCategories(includeInactive = false): Promise<PartnerCategoryRecord[]> {
  const result = await (await getDatabase())
    .prepare(
      `SELECT ${CATEGORY_COLUMNS}
       FROM partner_categories
       ${includeInactive ? "" : "WHERE active = 1"}
       ORDER BY position ASC, name COLLATE NOCASE ASC, id ASC`,
    )
    .all<CategoryRow>();
  return result.results.map(mapCategory);
}

// Cria uma categoria com slug e posição de exibição.
export async function createPartnerCategory(name: string): Promise<PartnerCategoryRecord> {
  const database = await getDatabase();
  const positionRow = await database
    .prepare("SELECT COALESCE(MAX(position), -1) + 1 AS next_position FROM partner_categories")
    .first<{ next_position: number }>();
  const row = await database
    .prepare(
      `INSERT INTO partner_categories (name, slug, position, active)
       VALUES (?, ?, ?, 1)
       RETURNING ${CATEGORY_COLUMNS}`,
    )
    .bind(name, slugify(name), positionRow?.next_position ?? 0)
    .first<CategoryRow>();
  if (!row) throw new Error("Não foi possível cadastrar a categoria.");
  return mapCategory(row);
}

// Atualiza o nome, o slug e o estado ativo de uma categoria.
export async function updatePartnerCategory(
  id: number,
  input: { name: string; active: boolean },
): Promise<PartnerCategoryRecord | null> {
  const row = await (await getDatabase())
    .prepare(
      `UPDATE partner_categories
       SET name = ?, slug = ?, active = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?
       RETURNING ${CATEGORY_COLUMNS}`,
    )
    .bind(input.name, slugify(input.name), input.active ? 1 : 0, id)
    .first<CategoryRow>();
  return row ? mapCategory(row) : null;
}

// Impede a remoção de categorias em uso antes de executar a exclusão.
export async function deletePartnerCategory(id: number): Promise<boolean> {
  const database = await getDatabase();
  const usage = await database
    .prepare("SELECT COUNT(*) AS total FROM partners WHERE category_id = ?")
    .bind(id)
    .first<{ total: number }>();
  if ((usage?.total ?? 0) > 0) {
    throw new Error("Mova ou exclua os parceiros desta categoria antes de removê-la.");
  }
  const result = await database.prepare("DELETE FROM partner_categories WHERE id = ?").bind(id).run();
  return result.meta.changes > 0;
}

// Lista os parceiros publicados cujas categorias estão ativas.
export async function listPublishedPartners(): Promise<PartnerRecord[]> {
  const result = await (await getDatabase())
    .prepare(
      `SELECT ${PARTNER_COLUMNS}
       FROM partners p
       INNER JOIN partner_categories c ON c.id = p.category_id
       WHERE p.published = 1 AND c.active = 1
       ORDER BY c.position ASC, p.name COLLATE NOCASE ASC, p.id ASC`,
    )
    .all<PartnerRow>();
  return result.results.map(mapPartner);
}

// Lista todos os parceiros e suas categorias para manutenção administrativa.
export async function listAllPartners(): Promise<PartnerRecord[]> {
  const result = await (await getDatabase())
    .prepare(
      `SELECT ${PARTNER_COLUMNS}
       FROM partners p
       INNER JOIN partner_categories c ON c.id = p.category_id
       ORDER BY p.updated_at DESC, p.id DESC`,
    )
    .all<PartnerRow>();
  return result.results.map(mapPartner);
}

// Busca um parceiro pelo identificador com os dados de sua categoria.
export async function getPartner(id: number): Promise<PartnerRecord | null> {
  const row = await (await getDatabase())
    .prepare(
      `SELECT ${PARTNER_COLUMNS}
       FROM partners p
       INNER JOIN partner_categories c ON c.id = p.category_id
       WHERE p.id = ?`,
    )
    .bind(id)
    .first<PartnerRow>();
  return row ? mapPartner(row) : null;
}

// Insere o parceiro e registra a identidade responsável pelo cadastro.
export async function createPartner(input: PartnerInput, updatedBy: string): Promise<PartnerRecord> {
  const row = await (await getDatabase())
    .prepare(
      `INSERT INTO partners (
         category_id, name, description, address, benefit, opening_hours,
         contact_url, instagram_url, whatsapp_url, published, updated_by
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       RETURNING id`,
    )
    .bind(
      input.categoryId,
      input.name,
      input.description,
      input.address,
      input.benefit,
      input.openingHours,
      input.locationUrl,
      input.instagramUrl,
      input.whatsappUrl,
      input.published ? 1 : 0,
      updatedBy,
    )
    .first<{ id: number }>();
  if (!row) throw new Error("Não foi possível cadastrar o parceiro.");
  const partner = await getPartner(row.id);
  if (!partner) throw new Error("Não foi possível carregar o parceiro cadastrado.");
  return partner;
}

// Atualiza o cadastro do parceiro e retorna o registro persistido.
export async function updatePartner(
  id: number,
  input: PartnerInput,
  updatedBy: string,
): Promise<PartnerRecord | null> {
  const result = await (await getDatabase())
    .prepare(
      `UPDATE partners
       SET category_id = ?, name = ?, description = ?, address = ?, benefit = ?,
           opening_hours = ?, contact_url = ?, instagram_url = ?, whatsapp_url = ?,
           published = ?, updated_by = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
    )
    .bind(
      input.categoryId,
      input.name,
      input.description,
      input.address,
      input.benefit,
      input.openingHours,
      input.locationUrl,
      input.instagramUrl,
      input.whatsappUrl,
      input.published ? 1 : 0,
      updatedBy,
      id,
    )
    .run();
  return result.meta.changes > 0 ? getPartner(id) : null;
}

// Atualiza a referência da imagem e a data de modificação do parceiro.
export async function setPartnerImage(id: number, key: string | null): Promise<void> {
  await (await getDatabase())
    .prepare("UPDATE partners SET image_key = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
    .bind(key, id)
    .run();
}

// Exclui o parceiro e informa se um registro foi removido.
export async function deletePartner(id: number): Promise<boolean> {
  const result = await (await getDatabase()).prepare("DELETE FROM partners WHERE id = ?").bind(id).run();
  return result.meta.changes > 0;
}
