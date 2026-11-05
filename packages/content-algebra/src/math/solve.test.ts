import { describe, expect, it } from "vitest";
import { Mono } from "./mono";
import { Poly } from "./poly";
import { Q } from "./rational";
import { RF } from "./rf";
import {
  rationalRoots,
  SOL_ALL,
  SOL_NONE,
  solOf,
  solPmSqrt,
  solSetEquals,
  solveEquation,
  solveSqrtEquation,
} from "./solve";

const x = RF.X;
const c = (v: number | Q) => RF.of(v);
const lin = (a: number, b: number) => RF.of(Poly.linear(a, b));

describe("rationalRoots", () => {
  it("troba arrels racionals i deixa el residu", () => {
    const p = Poly.fromRoots(0, 3, Q.of(-2, 5)).mul(Poly.from([2, 0, 1])); // x(x−3)(x+2/5)(x²+2)
    const { roots, residual } = rationalRoots(p);
    expect(roots.map(String)).toEqual(["-2/5", "0", "3"]);
    expect(residual.equals(Poly.from([2, 0, 1]))).toBe(true);
  });
  it("arrels repetides una sola vegada", () => {
    expect(rationalRoots(Poly.linear(1, -4).pow(2)).roots.map(String)).toEqual(["4"]);
  });
});

describe("solveEquation", () => {
  it("x² = kx → {0, k}", () => {
    expect(solSetEquals(solveEquation(x.pow(2), x.mul(c(5)))!, solOf(0, 5))).toBe(true);
    expect(solSetEquals(solveEquation(x.pow(2), x.mul(c(5)))!, solOf(5))).toBe(false);
  });
  it("sense solució i identitat", () => {
    expect(solSetEquals(solveEquation(lin(3, 2), lin(3, 7))!, SOL_NONE)).toBe(true);
    expect(solSetEquals(solveEquation(lin(3, 6), lin(3, 6))!, SOL_ALL)).toBe(true);
    expect(solSetEquals(solveEquation(lin(3, 2), lin(3, 7))!, SOL_ALL)).toBe(false);
  });
  it("solució que anul·la un denominador queda exclosa", () => {
    const k = 4;
    const den = Poly.linear(1, -k);
    const s = solveEquation(RF.of(Poly.linear(1, 3), den), RF.of(k + 3, den))!;
    expect(solSetEquals(s, SOL_NONE)).toBe(true);
    expect(solSetEquals(s, solOf(k))).toBe(false);
  });
  it("arrels irracionals: ±√r", () => {
    const s = solveEquation(x.pow(2), c(5))!;
    expect(solSetEquals(s, solPmSqrt(5))).toBe(true);
    expect(solSetEquals(s, solPmSqrt(3))).toBe(false);
    expect(solSetEquals(s, SOL_NONE)).toBe(false);
    // sense arrels reals = sense solució
    expect(solSetEquals(solveEquation(x.pow(2), c(-1))!, SOL_NONE)).toBe(true);
  });
  it("1/x = 1/2 + 1/3 → 6/5", () => {
    const s = solveEquation(x.inv(), c(Q.of(1, 2)).add(c(Q.of(1, 3))))!;
    expect(solSetEquals(s, solOf(Q.of(6, 5)))).toBe(true);
    expect(solSetEquals(s, solOf(5))).toBe(false);
  });
});

describe("solveSqrtEquation", () => {
  it("√(x + 1) = x − 1 → {3} (0 no val: costat dret negatiu)", () => {
    expect(solSetEquals(solveSqrtEquation(1, 1)!, solOf(3))).toBe(true);
    expect(solSetEquals(solveSqrtEquation(1, 1)!, solOf(0, 3))).toBe(false);
  });
});

describe("Mono", () => {
  it("producte, potència i igualtat", () => {
    const m = Mono.of(2, { x: 3 }).pow(2); // (2x³)² = 4x⁶
    expect(m.equals(Mono.of(4, { x: 6 }))).toBe(true);
    expect(Mono.x(Q.of(1, 2)).equals(Mono.x(Q.of(1, 2)))).toBe(true);
    expect(
      Mono.of(1, { x: 2, y: 3 })
        .div(Mono.of(1, { x: 2 }))
        .equals(Mono.of(1, { y: 3 })),
    ).toBe(true);
    expect(Mono.of(3, { x: 1 }).equals(Mono.of(3, { x: 1, y: 0 }))).toBe(true);
  });
});
