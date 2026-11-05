# Informe de fase 0 — inspección de la máquina y de los proyectos vecinos

> **Actualización 2026-11-05 (tarde):** Biel ha decidido D2 (login: patrón PPER, no Access), D5 (nada compartido con PPER, se copian patrones) y D9 (renombrar a `pasapas`). Ver `DECISIONES.md`. Las propuestas §4.2 y §4.5 de este informe quedan superadas; se conservan como registro.

> Pas a pas · Àlgebra · 2026-11-05 · Solo lectura: no se ha tocado nada de La Sensible, de PPER ni del túnel.
> Todo lo que sigue está comprobado en la máquina (`ss`, `docker`, `systemctl`, `node_modules`, contenedores) salvo donde se indica «según docs».

## 0. Resumen en diez líneas

1. **No hay pnpm en la máquina.** La Sensible y PPER usan **npm workspaces** (`package-lock.json`). Propongo npm también para Pas a pas.
2. **No hay ESLint ni Prettier configurados** en ningún proyecto. La calidad se apoya en TypeScript `strict`, `tsc --noEmit`, Vitest y tests. Hay que decidir si Pas a pas los añade.
3. Stack real: **Node 20.20.2 (nvm, única versión)**, Next 16.2–16.3, React 19.2–19.3, TypeScript 5.9.3, Vitest 4.1, Tailwind 3.4, Dexie 4 para IndexedDB, Workbox para el service worker. Backends: **Python 3.12 dentro de Docker**, FastAPI 0.162, SQLAlchemy 2.1, psycopg 3.3, Postgres 16.13. El Python del host es 3.8 (Anaconda) y no sirve para los servicios.
4. **Puertos libres propuestos:** web **3011**, API **8900**, Postgres **5436**. Nada los usa ni los reserva ningún documento.
5. El túnel `contable-casa` es **remoto (token)**: las rutas se editan en el panel de Cloudflare Zero Trust, no hay `config.yml`. Sirve hoy `equipo.`, `taller.`, `crm.` (lasensible.app) y `contable.`, `armonia.`, `escalas.`, `pper.` (nereidlabs.net).
6. **Cloudflare Access ya se usa** (One-time PIN por email, política `socios-lasensible`) para equipo/taller/crm, y hay código que lee la cabecera (`apps/equipo/lib/identity.ts`). PPER **no** usa Access: tiene auth propia por código de 6 cifras.
7. PPER guarda el progreso como **un JSON entero por usuario** (`progreso.prog`) fusionado con `mergeProg`, más un **log fila a fila** (`respuestas`) idempotente por (sesión, pregunta). Su SRS es de cajas 0–3 por pregunta, con `picks` por opción (un `error_tag` embrionario).
8. **Backups:** PPER hace `pg_dump` diario a las 04:20 en `~/var/pper-backups` (rotación 30 días, 7 copias hoy, log en `~/var/pper-backup.log`). Solo en este PC, sin copia externa. Mismo patrón en Aula (VPS).
9. **Hallazgo:** hay un `next start -p 3019` suelto desde el 2-nov en `PPER/apps/web` (segunda instancia del portal PPER). No lo toco (restricción 1); lo señalo.
10. **Riesgos principales:** Access + PWA offline (redirecciones al login en la sincronización), verificación exacta con mathjs en coma flotante, y varias plantillas del catálogo con detalles a corregir antes de implementarlas.

---

## 1. La Sensible (`~/proyectos/escalas`, worktree `~/proyectos/escalas-aula`, y `~/proyectos/aula`)

### 1.1 Organización

