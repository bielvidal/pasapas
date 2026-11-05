/**
 * Verificació automàtica (§5.5): cap «resposta correcta» pot ser incorrecta. S'executa als
 * tests de propietat amb centenars de llavors per plantilla, i es pot cridar en desenvolupament.
 * Tot és exacte (racionals, polinomis, conjunts solució): no hi ha toleràncies.
 */
import type { Item } from "@pasapas/engine";
import { TAGS } from "../texts/ca";
import type { Machine } from "./machine";
import type { Mono } from "./math/mono";
import { Poly } from "./math/poly";
import { Q } from "./math/rational";
import { RF } from "./math/rf";
import {
  rationalRoots,
  solSetEquals,
  solveEquation,
  solveSqrtEquation,
  type SolSet,
} from "./math/solve";

/** Un monomi en x amb exponents enters ≥ 0 com a RF (per comparar-lo amb polinomis). */
function monoToRF(m: Mono): RF | null {
  let p = Poly.constant(m.coef);
  for (const [v, e] of m.exps) {
    if (v !== "x") return null;
    if (!e.isInteger()) return null;
    const k = Number(e.n);
    if (k >= 0) p = p.mul(Poly.xPow(k));
    else return new RF(Poly.constant(m.coef), Poly.xPow(-k));
  }
  return new RF(p);
}

function solSetOf(m: Machine): SolSet | null | undefined {
  if (m.kind === "eq") return solveEquation(m.lhs, m.rhs);
  if (m.kind === "radeq") return solveSqrtEquation(m.a, m.b);
  if (m.kind === "sol") return m.s;
  return undefined;
}

/**
 * Equivalència exacta entre dues formes màquina. `null` si no es pot decidir (p. ex. formes
 * incomparables): la verificació ho tracta com a problema.
 */
export function machineEquals(a: Machine, b: Machine): boolean | null {
  if (a.kind === "claim" || b.kind === "claim") return null;
  // racionals i monomis
  const ra = a.kind === "rf" ? a.rf : a.kind === "mono" ? monoToRF(a.m) : null;
  const rb = b.kind === "rf" ? b.rf : b.kind === "mono" ? monoToRF(b.m) : null;
  if (a.kind === "mono" && b.kind === "mono") return a.m.equals(b.m);
  if (ra && rb) return ra.equals(rb);
  // √p(x) = q(x) (x ≥ 0) ⇔ p = q² amb q ≥ 0 al domini (q polinomi de coeficients ≥ 0 o constant ≥ 0)
  if (a.kind === "sqrtpoly" || b.kind === "sqrtpoly") {
    const [s, o] = a.kind === "sqrtpoly" ? [a, b] : [b, a];
    if (s.kind !== "sqrtpoly") return null;
    if (o.kind === "sqrtpoly") return s.p.equals(o.p);
    const q = o.kind === "rf" ? o.rf : o.kind === "mono" ? monoToRF(o.m) : null;
    if (!q) return null;
    const nonNeg =
      q.num.coeffs.every((c) => c.sign() >= 0) && q.den.coeffs.every((c) => c.sign() >= 0);
    return nonNeg && q.num.mul(q.num).equals(s.p.mul(q.den).mul(q.den));
  }
  // equacions i conjunts solució
  const sa = solSetOf(a);
  const sb = solSetOf(b);
  if (sa === undefined || sb === undefined) return null;
  if (sa === null || sb === null) return null;
  return solSetEquals(sa, sb);
}

/** Un polinomi de grau 2 (o 1) amb coeficients enters és irreductible sobre Q? */
function irreducibleOverQ(p: Poly): boolean | null {
  if (p.degree <= 1) return p.degree === 1 ? p.integerContent() === 1n : null;
  if (p.degree === 2) {
    const { roots } = rationalRoots(p);
    return roots.length === 0 && p.integerContent() === 1n;
  }
  return null;
}

function claimIsTrue(
  claim: "no_simplifica" | "no_factoritza" | "wrong_form",
  prompt: Machine,
): boolean | null {
  if (claim === "wrong_form") return false;
  if (prompt.kind !== "rf") return null;
  if (claim === "no_simplifica") return !prompt.rf.isSimplifiable();
  if (!prompt.rf.den.isConstant()) return null;
  return irreducibleOverQ(prompt.rf.reduced().num);
}

