import type { FindErrorDraft, McDraft, Template, ValidStepDraft } from "@pasapas/engine";
import { B3_TEXTS, fill } from "../../../texts/ca";
import { COMU } from "../../../texts/ca/comu";
import type { Machine } from "../../machine";
import { monoMachine, opt, optReason, optRF, rfMachine, sqrtMachine } from "../../machine";
import { fmt, Mono, Poly, Q, RF } from "../../math";
import { baseOf, findErrorOptions, intExcept, mcd, pickVariant, type PoolEntry } from "../common";

const T = B3_TEXTS;
const I = COMU.instruccions;
const BLOCK = "B3";
const base = baseOf(BLOCK);
const L = fmt;
const lin = (a: number, b: number): Poly => Poly.linear(a, b);
const mx = (coef: number | Q, e: number | Q): Mono => Mono.of(coef, { x: e });
/** Opció monomi (LaTeX automàtic). */
const optM = (id: string, m: Mono, tag: string | null, latex?: string) =>
  opt(id, monoMachine(m), latex ?? L.mono(m), tag);

// ── B3.T1 · (k·xᵃ)ⁿ ────────────────────────────────────────────────────────
const T1: Template<Machine> = {
  id: "B3.T1",
  version: 1,
  block: BLOCK,
  type: "mc_result",
  level: 1,
  generate(rng): McDraft<Machine> {
    let k = rng.int(2, 5);
    let a = rng.int(2, 4);
    let n = rng.int(2, 3);
    while (k ** n === k * n || a + n === a * n) {
      k = rng.int(2, 5);
      a = rng.int(2, 4);
      n = rng.int(2, 3);
    }
    const prompt = mx(k ** n, a * n);
    return {
      type: "mc_result",
      ...base(1, I.simplifica),
      promptLatex: `(${k}x^{${a}})^{${n}}`,
      promptMachine: monoMachine(prompt),
      explanationCorrect: fill(T["B3.T1"].explicacioCorrecta, { k, a, n, kn: k ** n, an: a * n }),
      options: [
        optM("a", prompt, null),
        optM("b", mx(k, a * n), "B3_COEF_NO_ELEVAT"),
        optM("c", mx(k ** n, a + n), "B3_POTENCIA_POTENCIA"),
        optM("d", mx(k * n, a * n), "B3_COEF_MULTIPLICAT"),
      ],
    };
  },
};

// ── B3.T2 · (xᵃ·xᵇ)/xᶜ ─────────────────────────────────────────────────────
const T2: Template<Machine> = {
  id: "B3.T2",
  version: 1,
  block: BLOCK,
  type: "mc_result",
  level: 1,
  generate(rng): McDraft<Machine> {
    const a = rng.int(2, 7);
    const b = rng.int(2, 7);
    const cc = intExcept(rng, 1, 5, (v) => a + b <= v);
    const prompt = mx(1, a + b - cc);
    return {
      type: "mc_result",
      ...base(1, I.simplifica),
      promptLatex: L.frac(`x^{${a}} \\cdot x^{${b}}`, `x^{${cc}}`),
      promptMachine: monoMachine(prompt),
      explanationCorrect: fill(T["B3.T2"].explicacioCorrecta, {
        a,
        b,
        c: cc,
        ab: a + b,
        r: a + b - cc,
      }),
      options: [
        optM("a", prompt, null),
        optM("b", mx(1, a * b - cc), "B3_PRODUCTE_EXPONENTS"),
        optM("c", mx(1, Q.of(a + b, cc)), "B3_QUOCIENT_EXPONENTS"),
        optM("d", mx(1, a + b + cc), "B3_QUOCIENT_EXPONENTS"),
      ],
    };
  },
};

