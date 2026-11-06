# Pas a pas · Àlgebra — Especificación técnica

> Versión 0.1 · 2026-11-05 · Redactada en el chat; el repositorio es el árbitro.
> Etiquetas: **POSICIÓN** (criterio de partida, revisable), **ACUERDO** (decidido con Biel), **DECISIÓN PENDIENTE** (resolver antes de construir esa parte).

---

## 1. Qué es y para quién

App web de práctica de **álgebra básica** para una alumna de 2º de Bachillerato (Matemáticas II), con un **panel de seguimiento** para el tutor (su padre).

El problema que resuelve: la alumna tiene intuición pero falla en manipulación algebraica básica (fracciones a ambos lados de una igualdad, paréntesis elevados a potencias, qué se puede cancelar y qué no) y se bloquea ante tareas largas. Cada paso algebraico le cuesta esfuerzo, y eso agota la memoria de trabajo que necesita para razonar.

**Idea central (ACUERDO):** las opciones incorrectas de cada pregunta son **errores típicos catalogados**, cada uno con un `error_tag`. Si elige una incorrecta, la explicación nombra **su** error y por qué no es válido. El panel agrega por `error_tag` para ver qué concepciones erróneas persisten.

**Usuarios:**
- `student`: la alumna (alias, sin datos personales).
- `tutor`: Biel. Ve el panel y edita/valida contenido.

---

## 2. Principios pedagógicos (no negociables)

Estos principios tienen prioridad sobre cualquier decisión de UX o técnica. Si algo entra en conflicto con ellos, se pregunta antes.

1. **Sin cronómetro** visible ni medido como métrica de rendimiento. (Se registra `created_at` para ordenar, nunca se muestra el tiempo por pregunta.)
2. **Sin puntuaciones negativas, vidas, rachas que se pierden ni sonidos de error.** Un fallo nunca «cuesta» nada.
3. **Botón «Encara no ho sé»** en todas las preguntas: muestra la explicación sin contar como error (se registra como `skipped`).
4. **La explicación siempre está disponible**, también tras acertar («Per què és correcte?»).
5. **Lenguaje amable y concreto.** Nunca «incorrecte» a secas: «Aquí has fet X. Això no es pot fer perquè…».
6. **Progreso visible en positivo:** lo que ya domina, no lo que le falta.
7. **Transparencia:** la alumna ve exactamente lo mismo que el tutor en el panel («El meu progrés»). No hay vista oculta.
8. **Datos mínimos:** alias, sin email visible en la app, sin analítica de terceros.

---

## 3. Contexto de infraestructura y relación con otros proyectos

Biel tiene en su máquina, al menos:

- **La Sensible** (empresa con socios, 40/30/30): monorepo pnpm/workspaces; PWA Next.js + TypeScript local-first; backoffice FastAPI + PostgreSQL + Next.js; frontends en systemd (puertos 3001, 3002, 3004, 3005); backends en Docker; Cloudflare Tunnel (`contable-casa`) con Zero Trust.
- **Plataforma PPER**: app de estudio para el examen PPER, en evolución a plataforma multiusuario (login con Google, estadísticas por usuario, autoalojada en su PC). **Examen el 21/11/2026.**

**POSICIÓN — separación:** Pas a pas es un proyecto familiar. Repositorio propio, base de datos propia, subdominio propio, sin dependencias de código de La Sensible. Puede compartir máquina, Docker y túnel.

**POSICIÓN — no tocar PPER antes del 21/11/2026.** Ni refactors, ni dependencias compartidas, ni cambios en su despliegue. Pas a pas se construye al lado.

**POSICIÓN — motor reutilizable:** PPER y Pas a pas son el mismo tipo de producto (preguntas tipo test + explicación + estadísticas por usuario). El motor de Pas a pas (`packages/engine`) se diseña **agnóstico del dominio** (no sabe nada de álgebra: solo plantillas, opciones, `error_tag`, intentos, dominio) para poder extraerlo después.
**DECISIÓN PENDIENTE (después del 21/11):** extraer el motor a un paquete compartido entre PPER y Pas a pas, o mantenerlos separados.

