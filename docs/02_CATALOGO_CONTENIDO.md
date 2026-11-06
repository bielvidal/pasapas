# Pas a pas · Àlgebra — Catálogo de contenido (7 bloques)

> Versión 0.1 · 2026-11-05. Estructura y notas en castellano; **todo lo que ve la alumna, en catalán**.
> Los textos son un primer borrador: Biel los revisa antes de cada fase (§10 de la especificación).
> Este documento es la **fuente** para `packages/content-algebra`. Si al implementar una plantilla un test de propiedad falla, se corrige aquí y en el código a la vez.

## Convenciones

- **Notación:** aquí se escribe en Unicode para que se lea bien; en el código, todo en LaTeX (KaTeX).
- **Formato de expresiones** (función `fmt` del motor): `1x → x`, `−1x → −x`, `+ −3 → − 3`, `x¹ → x`, `x⁰ → 1`, fracciones siempre **irreducibles**, signo delante de la fracción (`−2/3`, nunca `2/−3`).
- **Parámetros:** enteros en los rangos indicados. «≠» y «distintos» son restricciones duras. Si un distractor coincide con la correcta u otro distractor (en LaTeX o numéricamente), se regenera (§5.4 de la especificación).
- **`find_error`:** se genera la resolución correcta y se **inyecta un único error** en un paso elegido al azar entre los indicados; los pasos posteriores se recalculan **de forma coherente a partir del paso erróneo** (como lo haría alguien que se ha equivocado una vez). En un 20 % de los ítems no se inyecta ningún error y la respuesta correcta es «Tots els passos són correctes».
- **`valid_step`:** cada entrada del *pool* tiene una versión válida y una o varias inválidas; se elige al 50 %. Para ecuaciones, «válido» = **mismo conjunto de soluciones**.
- **Razones de `valid_step`:** 3 opciones. Una correcta, las otras con su `error_tag`.
- **Explicación al fallar:** la del `error_tag` elegido (genérica) seguida de la `explicació correcta` de la plantilla, instanciada con los números del ítem.
- **Tags compartidos entre bloques:** un `error_tag` pertenece al bloque de su prefijo aunque aparezca en plantillas de otro bloque (p. ej. `B3_QUADRAT_SUMA` en B7). En el panel se agrega por tag, no por bloque de la plantilla.
- **Niveles:** 1 = un paso, 2 = dos o tres pasos o una trampa clásica, 3 = resoluciones completas.

---

## B1 · Signes i parèntesis

**Regla d'or:** «Un signe menys davant d'un parèntesi canvia el signe de **tots** els termes de dins. Un número davant d'un parèntesi multiplica **tots** els termes de dins.»

**Exemples (Aprèn):**
1. 5 − (2x − 3) = 5 − 2x + 3 = 8 − 2x
2. 3(x − 4) − 2(x + 1) = 3x − 12 − 2x − 2 = x − 14

| error_tag | Nom al panell | Explicació |
|---|---|---|
| `B1_SIGNE_PARCIAL` | El menys només canvia el primer terme | El signe menys davant del parèntesi afecta **tots** els termes de dins, no només el primer. −(2x − 3) = −2x + 3: el −3 es converteix en +3. |
| `B1_SIGNE_OBLIDAT` | Treure el parèntesi sense el menys | Has tret el parèntesi com si davant hi hagués un +. Amb un − davant, tots els signes de dins canvien. |
| `B1_DISTRIB_PARCIAL` | El número només multiplica el primer terme | El número de fora multiplica **cada** terme del parèntesi: 3(x + 4) = 3x + 12, no 3x + 4. |
| `B1_ORDRE_OPERACIONS` | Ordre de les operacions | Primer potències, després multiplicacions i divisions, i al final sumes i restes, si no hi ha parèntesis que diguin el contrari. 2 + 3·4 = 2 + 12 = 14. |
| `B1_QUADRAT_NEGATIU` | −n² amb (−n)² | A −3² l'exponent afecta només el 3: −3² = −(3²) = −9. Per elevar el −3 cal escriure (−3)² = 9. |
| `B1_QUADRAT_DOBLE` | Elevar al quadrat com multiplicar per 2 | Elevar al quadrat és multiplicar el número per ell mateix: 5² = 5·5 = 25, no 5·2 = 10. |
| `B1_TERMES_NO_SEMBLANTS` | Sumar termes que no són semblants | Només es poden sumar termes amb la mateixa part literal. 3x + 2 no es pot ajuntar: no és 5x. |

**B1.T1** · `mc_result` · nivell 1
- Paràmetres: a ∈ [2..9], b ∈ [1..9], c ∈ [1..9], c ≠ b.
- Enunciat: «Simplifica» c − (a·x − b)
- Correcta: (c + b) − a·x
- Distractors: (c − b) − a·x → `B1_SIGNE_PARCIAL` · (c + b) + a·x → `B1_SIGNE_OBLIDAT` · (c + b − a)·x → `B1_TERMES_NO_SEMBLANTS`
- Explicació correcta: «El menys canvia el signe dels dos termes: −(a·x − b) = −a·x + b. Després ajuntes els números: c + b.»

**B1.T2** · `mc_result` · nivell 2
- Paràmetres: k, m ∈ [2..6], k ≠ m; p, q ∈ [1..9].
- Enunciat: «Simplifica» k(x + p) − m(x − q)
- Correcta: (k − m)x + (kp + mq)
- Distractors: (k − m)x + (kp − mq) → `B1_SIGNE_PARCIAL` · (k − m)x + (p + mq) → `B1_DISTRIB_PARCIAL` · (k + m)x + (kp − mq) → `B1_SIGNE_OBLIDAT`
- Explicació correcta: «k(x + p) = kx + kp. −m(x − q) = −mx + mq (menys per menys, més). Ajuntant: (k − m)x + kp + mq.»

**B1.T3** · `mc_result` · nivell 1 (numèric)
- Paràmetres: a, b, c, d ∈ [2..9].
- Enunciat: «Calcula» a + b·c − d
- Correcta: a + bc − d
- Distractors: (a + b)c − d → `B1_ORDRE_OPERACIONS` · a + b(c − d) → `B1_ORDRE_OPERACIONS` · (a + b)(c − d) → `B1_ORDRE_OPERACIONS`
- Explicació correcta: «Primer la multiplicació: b·c. Després, d'esquerra a dreta, la suma i la resta.»

**B1.T4** · `mc_result` · nivell 1 (numèric)
- Paràmetres: n ∈ [2..6], m ∈ [1..9].
- Enunciat: «Calcula» −n² + m
- Correcta: m − n²
- Distractors: n² + m → `B1_QUADRAT_NEGATIU` · m − 2n → `B1_QUADRAT_DOBLE` · (m − n)² → `B1_ORDRE_OPERACIONS`
- Explicació correcta: «L'exponent afecta només l'n: −n² = −(n·n). Després hi sumes m.»

**B1.T5** · `valid_step` · nivell 2
- Paràmetres: a ∈ [2..9], b, c ∈ [1..9].
- Pas: c − (a·x − b) ⟹ **[vàlid]** c − a·x + b · **[invàlid]** c − a·x − b
- Raons: ✓ «El menys canvia el signe de tots els termes del parèntesi» · «El menys només afecta el primer terme» → `B1_SIGNE_PARCIAL` · «Un parèntesi no es pot treure si no saps quant val x» → `B1_SIGNE_OBLIDAT` *(override: «Un parèntesi sempre es pot treure; només cal aplicar bé els signes.»)*