// ── B3.T3 · (ax ± p)² ──────────────────────────────────────────────────────
const T3: Template<Machine> = {
  id: "B3.T3",
  version: 1,
  block: BLOCK,
  type: "mc_result",
  level: 2,
  generate(rng): McDraft<Machine> {
    const a = rng.int(2, 4);
    const p = rng.int(1, 7);
    const s = rng.pick([1, -1] as const);
    const prompt = RF.of(lin(a, s * p).pow(2));
    const P = (c2: number, c1: number, c0: number) => Poly.from([c0, c1, c2]);
    const o = (id: string, poly: Poly, tag: string | null) =>
      optRF(id, RF.of(poly), L.poly(poly), tag);
    const distractors =
      s === 1
        ? [
            o("b", P(a * a, 0, p * p), "B3_QUADRAT_SUMA"),
            o("c", P(a * a, a * p, p * p), "B4_DOBLE_PRODUCTE"),
            o("d", P(a, 2 * a * p, p * p), "B3_COEF_NO_ELEVAT"),
          ]
        : [
            o("b", P(a * a, 0, -p * p), "B3_QUADRAT_SUMA"),
            o("c", P(a * a, -2 * a * p, -p * p), "B4_SIGNE_QUADRAT"),
            o("d", P(a * a, -a * p, p * p), "B4_DOBLE_PRODUCTE"),
          ];
    return {
      type: "mc_result",
      ...base(2, I.desenvolupa),
      promptLatex: `(${L.poly(lin(a, s * p))})^{2}`,
      promptMachine: rfMachine(prompt),
      explanationCorrect: fill(T["B3.T3"].explicacioCorrecta, {
        a,
        p,
        s: s === 1 ? "+" : "-",
        a2: a * a,
        dp: 2 * a * p,
        p2: p * p,
      }),
      options: [o("a", prompt.num, null), ...distractors],
    };
  },
};

// ── B3.T4 · (a/b)⁻ⁿ (numèric) ──────────────────────────────────────────────
const T4: Template<Machine> = {
  id: "B3.T4",
  version: 1,
  block: BLOCK,
  type: "mc_result",
  level: 2,
  generate(rng): McDraft<Machine> {
    const a = rng.int(2, 5);
    const b = intExcept(rng, 2, 5, (v) => v === a || mcd(a, v) !== 1);
    const n = rng.int(1, 2);
    const correct = Q.of(b ** n, a ** n);
    const oq = (id: string, v: Q, tag: string | null) => optRF(id, RF.of(v), L.num(v), tag);
    return {
      type: "mc_result",
      ...base(2, I.calcula),
      promptLatex: `\\left(${L.frac(String(a), String(b))}\\right)^{-${n}}`,
      promptMachine: rfMachine(RF.of(correct)),
      explanationCorrect: fill(T["B3.T4"].explicacioCorrecta, { a, b, n, an: a ** n, bn: b ** n }),
      options: [
        oq("a", correct, null),
        oq("b", Q.of(-(a ** n), b ** n), "B3_EXP_NEGATIU"),
        oq("c", Q.of(-(b ** n), a ** n), "B3_EXP_NEGATIU"),
        n === 2
          ? oq("d", Q.of(b ** n, a), "B3_FRACCIO_POTENCIA")
          : oq("d", Q.of(a, b), "B3_EXP_NEGATIU"),
      ],
    };
  },
};

// ── B3.T5 · valid_step: pool de propietats ─────────────────────────────────
type Key =
  "quadratSuma" | "arrelSuma" | "arrelProducte" | "sumaPotencies" | "expFraccionari" | "expAbast";
function t5Pool(k: number): PoolEntry<Key>[] {
  const rf = (p: Poly | RF) => rfMachine(p instanceof RF ? p : RF.of(p));
  return [
    {
      key: "quadratSuma",
      beforeLatex: `(${L.poly(lin(1, k))})^{2}`,
      before: rf(lin(1, k).pow(2)),
      variants: [
        { afterLatex: L.poly(lin(1, k).pow(2)), after: rf(lin(1, k).pow(2)), tag: null },
        {
          afterLatex: L.poly(Poly.from([k * k, 0, 1])),
          after: rf(Poly.from([k * k, 0, 1])),
          tag: "B3_QUADRAT_SUMA",
        },
      ],
    },
    {
      key: "arrelSuma",
      beforeLatex: L.root(2, L.poly(Poly.from([k * k, 0, 1]))),
      before: sqrtMachine(Poly.from([k * k, 0, 1])),
      variants: [{ afterLatex: L.poly(lin(1, k)), after: rf(lin(1, k)), tag: "B3_ARREL_SUMA" }],
    },
    {
      key: "arrelProducte",
      beforeLatex: L.root(2, `${k * k}x^{2}`),
      before: sqrtMachine(Poly.from([0, 0, k * k])),
      variants: [{ afterLatex: `${k}x`, after: rf(lin(k, 0)), tag: null }],
    },
    {
      key: "sumaPotencies",
      beforeLatex: "x^{2} + x^{2}",
      before: rf(Poly.from([0, 0, 2])),
      variants: [
        { afterLatex: "2x^{2}", after: rf(Poly.from([0, 0, 2])), tag: null },
        { afterLatex: "x^{4}", after: rf(Poly.xPow(4)), tag: "B3_SUMA_POTENCIES" },
      ],
    },
    {
      key: "expFraccionari",
      beforeLatex: L.expo("x", Q.of(1, 2)),
      before: monoMachine(mx(1, Q.of(1, 2))),
      variants: [
        { afterLatex: L.root(2, "x"), after: monoMachine(mx(1, Q.of(1, 2))), tag: null },
        {
          afterLatex: L.frac("x", "2"),
          after: monoMachine(mx(Q.of(1, 2), 1)),
          tag: "B3_EXP_FRACCIONARI",
        },
      ],
    },
    {
      key: "expAbast",
      beforeLatex: `${k}x^{-1}`,
      before: rf(RF.of(k, Poly.X)),
      variants: [
        { afterLatex: L.frac(String(k), "x"), after: rf(RF.of(k, Poly.X)), tag: null },
        { afterLatex: L.frac("1", `${k}x`), after: rf(RF.of(1, lin(k, 0))), tag: "B3_EXP_ABAST" },
      ],
    },
  ];
}