**Primera tarea del hilo:** inspeccionar los repos de La Sensible y PPER y reportar stack real, versiones, puertos ocupados, cómo está montado el túnel, cómo hace PPER el login y las estadísticas. Alinear con lo que ya existe en lugar de asumir.

---

## 4. Arquitectura

```
pasapas/                      (repo nuevo, pnpm workspaces)
├── apps/
│   ├── web/                  Next.js + TS, PWA local-first (alumna + panel tutor)
│   └── api/                  FastAPI + PostgreSQL (Docker)
├── packages/
│   ├── engine/               Motor agnóstico: tipos, RNG con semilla, selección, dominio, repaso
│   └── content-algebra/      Plantillas de los 7 bloques + textos (catalán) + error_tags
├── docs/                     Esta especificación, catálogo, decisiones
└── CLAUDE.md
```

**POSICIÓN — stack:** el mismo que La Sensible (Next.js + TS en frontend, FastAPI + PostgreSQL en backend), por coherencia y para que Biel mantenga un solo modelo mental. Ajustar versiones a las que ya usa.

**Renderizado matemático:** KaTeX (todas las expresiones se escriben en LaTeX).
**Verificación matemática en el motor y en los tests:** mathjs (evaluación numérica en TS).

### 4.1 Local-first y sincronización

- La app funciona **sin conexión**. Las preguntas se generan en el cliente (el contenido va en el bundle).
- Cada intento se guarda primero en IndexedDB con un `id` UUID generado en el cliente.
- Una cola de sincronización envía los intentos al backend cuando hay conexión: `POST /v1/attempts:batch`, **idempotente** por `id`.
- El estado de dominio y la cola de repaso se calculan en el cliente a partir de los intentos locales; el backend los recalcula de forma independiente para el panel. Ambos usan la misma función del motor (en TS); el backend guarda los intentos en bruto y el panel llama a un endpoint que agrega.

**DECISIÓN PENDIENTE:** si el panel agrega en Python (duplicando la lógica de dominio) o en TS (el frontend del panel recibe intentos crudos y calcula). **POSICIÓN:** agregación en SQL para lo simple (aciertos por bloque y `error_tag` por semana) y lógica de dominio solo en TS, para no duplicarla.

### 4.2 Autenticación

**POSICIÓN:** Cloudflare Access (Zero Trust) delante de la app, con una política que admita solo los dos emails. El backend lee `Cf-Access-Authenticated-User-Email` (y valida el JWT `Cf-Access-Jwt-Assertion` contra las claves del equipo) y lo mapea a un usuario con rol en la tabla `users`.
**DECISIÓN PENDIENTE:** si PPER ya tiene un login con Google reutilizable, valorar usar el mismo patrón para facilitar la futura convergencia. No bloquear la fase 1 por esto: la fase 1 no tiene backend.

### 4.3 Despliegue

- `apps/web` en systemd, igual que los frontends de La Sensible, en un puerto libre (comprobar; **no** usar 3001/3002/3004/3005 ni los de PPER).
- `apps/api` + PostgreSQL en Docker Compose, con volumen persistente y backup diario (`pg_dump`) a la carpeta de backups que use Biel.
- Ruta en el túnel existente o túnel propio. **DECISIÓN PENDIENTE:** dominio/subdominio. No colgarlo de `lasensible.app`.

---

## 5. Motor (`packages/engine`)

### 5.1 Conceptos

- **Bloque** (`block`): tema (B1…B7). Tiene `regla_or` (texto) y ejemplos.
- **Plantilla** (`template`): generador determinista de ítems. Tiene `id` estable (p. ej. `B5.T1`), `block`, `type`, `version`.
- **Ítem** (`item`): una pregunta concreta generada por `template.generate(seed)`. Reproducible a partir de `(template_id, template_version, seed)`.
- **Opción** (`option`): texto LaTeX + forma máquina (expresión mathjs o valor) + `correct: boolean` + `error_tag | null`.
- **Error tag** (`error_tag`): concepción errónea catalogada, con explicación genérica en catalán. Una plantilla puede sobrescribir la explicación para un caso concreto.
- **Intento** (`attempt`): respuesta de la alumna a un ítem.

