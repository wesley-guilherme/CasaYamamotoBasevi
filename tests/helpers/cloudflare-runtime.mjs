// Adapta o pacote do Worker aos testes Node, isolando os bindings Cloudflare de cada requisição.
import { AsyncLocalStorage } from "node:async_hooks";
import { register } from "node:module";

// Disponibiliza o ambiente recebido em fetch sem misturar contas e recursos de requisições concorrentes.
const bindings = new AsyncLocalStorage();
globalThis[Symbol.for("casa-yamamoto.test-worker-bindings")] = bindings;

// O módulo virtual representa cloudflare:workers nos testes; nenhum serviço externo é acessado por ele.
const virtualModule = `export const env = new Proxy({}, {
  get(_target, key) {
    return globalThis[Symbol.for("casa-yamamoto.test-worker-bindings")]?.getStore()?.[key];
  }
});`;
const virtualUrl = "data:text/javascript;base64," + Buffer.from(virtualModule).toString("base64");

// Encaminha apenas o módulo de ambiente para a simulação e preserva o carregamento normal das demais dependências.
const hook = `export async function resolve(specifier, context, nextResolve) {
  if (specifier === "cloudflare:workers") return { url: ${JSON.stringify(virtualUrl)}, shortCircuit: true };
  return nextResolve(specifier, context);
}`;
register("data:text/javascript;base64," + Buffer.from(hook).toString("base64"), import.meta.url);

// Carrega o Worker compilado e associa cada ambiente aos seus componentes e rotas durante a execução do teste.
export async function loadBuiltWorker(cacheKey) {
  const url = new URL("../../dist/server/index.js", import.meta.url);
  if (cacheKey) url.searchParams.set("test", cacheKey);
  const { default: worker } = await import(url.href);
  return {
    fetch(request, env, context) {
      return bindings.run(env, () => worker.fetch(request, env, context));
    },
  };
}
