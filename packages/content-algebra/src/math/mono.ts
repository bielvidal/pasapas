import { Q } from "./rational";

/**
 * Monomi exacte amb exponents racionals: coef · Π var^exp (p. ex. 4x^6, x^{1/2}, (8/3)x^2y^3).
 * Serveix per a B3 (propietats de les potències, exponents negatius i fraccionaris). Immutable.
 */
export class Mono {
  readonly coef: Q;
  /** Ordenat per nom de variable; sense exponents zero. */
  readonly exps: ReadonlyMap<string, Q>;

  private constructor(coef: Q, exps: ReadonlyMap<string, Q>) {
    this.coef = coef;
    this.exps = exps;
  }

  static of(coef: Q | number, exps: Record<string, Q | number> = {}): Mono {
    const c = coef instanceof Q ? coef : Q.of(coef);
    const m = new Map<string, Q>();
    for (const k of Object.keys(exps).sort()) {
      const e = exps[k]!;
      const eq = e instanceof Q ? e : Q.of(e);
      if (!eq.isZero() && !c.isZero()) m.set(k, eq);
    }
    return new Mono(c, m);
  }
  /** x^e */
  static x(e: Q | number, v = "x"): Mono {
    return Mono.of(1, { [v]: e });
  }

  exp(v: string): Q {
    return this.exps.get(v) ?? Q.ZERO;
  }
  mul(o: Mono): Mono {
    const exps: Record<string, Q> = {};
    for (const [k, e] of this.exps) exps[k] = e;
    for (const [k, e] of o.exps) exps[k] = (exps[k] ?? Q.ZERO).add(e);
    return Mono.of(this.coef.mul(o.coef), exps);
  }
  div(o: Mono): Mono {
    return this.mul(o.inv());
  }
  inv(): Mono {
    const exps: Record<string, Q> = {};
    for (const [k, e] of this.exps) exps[k] = e.neg();
    return Mono.of(this.coef.inv(), exps);
  }
  /** Potència amb exponent racional (el coeficient ha de quedar racional: només enters si coef ≠ 1). */
  pow(k: Q | number): Mono {
    const kq = k instanceof Q ? k : Q.of(k);
    const exps: Record<string, Q> = {};
    for (const [v, e] of this.exps) exps[v] = e.mul(kq);
    if (!kq.isInteger()) {
      if (!this.coef.isOne()) throw new RangeError("potència fraccionària d'un coeficient ≠ 1");
      return Mono.of(1, exps);
    }
    return Mono.of(this.coef.pow(Number(kq.n)), exps);
  }
  scale(c: Q | number): Mono {
    return this.mul(Mono.of(c));
  }
  equals(o: Mono): boolean {
    if (!this.coef.equals(o.coef) || this.exps.size !== o.exps.size) return false;
    for (const [k, e] of this.exps) if (!e.equals(o.exps.get(k) ?? Q.ZERO)) return false;
    return true;
  }
  /** Clau canònica. */
  key(): string {
    return `${this.coef}|${[...this.exps].map(([k, e]) => `${k}^${e}`).join("*")}`;
  }
}
