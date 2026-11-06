import type {
  FindErrorDraft,
  ItemDraft,
  McDraft,
  Rng,
  Template,
  ValidStepDraft,
} from "@pasapas/engine";
import { B5_TEXTS, fill } from "../../../texts/ca";
import { fmt, Poly, Q, RF } from "../../math";
import type { AlgOption, Machine } from "../../machine";
import { optNoSimplifica, optReason, optRF, rfMachine } from "../../machine";
import { findErrorOptions } from "../common";

const T = B5_TEXTS;
const BLOCK = "B5";
const X = RF.X;
const c = (v: number | Q): RF => RF.of(v);
const lin = (a: number, b: number): Poly => Poly.linear(a, b); // a·x + b
const L = fmt;

/** Nombre enter diferent d'un altre, dins d'un interval. */
function intExcept(rng: Rng, min: number, max: number, except: number): number {
  let v = rng.int(min, max);
  while (v === except) v = rng.int(min, max);
  return v;
}

const base = (level: 1 | 2 | 3, instruction: string) => ({ block: BLOCK, level, instruction });

// ── B5.T1 · (kx + km)/k ────────────────────────────────────────────────────
const T1: Template<Machine> = {
  id: "B5.T1",
  version: 1,
  block: BLOCK,
  type: "mc_result",
  level: 1,
  generate(rng): McDraft<Machine> {
    const k = rng.int(2, 6);
    const m = intExcept(rng, 1, 9, k);
    const numP = lin(k, k * m);
    const prompt = RF.of(numP, k);
    return {
      type: "mc_result",
      ...base(1, T.instruccions.simplifica),
      promptLatex: L.frac(L.poly(numP), String(k)),
      promptMachine: rfMachine(prompt),
      explanationCorrect: fill(T.plantilles["B5.T1"].explicacioCorrecta, { k, m }),
      options: [
        optRF("a", X.add(c(m)), L.poly(lin(1, m)), null),
        optRF("b", X.add(c(k * m)), L.poly(lin(1, k * m)), "B5_NUMERO_PARCIAL"),
        optRF("c", RF.of(lin(k, m)), L.poly(lin(k, m)), "B5_NUMERO_PARCIAL"),
        optNoSimplifica("d", T.opcions.noEsPotSimplificar, "B5_NO_FACTORITZA"),
      ],
    };
  },
};

// ── B5.T2 · (x + a)/(x + b): no es pot simplificar ─────────────────────────
const T2: Template<Machine> = {
  id: "B5.T2",
  version: 1,
  block: BLOCK,
  type: "mc_result",
  level: 1,
  generate(rng): McDraft<Machine> {
    const a = rng.int(1, 9);
    const b = intExcept(rng, 1, 9, a);
    const prompt = RF.of(lin(1, a), lin(1, b));
    return {
      type: "mc_result",
      ...base(1, T.instruccions.simplifica),
      promptLatex: L.frac(L.poly(lin(1, a)), L.poly(lin(1, b))),
      promptMachine: rfMachine(prompt),
      explanationCorrect: T.plantilles["B5.T2"].explicacioCorrecta,
      options: [
        optNoSimplifica("a", T.opcions.noEsPotSimplificar, null),
        optRF("b", c(Q.of(a, b)), L.num(Q.of(a, b)), "B5_CANCELA_TERMES_SEMBLANTS"),
        optRF(
          "c",
          c(Q.of(a + b, b)),
          L.plus("1", L.num(Q.of(a, b))),
          "B5_CANCELA_TERMES_SEMBLANTS",
        ),
        optRF("d", RF.of(a, lin(1, b)), L.frac(String(a), L.poly(lin(1, b))), "B5_CANCELA_TERME"),
      ],
    };
  },
};

