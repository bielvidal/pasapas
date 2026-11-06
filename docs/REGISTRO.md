# Registro de sesiones — Pas a pas · Àlgebra

> Una entrada por sesión: qué se hizo, qué queda pendiente, qué tiene que revisar Biel.

## S1 · 2026-11-05 · Fase 0 (inspección) y fase 1 (prototipo)

**Fase 0.** Informe `INFORME_FASE_0.md` (stack real de La Sensible y PPER, puertos, túnel, backups,
propuestas para las decisiones pendientes, riesgos). Validado por Biel el mismo día. Acuerdos en
`DECISIONES.md` (D0a npm, D0b ESLint/Prettier, D1 `pasapas.nereidlabs.net`, D2 login patrón PPER,
D2b fase 1 sin login, D5 nada compartido con PPER, D7 puertos, D8 verificación exacta, D9 carpeta
renombrada a `pasapas`, D12 repo GitHub creado por Biel desde la web).

**Fase 1, construido:**

- Repo npm workspaces (Node 20.20.2), TypeScript 5.9 estricto, ESLint 9 + Prettier, Vitest 4.
- `packages/engine`: RNG mulberry32 con semillas derivadas, tipos, `buildItem` (regeneración ante
  colisiones, máx. 20), `grade`, dominio por bloque/nivel/tag, Leitner por `(template, tag)`,
  `planRound` 70/20/10 y `planReviewRound`. 33 tests.
- `packages/content-algebra`: racionales BigInt, polinomios (gcd, división), funciones racionales
  (igualdad exacta, `isSimplifiable`, clave canónica), `fmt` LaTeX; textos en catalán de los 61 tags
  y los 7 bloques; **B5 completo** (9 plantillas: 7 `mc_result`, 1 `valid_step`, 1 `find_error`);
  `verifyItem` exacto; tests de propiedad con 500 semillas (pasan también con 3000), cobertura de
  tags, tests negativos del verificador. 49 tests.
- `apps/web`: PWA Next 16.3 en :3011, Dexie (IndexedDB), KaTeX local, Workbox (offline), manifest e
  iconos, modo oscuro, mobile-first. Pantallas: Inici, Aprèn, Pregunta (4 tipos, dos pasos en
  `valid_step`), Final de ronda, Repàs, El meu progrés. 4 tests. Build de producción OK; smoke test
  con `curl` de todas las rutas (200) y 404 de bloque inexistente.
- `deploy/`: unidad systemd `pasapas-web`, `deploy.sh`, notas del túnel. `CLAUDE.md`, `README.md`.

**Desviaciones respecto a la especificación (documentadas en DECISIONES):** sin mathjs (D8); el kit
matemático y `fmt` viven en `content-algebra`, no en `engine` (D13); fase 1 sin Cloudflare Access ni
login (D2/D2b). Pendientes del catálogo señaladas en `INFORME_FASE_0.md` §5.2: en B5 se ha
implementado tal como está escrito (incluido el distractor `x² − s·k` de B5.T3).

**Decisiones de implementación que conviene que Biel conozca:**

- En `valid_step`, la alumna responde primero «Sí/No» y luego la razón; cuenta como acierto solo si
  ambas son correctas. El tag registrado es el de la razón elegida (o el del paso, si aceptó un paso
  inválido con la razón correcta).
- En `find_error`, marcar como erróneo un paso correcto registra un tag según el paso: la
  factorización → `B4_NO_RECONEIX`; la cancelación válida → `B5_NO_TATXA_FACTOR`; «Tots els passos
  són correctes» cuando hay error → el tag del error inyectado (lo ha aceptado).
- «Saltar» (`skipped`) no mueve la caja de Leitner ni cuenta para el dominio por tag.

**Validación de Biel (misma tarde):** probada en el móvil; textos en catalán OK. Pide selector de
tema con **claro por defecto** → hecho: `lib/theme.ts` (preferencia en localStorage, `dark` como
clase en `<html>`, script inline anti-parpadeo), `components/ThemeSelector.tsx` (Clar / Fosc / Com el
mòbil, en Inici), Tailwind `darkMode: "class"`. 4 tests nuevos (90 en total). Web 0.1.1. Repo GitHub
`bielvidal/pasapas` creado por Biel; remoto `origin` añadido y primer push.

