import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import ts from 'typescript';

const encoded = source => `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`;
const modules = new Map();
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
globalThis.__authEnv = { DB: db, SUPABASE_URL: 'https://auth.example.test', SUPABASE_ANON_KEY: 'public-test', SUPABASE_SERVICE_ROLE_KEY: 'secret-test', AUTH_SITE_URL: 'https://house.example.test', AUTH_EMAIL_ENABLED: 'true' };
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

test('rejects unsafe redirects, weak passwords, forged origins and shared test passwords', async () => {
  for (const path of ['https://evil.test', '//evil.test', '/\\evil.test', '/api/admin/accounts', '/signin-with-chatgpt']) assert.equal(policy.safeDestination(path), '/parceiros');
  assert.equal(policy.destinationFor('guest', '/admin/agenda'), '/parceiros');
  assert.ok(policy.passwordError('short')); assert.equal(policy.passwordError('uma frase longa segura'), null);
  assert.equal((await login.POST(request('/api/auth/session', {}, null, 'POST', 'https://evil.test'))).status, 403);
  assert.equal((await legacyGuest.POST()).status, 410); assert.equal((await legacyAdmin.POST()).status, 410);
  assert.equal(await sessions.currentAccount(request('/', {}, 'cyb-guest-access=old; cyb-temporary-admin=old', 'GET')), null);
});

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

test('one-time email confirmation sets password, creates HttpOnly session and cannot be reused', async () => {
  const hash = newLink('maria@example.test');
  const response = await activate.POST(request('/api/auth/password', { tokenHash: hash, type: 'invite', password: 'uma frase longa segura' }));
  assert.equal(response.status, 200);
  const cookie = response.headers.get('Set-Cookie'); guestCookie = cookie.split(';')[0];
  for (const attribute of ['__Host-cyb-session=', 'HttpOnly', 'Secure', 'SameSite=Lax', 'Path=/']) assert.ok(cookie.includes(attribute));
  const token = guestCookie.split('=')[1];
  assert.notEqual(sql.prepare('SELECT token_hash FROM access_sessions').get().token_hash, token);
  assert.equal((await sessions.currentAccount(request('/', {}, guestCookie, 'GET'))).name, 'Maria Silva');
  assert.equal(await sessions.canSeeBenefits(request('/', {}, guestCookie, 'GET')), true);
  assert.equal((await activate.POST(request('/api/auth/password', { tokenHash: hash, type: 'invite', password: 'uma frase longa segura' }))).status, 400);
});

test('direct provider invitations import only guests; signup metadata and blocked accounts grant no access', async () => {
  const unapproved = 'unapproved@example.test';
  providerUsers.set(unapproved, { id: crypto.randomUUID(), email: unapproved, email_confirmed_at: null, user_metadata: { role: 'host' } });
  const rejected = await activate.POST(request('/api/auth/password', { tokenHash: newLink(unapproved), type: 'invite', password: 'uma frase longa segura' }));
  assert.equal(rejected.status, 400);
  assert.equal(await accounts.findAccount(unapproved), null);

  const email = 'direct@example.test';
  providerUsers.set(email, { id: crypto.randomUUID(), email, invited_at: new Date().toISOString(), email_confirmed_at: null, user_metadata: { name: 'Visitante', role: 'host' } });
  const response = await activate.POST(request('/api/auth/password', { tokenHash: newLink(email), type: 'invite', password: 'uma frase longa segura' }));
  assert.equal(response.status, 200);
  const account = await accounts.findAccount(email);
  assert.equal(account.role, 'guest');
  assert.equal(account.name, 'Visitante');
  assert.equal(await accounts.hasCurrentStay(account.id), false);
  assert.equal((await admin.GET(request('/api/admin/accounts', {}, response.headers.get('Set-Cookie').split(';')[0], 'GET'))).status, 403);
  sql.prepare('UPDATE access_accounts SET blocked=1 WHERE id=?').run(account.id);
  const blocked = await activate.POST(request('/api/auth/password', { tokenHash: newLink(email, 'recovery'), type: 'recovery', password: 'outra frase longa segura' }));
  assert.equal(blocked.status, 400);
  assert.equal((await accounts.findAccount(email)).blocked, 1);
});

test('guest cannot list users, invite hosts or mutate administrative access', async () => {
  assert.equal((await admin.GET(request('/api/admin/accounts', {}, guestCookie, 'GET'))).status, 403);
  assert.equal((await admin.POST(request('/api/admin/accounts', { role: 'host', email: 'new@example.test', name: 'Host' }, guestCookie))).status, 403);
  assert.equal((await admin.PATCH(request('/api/admin/accounts', { id: guestId, blocked: false }, guestCookie, 'PATCH'))).status, 403);
});

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

