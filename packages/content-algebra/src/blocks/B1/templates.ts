import type { FindErrorDraft, McDraft, Template, ValidStepDraft } from "@pasapas/engine";
import { B1_TEXTS, fill } from "../../../texts/ca";
import { COMU } from "../../../texts/ca/comu";
import type { Machine } from "../../machine";
import { optReason, optRF, rfMachine } from "../../machine";
import { fmt, Poly, RF } from "../../math";
import { baseOf, findErrorOptions, intExcept } from "../common";

const T = B1_TEXTS;
const I = COMU.instruccions;
const BLOCK = "B1";
const base = baseOf(BLOCK);
const L = fmt;
const lin = (a: number, b: number): Poly => Poly.linear(a, b);
const c = (v: number): RF => RF.of(v);
/** «b − ax» (constant primer, com al catàleg). */
const constFirst = (k: number, a: number): string => L.plus(String(k), L.poly(lin(a, 0)));

// ── B1.T1 · c − (ax − b) ───────────────────────────────────────────────────
const T1: Template<Machine> = {
  id: "B1.T1",
  version: 1,
  block: BLOCK,
  type: "mc_result",
  level: 1,
  generate(rng): McDraft<Machine> {
    const a = rng.int(2, 9);
    const b = rng.int(1, 9);
    const cc = intExcept(rng, 1, 9, b);
    const prompt = RF.of(lin(-a, cc + b));
    return {
      type: "mc_result",
      ...base(1, I.simplifica),
      promptLatex: `${cc} - (${L.poly(lin(a, -b))})`,
      promptMachine: rfMachine(prompt),
      explanationCorrect: fill(T["B1.T1"].explicacioCorrecta, { a, b, c: cc, cb: cc + b }),
      options: [
        optRF("a", prompt, constFirst(cc + b, -a), null),
        optRF("b", RF.of(lin(-a, cc - b)), constFirst(cc - b, -a), "B1_SIGNE_PARCIAL"),
        optRF("c", RF.of(lin(a, cc + b)), constFirst(cc + b, a), "B1_SIGNE_OBLIDAT"),
        optRF("d", RF.of(lin(cc + b - a, 0)), L.poly(lin(cc + b - a, 0)), "B1_TERMES_NO_SEMBLANTS"),
      ],
    };
  },
};

// ── B1.T2 · k(x + p) − m(x − q) ────────────────────────────────────────────
const T2: Template<Machine> = {
  id: "B1.T2",
  version: 1,
  block: BLOCK,
  type: "mc_result",
  level: 2,
  generate(rng): McDraft<Machine> {
    const k = rng.int(2, 6);
    const m = intExcept(rng, 2, 6, k);
    const p = rng.int(1, 9);
    const q = rng.int(1, 9);
    const prompt = RF.of(lin(k - m, k * p + m * q));
    const o = (a: number, b: number) => RF.of(lin(a, b));
    return {
      type: "mc_result",
      ...base(2, I.simplifica),
      promptLatex: `${k}(${L.poly(lin(1, p))}) - ${m}(${L.poly(lin(1, -q))})`,
      promptMachine: rfMachine(prompt),
      explanationCorrect: fill(T["B1.T2"].explicacioCorrecta, {
        k,
        m,
        p,
        q,
        kp: k * p,
        mq: m * q,
        km: k - m,
        kpmq: k * p + m * q,
      }),
      options: [
        optRF("a", prompt, L.poly(prompt.num), null),
        optRF("b", o(k - m, k * p - m * q), L.poly(lin(k - m, k * p - m * q)), "B1_SIGNE_PARCIAL"),
        optRF("c", o(k - m, p + m * q), L.poly(lin(k - m, p + m * q)), "B1_DISTRIB_PARCIAL"),
        optRF("d", o(k + m, k * p - m * q), L.poly(lin(k + m, k * p - m * q)), "B1_SIGNE_OBLIDAT"),
      ],
    };
  },
};

