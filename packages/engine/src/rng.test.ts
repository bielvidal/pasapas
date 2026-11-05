import { describe, expect, it } from "vitest";
import { deriveSeed, mulberry32, normalizeSeed } from "./rng";

describe("mulberry32", () => {
  it("és determinista", () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    const xs = Array.from({ length: 20 }, () => a.next());
    const ys = Array.from({ length: 20 }, () => b.next());
    expect(xs).toEqual(ys);
  });
  it("int cobreix els extrems", () => {
    const rng = mulberry32(7);
    const seen = new Set<number>();
    for (let i = 0; i < 2000; i++) seen.add(rng.int(2, 5));
    expect([...seen].sort()).toEqual([2, 3, 4, 5]);
  });
  it("shuffle és una permutació", () => {
    const rng = mulberry32(3);
    const out = rng.shuffle([1, 2, 3, 4, 5, 6]);
    expect(out.slice().sort()).toEqual([1, 2, 3, 4, 5, 6]);
  });
  it("normalizeSeed evita el 0 i deriveSeed canvia la llavor", () => {
    expect(normalizeSeed(0)).not.toBe(0);
    expect(deriveSeed(1, 0)).not.toBe(deriveSeed(1, 1));
    expect(deriveSeed(1, 0)).toBe(deriveSeed(1, 0));
  });
});
