# CLAUDE.md — Pas a pas · Àlgebra

App web (PWA local-first) perquè la filla de Biel (2n de Batxillerat) practiqui àlgebra bàsica amb
preguntes tipus test on **cada opció incorrecta és un error típic catalogat** (`error_tag`), amb un
panell per veure'n l'evolució. Documents de disseny a `docs/`: `01_ESPECIFICACION.md` (arquitectura,
motor, model de dades, fases), `02_CATALOGO_CONTENIDO.md` (els 7 blocs: plantilles, tags i textos),
`DECISIONES.md` (POSICIÓN / ACUERDO / DECISIÓN PENDIENTE), `INFORME_FASE_0.md`, `REGISTRO.md` (diari).

## Restriccions dures (del brief, no negociables)

1. **No tocar el projecte PPER** (`~/proyectos/PPER`: ni codi, ni dependències, ni desplegament) **abans
   del 21/11/2026**. Es pot llegir.
2. **No barrejar amb La Sensible** (`~/proyectos/escalas`, `aula`): repo, BD i subdomini propis; no
   s'importa codi del seu monorepo. Llegir-lo com a referència i copiar-ne patrons, sí.
3. **Principis pedagògics (§2 de l'especificació):** sense cronòmetre, sense punts negatius ni ratxes
   que es perden, botó «Encara no ho sé» (es registra `skipped`, no error), explicació sempre
   disponible, llenguatge amable («Aquí has fet X…», mai «incorrecte» a seques), progrés en positiu,
   **la mateixa vista per a l'alumna i per al tutor**. Si una decisió tècnica hi xoca: preguntar.
4. **Dades mínimes d'una menor:** àlies, cap dada personal més enllà de l'email d'autenticació (fase 2),
   sense analítica de tercers.
5. **Cap resposta «correcta» pot ser incorrecta.** Cada plantilla té tests de propietat amb ≥ 500
   llavors (`PASAPAS_SEEDS` per pujar-ho). Si un test falla, **no es relaxa el test**: es revisa la
   plantilla i s'avisa Biel si el catàleg està malament.
6. **Textos de l'alumna en català, separats del codi**: `packages/content-algebra/texts/ca/`
   (`tags.ts`, `blocs.ts`, `B5.ts`…). Biel els revisa sense llegir TypeScript.

Regles de treball: verificar abans d'afirmar (versions, ports, configuració: comprovar-ho a la
màquina); treballar per fases (§9) i **parar a esperar la validació de Biel** al final de cada fase;
**preguntar abans** de `sudo`, instal·lar dependències de sistema, tocar el túnel de Cloudflare o
Access, obrir ports o tocar res fora d'aquest repo. Comandes sense `sudo`: executar-les directament.

## Comandes

```bash
npm install                 # Node 20.20.2 (nvm), npm workspaces
npm run dev                 # apps/web a http://localhost:3011
npm test                    # engine + content-algebra (500 llavors/plantilla) + web
npm run test:seeds          # content-algebra amb 2000 llavors
npm run check               # prettier --check + eslint + tsc + tests (abans de cada commit)
npm run format              # prettier --write
npm run build               # next build + service worker (Workbox) → apps/web/public/sw.js
npm start                   # next start -p 3011 (rewrite /api/* → :8900 en local)
npm run test:api            # pytest de l'API dins de Docker (scripts/test-py.sh)
(cd apps/api && docker compose up -d --build)   # API + Postgres
deploy/deploy.sh [api|web]  # tests → build/compose → sudo systemctl restart pasapas-web → salut
deploy/backup-db.sh         # pg_dump a ~/var/pasapas-backups (cron 04:30); verify-backup.sh restaura en BD de prova
```

## Mapa del repo

- `packages/engine` — motor **agnòstic del domini** (no sap res d'àlgebra): `rng.ts` (mulberry32;
  `Math.random` prohibit per ESLint), `types.ts` (Template, Item, Option, Attempt…), `build.ts`
  (`buildItem`: regenera amb llavor derivada si dues opcions coincideixen, màx. 20; `grade`),
  `mastery.ts` (domini per bloc: últims 12 intents; per tag: 4 últimes presentacions), `leitner.ts`
  (caixes per `(template, error_tag)`, 1/3/7/14 dies), `selection.ts` (ronda 70/20/10).
- `packages/content-algebra` — `src/math/` (racionals BigInt, polinomis, funcions racionals,
  monomis amb exponents racionals `Mono`, `solve.ts` (arrels racionals i conjunts solució exactes),
  `fmt` LaTeX), `src/machine.ts` (formes màquina: `rf`, `mono`, `sqrtpoly`, `eq`, `radeq`, `sol`,
  `claim`), `src/blocks/B{1..7}/templates.ts` (59 plantilles; `common.ts` utilitats, `blockTests.ts`
  tests compartits), `src/verify.ts` (verificació **exacta** amb `machineEquals`: cap tolerància;
  equacions = mateix conjunt de solucions), `texts/ca/` (textos per bloc + `comu.ts`).
  `CONTENT_VERSION` a `src/index.ts`: pujar-la quan canviï qualsevol plantilla o text.