### 5.2 Tipos de pregunta

| `type` | Qué ve | Qué se registra |
|---|---|---|
| `mc_result` | Una expresión/ecuación y 4 opciones de resultado | opción elegida, `error_tag` |
| `valid_step` | Un paso «A ⟹ B» y la pregunta «És vàlid?». Si responde, segunda pantalla: «Per què?» con 3 razones | `valid_answer`, razón elegida, `error_tag` |
| `find_error` | Una resolución en 3-5 pasos; tocar el paso incorrecto (o «Tots són correctes») | índice elegido, `error_tag` del paso erróneo |
| `next_step` | Un estado intermedio de una resolución y 3-4 posibles pasos siguientes | opción elegida, `error_tag` |

### 5.3 Interfaz de plantilla (orientativa)

```ts
interface Template {
  id: string;              // "B5.T1"
  version: number;         // subir si cambia la generación
  block: BlockId;          // "B5"
  type: "mc_result" | "valid_step" | "find_error" | "next_step";
  level: 1 | 2 | 3;        // dificultad
  generate(rng: Rng): Item;
}

interface Item {
  templateId: string;
  templateVersion: number;
  seed: number;
  promptLatex: string;           // enunciado
  instruction: string;           // "Simplifica", "És vàlid aquest pas?"…
  options: Option[];             // barajadas con el mismo rng
  explanationCorrect: string;    // por qué la correcta es correcta (catalán, admite LaTeX inline)
  check: CheckSpec;              // datos para la verificación automática (ver 5.5)
}

interface Option {
  id: string;
  latex: string;
  machine?: string;              // expresión mathjs, para verificar equivalencias
  correct: boolean;
  errorTag: string | null;       // null solo si correct
  explanationOverride?: string;  // si la genérica del tag no encaja
}
```

### 5.4 Reglas de generación

- RNG con semilla (p. ej. mulberry32). Nada de `Math.random()` en el motor.
- Parámetros enteros pequeños (rangos en el catálogo). Evitar casos degenerados: coeficientes 0 o 1 cuando hacen trivial la pregunta, parámetros iguales cuando colapsan opciones, denominadores que se anulan.
- **Si un distractor coincide con la correcta (o con otro distractor) para esos parámetros, se regenera** con la siguiente semilla derivada. Máximo 20 intentos; si no, error de test.
- Barajar opciones con el mismo `rng`.
- Siempre 4 opciones en `mc_result` y `next_step` (1 correcta + 3 distractores con tag distinto si es posible).

### 5.5 Verificación automática (crítico)

Un error en una «respuesta correcta» destruiría la confianza de la alumna. Por eso **cada plantilla tiene tests de propiedad** que se ejecutan con cientos de semillas:

- **Identidades/expresiones:** la opción correcta es equivalente al enunciado evaluando en ≥ 20 puntos aleatorios (evitando polos); cada distractor difiere del enunciado en al menos un punto.
- **Ecuaciones:** se comparan **conjuntos de soluciones**: sustituir las soluciones declaradas en la ecuación original (y comprobar que los valores que anulan denominadores se excluyen).
- **`valid_step`:** el flag `valid` coincide con la equivalencia real entre antes y después (expresiones) o con la igualdad de conjuntos de soluciones (ecuaciones).
- **`find_error`:** todos los pasos marcados como correctos son equivalentes al anterior; el marcado como erróneo no lo es.
- **Unicidad:** las opciones son distintas entre sí tanto en LaTeX como numéricamente.
- **Cobertura:** cada `error_tag` del catálogo aparece en al menos una plantilla; cada `error_tag` usado existe en el catálogo y tiene explicación.

### 5.6 Dominio y repaso

