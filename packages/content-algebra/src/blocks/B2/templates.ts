import type { FindErrorDraft, McDraft, Template, ValidStepDraft } from "@pasapas/engine";
import { B2_TEXTS, fill } from "../../../texts/ca";
import { COMU } from "../../../texts/ca/comu";
import type { Machine } from "../../machine";
import { optReason, optRF, rfMachine } from "../../machine";
import { fmt, Q, RF } from "../../math";
import {
  baseOf,
  findErrorOptions,
  intExcept,
  mcd,
  mcm,
  pickVariant,
  type PoolEntry,
} from "../common";

const T = B2_TEXTS;
const I = COMU.instruccions;
const BLOCK = "B2";
const base = baseOf(BLOCK);
const L = fmt;
const q = (n: number, d = 1): Q => Q.of(n, d);
const c = (v: Q | number): RF => RF.of(v);
const fr = (n: number, d: number): string => L.frac(String(n), String(d));
/** Opció numèrica: el valor reduït, mostrat irreductible. */
const optQ = (id: string, v: Q, tag: string | null, override?: string) =>
  optRF(id, c(v), L.num(v), tag, override);

// ── B2.T1 · a/b + c/d ──────────────────────────────────────────────────────
const T1: Template<Machine> = {
  id: "B2.T1",
  version: 1,
  block: BLOCK,
  type: "mc_result",
  level: 1,
  generate(rng): McDraft<Machine> {
    const b = rng.int(2, 9);
    const d = intExcept(rng, 2, 9, b);
    const a = rng.int(1, b - 1);
    const cc = rng.int(1, d - 1);
    const Lc = mcm(b, d);
    const n = a * (Lc / b) + cc * (Lc / d);
    const correct = q(a, b).add(q(cc, d));
    return {
      type: "mc_result",
      ...base(1, I.calcula),
      promptLatex: `${fr(a, b)} + ${fr(cc, d)}`,
      promptMachine: rfMachine(c(correct)),
      explanationCorrect: fill(T["B2.T1"].explicacioCorrecta, {
        a,
        b,
        c: cc,
        d,
        L: Lc,
        aL: a * (Lc / b),
        cL: cc * (Lc / d),
        n,
      }),
      options: [
        optQ("a", correct, null),
        optQ("b", q(a + cc, b + d), "B2_SUMA_DENOMINADORS"),
        optQ("c", q(a + cc, Lc), "B2_AMPLIFICA_NOMES_DENOMINADOR"),
        optQ("d", q(a * cc, b * d), "B2_OPERACIO_CONFOSA"),
      ],
    };
  },
};

// ── B2.T2 · k + a/b ────────────────────────────────────────────────────────
const T2: Template<Machine> = {
  id: "B2.T2",
  version: 1,
  block: BLOCK,
  type: "mc_result",
  level: 1,
  generate(rng): McDraft<Machine> {
    const k = rng.int(1, 5);
    const b = rng.int(2, 9);
    const a = rng.int(1, b - 1);
    const correct = q(k * b + a, b);
    return {
      type: "mc_result",
      ...base(1, I.calcula),
      promptLatex: `${k} + ${fr(a, b)}`,
      promptMachine: rfMachine(c(correct)),
      explanationCorrect: fill(T["B2.T2"].explicacioCorrecta, { k, a, b, kb: k * b, n: k * b + a }),
      options: [
        optQ("a", correct, null),
        optQ("b", q(k + a, b), "B2_ENTER_SENSE_DENOMINADOR"),
        optQ("c", q(k + a, 1 + b), "B2_SUMA_DENOMINADORS"),
        optQ("d", q(k * a, b), "B2_OPERACIO_CONFOSA"),
      ],
    };
  },
};

// ── B2.T3 · (a/b) : (c/d) ──────────────────────────────────────────────────
const T3: Template<Machine> = {
  id: "B2.T3",
  version: 1,
  block: BLOCK,
  type: "mc_result",
  level: 2,
  generate(rng): McDraft<Machine> {
    const irreducible = (): [number, number] => {
      let a = rng.int(1, 9);
      let b = rng.int(1, 9);
      while (a === b || mcd(a, b) !== 1) {
        a = rng.int(1, 9);
        b = rng.int(1, 9);
      }
      return [a, b];
    };
    const [a, b] = irreducible();
    const [cc, d] = irreducible();
    const correct = q(a * d, b * cc);
    return {
      type: "mc_result",
      ...base(2, I.calcula),
      promptLatex: `${fr(a, b)} : ${fr(cc, d)}`,
      promptMachine: rfMachine(c(correct)),
      explanationCorrect: fill(T["B2.T3"].explicacioCorrecta, {
        a,
        b,
        c: cc,
        d,
        ad: a * d,
        bc: b * cc,
      }),
      options: [
        optQ("a", correct, null),
        optQ("b", q(a * cc, b * d), "B2_DIVISIO_SENSE_INVERTIR"),
        optQ("c", q(b * cc, a * d), "B2_INVERTEIX_PRIMERA"),
        optQ("d", q(b * d, a * cc), "B2_INVERTEIX_PRIMERA"),
      ],
    };
  },
};

