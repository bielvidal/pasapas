import type { FindErrorDraft, McDraft, Template, ValidStepDraft } from "@pasapas/engine";
import { B4_TEXTS, fill } from "../../../texts/ca";
import { COMU } from "../../../texts/ca/comu";
import type { Machine } from "../../machine";
import { CLAIM_NO_FACTORITZA, optReason, optRF, optText, rfMachine } from "../../machine";
import { fmt, Poly, RF } from "../../math";
import {
  baseOf,
  coefStr,
  findErrorOptions,
  intExcept,
  mcd,
  pickVariant,
  type PoolEntry,
} from "../common";

const T = B4_TEXTS;
const I = COMU.instruccions;
const BLOCK = "B4";
const base = baseOf(BLOCK);
const L = fmt;
const lin = (a: number, b: number): Poly => Poly.linear(a, b);
const sq = (p: Poly) => p.pow(2);
const diff = (a: number, k: number) => Poly.from([-k * k, 0, a * a]); // a²x² − k²
const o = (id: string, p: Poly, latex: string, tag: string | null) =>
  optRF(id, RF.of(p), latex, tag);
const pw2 = (inner: string) => `(${inner})^{2}`;

// ── B4.T1 · (gp)x² + (gq)x = gx(px + q) ────────────────────────────────────
const T1: Template<Machine> = {
  id: "B4.T1",
  version: 1,
  block: BLOCK,
  type: "mc_result",
  level: 1,
  generate(rng): McDraft<Machine> {
    const g = rng.int(2, 5);
    const p = rng.int(1, 5);
    const q = intExcept(rng, 1, 6, (v) => mcd(p, v) !== 1);
    const prompt = Poly.from([0, g * q, g * p]);
    const gx = `${g}x`;
    const last =
      q === 1
        ? o("d", Poly.from([0, 0, g * p]), L.prod(gx, L.poly(lin(p, 0))), "B4_FACTOR_COMU_UN")
        : o(
            "d",
            Poly.from([0, 0, g * (p + q)]),
            `${g}x^{2}(${p} + ${q})`,
            "B4_FACTOR_COMU_EXPONENT",
          );
    return {
      type: "mc_result",
      ...base(1, I.factoritza),
      promptLatex: L.poly(prompt),
      promptMachine: rfMachine(RF.of(prompt)),
      explanationCorrect: fill(T["B4.T1"].explicacioCorrecta, { g, p, q, gp: g * p, gq: g * q }),
      options: [
        o("a", prompt, L.prod(gx, L.poly(lin(p, q))), null),
        o(
          "b",
          Poly.from([0, g * g * q, g * p]),
          L.prod(gx, L.poly(lin(p, g * q))),
          "B4_FACTOR_COMU_INCOMPLET",
        ),
        o("c", Poly.from([0, q, p]), L.prod("x", L.poly(lin(p, q))), "B4_FACTOR_COMU_INCOMPLET"),
        last,
      ],
    };
  },
};

// ── B4.T2 · a²x² − k² (nivell 1: a = 1; B4.T2b nivell 2: a ∈ [2..4]) ───────
function difQuadrats(id: string, level: 1 | 2): Template<Machine> {
  return {
    id,
    version: 1,
    block: BLOCK,
    type: "mc_result",
    level,
    generate(rng): McDraft<Machine> {
      const a = level === 1 ? 1 : rng.int(2, 4);
      const k = level === 1 ? rng.int(2, 9) : intExcept(rng, 1, 9, (v) => mcd(a, v) !== 1);
      const prompt = diff(a, k);
      const plus = L.poly(lin(a, k));
      const minus = L.poly(lin(a, -k));
      const last =
        level === 1
          ? optText("d", CLAIM_NO_FACTORITZA, COMU.opcions.noEsPotFactoritzar, "B4_NO_RECONEIX")
          : o(
              "d",
              diff(1, k).scale(a),
              L.prod(String(a), L.poly(lin(1, k)), L.poly(lin(1, -k))),
              "B3_COEF_NO_ELEVAT",
            );
      return {
        type: "mc_result",
        ...base(level, I.factoritza),
        promptLatex: L.poly(prompt),
        promptMachine: rfMachine(RF.of(prompt)),
        explanationCorrect: fill(T["B4.T2"].explicacioCorrecta, { a, k, a2: a * a, k2: k * k }),
        options: [
          o("a", prompt, L.prod(plus, minus), null),
          o("b", sq(lin(a, -k)), pw2(minus), "B4_DIF_QUADRATS"),
          o("c", sq(lin(a, k)), pw2(plus), "B4_DIF_QUADRATS"),
          last,
        ],
      };
    },
  };
}
const T2 = difQuadrats("B4.T2", 1);
const T2b = difQuadrats("B4.T2b", 2);