**B1.T6** · `find_error` · nivell 3
- Paràmetres: k ∈ [2..5], p, q ∈ [1..9], p ≠ q.
- Resolució de «Simplifica k(x − p) − (x − q)»:
  1. kx − kp − (x − q) — *error possible:* kx − p − (x − q) → `B1_DISTRIB_PARCIAL`
  2. kx − kp − x + q — *error possible:* kx − kp − x − q → `B1_SIGNE_PARCIAL`
  3. (k − 1)x + (q − kp)

---

## B2 · Fraccions numèriques

**Regla d'or:** «Per sumar o restar fraccions cal el **mateix denominador** (i llavors se sumen només els numeradors). Per multiplicar: numerador per numerador i denominador per denominador. Per dividir: multiplica per la inversa de la segona.»

**Exemples (Aprèn):**
1. 1/2 + 1/3 = 3/6 + 2/6 = 5/6
2. (2/3) : (4/5) = (2/3)·(5/4) = 10/12 = 5/6

| error_tag | Nom al panell | Explicació |
|---|---|---|
| `B2_SUMA_DENOMINADORS` | Sumar els denominadors | Els denominadors no se sumen. Primer cal posar les fraccions amb el mateix denominador: 1/2 + 1/3 = 3/6 + 2/6 = 5/6, no 2/5. |
| `B2_AMPLIFICA_NOMES_DENOMINADOR` | Canviar el denominador sense el numerador | Si canvies el denominador, has de multiplicar el numerador pel mateix número; si no, la fracció canvia de valor. 1/2 = 3/6, no 1/6. |
| `B2_ENTER_SENSE_DENOMINADOR` | Sumar un enter només al numerador | Un enter també és una fracció: 2 = 2b/b. Per tant 2 + a/b = (2b + a)/b. |
| `B2_OPERACIO_CONFOSA` | Confondre suma i producte | Has multiplicat quan calia sumar (o al revés). Torna a llegir quina operació demana l'enunciat. |
| `B2_DIVISIO_SENSE_INVERTIR` | Dividir sense invertir | Dividir per una fracció és multiplicar per la seva inversa: (a/b) : (c/d) = (a/b)·(d/c) = ad/(bc). |
| `B2_INVERTEIX_PRIMERA` | Invertir la fracció equivocada | S'inverteix la segona fracció (la que divideix), no la primera. |
| `B2_FRACCIO_DE_FRACCIO` | Fracció de fracció | (a/b)/c = a/(b·c): el c baixa al denominador. En canvi, a/(b/c) = a·c/b. |
| `B2_PRODUCTE_ENTER_A_TOT` | Multiplicar l'enter a dalt i a baix | Multiplicar una fracció per un enter només multiplica el numerador: 3·(2/5) = 6/5. Si el multipliques a dalt i a baix, la fracció no canvia. |
| `B2_SIMPLIFICA_SUMA` | Simplificar dins d'una suma | Només es pot simplificar un factor que multiplica **tot** el numerador i **tot** el denominador. (6 + 5)/6 = 11/6: no pots tatxar el 6, perquè està sumant. |

**B2.T1** · `mc_result` · nivell 1
- Paràmetres: b, d ∈ [2..9], b ≠ d; a ∈ [1..b−1], c ∈ [1..d−1].
- Enunciat: «Calcula» a/b + c/d
- Correcta: (ad + cb)/(bd), irreductible
- Distractors: (a + c)/(b + d) → `B2_SUMA_DENOMINADORS` · (a + c)/mcm(b, d) → `B2_AMPLIFICA_NOMES_DENOMINADOR` · (ac)/(bd) → `B2_OPERACIO_CONFOSA`
- Explicació correcta: «Denominador comú mcm(b, d). Amplifica cada fracció (numerador i denominador pel mateix número), suma els numeradors i simplifica.»

**B2.T2** · `mc_result` · nivell 1
- Paràmetres: k ∈ [1..5], b ∈ [2..9], a ∈ [1..b−1].
- Enunciat: «Calcula» k + a/b
- Correcta: (kb + a)/b
- Distractors: (k + a)/b → `B2_ENTER_SENSE_DENOMINADOR` · (k + a)/(1 + b) → `B2_SUMA_DENOMINADORS` · (ka)/b → `B2_OPERACIO_CONFOSA`
- Explicació correcta: «Escriu k com a fracció amb denominador b: k = kb/b. Després suma els numeradors.»

**B2.T3** · `mc_result` · nivell 2
- Paràmetres: a, b, c, d ∈ [1..9], a/b i c/d irreductibles i diferents d'1.
- Enunciat: «Calcula» (a/b) : (c/d)
- Correcta: ad/(bc), irreductible
- Distractors: ac/(bd) → `B2_DIVISIO_SENSE_INVERTIR` · bc/(ad) → `B2_INVERTEIX_PRIMERA` · bd/(ac) → `B2_INVERTEIX_PRIMERA`
- Explicació correcta: «Dividir per c/d és multiplicar per d/c: (a/b)·(d/c) = ad/(bc).»

**B2.T4** · `mc_result` · nivell 2
- Paràmetres: a, b, c ∈ [2..9], distints; variant v ∈ {«(a/b)/c», «a/(b/c)»}.
- Correcta: a/(bc) (primera variant) · ac/b (segona)
- Distractors: la de l'altra variant → `B2_FRACCIO_DE_FRACCIO` · b/(ac) (o b/(ac) per a la segona) → `B2_INVERTEIX_PRIMERA` · a/(b + c) → `B2_OPERACIO_CONFOSA`
- Explicació correcta: «Escriu el número sol com a fracció (c = c/1) i fes la divisió multiplicant per la inversa.»

**B2.T5** · `valid_step` · nivell 2
- Paràmetres: a ∈ [2..9], b ∈ [1..9], b no múltiple d'a; k ∈ [2..5].
- Pool:
  - (a + b)/a ⟹ **[vàlid]** 1 + b/a · **[invàlid]** b → `B2_SIMPLIFICA_SUMA` · **[invàlid]** 1 + b → `B2_SIMPLIFICA_SUMA`
  - k·(a/b) ⟹ **[vàlid]** ka/b · **[invàlid]** ka/(kb) → `B2_PRODUCTE_ENTER_A_TOT`
- Raons (quan és vàlid): ✓ «Cada terme del numerador es divideix pel denominador» / «L'enter només multiplica el numerador» · les altres dues amb els tags del pool.

**B2.T6** · `find_error` · nivell 3
- Paràmetres: b, d ∈ [2..6], b ≠ d; a, c ∈ [1..5]; k ∈ [2..4].
- Resolució de «Calcula (a/b + c/d)·k»:
  1. Amplificar a mcm(b, d) — *error possible:* només el denominador → `B2_AMPLIFICA_NOMES_DENOMINADOR`
  2. Sumar numeradors — *error possible:* sumar també els denominadors → `B2_SUMA_DENOMINADORS`
  3. Multiplicar per k — *error possible:* k a dalt i a baix → `B2_PRODUCTE_ENTER_A_TOT`
  4. Simplificar

---

## B3 · Potències i arrels

**Regla d'or:** «Les propietats de les potències funcionen amb **productes i quocients**, mai amb **sumes**: (a·b)ⁿ = aⁿ·bⁿ, però (a + b)ⁿ ≠ aⁿ + bⁿ.»

**Exemples (Aprèn):**
1. (2x³)² = 2²·(x³)² = 4x⁶
2. (x + 3)² = (x + 3)(x + 3) = x² + 6x + 9