- **Monorepo npm workspaces** (`"workspaces": ["packages/*", "apps/*"]`), un solo `package-lock.json` en la raíz. No hay `pnpm-workspace.yaml` ni `.nvmrc`.
- `apps/`: `pwa` (la app, local-first), `web` (marketing), `backoffice` (Taller), `equipo` (portal interno), `video` (worker).
- `packages/`: `engine` (motor de teoría musical, TS puro, exporta `./src/index.ts` sin build), `telemetry`, `tokens`, `embed`.
- `services/`: cuatro servicios Python (`telemetry-server`, `backoffice-api`, `commerce-server`, `prescriptores`), cada uno con su `Dockerfile` multi-etapa (`base` → `test` → `prod`), su `docker-compose.yml` y su Postgres.
- `~/proyectos/escalas-aula` es un **git worktree** de la rama `aula` del mismo repo. `~/proyectos/aula` es un repo aparte (`la-sensible-aula`), con la misma estructura que PPER (`apps/web` + `services/api`).
- Remotos: `git@github.com:bielvidal/la-sensible.git`, `bielvidal/la-sensible-aula.git`, `bielvidal/pper.git` (privados, SSH). **No hay `gh` instalado** ni workflows de CI (`.github/` no existe en ningún repo): los tests se ejecutan a mano.

### 1.2 Versiones (instaladas en `node_modules`, no las del `package.json`)

| Pieza | La Sensible | PPER | Aula |
|---|---|---|---|
| Node | 20.20.2 (nvm, única versión instalada) | igual | igual |
| npm | 10.8.2 | igual | igual |
| pnpm | **no instalado** | — | — |
| Next | 16.2.10 | 16.3.5 | ^16.2.9 |
| React | 19.2.7 | 19.3.1 | ^19.2.7 |
| TypeScript | 5.9.3 (`strict: true`) | 5.9.3 (`strict: true`, `allowJs: false`) | ^5.6 |
| Vitest | 4.1.10 | 4.1.11 | ^4.1.9 |
| Tailwind | 3.4.19 | 3.4.19 | ^3.4.13 |
| IndexedDB | Dexie 4.0 + `fake-indexeddb` en tests | — (localStorage) | — |
| Service worker | `workbox-build` 7.4 (`scripts/build-sw.mjs`, genera `public/sw.js` tras `next build`) | — | — |
| ESLint | **sin config** (solo el script `next lint`; eslint no está instalado) | no | no |
| Prettier | **sin config** (3.8.1 aparece solo como dependencia transitiva) | no | no |
| Python (servicios) | 3.12 (`python:3.12-slim`) | 3.12.13 | 3.12 |
| FastAPI / SQLAlchemy / psycopg / pydantic / uvicorn | `>=0.111` / `>=2.0` / `>=3.1` / — / `>=0.30` | 0.162.0 / 2.1.6 / 3.3.6 / 2.14.1 / 0.54.0 | `>=0.115` / `>=2.0` / `>=3.1` + pyjwt, cryptography |
| Postgres | `postgres:16-alpine` | 16.13 | `postgres:16-alpine` |
| Docker / Compose | 28.1.1 / v2.35.1 | | |

Convenciones de `tsconfig` compartidas: `target ES2020/ES2022`, `moduleResolution: bundler`, `paths: {"@/*": ["./*"]}`, `exclude: ["**/*.test.ts"]`. En `next.config`: `reactStrictMode: true` y `transpilePackages` para los paquetes del workspace (no se compilan: Next los transpila desde `src/*.ts`).

### 1.3 Despliegue

- **Frontends Next en systemd** (unidades en `/etc/systemd/system/`, usuario `biel`, `WorkingDirectory` en el repo, `Environment=PATH=/home/biel/.nvm/versions/node/v20.20.2/bin:…`, `ExecStart=…/npm run start [-w @escalas/x]`, `Restart=on-failure`). La ruta de node va horneada: si cambia nvm hay que editar las unidades.
- **Backends en Docker Compose**, un compose por servicio, `ports: "127.0.0.1:PUERTO:PUERTO"` (solo loopback; los expone el túnel), Postgres con volumen nombrado y `healthcheck`, `AUTO_INITDB=1`, `.env` junto al compose y fuera del repo (`.env.example` versionado).
- **Tests Python siempre dentro del contenedor**: `scripts/test-py.sh` construye la etapa `test` del Dockerfile. Regla de la casa: nunca con el `python3` del host.
- Secretos: `.gitignore` excluye `.env`, `.env.*` (salvo `*.example`), `*.pem`, `*.key`; backup aparte (`scripts/backup-secretos.sh`).
- Scripts de salud (`scripts/salud.sh`) y procedimiento de despliegue `deploy/deploy.sh` (Aula y PPER): `compose up -d --build` → espera a `/api/salud` → `npm ci && npm run build` → `systemctl restart` → `curl` de salud pública.