// ── B5.T3 · (x² − k²)/(x ∓ k) ──────────────────────────────────────────────
const T3: Template<Machine> = {
  id: "B5.T3",
  version: 1,
  block: BLOCK,
  type: "mc_result",
  level: 2,
  generate(rng): McDraft<Machine> {
    const k = rng.int(2, 9);
    const s = rng.pick([1, -1] as const); // denominador x − s·k
    const numP = Poly.from([-k * k, 0, 1]);
    const denP = lin(1, -s * k);
    const prompt = RF.of(numP, denP);
    const correctP = lin(1, s * k); // x + s·k
    const wrongP = lin(1, -s * k); // x − s·k (el factor equivocat)
    const termeP = Poly.from([-s * k, 0, 1]); // x² − s·k
    return {
      type: "mc_result",
      ...base(2, T.instruccions.simplifica),
      promptLatex: L.frac(L.poly(numP), L.poly(denP)),
      promptMachine: rfMachine(prompt),
      explanationCorrect: fill(T.plantilles["B5.T3"].explicacioCorrecta, {
        k,
        k2: k * k,
        arrel: s * k,
      }),
      options: [
        optRF("a", RF.of(correctP), L.poly(correctP), null),
        optRF("b", RF.of(wrongP), L.poly(wrongP), "B5_FACTOR_ERRONI"),
        optRF("c", RF.of(termeP), L.poly(termeP), "B5_CANCELA_TERME"),
        optNoSimplifica("d", T.opcions.noEsPotSimplificar, "B5_NO_FACTORITZA"),
      ],
    };
  },
};

// ── B5.T4 · (x² + bx)/x ────────────────────────────────────────────────────
const T4: Template<Machine> = {
  id: "B5.T4",
  version: 1,
  block: BLOCK,
  type: "mc_result",
  level: 2,
  generate(rng): McDraft<Machine> {
    const b = rng.int(2, 9);
    const numP = Poly.from([0, b, 1]);
    const prompt = RF.of(numP, Poly.X);
    return {
      type: "mc_result",
      ...base(2, T.instruccions.simplifica),
      promptLatex: L.frac(L.poly(numP), "x"),
      promptMachine: rfMachine(prompt),
      explanationCorrect: fill(T.plantilles["B5.T4"].explicacioCorrecta, { b }),
      options: [
        optRF("a", RF.of(lin(1, b)), L.poly(lin(1, b)), null),
        optRF(
          "b",
          RF.of(Poly.from([b, 0, 1])),
          L.poly(Poly.from([b, 0, 1])),
          "B5_CANCELA_EXPONENT",
        ),
        optRF("c", RF.of(lin(1 + b, 0)), `x + ${b}x`, "B5_CANCELA_EXPONENT"),
        optNoSimplifica("d", T.opcions.noEsPotSimplificar, "B5_NO_FACTORITZA"),
      ],
    };
  },
};

// ── B5.T5 · (a − x)/(x − a) = −1 ───────────────────────────────────────────
const T5: Template<Machine> = {
  id: "B5.T5",
  version: 1,
  block: BLOCK,
  type: "mc_result",
  level: 2,
  generate(rng): McDraft<Machine> {
    const a = rng.int(1, 9);
    const numP = lin(-1, a);
    const denP = lin(1, -a);
    const prompt = RF.of(numP, denP);
    return {
      type: "mc_result",
      ...base(2, T.instruccions.simplifica),
      promptLatex: L.frac(L.poly(numP), L.poly(denP)),
      promptMachine: rfMachine(prompt),
      explanationCorrect: fill(T.plantilles["B5.T5"].explicacioCorrecta, { a }),
      options: [
        optRF("a", c(-1), "-1", null),
        optRF("b", c(1), "1", "B5_SIGNE_OPOSAT"),
        optRF("c", c(0), "0", "B5_SIGNE_OPOSAT"),
        optNoSimplifica("d", T.opcions.noEsPotSimplificar, "B5_NO_FACTORITZA"),
      ],
    };
  },
};

