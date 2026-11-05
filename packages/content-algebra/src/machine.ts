import type { Option } from "@pasapas/engine";
import type { RF } from "./math/rf";

/** Forma màquina de les opcions i passos d'àlgebra. El motor no la mira; `verify.ts` sí. */
export type Machine =
  | { kind: "rf"; rf: RF }
  | /** «No es pot simplificar»: és correcta si l'enunciat NO és simplificable. */ {
      kind: "claim";
      claim: "no_simplifica";
    };

export type AlgOption = Option<Machine>;

export const rfMachine = (rf: RF): Machine => ({ kind: "rf", rf });
export const CLAIM_NO_SIMPLIFICA: Machine = { kind: "claim", claim: "no_simplifica" };

/** Opció amb forma racional. `tag === null` ⇒ correcta. */
export function optRF(
  id: string,
  rf: RF,
  latex: string,
  tag: string | null,
  override?: string,
): AlgOption {
  const o: AlgOption = {
    id,
    latex,
    correct: tag === null,
    errorTag: tag,
    machine: rfMachine(rf),
    key: `rf:${rf.key()}`,
  };
  if (override) o.explanationOverride = override;
  return o;
}

/** Opció de text pla «No es pot simplificar». */
export function optNoSimplifica(id: string, text: string, tag: string | null): AlgOption {
  return {
    id,
    latex: "",
    text,
    correct: tag === null,
    errorTag: tag,
    machine: CLAIM_NO_SIMPLIFICA,
    key: "claim:no_simplifica",
  };
}

/** Raó d'un valid_step (text, sense forma màquina). */
export function optReason(
  id: string,
  text: string,
  tag: string | null,
  override?: string,
): AlgOption {
  const o: AlgOption = {
    id,
    latex: "",
    text,
    correct: tag === null,
    errorTag: tag,
    key: `text:${text}`,
  };
  if (override) o.explanationOverride = override;
  return o;
}