---

## 2. PPER (`~/proyectos/PPER`)

### 2.1 Stack

- `apps/web`: Next 16.3.5 + Tailwind, portal en **:3009** (`next start -p 3009`, unidad `pper-web`). La app de test es **`public/test/index.html`** (684 líneas de JS vanilla, sin framework), servida en `/test` por rewrite. El portal reenvía `/api/*` a la API con un `rewrites()` leyendo `PPER_API_URL`.
- `services/api`: FastAPI + SQLAlchemy 2 + Postgres 16 en compose: `pper_api` en **127.0.0.1:8800**, `pper_db` en **127.0.0.1:5435**, volumen `api_pper_pgdata`. `content/` montado en solo lectura. Migraciones SQL numeradas en `services/api/migrations/`.
- Tests: `scripts/test-py.sh` (pytest en contenedor, sobre SQLite con tipos portables), `npm test` (vitest sobre `lib/**/*.test.ts`), `node --test scripts/docs/`.

### 2.2 Login

No es Google: el brief original lo pedía, pero se descartó. Es **código de 6 cifras por correo** (`pper/auth.py`):

- `POST` pide código → se guarda `sha256(email:codigo)` en `codigos_entrada` con caducidad (10 min) y contador de intentos (5); un solo código vivo por correo. La API nunca revela si el correo existe.
- Solo entran los correos de la lista `invitados`, los que ya tienen cuenta y `PPER_ADMIN_EMAILS` del `.env`.
- Al validar, se crea el usuario si no existe y una fila en `sesiones` (`token_hash`, 180 días renovables, dispositivo resumido del User-Agent) → cookie `pper_sesion` httpOnly, `SameSite=Lax`, `secure` según `.env`.
- Magic link queda como **rescate por CLI** (`python -m pper.cli enlace --email …`), porque abrir el enlace en el navegador embebido de Gmail dejaba la sesión en el sitio equivocado.
- Correo: backend `console` por defecto (el código sale en el log del contenedor); SMTP de SES preparado en el `.env` pero, según `docs/REGISTRO.md`, el piloto va **sin SMTP**, pasando enlaces a mano. Rate limit por IP en memoria (`cf-connecting-ip`).
- Roles: `admin` / `alumno`.

### 2.3 Estadísticas por usuario

Dos capas que conviven:

1. **`progreso.prog`** (JSONB): el objeto `prog` de la app entero (`{v, q: {id: {seen, ok, ko, streak, box, ew, ewPrev, last, picks, lastPick}}, sessions[], updated}`). `PUT /api/progress` fusiona servidor+cliente con `fusionar()`, que reproduce exactamente `mergeProg` del cliente (por pregunta gana el mayor `seen`, a igual `seen` el mayor `last`; sesiones unión por id, máximo 300). El cliente guarda en `localStorage`, reintenta al volver online.
2. **`respuestas`** (fila a fila): `(usuario, pregunta_id, tema, elegida, correcta, modo, sesion_test, ts)` con `UniqueConstraint(usuario, sesion_test, pregunta_id)` → `POST /api/answers` es **idempotente por (sesión, pregunta)**; cada respuesta se envía a los 1,5 s (y en `pagehide`), con cola local si falla. `sesiones_test` guarda el resumen de cada sesión. El panel del admin agrega por tema y origen de la pregunta en SQL.

SRS del cliente: cajas 0–3 por pregunta (`box`), media móvil exponencial de aciertos (`ew`), peso de selección según caja y días desde la última vez (`weight()`), y `picks[idx]` cuenta cuántas veces se eligió cada distractor («Confundes con: …»). El banco son 1.462 preguntas fijas (`{id, tema, q, opts[4], ans, exp, art, dif, tipo}`), sin generación ni etiquetas de error.

