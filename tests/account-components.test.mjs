import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';

const encoded = source => `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`;
const cache = new Map();
function component(path) {
  path = resolve(path);
  if (cache.has(path)) return cache.get(path);
  let source = ts.transpileModule(readFileSync(path,'utf8'), {compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;
  source = source.replace(/from\s+(["'])([^"']+)\1/g, (match,quote,specifier) => {
    let url;
    if (specifier.endsWith('.css')) url=encoded('export default new Proxy({}, {get:(_,key)=>String(key)});');
    else if (specifier.startsWith('.')) {
      const base=resolve(dirname(path),specifier);
      url=component(existsSync(base+'.ts')?base+'.ts':base+'.tsx');
    } else url=import.meta.resolve(specifier);
    return 'from '+JSON.stringify(url);
  });
  const url=encoded(source); cache.set(path,url); return url;
}

test('login renders an empty password and activation presents readable requirements without native validation suppressing warnings', async () => {
  const {default:LoginForm}=await import(component('app/login/login-form.tsx'));
  const login=renderToStaticMarkup(React.createElement(LoginForm,{configured:true}));
  const input=login.match(/<input[^>]*id="account-password"[^>]*>/)?.[0];
  assert.ok(input);
  assert.match(input,/value=""/);
  assert.match(input,/readOnly=""/);
  assert.match(input,/autoComplete="off"/);
  assert.match(login,/<form[^>]*noValidate=""/);
  const activation=renderToStaticMarkup(React.createElement(LoginForm,{configured:true,initialMode:'password'}));
  for (const requirement of ['De 8 a 12 caracteres','Pelo menos 1 letra maiúscula','Pelo menos 1 número','Pelo menos 1 caractere especial']) assert.ok(activation.includes(requirement));
  assert.match(activation,/aria-describedby="password-requirements password-feedback"/);
  assert.match(activation,/aria-live="polite"/);
  assert.match(activation,/<input[^>]*id="account-password"[^>]*maxLength="128"/,'overlong pasted passwords must produce feedback instead of being silently truncated');
});

test('published partner cards render saved names, benefits and protected images', async () => {
  const {default:PartnerExplorer}=await import(component('app/parceiros/partner-explorer.tsx'));
  const html=renderToStaticMarkup(React.createElement(PartnerExplorer,{categories:[{id:1,name:'Passeios'}],partners:[{id:9,categoryId:1,categoryName:'Passeios',name:'Passeio de teste',description:'Conheça Prado',benefit:'Vantagem cadastrada',address:'Centro',openingHours:'9h às 17h',imageKey:'private-image',updatedAt:'2026-11-17',locationUrl:null,instagramUrl:null,whatsappUrl:null}]}));
  assert.match(html,/<h2>Passeio de teste<\/h2>/);
  assert.match(html,/Vantagem cadastrada/);
  assert.match(html,/src="\/api\/partners\/9\/image\?updated=/);
  assert.doesNotMatch(html,/private-image|Os benefícios serão publicados em breve/);
});