const T5: Template<Machine> = {
  id: "B3.T5",
  version: 1,
  block: BLOCK,
  type: "valid_step",
  level: 2,
  generate(rng): ValidStepDraft<Machine> {
    const k = rng.int(2, 9);
    const entry = rng.pick(t5Pool(k));
    const v = pickVariant(rng, entry);
    const valid = v.tag === null;
    const tx = T["B3.T5"];
    const P = tx.pool;
    const f = (s: string) => fill(s, { k });
    const R = (correct: string, b: [string, string], c: [string, string]) => [
      optReason("a", f(correct), null),
      optReason("b", f(b[0]), b[1]),
      optReason("c", f(c[0]), c[1]),
    ];
    let options;
    switch (entry.key) {
      case "quadratSuma":
        options = valid
          ? R(
              P.quadratSuma.valid,
              [P.quadratSuma.termeATerme, "B3_QUADRAT_SUMA"],
              [P.quadratSuma.coefNo, "B3_COEF_NO_ELEVAT"],
            )
          : R(
              P.quadratSuma.noValid,
              [P.quadratSuma.termeATerme, "B3_QUADRAT_SUMA"],
              [P.quadratSuma.coefNo, "B3_COEF_NO_ELEVAT"],
            );
        break;
      case "arrelSuma":
        options = R(
          P.arrelSuma.noValid,
          [P.arrelSuma.termeATerme, "B3_ARREL_SUMA"],
          [P.arrelSuma.meitat, "B3_EXP_FRACCIONARI"],
        );
        break;
      case "arrelProducte":
        options = R(
          P.arrelProducte.valid,
          [P.arrelProducte.noSurt, "B3_ARREL_SUMA"],
          [P.arrelProducte.meitat, "B3_EXP_FRACCIONARI"],
        );
        break;
      case "sumaPotencies":
        options = valid
          ? R(
              P.sumaPotencies.valid,
              [P.sumaPotencies.sumaExp, "B3_SUMA_POTENCIES"],
              [P.sumaPotencies.noEsPot, "B3_SUMA_POTENCIES"],
            )
          : R(
              P.sumaPotencies.noValid,
              [P.sumaPotencies.sumaExp, "B3_SUMA_POTENCIES"],
              [P.sumaPotencies.noEsPot, "B3_SUMA_POTENCIES"],
            );
        break;
      case "expFraccionari":
        options = valid
          ? R(
              P.expFraccionari.valid,
              [P.expFraccionari.divideix, "B3_EXP_FRACCIONARI"],
              [P.expFraccionari.noExisteix, "B3_EXP_FRACCIONARI"],
            )
          : R(
              P.expFraccionari.noValid,
              [P.expFraccionari.divideix, "B3_EXP_FRACCIONARI"],
              [P.expFraccionari.noExisteix, "B3_EXP_FRACCIONARI"],
            );
        break;
      case "expAbast":
        options = valid
          ? R(
              P.expAbast.valid,
              [P.expAbast.tot, "B3_EXP_ABAST"],
              [P.expAbast.negatiu, "B3_EXP_NEGATIU"],
            )
          : R(
              P.expAbast.noValid,
              [P.expAbast.tot, "B3_EXP_ABAST"],
              [P.expAbast.negatiu, "B3_EXP_NEGATIU"],
            );
        break;
    }
    return {
      type: "valid_step",
      ...base(2, I.esValid),
      promptLatex: `${entry.beforeLatex} \\;\\Longrightarrow\\; ${v.afterLatex}`,
      explanationCorrect: valid ? tx.explicacioCorrectaValid : tx.explicacioCorrectaInvalid,
      step: {
        beforeLatex: entry.beforeLatex,
        afterLatex: v.afterLatex,
        beforeMachine: entry.before,
        afterMachine: v.after,
        valid,
        errorTag: v.tag,
      },
      options,
    };
  },
};