### 2.4 Parecidos con el motor de Pas a pas (para la decisión del §5)

| Concepto | PPER | Pas a pas (spec) |
|---|---|---|
| Ítem | fijo, del banco, id estable | generado por plantilla + semilla, reproducible |
| Opciones | 4, `ans` índice correcto | 4, cada distractor con `error_tag` |
| Explicación | una por pregunta | una por acierto + una por `error_tag` |
| Registro | `prog` JSON + log `respuestas` idempotente | log `attempts` idempotente por `id` UUID |
| Repaso | cajas 0–3 por pregunta, pesos de selección | Leitner 4 cajas por `(template, error_tag)`, ítem nuevo cada vez |
| Dominio | % y `box >= 3` por tema | ventana de 12 intentos por bloque + tags «superats» |
| Confusiones | `picks` por índice de opción | `error_tag` catalogado |
| Sync | `mergeProg` + cola local | cola IndexedDB → `attempts:batch` |

Lo compartible de verdad es pequeño: el log idempotente de intentos, una caja de Leitner y la selección ponderada. El resto está acoplado a un banco fijo (PPER) o a plantillas generadas (Pas a pas). Y el `index.html` de PPER tiene la regla explícita «no reescribirla en React».

### 2.5 Dónde corre

- Portal `pper-web` :3009 (systemd) · API :8800 · Postgres :5435 (Docker) · hostname `pper.nereidlabs.net` → `localhost:3009` en `contable-casa` · sin Cloudflare Access.
- **Proceso suelto:** `sh -c next start -p 3019` (PID 1606149, arrancado el lun 2-nov 14:53 en `/home/biel/proyectos/PPER/apps/web`, usuario biel, fuera de systemd). Responde en :3019 con el mismo portal y proxya la misma API. No está en ningún documento de PPER. **No lo toco** (restricción 1): conviene matarlo después del 21/11 o cuando confirmes que no es tuyo adrede.

---

## 3. Infraestructura de la máquina

### 3.1 Máquina

`biel-MS-7B23` · Ubuntu 20.04.6 LTS (kernel 5.15) · 6 núcleos · 31 GB RAM (19 GB disponibles) · 413 GB libres en `/` · siempre encendido. Dropbox corre en el host (:17500/17600/17603); **Mates está en `~/proyectos`, fuera de Dropbox**, como manda la casa.

### 3.2 Puertos ocupados (comprobado con `ss -ltnp` y `docker ps`)

| Puerto | Qué | Cómo |
|---|---|---|
| 80 | Apache2 (`/var/www/html`, sitio por defecto) | systemd (root) |
| 3000, 5432, 8000 | **Reconcilio** (web, Postgres, API; compose en `~/Dropbox/Programació/casas/reconcilio/ops`) | Docker, **no tocar** |
| 3001 | `escalas-pwa` (next) | systemd |
| 3002 | `escalas-taller` (next) | systemd |
| 3005 | `escalas-crm` (next) | systemd |
| 3006 | `escalas-equipo` (next) | systemd |
| 3009 | `pper-web` (next) | systemd |
| 3019 | `next start -p 3019` suelto (PPER) | proceso manual |
| 3306, 33060 | MySQL del host | systemd |
| 5433 | `escalas_scout_db` (Postgres prescriptores) | Docker |
| 5435 | `pper_db` | Docker |
| 8010 | `prescriptores-api` | Docker |
| 8800 | `pper_api` | Docker |
| 20241 | métricas de `cloudflared` | systemd |
| 631, 1716, 53 | CUPS, KDE Connect, resolved | sistema |

Reservados por documentación aunque no escuchen en casa: 3004 (escalas-web, VPS), 3007 (Metabase, VPS), 3008 (aula-web, VPS), 3010 (origen de desarrollo de la PWA Escalas, en `AULA_CORS_ORIGINS`), 5434 (aula_db, VPS), 8300/8400/8500/8700/9000 (VPS). Los cuatro compose en cuarentena (telemetry, commerce, backoffice-api, listmonk) están parados; sus volúmenes siguen en Docker.