export function verifyItem(item: Item<Machine>): string[] {
  const problems: string[] = [];
  const tagsUsed = new Set<string>();
  for (const o of item.options) if (o.errorTag) tagsUsed.add(o.errorTag);
  if (item.type === "valid_step" && item.step.errorTag) tagsUsed.add(item.step.errorTag);
  for (const t of tagsUsed) if (!TAGS[t]) problems.push(`error_tag desconegut: ${t}`);

  if (/\[\[\w+\]\]/.test(item.explanationCorrect))
    problems.push("explanationCorrect té paràmetres sense omplir");
  for (const o of item.options) {
    if (o.explanationOverride && /\[\[\w+\]\]/.test(o.explanationOverride)) {
      problems.push(`override de ${o.id} té paràmetres sense omplir`);
    }
    if (o.text && /\[\[\w+\]\]/.test(o.text))
      problems.push(`l'opció ${o.id} té paràmetres sense omplir`);
  }

  switch (item.type) {
    case "mc_result":
    case "next_step": {
      const prompt = item.promptMachine;
      if (!prompt) {
        problems.push("l'enunciat no té forma màquina");
        break;
      }
      for (const o of item.options) {
        const m = o.machine;
        if (!m) {
          problems.push(`l'opció ${o.id} no té forma màquina`);
          continue;
        }
        const eq = m.kind === "claim" ? claimIsTrue(m.claim, prompt) : machineEquals(m, prompt);
        const what = o.text ?? o.latex;
        if (eq === null) {
          problems.push(`no es pot verificar l'opció ${o.id} (${what}) contra l'enunciat`);
          continue;
        }
        if (o.correct && !eq)
          problems.push(`la correcta ${o.id} (${what}) NO equival a l'enunciat`);
        if (!o.correct && eq) problems.push(`el distractor ${o.id} (${what}) equival a l'enunciat`);
      }
      // La correcta ha d'estar simplificada de debò (si és racional).
      const correct = item.options.find((o) => o.correct);
      const cm = correct?.machine;
      if (cm?.kind === "rf" && cm.rf.isSimplifiable() && item.instruction === "Simplifica") {
        problems.push(`la correcta ${correct!.latex} encara es pot simplificar`);
      }
      break;
    }
    case "valid_step": {
      const before = item.step.beforeMachine;
      const after = item.step.afterMachine;
      if (!before || !after) {
        problems.push("el pas no té forma màquina");
        break;
      }
      const eq = machineEquals(before, after);
      if (eq === null) {
        problems.push("no es pot verificar el pas");
        break;
      }
      if (item.step.valid !== eq) {
        problems.push(
          `el pas està marcat ${item.step.valid ? "vàlid" : "invàlid"} però ${eq ? "SÍ" : "NO"} és una equivalència`,
        );
      }
      if (!item.step.valid && !item.step.errorTag) problems.push("pas invàlid sense errorTag");
      if (item.step.valid && item.step.errorTag) problems.push("pas vàlid amb errorTag");
      break;
    }
    case "find_error": {
      const prompt = item.promptMachine;
      const steps = item.steps.map((s) => s.machine);
      if (!prompt || steps.some((s) => !s)) {
        problems.push("find_error: falta forma màquina a l'enunciat o a algun pas");
        break;
      }
      const e = item.errorIndex;
      steps.forEach((s, i) => {
        const prev = i === 0 ? prompt : steps[i - 1]!;
        const eq = machineEquals(s!, prev);
        if (eq === null) {
          problems.push(`no es pot verificar el pas ${i}`);
          return;
        }
        if (e === null || i < e) {
          if (!eq) problems.push(`el pas ${i} (correcte) no equival a l'anterior`);
        } else if (i === e) {
          if (eq) problems.push(`el pas ${i} (erroni) equival a l'anterior: no hi ha error`);
        } else if (!eq) {
          problems.push(`el pas ${i} no és coherent amb el pas erroni ${e}`);
        }
      });
      break;
    }
  }
  return problems;
}

export { Q };