| error_tag | Nom al panell | Explicació |
|---|---|---|
| `B3_QUADRAT_SUMA` | (a + b)² = a² + b² | Elevar al quadrat una suma no és elevar cada terme: (a + b)² = (a + b)(a + b) = a² + 2ab + b². Prova amb a = b = 1: (1 + 1)² = 4, però 1² + 1² = 2. |
| `B3_COEF_NO_ELEVAT` | No elevar el número | L'exponent afecta tot el que hi ha dins el parèntesi, també el número: (2x)³ = 2³·x³ = 8x³. |
| `B3_COEF_MULTIPLICAT` | Multiplicar per l'exponent | Elevar no és multiplicar per l'exponent: 2³ = 2·2·2 = 8, no 2·3 = 6. |
| `B3_PRODUCTE_EXPONENTS` | Multiplicar exponents en un producte | En multiplicar potències de la mateixa base, els exponents se **sumen**: x²·x³ = x⁵. |
| `B3_POTENCIA_POTENCIA` | Sumar exponents en una potència de potència | En una potència d'una potència, els exponents es **multipliquen**: (x²)³ = x²·x²·x² = x⁶. |
| `B3_QUOCIENT_EXPONENTS` | Exponents en una divisió | En dividir potències de la mateixa base, els exponents es **resten**: x⁷/x³ = x⁴. |
| `B3_EXP_NEGATIU` | Exponent negatiu = negatiu | Un exponent negatiu vol dir **invers**, no negatiu: x⁻² = 1/x², i (2/3)⁻¹ = 3/2. |
| `B3_EXP_ABAST` | A què afecta l'exponent | L'exponent només afecta el que té just a sota, o el parèntesi sencer: 2x⁻¹ = 2/x, però (2x)⁻¹ = 1/(2x). Igual amb (x²y)³ = x⁶y³: la y també s'eleva. |
| `B3_SUMA_POTENCIES` | Ajuntar potències que se sumen | Les potències només es combinen quan es multipliquen o es divideixen. x² + x³ no es pot simplificar; x² + x² = 2x². |
| `B3_ARREL_SUMA` | Arrel d'una suma | L'arrel d'una suma no és la suma de les arrels: √(9 + 16) = √25 = 5, però √9 + √16 = 7. |
| `B3_EXP_FRACCIONARI` | Exponent fraccionari | Un exponent fraccionari és una arrel: x^(1/2) = √x i x^(m/n) = ⁿ√(xᵐ). El denominador és l'índex de l'arrel. |
| `B3_FRACCIO_POTENCIA` | Elevar només el numerador | L'exponent afecta el numerador i el denominador: (2/3)² = 4/9. |

**B3.T1** · `mc_result` · nivell 1
- Paràmetres: k ∈ [2..5], a ∈ [2..4], n ∈ [2..3]; descartar si kⁿ = k·n o si a + n = a·n.
- Enunciat: «Simplifica» (k·xᵃ)ⁿ
- Correcta: kⁿ·x^(a·n)
- Distractors: k·x^(a·n) → `B3_COEF_NO_ELEVAT` · kⁿ·x^(a+n) → `B3_POTENCIA_POTENCIA` · (k·n)·x^(a·n) → `B3_COEF_MULTIPLICAT`
- Explicació correcta: «L'exponent n afecta el k i la xᵃ. kⁿ es calcula multiplicant; (xᵃ)ⁿ = x^(a·n).»

**B3.T2** · `mc_result` · nivell 1
- Paràmetres: a, b ∈ [2..7], c ∈ [1..5], a + b > c; descartar coincidències.
- Enunciat: «Simplifica» (xᵃ·xᵇ)/xᶜ
- Correcta: x^(a+b−c)
- Distractors: x^(a·b−c) → `B3_PRODUCTE_EXPONENTS` · x^((a+b)/c) → `B3_QUOCIENT_EXPONENTS` · x^(a+b+c) → `B3_QUOCIENT_EXPONENTS`
- Explicació correcta: «Al numerador sumes els exponents (a + b); en dividir, restes el del denominador.»

**B3.T3** · `mc_result` · nivell 2
- Paràmetres: a ∈ [2..4], p ∈ [1..7], signe s ∈ {+, −}.
- Enunciat: «Desenvolupa» (a·x s p)²
- Correcta: a²x² s 2ap·x + p²
- Distractors (s = +): a²x² + p² → `B3_QUADRAT_SUMA` · a²x² + ap·x + p² → `B4_DOBLE_PRODUCTE` · a·x² + 2ap·x + p² → `B3_COEF_NO_ELEVAT`
- Distractors (s = −): a²x² − p² → `B3_QUADRAT_SUMA` · a²x² − 2ap·x − p² → `B4_SIGNE_QUADRAT` · a²x² − ap·x + p² → `B4_DOBLE_PRODUCTE`
- Explicació correcta: «(ax s p)² = (ax)² s 2·(ax)·p + p². El terme del mig és el doble producte, i p² sempre és positiu.»

**B3.T4** · `mc_result` · nivell 2 (numèric)
- Paràmetres: a, b ∈ [2..5], distints; n ∈ [1..2].
- Enunciat: «Calcula» (a/b)⁻ⁿ
- Correcta: bⁿ/aⁿ
- Distractors: −aⁿ/bⁿ → `B3_EXP_NEGATIU` · −bⁿ/aⁿ → `B3_EXP_NEGATIU` · (si n = 2) bⁿ/a → `B3_FRACCIO_POTENCIA`; (si n = 1) aⁿ/bⁿ → `B3_EXP_NEGATIU`
- Explicació correcta: «L'exponent negatiu inverteix la fracció: (a/b)⁻ⁿ = (b/a)ⁿ = bⁿ/aⁿ.»

**B3.T5** · `valid_step` · nivell 2
- Pool (amb x, y i un número k ∈ [2..9]):
  - (x + y)² ⟹ **[vàlid]** x² + 2xy + y² · **[invàlid]** x² + y² → `B3_QUADRAT_SUMA`
  - √(x² + k²) ⟹ **[invàlid]** x + k → `B3_ARREL_SUMA` · **[vàlid]** √(k²x²) = k·x (per a x ≥ 0)
  - x² + x² ⟹ **[vàlid]** 2x² · **[invàlid]** x⁴ → `B3_SUMA_POTENCIES`
  - x^(1/2) ⟹ **[vàlid]** √x · **[invàlid]** x/2 → `B3_EXP_FRACCIONARI`
  - k·x⁻¹ ⟹ **[vàlid]** k/x · **[invàlid]** 1/(k·x) → `B3_EXP_ABAST`
- Raons: ✓ la propietat aplicada correctament en una frase · les altres dues amb tags del bloc.

**B3.T6** · `mc_result` · nivell 3
- Paràmetres: a, b ∈ [1..3], n ∈ [2..3], c ∈ [1..a·n−1], d ∈ [1..b·n−1].
- Enunciat: «Simplifica» (xᵃ·yᵇ)ⁿ / (xᶜ·yᵈ)
- Correcta: x^(a·n−c)·y^(b·n−d)
- Distractors: x^(a+n−c)·y^(b+n−d) → `B3_POTENCIA_POTENCIA` · x^(a·n−c)·y^(b−d) → `B3_EXP_ABAST` · x^(a·n/c)·y^(b·n/d) → `B3_QUOCIENT_EXPONENTS`
- Explicació correcta: «Primer eleva cada factor (multiplicant exponents); després divideix restant exponents de la mateixa base.»

**B3.T7** · `mc_result` · nivell 2
- Paràmetres: n ∈ [2..4], m ∈ [1..5], m ≠ n, mcd(m, n) = 1.
- Enunciat: «Escriu com a arrel» x^(m/n)
- Correcta: ⁿ√(xᵐ)
- Distractors: ᵐ√(xⁿ) → `B3_EXP_FRACCIONARI` · xᵐ/n → `B3_EXP_FRACCIONARI` · x^(m−n) → `B3_EXP_FRACCIONARI`
- Explicació correcta: «El denominador de l'exponent és l'índex de l'arrel; el numerador, l'exponent de dins.»
- Verificació: equivalència numèrica per a x > 0. Si m = 1, mostrar ⁿ√x.