**Propuesta para Pas a pas:** web **3011** (`next dev -p 3011` y `next start -p 3011`), API **8900**, Postgres **127.0.0.1:5436**. Libres, no reservados y fuera de las secuencias de los otros proyectos.

### 3.3 Túnel `contable-casa`

- `cloudflared` 2026.5.0 en `/usr/local/bin`, unidad `/etc/systemd/system/cloudflared.service`, corre como root con `tunnel run --token …` → **túnel gestionado en remoto**: no existe `/etc/cloudflared/config.yml` ni `~/.cloudflared/`. Las rutas se cambian en Zero Trust → Networks → Tunnels → contable-casa → Public Hostname. 4 conexiones HA activas, 13.833 peticiones servidas desde el arranque (20-oct).
- Ingress vigente (configuración v42, 29-oct-2026, leída del journal):

| Hostname | Path | Servicio |
|---|---|---|
| `contable.nereidlabs.net` | — | `localhost:3000` (Reconcilio) |
| `armonia.nereidlabs.net` | `^/api/telemetry` · `api/commerce/.*` · resto | 8300 · 8400 · **3001** |
| `escalas.nereidlabs.net` | `api/(reto\|web)/.*` · `^/api/telemetry` · `api/commerce/.*` · resto | 8500 · 8300 · 8400 · **3004** |
| `equipo.lasensible.app` | — | 3006 |
| `taller.lasensible.app` | — | 3002 |
| `crm.lasensible.app` | — | 3005 |
| `pper.nereidlabs.net` | — | 3009 |
| *(resto)* | — | `http_status:404` |

Las reglas de `armonia.` y `escalas.` apuntan a servicios de staging que ya no corren en casa (3004 da «connection refused» en el log; 8300/8400/8500 están parados). No molestan, pero son restos.

- **Cloudflare Access** (según `docs/socios/ACCESO_cloudflare_access.md`; no se puede leer el panel desde la máquina): login **One-time PIN** por email, política reutilizable `socios-lasensible` (3 correos, sesión 1 semana), tres aplicaciones self-hosted (equipo, taller, crm). Access inyecta `Cf-Access-Authenticated-User-Email`; `apps/equipo/lib/identity.ts` la lee y la compara en minúsculas con `EQUIPO_ADMIN_EMAIL`. Regla aprendida: **crear la app de Access antes de publicar el hostname**.
- Dominios en uso: `lasensible.app` (empresa, excluido para Pas a pas) y `nereidlabs.net` (staging y PPER).
- Nota de seguridad: el token del túnel va en claro en la unidad, legible por cualquier usuario local (`-rw-r--r--`). No es urgente ni es de este proyecto; lo apunto.

### 3.4 Backups

| Qué | Dónde | Cómo | Estado |
|---|---|---|---|
| PPER | `~/var/pper-backups/pper-AAAAMMDD-HHMM.sql.gz` | cron de biel `20 4 * * *` → `deploy/backup-db.sh` (`docker exec pper_db pg_dump \| gzip`, rotación 30 días) · log `~/var/pper-backup.log` | 7 copias (30-oct → 5-nov), crece 20 K → 178 K. **Solo en este PC.** |
| Aula | `~/var/aula-backups` en el VPS | mismo script, cron del usuario `escalas` | VPS |
| La Sensible casa | `~/lasensible-backup/` | volcado puntual del CRM + `secretos_*.tar.gz` (23-jul) | manual |
| Reconcilio | `~/reconcilio-backups/` | tar de volumen (abril) | manual |
| VPS | backups de Hetzner (7 rotativos) + snapshot | contratado | — |

El patrón para Pas a pas sale solo: `deploy/backup-db.sh` → `~/var/pasapas-backups`, cron `25 4 * * *`, restauración documentada y **probada** en una BD vacía (criterio de salida de la fase 2). Sacar las copias del PC (rclone a un bucket o al VPS) es una tarea pendiente común con PPER; no la toco ahora.

