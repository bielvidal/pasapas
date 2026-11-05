# Pas a pas · Àlgebra

App web (PWA, local-first) perquè una alumna de 2n de Batxillerat practiqui àlgebra bàsica amb
preguntes tipus test on **cada opció incorrecta és un error típic catalogat** (`error_tag`), i un
panell («El meu progrés») que agrega per error. Context, regles i decisions: `CLAUDE.md` i `docs/`.

```
packages/engine            Motor agnòstic: RNG amb llavor, ítems, domini, Leitner, selecció (TS pur)
packages/content-algebra   Plantilles dels blocs + verificació exacta + textos en català (texts/ca)
apps/web                   PWA Next 16 (:3011): alumna + «El meu progrés». IndexedDB, KaTeX, offline
deploy/                    unit systemd, deploy.sh, regla del túnel
docs/                      brief, especificació, catàleg, decisions, informes, registre
```

## Arrencar en local

```bash
npm install
npm run dev            # http://localhost:3011
npm test               # motor + contingut (500 llavors/plantilla) + web
npm run check          # prettier + eslint + tsc + tests
```

## Desplegar (PC de casa)

`deploy/deploy.sh` (tests → build → `systemctl restart pasapas-web` → salut). Primera vegada: vegeu
`deploy/pasapas-web.service` i `deploy/tunnel-ingress.example.yaml`.
