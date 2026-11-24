// Verifica a segurança da exportação SQL, a preservação das relações e a rejeição de cópias incompletas.
import assert from "node:assert/strict";
import test from "node:test";
import { DatabaseSync } from "node:sqlite";
import { migrationTables, snapshotSql, snapshotUploads } from "../scripts/migration-snapshot.mjs";

// Monta registros artificiais para testar a migração sem incluir dados pessoais do site no repositório.
function snapshot() {
  const tables = Object.fromEntries(migrationTables.map(name => [name, { columns: ["id"], rows: [] }]));
  tables.partner_categories = { columns: ["id", "name"], rows: [{ id: 4, name: "Café d'Água'); DROP TABLE partners; --" }] };
  tables.partners = { columns: ["id", "category_id", "image_key"], rows: [{ id: 8, category_id: 4, image_key: "partners/8/image" }] };
  tables.events = { columns: ["id", "poster_key", "published"], rows: [{ id: 3, poster_key: "events/3/poster", published: 1 }] };
  return { tables };
}

// Confere que textos com SQL são dados e que as referências mantêm os IDs originais com as chaves ativas.
test("migration imports apostrophes and SQL-like content without losing relationships", () => {
  const data = snapshot();
  const db = new DatabaseSync(":memory:");
  db.exec("PRAGMA foreign_keys=ON; CREATE TABLE partner_categories(id INTEGER PRIMARY KEY, name TEXT); CREATE TABLE partners(id INTEGER PRIMARY KEY, category_id INTEGER REFERENCES partner_categories(id), image_key TEXT); CREATE TABLE events(id INTEGER PRIMARY KEY, poster_key TEXT, published INTEGER);");
  for (const table of migrationTables.filter(name => !["partner_categories", "partners", "events"].includes(name))) db.exec(`CREATE TABLE ${table}(id INTEGER PRIMARY KEY)`);
  db.exec(snapshotSql(data));
  assert.equal(db.prepare("SELECT name FROM partner_categories WHERE id=4").get().name, data.tables.partner_categories.rows[0].name);
  assert.equal(db.prepare("SELECT category_id FROM partners WHERE id=8").get().category_id, 4);
  assert.equal(db.prepare("SELECT count(*) AS total FROM events").get().total, 1);
  assert.throws(() => db.exec(snapshotSql(data)), /UNIQUE/);
  db.close();
});

// Recusa nomes não confiáveis, tabelas ausentes e valores omitidos em vez de gerar uma cópia parcial.
test("migration refuses missing tables, missing cells and unsafe identifiers", () => {
  const data = snapshot();
  delete data.tables.access_accounts;
  assert.throws(() => snapshotSql(data), /Tabela ausente/);
  const missing = snapshot();
  delete missing.tables.partners.rows[0].category_id;
  assert.throws(() => snapshotSql(missing), /Registro incompleto/);
  const unsafe = snapshot();
  unsafe.tables.events.columns = ["id); DROP TABLE events; --"];
  assert.throws(() => snapshotSql(unsafe), /Identificador/);
});

// Mantém as chaves R2 e os caminhos de consulta sem exportar sessões ou credenciais de autenticação.
test("migration inventories uploaded images and excludes session tables", () => {
  assert.deepEqual(snapshotUploads(snapshot()).map(item => item.key), ["events/3/poster", "partners/8/image"]);
  assert.ok(!migrationTables.includes("access_sessions"));
  assert.ok(!migrationTables.includes("access_rate_limits"));
});