// ── B5.T6 · valid_step: pool de passos vàlids i invàlids ───────────────────
interface StepVariant {
  afterLatex: string;
  after: RF;
  /** null ⇒ pas vàlid. */
  tag: string | null;
}
interface PoolEntry {
  beforeLatex: string;
  before: RF;
  variants: StepVariant[];
}

function t6Pool(cc: number, d: number): PoolEntry[] {
  return [
    {
      // (x + c)/c
      beforeLatex: L.frac(L.poly(lin(1, cc)), String(cc)),
      before: RF.of(lin(1, cc), cc),
      variants: [
        { afterLatex: "x", after: X, tag: "B5_CANCELA_TERME" },
        {
          afterLatex: L.plus(L.frac("x", String(cc)), "1"),
          after: RF.of(Poly.X, cc).add(c(1)),
          tag: null,
        },
      ],
    },
    {
      // (cx)/c
      beforeLatex: L.frac(`${cc}x`, String(cc)),
      before: RF.of(lin(cc, 0), cc),
      variants: [{ afterLatex: "x", after: X, tag: null }],
    },
    {
      // (x + c)/(x + d)
      beforeLatex: L.frac(L.poly(lin(1, cc)), L.poly(lin(1, d))),
      before: RF.of(lin(1, cc), lin(1, d)),
      variants: [
        {
          afterLatex: L.num(Q.of(cc, d)),
          after: c(Q.of(cc, d)),
          tag: "B5_CANCELA_TERMES_SEMBLANTS",
        },
      ],
    },
    {
      // x(x + c)/x
      beforeLatex: L.frac(L.prod("x", L.poly(lin(1, cc))), "x"),
      before: RF.of(Poly.X.mul(lin(1, cc)), Poly.X),
      variants: [{ afterLatex: L.poly(lin(1, cc)), after: X.add(c(cc)), tag: null }],
    },
    {
      // (x² + c)/x
      beforeLatex: L.frac(L.poly(Poly.from([cc, 0, 1])), "x"),
      before: RF.of(Poly.from([cc, 0, 1]), Poly.X),
      variants: [
        { afterLatex: L.poly(lin(1, cc)), after: X.add(c(cc)), tag: "B5_CANCELA_EXPONENT" },
        {
          afterLatex: L.plus("x", L.frac(String(cc), "x")),
          after: X.add(RF.of(cc, Poly.X)),
          tag: null,
        },
      ],
    },
    {
      // (2x + 2c)/2
      beforeLatex: L.frac(L.poly(lin(2, 2 * cc)), "2"),
      before: RF.of(lin(2, 2 * cc), 2),
      variants: [
        { afterLatex: L.poly(lin(1, cc)), after: X.add(c(cc)), tag: null },
        { afterLatex: L.poly(lin(1, 2 * cc)), after: X.add(c(2 * cc)), tag: "B5_NUMERO_PARCIAL" },
      ],
    },
  ];
}

const T6: Template<Machine> = {
  id: "B5.T6",
  version: 1,
  block: BLOCK,
  type: "valid_step",
  level: 1,
  generate(rng): ValidStepDraft<Machine> {
    const cc = rng.int(2, 9);
    const d = intExcept(rng, 2, 9, cc);
    const entry = rng.pick(t6Pool(cc, d));
    const valids = entry.variants.filter((v) => v.tag === null);
    const invalids = entry.variants.filter((v) => v.tag !== null);
    const pool =
      valids.length && invalids.length ? (rng.chance(0.5) ? valids : invalids) : entry.variants;
    const v = rng.pick(pool);
    const valid = v.tag === null;
    const tx = T.plantilles["B5.T6"];
    const options = valid
      ? [
          optReason("a", tx.raonsValid.correcta, null),
          optReason("b", tx.raonsValid.noTatxaX, "B5_NO_TATXA_FACTOR"),
          optReason("c", tx.raonsValid.noTatxaNomesNumeros, "B5_NO_TATXA_FACTOR"),
        ]
      : [
          optReason("a", tx.raonsInvalid.correcta, null),
          optReason("b", tx.raonsInvalid.xAmbX, "B5_CANCELA_TERME"),
          optReason("c", tx.raonsInvalid.numerosSempre, "B5_NUMERO_PARCIAL"),
        ];
    return {
      type: "valid_step",
      ...base(1, T.instruccions.esValid),
      promptLatex: `${entry.beforeLatex} \\;\\Longrightarrow\\; ${v.afterLatex}`,
      explanationCorrect: valid ? tx.explicacioCorrectaValid : tx.explicacioCorrectaInvalid,
      step: {
        beforeLatex: entry.beforeLatex,
        afterLatex: v.afterLatex,
        beforeMachine: rfMachine(entry.before),
        afterMachine: rfMachine(v.after),
        valid,
        errorTag: v.tag,
      },
      options,
    };
  },
};