**Despliegue (2026-11-05, hecho por Biel desde terminal):** hostname `pasapas.nereidlabs.net →
localhost:3011` dado de alta en el túnel `contable-casa` (panel Zero Trust, CNAME creado), unidad
`pasapas-web` instalada, `enable --now`. Verificado: servicio activo y habilitado, el proceso del
:3011 pertenece a la unit, `https://pasapas.nereidlabs.net/` y `/sw.js` responden 200 con el build
0.1.1. Sin Cloudflare Access (D2b). Próximos despliegues: `deploy/deploy.sh`.

**Pendiente para la siguiente sesión (cerrado en S2):** ver abajo.

## S2 · 2026-11-05 (noche) · Fase 2: backend, login, administración, sincronización y estética PPER

Biel y la alumna probaron la fase 1 («todo ok») y Biel pidió seguir con las fases copiando de PPER
todo lo útil (estética, login, administración, arquitectura). Se leyó PPER en solo lectura
(`services/api/pper/*`, `apps/web/{app,components,lib}`, `deploy/*`, `scripts/test-py.sh`) y se
calcó el patrón sin importar código.

**Construido:**

- `apps/api` (FastAPI + SQLAlchemy 2 + Postgres 16 en Docker Compose; api :8900, db 127.0.0.1:5436;
  contenedores `pasapas_api`/`pasapas_db`, volumen `pasapas_pgdata`). Módulos `settings`, `db`
  (create_all + migraciones SQL numeradas), `models` (users, invitations, login_codes, magic_links,
  auth_sessions, study_sessions, attempts con índices de §6), `auth` (código de 6 cifras, un uso,
  caduca en 10 min, se quema a los 5 fallos; cookie `pasapas_session` httpOnly 180 días renovable;
  tutores por `PASAPAS_TUTOR_EMAILS`; lista de invitados con alias), `mail` (console/smtp/memoria),
  `ratelimit` (por IP, lee `cf-connecting-ip`), `cli` (initdb, invite, code, link, tutor, users),
  routers `auth`, `sync` (lotes idempotentes por id; `GET /api/attempts` con cursor keyset
  `received_at|id`; el tutor lee los de cualquier usuario), `admin` (usuarios, dispositivos,
  invitaciones, **código dictado** sin correo). Errores `{error, message}` en catalán. 25 tests
  pytest sobre SQLite dentro del contenedor (`scripts/test-py.sh` / `npm run test:api`).
- `apps/web`: piel de PPER vía tokens CSS (`lib/tokens.ts`, plugin Tailwind, `.dark`), IBM Plex,
  `Frame` (cabecera fija con navegación), `AuthGate` (sesión: caché local + `/api/me`, offline
  tolerante), `/entrar` (correo → código), `/entrar/enllac` (rescate CLI), `/compte` (alias,
  dispositivos, sincronización, tema, salir, borrar cuenta), `/admin` (Convidats con «Genera un
  codi»; Usuaris con progreso, dispositivos, borrar), `/progres` con selector de alumna para el
  tutor (misma vista, D3). BD local por usuario (D18) con migración de la fase 1; `lib/sync.ts`
  (push de pendientes tras cada intento y al volver la red; pull por cursor). Rewrite `/api/*` →
  :8900 en desarrollo; service worker con `/api` en NetworkOnly. 17 tests (sync, api, theme, round).
- `deploy/`: `deploy.sh` (api/web), `backup-db.sh` (cron 04:30 → `~/var/pasapas-backups`, 30 días),
  `verify-backup.sh` (restaura en una BD de prueba: **verificado**, criterio de salida de la fase 2),
  `tunnel-ingress.example.yaml` con la regla `/api` → :8900.
