import type { FindErrorDraft, McDraft, Template, ValidStepDraft } from "@pasapas/engine";
import { B6_TEXTS, fill } from "../../../texts/ca";
import { COMU } from "../../../texts/ca/comu";
import type { Machine } from "../../machine";
import { eqMachine, opt, optReason, optText, solMachine } from "../../machine";
import {
  fmt,
  Poly,
  Q,
  RF,
  SOL_ALL,
  SOL_NONE,
  solOf,
  solSetEquals,
  solveEquation,
} from "../../math";
import { baseOf, findErrorOptions, intExcept, mcm, pickVariant, type PoolEntry } from "../common";

const T = B6_TEXTS;
const I = COMU.instruccions;
const BLOCK = "B6";
const base = baseOf(BLOCK);
const L = fmt;
const X = RF.X;
const c = (v: number | Q): RF => RF.of(v);
const lin = (a: number, b: number): Poly => Poly.linear(a, b);
const fr = (n: string, d: number | string) => L.frac(n, String(d));
/** Opció «x = v». */
const optSol = (id: string, v: Q | number, tag: string | null, override?: string) =>
  opt(id, solMachine(solOf(v)), L.sol(v), tag, override);
const optEq = (id: string, lhs: RF, rhs: RF, latex: string, tag: string | null) =>
  opt(id, eqMachine(lhs, rhs), latex, tag);
/** «k·(…)» amb el coeficient 1 amagat i parèntesis si cal. */
const times = (k: number, inner: string) => (k === 1 ? L.paren(inner) : `${k}${L.paren(inner)}`);

// ── B6.T1 · x/a + x/b = c ──────────────────────────────────────────────────
const T1: Template<Machine> = {
  id: "B6.T1",
  version: 1,
  block: BLOCK,
  type: "mc_result",
  level: 1,
  generate(rng): McDraft<Machine> {
    const a = rng.int(2, 6);
    const b = intExcept(rng, 2, 6, a);
    const Lc = mcm(a, b);
    const s = rng.int(1, 3) * Lc;
    const cc = s / a + s / b;
    const lhs = RF.of(Poly.X, a).add(RF.of(Poly.X, b));
    const tx = T["B6.T1"];
    return {
      type: "mc_result",
      ...base(1, I.resol),
      promptLatex: L.eq(`${fr("x", a)} + ${fr("x", b)}`, String(cc)),
      promptMachine: eqMachine(lhs, c(cc)),
      explanationCorrect: fill(tx.explicacioCorrecta, {
        L: Lc,
        La: Lc / a,
        Lb: Lc / b,
        Lc: Lc * cc,
        coef: Lc / a + Lc / b,
        s,
      }),
      options: [
        optSol("a", s, null),
        optSol(
          "b",
          cc * (a + b),
          "B2_SUMA_DENOMINADORS",
          fill(tx.overrideSuma, { a, b, ab: a + b }),
        ),
        optSol("c", Q.of(cc, Lc / a + Lc / b), "B6_MCM_PARCIAL"),
        optSol("d", Lc * cc - (Lc / a + Lc / b), "B6_DESPEJA_MAL"),
      ],
    };
  },
};