// ── B5.T7 · (x² − 2px + p²)/(x² − p²) ──────────────────────────────────────
const T7: Template<Machine> = {
  id: "B5.T7",
  version: 1,
  block: BLOCK,
  type: "mc_result",
  level: 3,
  generate(rng): McDraft<Machine> {
    const p = rng.int(1, 8);
    const numP = lin(1, -p).pow(2);
    const denP = Poly.from([-p * p, 0, 1]);
    const prompt = RF.of(numP, denP);
    const minus = L.poly(lin(1, -p));
    const plus = L.poly(lin(1, p));
    return {
      type: "mc_result",
      ...base(3, T.instruccions.simplifica),
      promptLatex: L.frac(L.poly(numP), L.poly(denP)),
      promptMachine: rfMachine(prompt),
      explanationCorrect: fill(T.plantilles["B5.T7"].explicacioCorrecta, { p }),
      options: [
        optRF("a", RF.of(lin(1, -p), lin(1, p)), L.frac(minus, plus), null),
        optRF("b", c(1), "1", "B4_DIF_QUADRATS"),
        optRF("c", RF.of(lin(1, p), lin(1, -p)), L.frac(plus, minus), "B5_FACTOR_ERRONI"),
        optNoSimplifica("d", T.opcions.noEsPotSimplificar, "B5_NO_FACTORITZA"),
      ],
    };
  },
};

// ── B5.T8 · 1/x + 1/(x + k) ────────────────────────────────────────────────
const T8: Template<Machine> = {
  id: "B5.T8",
  version: 1,
  block: BLOCK,
  type: "mc_result",
  level: 2,
  generate(rng): McDraft<Machine> {
    const k = rng.int(1, 9);
    const xk = lin(1, k);
    const prompt = X.inv().add(RF.of(1, xk));
    const denLatex = L.prod("x", L.poly(xk));
    const num2xk = L.poly(lin(2, k));
    return {
      type: "mc_result",
      ...base(2, T.instruccions.calcula),
      promptLatex: `${L.frac("1", "x")} + ${L.frac("1", L.poly(xk))}`,
      promptMachine: rfMachine(prompt),
      explanationCorrect: fill(T.plantilles["B5.T8"].explicacioCorrecta, { k }),
      options: [
        optRF("a", RF.of(lin(2, k), Poly.X.mul(xk)), L.frac(num2xk, denLatex), null),
        optRF("b", RF.of(2, lin(2, k)), L.frac("2", num2xk), "B5_SUMA_FRACCIONS"),
        optRF(
          "c",
          RF.of(2, Poly.X.mul(xk)),
          L.frac("2", denLatex),
          "B2_AMPLIFICA_NOMES_DENOMINADOR",
        ),
        optRF("d", RF.of(lin(2, k), xk), L.frac(num2xk, L.poly(xk)), "B5_SUMA_FRACCIONS"),
      ],
    };
  },
};

