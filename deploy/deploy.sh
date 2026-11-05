#!/usr/bin/env bash
# Desplegament de Pas a pas al PC de casa (procediment calcat del de PPER): API (compose build + up,
# aplica l'esquema en arrencar) → portal (tests + build + restart de la unit) → salut. Sense
# `git pull`: el repo de casa ÉS la font de veritat.
#
# Ús (a /home/biel/proyectos/pasapas):
#   deploy/deploy.sh            # tot
#   deploy/deploy.sh api        # només l'API
#   deploy/deploy.sh web        # només el portal
#   deploy/deploy.sh web --no-test
set -euo pipefail
cd "$(dirname "$0")/.."
QUE="${1:-tot}"
NOTEST="${2:-}"

if [ -s "$HOME/.nvm/nvm.sh" ]; then . "$HOME/.nvm/nvm.sh"; fi
export PATH="$HOME/.nvm/versions/node/v20.20.2/bin:$PATH"
command -v npm >/dev/null || { echo "✗ npm no està al PATH (nvm)"; exit 1; }

if [[ "$QUE" == "tot" || "$QUE" == "api" ]]; then
  echo "═══ API (compose) ═══"
  [ -f apps/api/.env ] || { echo "falta apps/api/.env (vegeu apps/api/.env.example)"; exit 1; }
  [[ "$NOTEST" == "--no-test" ]] || scripts/test-py.sh
  (cd apps/api && docker compose up -d --build)
  for i in $(seq 1 40); do curl -sf http://127.0.0.1:8900/api/health >/dev/null && break; sleep 1; done
  curl -sf http://127.0.0.1:8900/api/health || { echo "✗ l'API no respon; mira: docker compose -f apps/api/docker-compose.yml logs api"; exit 1; }
  echo
fi

if [[ "$QUE" == "tot" || "$QUE" == "web" ]]; then
  echo "═══ Portal (next) ═══"
  [[ "$NOTEST" == "--no-test" ]] || npm test
  npm ci --no-audit --no-fund
  npm run build
  sudo systemctl restart pasapas-web
  for i in $(seq 1 30); do curl -sf http://127.0.0.1:3011/entrar >/dev/null && break; sleep 1; done
  curl -sf -o /dev/null http://127.0.0.1:3011/entrar || { echo "✗ el portal no respon; mira: journalctl -u pasapas-web -n 50"; exit 1; }
fi

echo "═══ Salut pública ═══"
curl -sf https://pasapas.nereidlabs.net/api/health && echo && echo "✓ desplegat a https://pasapas.nereidlabs.net" || echo "(sense regla /api al túnel encara: salut pública de l'API no disponible)"