// ── B2.T4 · (a/b)/c o a/(b/c) ──────────────────────────────────────────────
const T4: Template<Machine> = {
  id: "B2.T4",
  version: 1,
  block: BLOCK,
  type: "mc_result",
  level: 2,
  generate(rng): McDraft<Machine> {
    const a = rng.int(2, 9);
    const b = intExcept(rng, 2, 9, a);
    const cc = intExcept(rng, 2, 9, (v) => v === a || v === b);
    const first = rng.chance(0.5);
    const v1 = q(a, b * cc); // (a/b)/c
    const v2 = q(a * cc, b); // a/(b/c)
    const correct = first ? v1 : v2;
    // «Invertir la fracció equivocada»: (b/a)/c = b/(ac) a la primera; (c/b)/a = c/(ab) a la segona
    // (errata del catàleg: deia b/(ac) per a totes dues; decisió documentada a REGISTRO S3).
    const inv = first ? q(b, a * cc) : q(cc, a * b);
    return {
      type: "mc_result",
      ...base(2, I.calcula),
      promptLatex: first ? L.frac(fr(a, b), String(cc)) : L.frac(String(a), fr(b, cc)),
      promptMachine: rfMachine(c(correct)),
      explanationCorrect: fill(T["B2.T4"].explicacioCorrecta, { n: first ? cc : a }),
      options: [
        optQ("a", correct, null),
        optQ("b", first ? v2 : v1, "B2_FRACCIO_DE_FRACCIO"),
        optQ("c", inv, "B2_INVERTEIX_PRIMERA"),
        optQ("d", q(a, b + cc), "B2_OPERACIO_CONFOSA"),
      ],
    };
  },
};

