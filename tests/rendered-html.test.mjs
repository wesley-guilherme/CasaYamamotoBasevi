import assert from "node:assert/strict";
import test from "node:test";

const developmentPreviewMeta =
  /<meta(?=[^>]*\bname=["']codex-preview["'])(?=[^>]*\bcontent=["']development["'])[^>]*>/i;

test("renders the public site with working footer destinations and production metadata", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  const response = await worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );

  assert.equal(response.status, 200);
  assert.match(
    response.headers.get("content-type") ?? "",
    /^text\/html\b/i,
  );
  const html = await response.text();
  assert.doesNotMatch(html, developmentPreviewMeta);
  assert.match(html, /Casa Yamamoto Basevi/);
  assert.match(html, /href="\/privacidade"/);
  assert.match(html, /href="\/termos"/);
  assert.match(html, /Desenvolvido por/);
  assert.match(html, /https:\/\/www\.linkedin\.com\/in\/wesley-guilherme-b0535462\//);
  assert.match(html, /https:\/\/www\.instagram\.com\/wesley\.guilherme\//);

  for (const [path, heading] of [["/privacidade", "Aviso de Privacidade"], ["/termos", "Termos de Uso"]]) {
    const page = await worker.fetch(
      new Request(`http://localhost${path}`, { headers: { accept: "text/html" } }),
      { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
      { waitUntil() {}, passThroughOnException() {} },
    );
    assert.equal(page.status, 200, path);
    const pageHtml = await page.text();
    assert.match(pageHtml, new RegExp(`<h1[^>]*>${heading}</h1>`));
    assert.match(pageHtml, /href="\/#rodape"/);
    assert.doesNotMatch(pageHtml, developmentPreviewMeta);
  }
});