- `apps/api/.env` creado (contraseña aleatoria, tutor = correo de Biel, `console`), compose
  levantado, smoke end-to-end contra Postgres real: invitar → código → login → lote (idempotente) →
  lectura con cursor → tutor ve los intentos de la alumna → alumna no entra en admin → código
  dictado → borrado de usuario e invitación. Portal nuevo probado en :3012 (todas las rutas 200, el
  rewrite `/api/health` responde) y parado.

**Incidente (23:40):** el primer `docker compose up` de `apps/api` tomó el nombre de proyecto `api`
(el de la carpeta), el mismo que `PPER/services/api` y con los mismos servicios `api`/`db`: Compose
**sustituyó `pper_api` y `pper_db`** por los contenedores de pasapas y sobrescribió la imagen
`api-api`. El portal de PPER (3009) no cayó; su volumen `api_pper_pgdata` quedó intacto. Arreglo:
`name: pasapas` en el compose (obligatorio; comentado en el fichero), contenedores de pasapas
eliminados, PPER restaurado por Biel con `docker compose up -d --build` en su carpeta (verificado:
`/api/salud` local y público). Lección de la casa: **todo compose lleva `name:`** (Aula también usa
`api`: `api_aula_pgdata`). Violación involuntaria de la restricción 1, documentada aquí.

**Pendiente (lo hace Biel):** ~~regla `api` → `localhost:8900` en el túnel~~ hecha y verificada
(`/api/health` público responde JSON);
`sudo systemctl restart pasapas-web`; cron de la copia; invitar a la alumna desde Administración y
dictarle el código; (opcional) `.claude/settings.json` con `docker compose`, `scripts/test-py.sh`…
**Siguiente sesión:** feedback con sync real entre móvil y PC; fase 3 (bloques, D20).

## S3 · 2026-11-06 (madrugada) · Fase 3: los seis bloques restantes

Biel: «adelante con todos los bloques en el orden que prefieras, no pares hasta tenerlos todos, ya
revisaremos después». Hecho B1, B2, B3, B4, B6 y B7 (39 plantillas nuevas; 48 en total) siguiendo
el catálogo, con textos en catalán en `texts/ca/B{1,2,3,4,6,7}.ts` + `comu.ts` (pendientes de
revisión de Biel).

**Motor de verificación ampliado (exacto, sin coma flotante):** `Mono` (monomios con exponentes
racionales, B3), `solve.ts` (raíces racionales por el teorema de la raíz racional, conjuntos
solución con residuo sin raíces racionales, ecuaciones racionales y radicales `√(x+a) = x−b`),
formas máquina nuevas en `machine.ts` (`mono`, `sqrtpoly`, `eq`, `radeq`, `sol`, claims
`no_factoritza` y `wrong_form`) y `machineEquals` genérico en `verify.ts`. `valid_step` de
ecuaciones = mismo conjunto de soluciones (convención del catálogo). Tests: 197 en contenido (500
semillas por plantilla; pasan también con 2000), KaTeX estricto sobre 50 semillas de cada plantilla
sin errores, 247 TS en total.

**Decisiones de implementación (desviaciones del catálogo, a confirmar por Biel):**

- B2.T4: errata del catálogo en el distractor de `B2_INVERTEIX_PRIMERA` para la segunda variante:
  se usa `c/(ab)` (invertir la fracción equivocada en `a/(b/c)`); en la primera, `b/(ac)`.
- B3.T4: `a` y `b` coprimos además de distintos (si no, la fracción se mostraba ya reducida).
- B3.T5: el pool usa `(x + k)²` en lugar de `(x + y)²` (una sola variable: verificación exacta con
  polinomios); `√(x² + k²)` y `√(k²x²)` son dos entradas separadas (§5.2 del informe).
- B4.T2 «nivel 1-2» son dos plantillas: `B4.T2` (nivel 1, a = 1, con «No es pot factoritzar») y
  `B4.T2b` (nivel 2, a ∈ [2..4]).