// ── B5.T9 · find_error: (x² − k²)/(x² + kx) ────────────────────────────────
const T9: Template<Machine> = {
  id: "B5.T9",
  version: 1,
  block: BLOCK,
  type: "find_error",
  level: 3,
  generate(rng): FindErrorDraft<Machine> {
    const k = rng.int(2, 7);
    const numP = Poly.from([-k * k, 0, 1]);
    const denP = Poly.from([0, k, 1]);
    const prompt = RF.of(numP, denP);
    const xpk = lin(1, k);
    const xmk = lin(1, -k);
    const facNum = L.prod(L.poly(xpk), L.poly(xmk));
    const step0ok = { latex: L.frac(facNum, L.prod("x", L.poly(xpk))), machine: rfMachine(prompt) };
    const step1ok = { latex: L.frac(L.poly(xmk), "x"), machine: rfMachine(RF.of(xmk, Poly.X)) };
    const tx = T.plantilles["B5.T9"];
    const roll = rng.next();
    let steps: (typeof step0ok)[];
    let errorIndex: number | null;
    let injectedTag: string | null;
    if (roll < 0.2) {
      steps = [step0ok, step1ok];
      errorIndex = null;
      injectedTag = null;
    } else if (roll < 0.6) {
      // Error a la factorització del denominador: x² + kx = x(x + kx)
      const badDen = Poly.X.mul(lin(1 + k, 0)); // x·(x + kx) = (1+k)x²
      const bad = RF.of(numP, badDen);
      steps = [
        { latex: L.frac(facNum, L.prod("x", `x + ${k}x`)), machine: rfMachine(bad) },
        { latex: L.frac(facNum, `${1 + k}x^{2}`), machine: rfMachine(bad) },
      ];
      errorIndex = 0;
      injectedTag = "B4_FACTOR_COMU_INCOMPLET";
    } else {
      // Pas final de més: (x − k)/x = −k (tatxa una x que resta)
      steps = [step0ok, step1ok, { latex: String(-k), machine: rfMachine(c(-k)) }];
      errorIndex = 2;
      injectedTag = "B5_CANCELA_TERME";
    }
    // Tag per a «marcar com a erroni un pas correcte»: segons què fa aquell pas.
    const tagForCorrectStep = (i: number): string => {
      if (errorIndex === 0) return "B4_FACTOR_COMU_INCOMPLET"; // ha vist que el denominador és sospitós però no on
      return i === 0 ? "B4_NO_RECONEIX" : "B5_NO_TATXA_FACTOR";
    };
    const options: AlgOption[] = steps.map((s, i) => ({
      id: `step:${i}`,
      latex: s.latex,
      correct: i === errorIndex,
      errorTag: i === errorIndex ? null : tagForCorrectStep(i),
      key: `step:${i}`,
    }));
    options.push({
      id: "none",
      latex: "",
      text: T.opcions.totsCorrectes,
      correct: errorIndex === null,
      errorTag: errorIndex === null ? null : injectedTag,
      key: "none",
    });
    return {
      type: "find_error",
      ...base(3, T.instruccions.onEsError),
      promptLatex: L.frac(L.poly(numP), L.poly(denP)),
      promptMachine: rfMachine(prompt),
      explanationCorrect: fill(
        errorIndex === null ? tx.explicacioSenseError : tx.explicacioCorrecta,
        { k, k2: k * k },
      ),
      steps,
      errorIndex,
      options,
    };
  },
};