// ── B6.T2 · next_step: (x + p)/a − (x − q)/b = c ───────────────────────────
const T2: Template<Machine> = {
  id: "B6.T2",
  version: 1,
  block: BLOCK,
  type: "next_step",
  level: 2,
  generate(rng): McDraft<Machine> {
    const a = rng.int(2, 6);
    const b = intExcept(rng, 2, 6, a);
    const Lc = mcm(a, b);
    const p = rng.int(1, 9);
    const q = rng.int(1, 9);
    const cc = rng.int(1, 5);
    const La = Lc / a;
    const Lb = Lc / b;
    const xp = lin(1, p);
    const xq = lin(1, -q);
    const prompt = eqMachine(RF.of(xp, a).sub(RF.of(xq, b)), c(cc));
    const correctLhs = RF.of(xp.scale(La).sub(xq.scale(Lb)));
    const lhsLatex = `${times(La, L.poly(xp))} - ${times(Lb, L.poly(xq))}`;
    const expanded = L.poly(lin(La - Lb, La * p - Lb * q)); // sense parèntesi: −(L/b)q en lloc de +(L/b)q
    return {
      type: "next_step",
      ...base(2, I.quinPas),
      promptLatex: L.eq(`${fr(L.poly(xp), a)} - ${fr(L.poly(xq), b)}`, String(cc)),
      promptMachine: prompt,
      explanationCorrect: fill(T["B6.T2"].explicacioCorrecta, {
        a,
        b,
        L: Lc,
        La,
        Lb,
        p,
        q,
        Lc: Lc * cc,
      }),
      options: [
        optEq("a", correctLhs, c(Lc * cc), L.eq(lhsLatex, String(Lc * cc)), null),
        optEq("b", correctLhs, c(cc), L.eq(lhsLatex, String(cc)), "B6_MCM_PARCIAL"),
        optEq(
          "c",
          RF.of(lin(La - Lb, La * p - Lb * q)),
          c(Lc * cc),
          L.eq(expanded, String(Lc * cc)),
          "B6_NUMERADOR_SENSE_PARENTESI",
        ),
        optEq(
          "d",
          RF.of(xp.sub(xq)),
          c(Lc * cc),
          L.eq(`(${L.poly(xp)}) - (${L.poly(xq)})`, String(Lc * cc)),
          "B6_TREU_DENOMINADORS",
        ),
      ],
    };
  },
};

// ── B6.T3 · a/x = b/(x + d) ────────────────────────────────────────────────
const T3: Template<Machine> = {
  id: "B6.T3",
  version: 1,
  block: BLOCK,
  type: "mc_result",
  level: 2,
  generate(rng): McDraft<Machine> {
    const a = rng.int(1, 5);
    const b = rng.int(a + 1, 9);
    let s = 0;
    let d = 0;
    for (;;) {
      s = intExcept(rng, -12, 12, (v) => v === 0 || v % a !== 0);
      d = (s * (b - a)) / a;
      if (d !== 0 && d !== -s) break;
    }
    const xd = lin(1, d);
    const tx = T["B6.T3"];
    return {
      type: "mc_result",
      ...base(2, I.resol),
      promptLatex: L.eq(fr(String(a), "x"), fr(String(b), L.poly(xd))),
      promptMachine: eqMachine(RF.of(a, Poly.X), RF.of(b, xd)),
      explanationCorrect: fill(tx.explicacioCorrecta, { a, b, d, ad: a * d, ba: b - a, s, md: -d }),
      options: [
        optSol("a", s, null),
        optSol(
          "b",
          Q.of(d, b - a),
          "B1_DISTRIB_PARCIAL",
          fill(tx.overrideDistrib, { a, d, ad: a * d }),
        ),
        optSol("c", Q.of(b - a, a * d), "B6_DESPEJA_MAL"),
        optSol("d", -s, "B6_TRANSPOSICIO_SIGNE"),
      ],
    };
  },
};

// ── B6.T4 · (x + m)/(x − k) = (k + m)/(x − k): sense solució ───────────────
const T4: Template<Machine> = {
  id: "B6.T4",
  version: 1,
  block: BLOCK,
  type: "mc_result",
  level: 3,
  generate(rng): McDraft<Machine> {
    const k = rng.int(1, 9);
    const m = rng.int(1, 9);
    const den = lin(1, -k);
    return {
      type: "mc_result",
      ...base(3, I.resol),
      promptLatex: L.eq(fr(L.poly(lin(1, m)), L.poly(den)), fr(String(k + m), L.poly(den))),
      promptMachine: eqMachine(RF.of(lin(1, m), den), RF.of(k + m, den)),
      explanationCorrect: fill(T["B6.T4"].explicacioCorrecta, { k, m }),
      options: [
        optText("a", solMachine(SOL_NONE), COMU.opcions.noTeSolucio, null),
        optSol("b", k, "B6_SOLUCIO_PROHIBIDA"),
        optSol("c", -k, "B6_TRANSPOSICIO_SIGNE"),
        optText("d", solMachine(SOL_ALL), COMU.opcions.qualsevolX, "B7_CONFON_IDENTITAT"),
      ],
    };
  },
};

