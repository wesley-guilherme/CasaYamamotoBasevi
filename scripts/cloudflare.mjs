// Executa desenvolvimento, compilação e publicação Cloudflare em Windows ou Linux com a configuração do cliente.
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import ts from "typescript";

// Resolve os executáveis locais para não instalar pacotes ou depender de comandos específicos de um shell.
const root = fileURLToPath(new URL("../", import.meta.url));
const configPath = resolve(root, "wrangler.cloudflare.jsonc");
const vinext = resolve(root, "node_modules/vinext/dist/cli.js");
const wrangler = resolve(root, "node_modules/wrangler/bin/wrangler.js");
const action = process.argv[2];

// Mantém logs no projeto e seleciona apenas o destino Cloudflare na configuração compartilhada do Vite.
const environment = {
  ...process.env,
  DEPLOY_TARGET: "cloudflare",
  WRANGLER_SEND_METRICS: "false",
  WRANGLER_WRITE_LOGS: "false",
  WRANGLER_LOG_PATH: resolve(root, ".wrangler/cloudflare.log"),
  MINIFLARE_REGISTRY_PATH: resolve(root, ".wrangler/registry"),
  // O Wrangler utiliza seu próprio registro local, separado do caminho do Miniflare.
  WRANGLER_REGISTRY_PATH: resolve(root, ".wrangler/registry"),
};

// Lê JSON com comentários sem remover acidentalmente partes de URLs ou outros valores de texto.
function configuration() {
  const result = ts.parseConfigFileTextToJson(configPath, readFileSync(configPath, "utf8"));
  if (result.error) throw new Error("A configuração wrangler.cloudflare.jsonc não é um JSONC válido.");
  return result.config;
}

// Executa uma ferramenta instalada, preservando o código de saída e impondo prazo às tarefas de compilação.
function run(script, args, timeout) {
  if (!existsSync(script)) throw new Error("Dependências ausentes. Instale as versões do package-lock.json antes de continuar.");
  const result = spawnSync(process.execPath, [script, ...args], {
    cwd: root, env: environment, stdio: "inherit", timeout, windowsHide: true,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

// Impede publicar uma aplicação ligada a recursos fictícios ou com confiança em cabeçalhos externos.
function validateDeployment(config) {
  const account = config.account_id || environment.CLOUDFLARE_ACCOUNT_ID;
  if (!/^[a-f0-9]{32}$/i.test(account || "")) {
    throw new Error("Selecione a conta do cliente em account_id ou CLOUDFLARE_ACCOUNT_ID antes de publicar.");
  }
  const database = config.d1_databases?.find(item => item.binding === "DB");
  if (!/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(database?.database_id || "")
    || database.database_id === "00000000-0000-4000-8000-000000000000") {
    throw new Error("Preencha database_id com o D1 real do cliente após criar e importar o banco.");
  }
  if (!config.r2_buckets?.some(item => item.binding === "BUCKET" && item.bucket_name)) {
    throw new Error("Configure o bucket R2 de arquivos do cliente antes de publicar.");
  }
  if (config.vars?.AUTH_PLATFORM_HEADERS_ENABLED !== "false") {
    throw new Error("A Cloudflare pública deve manter AUTH_PLATFORM_HEADERS_ENABLED=false.");
  }
}

// Só considera o pacote publicável quando os recursos compilados correspondem à configuração revisada.
function validateBuild(config) {
  const generatedPath = resolve(root, "dist/server/wrangler.json");
  if (!existsSync(generatedPath)) throw new Error("A compilação não gerou a configuração do Worker.");
  const generated = JSON.parse(readFileSync(generatedPath, "utf8"));
  if (generated.name !== config.name || generated.vars?.AUTH_PLATFORM_HEADERS_ENABLED !== "false") {
    throw new Error("O pacote gerado não corresponde ao destino Cloudflare. Refaça build:cloudflare.");
  }
  return generatedPath;
}

// Separa compilação local de ações remotas para que preparar ou testar não crie recursos na conta.
try {
  const config = configuration();
  switch (action) {
    case "dev":
      run(vinext, ["dev"]);
      break;
    case "build":
      run(vinext, ["build"], 240_000);
      validateBuild(config);
      break;
    case "preview":
      // Desabilita bindings remotos para que a simulação nunca modifique o banco publicado.
      run(wrangler, ["dev", "--local", "--ip", "127.0.0.1", "--config", validateBuild(config)]);
      break;
    case "dry-run":
      run(vinext, ["build"], 240_000);
      run(wrangler, ["deploy", "--config", validateBuild(config), "--dry-run", "--outdir", ".wrangler/cloudflare-dry-run"], 120_000);
      break;
    case "deploy":
      validateDeployment(config);
      run(vinext, ["build"], 240_000);
      run(wrangler, ["deploy", "--config", validateBuild(config)], 180_000);
      break;
    default:
      throw new Error("Use dev, build, preview, dry-run ou deploy. Consulte docs/cloudflare.md para a migração.");
  }
} catch (error) {
  // Exibe apenas o problema da operação; as credenciais são recebidas pelas ferramentas, nunca pelo código.
  console.error(error instanceof Error ? error.message : "Não foi possível concluir a operação Cloudflare.");
  process.exitCode = 1;
}
