import type { FindErrorDraft, McDraft, Template, ValidStepDraft } from "@pasapas/engine";
import { B7_TEXTS, fill } from "../../../texts/ca";
import { COMU } from "../../../texts/ca/comu";
import type { Machine } from "../../machine";
import {
  CLAIM_WRONG_FORM,
  eqMachine,
  opt,
  optReason,
  optText,
  radeqMachine,
  solMachine,
} from "../../machine";
import { fmt, Poly, Q, RF, SOL_ALL, SOL_NONE, solOf, solPmSqrt } from "../../math";
import { baseOf, findErrorOptions, intExcept, pickVariant, type PoolEntry } from "../common";

const T = B7_TEXTS;
const I = COMU.instruccions;
const BLOCK = "B7";
const base = baseOf(BLOCK);
const L = fmt;
const X = RF.X;
const c = (v: number | Q): RF => RF.of(v);
const lin = (a: number, b: number): Poly => Poly.linear(a, b);
const optSol = (id: string, roots: (Q | number)[], tag: string | null, override?: string) =>
  opt(id, solMachine(solOf(...roots)), L.sol(...roots), tag, override);
const optEq = (id: string, lhs: RF, rhs: RF, latex: string, tag: string | null) =>
  opt(id, eqMachine(lhs, rhs), latex, tag);
const isSquare = (n: number) => Number.isInteger(Math.sqrt(n));

// ── B7.T1 · x² = kx ────────────────────────────────────────────────────────
const T1: Template<Machine> = {
  id: "B7.T1",
  version: 1,
  block: BLOCK,
  type: "mc_result",
  level: 1,
  generate(rng): McDraft<Machine> {
    const k = rng.int(2, 9);
    return {
      type: "mc_result",
      ...base(1, I.resol),
      promptLatex: L.eq("x^{2}", L.poly(lin(k, 0))),
      promptMachine: eqMachine(X.pow(2), RF.of(lin(k, 0))),
      explanationCorrect: fill(T["B7.T1"].explicacioCorrecta, { k }),
      options: [
        optSol("a", [0, k], null),
        optSol("b", [k], "B7_DIVIDEIX_PER_X"),
        optSol("c", [0], "B7_SOLUCIO_INCOMPLETA"),
        optSol("d", [0, -k], "B6_TRANSPOSICIO_SIGNE"),
      ],
    };
  },
};

// ── B7.T2 · (x + p)² = k² ──────────────────────────────────────────────────
const T2: Template<Machine> = {
  id: "B7.T2",
  version: 1,
  block: BLOCK,
  type: "mc_result",
  level: 2,
  generate(rng): McDraft<Machine> {
    let k = 0;
    let p = 0;
    do {
      k = rng.int(2, 9);
      p = intExcept(rng, -6, 6, 0);
    } while (k <= Math.abs(p) || isSquare(k * k - p * p));
    const xp = lin(1, p);
    return {
      type: "mc_result",
      ...base(2, I.resol),
      promptLatex: L.eq(`(${L.poly(xp)})^{2}`, `${k}^{2}`),
      promptMachine: eqMachine(RF.of(xp.pow(2)), c(k * k)),
      explanationCorrect: fill(T["B7.T2"].explicacioCorrecta, {
        k,
        p: Math.abs(p),
        sp: p > 0 ? `+ ${p}` : `- ${-p}`,
        mp: p > 0 ? `- ${p}` : `+ ${-p}`,
        r1: k - p,
        r2: -k - p,
      }),
      options: [
        optSol("a", [k - p, -k - p], null),
        optSol("b", [k - p], "B7_ARREL_SENSE_PM"),
        opt(
          "c",
          solMachine(solPmSqrt(k * k - p * p)),
          `x = \\pm\\sqrt{${k * k - p * p}}`,
          "B3_QUADRAT_SUMA",
        ),
        optSol("d", [p + k, p - k], "B6_TRANSPOSICIO_SIGNE"),
      ],
    };
  },
};

// ── B7.T3 · valid_step: pool d'equacions ───────────────────────────────────
type Key =
  "unSolTerme" | "tatxaX" | "divideixX" | "senseSolucio" | "multiplica" | "arrel" | "inversSuma";

