/**
 * `fmt`: format LaTeX de les expressions (convencions del catàleg):
 * 1x → x · −1x → −x · + −3 → − 3 · x¹ → x · x⁰ → 1 · fraccions irreductibles ·
 * signe davant de la fracció (−2/3, mai 2/−3).
 */
import type { Poly } from "./poly";
import { Q } from "./rational";

/** Un racional en LaTeX: 3, -3, \frac{2}{3}, -\frac{2}{3}. */
export function num(v: Q | number): string {
  const r = v instanceof Q ? v : Q.of(v);
  if (r.isInteger()) return r.n.toString();
  const a = r.abs();
  return `${r.isNegative() ? "-" : ""}\\frac{${a.n}}{${a.d}}`;
}

/** Coeficient davant d'una part literal: 1 → "", −1 → "-", 3 → "3", 2/3 → \frac{2}{3}. */
function coeffPrefix(c: Q): string {
  if (c.isOne()) return "";
  if (c.equals(Q.ONE.neg())) return "-";
  return num(c);
}

/** x^k amb les convencions (x^0 → 1, x^1 → x). */
export function pow(base: string, k: number): string {
  if (k === 0) return "1";
  if (k === 1) return base;
  return `${base}^{${k}}`;
}

/** Un terme c·x^k ja amb signe. */
function term(c: Q, k: number, variable: string): string {
  if (k === 0) return num(c);
  return `${coeffPrefix(c)}${pow(variable, k)}`;
}

/** Polinomi en potències decreixents: 3x^{2} - x + 4. */
export function poly(p: Poly, variable = "x"): string {
  if (p.isZero()) return "0";
  let out = "";
  for (let k = p.degree; k >= 0; k--) {
    const c = p.coeff(k);
    if (c.isZero()) continue;
    const t = term(c.abs(), k, variable);
    if (out === "") out = c.isNegative() ? `-${t}` : t;
    else out += c.isNegative() ? ` - ${t}` : ` + ${t}`;
  }
  return out;
}

/** Nombre de termes visibles d'un polinomi. */
export function termCount(p: Poly): number {
  return p.coeffs.filter((c) => !c.isZero()).length;
}

export function frac(n: string, d: string): string {
  return `\\frac{${n}}{${d}}`;
}

/** Posa parèntesis si la cadena té més d'un terme a primer nivell (hi ha un + o − fora de \frac{}). */
export function paren(s: string): string {
  return needsParens(s) ? `(${s})` : s;
}

export function needsParens(s: string): boolean {
  let depth = 0;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (ch === "{") depth++;
    else if (ch === "}") depth--;
    else if (depth === 0 && i > 0 && (ch === "+" || ch === "-")) return true;
  }
  return false;
}

/** Producte de factors: els que tenen més d'un terme van entre parèntesis. x(x + 3), (x+1)(x-1). */
export function prod(...factors: string[]): string {
  return (
    factors
      .filter((f) => f !== "1")
      .map(paren)
      .join("") || "1"
  );
}

/** Multiplicació explícita amb punt: 3 \cdot 4. */
export function cdot(...factors: string[]): string {
  return factors.join(" \\cdot ");
}

/** a ± b amb el signe ben posat quan b és negatiu. */
export function plus(a: string, b: string): string {
  return b.startsWith("-") ? `${a} - ${b.slice(1)}` : `${a} + ${b}`;
}

export const fmt = { num, pow, poly, frac, paren, prod, cdot, plus, termCount };