---

## 4. Propuestas para las decisiones pendientes (§11 de la especificación)

### 4.0 Previas que no están en el §11 pero salen de la inspección

**Gestor de paquetes.** La especificación dice pnpm; la casa usa npm workspaces y pnpm no está instalado.
- A) **npm workspaces** (recomendado): coherente con las unidades systemd (`npm run start -w`), con `deploy.sh` y con la cabeza de Biel; cero dependencias nuevas de sistema.
- B) pnpm: instalación global vía `npm i -g pnpm` o corepack; mejor para monorepos grandes, pero rompe la uniformidad.

**ESLint / Prettier.** «Como en La Sensible» hoy significa «ninguno».
- A) **Añadir ESLint (config de Next) + Prettier con valores por defecto** (recomendado): coste de 10 minutos, útil para un repo nuevo con tres paquetes y mucho código generado por IA; no obliga a tocar los otros proyectos.
- B) Seguir la casa: solo `tsc --noEmit` + Vitest.

### 4.1 Dominio, subdominio y túnel

- A) **`pasapas.nereidlabs.net` en `contable-casa`** (recomendado): mismo patrón que `pper.nereidlabs.net` (un hostname → `localhost:3011`, sin reglas de path mientras el portal Next proxye `/api/*`; en la fase 2 se puede añadir la regla `^/api/.*` → 8900 como hace Aula). Un cambio en el panel, DNS automático, fuera de `lasensible.app`.
- B) Dominio propio (p. ej. un `.cat` o `.app` para la familia): más bonito, pero cuesta dinero, otro zone en Cloudflare y no aporta nada técnico ahora. Se puede mover después (borrar hostname en un sitio, crearlo en otro).

Nombre alternativo si prefieres catalán en la URL: `algebra.nereidlabs.net`.

### 4.2 Login

- A) **Cloudflare Access con One-time PIN** (recomendado para fases 1–4): política nueva `familia-pasapas` con los dos correos, sesión **1 mes** (el máximo razonable para que tu hija no teclee un PIN cada semana), aplicación self-hosted sobre `pasapas.nereidlabs.net`. La fase 1 no tiene backend y queda protegida sin escribir una línea de auth. En la fase 2 la API valida el JWT `Cf-Access-Jwt-Assertion` contra las claves del equipo (no basta con la cabecera: dentro de la máquina cualquiera puede ponerla) y mapea el email a `users`. Reutiliza el patrón ya documentado y el código de `identity.ts`. Los correos los procesa Cloudflare (ya ocurre con los socios).
- B) Patrón PPER (código por correo + cookie propia + lista de invitados): da independencia de Cloudflare y es el camino de convergencia con PPER, pero exige backend desde la fase 1, SMTP (que PPER aún no tiene en marcha) y más código que proteger para datos de una menor.

Riesgo de A que hay que probar en la fase 1: con la sesión de Access caducada, la PWA instalada sigue funcionando offline (assets en caché), pero el `fetch` de sincronización recibe una redirección HTML al login. El cliente debe detectarlo (respuesta no JSON / `302`) y mostrar «Torna a entrar», sin perder la cola. También probar el flujo de PIN en la PWA instalada en iOS/Android.

### 4.3 Dónde vive la agregación del panel

- A) **Todo en TS, en el cliente, desde los intentos crudos** (recomendado): una alumna genera unos pocos miles de intentos al año; `GET /v1/attempts?since=` paginado los baja en un segundo y la **misma función del motor** calcula dominio, tags superados, Leitner y las series semanales tanto en el móvil como en el panel. Cero lógica duplicada en Python; el backend solo guarda y sirve. `/v1/dashboard/summary` queda como optimización opcional si algún día hace falta.
- B) La POSICIÓN de la especificación: agregados simples en SQL + dominio en TS. Divide la lógica en dos sitios con dos lenguajes y dos juegos de tests para un volumen que no lo justifica.