const T3: Template<Machine> = {
  id: "B7.T3",
  version: 1,
  block: BLOCK,
  type: "valid_step",
  level: 2,
  generate(rng): ValidStepDraft<Machine> {
    const a = rng.int(2, 4);
    const t = rng.int(1, 6);
    const u = intExcept(rng, 1, 9, t);
    const b = rng.int(1, 9);
    const k = rng.int(2, 9);
    const p = rng.int(2, 6);
    const q = intExcept(rng, 2, 6, p);
    const eqm = (l: RF, r: RF) => eqMachine(l, r);
    const sol = (...r: (Q | number)[]) => solMachine(solOf(...r));
    const pool: PoolEntry<Key>[] = [
      {
        key: "unSolTerme", // ax + at = au ⟹ x + t = u · invàlid x + at = u
        beforeLatex: L.eq(L.poly(lin(a, a * t)), String(a * u)),
        before: eqm(RF.of(lin(a, a * t)), c(a * u)),
        variants: [
          {
            afterLatex: L.eq(L.poly(lin(1, t)), String(u)),
            after: eqm(RF.of(lin(1, t)), c(u)),
            tag: null,
          },
          {
            afterLatex: L.eq(L.poly(lin(1, a * t)), String(u)),
            after: eqm(RF.of(lin(1, a * t)), c(u)),
            tag: "B7_UN_SOL_TERME",
          },
        ],
      },
      {
        key: "tatxaX", // x + b = 2x + b ⟹ x = 2x · invàlid 1 = 2
        beforeLatex: L.eq(L.poly(lin(1, b)), L.poly(lin(2, b))),
        before: eqm(RF.of(lin(1, b)), RF.of(lin(2, b))),
        variants: [
          { afterLatex: L.eq("x", "2x"), after: eqm(X, RF.of(lin(2, 0))), tag: null },
          { afterLatex: L.eq("1", "2"), after: eqm(c(1), c(2)), tag: "B7_TATXA_X_SUMA" },
        ],
      },
      {
        key: "divideixX", // x² = kx ⟹ invàlid x = k · vàlid x(x − k) = 0
        beforeLatex: L.eq("x^{2}", L.poly(lin(k, 0))),
        before: eqm(X.pow(2), RF.of(lin(k, 0))),
        variants: [
          { afterLatex: L.sol(k), after: sol(k), tag: "B7_DIVIDEIX_PER_X" },
          {
            afterLatex: L.eq(L.prod("x", L.poly(lin(1, -k))), "0"),
            after: eqm(RF.of(Poly.X.mul(lin(1, -k))), c(0)),
            tag: null,
          },
        ],
      },
      {
        key: "senseSolucio", // a(x − t) = ax ⟹ x − t = x (totes dues sense solució)
        beforeLatex: L.eq(`${a}(${L.poly(lin(1, -t))})`, L.poly(lin(a, 0))),
        before: eqm(RF.of(lin(a, -a * t)), RF.of(lin(a, 0))),
        variants: [
          {
            afterLatex: L.eq(L.poly(lin(1, -t)), "x"),
            after: eqm(RF.of(lin(1, -t)), X),
            tag: null,
          },
        ],
      },
      {
        key: "multiplica", // x/a = t ⟹ x = at
        beforeLatex: L.eq(L.frac("x", String(a)), String(t)),
        before: eqm(RF.of(Poly.X, a), c(t)),
        variants: [{ afterLatex: L.sol(a * t), after: sol(a * t), tag: null }],
      },
      {
        key: "arrel", // x² = k² ⟹ invàlid x = k · vàlid x = k o x = −k
        beforeLatex: L.eq("x^{2}", String(k * k)),
        before: eqm(X.pow(2), c(k * k)),
        variants: [
          { afterLatex: L.sol(k), after: sol(k), tag: "B7_ARREL_SENSE_PM" },
          { afterLatex: L.sol(k, -k), after: sol(k, -k), tag: null },
        ],
      },
      {
        key: "inversSuma", // 1/x = 1/p + 1/q ⟹ invàlid x = p + q · vàlid x = pq/(p + q)
        beforeLatex: L.eq(
          L.frac("1", "x"),
          `${L.frac("1", String(p))} + ${L.frac("1", String(q))}`,
        ),
        before: eqm(X.inv(), c(Q.of(1, p).add(Q.of(1, q)))),
        variants: [
          { afterLatex: L.sol(p + q), after: sol(p + q), tag: "B7_INVERS_SUMA" },
          { afterLatex: L.sol(Q.of(p * q, p + q)), after: sol(Q.of(p * q, p + q)), tag: null },
        ],
      },
    ];
    const entry = rng.pick(pool);
    const v = pickVariant(rng, entry);
    const valid = v.tag === null;
    const tx = T["B7.T3"];
    const P = tx.pool;
    const f = (s: string) => fill(s, { a, t, b, k, k2: k * k, p, q, s: p + q, pq: p * q });
    const R = (correct: string, b2: [string, string], c2: [string, string]) => [
      optReason("a", f(correct), null),
      optReason("b", f(b2[0]), b2[1]),
      optReason("c", f(c2[0]), c2[1]),
    ];
    let options;
    switch (entry.key) {
      case "unSolTerme":
        options = R(
          valid ? P.unSolTerme.valid : P.unSolTerme.noValid,
          [P.unSolTerme.nomesX, "B7_UN_SOL_TERME"],
          [P.unSolTerme.noEsPot, "B6_DESPEJA_MAL"],
        );
        break;
      case "tatxaX":
        options = R(
          valid ? P.tatxaX.valid : P.tatxaX.noValid,
          [P.tatxaX.tatxa, "B7_TATXA_X_SUMA"],
          [P.tatxaX.resta, "B7_TATXA_X_SUMA"],
        );
        break;
      case "divideixX":
        options = R(
          valid ? P.divideixX.valid : P.divideixX.noValid,
          [P.divideixX.divideix, "B7_DIVIDEIX_PER_X"],
          [P.divideixX.resta, "B6_TRANSPOSICIO_SIGNE"],
        );
        break;
      case "senseSolucio":
        options = R(
          P.senseSolucio.valid,
          [P.senseSolucio.divideix, "B7_UN_SOL_TERME"],
          [P.senseSolucio.tatxa, "B7_TATXA_X_SUMA"],
        );
        break;
      case "multiplica":
        options = R(
          P.multiplica.valid,
          [P.multiplica.divideix, "B6_DESPEJA_MAL"],
          [P.multiplica.resta, "B6_DESPEJA_MAL"],
        );
        break;
      case "arrel":
        options = R(
          valid ? P.arrel.valid : P.arrel.noValid,
          [P.arrel.nomesPositiva, "B7_ARREL_SENSE_PM"],
          [P.arrel.cap, "B7_CONFON_IDENTITAT"],
        );
        break;
      default:
        options = R(
          valid ? P.inversSuma.valid : P.inversSuma.noValid,
          [P.inversSuma.inverteix, "B7_INVERS_SUMA"],
          [P.inversSuma.suma, "B7_INVERS_SUMA"],
        );
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

// ── B7.T4 · sense solució / identitat ──────────────────────────────────────
const T4: Template<Machine> = {
  id: "B7.T4",
  version: 1,
  block: BLOCK,
  type: "mc_result",
  level: 2,
  generate(rng): McDraft<Machine> {
    const a = rng.int(2, 6);
    const b = rng.int(1, 9);
    const cc = intExcept(rng, 1, 9, b);
    const first = rng.chance(0.5);
    const O = COMU.opcions;
    const prompt = first
      ? eqMachine(RF.of(lin(a, b)), RF.of(lin(a, cc)))
      : eqMachine(RF.of(lin(a, a * b)), RF.of(lin(a, a * b)));
    return {
      type: "mc_result",
      ...base(2, I.resol),
      promptLatex: first
        ? L.eq(L.poly(lin(a, b)), L.poly(lin(a, cc)))
        : L.eq(`${a}(${L.poly(lin(1, b))})`, L.poly(lin(a, a * b))),
      promptMachine: prompt,
      explanationCorrect: fill(T["B7.T4"].explicacioCorrecta, { a, b, c: cc }),
      options: [
        first
          ? optText("a", solMachine(SOL_NONE), O.noTeSolucio, null)
          : optText("a", solMachine(SOL_ALL), O.qualsevolX, null),
        first
          ? optText("b", solMachine(SOL_ALL), O.qualsevolX, "B7_CONFON_IDENTITAT")
          : optText("b", solMachine(SOL_NONE), O.noTeSolucio, "B7_CONFON_IDENTITAT"),
        optSol("c", [0], "B7_CONFON_IDENTITAT"),
        optSol("d", [first ? cc - b : b], "B7_TATXA_X_SUMA"),
      ],
    };
  },
};

// ── B7.T5 · next_step: √(x + a) = x − b ────────────────────────────────────
const T5: Template<Machine> = {
  id: "B7.T5",
  version: 1,
  block: BLOCK,
  type: "next_step",
  level: 2,
  generate(rng): McDraft<Machine> {
    const a = rng.int(1, 9);
    const b = rng.int(1, 6);
    const xa = lin(1, a);
    const xb = lin(1, -b);
    const sq = (p: Poly) => RF.of(p.pow(2));
    // El pas correcte és elevar al quadrat: la forma màquina de l'enunciat és l'equació quadrada
    // (no és equivalent a l'original, però és el pas que es demana).
    return {
      type: "next_step",
      ...base(2, I.quinPas),
      promptLatex: L.eq(L.root(2, L.poly(xa)), L.poly(xb)),
      promptMachine: eqMachine(RF.of(xa), sq(xb)),
      explanationCorrect: fill(T["B7.T5"].explicacioCorrecta, { a, b }),
      options: [
        optEq("a", RF.of(xa), sq(xb), L.eq(L.poly(xa), `(${L.poly(xb)})^{2}`), null),
        optEq(
          "b",
          RF.of(xa),
          RF.of(Poly.from([-b * b, 0, 1])),
          L.eq(L.poly(xa), L.poly(Poly.from([-b * b, 0, 1]))),
          "B7_QUADRAT_TERME_A_TERME",
        ),
        optEq(
          "c",
          RF.of(xa),
          RF.of(Poly.from([b * b, 0, 1])),
          L.eq(L.poly(xa), L.poly(Poly.from([b * b, 0, 1]))),
          "B7_QUADRAT_TERME_A_TERME",
        ),
        opt(
          "d",
          CLAIM_WRONG_FORM,
          L.eq(`${L.root(2, "x")} + ${L.root(2, String(a))}`, L.poly(xb)),
          "B3_ARREL_SUMA",
        ),
      ],
    };
  },
};

// ── B7.T6 · √(x + a) = x − b amb una arrel falsa ───────────────────────────
const T6: Template<Machine> = {
  id: "B7.T6",
  version: 1,
  block: BLOCK,
  type: "mc_result",
  level: 3,
  generate(rng): McDraft<Machine> {
    const b = rng.int(1, 4);
    const r1 = rng.int(b + 2, b + 6);
    const r2 = 2 * b + 1 - r1;
    const a = b * b - r1 * r2;
    const tx = T["B7.T6"];
    return {
      type: "mc_result",
      ...base(3, I.resol),
      promptLatex: L.eq(L.root(2, L.poly(lin(1, a))), L.poly(lin(1, -b))),
      promptMachine: radeqMachine(a, b),
      explanationCorrect: fill(tx.explicacioCorrecta, {
        a,
        b,
        tb: 2 * b + 1,
        cst: b * b - a,
        r1,
        r2,
        r1a: r1 + a,
        r1b: r1 - b,
      }),
      options: [
        optSol("a", [r1], null),
        optSol("b", [r1, r2], "B7_NO_COMPROVA_ARRELS"),
        optSol("c", [r2], "B7_NO_COMPROVA_ARRELS"),
        optText(
          "d",
          solMachine(SOL_NONE),
          COMU.opcions.noTeSolucio,
          "B7_NO_COMPROVA_ARRELS",
          tx.overrideCap,
        ),
      ],
    };
  },
};

// ── B7.T7 · find_error: x³ = k²x ───────────────────────────────────────────
const T7: Template<Machine> = {
  id: "B7.T7",
  version: 1,
  block: BLOCK,
  type: "find_error",
  level: 3,
  generate(rng): FindErrorDraft<Machine> {
    const k = rng.int(2, 6);
    const k2 = k * k;
    const all = solMachine(solOf(0, k, -k));
    const stepEq = (latex: string, lhs: RF, rhs: RF) => ({ latex, machine: eqMachine(lhs, rhs) });
    const stepSol = (latex: string, m: Machine) => ({ latex, machine: m });
    const s0 = stepEq(
      L.eq(L.poly(Poly.from([0, -k2, 0, 1])), "0"),
      RF.of(Poly.from([0, -k2, 0, 1])),
      c(0),
    );
    const s1 = stepEq(
      L.eq(L.prod("x", L.poly(Poly.from([-k2, 0, 1]))), "0"),
      RF.of(Poly.from([0, -k2, 0, 1])),
      c(0),
    );
    const s2 = stepSol(`x = 0 \\text{ o } x^{2} = ${k2}`, all);
    const s3 = stepSol(`x = 0,\\; x = ${k} \\text{ o } x = -${k}`, all);
    const roll = rng.next();
    let steps: (typeof s0)[];
    let errorIndex: number | null;
    let injectedTag: string | null;
    if (roll < 0.2) {
      steps = [s0, s1, s2, s3];
      errorIndex = null;
      injectedTag = null;
    } else if (roll < 0.6) {
      // Divideix per x: x² = k² → (x + k)(x − k) = 0 → x = k o x = −k
      const two = solMachine(solOf(k, -k));
      steps = [
        stepEq(L.eq("x^{2}", String(k2)), X.pow(2), c(k2)),
        stepEq(
          L.eq(L.prod(L.poly(lin(1, k)), L.poly(lin(1, -k))), "0"),
          RF.of(Poly.from([-k2, 0, 1])),
          c(0),
        ),
        stepSol(L.sol(k, -k), two),
      ];
      errorIndex = 0;
      injectedTag = "B7_DIVIDEIX_PER_X";
    } else {
      steps = [s0, s1, s2, stepSol(L.sol(0, k), solMachine(solOf(0, k)))];
      errorIndex = 3;
      injectedTag = "B7_ARREL_SENSE_PM";
    }
    const tagForCorrectStep = (i: number) =>
      [
        "B6_TRANSPOSICIO_SIGNE",
        "B4_FACTOR_COMU_EXPONENT",
        "B7_SOLUCIO_INCOMPLETA",
        "B7_ARREL_SENSE_PM",
      ][i]!;
    const tx = T["B7.T7"];
    return {
      type: "find_error",
      ...base(3, I.onEsError),
      promptLatex: L.eq("x^{3}", L.poly(lin(k2, 0))),
      promptMachine: eqMachine(X.pow(3), RF.of(lin(k2, 0))),
      explanationCorrect: fill(
        errorIndex === null ? tx.explicacioSenseError : tx.explicacioCorrecta,
        { k, k2 },
      ),
      steps,
      errorIndex,
      options: findErrorOptions(steps, errorIndex, injectedTag, tagForCorrectStep),
    };
  },
};

// ── B7.T8 · find_error: x² − k² = 0 ────────────────────────────────────────
const T8: Template<Machine> = {
  id: "B7.T8",
  version: 1,
  block: BLOCK,
  type: "find_error",
  level: 2,
  generate(rng): FindErrorDraft<Machine> {
    const k = rng.int(2, 9);
    const k2 = k * k;
    const diffP = Poly.from([-k2, 0, 1]);
    const stepEq = (latex: string, lhs: RF, rhs: RF) => ({ latex, machine: eqMachine(lhs, rhs) });
    const stepSol = (latex: string, m: Machine) => ({ latex, machine: m });
    const s0 = stepEq(L.eq(L.prod(L.poly(lin(1, k)), L.poly(lin(1, -k))), "0"), RF.of(diffP), c(0));
    const s1 = stepSol(L.sol(-k, k), solMachine(solOf(-k, k)));
    const roll = rng.next();
    let steps: (typeof s0)[];
    let errorIndex: number | null;
    let injectedTag: string | null;
    if (roll < 0.2) {
      steps = [s0, s1];
      errorIndex = null;
      injectedTag = null;
    } else if (roll < 0.6) {
      // Diferència de quadrats com a quadrat: (x − k)² = 0 → x = k
      steps = [
        stepEq(L.eq(`(${L.poly(lin(1, -k))})^{2}`, "0"), RF.of(lin(1, -k).pow(2)), c(0)),
        stepSol(L.sol(k), solMachine(solOf(k))),
      ];
      errorIndex = 0;
      injectedTag = "B4_DIF_QUADRATS";
    } else {
      // Es queda només amb una solució
      steps = [s0, stepSol(L.sol(k), solMachine(solOf(k)))];
      errorIndex = 1;
      injectedTag = "B7_SOLUCIO_INCOMPLETA";
    }
    const tx = T["B7.T8"];
    return {
      type: "find_error",
      ...base(2, I.onEsError),
      promptLatex: L.eq(L.poly(diffP), "0"),
      promptMachine: eqMachine(RF.of(diffP), c(0)),
      explanationCorrect: fill(
        errorIndex === null ? tx.explicacioSenseError : tx.explicacioCorrecta,
        { k, k2 },
      ),
      steps,
      errorIndex,
      options: findErrorOptions(steps, errorIndex, injectedTag, (i) =>
        i === 0 ? "B4_NO_RECONEIX" : "B7_ARREL_SENSE_PM",
      ),
    };
  },
};

export const B7_TEMPLATES: Template<Machine>[] = [T1, T2, T3, T4, T5, T6, T7, T8];