// ── B3.T6 · (xᵃyᵇ)ⁿ/(xᶜyᵈ) ─────────────────────────────────────────────────
const T6: Template<Machine> = {
  id: "B3.T6",
  version: 1,
  block: BLOCK,
  type: "mc_result",
  level: 3,
  generate(rng): McDraft<Machine> {
    const a = rng.int(1, 3);
    const b = rng.int(1, 3);
    const n = rng.int(2, 3);
    const cc = rng.int(1, a * n - 1);
    const d = rng.int(1, b * n - 1);
    const m = (ex: number | Q, ey: number | Q) => Mono.of(1, { x: ex, y: ey });
    const prompt = m(a * n - cc, b * n - d);
    return {
      type: "mc_result",
      ...base(3, I.simplifica),
      promptLatex: L.frac(`(x^{${a}} y^{${b}})^{${n}}`, `x^{${cc}} y^{${d}}`),
      promptMachine: monoMachine(prompt),
      explanationCorrect: fill(T["B3.T6"].explicacioCorrecta, {
        a,
        b,
        n,
        c: cc,
        d,
        an: a * n,
        bn: b * n,
      }),
      options: [
        optM("a", prompt, null),
        optM("b", m(a + n - cc, b + n - d), "B3_POTENCIA_POTENCIA"),
        optM("c", m(a * n - cc, b - d), "B3_EXP_ABAST"),
        optM("d", m(Q.of(a * n, cc), Q.of(b * n, d)), "B3_QUOCIENT_EXPONENTS"),
      ],
    };
  },
};

// ── B3.T7 · x^(m/n) com a arrel ────────────────────────────────────────────
const T7: Template<Machine> = {
  id: "B3.T7",
  version: 1,
  block: BLOCK,
  type: "mc_result",
  level: 2,
  generate(rng): McDraft<Machine> {
    const n = rng.int(2, 4);
    const m = intExcept(rng, 1, 5, (v) => v === n || mcd(v, n) !== 1);
    const prompt = mx(1, Q.of(m, n));
    const rootOf = (idx: number, e: number) =>
      idx === 1 ? L.expo("x", e) : L.root(idx, L.expo("x", e));
    return {
      type: "mc_result",
      ...base(2, I.escriuArrel),
      promptLatex: L.expo("x", Q.of(m, n)),
      promptMachine: monoMachine(prompt),
      explanationCorrect: fill(T["B3.T7"].explicacioCorrecta, { m, n }),
      options: [
        optM("a", prompt, null, rootOf(n, m)),
        optM("b", mx(1, Q.of(n, m)), "B3_EXP_FRACCIONARI", rootOf(m, n)),
        optM("c", mx(Q.of(1, n), m), "B3_EXP_FRACCIONARI", L.frac(L.expo("x", m), String(n))),
        optM("d", mx(1, m - n), "B3_EXP_FRACCIONARI"),
      ],
    };
  },
};

