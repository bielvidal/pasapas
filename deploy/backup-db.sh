#!/usr/bin/env bash
# Còpia diària del Postgres de Pas a pas (pg_dump comprimit) amb rotació de 30 dies. Cron de l'usuari biel:
#   30 4 * * * /home/biel/proyectos/pasapas/deploy/backup-db.sh >> /home/biel/var/pasapas-backup.log 2>&1
# Treure les còpies del PC (rclone/scp) queda com a tasca a part; aquest script només les deixa a DESTI.
set -euo pipefail
DESTI="${PASAPAS_BACKUP_DIR:-/home/biel/var/pasapas-backups}"
mkdir -p "$DESTI"
FITXER="$DESTI/pasapas-$(date +%Y%m%d-%H%M).sql.gz"
docker exec pasapas_db pg_dump -U pasapas -d pasapas | gzip > "$FITXER"
find "$DESTI" -name 'pasapas-*.sql.gz' -mtime +30 -delete
echo "$(date -Is) còpia: $FITXER ($(du -h "$FITXER" | cut -f1))"
