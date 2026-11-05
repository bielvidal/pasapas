/**
 * Racionals exactes amb BigInt. Sempre normalitzats: denominador > 0 i fracció irreductible.
 * Són immutables.
 */
export class Q {
  readonly n: bigint;
  readonly d: bigint;

  private constructor(n: bigint, d: bigint) {
    this.n = n;
    this.d = d;
  }

  static of(n: bigint | number, d: bigint | number = 1n): Q {
    let N = BigInt(n);
    let D = BigInt(d);
    if (D === 0n) throw new RangeError("denominador 0");
    if (D < 0n) {
      N = -N;
      D = -D;
    }
    const g = gcd(abs(N), D);
    return new Q(N / g, D / g);
  }

  static readonly ZERO = new Q(0n, 1n);
  static readonly ONE = new Q(1n, 1n);

  isZero(): boolean {
    return this.n === 0n;
  }
  isOne(): boolean {
    return this.n === 1n && this.d === 1n;
  }
  isInteger(): boolean {
    return this.d === 1n;
  }
  isNegative(): boolean {
    return this.n < 0n;
  }
  sign(): -1 | 0 | 1 {
    return this.n < 0n ? -1 : this.n > 0n ? 1 : 0;
  }
  neg(): Q {
    return new Q(-this.n, this.d);
  }
  abs(): Q {
    return this.n < 0n ? this.neg() : this;
  }
  add(o: Q): Q {
    return Q.of(this.n * o.d + o.n * this.d, this.d * o.d);
  }
  sub(o: Q): Q {
    return this.add(o.neg());
  }
  mul(o: Q): Q {
    return Q.of(this.n * o.n, this.d * o.d);
  }
  div(o: Q): Q {
    if (o.isZero()) throw new RangeError("divisió per 0");
    return Q.of(this.n * o.d, this.d * o.n);
  }
  inv(): Q {
    return Q.ONE.div(this);
  }
  pow(k: number): Q {
    if (!Number.isInteger(k)) throw new RangeError("exponent no enter");
    if (k < 0) return this.inv().pow(-k);
    return Q.of(this.n ** BigInt(k), this.d ** BigInt(k));
  }
  equals(o: Q): boolean {
    return this.n === o.n && this.d === o.d;
  }
  compare(o: Q): -1 | 0 | 1 {
    const l = this.n * o.d;
    const r = o.n * this.d;
    return l < r ? -1 : l > r ? 1 : 0;
  }
  toString(): string {
    return this.d === 1n ? this.n.toString() : `${this.n}/${this.d}`;
  }
  toNumber(): number {
    return Number(this.n) / Number(this.d);
  }
}

export function abs(a: bigint): bigint {
  return a < 0n ? -a : a;
}

export function gcd(a: bigint, b: bigint): bigint {
  a = abs(a);
  b = abs(b);
  while (b !== 0n) [a, b] = [b, a % b];
  return a === 0n ? 1n : a;
}

export function lcm(a: bigint, b: bigint): bigint {
  return (abs(a) / gcd(a, b)) * abs(b);
}

export const q = (n: bigint | number, d: bigint | number = 1): Q => Q.of(n, d);