// ── B1.T3 · a + b·c − d (numèric) ──────────────────────────────────────────
const T3: Template<Machine> = {
  id: "B1.T3",
  version: 1,
  block: BLOCK,
  type: "mc_result",
  level: 1,
  generate(rng): McDraft<Machine> {
    const a = rng.int(2, 9);
    const b = rng.int(2, 9);
    const cc = rng.int(2, 9);
    const d = rng.int(2, 9);
    const r = a + b * cc - d;
    return {
      type: "mc_result",
      ...base(1, I.calcula),
      promptLatex: `${a} + ${b} \\cdot ${cc} - ${d}`,
      promptMachine: rfMachine(c(r)),
      explanationCorrect: fill(T["B1.T3"].explicacioCorrecta, { a, b, c: cc, d, bc: b * cc, r }),
      options: [
        optRF("a", c(r), String(r), null),
        optRF("b", c((a + b) * cc - d), String((a + b) * cc - d), "B1_ORDRE_OPERACIONS"),
        optRF("c", c(a + b * (cc - d)), String(a + b * (cc - d)), "B1_ORDRE_OPERACIONS"),
        optRF("d", c((a + b) * (cc - d)), String((a + b) * (cc - d)), "B1_ORDRE_OPERACIONS"),
      ],
    };
  },
};

// ── B1.T4 · −n² + m (numèric) ──────────────────────────────────────────────
const T4: Template<Machine> = {
  id: "B1.T4",
  version: 1,
  block: BLOCK,
  type: "mc_result",
  level: 1,
  generate(rng): McDraft<Machine> {
    const n = rng.int(2, 6);
    const m = rng.int(1, 9);
    const r = m - n * n;
    return {
      type: "mc_result",
      ...base(1, I.calcula),
      promptLatex: `-${n}^{2} + ${m}`,
      promptMachine: rfMachine(c(r)),
      explanationCorrect: fill(T["B1.T4"].explicacioCorrecta, { n, m, n2: n * n, r }),
      options: [
        optRF("a", c(r), String(r), null),
        optRF("b", c(n * n + m), String(n * n + m), "B1_QUADRAT_NEGATIU"),
        optRF("c", c(m - 2 * n), String(m - 2 * n), "B1_QUADRAT_DOBLE"),
        optRF("d", c((m - n) ** 2), String((m - n) ** 2), "B1_ORDRE_OPERACIONS"),
      ],
    };
  },
};

// ── B1.T5 · valid_step: c − (ax − b) ⟹ … ───────────────────────────────────
const T5: Template<Machine> = {
  id: "B1.T5",
  version: 1,
  block: BLOCK,
  type: "valid_step",
  level: 2,
  generate(rng): ValidStepDraft<Machine> {
    const a = rng.int(2, 9);
    const b = rng.int(1, 9);
    const cc = rng.int(1, 9);
    const valid = rng.chance(0.5);
    const before = RF.of(lin(-a, cc + b));
    const after = valid ? before : RF.of(lin(-a, cc - b));
    const beforeLatex = `${cc} - (${L.poly(lin(a, -b))})`;
    const afterLatex = `${cc} - ${a}x ${valid ? "+" : "-"} ${b}`;
    const tx = T["B1.T5"];
    const options = valid
      ? [
          optReason("a", tx.raonsValid.correcta, null),
          optReason("b", tx.raonsValid.nomesPrimer, "B1_SIGNE_PARCIAL"),
          optReason(
            "c",
            tx.raonsValid.noEsPotTreure,
            "B1_SIGNE_OBLIDAT",
            tx.raonsValid.noEsPotTreureOverride,
          ),
        ]
      : [
          optReason("a", tx.raonsInvalid.correcta, null),
          optReason("b", tx.raonsInvalid.nomesPrimer, "B1_SIGNE_PARCIAL"),
          optReason("c", tx.raonsInvalid.talQual, "B1_SIGNE_OBLIDAT"),
        ];
    return {
      type: "valid_step",
      ...base(2, I.esValid),
      promptLatex: `${beforeLatex} \\;\\Longrightarrow\\; ${afterLatex}`,
      explanationCorrect: fill(valid ? tx.explicacioCorrectaValid : tx.explicacioCorrectaInvalid, {
        a,
        b,
      }),
      step: {
        beforeLatex,
        afterLatex,
        beforeMachine: rfMachine(before),
        afterMachine: rfMachine(after),
        valid,
        errorTag: valid ? null : "B1_SIGNE_PARCIAL",
      },
      options,
    };
  },
};

