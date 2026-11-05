/**
 * Resolució exacta d'equacions en x per a la verificació de B6 i B7: arrels racionals d'un
 * polinomi (teorema de l'arrel racional) i conjunts solució comparables.
 */
import { Poly } from "./poly";
import { Q, abs, gcd } from "./rational";
import type { RF } from "./rf";

function divisors(n: bigint): bigint[] {
  n = abs(n);
  const out: bigint[] = [];
  for (let d = 1n; d * d <= n; d++) {
    if (n % d === 0n) {
      out.push(d);
      if (d * d !== n) out.push(n / d);
    }
  }
  return out;
}

/** Arrels racionals (sense repeticions) i el residu mònic sense arrels racionals. */
export function rationalRoots(p: Poly): { roots: Q[]; residual: Poly } {
  if (p.isZero()) throw new RangeError("polinomi zero");
  const roots: Q[] = [];
  let cur = p;
  // x = 0
  while (cur.degree >= 1 && cur.coeff(0).isZero()) {
    if (!roots.some((r) => r.isZero())) roots.push(Q.ZERO);
    cur = cur.divmod(Poly.X)[0];
  }
  for (;;) {
    if (cur.degree < 1) break;
    const [prim] = cur.primitive();
    const a0 = prim.coeff(0).n;
    const an = prim.leading.n;
    let found: Q | null = null;
    outer: for (const pn of divisors(a0)) {
      for (const qd of divisors(an)) {
        if (gcd(pn, qd) !== 1n) continue;
        for (const s of [1n, -1n]) {
          const r = Q.of(s * pn, qd);
          if (prim.eval(r).isZero()) {
            found = r;
            break outer;
          }
        }
      }
    }
    if (found === null) break;
    if (!roots.some((r) => r.equals(found!))) roots.push(found);
    cur = cur.divmod(Poly.linear(1, found.neg()))[0];
  }
  roots.sort((a, b) => a.compare(b));
  return { roots, residual: cur.isZero() ? Poly.ONE : cur.monic() };
}

/** El residu (sense arrels racionals) té arrels reals? null = no es pot saber (grau ≥ 3). */
export function residualHasRealRoots(res: Poly): boolean | null {
  if (res.degree <= 0) return false;
  if (res.degree === 1) return true; // no hauria de passar (tindria arrel racional)
  if (res.degree === 2) {
    const a = res.coeff(2);
    const b = res.coeff(1);
    const c = res.coeff(0);
    return (
      b
        .mul(b)
        .sub(a.mul(c).mul(Q.of(4)))
        .sign() > 0
    );
  }
  return null;
}

/**
 * Conjunt solució d'una equació en x. `all`: qualsevol x. Si no, `roots` (racionals, ja sense
 * les que anul·len un denominador) i `residual` (factor mònic del numerador sense arrels
 * racionals: ONE si no n'hi ha).
 */
export type SolSet = { all: true } | { all: false; roots: Q[]; residual: Poly };

export const SOL_NONE: SolSet = { all: false, roots: [], residual: Poly.ONE };
export const SOL_ALL: SolSet = { all: true };
export const solOf = (...roots: (Q | number)[]): SolSet => ({
  all: false,
  roots: roots.map((r) => (r instanceof Q ? r : Q.of(r))).sort((a, b) => a.compare(b)),
  residual: Poly.ONE,
});
/** {+√r, −√r} amb r > 0 no quadrat perfecte (si r fos quadrat, usa solOf). */
export const solPmSqrt = (r: Q | number): SolSet => ({
  all: false,
  roots: [],
  residual: Poly.from([(r instanceof Q ? r : Q.of(r)).neg(), 0, 1]),
});

/** Solucions de lhs = rhs (funcions racionals en x). null si no es pot decidir exactament. */
export function solveEquation(lhs: RF, rhs: RF): SolSet | null {
  const f = lhs.sub(rhs);
  const den = rationalRoots(f.den);
  if (f.num.isZero()) return den.roots.length === 0 ? SOL_ALL : null; // «tot x» amb forats: no ho modelem
  const num = rationalRoots(f.num);
  const roots = num.roots.filter((r) => !den.roots.some((d) => d.equals(r)));
  return { all: false, roots, residual: num.residual };
}

/**
 * √(x + a) = x − b: arrels racionals de (x − b)² − (x + a) que compleixen x ≥ b (el costat dret no
 * pot ser negatiu) i x + a ≥ 0. null si el polinomi té arrels no racionals (no decidible).
 */
export function solveSqrtEquation(a: Q | number, b: Q | number): SolSet | null {
  const aq = a instanceof Q ? a : Q.of(a);
  const bq = b instanceof Q ? b : Q.of(b);
  const p = Poly.linear(1, bq.neg()).pow(2).sub(Poly.linear(1, aq));
  const { roots, residual } = rationalRoots(p);
  if (residual.degree > 0) return null;
  return {
    all: false,
    roots: roots.filter((r) => r.compare(bq) >= 0 && r.add(aq).sign() >= 0),
    residual: Poly.ONE,
  };
}

/** Igualtat de conjunts solució. null si no es pot decidir (residu de grau ≥ 3). */
export function solSetEquals(a: SolSet, b: SolSet): boolean | null {
  if (a.all || b.all) return a.all === b.all;
  if (a.roots.length !== b.roots.length) return false;
  if (!a.roots.every((r, i) => r.equals(b.roots[i]!))) return false;
  const ra = residualHasRealRoots(a.residual);
  const rb = residualHasRealRoots(b.residual);
  if (ra === null || rb === null) return null;
  if (!ra && !rb) return true; // cap arrel real més: mateix conjunt
  return a.residual.equals(b.residual);
}

export function solSetKey(s: SolSet): string {
  if (s.all) return "all";
  return `${s.roots.map((r) => r.toString()).join(",")}|${s.residual.toString()}`;
}
