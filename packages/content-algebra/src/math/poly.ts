import { Q, gcd, lcm, abs } from "./rational";

/**
 * Polinomi en una variable amb coeficients racionals exactes.
 * `coeffs[i]` és el coeficient de x^i. Sempre sense zeros al final (el 0 és `[]`). Immutable.
 */
export class Poly {
  readonly coeffs: readonly Q[];

  private constructor(coeffs: readonly Q[]) {
    this.coeffs = coeffs;
  }

  static from(coeffs: readonly (Q | number)[]): Poly {
    const cs = coeffs.map((c) => (c instanceof Q ? c : Q.of(c)));
    let end = cs.length;
    while (end > 0 && cs[end - 1]!.isZero()) end--;
    return new Poly(cs.slice(0, end));
  }

  static readonly ZERO = new Poly([]);
  static readonly ONE = new Poly([Q.ONE]);
  /** La variable x. */
  static readonly X = new Poly([Q.ZERO, Q.ONE]);

  static constant(c: Q | number): Poly {
    return Poly.from([c]);
  }
  /** a·x + b */
  static linear(a: Q | number, b: Q | number): Poly {
    return Poly.from([b, a]);
  }
  /** x^k */
  static xPow(k: number): Poly {
    const cs: Q[] = Array.from({ length: k + 1 }, () => Q.ZERO);
    cs[k] = Q.ONE;
    return Poly.from(cs);
  }
  /** (x − r1)(x − r2)… */
  static fromRoots(...roots: (Q | number)[]): Poly {
    return roots.reduce<Poly>(
      (p, r) =>
        p.mul(Poly.linear(1, Q.of(r instanceof Q ? r.n : r, r instanceof Q ? r.d : 1).neg())),
      Poly.ONE,
    );
  }

  /** Grau; −1 per al polinomi zero. */
  get degree(): number {
    return this.coeffs.length - 1;
  }
  isZero(): boolean {
    return this.coeffs.length === 0;
  }
  isConstant(): boolean {
    return this.coeffs.length <= 1;
  }
  coeff(i: number): Q {
    return this.coeffs[i] ?? Q.ZERO;
  }
  get leading(): Q {
    return this.coeffs[this.coeffs.length - 1] ?? Q.ZERO;
  }

  add(o: Poly): Poly {
    const n = Math.max(this.coeffs.length, o.coeffs.length);
    return Poly.from(Array.from({ length: n }, (_, i) => this.coeff(i).add(o.coeff(i))));
  }
  sub(o: Poly): Poly {
    return this.add(o.neg());
  }
  neg(): Poly {
    return new Poly(this.coeffs.map((c) => c.neg()));
  }
  scale(k: Q | number): Poly {
    const kk = k instanceof Q ? k : Q.of(k);
    return Poly.from(this.coeffs.map((c) => c.mul(kk)));
  }
  mul(o: Poly): Poly {
    if (this.isZero() || o.isZero()) return Poly.ZERO;
    const out: Q[] = Array.from({ length: this.coeffs.length + o.coeffs.length - 1 }, () => Q.ZERO);
    this.coeffs.forEach((a, i) => {
      o.coeffs.forEach((b, j) => {
        out[i + j] = out[i + j]!.add(a.mul(b));
      });
    });
    return Poly.from(out);
  }
  pow(k: number): Poly {
    let r = Poly.ONE;
    for (let i = 0; i < k; i++) r = r.mul(this);
    return r;
  }
  eval(x: Q): Q {
    let r = Q.ZERO;
    for (let i = this.coeffs.length - 1; i >= 0; i--) r = r.mul(x).add(this.coeffs[i]!);
    return r;
  }
  equals(o: Poly): boolean {
    return (
      this.coeffs.length === o.coeffs.length && this.coeffs.every((c, i) => c.equals(o.coeffs[i]!))
    );
  }

  /** Divisió euclidiana: [quocient, residu]. */
  divmod(o: Poly): [Poly, Poly] {
    if (o.isZero()) throw new RangeError("divisió per polinomi zero");
    let r = this as Poly;
    let qq = Poly.ZERO;
    while (!r.isZero() && r.degree >= o.degree) {
      const k = r.degree - o.degree;
      const c = r.leading.div(o.leading);
      const term = Poly.xPow(k).scale(c);
      qq = qq.add(term);
      r = r.sub(term.mul(o));
    }
    return [qq, r];
  }

  /** Mònic (coeficient principal 1). */
  monic(): Poly {
    if (this.isZero()) return this;
    return this.scale(this.leading.inv());
  }

  /** mcd mònic (Euclides). gcd(p, 0) = p mònic. */
  static gcd(a: Poly, b: Poly): Poly {
    while (!b.isZero()) [a, b] = [b, a.divmod(b)[1]];
    return a.monic();
  }

  /**
   * Coeficients enters primitius: multiplica pel mcm de denominadors i divideix pel mcd
   * dels numeradors. Retorna [polinomi primitiu, factor racional] amb this = factor · primitiu.
   */
  primitive(): [Poly, Q] {
    if (this.isZero()) return [Poly.ZERO, Q.ONE];
    const L = this.coeffs.reduce((acc, c) => lcm(acc, c.d), 1n);
    const ints = this.coeffs.map((c) => (c.n * L) / c.d);
    const G = ints.reduce((acc, v) => gcd(acc, v), 0n);
    const sign = this.leading.isNegative() ? -1n : 1n;
    const prim = Poly.from(ints.map((v) => Q.of((v * sign) / G)));
    return [prim, Q.of(G * sign, L)];
  }

  /** mcd dels coeficients enters (del polinomi primitivitzat del denominador comú). */
  integerContent(): bigint {
    if (this.isZero()) return 0n;
    const L = this.coeffs.reduce((acc, c) => lcm(acc, c.d), 1n);
    return this.coeffs.map((c) => abs((c.n * L) / c.d)).reduce((acc, v) => gcd(acc, v), 0n);
  }

  toString(): string {
    if (this.isZero()) return "0";
    return this.coeffs
      .map((c, i) => `${c.toString()}x^${i}`)
      .reverse()
      .join(" + ");
  }
}