- **Dominio por bloque**, calculado sobre los **últimos 12 intentos no saltados** del bloque:
  - `en_marxa`: < 60 % de aciertos o < 6 intentos.
  - `ho_vaig_agafant`: 60-84 %.
  - `dominat`: ≥ 85 % con ≥ 10 intentos, incluyendo al menos 2 tipos de pregunta distintos.
- **Dominio por `error_tag`:** un tag está «superat» cuando sus 4 últimas apariciones como distractor presentado no se han elegido. Esto alimenta la parte más útil del panel.
- **Repaso («Repassa els meus errors»):** caja de Leitner por `(template_id, error_tag)`. Un fallo pone el par en la caja 1; aciertos sucesivos lo mueven a las cajas 2-3-4 con intervalos de 1, 3, 7 y 14 días. Al repasar se genera **un ítem nuevo** de la misma plantilla (otra semilla), no el mismo ítem, para que no memorice.
- **Selección en «Practica»:** ronda de 10 ítems del bloque elegido: 70 % del nivel actual, 20 % del siguiente, 10 % de repaso. Subir de nivel dentro del bloque al encadenar el criterio de dominio en ese nivel.

---

## 6. Modelo de datos (PostgreSQL)

```sql
users (
  id uuid pk,
  alias text not null,
  role text not null check (role in ('student','tutor')),
  auth_email text unique not null,      -- solo para mapear la identidad de Cloudflare Access
  created_at timestamptz default now()
)

sessions (
  id uuid pk,                           -- generado en cliente
  user_id uuid fk,
  mode text check (mode in ('apren','practica','repas')),
  block text,
  started_at timestamptz,
  ended_at timestamptz
)

attempts (
  id uuid pk,                           -- generado en cliente (idempotencia)
  user_id uuid fk,
  session_id uuid fk,
  block text not null,
  template_id text not null,
  template_version int not null,
  seed bigint not null,
  question_type text not null,
  level smallint not null,
  outcome text not null check (outcome in ('correct','incorrect','skipped')),
  chosen_option_id text,
  error_tag text,                       -- null si correct o skipped
  presented_error_tags text[] not null, -- distractores mostrados (para el dominio por tag)
  explanation_opened boolean not null default false,
  client_created_at timestamptz not null,
  received_at timestamptz default now(),
  app_version text not null,
  content_version text not null
)
create index on attempts (user_id, block, client_created_at);
create index on attempts (user_id, error_tag);

content_overrides (                     -- fase 4: edición de textos sin desplegar
  key text pk,                          -- p. ej. "tag:B5_CANCELA_TERME" o "template:B5.T1:explanationCorrect"
  text_ca text not null,
  state text check (state in ('BORRADOR','APROBADO')),
  updated_at timestamptz default now()
)
```

No se guarda el enunciado generado: es reproducible desde `(template_id, template_version, seed)`.

---

## 7. API (FastAPI, `/v1`)

Contrato en OpenAPI, tipos TS generados con `openapi-typescript`. **Tests de contrato** en CI: el cliente compila contra el esquema generado y hay tests de API que validan las respuestas contra el esquema.

| Método | Ruta | Rol | Descripción |
|---|---|---|---|
| GET | `/v1/me` | ambos | usuario actual (alias, rol) |
| POST | `/v1/sessions` | student | crea/actualiza sesión (idempotente por id) |
| POST | `/v1/attempts:batch` | student | lote de intentos; idempotente; devuelve ids aceptados |
| GET | `/v1/attempts?since=` | ambos | intentos propios (student) o de la alumna (tutor), para recalcular en cliente |
| GET | `/v1/dashboard/summary?weeks=8` | ambos | agregados: intentos y aciertos por bloque y semana; elecciones por `error_tag` y semana; días activos |
| GET/PUT | `/v1/content/overrides` | tutor (PUT) | fase 4 |
| GET | `/healthz` | — | salud |

El rol `student` solo ve sus propios datos. El `tutor` ve los de la alumna. No hay más usuarios.

---

## 8. Pantallas (catalán)