// ── B4.T3 · x² ± 2px + p² = (x ± p)² ───────────────────────────────────────
const T3: Template<Machine> = {
  id: "B4.T3",
  version: 1,
  block: BLOCK,
  type: "mc_result",
  level: 2,
  generate(rng): McDraft<Machine> {
    const p = rng.int(1, 8);
    const s = rng.pick([1, -1] as const);
    const prompt = sq(lin(1, s * p));
    return {
      type: "mc_result",
      ...base(2, I.factoritza),
      promptLatex: L.poly(prompt),
      promptMachine: rfMachine(RF.of(prompt)),
      explanationCorrect: fill(T["B4.T3"].explicacioCorrecta, {
        p,
        p2: p * p,
        dp: 2 * p,
        s: s === 1 ? "+" : "-",
      }),
      options: [
        o("a", prompt, pw2(L.poly(lin(1, s * p))), null),
        o("b", sq(lin(1, 2 * s * p)), pw2(L.poly(lin(1, 2 * s * p))), "B4_DOBLE_PRODUCTE"),
        o("c", diff(1, p), L.prod(L.poly(lin(1, p)), L.poly(lin(1, -p))), "B4_DIF_QUADRATS"),
        o("d", sq(lin(1, s * p * p)), pw2(L.poly(lin(1, s * p * p))), "B4_DOBLE_PRODUCTE"),
      ],
    };
  },
};

// ── B4.T4 · valid_step ─────────────────────────────────────────────────────
type Key = "sumaQuadrats" | "difQuadrats" | "oposats" | "factorComu";
function t4Pool(k: number, g: number): PoolEntry<Key>[] {
  const rf = (p: Poly) => rfMachine(RF.of(p));
  const plus = L.poly(lin(1, k));
  const minus = L.poly(lin(1, -k));
  return [
    {
      key: "sumaQuadrats",
      beforeLatex: L.poly(Poly.from([k * k, 0, 1])),
      before: rf(Poly.from([k * k, 0, 1])),
      variants: [{ afterLatex: pw2(plus), after: rf(sq(lin(1, k))), tag: "B4_SUMA_QUADRATS" }],
    },
    {
      key: "difQuadrats",
      beforeLatex: L.poly(diff(1, k)),
      before: rf(diff(1, k)),
      variants: [
        { afterLatex: L.prod(plus, minus), after: rf(diff(1, k)), tag: null },
        { afterLatex: pw2(minus), after: rf(sq(lin(1, -k))), tag: "B4_DIF_QUADRATS" },
      ],
    },
    {
      key: "oposats",
      beforeLatex: pw2(minus),
      before: rf(sq(lin(1, -k))),
      variants: [{ afterLatex: pw2(L.poly(lin(-1, k))), after: rf(sq(lin(-1, k))), tag: null }],
    },
    {
      key: "factorComu",
      beforeLatex: L.poly(Poly.from([0, g * k, g])),
      before: rf(Poly.from([0, g * k, g])),
      variants: [
        { afterLatex: L.prod(`${g}x`, plus), after: rf(Poly.from([0, g * k, g])), tag: null },
        {
          afterLatex: L.prod(`${g}x`, L.poly(lin(1, g * k))),
          after: rf(Poly.from([0, g * g * k, g])),
          tag: "B4_FACTOR_COMU_INCOMPLET",
        },
      ],
    },
  ];
}