**B3.T8** · `find_error` · nivell 3
- Paràmetres: k ∈ [2..3], a ∈ [2..3], n = 3, j ∈ [1..2], c tal que a·n + j − c ≥ 1, i d divisor de kⁿ.
- Resolució de «Simplifica (k·xᵃ)ⁿ·xʲ / (d·xᶜ)»:
  1. kⁿ·x^(a·n)·xʲ / (d·xᶜ) — *errors possibles:* k·x^(a·n) → `B3_COEF_NO_ELEVAT` · kⁿ·x^(a+n) → `B3_POTENCIA_POTENCIA`
  2. kⁿ·x^(a·n+j) / (d·xᶜ) — *error possible:* x^(a·n·j) → `B3_PRODUCTE_EXPONENTS`
  3. (kⁿ/d)·x^(a·n+j−c) — *error possible:* x^((a·n+j)/c) → `B3_QUOCIENT_EXPONENTS`

---

## B4 · Identitats notables i factorització

**Regla d'or:** «Factoritzar és escriure com a **producte**. Comprova-ho sempre desenvolupant: si en multiplicar no tornes a l'expressió inicial, la factorització és incorrecta.»

**Exemples (Aprèn):**
1. 2x² + 6x = 2x(x + 3). Comprovació: 2x·x + 2x·3 = 2x² + 6x ✓
2. x² − 25 = (x + 5)(x − 5). Comprovació: x² − 5x + 5x − 25 = x² − 25 ✓

| error_tag | Nom al panell | Explicació |
|---|---|---|
| `B4_DIF_QUADRATS` | Diferència de quadrats com a quadrat | La diferència de quadrats és suma per diferència: a² − b² = (a + b)(a − b). En canvi, (a − b)² = a² − 2ab + b². |
| `B4_DOBLE_PRODUCTE` | Oblidar el 2 del doble producte | El terme del mig és el **doble** producte: (a + b)² = a² + 2ab + b². |
| `B4_SIGNE_QUADRAT` | Signe de b² | b² sempre és positiu: (a − b)² = a² − 2ab + b². |
| `B4_FACTOR_COMU_INCOMPLET` | Factor comú mal dividit | En treure factor comú, divideix **cada** terme pel factor: 2x² + 4x = 2x(x + 2), perquè 4x : 2x = 2. Comprova-ho multiplicant. |
| `B4_FACTOR_COMU_UN` | Oblidar l'1 en treure factor comú | Quan un terme és exactament el factor comú, a dins hi queda un 1: x² + x = x(x + 1). |
| `B4_FACTOR_COMU_EXPONENT` | Treure una x que no és a tots els termes | El factor comú ha d'estar a **tots** els termes. A 3x² − 12, la x no és al −12: el factor comú és només 3. |
| `B4_SUMA_QUADRATS` | Factoritzar una suma de quadrats | x² + 9 no es pot factoritzar amb nombres reals. Compte: (x + 3)² = x² + 6x + 9. |
| `B4_NO_RECONEIX` | No reconèixer una identitat | Si tens un quadrat menys un altre quadrat, sempre es pot factoritzar com a suma per diferència. |

**B4.T1** · `mc_result` · nivell 1
- Paràmetres: g ∈ [2..5], p ∈ [1..5], q ∈ [1..6], mcd(p, q) = 1. Expressió: (g·p)x² + (g·q)x.
- Enunciat: «Factoritza»
- Correcta: g·x(p·x + q)
- Distractors: g·x(p·x + g·q) → `B4_FACTOR_COMU_INCOMPLET` · x(p·x + q) → `B4_FACTOR_COMU_INCOMPLET` · si q = 1: g·x(p·x) → `B4_FACTOR_COMU_UN`; si q > 1: g·x²(p + q) → `B4_FACTOR_COMU_EXPONENT`
- Explicació correcta: «El factor comú és g·x. Divideix cada terme: (g·p·x²)/(g·x) = p·x i (g·q·x)/(g·x) = q.»

**B4.T2** · `mc_result` · nivell 1-2
- Paràmetres: nivell 1: a = 1, k ∈ [2..9]. Nivell 2: a ∈ [2..4], k ∈ [1..9], mcd(a, k) = 1.
- Enunciat: «Factoritza» a²x² − k²
- Correcta: (a·x + k)(a·x − k)
- Distractors: (a·x − k)² → `B4_DIF_QUADRATS` · (a·x + k)² → `B4_DIF_QUADRATS` · nivell 1: «No es pot factoritzar» → `B4_NO_RECONEIX`; nivell 2: a(x + k)(x − k) → `B3_COEF_NO_ELEVAT`
- Explicació correcta: «a²x² = (ax)² i k² = k². Quadrat menys quadrat: suma per diferència.»

**B4.T3** · `mc_result` · nivell 2
- Paràmetres: p ∈ [1..8], signe s ∈ {+, −}.
- Enunciat: «Factoritza» x² s 2p·x + p²
- Correcta: (x s p)²
- Distractors: (x s 2p)² → `B4_DOBLE_PRODUCTE` · (x + p)(x − p) → `B4_DIF_QUADRATS` · (x s p²)² → `B4_DOBLE_PRODUCTE`
- Explicació correcta: «x² i p² són quadrats, i el terme del mig és 2·x·p: és el quadrat d'una suma (o d'una diferència).»

**B4.T4** · `valid_step` · nivell 2
- Paràmetres: k ∈ [2..9], g ∈ [2..5].
- Pool:
  - x² + k² ⟹ **[invàlid]** (x + k)² → `B4_SUMA_QUADRATS`
  - x² − k² ⟹ **[vàlid]** (x + k)(x − k) · **[invàlid]** (x − k)² → `B4_DIF_QUADRATS`
  - (x − k)² ⟹ **[vàlid]** (k − x)² *(trampa interessant: és vàlid)*
  - g·x² + g·k·x ⟹ **[vàlid]** g·x(x + k) · **[invàlid]** g·x(x + g·k) → `B4_FACTOR_COMU_INCOMPLET`
- Raons per a (x − k)² = (k − x)²: ✓ «k − x = −(x − k), i en elevar al quadrat el signe desapareix» · «No: els termes estan en ordre diferent» → `B4_SIGNE_QUADRAT` *(override: «L'ordre canvia el signe de dins, però el quadrat d'un número i el del seu oposat són iguals.»)*

**B4.T5** · `find_error` · nivell 3
- Paràmetres: g ∈ [2..5], k ∈ [2..6].
- Resolució de «Factoritza completament g·x³ − g·k²·x»:
  1. g·x(x² − k²) — *error possible:* g·x(x² − g·k²) → `B4_FACTOR_COMU_INCOMPLET`
  2. g·x(x + k)(x − k) — *error possible:* g·x(x − k)² → `B4_DIF_QUADRATS`

**B4.T6** · `next_step` · nivell 2
- Paràmetres: g ∈ [2..5], k ∈ [2..6]. Expressió: g·x² − g·k².
- Enunciat: «Quin és el primer pas per factoritzar-la completament?»
- Correcta: g(x² − k²)
- Distractors: g(x − k)² → `B4_DIF_QUADRATS` · g(x² − g·k²) → `B4_FACTOR_COMU_INCOMPLET` · g·x(x − k²) → `B4_FACTOR_COMU_EXPONENT`
- Explicació correcta: «El factor comú a tots dos termes és g (la x no és al segon). Després, x² − k² encara es pot factoritzar: g(x + k)(x − k).»

---

