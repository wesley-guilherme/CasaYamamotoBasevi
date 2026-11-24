// Testes da rolagem até o calendário, interrupção manual e controle do foco.
import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import ts from "typescript";

const source = ts.transpileModule(readFileSync(new URL("../app/booking-scroll.ts", import.meta.url), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
const { scrollToBooking } = await import("data:text/javascript;base64," + Buffer.from(source).toString("base64"));

// Simula eventos, animação, posição e foco do navegador para verificar a rolagem.
function browser() {
  const frames = new Map();
  const listeners = new Map();
  const positions = [];
  const focus = [];
  let clock = 0;
  let nextFrame = 0;
  const target = { isConnected: true, getBoundingClientRect: () => ({ top: 5000 - window.scrollY }), focus: options => focus.push(options) };
  globalThis.window = {
    scrollY: 0,
    getComputedStyle: () => ({ scrollMarginTop: "96px" }),
    performance: { now: () => clock },
    scrollTo: options => { positions.push(options.top); window.scrollY = options.top; },
    requestAnimationFrame: callback => { frames.set(++nextFrame, callback); return nextFrame; },
    cancelAnimationFrame: id => frames.delete(id),
    addEventListener: (name, callback) => listeners.set(name, callback),
    removeEventListener: name => listeners.delete(name),
    location: { hash: "" },
    history: { state: { existing: true }, pushState: (state, _, hash) => { assert.deepEqual(state, { existing: true }); window.location.hash = hash; } },
  };
  return { target, positions, focus, frames, listeners, advance(time) { clock = time; const callbacks = [...frames.values()]; frames.clear(); callbacks.forEach(callback => callback(clock)); } };
}

// Confere a animação e o foco somente após chegar ao calendário.
test("moves progressively across frames and focuses the calendar only after arrival", () => {
  const env = browser();
  scrollToBooking(env.target);
  assert.equal(window.scrollY, 0);
  assert.equal(window.location.hash, "");
  for (const time of [100, 300, 600, 900]) env.advance(time);
  assert.ok(env.positions.every((position, index) => position > 0 && position < 4904 && (index === 0 || position > env.positions[index - 1])));
  assert.equal(env.focus.length, 0);
  env.advance(1600);
  assert.equal(window.scrollY, 4904);
  assert.deepEqual(env.focus, [{ preventScroll: true }]);
  assert.equal(window.location.hash, "#escolher-datas");
  assert.equal(env.frames.size, 0);
  assert.equal(env.listeners.size, 0);
});

// Confere o cancelamento por rolagem manual sem alterar o foco.
test("manual scrolling interrupts the animation without jumping or moving focus", () => {
  const env = browser();
  scrollToBooking(env.target);
  env.advance(300);
  const interruptedAt = window.scrollY;
  env.listeners.get("wheel")();
  env.advance(1600);
  assert.equal(window.scrollY, interruptedAt);
  assert.equal(env.focus.length, 0);
  assert.equal(window.location.hash, "");
  assert.equal(env.listeners.size, 0);
});

// Confere a substituição da animação após um novo clique.
test("a repeated click replaces the pending animation and keeps the final target aligned", () => {
  const env = browser();
  scrollToBooking(env.target);
  env.advance(300);
  scrollToBooking(env.target);
  assert.equal(env.frames.size, 1);
  env.advance(2000);
  assert.equal(window.scrollY, 4904);
  assert.equal(env.focus.length, 1);
});
