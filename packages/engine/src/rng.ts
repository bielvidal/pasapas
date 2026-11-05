/**
 * RNG determinista (mulberry32). Tot el motor i totes les plantilles passen per aquí:
 * mai `Math.random()` (regla §5.4 de l'especificació; ESLint ho prohibeix).
 */
export interface Rng {
  /** Llavor amb què s'ha creat aquest generador. */
  readonly seed: number;
  /** Nombre en [0, 1). */
  next(): number;
  /** Enter en [min, max], extrems inclosos. */
  int(min: number, max: number): number;
  /** Un element de la llista (la llista no pot ser buida). */
  pick<T>(items: readonly T[]): T;
  /** Còpia barrejada (Fisher–Yates). */
  shuffle<T>(items: readonly T[]): T[];
  /** Cert amb probabilitat p. */
  chance(p: number): boolean;
  /** Enter 32 bits positiu, útil com a llavor nova. */
  seed32(): number;
}

/** Normalitza qualsevol enter a un uint32 ≠ 0 vàlid com a llavor. */
export function normalizeSeed(seed: number): number {
  const s = Math.trunc(seed) >>> 0;
  return s === 0 ? 0x9e3779b9 : s;
}

/** Llavor derivada i-èsima (per regenerar quan dues opcions coincideixen, §5.4). */
export function deriveSeed(seed: number, i: number): number {
  let h = (normalizeSeed(seed) ^ ((i + 1) * 0x9e3779b9)) >>> 0;
  h = Math.imul(h ^ (h >>> 16), 0x85ebca6b) >>> 0;
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35) >>> 0;
  return normalizeSeed(h ^ (h >>> 16));
}

export function mulberry32(seed: number): Rng {
  let a = normalizeSeed(seed);
  const next = (): number => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const rng: Rng = {
    seed: a,
    next,
    int(min, max) {
      if (!Number.isInteger(min) || !Number.isInteger(max) || max < min) {
        throw new RangeError(`int(${min}, ${max}): interval invàlid`);
      }
      return min + Math.floor(next() * (max - min + 1));
    },
    pick(items) {
      if (items.length === 0) throw new RangeError("pick(): llista buida");
      return items[Math.floor(next() * items.length)] as (typeof items)[number];
    },
    shuffle(items) {
      const out = items.slice();
      for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1));
        const tmp = out[i] as (typeof out)[number];
        out[i] = out[j] as (typeof out)[number];
        out[j] = tmp;
      }
      return out;
    },
    chance(p) {
      return next() < p;
    },
    seed32() {
      return normalizeSeed(Math.floor(next() * 4294967296));
    },
  };
  return rng;
}
