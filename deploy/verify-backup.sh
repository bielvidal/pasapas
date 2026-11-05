#!/usr/bin/env bash
# Verifica una còpia (criteri de sortida de la fase 2): la restaura en una BD de prova dins del
# mateix contenidor, compta files i l'esborra.
#   deploy/verify-backup.sh [fitxer.sql.gz]   (per defecte, l'última de ~/var/pasapas-backups)
set -euo pipefail
DESTI="${PASAPAS_BACKUP_DIR:-/home/biel/var/pasapas-backups}"
FITXER="${1:-$(ls -t "$DESTI"/pasapas-*.sql.gz | head -1)}"
[ -f "$FITXER" ] || { echo "✗ no existeix $FITXER"; exit 1; }
PROVA="pasapas_restore_$$"
docker exec pasapas_db psql -U pasapas -d postgres -qc "CREATE DATABASE $PROVA" >/dev/null
trap 'docker exec pasapas_db psql -U pasapas -d postgres -qc "DROP DATABASE IF EXISTS $PROVA" >/dev/null' EXIT
gunzip -c "$FITXER" | docker exec -i pasapas_db psql -U pasapas -d "$PROVA" -q -v ON_ERROR_STOP=1 >/dev/null
docker exec pasapas_db psql -U pasapas -d "$PROVA" -Atc \
  "SELECT 'users=' || (SELECT count(*) FROM users) || ' attempts=' || (SELECT count(*) FROM attempts) || ' invitations=' || (SELECT count(*) FROM invitations)"
echo "✓ $FITXER es restaura correctament"
