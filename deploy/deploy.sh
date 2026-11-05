#!/usr/bin/env bash
# Desplegament de Pas a pas al PC de casa (procediment calcat del de PPER): tests → build →
# restart de la unit → salut. Sense `git pull`: el repo de casa ÉS la font de veritat.
#
# Ús (a /home/biel/proyectos/pasapas):
#   deploy/deploy.sh            # tot (web). La fase 2 hi afegirà `api`.
#   deploy/deploy.sh --no-test  # salta els tests (només si acabes de passar-los)
set -euo pipefail
cd "$(dirname "$0")/.."

if [ -s "$HOME/.nvm/nvm.sh" ]; then . "$HOME/.nvm/nvm.sh"; fi
export PATH="$HOME/.nvm/versions/node/v20.20.2/bin:$PATH"
command -v npm >/dev/null || { echo "✗ npm no està al PATH (nvm)"; exit 1; }

if [[ "${1:-}" != "--no-test" ]]; then
  echo "═══ Tests (motor + contingut amb 500 llavors + web) ═══"
  npm test
fi

echo "═══ Build (next + service worker) ═══"
npm ci --no-audit --no-fund
npm run build

echo "═══ Restart de la unit ═══"
sudo systemctl restart pasapas-web
for i in $(seq 1 30); do curl -sf http://127.0.0.1:3011/ >/dev/null && break; sleep 1; done
curl -sf -o /dev/null http://127.0.0.1:3011/ || { echo "✗ el portal no respon; mira: journalctl -u pasapas-web -n 50"; exit 1; }

echo "═══ Salut pública ═══"
curl -sf -o /dev/null https://pasapas.nereidlabs.net/ && echo "✓ desplegat a https://pasapas.nereidlabs.net" || echo "(sense túnel encara: salut pública no disponible)"
