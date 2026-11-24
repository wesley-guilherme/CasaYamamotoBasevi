// Testes de autenticação, sessões, convites, recuperação e permissões de acesso.
import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import ts from 'typescript';

const encoded = source => `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`;
const modules = new Map();
// Carrega os módulos TypeScript com dependências simuladas para testar as regras sem serviços externos.
function load(path) {
  path = resolve(path);
  if (modules.has(path)) return modules.get(path);
  let source = ts.transpileModule(readFileSync(path, 'utf8'), { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
  source = source.replace(/(from\s+|import\()(["'])([^"']+)\2/g, (match, prefix, quote, specifier) => {
    let url;
    if (specifier === 'cloudflare:workers') url = encoded('export const env = globalThis.__authEnv;');
    else if (specifier === 'next/headers') url = encoded('export async function headers(){ return globalThis.__authHeaders; }');
    else if (specifier === 'next/navigation') url = encoded('export function redirect(path){ throw new Error("REDIRECT:"+path); }');
    else if (specifier.startsWith('.')) url = load(resolve(dirname(path), specifier + '.ts'));
    else throw new Error('Unexpected import: ' + specifier);
    return prefix + JSON.stringify(url);
  });
  const url = encoded(source); modules.set(path, url); return url;
}

const sql = new DatabaseSync(':memory:');
sql.exec('PRAGMA foreign_keys=ON');
for (const path of readdirSync('drizzle').filter(p => p.endsWith('.sql')).sort()) sql.exec(readFileSync('drizzle/' + path, 'utf8').replaceAll('--> statement-breakpoint', ''));
const db = { prepare(query) { return { values: [], bind(...values) { this.values = values; return this; }, async first() { return sql.prepare(query).get(...this.values) ?? null; }, async all() { return { results: sql.prepare(query).all(...this.values) }; }, async run() { return { meta: sql.prepare(query).run(...this.values) }; } }; } };
// Os cenários legados simulam uma plataforma confiável; a implantação pública desabilita esse caminho.
globalThis.__authEnv = { DB: db, SUPABASE_URL: 'https://auth.example.test', SUPABASE_ANON_KEY: 'public-test', SUPABASE_SERVICE_ROLE_KEY: 'secret-test', AUTH_SITE_URL: 'https://house.example.test', AUTH_EMAIL_ENABLED: 'true', AUTH_PLATFORM_HEADERS_ENABLED: 'true' };
globalThis.__authHeaders = new Headers();
const providerUsers = new Map();
const providerTokens = new Map();
const oneTime = new Map();
const passwords = new Map();
const calls = [];
globalThis.fetch = async (url, options) => {
  const path = new URL(url).pathname;
  const body = JSON.parse(options.body);
  calls.push({ path, body, key: options.headers.apikey, authorization: options.headers.Authorization ?? null });
  const reply = (value, status = 200) => new Response(JSON.stringify(value), { status });
  if (path.endsWith('/invite')) {
    const user = providerUsers.get(body.email) || { id: crypto.randomUUID(), email: body.email, email_confirmed_at: null };
    providerUsers.set(body.email, user); return reply(user);
  }
  if (path.endsWith('/recover')) return reply({});
  if (path.endsWith('/verify')) {
    const entry = oneTime.get(body.token_hash);
    if (!entry || entry.type !== body.type) return reply({}, 400);
    oneTime.delete(body.token_hash);
    const user = providerUsers.get(entry.email); user.email_confirmed_at = new Date().toISOString();
    const access_token = crypto.randomUUID(); providerTokens.set(access_token, user); return reply({ user, access_token });
  }
  if (path.endsWith('/user')) {
    const user = providerTokens.get(options.headers.Authorization.slice(7));
    if (!user) return reply({}, 401);
    passwords.set(user.email, body.password); return reply(user);
  }
  if (path.endsWith('/token')) {
    const user = providerUsers.get(body.email);
    if (!user || passwords.get(body.email) !== body.password) return reply({}, 400);
    return reply({ user, access_token: crypto.randomUUID() });
  }
  throw new Error('Unexpected provider request: ' + path);
};

const policy = await import(load('app/auth-policy.ts'));
const provider = await import(load('app/auth-provider.ts'));
const sessions = await import(load('app/account-session.ts'));
const accounts = await import(load('db/accounts.ts'));
const admin = await import(load('app/api/admin/accounts/route.ts'));
const login = await import(load('app/api/auth/session/route.ts'));
const activate = await import(load('app/api/auth/password/route.ts'));
const recovery = await import(load('app/api/auth/recovery/route.ts'));
const legacyGuest = await import(load('app/api/guest/session/route.ts'));
const legacyAdmin = await import(load('app/api/admin/temporary-session/route.ts'));
const origin = 'https://house.example.test';
const request = (path, body, cookie, method = 'POST', requestOrigin = origin) => new Request(origin + path, { method, headers: { Origin: requestOrigin, 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}) }, ...(method === 'GET' ? {} : { body: JSON.stringify(body) }) });
const nativeOwner = () => { globalThis.__authHeaders = new Headers({ 'oai-authenticated-user-id': 'owner-native', 'oai-authenticated-user-email': 'casayamamotobasevi@gmail.com' }); };
const anonymous = () => { globalThis.__authHeaders = new Headers(); };
const newLink = (email, type = 'invite') => { const token = crypto.randomUUID().replaceAll('-', ''); oneTime.set(token, { email, type }); return token; };
const reservation = (id, email, start, end) => sql.prepare("INSERT INTO house_agenda (id,kind,title,start_date,end_date,published,responsible,email,updated_by) VALUES (?,'reservation','Private title',?,?,1,'Maria Silva',?,'owner')").run(id, start, end, email);
const today = sql.prepare("SELECT date('now','-3 hours') AS today").get().today;
const tomorrow = sql.prepare("SELECT date('now','-3 hours','+1 day') AS day").get().day;
let guestCookie;
let guestId;

// Impede que cabeçalhos enviados por um visitante concedam acesso administrativo na Cloudflare.
test('public Cloudflare rejects forged platform identity unless explicitly trusted', async () => {
  nativeOwner();
  try {
    delete globalThis.__authEnv.AUTH_PLATFORM_HEADERS_ENABLED;
    assert.equal(await sessions.currentAccount(), null);
    globalThis.__authEnv.AUTH_PLATFORM_HEADERS_ENABLED = 'false';
    assert.equal(await sessions.currentAccount(), null);
    assert.equal((await admin.GET(request('/api/admin/accounts', {}, null, 'GET'))).status, 403);
  } finally {
    globalThis.__authEnv.AUTH_PLATFORM_HEADERS_ENABLED = 'true';
    anonymous();
  }
});

// Confere a rejeição de destinos, senhas e origens não permitidos.
test('rejects unsafe redirects, weak passwords, forged origins and shared test passwords', async () => {
  for (const path of ['https://evil.test', '//evil.test', '/\\evil.test', '/api/admin/accounts', '/signin-with-chatgpt']) assert.equal(policy.safeDestination(path), '/parceiros');
  assert.equal(policy.destinationFor('guest', '/admin/agenda'), '/');
  assert.ok(policy.passwordError('short')); assert.equal(policy.passwordError('CasaAb1!'), null);
  assert.equal((await login.POST(request('/api/auth/session', {}, null, 'POST', 'https://evil.test'))).status, 403);
  assert.equal((await legacyGuest.POST()).status, 410); assert.equal((await legacyAdmin.POST()).status, 410);
  assert.equal(await sessions.currentAccount(request('/', {}, 'cyb-guest-access=old; cyb-temporary-admin=old', 'GET')), null);
});

// Confere o comprimento e os grupos de caracteres exigidos nas novas senhas.
test('password rules enforce 8 to 12 characters, uppercase, number and special character without requiring lowercase', async () => {
  for (const value of ['CasaAb1!', 'ABCDEF1!', 'Abcdefgh123!']) assert.equal(policy.passwordError(value), null);
  for (const value of ['', 'Abcd1!x', 'Abcdefghi123!', 'abcdef1!', 'Abcdefg!', 'Abcdef12', 'Abcdef1 ', 'Abcdef1\u0000', 'A1aaaaa\u0301']) assert.ok(policy.passwordError(value));
  for (const role of ['host', 'guest', 'partner']) for (const target of [undefined, '/admin/agenda', '/guia/montar', '//evil.test']) assert.equal(policy.destinationFor(role, target), '/');
  const before = calls.length;
  for (const password of ['abcdef1!', 'Abcdef12', 'Abcdefghi123!']) assert.equal((await activate.POST(request('/api/auth/password', { tokenHash: 'a'.repeat(32), type: 'invite', password }))).status, 400);
  assert.equal(calls.length, before, 'invalid passwords must not consume provider tokens');
});

// Confere o redirecionamento de visitantes anônimos para o login.
test('pages requiring an account redirect anonymous visitors to the unified login', async () => {
  anonymous();
  await assert.rejects(sessions.requireAccount(), /REDIRECT:\/login$/);
});

// Confere a ativação explícita do serviço de e-mails.
test('email delivery stays paused until explicitly configured and enabled', async () => {
  const before = calls.length;
  globalThis.__authEnv.AUTH_EMAIL_ENABLED = 'false';
  nativeOwner();
  assert.equal((await admin.POST(request('/api/admin/accounts', { reservationId: 101 }))).status, 503);
  assert.equal((await recovery.POST(request('/api/auth/recovery', { email: 'someone@example.test' }))).status, 503);
  assert.equal(calls.length, before);
  globalThis.__authEnv.AUTH_EMAIL_ENABLED = 'true';
  anonymous();
});

// Confere os cabeçalhos usados para chaves de API e tokens de usuário.
test('modern API keys stay in apikey headers while user JWTs use Authorization', async () => {
  const original = globalThis.__authEnv.SUPABASE_ANON_KEY;
  globalThis.__authEnv.SUPABASE_ANON_KEY = 'sb_publishable_test';
  await provider.providerRequest('recover', { email: 'header-test@example.test' });
  assert.equal(calls.at(-1).key, 'sb_publishable_test');
  assert.equal(calls.at(-1).authorization, null);
  await provider.providerRequest('recover', { email: 'header-test@example.test' }, { token: 'user-jwt' });
  assert.equal(calls.at(-1).authorization, 'Bearer user-jwt');
  globalThis.__authEnv.SUPABASE_ANON_KEY = original;
});

// Confere convites vinculados a reservas e a reutilização da conta.
test('owner invites from the saved reservation and repeated stays keep one account', async () => {
  nativeOwner(); reservation(101, 'Maria@Example.test', today, tomorrow);
  const response = await admin.POST(request('/api/admin/accounts', { reservationId: 101, email: 'attacker@example.test', role: 'host' }));
  assert.equal(response.status, 200);
  const account = await accounts.findAccount('maria@example.test'); guestId = account.id;
  assert.equal(account.role, 'guest'); assert.equal(account.verified_at, null);
  assert.equal(calls.at(-1).body.email, 'maria@example.test');
  assert.equal(calls.at(-1).key, 'secret-test');
  reservation(102, 'maria@example.test', '2099-01-01', '2099-01-05');
  assert.equal((await admin.POST(request('/api/admin/accounts', { reservationId: 102 }))).status, 200);
  assert.equal(sql.prepare('SELECT count(*) AS count FROM access_accounts').get().count, 1);
  assert.equal(sql.prepare('SELECT count(*) AS count FROM access_reservations WHERE account_id=?').get(guestId).count, 2);
  anonymous();
});

// Confere as permissões de convite direto do administrador principal.
test('only the principal administrator can invite a guest without inventing a reservation or granting benefits', async () => {
  nativeOwner();
  const response = await admin.POST(request('/api/admin/accounts', { name: 'Visitante de teste', email: 'visitor@example.test', role: 'guest' }));
  assert.equal(response.status, 200);
  const visitor = await accounts.findAccount('visitor@example.test');
  assert.equal(visitor.role, 'guest');
  assert.equal(await accounts.hasCurrentStay(visitor.id), false);
  assert.equal(sql.prepare('SELECT count(*) AS count FROM access_reservations WHERE account_id=?').get(visitor.id).count, 0);
  anonymous();
});

// Confere o token de uso único e a criação de sessão com cookie HttpOnly.
test('one-time email confirmation sets password, creates HttpOnly session and cannot be reused', async () => {
  const hash = newLink('maria@example.test');
  const response = await activate.POST(request('/api/auth/password', { tokenHash: hash, type: 'invite', password: 'CasaAb1!' }));
  assert.equal(response.status, 200);
  const cookie = response.headers.get('Set-Cookie'); guestCookie = cookie.split(';')[0];
  for (const attribute of ['__Host-cyb-session=', 'HttpOnly', 'Secure', 'SameSite=Lax', 'Path=/']) assert.ok(cookie.includes(attribute));
  const token = guestCookie.split('=')[1];
  assert.notEqual(sql.prepare('SELECT token_hash FROM access_sessions').get().token_hash, token);
  assert.equal((await sessions.currentAccount(request('/', {}, guestCookie, 'GET'))).name, 'Maria Silva');
  assert.equal(await sessions.canSeeBenefits(request('/', {}, guestCookie, 'GET')), true);
  assert.equal((await activate.POST(request('/api/auth/password', { tokenHash: hash, type: 'invite', password: 'CasaAb1!' }))).status, 400);
});

// Confere que convites e metadados não concedem permissões adicionais.
test('direct provider invitations import only guests; signup metadata and blocked accounts grant no access', async () => {
  const unapproved = 'unapproved@example.test';
  providerUsers.set(unapproved, { id: crypto.randomUUID(), email: unapproved, email_confirmed_at: null, user_metadata: { role: 'host' } });
  const rejected = await activate.POST(request('/api/auth/password', { tokenHash: newLink(unapproved), type: 'invite', password: 'CasaAb1!' }));
  assert.equal(rejected.status, 400);
  assert.equal(await accounts.findAccount(unapproved), null);

  const email = 'direct@example.test';
  providerUsers.set(email, { id: crypto.randomUUID(), email, invited_at: new Date().toISOString(), email_confirmed_at: null, user_metadata: { name: 'Visitante', role: 'host' } });
  const response = await activate.POST(request('/api/auth/password', { tokenHash: newLink(email), type: 'invite', password: 'CasaAb1!' }));
  assert.equal(response.status, 200);
  const account = await accounts.findAccount(email);
  assert.equal(account.role, 'guest');
  assert.equal(account.name, 'Visitante');
  globalThis.__authHeaders = new Headers({ cookie: response.headers.get('Set-Cookie').split(';')[0] });
  assert.equal((await sessions.requireAccount()).id, account.id, 'an approved account can use protected pages without a current reservation');
  anonymous();
  assert.equal(await accounts.hasCurrentStay(account.id), false);
  assert.equal((await admin.GET(request('/api/admin/accounts', {}, response.headers.get('Set-Cookie').split(';')[0], 'GET'))).status, 403);
  sql.prepare('UPDATE access_accounts SET blocked=1 WHERE id=?').run(account.id);
  const blocked = await activate.POST(request('/api/auth/password', { tokenHash: newLink(email, 'recovery'), type: 'recovery', password: 'NovaCd2@' }));
  assert.equal(blocked.status, 400);
  assert.equal((await accounts.findAccount(email)).blocked, 1);
});

// Confere o bloqueio das operações administrativas para hóspedes.
test('guest cannot list users, invite hosts or mutate administrative access', async () => {
  assert.equal((await admin.GET(request('/api/admin/accounts', {}, guestCookie, 'GET'))).status, 403);
  assert.equal((await admin.POST(request('/api/admin/accounts', { role: 'host', email: 'new@example.test', name: 'Host' }, guestCookie))).status, 403);
  assert.equal((await admin.PATCH(request('/api/admin/accounts', { id: guestId, blocked: false }, guestCookie, 'PATCH'))).status, 403);
});

// Confere benefícios vinculados à reserva vigente no fuso da Bahia.
test('benefits depend on current linked reservation, email and publication, using Bahia dates', async () => {
  assert.equal(await accounts.hasCurrentStay(guestId), true);
  sql.prepare('UPDATE house_agenda SET end_date=? WHERE id=101').run(today);
  assert.equal(await accounts.hasCurrentStay(guestId), true, 'checkout day remains available');
  sql.prepare("UPDATE house_agenda SET start_date='2000-01-01',end_date='2000-01-02' WHERE id=101").run();
  assert.equal(await accounts.hasCurrentStay(guestId), false, 'past and future stays grant no current benefits');
  sql.prepare('UPDATE house_agenda SET start_date=?,end_date=?,published=0 WHERE id=101').run(today, tomorrow);
  assert.equal(await accounts.hasCurrentStay(guestId), false);
  sql.prepare("UPDATE house_agenda SET published=1,email='another@example.test' WHERE id=101").run();
  assert.equal(await accounts.hasCurrentStay(guestId), false);
  sql.prepare("UPDATE house_agenda SET email='maria@example.test' WHERE id=101").run();
  assert.equal(await accounts.hasCurrentStay(guestId), true);
});

// Confere a revogação das sessões ao bloquear uma conta.
test('blocking invalidates an open session immediately; unblocking does not revive it', async () => {
  nativeOwner();
  assert.equal((await admin.PATCH(request('/api/admin/accounts', { id: guestId, blocked: true }, null, 'PATCH'))).status, 200);
  anonymous(); assert.equal(await sessions.currentAccount(request('/', {}, guestCookie, 'GET')), null);
  nativeOwner(); await admin.PATCH(request('/api/admin/accounts', { id: guestId, blocked: false }, null, 'PATCH'));
  anonymous(); assert.equal(await sessions.currentAccount(request('/', {}, guestCookie, 'GET')), null);
});

// Confere identidade, papel e confirmação do e-mail na entrada e recuperação.
test('login checks provider identity, confirmed email and server role; recovery revokes older sessions', async () => {
  let response = await login.POST(request('/api/auth/session', { email: 'MARIA@example.test', password: 'CasaAb1!', role: 'host', returnTo: '/admin/agenda' }));
  assert.equal(response.status, 200); assert.equal((await response.json()).returnTo, '/');
  const oldCookie = response.headers.get('Set-Cookie').split(';')[0];
  sql.prepare("UPDATE access_accounts SET auth_id='different-id' WHERE id=?").run(guestId);
  assert.equal((await login.POST(request('/api/auth/session', { email: 'maria@example.test', password: 'CasaAb1!' }))).status, 401);
  sql.prepare('UPDATE access_accounts SET auth_id=? WHERE id=?').run(providerUsers.get('maria@example.test').id, guestId);
  response = await activate.POST(request('/api/auth/password', { tokenHash: newLink('maria@example.test', 'recovery'), type: 'recovery', password: 'NovaCd2@' }));
  assert.equal(response.status, 200);
  assert.equal(await sessions.currentAccount(request('/', {}, oldCookie, 'GET')), null);
  guestCookie = response.headers.get('Set-Cookie').split(';')[0];
  assert.equal((await login.POST(request('/api/auth/session', { email: 'maria@example.test', password: 'CasaAb1!' }))).status, 401);
});

// Confere a resposta uniforme de recuperação e o limite de tentativas.
test('recovery has the same public response for known and unknown emails and rate limits atomically', async () => {
  const a = await recovery.POST(request('/api/auth/recovery', { email: 'maria@example.test' }));
  const b = await recovery.POST(request('/api/auth/recovery', { email: 'unknown@example.test' }));
  assert.equal(a.status, b.status); assert.deepEqual(await a.json(), await b.json());
  const results = await Promise.all(Array.from({ length: 20 }, () => accounts.consumeRateLimit('parallel-check', 5, 900)));
  assert.equal(results.filter(Boolean).length, 5);
});

// Confere permissões de convite de anfitriões e o encerramento da sessão.
test('only the principal administrator may invite hosts, partner profile stays disabled, logout revokes cookie', async () => {
  nativeOwner();
  const response = await admin.POST(request('/api/admin/accounts', { name: 'Anfitrião Dois', email: 'host@example.test', role: 'host' }));
  assert.equal(response.status, 200);
  anonymous();
  const activated = await activate.POST(request('/api/auth/password', { tokenHash: newLink('host@example.test'), type: 'invite', password: 'AnfitAb3#' }));
  const hostCookie = activated.headers.get('Set-Cookie').split(';')[0];
  const listed = await admin.GET(request('/api/admin/accounts', {}, hostCookie, 'GET'));
  assert.equal(listed.status, 200);
  const directory = await listed.json();
  assert.equal(directory.owner, false);
  assert.equal(directory.accounts.find(account => account.email === 'host@example.test').permissions.changeStatus, false);
  assert.deepEqual(new Set(directory.accounts.map(account => account.id)), new Set(sql.prepare('SELECT id FROM access_accounts').all().map(account => account.id)), 'every host can view the complete account directory');
  assert.ok(directory.accounts.some(account => account.role === 'host'));
  assert.ok(directory.accounts.some(account => account.role === 'guest'));
  assert.ok(directory.accounts.every(account => !('auth_id' in account) && !('password' in account)));
  assert.equal((await admin.POST(request('/api/admin/accounts', { name: 'Host Three', email: 'third@example.test', role: 'host' }, hostCookie))).status, 403);
  assert.equal((await admin.POST(request('/api/admin/accounts', { name: 'Guest Four', email: 'fourth@example.test', role: 'guest' }, hostCookie))).status, 403);
  assert.equal((await admin.PATCH(request('/api/admin/accounts', { id: (await accounts.findAccount('host@example.test')).id, blocked: true }, hostCookie, 'PATCH'))).status, 403);
  sql.prepare("UPDATE access_accounts SET role='partner' WHERE email='host@example.test'").run();
  assert.equal(await sessions.currentAccount(request('/', {}, hostCookie, 'GET')), null);
  const logout = await login.DELETE(request('/api/auth/session', {}, guestCookie, 'DELETE'));
  assert.equal(logout.status, 200); assert.match(logout.headers.get('Set-Cookie'), /Max-Age=0/);
  assert.equal(await sessions.currentAccount(request('/', {}, guestCookie, 'GET')), null);
});


// Confere a identidade do provedor exigida para o administrador principal.
test('primary administrator password access requires the server-bound provider ID and verified administrator email', async () => {
  anonymous();
  const id = crypto.randomUUID();
  const email = 'casayamamotobasevi@gmail.com';
  assert.equal(await sessions.isPrimaryHostIdentity(id, email), false);
  globalThis.__authEnv.AUTH_PRIMARY_HOST_ID = id;
  assert.equal(await sessions.isPrimaryHostIdentity('different-id', email), false);
  assert.equal(await sessions.isPrimaryHostIdentity(id, 'someone@example.test'), false);
  providerUsers.set(email, { id, email, invited_at: new Date().toISOString(), email_confirmed_at: null, user_metadata: { name: 'Casa Yamamoto Basevi', role: 'guest' } });
  const activated = await activate.POST(request('/api/auth/password', { tokenHash: newLink(email), type: 'invite', password: 'AdminAb4$' }));
  assert.equal(activated.status, 200);
  assert.equal((await activated.json()).returnTo, '/');
  const cookie = activated.headers.get('Set-Cookie').split(';')[0];
  const account = await accounts.findAccount(email);
  assert.equal(account.role, 'host');
  const signedIn = await sessions.currentAccount(request('/', {}, cookie, 'GET'));
  assert.equal(signedIn.owner, true);
  assert.equal(signedIn.native, false);
  assert.equal((await admin.GET(request('/api/admin/accounts', {}, cookie, 'GET'))).status, 200);
  assert.equal((await admin.POST(request('/api/admin/accounts', { name: 'Novo anfitrião', email: 'primary-invited@example.test', role: 'host' }, cookie))).status, 200);
  globalThis.__authEnv.AUTH_PRIMARY_HOST_ID = 'replaced-id';
  assert.equal((await sessions.currentAccount(request('/', {}, cookie, 'GET'))).owner, false);
  globalThis.__authEnv.AUTH_PRIMARY_HOST_ID = id;
  sql.prepare('UPDATE access_accounts SET blocked=1 WHERE id=?').run(account.id);
  assert.equal(await sessions.currentAccount(request('/', {}, cookie, 'GET')), null);
  delete globalThis.__authEnv.AUTH_PRIMARY_HOST_ID;
});


// Confere senhas existentes na entrada e a política aplicada às novas senhas.
test('existing passwords remain valid at login while new passwords follow the new policy', async () => {
  anonymous();
  const email = 'legacy@example.test';
  const id = crypto.randomUUID();
  const oldPassword = 'uma senha antiga com mais de doze caracteres';
  providerUsers.set(email, { id, email, email_confirmed_at: new Date().toISOString() });
  passwords.set(email, oldPassword);
  sql.prepare("INSERT INTO access_accounts (id, auth_id, email, name, role, verified_at) VALUES (?, ?, ?, 'Conta existente', 'guest', CURRENT_TIMESTAMP)").run(crypto.randomUUID(), id, email);
  assert.ok(policy.passwordError(oldPassword));
  const response = await login.POST(request('/api/auth/session', { email, password: oldPassword, returnTo: '/parceiros' }));
  assert.equal(response.status, 200);
  assert.equal((await response.json()).returnTo, '/');
});

// Confere categorias ativas e a remoção de benefícios restritos antes da serialização.
test('partner listing renders only published active categories and redacts stay-only benefits before serialization', async () => {
  const partners = await import(load('db/partners.ts'));
  const { partnerView } = await import(load('app/parceiros/partner-view.ts'));
  sql.prepare("INSERT INTO partner_categories (id,name,slug,active) VALUES (991,'Passeios QA','qa-active',1),(992,'Inativos QA','qa-inactive',0)").run();
  for (const [id, category, published] of [[991,991,1],[992,991,0],[993,992,1]]) sql.prepare("INSERT INTO partners (id,category_id,name,benefit,published,updated_by,image_key) VALUES (?,?,'Parceiro QA','Benefício exclusivo QA',?,'private@example.test','private/image')").run(id,category,published);
  const result = await partners.listPublishedPartners();
  assert.deepEqual(result.map(partner => partner.id), [991]);
  const permitted = partnerView(result[0], true);
  assert.equal(permitted.benefit, 'Benefício exclusivo QA');
  assert.equal(permitted.imageKey, 'private/image');
  const restricted = JSON.stringify(partnerView(result[0], false));
  for (const privateText of ['Benefício exclusivo QA','private/image','private@example.test','updatedBy']) assert.ok(!restricted.includes(privateText));
});

// Confere a gestão compartilhada de hóspedes sem elevar permissões sobre anfitriões.
test('every host can edit and manage guests invited by either host without gaining control of host identities', async () => {
  anonymous();
  const hosts = [];
  for (const suffix of ['one', 'two']) {
    const id = crypto.randomUUID();
    sql.prepare("INSERT INTO access_accounts (id, email, name, role, verified_at) VALUES (?, ?, ?, 'host', CURRENT_TIMESTAMP)").run(id, `shared-host-${suffix}@example.test`, `Host ${suffix}`);
    hosts.push({ id, cookie: (await sessions.createAccountSession(id)).split(';')[0] });
  }
  const guests = [];
  for (let i = 0; i < 2; i++) {
    const email = `shared-guest-${i}@example.test`;
    reservation(201+i, email, today, tomorrow);
    assert.equal((await admin.POST(request('/api/admin/accounts', {reservationId:201+i}, hosts[i].cookie))).status,200);
    guests.push(await accounts.findAccount(email));
  }
  for (let i = 0; i < 2; i++) {
    const directory = await (await admin.GET(request('/api/admin/accounts',{},hosts[i].cookie,'GET'))).json();
    for (const guest of guests) assert.deepEqual(directory.accounts.find(account => account.id === guest.id).permissions, {edit:true,sendEmail:true,changeStatus:true});
    const guest = guests[1-i];
    const changed = await admin.PATCH(request('/api/admin/accounts',{id:guest.id,name:`Edited by host ${i}`,blocked:true},hosts[i].cookie,'PATCH'));
    assert.equal(changed.status,200);
    const stored = await accounts.findAccount(guest.email);
    assert.equal(stored.name,`Edited by host ${i}`); assert.equal(stored.blocked,1);
    assert.equal((await admin.PATCH(request('/api/admin/accounts',{id:guest.id,name:'Name only'},hosts[i].cookie,'PATCH'))).status,200);
    assert.equal((await accounts.findAccount(guest.email)).blocked,1,'editing the name must preserve the blocked state');
    assert.equal((await admin.PATCH(request('/api/admin/accounts',{id:guest.id,blocked:false},hosts[i].cookie,'PATCH'))).status,200);
    assert.equal((await admin.POST(request('/api/admin/accounts',{accountId:guest.id},hosts[i].cookie))).status,200);
    assert.equal((await admin.PATCH(request('/api/admin/accounts',{id:hosts[1-i].id,name:'Not allowed'},hosts[i].cookie,'PATCH'))).status,403);
    assert.equal((await admin.PATCH(request('/api/admin/accounts',{id:hosts[1-i].id,blocked:true},hosts[i].cookie,'PATCH'))).status,403);
    assert.equal((await admin.PATCH(request('/api/admin/accounts',{id:guest.id,name:'Guest',role:'host'},hosts[i].cookie,'PATCH'))).status,400);
    assert.equal((await admin.PATCH(request('/api/admin/accounts',{id:guest.id,name:'Guest',email:'replacement@example.test'},hosts[i].cookie,'PATCH'))).status,400);
  }
  const guest = guests[0];
  sql.prepare('UPDATE access_accounts SET verified_at=CURRENT_TIMESTAMP WHERE id=?').run(guest.id);
  const cookie = (await sessions.createAccountSession(guest.id)).split(';')[0];
  assert.equal((await admin.PATCH(request('/api/admin/accounts',{id:guest.id,name:'Session preserved'},hosts[1].cookie,'PATCH'))).status,200);
  assert.ok(await sessions.currentAccount(request('/',{},cookie,'GET')),'name changes preserve the authenticated session');
  assert.equal((await admin.PATCH(request('/api/admin/accounts',{id:guest.id,blocked:true},hosts[1].cookie,'PATCH'))).status,200);
  assert.equal(await sessions.currentAccount(request('/',{},cookie,'GET')),null);
  assert.equal((await admin.PATCH(request('/api/admin/accounts',{id:guest.id,blocked:false},hosts[0].cookie,'PATCH'))).status,200);
  assert.equal(await sessions.currentAccount(request('/',{},cookie,'GET')),null,'unblocking must not restore revoked sessions');
  const audit = sql.prepare("SELECT actor FROM access_audit WHERE account_id=? AND action='name_updated'").all(guest.id);
  assert.ok(audit.length >= 2);
  assert.ok(audit.every(row => row.actor.startsWith('shared-host-')));
});
