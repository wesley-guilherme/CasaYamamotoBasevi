// Testes do HTML e das respostas HTTP gerados pelo site compilado.
import assert from "node:assert/strict";
import test from "node:test";
import { loadBuiltWorker } from "./helpers/cloudflare-runtime.mjs";

const developmentPreviewMeta =
  /<meta(?=[^>]*\bname=["']codex-preview["'])(?=[^>]*\bcontent=["']development["'])[^>]*>/i;

// Confere o HTML público, o rodapé e os metadados de produção.
test("renders the public site with working footer destinations and production metadata", async () => {
  // Usa o pacote compilado com um ambiente isolado por requisição, como no Worker real.
  const worker = await loadBuiltWorker(`${process.pid}-${Date.now()}`);

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
    assert.equal((pageHtml.match(/>Voltar ao site<\/a>/g) || []).length, 1, 'legal pages have only one return link');
    assert.match(pageHtml, /class="album-breadcrumb" href="\/#rodape">Voltar ao site<\/a>/);
    if (path === '/privacidade') {
      assert.doesNotMatch(pageHtml, /acesso administrativo com conta ChatGPT/);
      assert.match(pageHtml, /acesso por e-mail e senha/);
    }
    assert.doesNotMatch(pageHtml, developmentPreviewMeta);
  }
});


// Confere páginas protegidas e estados de carregamento dos parceiros.
test("protected account pages require login and partners distinguish unavailable data from empty listings", async () => {
  const worker = await loadBuiltWorker();
  const env = { ASSETS: { fetch: async () => new Response('Not found', { status: 404 }) } };
  const context = { waitUntil() {}, passThroughOnException() {} };
  for (const path of ['/guia/montar', '/parceiros']) {
    const response = await worker.fetch(new Request('http://localhost' + path, { headers: { accept: 'text/html' } }), env, context);
    assert.ok([302, 303, 307, 308].includes(response.status), path + ' must redirect anonymous visitors');
    assert.equal(new URL(response.headers.get('location'), 'http://localhost').pathname, '/login');
  }
  const headers = { accept: 'text/html', 'oai-authenticated-user-id': 'local-render-test', 'oai-authenticated-user-email': 'casayamamotobasevi@gmail.com' };
  // Apenas esta simulação explícita representa a hospedagem antiga que autentica cabeçalhos da plataforma.
  const platformEnv = { ...env, AUTH_PLATFORM_HEADERS_ENABLED: 'true' };
  const response = await worker.fetch(new Request('http://localhost/parceiros', { headers }), platformEnv, context);
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Parceiros e Benefícios/);
  assert.match(html, /Não foi possível carregar os parceiros agora/);
  assert.doesNotMatch(html, /Ainda não temos parcerias disponíveis/);
  assert.equal((html.match(/<footer\b/g) || []).length, 1);
  assert.doesNotMatch(html, /Voltar ao início/);
  assert.match(html, /href="\/privacidade"/);
  assert.doesNotMatch(html, /Consultar benefícios da estadia/);
  const guide = await worker.fetch(new Request('http://localhost/guia/montar', { headers }), platformEnv, context);
  assert.equal(guide.status, 200);
  assert.match(await guide.text(), /Gerar meu roteiro/);
});

// O servidor público não transforma cabeçalhos forjados em uma sessão de anfitrião.
test('Cloudflare public routes ignore forged ChatGPT administrator headers', async () => {
  const worker = await loadBuiltWorker();
  const headers = { accept: 'text/html', 'oai-authenticated-user-id': 'forged-owner', 'oai-authenticated-user-email': 'casayamamotobasevi@gmail.com' };
  const env = { AUTH_PLATFORM_HEADERS_ENABLED: 'false', ASSETS: { fetch: async () => new Response('Not found', { status: 404 }) } };
  const context = { waitUntil() {}, passThroughOnException() {} };
  // As páginas restritas mantêm o pedido de login mesmo com e-mail administrativo no cabeçalho.
  for (const path of ['/admin/agenda', '/admin/eventos', '/admin/parceiros', '/admin/usuarios', '/guia/montar']) {
    const response = await worker.fetch(new Request('http://localhost' + path, { headers }), env, context);
    assert.ok([302, 303, 307, 308].includes(response.status), path);
    assert.equal(new URL(response.headers.get('location'), 'http://localhost').pathname, '/login');
  }
  // A API de identidade continua anônima e não revela uma conta sem autenticação real.
  const response = await worker.fetch(new Request('http://localhost/api/auth/me', { headers }), env, context);
  assert.equal((await response.json()).user, null);
});

// Mantém as imagens acessíveis sem contratar o serviço opcional de transformação na conta Cloudflare.
test('image endpoint preserves original image without an IMAGES binding', async () => {
  const worker = await loadBuiltWorker();
  const content = new Uint8Array([0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50]);
  const env = { ASSETS: { fetch: async () => new Response(content, { headers: { 'Content-Type': 'image/webp' } }) } };
  const context = { waitUntil() {}, passThroughOnException() {} };
  const response = await worker.fetch(new Request('http://localhost/_vinext/image?url=%2Fphoto.webp&w=640&q=75'), env, context);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('content-type'), 'image/webp');
  assert.deepEqual(new Uint8Array(await response.arrayBuffer()), content);
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
});

// Confere o retorno HTTP 404 e a presença de um único rodapé.
test('broken root and nested URLs render the branded page with HTTP 404 and one footer', async () => {
  const worker = await loadBuiltWorker();
  for (const path of ['/pagina-que-nao-existe','/parceiros/pagina-que-nao-existe','/guia/pagina-que-nao-existe']) {
    const response = await worker.fetch(new Request('http://localhost'+path,{headers:{accept:'text/html'}}),{ASSETS:{fetch:async()=>new Response('Not found',{status:404})}},{waitUntil(){},passThroughOnException(){}});
    assert.equal(response.status,404,path);
    const html=await response.text();
    assert.match(html,/<h1[^>]*>Ops! Página não encontrada<\/h1>/,path);
    assert.equal((html.match(/<footer\b/g)||[]).length,1,path);
  }
});
