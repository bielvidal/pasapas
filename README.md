# Pas a pas · Àlgebra

App web (PWA, local-first) perquè una alumna de 2n de Batxillerat practiqui àlgebra bàsica amb
preguntes tipus test on **cada opció incorrecta és un error típic catalogat** (`error_tag`), i un
panell («El meu progrés») que agrega per error. Context, regles i decisions: `CLAUDE.md` i `docs/`.

```
packages/engine            Motor agnòstic: RNG amb llavor, ítems, domini, Leitner, selecció (TS pur)
packages/content-algebra   Plantilles dels blocs + verificació exacta + textos en català (texts/ca)
apps/web                   PWA Next 16 (:3011): alumna + «El meu progrés» + administració. IndexedDB, KaTeX, offline
apps/api                   FastAPI + Postgres 16 (Docker: :8900 / :5436): login per codi, convidats, sync d'intents
deploy/                    unit systemd, deploy.sh, regla del túnel
docs/                      brief, especificació, catàleg, decisions, informes, registre
```

## Arrencar en local

```bash
npm install
npm run dev            # http://localhost:3011
npm test               # motor + contingut (500 llavors/plantilla) + web
npm run check          # prettier + eslint + tsc + tests
npm run test:api       # tests de l'API dins de Docker
cp apps/api/.env.example apps/api/.env && (cd apps/api && docker compose up -d --build)   # API en local
```

Per entrar en local: `docker compose -f apps/api/docker-compose.yml exec api python -m pasapas.cli code --email <el teu correu del .env>`
i escriure el codi a http://localhost:3011/entrar.

## Desplegar (PC de casa)

`deploy/deploy.sh [api|web]` (tests → compose/build → `systemctl restart pasapas-web` → salut).
Primera vegada: `deploy/pasapas-web.service`, `apps/api/.env` i les dues regles del túnel a
`deploy/tunnel-ingress.example.yaml`. Còpies: `deploy/backup-db.sh` (cron) i `deploy/verify-backup.sh`.