// ── B1.T6 · find_error: k(x − p) − (x − q) ─────────────────────────────────
const T6: Template<Machine> = {
  id: "B1.T6",
  version: 1,
  block: BLOCK,
  type: "find_error",
  level: 3,
  generate(rng): FindErrorDraft<Machine> {
    const k = rng.int(2, 5);
    const p = rng.int(1, 9);
    const q = intExcept(rng, 1, 9, p);
    const prompt = RF.of(lin(k - 1, q - k * p));
    const step = (latex: string, a: number, b: number) => ({
      latex,
      machine: rfMachine(RF.of(lin(a, b))),
    });
    // Correctes
    const s0 = step(`${k}x - ${k * p} - (${L.poly(lin(1, -q))})`, k - 1, q - k * p);
    const s1 = step(`${k}x - ${k * p} - x + ${q}`, k - 1, q - k * p);
    const s2 = step(L.poly(lin(k - 1, q - k * p)), k - 1, q - k * p);
    const roll = rng.next();
    let steps: (typeof s0)[];
    let errorIndex: number | null;
    let injectedTag: string | null;
    if (roll < 0.2) {
      steps = [s0, s1, s2];
      errorIndex = null;
      injectedTag = null;
    } else if (roll < 0.6) {
      // El k només multiplica la x: kx − p − (x − q) → kx − p − x + q → (k−1)x + (q − p)
      steps = [
        step(`${k}x - ${p} - (${L.poly(lin(1, -q))})`, k - 1, q - p),
        step(`${k}x - ${p} - x + ${q}`, k - 1, q - p),
        step(L.poly(lin(k - 1, q - p)), k - 1, q - p),
      ];
      errorIndex = 0;
      injectedTag = "B1_DISTRIB_PARCIAL";
    } else {
      // El menys només canvia el primer signe: kx − kp − x − q → (k−1)x + (−q − kp)
      steps = [
        s0,
        step(`${k}x - ${k * p} - x - ${q}`, k - 1, -q - k * p),
        step(L.poly(lin(k - 1, -q - k * p)), k - 1, -q - k * p),
      ];
      errorIndex = 1;
      injectedTag = "B1_SIGNE_PARCIAL";
    }
    const tagForCorrectStep = (i: number) =>
      i === 0 ? "B1_DISTRIB_PARCIAL" : i === 1 ? "B1_SIGNE_PARCIAL" : "B1_TERMES_NO_SEMBLANTS";
    const tx = T["B1.T6"];
    return {
      type: "find_error",
      ...base(3, I.onEsError),
      promptLatex: `${k}(${L.poly(lin(1, -p))}) - (${L.poly(lin(1, -q))})`,
      promptMachine: rfMachine(prompt),
      explanationCorrect: fill(
        errorIndex === null ? tx.explicacioSenseError : tx.explicacioCorrecta,
        {
          k,
          p,
          q,
          kp: k * p,
          k1: k - 1,
          r: q - k * p,
        },
      ),
      steps,
      errorIndex,
      options: findErrorOptions(steps, errorIndex, injectedTag, tagForCorrectStep),
    };
  },
};

export const B1_TEMPLATES: Template<Machine>[] = [T1, T2, T3, T4, T5, T6];
