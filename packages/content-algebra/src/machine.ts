import type { Option } from "@pasapas/engine";
import type { Mono } from "./math/mono";
import type { Poly } from "./math/poly";
import type { RF } from "./math/rf";
import { solSetKey, type SolSet } from "./math/solve";

/**
 * Forma màquina de les opcions, enunciats i passos. El motor no la mira; `verify.ts` sí.
 * - rf: funció racional en x (polinomis, fraccions algebraiques i també números: RF constant).
 * - mono: monomi amb exponents racionals (B3: potències, arrels, exponents negatius).
 * - sqrtpoly: √p(x) per a x ≥ 0 (B3: arrel d'una suma; es compara elevant al quadrat).
 * - eq: equació lhs = rhs en x (B6, B7); radeq: √(x + a) = x − b.
 * - sol: conjunt solució (opcions de «Resol»).
 * - claim: afirmacions de text («No es pot simplificar», «No es pot factoritzar»); wrong_form és
 *   un distractor de forma incorrecta per construcció (mai pot ser la correcta).
 */
export type Machine =
  | { kind: "rf"; rf: RF }
  | { kind: "mono"; m: Mono }
  | { kind: "sqrtpoly"; p: Poly }
  | { kind: "eq"; lhs: RF; rhs: RF }
  | { kind: "radeq"; a: number; b: number }
  | { kind: "sol"; s: SolSet }
  | { kind: "claim"; claim: "no_simplifica" | "no_factoritza" | "wrong_form" };

export type AlgOption = Option<Machine>;

export const rfMachine = (rf: RF): Machine => ({ kind: "rf", rf });
export const monoMachine = (m: Mono): Machine => ({ kind: "mono", m });
export const sqrtMachine = (p: Poly): Machine => ({ kind: "sqrtpoly", p });
export const eqMachine = (lhs: RF, rhs: RF): Machine => ({ kind: "eq", lhs, rhs });
export const radeqMachine = (a: number, b: number): Machine => ({ kind: "radeq", a, b });
export const solMachine = (s: SolSet): Machine => ({ kind: "sol", s });
export const CLAIM_NO_SIMPLIFICA: Machine = { kind: "claim", claim: "no_simplifica" };
export const CLAIM_NO_FACTORITZA: Machine = { kind: "claim", claim: "no_factoritza" };
export const CLAIM_WRONG_FORM: Machine = { kind: "claim", claim: "wrong_form" };

/** Clau canònica d'una forma màquina (dues opcions amb la mateixa clau són «iguals»). */
export function machineKey(m: Machine): string {
  switch (m.kind) {
    case "rf":
      return `rf:${m.rf.key()}`;
    case "mono":
      return `mono:${m.m.key()}`;
    case "sqrtpoly":
      return `sqrt:${m.p.toString()}`;
    case "eq":
      return `eq:${m.lhs.sub(m.rhs).key()}`;
    case "radeq":
      return `radeq:${m.a},${m.b}`;
    case "sol":
      return `sol:${solSetKey(m.s)}`;
    case "claim":
      return `claim:${m.claim}`;
  }
}

function withOverride(o: AlgOption, override?: string): AlgOption {
  if (override) o.explanationOverride = override;
  return o;
}

/** Opció amb forma màquina (LaTeX). `tag === null` ⇒ correcta. */
export function opt(
  id: string,
  machine: Machine,
  latex: string,
  tag: string | null,
  override?: string,
): AlgOption {
  return withOverride(
    { id, latex, correct: tag === null, errorTag: tag, machine, key: machineKey(machine) },
    override,
  );
}

/** Opció amb forma racional. */
export function optRF(
  id: string,
  rf: RF,
  latex: string,
  tag: string | null,
  override?: string,
): AlgOption {
  return opt(id, rfMachine(rf), latex, tag, override);
}

/** Opció de text pla amb forma màquina (p. ex. «No té solució», «No es pot simplificar»). */
export function optText(
  id: string,
  machine: Machine,
  text: string,
  tag: string | null,
  override?: string,
): AlgOption {
  return withOverride(
    {
      id,
      latex: "",
      text,
      correct: tag === null,
      errorTag: tag,
      machine,
      key: machineKey(machine),
    },
    override,
  );
}

/** Opció de text pla «No es pot simplificar». */
export function optNoSimplifica(id: string, text: string, tag: string | null): AlgOption {
  return optText(id, CLAIM_NO_SIMPLIFICA, text, tag);
}

/** Raó d'un valid_step (text, sense forma màquina). */
export function optReason(
  id: string,
  text: string,
  tag: string | null,
  override?: string,
): AlgOption {
  return withOverride(
    { id, latex: "", text, correct: tag === null, errorTag: tag, key: `text:${text}` },
    override,
  );
}