- B4.T5: el error `B4_FACTOR_COMU_INCOMPLET` (`g·x(x² − g·k²)`) solo continúa de forma coherente si
  `g·k²` es cuadrado, así que en esa variante g = 4 y el paso siguiente es `4x(x + 2k)(x − 2k)`.
- B5.T3 se deja como en el catálogo (distractor `x² − s·k`): **decidido por Biel** (D21, acuerdo).
- B6.T5 y B7.T3 (`valid_step` de ecuaciones) se generalizan con parámetros como pide el catálogo y
  se vuelve a sortear si la variante «inválida» resultara equivalente (lo exige el verificador).
- B7.T5 (`next_step` de `√(x+a) = x−b`): la forma máquina del enunciado es la ecuación ya elevada
  al cuadrado (el paso correcto no es equivalente al original: introduce la raíz falsa); el
  distractor `√x + √a = x − b` es `claim:wrong_form` (incorrecto por construcción).
- `find_error` de B7.T7: cuando el error es «dividir por x», la resolución tiene 3 pasos (si no,
  dos pasos se mostrarían iguales).
- Tags repetidos entre distractores (B1.T3, B2.T3, B3.T7, B7.T6…): permitidos, como ya dijo el
  informe; el panel cuenta una elección por intento.

**Pendiente:** Biel revisa los textos nuevos (`packages/content-algebra/texts/ca/`), decide B5.T3
(D21) y confirma las desviaciones; `sudo systemctl restart pasapas-web` para publicar (build hecho,
web 0.3.0, contenido 0.2.0). Corregir el catálogo (`02_CATALOGO_CONTENIDO.md`) con estas
decisiones cuando Biel las valide.

## S4 · 2026-11-06 · Fase 4: edición de textos, panel ampliado y contenido extra

1. **Edición de textos sin desplegar** (`content_overrides`, §6): API (tabla, `GET /api/content/overrides`
   —el tutor recibe también los borradores, la alumna solo los aprobados—, `PUT/DELETE
   /api/admin/content/overrides/{key}`), claves estables `tag:X:nom|explicacio`, `bloc:ID:titol|reglaOr`,
   `template:ID:camí.amb.punts` (`listTexts`/`applyOverrides` en `texts/ca/overrides.ts`). La web aplica
   los textos cacheados antes de renderizar (offline) y los refresca en cada sync; pestaña **Textos** en
   Administració (buscar, esborrany, aprova, torna a l'original). El tutor ve los borradores aplicados
   en Revisió. API redesplegada (0.3.0).
2. **Panel ampliado** (`/progres`, misma vista alumna/tutor): ventana 4/8/12 semanas, filtro por bloque,
   resumen (intentos, bien resueltos, saltados), nivel actual y por niveles de cada bloque, «els que més
   es repeteixen», errores activos con «últim cop», «superats en aquestes setmanes», días activos.
3. **Contenido extra del catálogo**: `next_step` B1.T7, B2.T7, B3.T9, B5.T10 y segundo `find_error`
   B1.T8, B2.T8, B3.T10, B4.T7, B5.T11, B6.T7, B7.T8 (59 plantillas; 207 tests de bloque, también con
   2000 semillas). Catálogo actualizado con las 11 entradas. CONTENT_VERSION 0.3.0, web 0.4.0.

**Pendiente de Biel:** `sudo systemctl restart pasapas-web`; revisar textos (ahora también desde la
app) y D22. **Siguiente:** feedback de uso; fase 5 (tras 21/11) según el brief.

**Pendiente histórico de S1:**

1. ~~Biel prueba la app en el móvil~~ hecho (2026-11-05).
2. ~~Revisión de los textos en catalán~~ OK (2026-11-05).
3. ~~Despliegue~~ hecho (2026-11-05); ver arriba.
4. ~~Repo GitHub~~ creado y primer push hecho (2026-11-05).
5. ~~Después de una semana de uso: feedback de la alumna, y arrancar la fase 2~~ la fase 2 se construyó en S2 (misma noche).
6. Playwright (smoke e2e offline/online de §10) queda para la fase 2: necesita instalar navegadores.
