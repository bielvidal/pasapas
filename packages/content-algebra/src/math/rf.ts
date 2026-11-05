import { Poly } from "./poly";
import { Q, gcd, lcm } from "./rational";

/** Funció racional num/den amb polinomis exactes. den ≠ 0. Immutable. */
export class RF {
  readonly num: Poly;
  readonly den: Poly;

  constructor(num: Poly, den: Poly = Poly.ONE) {
    if (den.isZero()) throw new RangeError("denominador zero");
    this.num = num;
    this.den = den;
  }

  static of(num: Poly | Q | number, den: Poly | Q | number = 1): RF {
    const toP = (v: Poly | Q | number): Poly => (v instanceof Poly ? v : Poly.constant(v));
    return new RF(toP(num), toP(den));
  }
  static readonly X = new RF(Poly.X);
  static readonly ONE = new RF(Poly.ONE);
  static readonly ZERO = new RF(Poly.ZERO);

  add(o: RF): RF {
    return new RF(this.num.mul(o.den).add(o.num.mul(this.den)), this.den.mul(o.den));
  }
  sub(o: RF): RF {
    return this.add(o.neg());
  }
  neg(): RF {
    return new RF(this.num.neg(), this.den);
  }
  mul(o: RF): RF {
    return new RF(this.num.mul(o.num), this.den.mul(o.den));
  }
  div(o: RF): RF {
    if (o.num.isZero()) throw new RangeError("divisió per zero");
    return new RF(this.num.mul(o.den), this.den.mul(o.num));
  }
  inv(): RF {
    return RF.ONE.div(this);
  }
  pow(k: number): RF {
    return new RF(this.num.pow(k), this.den.pow(k));
  }

  /** Igualtat com a funcions racionals (producte creuat exacte). Ignora el domini. */
  equals(o: RF): boolean {
    return this.num.mul(o.den).equals(o.num.mul(this.den));
  }

  isZero(): boolean {
    return this.num.isZero();
  }

  /** Numerador i denominador amb coeficients enters, sense contingut comú, den amb principal > 0. */
  private static normalizeIntegers(num: Poly, den: Poly): [Poly, Poly] {
    const L = [...num.coeffs, ...den.coeffs].reduce((acc, c) => lcm(acc, c.d), 1n);
    const ints = (p: Poly): bigint[] => p.coeffs.map((c) => (c.n * L) / c.d);
    const ni = ints(num);
    const di = ints(den);
    const content = [...ni, ...di].reduce((acc, v) => gcd(acc, v), 0n) || 1n;
    const sign = (di[di.length - 1] ?? 1n) < 0n ? -1n : 1n;
    return [
      Poly.from(ni.map((v) => Q.of((v * sign) / content))),
      Poly.from(di.map((v) => Q.of((v * sign) / content))),
    ];
  }

  /** Forma reduïda canònica: mcd polinòmic fora, coeficients enters primitius, den principal > 0. */
  reduced(): RF {
    if (this.num.isZero()) return RF.ZERO;
    const g = Poly.gcd(this.num, this.den);
    const [n, d] = RF.normalizeIntegers(this.num.divmod(g)[0], this.den.divmod(g)[0]);
    return new RF(n, d);
  }

  /**
   * Es pot simplificar? Cert si numerador i denominador comparteixen un factor polinòmic
   * (grau ≥ 1) o, escrits amb coeficients enters, un factor enter > 1 (p. ex. (3x+12)/3).
   * (x+6)/6 → fals. (x+a)/(x+b) amb a≠b → fals. 2/4 → cert.
   */
  isSimplifiable(): boolean {
    if (this.num.isZero()) return false;
    if (Poly.gcd(this.num, this.den).degree >= 1) return true;
    const L = [...this.num.coeffs, ...this.den.coeffs].reduce((acc, c) => lcm(acc, c.d), 1n);
    const ints = [...this.num.coeffs, ...this.den.coeffs].map((c) => (c.n * L) / c.d);
    const content = ints.reduce((acc, v) => gcd(acc, v), 0n);
    return content > 1n;
  }

  /** Clau canònica (igual ⇔ mateixa funció racional). */
  key(): string {
    const r = this.reduced();
    return `${r.num.toString()}|${r.den.toString()}`;
  }

  eval(x: Q): Q | null {
    const d = this.den.eval(x);
    if (d.isZero()) return null;
    return this.num.eval(x).div(d);
  }
}