// ── B3.T8 · find_error: (k·xᵃ)ⁿ·xʲ / (d·xᶜ) ────────────────────────────────
const T8: Template<Machine> = {
  id: "B3.T8",
  version: 1,
  block: BLOCK,
  type: "find_error",
  level: 3,
  generate(rng): FindErrorDraft<Machine> {
    const k = rng.int(2, 3);
    const a = rng.int(2, 3);
    const n = 3;
    const j = rng.int(1, 2);
    const cc = rng.int(1, a * n + j - 1);
    const kn = k ** n;
    const d = rng.pick([1, k, k * k, kn].filter((v) => kn % v === 0));
    const coef = kn / d;
    const prompt = mx(coef, a * n + j - cc);
    const step = (latex: string, m: Mono) => ({ latex, machine: monoMachine(m) });
    const over = (num: string) => L.frac(num, `${d === 1 ? "" : d}x^{${cc}}`);
    const s0 = step(over(`${kn}x^{${a * n}} \\cdot x^{${j}}`), prompt);
    const s1 = step(over(`${kn}x^{${a * n + j}}`), prompt);
    const s2 = step(L.mono(prompt), prompt);
    const roll = rng.next();
    let steps: (typeof s0)[];
    let errorIndex: number | null;
    let injectedTag: string | null;
    if (roll < 0.2) {
      steps = [s0, s1, s2];
      errorIndex = null;
      injectedTag = null;
    } else if (roll < 0.4) {
      // No eleva el k: k·x^{an}·x^{j}/(d·x^{c})
      const v = mx(Q.of(k, d), a * n + j - cc);
      steps = [
        step(over(`${k}x^{${a * n}} \\cdot x^{${j}}`), v),
        step(over(`${k}x^{${a * n + j}}`), v),
        step(L.mono(v), v),
      ];
      errorIndex = 0;
      injectedTag = "B3_COEF_NO_ELEVAT";
    } else if (roll < 0.6) {
      // Suma exponents a la potència de potència: x^{a+n}
      const v = mx(coef, a + n + j - cc);
      steps = [
        step(over(`${kn}x^{${a + n}} \\cdot x^{${j}}`), v),
        step(over(`${kn}x^{${a + n + j}}`), v),
        step(L.mono(v), v),
      ];
      errorIndex = 0;
      injectedTag = "B3_POTENCIA_POTENCIA";
    } else if (roll < 0.8) {
      // Multiplica exponents al producte: x^{an·j}
      const v = mx(coef, a * n * j - cc);
      steps = [s0, step(over(`${kn}x^{${a * n * j}}`), v), step(L.mono(v), v)];
      errorIndex = 1;
      injectedTag = "B3_PRODUCTE_EXPONENTS";
    } else {
      // Divideix exponents al quocient: x^{(an+j)/c}
      const v = mx(coef, Q.of(a * n + j, cc));
      steps = [s0, s1, step(L.mono(v), v)];
      errorIndex = 2;
      injectedTag = "B3_QUOCIENT_EXPONENTS";
    }
    const tagForCorrectStep = (i: number) =>
      ["B3_COEF_NO_ELEVAT", "B3_PRODUCTE_EXPONENTS", "B3_QUOCIENT_EXPONENTS"][i]!;
    const tx = T["B3.T8"];
    return {
      type: "find_error",
      ...base(3, I.onEsError),
      promptLatex: L.frac(`(${k}x^{${a}})^{${n}} \\cdot x^{${j}}`, `${d === 1 ? "" : d}x^{${cc}}`),
      promptMachine: monoMachine(prompt),
      explanationCorrect: fill(
        errorIndex === null ? tx.explicacioSenseError : tx.explicacioCorrecta,
        {
          k,
          a,
          n,
          j,
          d,
          c: cc,
          kn,
          an: a * n,
          anj: a * n + j,
          r: a * n + j - cc,
          coef,
        },
      ),
      steps,
      errorIndex,
      options: findErrorOptions(steps, errorIndex, injectedTag, tagForCorrectStep),
    };
  },
};

// ── B3.T9 · next_step: (k·xᵃ)ⁿ · xʲ ────────────────────────────────────────
const T9: Template<Machine> = {
  id: "B3.T9",
  version: 1,
  block: BLOCK,
  type: "next_step",
  level: 2,
  generate(rng): McDraft<Machine> {
    let k = rng.int(2, 5);
    let a = rng.int(2, 4);
    let n = rng.int(2, 3);
    while (k ** n === k * n || a + n === a * n) {
      k = rng.int(2, 5);
      a = rng.int(2, 4);
      n = rng.int(2, 3);
    }
    const j = rng.int(1, 3);
    const prompt = mx(k ** n, a * n + j);
    const m = (coef: number, e: number) => mx(coef, e + j);
    const lat = (coef: number, e: number) => `${coef}x^{${e}} \\cdot x^{${j}}`;
    return {
      type: "next_step",
      ...base(2, I.quinPas),
      promptLatex: `(${k}x^{${a}})^{${n}} \\cdot x^{${j}}`,
      promptMachine: monoMachine(prompt),
      explanationCorrect: fill(T["B3.T9"].explicacioCorrecta, {
        k,
        a,
        n,
        j,
        kn: k ** n,
        an: a * n,
      }),
      options: [
        optM("a", m(k ** n, a * n), null, lat(k ** n, a * n)),
        optM("b", m(k, a * n), "B3_COEF_NO_ELEVAT", lat(k, a * n)),
        optM("c", m(k ** n, a + n), "B3_POTENCIA_POTENCIA", lat(k ** n, a + n)),
        optM("d", m(k * n, a * n), "B3_COEF_MULTIPLICAT", lat(k * n, a * n)),
      ],
    };
  },
};

