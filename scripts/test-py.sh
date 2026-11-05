#!/usr/bin/env bash
# Tests de l'API — SEMPRE dins del contenidor (etapa `test` del Dockerfile, mateixa base 3.12 que
# producció; el python del host és 3.8).
set -uo pipefail
cd "$(dirname "$0")/.." || exit 1
if ! docker build --quiet --target test -t pasapas-test-api apps/api >/dev/null; then
  echo "✗ error construint la imatge de test"; exit 1
fi
docker run --rm pasapas-test-api python -m pytest -q "$@"
