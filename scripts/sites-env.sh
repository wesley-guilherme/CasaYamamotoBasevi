#!/usr/bin/env bash
# Prepara os diretórios e as variáveis de execução locais antes de iniciar o comando solicitado.
set -euo pipefail

# Resolve a raiz do projeto e a pasta destinada ao estado temporário das ferramentas.
project_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
runtime_root="${SITES_RUNTIME_ROOT:-${project_root}/.sites-runtime}"

# Cria as pastas graváveis utilizadas pelas ferramentas de desenvolvimento.
mkdir -p \
  "${runtime_root}/home" \
  "${runtime_root}/npm-cache" \
  "${runtime_root}/xdg-config" \
  "${runtime_root}/tmp" \
  "${runtime_root}/wrangler/logs"

# Configura o ambiente e concentra os arquivos temporários e de diagnóstico no projeto.
export SITES_ENV_READY=1
export SITES_PROJECT_ROOT="${project_root}"
export HOME="${runtime_root}/home"
export XDG_CONFIG_HOME="${runtime_root}/xdg-config"
export TMPDIR="${runtime_root}/tmp"
export WRANGLER_WRITE_LOGS=false
export WRANGLER_LOG_PATH="${runtime_root}/wrangler/logs"
export MINIFLARE_REGISTRY_PATH="${runtime_root}/wrangler/registry"

# The runtime may provide a global npm cache. Keep the image's read-only Sites
# seed separate and make this project's writable cache authoritative.
# Seleciona o cache gravável do projeto e desativa tarefas acessórias do npm.
unset NPM_CONFIG_CACHE npm_config_cache || true
export npm_config_cache="${runtime_root}/npm-cache"
export npm_config_audit=false
export npm_config_fund=false
export npm_config_update_notifier=false

# The runtime already supplies the standard HTTP(S)_PROXY variables. Remove
# npm-specific aliases so npm 11 does not reinterpret or warn about them.
# Remove aliases específicos de proxy que podem conflitar com a configuração padrão do ambiente.
unset \
  npm_config_proxy \
  npm_config_http_proxy \
  npm_config_https_proxy \
  NPM_CONFIG_PROXY \
  NPM_CONFIG_HTTP_PROXY \
  NPM_CONFIG_HTTPS_PROXY \
  || true

# Consome o separador opcional entre as opções do auxiliar e o comando de destino.
if [[ "${1:-}" == "--" ]]; then
  shift
fi

# Exige um comando de destino e informa o formato de chamada quando ele está ausente.
if [[ "$#" -eq 0 ]]; then
  echo "usage: scripts/sites-env.sh -- command [args...]" >&2
  exit 64
fi

# Executa o comando solicitado na raiz do projeto com o ambiente preparado.
cd "${project_root}"
exec "$@"
