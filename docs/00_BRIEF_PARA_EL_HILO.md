# Brief para el hilo de VS Code — Pas a pas · Àlgebra

> Pega este documento como primer mensaje del hilo y deja `01_ESPECIFICACION.md` y `02_CATALOGO_CONTENIDO.md` en `docs/` del repo nuevo.

---

## Tu papel

Vas a construir **Pas a pas · Àlgebra**, una app web para que mi hija (2º de Bachillerato) practique álgebra básica con preguntas tipo test y explicaciones del error, con un panel para que yo vea su evolución.

Los documentos de diseño están en `docs/`:

- `docs/01_ESPECIFICACION.md`: arquitectura, modelo de datos, API, motor, fases, calidad y decisiones.
- `docs/02_CATALOGO_CONTENIDO.md`: los 7 bloques con sus plantillas, errores típicos (`error_tag`) y textos en catalán.

Léelos enteros antes de proponer nada. Si algo de este brief contradice la especificación, manda la especificación y me lo señalas.

## Forma de trabajar

- **El repositorio es el árbitro.** Las decisiones se documentan en `docs/DECISIONES.md` con las etiquetas **POSICIÓN**, **ACUERDO** y **DECISIÓN PENDIENTE**.
- **Verifica antes de afirmar.** No des por hecho versiones, puertos ni configuraciones: compruébalos en la máquina.
- **Los contratos entre servicios se garantizan con tests** (OpenAPI → tipos TS generados → tests de contrato).
- **Trabaja por fases** (§9 de la especificación). Al terminar cada fase: tests verdes, `docs/` actualizado y un resumen con lo hecho, lo pendiente y los archivos tocados. **Para y espera mi validación** antes de la siguiente fase.
- **Pregunta antes de** instalar dependencias de sistema, tocar la configuración del túnel de Cloudflare o de Cloudflare Access, abrir puertos o tocar cualquier cosa fuera del repo nuevo.

## Restricciones duras

1. **No toques el proyecto PPER** (ni código, ni dependencias, ni despliegue) **antes del 21/11/2026**: tengo el examen ese día y la plataforma tiene que seguir funcionando tal cual. Puedes **leerlo** para la fase 0.
2. **No mezcles con La Sensible.** Es una empresa con socios. Repo propio, base de datos propia, subdominio propio, sin importar código de su monorepo. Puedes leerlo como referencia y copiar patrones.
3. **Principios pedagógicos de la §2 de la especificación**: no negociables. Sin cronómetro, sin puntuaciones negativas, botón «Encara no ho sé», misma vista para la alumna y para el tutor. Si una decisión técnica choca con ellos, pregunta.
4. **Datos mínimos de una menor:** alias, sin datos personales en la base de datos más allá del email de autenticación, sin analítica de terceros.
5. **Ninguna respuesta «correcta» puede ser incorrecta.** Cada plantilla lleva tests de propiedad con ≥ 500 semillas (§5.5). Si un test falla, no lo «arregles» relajándolo: revisa la plantilla y avísame si el catálogo está mal.
6. **Textos de la alumna en catalán**, separados del código (un archivo de textos por bloque), para que yo los pueda revisar sin leer TypeScript.

## Fase 0 — lo primero que te pido

Antes de escribir código, inspecciona y entrégame un informe breve (`docs/INFORME_FASE_0.md`):

1. **La Sensible:** versiones de Next.js, TypeScript, pnpm, Node, FastAPI, Python, PostgreSQL; cómo están organizados los workspaces; configuración de ESLint/Prettier; cómo se despliegan los frontends (unidades systemd) y los backends (Docker Compose).
2. **PPER:** stack, cómo hace el login con Google, cómo guarda las estadísticas por usuario, dónde corre, qué puertos usa. Qué partes se parecen al motor de Pas a pas (para la decisión del motor compartido, después del 21/11).
3. **Infraestructura:** puertos ocupados en la máquina; configuración del túnel de Cloudflare (`contable-casa`) y de Access (solo lectura); dónde se hacen los backups.
4. **Propuesta** para cada **DECISIÓN PENDIENTE** de la §11 de la especificación, con 2 opciones y tu recomendación.
5. **Riesgos** que veas en la especificación o en el catálogo.

Para y espera mi validación.

## Fase 1 — prototipo (cuando valide la fase 0)

- Scaffold del repo: `apps/web`, `packages/engine`, `packages/content-algebra`, `docs/`, `CLAUDE.md`.
- Motor completo (§5): RNG con semilla, tipos de pregunta, verificación, dominio, repaso.
- **Solo el bloque B5** (simplificar fracciones algebraicas), con todas sus plantillas y tests de propiedad.
- PWA local-first **sin backend**: IndexedDB, offline, KaTeX, mobile-first, catalán.
- Desplegada detrás de Cloudflare Access (con mi aprobación del cambio en el túnel).
- Criterio de salida: tests verdes, yo pruebo la app en el móvil y después la usa mi hija una semana.

## `CLAUDE.md` inicial del repo

Crea `CLAUDE.md` con, como mínimo:

- Qué es el proyecto (2 líneas) y enlace a `docs/`.
- Las 6 restricciones duras de arriba.
- Comandos: instalar, dev, test, build, despliegue.
- Convenciones: TypeScript estricto, textos en catalán en `packages/content-algebra/texts/`, LaTeX para todas las expresiones, formato de expresiones con `fmt` del motor.
- Cómo añadir una plantilla: id estable, `version`, entrada en el catálogo, tests de propiedad, tags existentes.

## Al cerrar cada sesión

Lista de archivos actualizados y su destino (repo, `docs/`, lo que tenga que revisar yo), y qué queda pendiente para la siguiente sesión.