## B5 · Simplificar fraccions algebraiques

**Regla d'or:** «Només es poden tatxar **factors** (coses que multipliquen tot el numerador i tot el denominador), mai **termes** (coses que se sumen o es resten). Si hi ha sumes, primer factoritza.»

**Exemples (Aprèn):**
1. (x² − 9)/(x + 3) = (x + 3)(x − 3)/(x + 3) = x − 3
2. (x + 6)/6: el 6 de dalt està sumant, no es pot tatxar. Com a molt: x/6 + 1.

| error_tag | Nom al panell | Explicació |
|---|---|---|
| `B5_CANCELA_TERME` | Tatxar un terme que suma | El que has tatxat està sumant o restant, no multiplicant. Només es pot tatxar un factor comú a **tot** el numerador i **tot** el denominador. Exemple: (x + 3)/x = 1 + 3/x, no 3. |
| `B5_CANCELA_TERMES_SEMBLANTS` | Tatxar les x de dalt i de baix | Has tatxat les x, però estan sumant. Prova amb x = 1: (1 + 2)/(1 + 5) = 3/6 = 1/2, i no 2/5. |
| `B5_CANCELA_EXPONENT` | Dividir només un terme | Si divideixes el numerador per x, cal dividir-ne **tots** els termes: (x² + 1)/x = x + 1/x, no x + 1. |
| `B5_NUMERO_PARCIAL` | El número només divideix un terme | El denominador divideix tots els termes del numerador: (2x + 6)/2 = x + 3. O factoritza: 2(x + 3)/2. |
| `B5_NO_FACTORITZA` | Dir que no es pot sense factoritzar | Abans de dir que no es pot simplificar, prova de factoritzar el numerador i el denominador. |
| `B5_FACTOR_ERRONI` | Quedar-se amb el factor equivocat | Factoritza i mira quin factor és igual a dalt i a baix: x² − 4 = (x + 2)(x − 2); si tatxes (x − 2), queda x + 2. |
| `B5_SIGNE_OPOSAT` | a − x amb x − a | a − x = −(x − a). Per tant (a − x)/(x − a) = −1, no 1 ni 0. |
| `B5_SUMA_FRACCIONS` | Sumar fraccions algebraiques | Cal denominador comú, com amb els números: 1/x + 1/y = (y + x)/(x·y). |
| `B5_NO_TATXA_FACTOR` | Por de tatxar factors | Quan una x (o un parèntesi) multiplica tot el numerador i tot el denominador, sí que es pot tatxar (si no val 0). |

**B5.T1** · `mc_result` · nivell 1
- Paràmetres: k ∈ [2..6], m ∈ [1..9], m ≠ k.
- Enunciat: «Simplifica» (k·x + k·m)/k (es mostra amb els números calculats, p. ex. (3x + 12)/3)
- Correcta: x + m
- Distractors: x + k·m → `B5_NUMERO_PARCIAL` · k·x + m → `B5_NUMERO_PARCIAL` · «No es pot simplificar» → `B5_NO_FACTORITZA`
- Explicació correcta: «Treu factor comú k a dalt: k(x + m)/k. Ara el k multiplica tot el numerador i es pot tatxar.»

**B5.T2** · `mc_result` · nivell 1
- Paràmetres: a, b ∈ [1..9], a ≠ b.
- Enunciat: «Simplifica» (x + a)/(x + b)
- Correcta: «No es pot simplificar»
- Distractors: a/b → `B5_CANCELA_TERMES_SEMBLANTS` · 1 + a/b → `B5_CANCELA_TERMES_SEMBLANTS` · a/(x + b) → `B5_CANCELA_TERME`
- Explicació correcta: «Ni la x ni els números multipliquen tot el numerador i tot el denominador. No hi ha cap factor comú per tatxar.»

**B5.T3** · `mc_result` · nivell 2
- Paràmetres: k ∈ [2..9], s ∈ {+, −}.
- Enunciat: «Simplifica» (x² − k²)/(x − s·k)
- Correcta: x + s·k
- Distractors: x − s·k → `B5_FACTOR_ERRONI` · x² − s·k → `B5_CANCELA_TERME` · «No es pot simplificar» → `B5_NO_FACTORITZA`
- Explicació correcta: «x² − k² = (x + k)(x − k). Tatxes el factor que coincideix amb el denominador (per a x ≠ s·k).»
- Nota: per a s = −, la divisió «terme a terme» dona per casualitat el resultat correcte; per això el distractor de `B5_CANCELA_TERME` és x² − s·k i no x − s·k.

**B5.T4** · `mc_result` · nivell 2
- Paràmetres: b ∈ [2..9].
- Enunciat: «Simplifica» (x² + b·x)/x
- Correcta: x + b
- Distractors: x² + b → `B5_CANCELA_EXPONENT` · x + b·x → `B5_CANCELA_EXPONENT` · «No es pot simplificar» → `B5_NO_FACTORITZA`
- Explicació correcta: «x² + b·x = x(x + b). La x multiplica tot el numerador: es tatxa amb la de baix (per a x ≠ 0).»

**B5.T5** · `mc_result` · nivell 2
- Paràmetres: a ∈ [1..9].
- Enunciat: «Simplifica» (a − x)/(x − a)
- Correcta: −1
- Distractors: 1 → `B5_SIGNE_OPOSAT` · 0 → `B5_SIGNE_OPOSAT` · «No es pot simplificar» → `B5_NO_FACTORITZA`
- Explicació correcta: «a − x = −(x − a). Llavors −(x − a)/(x − a) = −1 (per a x ≠ a).»

**B5.T6** · `valid_step` · nivell 1-2
- Paràmetres: c, d ∈ [2..9], c ≠ d.
- Pool:
  - (x + c)/c ⟹ **[invàlid]** x → `B5_CANCELA_TERME` · **[vàlid]** x/c + 1
  - (c·x)/c ⟹ **[vàlid]** x
  - (x + c)/(x + d) ⟹ **[invàlid]** c/d → `B5_CANCELA_TERMES_SEMBLANTS`
  - x(x + c)/x ⟹ **[vàlid]** x + c (per a x ≠ 0)
  - (x² + c)/x ⟹ **[invàlid]** x + c → `B5_CANCELA_EXPONENT` · **[vàlid]** x + c/x
  - (2x + 2c)/2 ⟹ **[vàlid]** x + c · **[invàlid]** x + 2c → `B5_NUMERO_PARCIAL`
- Raons (si és vàlid): ✓ «El que he tatxat multiplica tot el numerador i tot el denominador» · «No: mai es pot tatxar res que tingui x» → `B5_NO_TATXA_FACTOR` · «No: només es pot tatxar si són números» → `B5_NO_TATXA_FACTOR`
- Raons (si és invàlid): ✓ «No: el que he tatxat està sumant» · «Sí: x es pot tatxar amb x» → `B5_CANCELA_TERME` · «Sí: els números es poden simplificar sempre» → `B5_NUMERO_PARCIAL`

**B5.T7** · `mc_result` · nivell 3
- Paràmetres: p ∈ [1..8].
- Enunciat: «Simplifica» (x² − 2p·x + p²)/(x² − p²)
- Correcta: (x − p)/(x + p)
- Distractors: 1 → `B4_DIF_QUADRATS` · (x + p)/(x − p) → `B5_FACTOR_ERRONI` · «No es pot simplificar» → `B5_NO_FACTORITZA`
- Explicació correcta: «Numerador: (x − p)². Denominador: (x + p)(x − p). Tatxes un (x − p).»

