// Configuração do Vite, Vinext e recursos Cloudflare para desenvolvimento e compilação.
import vinext from "vinext";
import { defineConfig } from "vite";
import hostingConfig from "./.openai/hosting.json";
import { sites } from "./build/sites-vite-plugin";

// Identificador reservado para simular o banco D1 no ambiente local.
const SITE_CREATOR_PLACEHOLDER_DATABASE_ID =
  "00000000-0000-4000-8000-000000000000";

// Lê do manifesto os nomes dos recursos de banco e armazenamento.
const { d1, r2 } = hostingConfig;

// Seleciona a configuração da conta do cliente sem mudar o fluxo ainda usado pelo Sites.
const deployToCloudflare = process.env.DEPLOY_TARGET === "cloudflare";

// macOS Seatbelt blocks FSEvents, so Codex previews need polling for HMR.
const isCodexSeatbeltSandbox = process.env.CODEX_SANDBOX === "seatbelt";

// Configura os recursos D1 e R2 simulados localmente a partir do manifesto de hospedagem.
const localBindingConfig = {
  main: "./worker/index.ts",
  compatibility_flags: ["nodejs_compat"],
  d1_databases: d1
    ? [
        {
          binding: d1,
          database_name: "site-creator-d1",
          database_id: SITE_CREATOR_PLACEHOLDER_DATABASE_ID,
        },
      ]
    : [],
  r2_buckets: r2
    ? [
        {
          binding: r2,
          bucket_name: "site-creator-r2",
        },
      ]
    : [],
};

export default defineConfig(async () => {
  // Keep Wrangler and Miniflare state project-local. These are non-secret tool
  // settings; application environment belongs in ignored `.env*` files.
  process.env.WRANGLER_WRITE_LOGS ??= "false";
  process.env.WRANGLER_LOG_PATH ??= ".wrangler/logs";
  process.env.MINIFLARE_REGISTRY_PATH ??= ".wrangler/registry";

  // Wrangler snapshots its log path while the Cloudflare plugin is imported.
  const { cloudflare } = await import("@cloudflare/vite-plugin");

  return {
    server: {
      host: "0.0.0.0",
      allowedHosts: ["terminal.local"],
      ...(isCodexSeatbeltSandbox
        ? { watch: { useFsEvents: false, usePolling: true } }
        : {}),
    },
    plugins: [
      vinext(),
      ...(deployToCloudflare ? [] : [sites()]),
      cloudflare({
        viteEnvironment: { name: "rsc", childEnvironments: ["ssr"] },
        inspectorPort: false,
        // O destino Cloudflare lê seus próprios recursos; o Sites mantém os bindings atuais.
        ...(deployToCloudflare
          ? { configPath: "./wrangler.cloudflare.jsonc" }
          : { config: localBindingConfig }),
      }),
    ],
  };
});