// ── B3.T10 · find_error: (xᵃ·xᵇ)ⁿ / xᶜ ─────────────────────────────────────
const T10: Template<Machine> = {
  id: "B3.T10",
  version: 1,
  block: BLOCK,
  type: "find_error",
  level: 3,
  generate(rng): FindErrorDraft<Machine> {
    let a = 1;
    let b = 1;
    let n = 2;
    let cc = 1;
    // Cap «error» pot coincidir amb el valor correcte: a·b ≠ a+b, (a+b)+n ≠ (a+b)·n, (a+b)n/c ≠ (a+b)n − c.
    for (;;) {
      a = rng.int(1, 3);
      b = rng.int(1, 3);
      n = rng.int(2, 3);
      cc = rng.int(1, (a + b) * n - 1);
      const e = (a + b) * n;
      if (a * b !== a + b && a + b + n !== e && e !== (e - cc) * cc) break;
    }
    const prompt = mx(1, (a + b) * n - cc);
    const step = (latex: string, m: Mono) => ({ latex, machine: monoMachine(m) });
    const over = (num: string) => L.frac(num, L.expo("x", cc));
    const s0 = step(over(`(${L.expo("x", a + b)})^{${n}}`), prompt);
    const s1 = step(over(L.expo("x", (a + b) * n)), prompt);
    const s2 = step(L.mono(prompt), prompt);
    const roll = rng.next();
    let steps: (typeof s0)[];
    let errorIndex: number | null;
    let injectedTag: string | null;
    if (roll < 0.2) {
      steps = [s0, s1, s2];
      errorIndex = null;
      injectedTag = null;
    } else if (roll < 0.47) {
      const v = mx(1, a * b * n - cc);
      steps = [
        step(over(`(x^{${a * b}})^{${n}}`), v),
        step(over(`x^{${a * b * n}}`), v),
        step(L.mono(v), v),
      ];
      errorIndex = 0;
      injectedTag = "B3_PRODUCTE_EXPONENTS";
    } else if (roll < 0.74) {
      const v = mx(1, a + b + n - cc);
      steps = [s0, step(over(L.expo("x", a + b + n)), v), step(L.mono(v), v)];
      errorIndex = 1;
      injectedTag = "B3_POTENCIA_POTENCIA";
    } else {
      const v = mx(1, Q.of((a + b) * n, cc));
      steps = [s0, s1, step(L.mono(v), v)];
      errorIndex = 2;
      injectedTag = "B3_QUOCIENT_EXPONENTS";
    }
    const tx = T["B3.T10"];
    return {
      type: "find_error",
      ...base(3, I.onEsError),
      promptLatex: L.frac(`(${L.expo("x", a)} \\cdot ${L.expo("x", b)})^{${n}}`, L.expo("x", cc)),
      promptMachine: monoMachine(prompt),
      explanationCorrect: fill(
        errorIndex === null ? tx.explicacioSenseError : tx.explicacioCorrecta,
        {
          a,
          b,
          n,
          c: cc,
          ab: a + b,
          abn: (a + b) * n,
          r: (a + b) * n - cc,
        },
      ),
      steps,
      errorIndex,
      options: findErrorOptions(
        steps,
        errorIndex,
        injectedTag,
        (i) => ["B3_PRODUCTE_EXPONENTS", "B3_POTENCIA_POTENCIA", "B3_QUOCIENT_EXPONENTS"][i]!,
      ),
    };
  },
};

export const B3_TEMPLATES: Template<Machine>[] = [T1, T2, T3, T4, T5, T6, T7, T8, T9, T10];
