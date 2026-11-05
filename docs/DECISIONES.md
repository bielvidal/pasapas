# Decisiones — Pas a pas · Àlgebra

> El repositorio es el árbitro. Etiquetas: **POSICIÓN** (criterio de partida, revisable), **ACUERDO** (decidido con Biel, con fecha), **DECISIÓN PENDIENTE** (resolver antes de construir esa parte). Las propuestas con opciones están en `INFORME_FASE_0.md` §4.

## Acuerdos

| # | Tema | Acuerdo | Fecha |
|---|---|---|---|
| D5 | Motor compartido con PPER | **ACUERDO: no se comparte código con PPER.** Se copian sus patrones (estructura `apps/web` + `services/api`, Dockerfile multi-etapa, `deploy.sh`, `backup-db.sh`, unidad systemd, log idempotente de respuestas), pero cada proyecto tiene su código. La fase 5 de la especificación queda cerrada. `packages/engine` se diseña agnóstico igualmente, por limpieza, no por reutilización. | 2026-11-05 |
| D9 | Raíz del repo | **ACUERDO: la carpeta es `~/proyectos/pasapas`** (renombrada desde `Mates` por Biel el 2026-11-05, hecho). Repo GitHub `bielvidal/pasapas`, privado, pendiente de crear en la fase 1. | 2026-11-05 |
| D2 | Login | **ACUERDO: patrón PPER, no Cloudflare Access.** Código de 6 cifras por correo, cookie de sesión httpOnly larga y renovable, lista de invitados que Biel gestiona desde el panel de administración (y CLI de rescate para generar enlace/código sin SMTP). Roles `tutor` (admin) y `student`. | 2026-11-05 |
| D2b | Fase 1 sin login | **ACUERDO: la fase 1 se publica sin autenticación.** La PWA no guarda nada en el servidor; todo queda en IndexedDB del móvil. En la fase 2, al entrar por primera vez con su código, los intentos locales se asocian al usuario y se sincronizan. | 2026-11-05 |
| D0a | Gestor de paquetes | **ACUERDO: npm workspaces** (como La Sensible y PPER). | 2026-11-05 |
| D0b | ESLint / Prettier | **ACUERDO: se añaden** (ESLint con `eslint-config-next`, Prettier con valores por defecto). | 2026-11-05 |
| D1 | Dominio y túnel | **ACUERDO: `pasapas.nereidlabs.net` → `localhost:3011`** en `contable-casa`, alta en el panel de Cloudflare con permiso explícito de Biel en el momento de desplegar. **Hecho por Biel el 2026-11-05** (hostname + unidad systemd). | 2026-11-05 |
| D7 | Puertos | **ACUERDO: web 3011 · API 8900 · Postgres 127.0.0.1:5436.** | 2026-11-05 |
| D8 | Verificación numérica | **ACUERDO (por validación del informe): racionales exactos (BigInt) y funciones racionales como polinomios; sin mathjs** en la fase 1. La especificación §4 y §5.5 quedan enmendadas en este punto. | 2026-11-05 |
| D12 | Repo GitHub | **ACUERDO: Biel crea `bielvidal/pasapas` (privado) desde la web** y pasa la URL SSH; no se instala `gh`. | 2026-11-05 |
| D13 | Sitio de `fmt` y del kit matemático | **POSICIÓN:** el motor (`packages/engine`) no sabe de álgebra, así que `fmt`, los racionales y las funciones racionales viven en `packages/content-algebra/src/math/`. El catálogo dice «`fmt` del motor»; se interpreta como «del paquete de contenido». | 2026-11-05 |
| D14 | Informe de fase 0 | **ACUERDO: validado por Biel** el 2026-11-05. Arranca la fase 1. | 2026-11-05 |

### Consecuencia de D2 para la fase 1 (resuelta: D2b, opción A)

La especificación decía «la fase 1 no tiene backend» porque contaba con Access delante. Con el patrón PPER el login vive en la API, que llega en la fase 2. Opciones:

- **A) Fase 1 sin login (POSICIÓN).** La PWA se publica en `pasapas.nereidlabs.net` sin autenticación: no guarda nada en el servidor, todos los datos quedan en el móvil de la alumna (IndexedDB). Quien encuentre la URL solo puede practicar álgebra. En la fase 2, al entrar por primera vez con su código, los intentos locales se asocian a su usuario y se sincronizan. Ventaja: la fase 1 sigue siendo pequeña y la alumna empieza antes.
- **B) Adelantar una API mínima a la fase 1** (solo auth + invitados, sin sync). Más código antes de validar el producto, y la pantalla de entrar aparece antes de que haya nada que proteger.

Si Biel prefiere B, la fase 1 crece en unos días.

## Abiertas

| # | Tema | Estado | Propuesta (informe §4) |
|---|---|---|---|
| D3 | Agregación del panel | **DECISIÓN PENDIENTE** | todo en TS en el cliente desde intentos crudos; `summary` SQL opcional |
| D4 | Vista pregunta a pregunta | **DECISIÓN PENDIENTE** | no ahora; reevaluar tras la semana de uso |
| D6 | Nombre | **DECISIÓN PENDIENTE** | «Pas a pas · Àlgebra», slug `pasapas`, scope `@pasapas/*` |
| D10 | Correo de la alumna | **DECISIÓN PENDIENTE** (fase 2) | cuenta propia, distinta de la de Biel, para que el rol `student` quede separado |
| D11 | Correo saliente de la API | **DECISIÓN PENDIENTE** (fase 2) | `console` + CLI de rescate como PPER, o SMTP de SES con un remitente de `nereidlabs.net` |