test('blocking invalidates an open session immediately; unblocking does not revive it', async () => {
  nativeOwner();
  assert.equal((await admin.PATCH(request('/api/admin/accounts', { id: guestId, blocked: true }, null, 'PATCH'))).status, 200);
  anonymous(); assert.equal(await sessions.currentAccount(request('/', {}, guestCookie, 'GET')), null);
  nativeOwner(); await admin.PATCH(request('/api/admin/accounts', { id: guestId, blocked: false }, null, 'PATCH'));
  anonymous(); assert.equal(await sessions.currentAccount(request('/', {}, guestCookie, 'GET')), null);
});

test('login checks provider identity, confirmed email and server role; recovery revokes older sessions', async () => {
  let response = await login.POST(request('/api/auth/session', { email: 'MARIA@example.test', password: 'uma frase longa segura', role: 'host', returnTo: '/admin/agenda' }));
  assert.equal(response.status, 200); assert.equal((await response.json()).returnTo, '/parceiros');
  const oldCookie = response.headers.get('Set-Cookie').split(';')[0];
  sql.prepare("UPDATE access_accounts SET auth_id='different-id' WHERE id=?").run(guestId);
  assert.equal((await login.POST(request('/api/auth/session', { email: 'maria@example.test', password: 'uma frase longa segura' }))).status, 401);
  sql.prepare('UPDATE access_accounts SET auth_id=? WHERE id=?').run(providerUsers.get('maria@example.test').id, guestId);
  response = await activate.POST(request('/api/auth/password', { tokenHash: newLink('maria@example.test', 'recovery'), type: 'recovery', password: 'outra frase longa segura' }));
  assert.equal(response.status, 200);
  assert.equal(await sessions.currentAccount(request('/', {}, oldCookie, 'GET')), null);
  guestCookie = response.headers.get('Set-Cookie').split(';')[0];
  assert.equal((await login.POST(request('/api/auth/session', { email: 'maria@example.test', password: 'uma frase longa segura' }))).status, 401);
});

test('recovery has the same public response for known and unknown emails and rate limits atomically', async () => {
  const a = await recovery.POST(request('/api/auth/recovery', { email: 'maria@example.test' }));
  const b = await recovery.POST(request('/api/auth/recovery', { email: 'unknown@example.test' }));
  assert.equal(a.status, b.status); assert.deepEqual(await a.json(), await b.json());
  const results = await Promise.all(Array.from({ length: 20 }, () => accounts.consumeRateLimit('parallel-check', 5, 900)));
  assert.equal(results.filter(Boolean).length, 5);
});

test('only the principal administrator may invite hosts, partner profile stays disabled, logout revokes cookie', async () => {
  nativeOwner();
  const response = await admin.POST(request('/api/admin/accounts', { name: 'Anfitrião Dois', email: 'host@example.test', role: 'host' }));
  assert.equal(response.status, 200);
  anonymous();
  const activated = await activate.POST(request('/api/auth/password', { tokenHash: newLink('host@example.test'), type: 'invite', password: 'uma frase de anfitriao' }));
  const hostCookie = activated.headers.get('Set-Cookie').split(';')[0];
  assert.equal((await admin.POST(request('/api/admin/accounts', { name: 'Host Three', email: 'third@example.test', role: 'host' }, hostCookie))).status, 403);
  assert.equal((await admin.POST(request('/api/admin/accounts', { name: 'Guest Four', email: 'fourth@example.test', role: 'guest' }, hostCookie))).status, 403);
  assert.equal((await admin.PATCH(request('/api/admin/accounts', { id: (await accounts.findAccount('host@example.test')).id, blocked: true }, hostCookie, 'PATCH'))).status, 403);
  sql.prepare("UPDATE access_accounts SET role='partner' WHERE email='host@example.test'").run();
  assert.equal(await sessions.currentAccount(request('/', {}, hostCookie, 'GET')), null);
  const logout = await login.DELETE(request('/api/auth/session', {}, guestCookie, 'DELETE'));
  assert.equal(logout.status, 200); assert.match(logout.headers.get('Set-Cookie'), /Max-Age=0/);
  assert.equal(await sessions.currentAccount(request('/', {}, guestCookie, 'GET')), null);
});


test('primary administrator password access requires the server-bound provider ID and verified administrator email', async () => {
  anonymous();
  const id = crypto.randomUUID();
  const email = 'casayamamotobasevi@gmail.com';
  assert.equal(await sessions.isPrimaryHostIdentity(id, email), false);
  globalThis.__authEnv.AUTH_PRIMARY_HOST_ID = id;
  assert.equal(await sessions.isPrimaryHostIdentity('different-id', email), false);
  assert.equal(await sessions.isPrimaryHostIdentity(id, 'someone@example.test'), false);
  providerUsers.set(email, { id, email, invited_at: new Date().toISOString(), email_confirmed_at: null, user_metadata: { name: 'Casa Yamamoto Basevi', role: 'guest' } });
  const activated = await activate.POST(request('/api/auth/password', { tokenHash: newLink(email), type: 'invite', password: 'uma frase do administrador' }));
  assert.equal(activated.status, 200);
  assert.equal((await activated.json()).returnTo, '/admin/agenda');
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
