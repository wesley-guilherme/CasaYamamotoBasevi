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


test("protected account pages require login and authenticated partners show the coming-soon page", async () => {
  const { default: worker } = await import(new URL('../dist/server/index.js', import.meta.url).href);
  const env = { ASSETS: { fetch: async () => new Response('Not found', { status: 404 }) } };
  const context = { waitUntil() {}, passThroughOnException() {} };
  for (const path of ['/guia/montar', '/parceiros']) {
    const response = await worker.fetch(new Request('http://localhost' + path, { headers: { accept: 'text/html' } }), env, context);
    assert.ok([302, 303, 307, 308].includes(response.status), path + ' must redirect anonymous visitors');
    assert.equal(new URL(response.headers.get('location'), 'http://localhost').pathname, '/login');
  }
  const headers = { accept: 'text/html', 'oai-authenticated-user-id': 'local-render-test', 'oai-authenticated-user-email': 'casayamamotobasevi@gmail.com' };
  const response = await worker.fetch(new Request('http://localhost/parceiros', { headers }), env, context);
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Parceiros e Benefícios/);
  assert.match(html, /Ainda não temos parcerias disponíveis/);
  assert.match(html, /href="\/privacidade"/);
  assert.doesNotMatch(html, /Consultar benefícios da estadia/);
  const guide = await worker.fetch(new Request('http://localhost/guia/montar', { headers }), env, context);
  assert.equal(guide.status, 200);
  assert.match(await guide.text(), /Gerar meu roteiro/);
});