// ── B6.T5 · valid_step: pool d'equacions ───────────────────────────────────
type Key = "mcm" | "parentesi" | "creu" | "despeja";
const DENS = [2, 3, 4, 6];

const T5: Template<Machine> = {
  id: "B6.T5",
  version: 1,
  block: BLOCK,
  type: "valid_step",
  level: 2,
  generate(rng): ValidStepDraft<Machine> {
    const tx = T["B6.T5"];
    const P = tx.pool;
    let params: Record<string, number> = {};
    let entry: PoolEntry<Key>;
    // Es torna a sortejar fins que la variant invàlida NO és equivalent (ho exigeix la verificació).
    for (;;) {
      const p = rng.pick(DENS);
      const q = intExcept(rng, 2, 6, (v) => v === p || !DENS.includes(v));
      const Lpq = mcm(p, q);
      const cc = rng.int(1, 9);
      const e = rng.int(1, 9);
      const a = rng.int(2, 6);
      const t = rng.int(1, 9);
      const mn = rng.int(1, 5);
      const nd = rng.pick([2, 3, 4]);
      const key = rng.pick(["mcm", "parentesi", "creu", "despeja"] as const);
      const eqm = (l: RF, r: RF) => eqMachine(l, r);
      if (key === "mcm") {
        // x/p + c = x/q ⟹ (·L) (L/p)x + Lc = (L/q)x · invàlid (L/p)x + c = (L/q)x
        const before = eqm(RF.of(Poly.X, p).add(c(cc)), RF.of(Poly.X, q));
        const lhs = (k: number) => L.plus(L.poly(lin(Lpq / p, 0)), String(k));
        const rhs = L.poly(lin(Lpq / q, 0));
        params = { L: Lpq, c: cc };
        entry = {
          key,
          beforeLatex: L.eq(`${fr("x", p)} + ${cc}`, fr("x", q)),
          before,
          variants: [
            {
              afterLatex: L.eq(lhs(Lpq * cc), rhs),
              after: eqm(RF.of(lin(Lpq / p, Lpq * cc)), RF.of(lin(Lpq / q, 0))),
              tag: null,
            },
            {
              afterLatex: L.eq(lhs(cc), rhs),
              after: eqm(RF.of(lin(Lpq / p, cc)), RF.of(lin(Lpq / q, 0))),
              tag: "B6_MCM_PARCIAL",
            },
          ],
        };
      } else if (key === "parentesi") {
        // x/p − (x − c)/q = e ⟹ (·L) (L/p)x − (L/q)x + (L/q)c = Le · invàlid … − (L/q)c = Le
        const Lp = Lpq / p;
        const Lq = Lpq / q;
        const before = eqm(RF.of(Poly.X, p).sub(RF.of(lin(1, -cc), q)), c(e));
        const lhs = (sign: 1 | -1) =>
          `${L.poly(lin(Lp, 0))} - ${L.poly(lin(Lq, 0))} ${sign === 1 ? "+" : "-"} ${Lq * cc}`;
        params = { Lq, c: cc, Lqc: Lq * cc };
        entry = {
          key,
          beforeLatex: L.eq(`${fr("x", p)} - ${fr(L.poly(lin(1, -cc)), q)}`, String(e)),
          before,
          variants: [
            {
              afterLatex: L.eq(lhs(1), String(Lpq * e)),
              after: eqm(RF.of(lin(Lp - Lq, Lq * cc)), c(Lpq * e)),
              tag: null,
            },
            {
              afterLatex: L.eq(lhs(-1), String(Lpq * e)),
              after: eqm(RF.of(lin(Lp - Lq, -Lq * cc)), c(Lpq * e)),
              tag: "B6_NUMERADOR_SENSE_PARENTESI",
            },
          ],
        };
      } else if (key === "creu") {
        // c/x + 1 = m/n ⟹ invàlid c·n = (x + 1)·m
        if (mn === nd) continue;
        const before = eqm(RF.of(cc, Poly.X).add(c(1)), c(Q.of(mn, nd)));
        params = {};
        entry = {
          key,
          beforeLatex: L.eq(`${fr(String(cc), "x")} + 1`, fr(String(mn), nd)),
          before,
          variants: [
            {
              afterLatex: L.eq(`${cc} \\cdot ${nd}`, `(x + 1) \\cdot ${mn}`),
              after: eqm(c(cc * nd), RF.of(lin(mn, mn))),
              tag: "B6_CREU_AMB_SUMES",
            },
          ],
        };
      } else {
        // ax = b ⟹ vàlid x = b/a · invàlid x = b − a
        const b = a * t;
        params = { a, b };
        entry = {
          key,
          beforeLatex: L.eq(L.poly(lin(a, 0)), String(b)),
          before: eqm(RF.of(lin(a, 0)), c(b)),
          variants: [
            { afterLatex: L.sol(t), after: solMachine(solOf(t)), tag: null },
            { afterLatex: L.sol(b - a), after: solMachine(solOf(b - a)), tag: "B6_DESPEJA_MAL" },
          ],
        };
      }
      // Comprovació d'equivalència de les variants invàlides (si alguna fos equivalent, tornem a sortejar).
      const sb =
        entry.before.kind === "eq" ? solveEquation(entry.before.lhs, entry.before.rhs) : null;
      const ok = entry.variants.every((v) => {
        if (v.tag === null) return true;
        const sa =
          v.after.kind === "eq"
            ? solveEquation(v.after.lhs, v.after.rhs)
            : v.after.kind === "sol"
              ? v.after.s
              : null;
        return sb && sa ? solSetEquals(sb, sa) === false : false;
      });
      if (ok) break;
    }
    const v = pickVariant(rng, entry);
    const valid = v.tag === null;
    const f = (s: string) => fill(s, params);
    const R = (correct: string, b: [string, string], cc: [string, string]) => [
      optReason("a", f(correct), null),
      optReason("b", f(b[0]), b[1]),
      optReason("c", f(cc[0]), cc[1]),
    ];
    let options;
    switch (entry.key) {
      case "mcm":
        options = R(
          valid ? P.mcm.valid : P.mcm.noValid,
          [P.mcm.nomesFraccions, "B6_MCM_PARCIAL"],
          [P.mcm.treure, "B6_TREU_DENOMINADORS"],
        );
        break;
      case "parentesi":
        options = R(
          valid ? P.parentesi.valid : P.parentesi.noValid,
          [P.parentesi.signe, "B6_NUMERADOR_SENSE_PARENTESI"],
          [P.parentesi.nomesX, "B1_DISTRIB_PARCIAL"],
        );
        break;
      case "creu":
        options = R(
          P.creu.noValid,
          [P.creu.siCreu, "B6_CREU_AMB_SUMES"],
          [P.creu.siSuma, "B2_ENTER_SENSE_DENOMINADOR"],
        );
        break;
      default:
        options = R(
          valid ? P.despeja.valid : P.despeja.noValid,
          [P.despeja.resta, "B6_DESPEJA_MAL"],
          [P.despeja.inversa, "B6_DESPEJA_MAL"],
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

// ── B6.T6 · find_error: x/a − (x − p)/b = c ────────────────────────────────
const PAIRS: [number, number][] = [
  [2, 3],
  [3, 4],
  [2, 5],
  [4, 6],
];

const T6: Template<Machine> = {
  id: "B6.T6",
  version: 1,
  block: BLOCK,
  type: "find_error",
  level: 3,
  generate(rng): FindErrorDraft<Machine> {
    const [a, b] = rng.pick(PAIRS);
    const Lc = mcm(a, b);
    const La = Lc / a;
    const Lb = Lc / b;
    const candidates: [number, number][] = [];
    for (let s = 2; s <= 20; s++)
      for (let p = 1; p <= 9; p++)
        if (s % a === 0 && (s - p) % b === 0 && s / a - (s - p) / b !== 0) candidates.push([s, p]);
    const [s, p] = rng.pick(candidates);
    const cc = s / a - (s - p) / b;
    const coef = La - Lb;
    const prompt = eqMachine(RF.of(Poly.X, a).sub(RF.of(lin(1, -p), b)), c(cc));
    const step = (latex: string, lhs: RF, rhs: RF) => ({ latex, machine: eqMachine(lhs, rhs) });
    const xs = (k: number) => L.poly(lin(k, 0));
    const lhs0 = `${xs(La)} - ${times(Lb, L.poly(lin(1, -p)))}`;
    const lhs1 = (sign: 1 | -1) => `${xs(La)} - ${xs(Lb)} ${sign === 1 ? "+" : "-"} ${Lb * p}`;
    const s0 = step(
      L.eq(lhs0, String(Lc * cc)),
      RF.of(lin(La, 0).sub(lin(1, -p).scale(Lb))),
      c(Lc * cc),
    );
    const s1 = step(L.eq(lhs1(1), String(Lc * cc)), RF.of(lin(coef, Lb * p)), c(Lc * cc));
    const s2 = step(
      L.eq(xs(coef), String(Lc * cc - Lb * p)),
      RF.of(lin(coef, 0)),
      c(Lc * cc - Lb * p),
    );
    const s3 = step(L.sol(s), X, c(s));
    const finish = (rhs: number, k = coef) => {
      const v = Q.of(rhs, k);
      return [step(L.eq(xs(k), String(rhs)), RF.of(lin(k, 0)), c(rhs)), step(L.sol(v), X, c(v))];
    };
    const roll = rng.next();
    let steps: (typeof s0)[];
    let errorIndex: number | null;
    let injectedTag: string | null;
    if (roll < 0.2) {
      steps = [s0, s1, s2, s3];
      errorIndex = null;
      injectedTag = null;
    } else if (roll < 0.4) {
      // = c en lloc de = Lc
      steps = [
        step(L.eq(lhs0, String(cc)), s0.machine.kind === "eq" ? s0.machine.lhs : X, c(cc)),
        step(L.eq(lhs1(1), String(cc)), RF.of(lin(coef, Lb * p)), c(cc)),
        ...finish(cc - Lb * p),
      ];
      errorIndex = 0;
      injectedTag = "B6_MCM_PARCIAL";
    } else if (roll < 0.6) {
      // − (L/b)p en lloc de + (L/b)p
      steps = [
        s0,
        step(L.eq(lhs1(-1), String(Lc * cc)), RF.of(lin(coef, -Lb * p)), c(Lc * cc)),
        ...finish(Lc * cc + Lb * p),
      ];
      errorIndex = 1;
      injectedTag = "B6_NUMERADOR_SENSE_PARENTESI";
    } else if (roll < 0.8) {
      // passa el +(L/b)p sense canviar el signe
      steps = [s0, s1, ...finish(Lc * cc + Lb * p)];
      errorIndex = 2;
      injectedTag = "B6_TRANSPOSICIO_SIGNE";
    } else {
      // resta el coeficient en lloc de dividir
      const v = Lc * cc - Lb * p - coef;
      steps = [s0, s1, s2, step(L.sol(v), X, c(v))];
      errorIndex = 3;
      injectedTag = "B6_DESPEJA_MAL";
    }
    const tagForCorrectStep = (i: number) =>
      [
        "B6_TREU_DENOMINADORS",
        "B6_NUMERADOR_SENSE_PARENTESI",
        "B6_TRANSPOSICIO_SIGNE",
        "B6_DESPEJA_MAL",
      ][i]!;
    const tx = T["B6.T6"];
    return {
      type: "find_error",
      ...base(3, I.onEsError),
      promptLatex: L.eq(`${fr("x", a)} - ${fr(L.poly(lin(1, -p)), b)}`, String(cc)),
      promptMachine: prompt,
      explanationCorrect: fill(
        errorIndex === null ? tx.explicacioSenseError : tx.explicacioCorrecta,
        {
          a,
          b,
          p,
          c: cc,
          L: Lc,
          La,
          Lb,
          Lc: Lc * cc,
          Lbp: Lb * p,
          coef,
          rhs: Lc * cc - Lb * p,
          s,
        },
      ),
      steps,
      errorIndex,
      options: findErrorOptions(steps, errorIndex, injectedTag, tagForCorrectStep),
    };
  },
};

export const B6_TEMPLATES: Template<Machine>[] = [T1, T2, T3, T4, T5, T6];