**B5.T8** · `mc_result` · nivell 2
- Paràmetres: k ∈ [1..9].
- Enunciat: «Calcula» 1/x + 1/(x + k)
- Correcta: (2x + k)/(x(x + k))
- Distractors: 2/(2x + k) → `B5_SUMA_FRACCIONS` · 2/(x(x + k)) → `B2_AMPLIFICA_NOMES_DENOMINADOR` · (2x + k)/(x + k) → `B5_SUMA_FRACCIONS`
- Explicació correcta: «Denominador comú x(x + k). Amplifica: (x + k)/(x(x + k)) + x/(x(x + k)). Suma els numeradors.»

**B5.T9** · `find_error` · nivell 3
- Paràmetres: k ∈ [2..7].
- Resolució de «Simplifica (x² − k²)/(x² + k·x)»:
  1. (x + k)(x − k) / (x(x + k)) — *error possible:* denominador x(x + k·x) → `B4_FACTOR_COMU_INCOMPLET`
  2. (x − k)/x
  3. *(pas final opcional, apareix només si s'hi injecta l'error)* (x − k)/x = −k → `B5_CANCELA_TERME`

---

## B6 · Equacions amb fraccions

**Regla d'or:** «Multiplica **tots** els termes dels **dos** costats pel mínim comú múltiple dels denominadors. Posa parèntesis als numeradors abans de multiplicar. Si hi ha x al denominador, comprova que la solució no anul·la cap denominador.»

**Exemples (Aprèn):**
1. x/2 + x/3 = 5 → (·6) → 3x + 2x = 30 → 5x = 30 → x = 6
2. x/2 − (x − 1)/3 = 1 → (·6) → 3x − 2(x − 1) = 6 → 3x − 2x + 2 = 6 → x = 4

| error_tag | Nom al panell | Explicació |
|---|---|---|
| `B6_MCM_PARCIAL` | Multiplicar només alguns termes | Has de multiplicar **tots** els termes pel m.c.m., també els que no tenen denominador: si multipliques per 6, un 2 es converteix en 12. |
| `B6_TREU_DENOMINADORS` | «Treure» els denominadors | Els denominadors no desapareixen sols: cal multiplicar cada terme pel m.c.m. i simplificar terme a terme. |
| `B6_NUMERADOR_SENSE_PARENTESI` | Numerador sense parèntesi | El numerador és un bloc. −(x − 1)/3 multiplicat per 6 és −2(x − 1) = −2x + 2, no −2x − 2. |
| `B6_DESPEJA_MAL` | Aïllar la x malament | Si un número multiplica la x, passa a l'altre costat dividint: 3x = 12 → x = 12/3 = 4. No restant, ni a l'inrevés (3/12). |
| `B6_TRANSPOSICIO_SIGNE` | Signe en passar de costat | Quan un terme passa a l'altre costat sumant o restant, canvia de signe: x + 5 = 2 → x = 2 − 5. |
| `B6_SOLUCIO_PROHIBIDA` | Solució que anul·la un denominador | Abans de donar la solució, comprova que no anul·la cap denominador de l'equació original. Si l'anul·la, no és solució. |
| `B6_CREU_AMB_SUMES` | Multiplicar en creu amb sumes | Només es pot multiplicar en creu quan cada costat és **una sola fracció**. Si hi ha més termes, primer agrupa o multiplica pel m.c.m. |

**B6.T1** · `mc_result` · nivell 1
- Paràmetres: a, b ∈ [2..6], a ≠ b; L = mcm(a, b); s = t·L amb t ∈ [1..3]; c = s/a + s/b.
- Enunciat: «Resol» x/a + x/b = c
- Correcta: x = s
- Distractors: x = c·(a + b) → `B2_SUMA_DENOMINADORS` *(override: «x/a + x/b no és x/(a + b): cal denominador comú.»)* · x = c/(L/a + L/b) → `B6_MCM_PARCIAL` · x = L·c − (L/a + L/b) → `B6_DESPEJA_MAL`
- Explicació correcta: «Multiplica per L: (L/a)x + (L/b)x = L·c. Ajunta les x i divideix pel coeficient.»

**B6.T2** · `next_step` · nivell 2
- Paràmetres: a, b ∈ [2..6], a ≠ b; L = mcm(a, b); p, q ∈ [1..9]; c ∈ [1..5].
- Enunciat: «Equació: (x + p)/a − (x − q)/b = c. Quin és el pas següent correcte?»
- Correcta: (L/a)(x + p) − (L/b)(x − q) = L·c
- Distractors: (L/a)(x + p) − (L/b)(x − q) = c → `B6_MCM_PARCIAL` · (L/a)x + (L/a)p − (L/b)x − (L/b)q = L·c → `B6_NUMERADOR_SENSE_PARENTESI` · (x + p) − (x − q) = L·c → `B6_TREU_DENOMINADORS`
- Verificació: comparar conjunts de solucions (equacions lineals).

**B6.T3** · `mc_result` · nivell 2
- Paràmetres: a ∈ [1..5], b ∈ [a+1..9]; s múltiple d'a, s ∈ [−12..12] \ {0}; d = s(b − a)/a, d ≠ 0 i d ≠ −s.
- Enunciat: «Resol» a/x = b/(x + d)
- Correcta: x = s
- Distractors: x = d/(b − a) → `B1_DISTRIB_PARCIAL` *(de a·x + d = b·x)* · x = (b − a)/(a·d) → `B6_DESPEJA_MAL` · x = −s → `B6_TRANSPOSICIO_SIGNE`
- Explicació correcta: «Cada costat és una sola fracció: pots multiplicar en creu. a(x + d) = b·x → a·x + a·d = b·x → a·d = (b − a)x. Comprova que x ≠ 0 i x ≠ −d.»

**B6.T4** · `mc_result` · nivell 3
- Paràmetres: k ∈ [1..9], m ∈ [1..9].
- Enunciat: «Resol» (x + m)/(x − k) = (k + m)/(x − k)
- Correcta: «No té solució»
- Distractors: x = k → `B6_SOLUCIO_PROHIBIDA` · x = −k → `B6_TRANSPOSICIO_SIGNE` · «Qualsevol x és solució» → `B7_CONFON_IDENTITAT`
- Explicació correcta: «Multiplicant per (x − k): x + m = k + m → x = k. Però x = k anul·la el denominador, així que no és solució. L'equació no en té cap.»

**B6.T5** · `valid_step` · nivell 2
- Paràmetres: números petits; mostrar sempre l'equació inicial i la del pas.
- Pool:
  - x/3 + 2 = x/2 ⟹ (·6) **[vàlid]** 2x + 12 = 3x · **[invàlid]** 2x + 2 = 3x → `B6_MCM_PARCIAL`
  - x/2 − (x − 1)/3 = 1 ⟹ (·6) **[vàlid]** 3x − 2x + 2 = 6 · **[invàlid]** 3x − 2x − 2 = 6 → `B6_NUMERADOR_SENSE_PARENTESI`
  - 2/x + 1 = 3/4 ⟹ **[invàlid]** 2·4 = (x + 1)·3 → `B6_CREU_AMB_SUMES`
  - 3x = 12 ⟹ **[vàlid]** x = 4 · **[invàlid]** x = 9 → `B6_DESPEJA_MAL`
- Generalitzar amb paràmetres: denominadors {2, 3, 4, 6}, constants [1..9].