- `apps/web` — Next 16 (App Router, tot `"use client"`: local-first, sense SSR de dades). `lib/db.ts`
  (Dexie: `attempts`, `sessions`), `lib/round.ts` (lògica de ronda, testable), `components/Ronda.tsx`
  (pregunta → explicació → resum), `components/Math.tsx` (KaTeX local + `MixedText` per a `$…$` i
  `**…**`), `lib/theme.ts` + `components/ThemeSelector.tsx` (tema clar per defecte / fosc / sistema;
  Tailwind `darkMode: "class"`, script inline a `layout.tsx` per evitar parpelleig). Pantalles: `/` (blocs + «Repassa els meus errors»), `/bloc/[id]` (Aprèn), `/practica/[id]`,
  `/repas`, `/progres` (= panell del tutor; el tutor hi tria l'alumna amb `?user=`), `/entrar`,
  `/compte`, `/admin` (tutor). UI en català a `lib/texts.ts`. Pell de PPER: tokens a `lib/tokens.ts`
  (variables CSS `--c-*`, variant `.dark`), classes de la casa a `globals.css` (`.card .btn .btn-soft
.btn-danger .field .label .table .link`), `components/Frame.tsx` (capçalera, `Notice`, `Pill`).
  Sessió: `components/AuthGate.tsx` + `lib/session.tsx` (caché a localStorage, offline tolerant).
  BD local **per usuari** (`pasapas-u<id>`, `lib/db.ts`) i cua de sincronització `lib/sync.ts`
  (push de `synced: 0` després de cada intent; pull per cursor keyset `received_at|id`).
- `apps/api` — FastAPI + SQLAlchemy 2 + Postgres 16 (Docker Compose: api :8900, db 127.0.0.1:5436;
  `.env` al costat del compose, mai al repo). Patró PPER calcat: `auth.py` (codi de 6 xifres per
  correu o dictat, cookie `pasapas_session` httpOnly 180 dies), `routers/{auth,sync,admin}.py`,
  `cli.py` (`docker compose exec api python -m pasapas.cli invite|code|link|tutor|users`).
  Errors sempre `{error, message}` (català). Tests pytest DINS del contenidor:
  `scripts/test-py.sh` (el python del host és 3.8).

## Convencions

- TypeScript estricte (`tsconfig.base.json`: `strict`, `noUncheckedIndexedAccess`,
  `exactOptionalPropertyTypes`). ESLint 9 flat + Prettier (`printWidth: 100`). Codi en anglès amb
  comentaris en català/castellà on aporten; UI i textos de contingut en català; docs en castellà.
- **Tot LaTeX** per a les expressions, construït amb `fmt` (`packages/content-algebra/src/math/latex.ts`):
  `1x → x`, `-1x → -x`, `x^1 → x`, fraccions irreductibles, signe davant de la fracció. En strings JS
  recordar el doble backslash (`"\\frac{}{}"`, `"\\;"`).
- Verificació matemàtica **exacta** (ACUERDO D8): funcions racionals comparades per producte creuat;
  «No es pot simplificar» és correcta ⇔ `RF.isSimplifiable()` és fals. Res de coma flotant.
- Els intents es desen primer a IndexedDB amb UUID de client (idempotència per a la fase 2). No es
  desa l'enunciat: es reprodueix de `(templateId, templateVersion, seed)`.
- Ports: web **3011** · API **8900** (fase 2) · Postgres **127.0.0.1:5436** (fase 2). Hostname
  `pasapas.nereidlabs.net` al túnel `contable-casa` (es dona d'alta al panell de Cloudflare, amb permís).

## Com afegir una plantilla

1. Al catàleg (`docs/02_CATALOGO_CONTENIDO.md`) hi ha d'haver l'entrada amb paràmetres, correcta,
   distractors amb `error_tag` i explicació. Si cal un tag nou, afegir-lo a `texts/ca/tags.ts` (el
   test de textos compta els tags: actualitzar-lo).
2. Textos de la plantilla a `texts/ca/<bloc>.ts` amb paràmetres `[[k]]` (s'omplen amb `fill`).
3. Plantilla a `src/blocks/<bloc>/templates.ts`: `id` estable (`B5.T10`), `version: 1` (pujar si
   canvia la generació), `block`, `type`, `level`, `generate(rng)` que retorna l'esborrany amb
   `promptMachine` i opcions `optRF` / `optNoSimplifica` / `optReason` (porten `machine` i `key`).
   Mai `Math.random`. Paràmetres amb `rng.int`; evitar casos degenerats a la pròpia plantilla.
4. Afegir-la a la llista del bloc: `templates.test.ts` (via `describeBlock`) la recull sol (500
   llavors, verificació exacta, reproduïbilitat, variació) i el test de cobertura exigeix que tots
   els tags del bloc surtin. Formes màquina: `optRF` (polinomis/fraccions/números), `opt` amb
   `monoMachine`/`eqMachine`/`solMachine`, `optText` per a claims; a `find_error`, `findErrorOptions`.
   Si una variant «invàlida» pot ser equivalent per a alguns paràmetres, torna a sortejar dins de
   `generate` (B6.T5, B7.T3). Els passos d'un `find_error` no poden mostrar-se iguals.
5. `npm run check`. Pujar `CONTENT_VERSION`.

## Estat

Fase 1 (prototip) construïda i desplegada el 2026-11-05 a `https://pasapas.nereidlabs.net` (unit
`pasapas-web`, hostname al túnel); validada per Biel i l'alumna. Fase 2 construïda la mateixa nit:
API + login + administració + sincronització + pell de PPER (compose aixecat, smoke end-to-end i
còpia verificada). Fase 3 (2026-11-06): els 7 blocs complets.
Fase 4 (2026-11-06): edició de textos sense desplegar (`content_overrides`, pestanya Textos a
Administració; `texts/ca/overrides.ts` + `apps/web/lib/overrides.ts`), panell ampliat i 11 plantilles
més (59 en total). Pendent de Biel: publicar (`sudo systemctl restart pasapas-web`), revisar textos
des de l'app i D22. Fase 5 (després del 21/11): avaluar motor compartit amb PPER.
Diari de sessions a `docs/REGISTRO.md`.