// ── B5.T10 · next_step: primer pas per simplificar (x² + kx)/(x² − k²) ──────
const T10: Template<Machine> = {
  id: "B5.T10",
  version: 1,
  block: BLOCK,
  type: "next_step",
  level: 2,
  generate(rng): McDraft<Machine> {
    const k = rng.int(2, 9);
    const numP = Poly.from([0, k, 1]);
    const denP = Poly.from([-k * k, 0, 1]);
    const prompt = RF.of(numP, denP);
    const xpk = L.poly(lin(1, k));
    const xmk = L.poly(lin(1, -k));
    return {
      type: "next_step",
      ...base(2, T.instruccions.quinPas),
      promptLatex: L.frac(L.poly(numP), L.poly(denP)),
      promptMachine: rfMachine(prompt),
      explanationCorrect: fill(T.plantilles["B5.T10"].explicacioCorrecta, { k, k2: k * k }),
      options: [
        optRF("a", prompt, L.frac(L.prod("x", xpk), L.prod(xpk, xmk)), null),
        optRF(
          "b",
          RF.of(Poly.X.mul(lin(1 + k, 0)), denP),
          L.frac(L.prod("x", `x + ${k}x`), L.prod(xpk, xmk)),
          "B4_FACTOR_COMU_INCOMPLET",
        ),
        optRF(
          "c",
          RF.of(numP, lin(1, -k).pow(2)),
          L.frac(L.prod("x", xpk), `(${xmk})^{2}`),
          "B4_DIF_QUADRATS",
        ),
        optRF("d", RF.of(lin(1, k), denP), L.frac(xpk, L.poly(denP)), "B5_CANCELA_TERME"),
      ],
    };
  },
};

// ── B5.T11 · find_error: (kx + k²)/(x² + kx) ────────────────────────────────
const T11: Template<Machine> = {
  id: "B5.T11",
  version: 1,
  block: BLOCK,
  type: "find_error",
  level: 3,
  generate(rng): FindErrorDraft<Machine> {
    const k = rng.int(2, 7);
    const numP = lin(k, k * k);
    const denP = Poly.from([0, k, 1]);
    const prompt = RF.of(numP, denP);
    const xpk = L.poly(lin(1, k));
    const step = (latex: string, rf: RF) => ({ latex, machine: rfMachine(rf) });
    const s0 = step(L.frac(L.prod(String(k), xpk), L.prod("x", xpk)), prompt);
    const s1 = step(L.frac(String(k), "x"), RF.of(k, Poly.X));
    const roll = rng.next();
    let steps: (typeof s0)[];
    let errorIndex: number | null;
    let injectedTag: string | null;
    if (roll < 0.2) {
      steps = [s0, s1];
      errorIndex = null;
      injectedTag = null;
    } else if (roll < 0.6) {
      // Factor comú mal dividit al numerador: k(x + 1); després ja no es pot tatxar res
      const bad = RF.of(lin(k, k), denP);
      steps = [
        step(L.frac(L.prod(String(k), L.poly(lin(1, 1))), L.prod("x", xpk)), bad),
        step(L.frac(L.poly(lin(k, k)), L.prod("x", xpk)), bad),
      ];
      errorIndex = 0;
      injectedTag = "B4_FACTOR_COMU_INCOMPLET";
    } else {
      // Tatxa el factor equivocat: queda (x + k)/x
      steps = [s0, step(L.frac(xpk, "x"), RF.of(lin(1, k), Poly.X))];
      errorIndex = 1;
      injectedTag = "B5_FACTOR_ERRONI";
    }
    const tx = T.plantilles["B5.T11"];
    return {
      type: "find_error",
      ...base(3, T.instruccions.onEsError),
      promptLatex: L.frac(L.poly(numP), L.poly(denP)),
      promptMachine: rfMachine(prompt),
      explanationCorrect: fill(
        errorIndex === null ? tx.explicacioSenseError : tx.explicacioCorrecta,
        { k, k2: k * k },
      ),
      steps,
      errorIndex,
      options: findErrorOptions(steps, errorIndex, injectedTag, (i) =>
        i === 0 ? "B5_NO_FACTORITZA" : "B5_NO_TATXA_FACTOR",
      ),
    };
  },
};

export const B5_TEMPLATES: Template<Machine>[] = [T1, T2, T3, T4, T5, T6, T7, T8, T9, T10, T11];

export type { ItemDraft };
