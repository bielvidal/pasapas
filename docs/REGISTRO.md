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

**Pendiente para la siguiente sesión:**

1. Biel prueba la app en el móvil (`npm run dev` o `npm start` en :3011; o tras el despliegue).
2. Revisión de los textos en catalán: `packages/content-algebra/texts/ca/{tags,blocs,B5}.ts` y
   `apps/web/lib/texts.ts`.
3. Despliegue (requiere permiso): `sudo cp deploy/pasapas-web.service /etc/systemd/system/`,
   `enable --now`; alta de `pasapas.nereidlabs.net → localhost:3011` en el panel de Cloudflare.
4. Repo GitHub: Biel crea `bielvidal/pasapas` (privado) y pasa la URL SSH para el primer push.
5. Después de una semana de uso: feedback de la alumna, y arrancar la fase 2 (API + sync + login).
6. Playwright (smoke e2e offline/online de §10) queda para la fase 2: necesita instalar navegadores.