// ── B2.T5 · valid_step ─────────────────────────────────────────────────────
const T5: Template<Machine> = {
  id: "B2.T5",
  version: 1,
  block: BLOCK,
  type: "valid_step",
  level: 2,
  generate(rng): ValidStepDraft<Machine> {
    const a = rng.int(2, 9);
    const b = intExcept(rng, 1, 9, (v) => v % a === 0);
    const k = rng.int(2, 5);
    const tx = T["B2.T5"];
    const pool: PoolEntry<"sumaDividida" | "enterPerFraccio">[] = [
      {
        key: "sumaDividida",
        beforeLatex: L.frac(`${a} + ${b}`, String(a)),
        before: rfMachine(c(q(a + b, a))),
        variants: [
          { afterLatex: L.plus("1", fr(b, a)), after: rfMachine(c(q(a + b, a))), tag: null },
          { afterLatex: String(b), after: rfMachine(c(b)), tag: "B2_SIMPLIFICA_SUMA" },
          { afterLatex: `1 + ${b}`, after: rfMachine(c(1 + b)), tag: "B2_SIMPLIFICA_SUMA" },
        ],
      },
      {
        key: "enterPerFraccio",
        beforeLatex: `${k} \\cdot ${fr(a, b)}`,
        before: rfMachine(c(q(k * a, b))),
        variants: [
          { afterLatex: fr(k * a, b), after: rfMachine(c(q(k * a, b))), tag: null },
          {
            afterLatex: fr(k * a, k * b),
            after: rfMachine(c(q(k * a, k * b))),
            tag: "B2_PRODUCTE_ENTER_A_TOT",
          },
        ],
      },
    ];
    const entry = rng.pick(pool);
    const v = pickVariant(rng, entry);
    const valid = v.tag === null;
    const r = tx.pool[entry.key];
    const options =
      entry.key === "sumaDividida"
        ? valid
          ? [
              optReason("a", tx.pool.sumaDividida.valid, null),
              optReason("b", fill(tx.pool.sumaDividida.tatxa, { a }), "B2_SIMPLIFICA_SUMA"),
              optReason("c", tx.pool.sumaDividida.enter, "B2_PRODUCTE_ENTER_A_TOT"),
            ]
          : [
              optReason("a", fill(tx.pool.sumaDividida.noValid, { a }), null),
              optReason("b", fill(tx.pool.sumaDividida.tatxaInvalid, { a }), "B2_SIMPLIFICA_SUMA"),
              optReason("c", tx.pool.sumaDividida.enter, "B2_PRODUCTE_ENTER_A_TOT"),
            ]
        : valid
          ? [
              optReason("a", r.valid, null),
              optReason("b", tx.pool.enterPerFraccio.dalt_i_baix, "B2_PRODUCTE_ENTER_A_TOT"),
              optReason("c", fill(tx.pool.enterPerFraccio.tatxa, { k }), "B2_SIMPLIFICA_SUMA"),
            ]
          : [
              optReason("a", tx.pool.enterPerFraccio.noValid, null),
              optReason("b", tx.pool.enterPerFraccio.dalt_i_baix, "B2_PRODUCTE_ENTER_A_TOT"),
              optReason("c", fill(tx.pool.enterPerFraccio.tatxa, { k }), "B2_SIMPLIFICA_SUMA"),
            ];
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

// ── B2.T6 · find_error: (a/b + c/d)·k ──────────────────────────────────────
const T6: Template<Machine> = {
  id: "B2.T6",
  version: 1,
  block: BLOCK,
  type: "find_error",
  level: 3,
  generate(rng): FindErrorDraft<Machine> {
    const b = rng.int(2, 6);
    const d = intExcept(rng, 2, 6, b);
    const a = rng.int(1, 5);
    const cc = rng.int(1, 5);
    const k = rng.int(2, 4);
    const Lc = mcm(b, d);
    const aL = a * (Lc / b);
    const cL = cc * (Lc / d);
    const n = aL + cL;
    const total = q(n * k, Lc);
    const step = (latex: string, v: Q) => ({ latex, machine: rfMachine(c(v)) });
    const times = (inner: string) => `\\left(${inner}\\right) \\cdot ${k}`;
    /** Pas final «simplificar», només si el resultat es pot reduir (si no, es mostraria igual). */
    const reduceStep = (num: number, den: number): ReturnType<typeof step>[] =>
      mcd(num, den) === 1 ? [] : [step(L.num(q(num, den)), q(num, den))];
    const s0 = step(times(`${fr(aL, Lc)} + ${fr(cL, Lc)}`), total);
    const s1 = step(times(fr(n, Lc)), total);
    const s2 = step(fr(n * k, Lc), total);
    const roll = rng.next();
    let steps: (typeof s0)[];
    let errorIndex: number | null;
    let injectedTag: string | null;
    if (roll < 0.2) {
      steps = [s0, s1, s2, ...reduceStep(n * k, Lc)];
      errorIndex = null;
      injectedTag = null;
    } else if (roll < 0.45) {
      // Només canvia el denominador: (a/L + c/L)·k
      const v = q((a + cc) * k, Lc);
      steps = [
        step(times(`${fr(a, Lc)} + ${fr(cc, Lc)}`), v),
        step(times(fr(a + cc, Lc)), v),
        step(fr((a + cc) * k, Lc), v),
        ...reduceStep((a + cc) * k, Lc),
      ];
      errorIndex = 0;
      injectedTag = "B2_AMPLIFICA_NOMES_DENOMINADOR";
    } else if (roll < 0.7) {
      // Suma també els denominadors: n/(2L)
      const v = q(n * k, 2 * Lc);
      steps = [
        s0,
        step(times(fr(n, 2 * Lc)), v),
        step(fr(n * k, 2 * Lc), v),
        ...reduceStep(n * k, 2 * Lc),
      ];
      errorIndex = 1;
      injectedTag = "B2_SUMA_DENOMINADORS";
    } else {
      // k a dalt i a baix: (nk)/(Lk)
      const v = q(n * k, Lc * k);
      steps = [s0, s1, step(fr(n * k, Lc * k), v), ...reduceStep(n * k, Lc * k)];
      errorIndex = 2;
      injectedTag = "B2_PRODUCTE_ENTER_A_TOT";
    }
    const tagForCorrectStep = (i: number) =>
      [
        "B2_AMPLIFICA_NOMES_DENOMINADOR",
        "B2_SUMA_DENOMINADORS",
        "B2_PRODUCTE_ENTER_A_TOT",
        "B2_SIMPLIFICA_SUMA",
      ][i]!;
    const tx = T["B2.T6"];
    return {
      type: "find_error",
      ...base(3, I.onEsError),
      promptLatex: times(`${fr(a, b)} + ${fr(cc, d)}`),
      promptMachine: rfMachine(c(total)),
      explanationCorrect: fill(
        errorIndex === null ? tx.explicacioSenseError : tx.explicacioCorrecta,
        {
          a,
          b,
          c: cc,
          d,
          k,
          L: Lc,
          aL,
          cL,
          n,
          nk: n * k,
        },
      ),
      steps,
      errorIndex,
      options: findErrorOptions(steps, errorIndex, injectedTag, tagForCorrectStep),
    };
  },
};

export const B2_TEMPLATES: Template<Machine>[] = [T1, T2, T3, T4, T5, T6];
