/** Utilitats compartides per les plantilles de tots els blocs. */
import type { Rng, Step } from "@pasapas/engine";
import { COMU } from "../../texts/ca/comu";
import type { AlgOption, Machine } from "../machine";

/** Enter dins d'un interval que no compleixi `bad` (o diferent d'un valor). */
export function intExcept(
  rng: Rng,
  min: number,
  max: number,
  bad: number | ((v: number) => boolean),
): number {
  const isBad = typeof bad === "number" ? (v: number) => v === bad : bad;
  let v = rng.int(min, max);
  let guard = 0;
  while (isBad(v) && guard++ < 1000) v = rng.int(min, max);
  if (isBad(v)) throw new Error("intExcept: cap valor vàlid");
  return v;
}

export const mcd = (a: number, b: number): number => {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a;
};
export const mcm = (a: number, b: number): number => (a * b) / mcd(a, b);

export const baseOf =
  (block: string) =>
  (
    level: 1 | 2 | 3,
    instruction: string,
  ): { block: string; level: 1 | 2 | 3; instruction: string } => ({
    block,
    level,
    instruction,
  });

/** Variant d'un pas d'un valid_step: `tag === null` ⇒ vàlid. */
export interface StepVariant {
  afterLatex: string;
  after: Machine;
  tag: string | null;
}
export interface PoolEntry<K extends string = string> {
  key: K;
  beforeLatex: string;
  before: Machine;
  variants: StepVariant[];
}

/** Tria una variant: al 50 % vàlida/invàlida quan l'entrada en té de les dues menes. */
export function pickVariant(rng: Rng, entry: PoolEntry): StepVariant {
  const valids = entry.variants.filter((v) => v.tag === null);
  const invalids = entry.variants.filter((v) => v.tag !== null);
  const pool =
    valids.length && invalids.length ? (rng.chance(0.5) ? valids : invalids) : entry.variants;
  return rng.pick(pool);
}

/** Opcions d'un find_error: un per pas («step:i») + «Tots els passos són correctes». */
export function findErrorOptions(
  steps: Step<Machine>[],
  errorIndex: number | null,
  injectedTag: string | null,
  tagForCorrectStep: (i: number) => string,
): AlgOption[] {
  const options: AlgOption[] = steps.map((s, i) => ({
    id: `step:${i}`,
    latex: s.latex,
    correct: i === errorIndex,
    errorTag: i === errorIndex ? null : tagForCorrectStep(i),
    key: `step:${i}`,
  }));
  options.push({
    id: "none",
    latex: "",
    text: COMU.opcions.totsCorrectes,
    correct: errorIndex === null,
    errorTag: errorIndex === null ? null : injectedTag,
    key: "none",
  });
  return options;
}

/** Coeficient davant d'una expressió entre parèntesis: 1 → «», −1 → «-», 3 → «3». */
export function coefStr(c: number): string {
  if (c === 1) return "";
  if (c === -1) return "-";
  return String(c);
}
