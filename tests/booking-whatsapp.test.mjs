import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import ts from "typescript";

const compile = (source) => "data:text/javascript;base64," + Buffer.from(ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText).toString("base64");
const agenda = compile(readFileSync(new URL("../app/agenda/agenda-data.ts", import.meta.url), "utf8"));
const whatsapp = compile(readFileSync(new URL("../app/admin/parceiros/whatsapp-link.ts", import.meta.url), "utf8"));
const source = readFileSync(new URL("../app/booking-whatsapp.ts", import.meta.url), "utf8")
  .replace('"./agenda/agenda-data"', JSON.stringify(agenda))
  .replace('"./admin/parceiros/whatsapp-link"', JSON.stringify(whatsapp));
const { buildBookingWhatsAppLink } = await import(compile(source));

test("addresses the host with the requested message, accents, line breaks and full dates", () => {
  const url = new URL(buildBookingWhatsAppLink("2026-11-12", "2026-11-16", 6, "2026-11-05"));
  assert.equal(url.origin + url.pathname, "https://wa.me/5573998376874");
  assert.equal(url.searchParams.get("text"), "Olá tudo bem,\nTenho interesse em alugar a casa\nDo dia 12 de novembro de 2026 ao dia 16 de novembro de 2026\nQuantidade de hóspedes: 6");
});

test("preserves calendar dates across years and leap days", () => {
  const newYear = new URL(buildBookingWhatsAppLink("2026-12-31", "2027-01-03", 14, "2026-11-05"));
  assert.match(newYear.searchParams.get("text"), /31 de dezembro de 2026 ao dia 3 de janeiro de 2027/);
  const leapDay = new URL(buildBookingWhatsAppLink("2028-02-29", "2028-03-01", 1, "2028-02-29"));
  assert.match(leapDay.searchParams.get("text"), /29 de fevereiro de 2028 ao dia 1 de março de 2028/);
});

test("does not create a conversation with missing, invalid, past or reversed dates", () => {
  for (const [start, end] of [["", ""], ["2026-11-12", ""], ["2026-02-30", "2026-03-02"], ["2026-11-04", "2026-11-08"], ["2026-11-12", "2026-11-12"], ["2026-11-12", "2026-11-10"]]) {
    assert.equal(buildBookingWhatsAppLink(start, end, 2, "2026-11-05"), null);
  }
});

test("requires an integer guest count within the house capacity", () => {
  for (const guests of [0, -1, 15, 1.5, NaN, Infinity]) {
    assert.equal(buildBookingWhatsAppLink("2026-11-12", "2026-11-16", guests, "2026-11-05"), null);
  }
});