**Alumna**
1. **Inici:** los 7 bloques como tarjetas con su estado (`en marxa`, `ho vaig agafant`, `dominat`) y botón grande «Repassa els meus errors» si hay pendientes.
2. **Bloc → Aprèn:** la regla d'or, 2 ejemplos resueltos paso a paso, y «Comença a practicar».
3. **Pregunta:** enunciado, opciones grandes (pensadas para el pulgar), botón «Encara no ho sé». Al responder: verde/neutro (nunca rojo agresivo), explicación desplegada, botón «Següent». Contador «3 de 10», sin tiempo.
4. **Final de ronda:** qué ha ido bien primero («Ja no et passa: …»), luego «Per repassar: …» con los tags elegidos, en lenguaje llano.
5. **El meu progrés:** la misma vista que el panel del tutor.

**Tutor (panel)**
- Estado por bloque y evolución semanal.
- **Errores típicos:** lista de `error_tag` con su nombre llano, veces elegido por semana (sparkline) y estado (`actiu` / `superat`). Esto es lo más importante del panel.
- Días con actividad en las últimas semanas (sin minutos ni horas).
- Sin listado pregunta a pregunta por defecto. (**DECISIÓN PENDIENTE:** si se añade una vista de detalle, que la alumna también la vea.)

**Diseño:** mobile-first, tipografía grande, mucho aire, un color de acento tranquilo. Accesible (contraste AA, objetivos táctiles ≥ 44 px). Modo oscuro.

---

## 9. Fases

| Fase | Alcance | Criterio de salida |
|---|---|---|
| **0. Inspección** | Leer repos La Sensible y PPER; informe de stack, puertos, túnel, login de PPER. Proponer decisiones pendientes con opciones. | Biel valida el informe |
| **1. Prototipo** | `packages/engine` + bloque **B5** completo (todas sus plantillas y tipos) + PWA sin backend (IndexedDB). Desplegado detrás de Cloudflare Access. | Tests de propiedad verdes; la alumna lo usa una semana; Biel recoge feedback |
| **2. Backend y sincronización** | `apps/api`, PostgreSQL, sync idempotente, usuarios y roles. | Intentos del móvil visibles desde otro dispositivo; backup verificado (restaurar en una BD de prueba) |
| **3. Bloques B3 y B7, después B1, B2, B4, B6** | Contenido completo con tests | Cobertura de todos los `error_tag` |
| **4. Panel y edición de textos** | Panel tutor + «El meu progrés» + `content_overrides` con estados BORRADOR/APROBADO | Biel ve los patrones de error de las últimas semanas |

**POSICIÓN:** el orden de los bloques tras el prototipo se ajusta según el feedback de la alumna.

*(La antigua fase 5, «evaluar un motor compartido con PPER», se eliminó el 2026-11-06: no se comparte nada con PPER y las apps vivirán seguramente en máquinas distintas; ver D5 en DECISIONES.)*

---

## 10. Calidad

- TypeScript estricto. ESLint/Prettier como en La Sensible.
- `packages/engine` y `packages/content-algebra`: tests unitarios + de propiedad (Vitest) con ≥ 500 semillas por plantilla en CI.
- `apps/api`: pytest, tests de contrato contra el OpenAPI.
- `apps/web`: un smoke e2e con Playwright (hacer una ronda de 10 preguntas offline, reconectar, comprobar sincronización).
- Revisión humana de los textos en catalán por Biel antes de cada fase (los textos están en `content-algebra/texts.ca.ts` o similar, separados del código).

---

## 11. Decisiones pendientes (resumen)

1. Dominio/subdominio y túnel (§4.3).
2. Login: Cloudflare Access vs. patrón de PPER (§4.2).
3. Dónde vive la lógica de agregación del panel (§4.1).
4. Vista de detalle pregunta a pregunta en el panel (§8).
5. Motor compartido con PPER, después del 21/11 (§3).
6. Nombre definitivo de la app (provisional: «Pas a pas · Àlgebra»).