const T4: Template<Machine> = {
  id: "B4.T4",
  version: 1,
  block: BLOCK,
  type: "valid_step",
  level: 2,
  generate(rng): ValidStepDraft<Machine> {
    const k = rng.int(2, 9);
    const g = rng.int(2, 5);
    const entry = rng.pick(t4Pool(k, g));
    const v = pickVariant(rng, entry);
    const valid = v.tag === null;
    const tx = T["B4.T4"];
    const P = tx.pool;
    const f = (s: string) => fill(s, { k, g, dk: 2 * k, k2: k * k, gk: g * k });
    let options;
    switch (entry.key) {
      case "sumaQuadrats":
        options = [
          optReason("a", f(P.sumaQuadrats.noValid), null),
          optReason("b", f(P.sumaQuadrats.siQuadrat), "B4_SUMA_QUADRATS"),
          optReason("c", f(P.sumaQuadrats.siDiferencia), "B4_DIF_QUADRATS"),
        ];
        break;
      case "difQuadrats":
        options = valid
          ? [
              optReason("a", f(P.difQuadrats.valid), null),
              optReason("b", f(P.difQuadrats.siQuadrat), "B4_DIF_QUADRATS"),
              optReason("c", f(P.difQuadrats.noEsPot), "B4_NO_RECONEIX"),
            ]
          : [
              optReason("a", f(P.difQuadrats.noValid), null),
              optReason("b", f(P.difQuadrats.siQuadrat), "B4_DIF_QUADRATS"),
              optReason("c", f(P.difQuadrats.noEsPot), "B4_NO_RECONEIX"),
            ];
        break;
      case "oposats":
        options = [
          optReason("a", f(P.oposats.valid), null),
          optReason("b", f(P.oposats.ordre), "B4_SIGNE_QUADRAT", P.oposats.ordreOverride),
          optReason("c", f(P.oposats.signe), "B4_SIGNE_QUADRAT"),
        ];
        break;
      case "factorComu":
        options = valid
          ? [
              optReason("a", f(P.factorComu.valid), null),
              optReason("b", f(P.factorComu.siTot), "B4_FACTOR_COMU_INCOMPLET"),
              optReason("c", f(P.factorComu.noX), "B4_FACTOR_COMU_EXPONENT"),
            ]
          : [
              optReason("a", f(P.factorComu.noValid), null),
              optReason("b", f(P.factorComu.siTot), "B4_FACTOR_COMU_INCOMPLET"),
              optReason("c", f(P.factorComu.noX), "B4_FACTOR_COMU_EXPONENT"),
            ];
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

// ── B4.T5 · find_error: g·x³ − g·k²·x ──────────────────────────────────────
const T5: Template<Machine> = {
  id: "B4.T5",
  version: 1,
  block: BLOCK,
  type: "find_error",
  level: 3,
  generate(rng): FindErrorDraft<Machine> {
    const roll = rng.next();
    // L'error de factor comú (g·k² dins) només continua de forma coherent si g·k² és un quadrat: g = 4.
    const g = roll >= 0.2 && roll < 0.6 ? 4 : rng.int(2, 5);
    const k = rng.int(2, 6);
    const prompt = Poly.from([0, -g * k * k, 0, g]);
    const step = (latex: string, p: Poly) => ({ latex, machine: rfMachine(RF.of(p)) });
    const gx = `${g}x`;
    const plus = L.poly(lin(1, k));
    const minus = L.poly(lin(1, -k));
    const s0 = step(L.prod(gx, L.poly(diff(1, k))), prompt);
    const s1 = step(L.prod(gx, plus, minus), prompt);
    let steps: (typeof s0)[];
    let errorIndex: number | null;
    let injectedTag: string | null;
    if (roll < 0.2) {
      steps = [s0, s1];
      errorIndex = null;
      injectedTag = null;
    } else if (roll < 0.6) {
      // gx(x² − g·k²) amb g = 4: x² − 4k² = (x + 2k)(x − 2k)
      const bad = Poly.from([0, -g * g * k * k, 0, g]);
      steps = [
        step(L.prod(gx, L.poly(diff(1, 2 * k))), bad),
        step(L.prod(gx, L.poly(lin(1, 2 * k)), L.poly(lin(1, -2 * k))), bad),
      ];
      errorIndex = 0;
      injectedTag = "B4_FACTOR_COMU_INCOMPLET";
    } else {
      steps = [s0, step(L.prod(gx, pw2(minus)), Poly.X.mul(sq(lin(1, -k))).scale(g))];
      errorIndex = 1;
      injectedTag = "B4_DIF_QUADRATS";
    }
    const tagForCorrectStep = (i: number) =>
      i === 0 ? "B4_FACTOR_COMU_EXPONENT" : "B4_NO_RECONEIX";
    const tx = T["B4.T5"];
    return {
      type: "find_error",
      ...base(3, I.onEsError),
      promptLatex: L.poly(prompt),
      promptMachine: rfMachine(RF.of(prompt)),
      explanationCorrect: fill(
        errorIndex === null ? tx.explicacioSenseError : tx.explicacioCorrecta,
        {
          g,
          k,
          k2: k * k,
          gk2: g * k * k,
        },
      ),
      steps,
      errorIndex,
      options: findErrorOptions(steps, errorIndex, injectedTag, tagForCorrectStep),
    };
  },
};

// ── B4.T6 · next_step: primer pas per factoritzar g·x² − g·k² ──────────────
const T6: Template<Machine> = {
  id: "B4.T6",
  version: 1,
  block: BLOCK,
  type: "next_step",
  level: 2,
  generate(rng): McDraft<Machine> {
    const g = rng.int(2, 5);
    const k = rng.int(2, 6);
    const prompt = diff(1, k).scale(g);
    const gs = coefStr(g);
    return {
      type: "next_step",
      ...base(2, I.primerPas),
      promptLatex: L.poly(prompt),
      promptMachine: rfMachine(RF.of(prompt)),
      explanationCorrect: fill(T["B4.T6"].explicacioCorrecta, { g, k, k2: k * k }),
      options: [
        o("a", prompt, `${gs}(${L.poly(diff(1, k))})`, null),
        o("b", sq(lin(1, -k)).scale(g), `${gs}${pw2(L.poly(lin(1, -k)))}`, "B4_DIF_QUADRATS"),
        o(
          "c",
          Poly.from([-g * g * k * k, 0, g]),
          `${gs}(${L.poly(Poly.from([-g * k * k, 0, 1]))})`,
          "B4_FACTOR_COMU_INCOMPLET",
        ),
        o(
          "d",
          Poly.from([0, -g * k * k, g]),
          L.prod(`${g}x`, L.poly(lin(1, -k * k))),
          "B4_FACTOR_COMU_EXPONENT",
        ),
      ],
    };
  },
};

export const B4_TEMPLATES: Template<Machine>[] = [T1, T2, T2b, T3, T4, T5, T6];
