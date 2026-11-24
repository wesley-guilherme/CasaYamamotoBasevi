// Converte a cópia de dados do Sites em SQL de importação e inventário dos arquivos necessários à migração.
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

// Insere tabelas de referência antes dos registros dependentes e exclui sessões e limites temporários.
export const migrationTables = [
  "partner_categories", "partners", "events", "home_event_card", "house_agenda",
  "rental_origins", "access_accounts", "access_reservations", "access_audit",
];

// Escapa identificadores validados e impede que nomes de tabelas ou colunas sejam interpretados como SQL.
function identifier(value) {
  if (typeof value !== "string" || !/^[a-z_][a-z0-9_]*$/.test(value)) throw new Error("Identificador de banco inválido.");
  return `"${value}"`;
}

// Preserva nulos, números e textos com apóstrofos sem executar conteúdo armazenado nos registros.
function literal(value) {
  if (value === null) return "NULL";
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  if (typeof value === "string" && !value.includes("\0")) return "'" + value.replaceAll("'", "''") + "'";
  throw new Error("A cópia contém um valor não suportado; revise a exportação antes de importar.");
}

// Gera apenas inserções para um banco novo, preservando IDs e falhando em vez de sobrescrever registros existentes.
export function snapshotSql(snapshot) {
  const output = ["-- Dados de migração da Casa Yamamoto Basevi; importar somente em um D1 novo com o esquema aplicado.", "PRAGMA foreign_keys=ON;"];
  for (const table of migrationTables) {
    const data = snapshot.tables?.[table];
    if (!Array.isArray(data?.rows) || !Array.isArray(data?.columns) || !data.columns.length) {
      throw new Error(`Tabela ausente ou incompleta na cópia: ${table}.`);
    }
    const columns = data.columns.map(identifier).join(", ");
    output.push(`-- ${table}: ${data.rows.length} registro(s).`);
    for (const row of data.rows) {
      // Não inventa valores quando uma coluna foi omitida ou truncada na leitura da origem.
      if (data.columns.some(column => !Object.hasOwn(row, column))) throw new Error(`Registro incompleto em ${table}.`);
      output.push(`INSERT INTO ${identifier(table)} (${columns}) VALUES (${data.columns.map(column => literal(row[column])).join(", ")});`);
    }
  }
  return output.join("\n") + "\n";
}

// Identifica as imagens referenciadas no banco; o manifesto não afirma que os objetos já foram copiados.
export function snapshotUploads(snapshot) {
  const assets = [];
  for (const row of snapshot.tables.events.rows) {
    if (row.poster_key) assets.push({ key: row.poster_key, path: `/api/events/${row.id}/poster`, published: row.published === 1 });
  }
  for (const row of snapshot.tables.partners.rows) {
    if (row.image_key) assets.push({ key: row.image_key, path: `/api/partners/${row.id}/image`, requiresAccount: true });
  }
  return assets;
}

// A importação do módulo pelos testes não lê dados pessoais nem grava arquivos automaticamente.
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const [sourcePath, sqlPath, uploadsPath] = process.argv.slice(2);
    if (!sourcePath || !sqlPath || !uploadsPath) throw new Error("Informe o JSON de origem, o SQL de destino e o manifesto de arquivos.");
    const snapshot = JSON.parse(readFileSync(sourcePath, "utf8"));
    const sql = snapshotSql(snapshot);
    const uploads = snapshotUploads(snapshot);
    // Os destinos locais devem ficar em uma pasta ignorada pelo Git, como .wrangler/migration.
    writeFileSync(sqlPath, sql);
    writeFileSync(uploadsPath, JSON.stringify({ capturedAt: snapshot.capturedAt, assets: uploads }, null, 2) + "\n");
    console.log(`SQL preparado: ${migrationTables.length} tabelas. Arquivos referenciados: ${uploads.length}.`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : "Não foi possível preparar a cópia de migração.");
    process.exitCode = 1;
  }
}