### 4.4 Vista pregunta a pregunta en el panel

- A) **No añadirla ahora** (recomendado): el panel se centra en `error_tag` y bloques, que es lo que cambia la enseñanza. Reevaluar tras la semana de uso de la fase 1.
- B) Añadir en la fase 4 una lista «Per repassar» con el ítem **regenerado** (no el histórico cronológico), visible exactamente igual para la alumna y para ti (principio 7). Si se hace, nunca como listado cronológico tipo registro de vigilancia.

### 4.5 Motor compartido con PPER (decidir después del 21/11)

- A) **Mantener separados; compartir ideas, no código** (recomendado): la intersección real es pequeña (§2.4), el `index.html` de PPER tiene prohibida la reescritura, y PPER tiene su propia decisión pendiente de comercialización. Si tras el examen PPER se rehace, ese será el momento de evaluar adoptar `packages/engine` (se diseña agnóstico igualmente, como pide la especificación).
- B) Extraer `packages/engine` a un paquete publicado (repo propio o GitHub Packages) y que PPER lo consuma: obliga a reescribir la app de test de PPER y a sincronizar versiones entre tres repos.

### 4.6 Nombre

- A) **«Pas a pas · Àlgebra»** (recomendado): slug `pasapas`, scope npm `@pasapas/*`, repo `bielvidal/pasapas`, hostname `pasapas.nereidlabs.net`.
- B) «Àlgebra pas a pas»: mismo contenido, URL `algebra.nereidlabs.net`.

---

## 5. Riesgos vistos en la especificación y el catálogo

### 5.1 Técnicos

1. **Coma flotante en la verificación (§5.5).** Comparar con mathjs en 20 puntos aleatorios es frágil con exponentes (B3.T6: `x^(an−c)·y^(bn−d)` con valores grandes) y cerca de polos. Propuesta: evaluar en **racionales exactos** (fracciones con BigInt) en puntos enteros pequeños, con mathjs solo para expresar y como segunda opinión. Las plantillas del catálogo son todas polinómicas o racionales salvo las raíces (B3.T5, B3.T7, B7.T5, B7.T6), que se verifican con cuadrados perfectos o con tolerancia explícita.
2. **Conjuntos de soluciones** (B6, B7): hacen falta representaciones para ∅ (B6.T4, B7.T4 variante 1, B7.T3 «3(x−2)=3x»), para «qualsevol x» (ℝ) y para soluciones excluidas por denominadores. El verificador de `valid_step` con ecuaciones necesita resolver lineales y cuadráticas sencillas de forma exacta, no solo sustituir.
3. **`find_error` con propagación coherente del error** (§Convenciones del catálogo): cada plantilla necesita código que recalcule los pasos posteriores a partir del paso erróneo. Es la parte más cara de implementar y testear; en B5 solo hay una (B5.T9), bien para la fase 1.
4. **Access + PWA offline** (§4.2 de este informe).
5. **KaTeX offline**: fuentes y CSS deben ir en el bundle y en el precache del service worker (no CDN). Tamaño ~1 MB; aceptable.
6. **Sin CI**: la especificación habla de «en CI» pero ningún repo de la casa tiene GitHub Actions. Propuesta: un workflow mínimo en el repo nuevo (`npm ci && npm test && tsc`) con los 500 semillas; gratis en repos privados dentro de la cuota.
7. **Sin pnpm, sin ESLint/Prettier, sin `gh`**: ver §4.0. Para crear el repo en GitHub habrá que hacerlo desde la web o instalar `gh` (te lo preguntaré en la fase 1).

### 5.2 Del catálogo (a corregir en el documento al implementar, no bloquean la fase 1 salvo B5)