**B6.T6** · `find_error` · nivell 3
- Paràmetres: (a, b) ∈ {(2, 3), (3, 4), (2, 5), (4, 6)}; L = mcm(a, b). Cercar amb la llavor s ∈ [2..20], p ∈ [1..9] tals que s és múltiple d'a, (s − p) és múltiple de b i c = s/a − (s − p)/b és enter.
- Resolució de «Resol x/a − (x − p)/b = c»:
  1. (L/a)x − (L/b)(x − p) = L·c — *error possible:* … = c → `B6_MCM_PARCIAL`
  2. (L/a)x − (L/b)x + (L/b)p = L·c — *error possible:* − (L/b)p → `B6_NUMERADOR_SENSE_PARENTESI`
  3. (L/a − L/b)x = L·c − (L/b)p — *error possible:* + (L/b)p → `B6_TRANSPOSICIO_SIGNE`
  4. x = s — *error possible:* restar el coeficient en lloc de dividir → `B6_DESPEJA_MAL`

---

## B7 · Què es pot fer als dos costats d'una igualtat

**Regla d'or:** «Pots fer qualsevol operació si la fas als **dos** costats i amb **tots** els termes. Excepció: no divideixis per una expressió que pugui valer 0 (com x), perquè perds solucions. En lloc de dividir per x, treu factor comú.»

**Exemples (Aprèn):**
1. x² = 3x → x² − 3x = 0 → x(x − 3) = 0 → x = 0 o x = 3
2. 2x + 6 = 10 → (dividint els dos costats per 2) x + 3 = 5 → x = 2

| error_tag | Nom al panell | Explicació |
|---|---|---|
| `B7_DIVIDEIX_PER_X` | Dividir per x | Has dividit per x, i x podria valer 0: així perds la solució x = 0. Passa-ho tot a un costat i treu factor comú: x(x − 3) = 0. |
| `B7_SOLUCIO_INCOMPLETA` | Quedar-se amb una sola solució | Un producte val 0 si **qualsevol** dels factors val 0: x(x − k) = 0 té dues solucions, x = 0 i x = k. |
| `B7_ARREL_SENSE_PM` | Oblidar el ± | x² = 9 té dues solucions: x = 3 i x = −3. En treure l'arrel als dos costats, posa ±. |
| `B7_UN_SOL_TERME` | Dividir només un terme | Si divideixes un costat per 2, has de dividir-ne **tots** els termes: 2x + 4 = 6 → x + 2 = 3. |
| `B7_TATXA_X_SUMA` | Tatxar una x que suma | Als dos costats pots restar el mateix terme (x + 5 = 2x + 5 → x = 2x), però no pots «tatxar» una x que suma com si multipliqués. |
| `B7_QUADRAT_TERME_A_TERME` | Elevar al quadrat terme a terme | En elevar al quadrat, s'eleva **tot** el costat: (x − 3)² = x² − 6x + 9, no x² − 9. |
| `B7_NO_COMPROVA_ARRELS` | No comprovar les solucions | En elevar al quadrat poden aparèixer solucions falses. Comprova cada solució a l'equació **original**. |
| `B7_INVERS_SUMA` | Invers d'una suma | 1/x = 1/2 + 1/3 no vol dir x = 2 + 3. Primer suma les fraccions (5/6) i després inverteix: x = 6/5. |
| `B7_CONFON_IDENTITAT` | Sense solució o infinites | Si en simplificar queda una cosa falsa com 0 = 5, **no hi ha solució**. Si queda 0 = 0, **qualsevol x** és solució. Que surti un 0 no vol dir que x = 0. |

**B7.T1** · `mc_result` · nivell 1
- Paràmetres: k ∈ [2..9].
- Enunciat: «Resol» x² = k·x
- Correcta: x = 0 o x = k
- Distractors: x = k → `B7_DIVIDEIX_PER_X` · x = 0 → `B7_SOLUCIO_INCOMPLETA` · x = 0 o x = −k → `B6_TRANSPOSICIO_SIGNE`
- Explicació correcta: «x² − k·x = 0 → x(x − k) = 0. Un producte val 0 si algun factor val 0: x = 0 o x − k = 0.»

**B7.T2** · `mc_result` · nivell 2
- Paràmetres: k ∈ [2..9], p ∈ [−6..6] \ {0}, k > |p|, k² − p² no quadrat perfecte.
- Enunciat: «Resol» (x + p)² = k²
- Correcta: x = k − p o x = −k − p
- Distractors: x = k − p → `B7_ARREL_SENSE_PM` · x = ±√(k² − p²) → `B3_QUADRAT_SUMA` · x = p + k o x = p − k → `B6_TRANSPOSICIO_SIGNE`
- Explicació correcta: «Arrel als dos costats amb ±: x + p = ±k. Després passa el p restant: x = ±k − p.»

**B7.T3** · `valid_step` · nivell 1-2
- Paràmetres: números petits en cada plantilla del pool.
- Pool (vàlid = mateix conjunt de solucions):
  - 2x + 6 = 10 ⟹ **[vàlid]** x + 3 = 5 · **[invàlid]** x + 6 = 5 → `B7_UN_SOL_TERME`
  - x + 5 = 2x + 5 ⟹ **[vàlid]** x = 2x · **[invàlid]** 1 = 2 → `B7_TATXA_X_SUMA`
  - x² = 5x ⟹ **[invàlid]** x = 5 → `B7_DIVIDEIX_PER_X` · **[vàlid]** x(x − 5) = 0
  - 3(x − 2) = 3x ⟹ **[vàlid]** x − 2 = x *(els dos sense solució)*
  - x/4 = 3 ⟹ **[vàlid]** x = 12
  - x² = 16 ⟹ **[invàlid]** x = 4 → `B7_ARREL_SENSE_PM` · **[vàlid]** x = 4 o x = −4
  - 1/x = 1/2 + 1/3 ⟹ **[invàlid]** x = 5 → `B7_INVERS_SUMA` · **[vàlid]** x = 6/5
- Raons: ✓ una frase amb la propietat («He dividit tots els termes dels dos costats per 3») · dues amb tags del bloc.

**B7.T4** · `mc_result` · nivell 2
- Paràmetres: a ∈ [2..6], b, c ∈ [1..9]; variant v ∈ {«a·x + b = a·x + c» amb b ≠ c, «a(x + b) = a·x + a·b»}.
- Correcta: variant 1 → «No té solució» · variant 2 → «Qualsevol x és solució»
- Distractors: l'altra opció de les dues → `B7_CONFON_IDENTITAT` · x = 0 → `B7_CONFON_IDENTITAT` · x = c − b (variant 1) o x = b (variant 2) → `B7_TATXA_X_SUMA`
- Explicació correcta: «Resta a·x als dos costats. Si queda una igualtat falsa (b = c), no hi ha solució; si queda una de certa (0 = 0), qualsevol x la compleix.»

**B7.T5** · `next_step` · nivell 2
- Paràmetres: a ∈ [1..9], b ∈ [1..6].
- Enunciat: «Equació: √(x + a) = x − b. Quin és el pas següent correcte?»
- Correcta: x + a = (x − b)²
- Distractors: x + a = x² − b² → `B7_QUADRAT_TERME_A_TERME` · x + a = x² + b² → `B7_QUADRAT_TERME_A_TERME` · √x + √a = x − b → `B3_ARREL_SUMA`

