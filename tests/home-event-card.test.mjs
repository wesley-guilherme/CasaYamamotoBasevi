// Testes do modelo e da persistência do destaque de evento da página inicial.
import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import ts from "typescript";

const compile = source => "data:text/javascript;base64," + Buffer.from(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText).toString("base64");
const modelUrl = compile(readFileSync(new URL("../app/home-event-card-data.ts", import.meta.url), "utf8"));
const model = await import(modelUrl);
const sqlite = new DatabaseSync(":memory:");
sqlite.exec(readFileSync(new URL("../drizzle/0006_easy_sauron.sql", import.meta.url), "utf8"));
globalThis.__homeEventDatabase = { prepare(sql) { return {
  bind(...values) { this.values = values; return this; },
  async first() { return sqlite.prepare(sql).get(...(this.values || [])) || null; },
  async run() { return { meta: sqlite.prepare(sql).run(...(this.values || [])) }; },
}; } };
const databaseSource = readFileSync(new URL("../db/home-event-card.ts", import.meta.url), "utf8")
  .replace('"../app/home-event-card-data"', JSON.stringify(modelUrl))
  .replace(/async function database\(\): Promise<D1Database> \{[\s\S]*?\n\}/, "async function database() { return globalThis.__homeEventDatabase; }");
const db = await import(compile(databaseSource));

// Confere o mês e os campos obrigatórios do destaque de evento.
test("validates months and required text with length limits, trimming input", () => {
  const input = { ...model.defaultHomeEventCard, title: "  Festa de Prado  " };
  assert.equal(model.parseHomeEventCard(input).title, "Festa de Prado");
  for (const month of [0, 13, 1.5, "10", null]) assert.throws(() => model.parseHomeEventCard({ ...input, month }));
  for (const [field, max] of [["title", 120], ["description", 500], ["status", 140]]) {
    assert.throws(() => model.parseHomeEventCard({ ...input, [field]: "  " }));
    assert.throws(() => model.parseHomeEventCard({ ...input, [field]: "x".repeat(max + 1) }));
  }
  for (const value of [null, [], "text"]) assert.throws(() => model.parseHomeEventCard(value));
});

// Confere o conteúdo padrão e a configuração única persistida.
test("empty storage preserves original card; saves and subsequent edits persist in a singleton", async () => {
  assert.deepEqual(await db.getHomeEventCard(), model.defaultHomeEventCard);
  const card = { month: 12, title: "Festival de verão", description: "Música e sabores de Prado.", status: "Confira a programação." };
  await db.saveHomeEventCard(card, "host");
  const reopened = await import(compile(databaseSource + "\n// another request"));
  assert.deepEqual(await reopened.getHomeEventCard(), card);
  assert.equal(sqlite.prepare("SELECT updated_by FROM home_event_card").get().updated_by, "host");
  const edited = { ...card, month: 1, status: "Programação em atualização" };
  await reopened.saveHomeEventCard(edited, "other-host");
  assert.deepEqual(await db.getHomeEventCard(), edited);
  assert.equal(sqlite.prepare("SELECT COUNT(*) AS count FROM home_event_card").get().count, 1);
  assert.throws(() => sqlite.exec("UPDATE home_event_card SET month = 13"));
  assert.throws(() => sqlite.exec("UPDATE home_event_card SET id = 2"));
});

// Confere autorização e validação antes da gravação do destaque.
test("API requires host access and rejects invalid input before writing", async () => {
  let actor = null;
  let writes = 0;
  globalThis.__cardTestActor = () => actor;
  globalThis.__cardTestSave = async card => { writes++; return card; };
  const source = readFileSync(new URL("../app/api/admin/home-event-card/route.ts", import.meta.url), "utf8")
    .replace(/import \{ getAdminActor \} from [^;]+;/, "const getAdminActor = async () => globalThis.__cardTestActor();")
    .replace('"../../../home-event-card-data"', JSON.stringify(modelUrl))
    .replace(/import \{ saveHomeEventCard \} from [^;]+;/, "const saveHomeEventCard = globalThis.__cardTestSave;");
  const route = await import(compile(source));
  const request = body => new Request("http://localhost/api/admin/home-event-card", { method: "PUT", body: JSON.stringify(body) });
  assert.equal((await route.PUT(request(model.defaultHomeEventCard))).status, 401);
  actor = "host";
  assert.equal((await route.PUT(request({ ...model.defaultHomeEventCard, month: 13 }))).status, 400);
  assert.equal(writes, 0);
  const response = await route.PUT(request(model.defaultHomeEventCard));
  assert.equal(response.status, 200);
  assert.deepEqual((await response.json()).card, model.defaultHomeEventCard);
  assert.equal(writes, 1);
});