- **Tags repetidos entre distractores** de una misma plantilla: B1.T3 (tres `B1_ORDRE_OPERACIONS`), B2.T3 (dos `B2_INVERTEIX_PRIMERA`), B3.T4, B3.T7 (tres `B3_EXP_FRACCIONARI`). La §5.4 dice «tag distinto si es posible»; el test de cobertura debe permitirlo y el panel debe contar una sola elección por intento.
- **B5.T3**: el distractor `x² − s·k` para `B5_CANCELA_TERME` es poco creíble como error real (nadie tacha así). La nota del catálogo ya explica por qué no sirve `x − s·k` cuando `s = −`. Propuesta: en `s = +` usar `x − k` como distractor de `B5_CANCELA_TERME` (tachar «k² con k» y «x² con x» término a término da `x − k`, un error muy real), y en `s = −` usar `x + k²` o aceptar que ese tag no aparezca en esa variante. Decidir al implementar B5.
- **B5.T6** y **B5.T2**: las razones/distractores usan `B5_NO_TATXA_FACTOR` dos veces y `B5_CANCELA_TERMES_SEMBLANTS` dos veces; mismo caso que arriba.
- **B2.T4**: errata «b/(ac) (o b/(ac) per a la segona)»: la segunda variante debería ser `b/(ac)` → ¿`bc/a`? Hay que decidir el distractor.
- **B3.T5**: la entrada `√(x² + k²) ⟹ [invàlid] x + k · [vàlid] √(k²x²) = k·x` mezcla dos enunciados distintos en una misma entrada del pool; separar en dos.
- **B6.T3**: la restricción «s múltiple de a» garantiza `d` entero; además hay que exigir `b − a` tal que `d ≠ 0, −s` (ya está) y que `x = s` no anule `x + d` (equivale a `d ≠ −s`, ya está). Correcto pero conviene test explícito.
- **B7.T6**: `r₂ = 2b + 1 − r₁` puede ser negativo (b = 1, r₁ = 7 → r₂ = −4); la construcción sigue siendo válida (r₂ − b < 0), pero `x + a` debe ser ≥ 0 en r₁ para que la raíz exista: `r₁ + a = r₁ + b² − r₁r₂ > 0` siempre que r₂ ≤ 0 o pequeño; añadir la comprobación al test.
- **B4.T2 nivel 2** usa `B3_COEF_NO_ELEVAT` (tag de otro bloque): permitido por la convención de «tags compartidos», pero el resumen de cobertura del final cuenta tags por bloque de prefijo; el test de cobertura debe seguir la convención, no la tabla.
- **Resumen de cobertura**: B5 tiene 7 `mc_result` (T1–T5, T7, T8), 1 `valid_step`, 1 `find_error` = 9 ✓. B3 lista 8 plantillas con 6 `mc_result` ✓.

### 5.3 De producto

- **Correo de la alumna**: con Access (o con el patrón PPER) tu hija necesita una cuenta de correo a la que llegue el PIN. Confirmar cuál (y que no sea la tuya, para que el rol `student` quede separado).
- **Principio 1 (sin cronómetro)** choca con la costumbre de PPER (`secs`, temporizador). El motor de Pas a pas no debe heredar ese campo.

---

## 6. Qué propongo para empezar la fase 1 (cuando valides)

1. Repo `bielvidal/pasapas` (privado) con `~/proyectos/Mates` como raíz (o renombrar la carpeta a `pasapas`; dime cuál), npm workspaces, Node 20.20.2, TypeScript 5.9 `strict`, Vitest 4, Next 16.3, Tailwind 3.4, Dexie 4, Workbox 7, KaTeX, mathjs + racionales exactos propios.
2. `apps/web` en **:3011**, `packages/engine`, `packages/content-algebra` (con `texts/ca/B5.ts`), `docs/`, `CLAUDE.md`.
3. Bloque **B5** completo (9 plantillas) con tests de propiedad ≥ 500 semillas.
4. Despliegue: unidad `pasapas-web` calcada de `pper-web`; **te pediré permiso** antes de instalar la unidad (sudo) y, en el panel de Cloudflare, de crear la app de Access `pasapas.nereidlabs.net` y después el hostname en `contable-casa` (en ese orden).

Nada de esto toca PPER, La Sensible ni el túnel hasta que lo apruebes.