**B7.T6** · `mc_result` · nivell 3
- Construcció: b ∈ [1..4], r₁ ∈ [b + 2..b + 6], r₂ = 2b + 1 − r₁ (així r₂ < b), a = b² − r₁·r₂.
  *(Llavors (x − b)² = x + a té arrels r₁ i r₂; r₁ compleix l'original i r₂ no, perquè r₂ − b < 0.)*
  Exemple: b = 1, r₁ = 3 → r₂ = 0, a = 1: √(x + 1) = x − 1.
- Enunciat: «Resol» √(x + a) = x − b
- Correcta: x = r₁
- Distractors: x = r₁ o x = r₂ → `B7_NO_COMPROVA_ARRELS` · x = r₂ → `B7_NO_COMPROVA_ARRELS` · «No té solució» → `B7_NO_COMPROVA_ARRELS` *(override: «Has descartat també la bona: comprova cada solució per separat.»)*
- Explicació correcta: «Elevant al quadrat surt x² − (2b + 1)x + (b² − a) = 0, amb solucions r₁ i r₂. Comprovant a l'original: r₁ funciona; r₂ fa que el costat dret sigui negatiu, i una arrel no pot ser negativa.»
- Verificació: substituir r₁ i r₂ a l'equació original i comprovar que només r₁ la compleix.

**B7.T7** · `find_error` · nivell 3
- Paràmetres: k ∈ [2..6].
- Resolució de «Resol x³ = k²·x»:
  1. x³ − k²·x = 0 — *error possible:* dividir per x → x² = k² → `B7_DIVIDEIX_PER_X`
  2. x(x² − k²) = 0
  3. x = 0 o x² = k²
  4. x = 0, x = k o x = −k — *error possible:* x = 0 o x = k → `B7_ARREL_SENSE_PM`

---

## Resum de cobertura

| Bloc | Plantilles | mc_result | valid_step | find_error | next_step | error_tags |
|---|---|---|---|---|---|---|
| B1 | 6 | 4 | 1 | 1 | — | 7 |
| B2 | 6 | 4 | 1 | 1 | — | 9 |
| B3 | 8 | 6 | 1 | 1 | — | 12 |
| B4 | 6 | 3 | 1 | 1 | 1 | 8 |
| B5 | 9 | 7 | 1 | 1 | — | 9 |
| B6 | 6 | 3 | 1 | 1 | 1 | 7 |
| B7 | 7 | 4 | 1 | 1 | 1 | 9 |

**Estado de implementación (2026-11-06):** los 7 bloques están implementados en
`packages/content-algebra/src/blocks/`. Las desviaciones respecto a este documento (B2.T4, B3.T4,
B3.T5, B4.T2/T2b, B4.T5, B7.T5, B7.T7) están listadas en `REGISTRO.md` S3 y pendientes de que Biel
las confirme (D22); entonces se corrige aquí.

## Plantilles afegides a la fase 4 (2026-11-06)

Proposades i implementades amb el mateix format. Textos a revisar per Biel (`texts/ca/`).

**B1.T7** · `next_step` · nivell 2 — Paràmetres: a, b, c, d ∈ [2..9], c ≠ d. Enunciat: «a − b(c − d). Quin és el pas següent correcte?» Correcta: a − (bc − bd). Distractors: a − bc − bd → `B1_SIGNE_PARCIAL` · a − bc + d → `B1_DISTRIB_PARCIAL` · (a − b)(c − d) → `B1_ORDRE_OPERACIONS`.

**B1.T8** · `find_error` · nivell 2 — Paràmetres: n ∈ [3..6], m, p ∈ [2..9]. Resolució de «Calcula −n² + m·p»: 1. −n² + mp (calculats) — *errors possibles:* n² + mp → `B1_QUADRAT_NEGATIU` · −2n + mp → `B1_QUADRAT_DOBLE` · (−n² + m)·p → `B1_ORDRE_OPERACIONS`; 2. resultat.

**B2.T7** · `next_step` · nivell 2 — Paràmetres: b, d ∈ [2..9], b ≠ d; a ∈ [1..b−1], c ∈ [1..d−1]; L = mcm(b, d). Enunciat: «a/b − c/d. Quin és el pas següent?» Correcta: (aL/b)/L − (cL/d)/L. Distractors: a/L − c/L → `B2_AMPLIFICA_NOMES_DENOMINADOR` · (a − c)/(b − d) → `B2_SUMA_DENOMINADORS` · ac/(bd) → `B2_OPERACIO_CONFOSA`.

**B2.T8** · `find_error` · nivell 2 — Paràmetres: k ∈ [2..5], b ∈ [2..9], a ∈ [1..b−1]. Resolució de «Calcula k − a/b»: 1. kb/b − a/b — *error:* k/b − a/b → `B2_ENTER_SENSE_DENOMINADOR`; 2. (kb − a)/b — *error:* (kb − a)/(2b) → `B2_SUMA_DENOMINADORS`; 3. simplificar (només si cal).

**B3.T9** · `next_step` · nivell 2 — Paràmetres: com B3.T1 més j ∈ [1..3]. Enunciat: «(k·xᵃ)ⁿ · xʲ. Quin és el pas següent?» Correcta: kⁿ·x^(an) · xʲ. Distractors: k·x^(an)·xʲ → `B3_COEF_NO_ELEVAT` · kⁿ·x^(a+n)·xʲ → `B3_POTENCIA_POTENCIA` · (kn)·x^(an)·xʲ → `B3_COEF_MULTIPLICAT`.

**B3.T10** · `find_error` · nivell 3 — Paràmetres: a, b ∈ [1..3], n ∈ [2..3], c ∈ [1..(a+b)n−1], descartant ab = a+b, (a+b)+n = (a+b)n i (a+b)n/c = (a+b)n − c. Resolució de «Simplifica (xᵃ·xᵇ)ⁿ / xᶜ»: 1. (x^(a+b))ⁿ/xᶜ — *error:* (x^(ab))ⁿ → `B3_PRODUCTE_EXPONENTS`; 2. x^((a+b)n)/xᶜ — *error:* x^(a+b+n) → `B3_POTENCIA_POTENCIA`; 3. x^((a+b)n − c) — *error:* x^((a+b)n / c) → `B3_QUOCIENT_EXPONENTS`.

**B4.T7** · `find_error` · nivell 3 — Paràmetres: g ∈ [2..5], k ∈ [2..6]. Resolució de «Factoritza completament g·x² − 2gk·x + gk²»: 1. g(x² − 2kx + k²) — *error:* g(x² − 2kx + k) → `B4_FACTOR_COMU_INCOMPLET` (el pas següent és la comprovació desenvolupant, coherent); 2. g(x − k)² — *error:* g(x − 2k)² → `B4_DOBLE_PRODUCTE`; 3. comprovació desenvolupant.

**B5.T10** · `next_step` · nivell 2 — Paràmetres: k ∈ [2..9]. Enunciat: «(x² + kx)/(x² − k²). Quin és el pas següent?» Correcta: x(x + k) / ((x + k)(x − k)). Distractors: x(x + kx)/… → `B4_FACTOR_COMU_INCOMPLET` · x(x + k)/(x − k)² → `B4_DIF_QUADRATS` · (x + k)/(x² − k²) → `B5_CANCELA_TERME`.

**B5.T11** · `find_error` · nivell 3 — Paràmetres: k ∈ [2..7]. Resolució de «Simplifica (kx + k²)/(x² + kx)»: 1. k(x + k) / (x(x + k)) — *error:* k(x + 1) al numerador → `B4_FACTOR_COMU_INCOMPLET` (i no es pot tatxar res); 2. k/x — *error:* (x + k)/x → `B5_FACTOR_ERRONI`.

**B6.T7** · `find_error` · nivell 2 — Paràmetres: a ∈ [2..6], c ∈ [1..5], p ∈ [1..9]. Resolució de «Resol (x + p)/a = c»: 1. x + p = ac — *error:* x + p = c → `B6_TREU_DENOMINADORS`; 2. x = ac − p — *error:* x = ac + p → `B6_TRANSPOSICIO_SIGNE`.

**B7.T8** · `find_error` · nivell 2 — Paràmetres: k ∈ [2..9]. Resolució de «Resol x² − k² = 0»: 1. (x + k)(x − k) = 0 — *error:* (x − k)² = 0 → `B4_DIF_QUADRATS`; 2. x = −k o x = k — *error:* x = k → `B7_SOLUCIO_INCOMPLETA`.
