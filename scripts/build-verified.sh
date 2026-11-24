#!/usr/bin/env bash
# Compila o site com ambiente isolado e limite de tempo para a execução.
set -euo pipefail

# Localiza os auxiliares de compilação a partir da pasta deste script.
script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Reabre o comando no ambiente local do projeto quando ele ainda não está preparado.
if [[ "${SITES_ENV_READY:-}" != "1" ]]; then
  exec bash "${script_dir}/sites-env.sh" -- bash "$0" "$@"
fi

# Confere a ferramenta de limite de tempo exigida pela compilação.
command -v timeout || {
  echo "build-verified.sh requires GNU timeout." >&2
  exit 69
}

# Localiza o executável instalado e interrompe a operação se ele estiver ausente.
vinext="${SITES_PROJECT_ROOT}/node_modules/.bin/vinext"
if [[ ! -x "${vinext}" ]]; then
  echo "vinext is unavailable. Run npm run install:ci and wait for it to finish before building." >&2
  exit 69
fi

# Executa a compilação com prazo máximo e encerramento forçado após a tolerância.
echo "Running bounded vinext build..."
timeout \
  --signal=TERM \
  --kill-after="${SITES_BUILD_KILL_AFTER:-10s}" \
  "${SITES_BUILD_TIMEOUT:-3m}" \
  "${vinext}" build
