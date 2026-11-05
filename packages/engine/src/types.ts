/**
 * Tipus del motor. `M` és la "forma màquina" d'una opció o d'un pas: el motor no la interpreta,
 * només la transporta. El paquet de contingut (àlgebra) decideix què és i com es verifica.
 */

import type { Rng } from "./rng";

export type QuestionType = "mc_result" | "valid_step" | "find_error" | "next_step";
export type Level = 1 | 2 | 3;
export type Outcome = "correct" | "incorrect" | "skipped";

export interface Option<M = unknown> {
  /** Estable dins de l'ítem (p. ex. "a", "b"...; a find_error: "step:2" o "none"). */
  id: string;
  /** LaTeX de l'opció. Si `text` hi és, l'opció es mostra com a text pla i `latex` pot ser "". */
  latex: string;
  text?: string;
  correct: boolean;
  /** `null` només si `correct`. */
  errorTag: string | null;
  /** Si l'explicació genèrica del tag no encaixa en aquest cas. */
  explanationOverride?: string;
  /** Forma màquina (per verificar). El motor no la mira. */
  machine?: M;
  /**
   * Clau canònica de la forma màquina, per detectar opcions numèricament iguals
   * (§5.4: si dos distractors coincideixen, es regenera). Si no hi és, només es compara `latex`.
   */
  key?: string;
}

export interface Step<M = unknown> {
  latex: string;
  machine?: M;
}

interface ItemCommon<M> {
  block: string;
  level: Level;
  /** Enunciat (LaTeX). */
  promptLatex: string;
  /** Forma màquina de l'enunciat, si té sentit. */
  promptMachine?: M;
  /** "Simplifica", "És vàlid aquest pas?"... (català). */
  instruction: string;
  options: Option<M>[];
  /** Per què la correcta és correcta (català, admet $...$ inline). */
  explanationCorrect: string;
}

export interface McDraft<M = unknown> extends ItemCommon<M> {
  type: "mc_result" | "next_step";
}

export interface ValidStepDraft<M = unknown> extends ItemCommon<M> {
  type: "valid_step";
  step: {
    beforeLatex: string;
    afterLatex: string;
    beforeMachine?: M;
    afterMachine?: M;
    /** El pas és vàlid de debò? (es verifica als tests de propietat) */
    valid: boolean;
    /** Si no és vàlid, l'error que l'ha produït. */
    errorTag: string | null;
  };
}

export interface FindErrorDraft<M = unknown> extends ItemCommon<M> {
  type: "find_error";
  steps: Step<M>[];
  /** Índex del pas erroni, o `null` si tots són correctes. */
  errorIndex: number | null;
}

/** El que retorna `Template.generate`: tot menys la identitat (plantilla, versió, llavor). */
export type ItemDraft<M = unknown> = McDraft<M> | ValidStepDraft<M> | FindErrorDraft<M>;

export interface ItemIdentity {
  templateId: string;
  templateVersion: number;
  seed: number;
}

export type Item<M = unknown> = ItemDraft<M> & ItemIdentity;

export interface Template<M = unknown> {
  /** Estable, p. ex. "B5.T1". */
  id: string;
  /** Pujar si canvia la generació. */
  version: number;
  block: string;
  type: QuestionType;
  level: Level;
  /**
   * Genera un esborrany determinista a partir del rng. Les opcions NO cal que estiguin
   * barrejades (ho fa `buildItem` amb el mateix rng), però sí amb id, correct i errorTag.
   */
  generate(rng: Rng): ItemDraft<M>;
}

/** Un intent de l'alumna. Tot el domini i el repàs es deriven d'aquesta llista. */
export interface Attempt {
  /** UUID generat al client (idempotència). */
  id: string;
  sessionId: string;
  block: string;
  templateId: string;
  templateVersion: number;
  seed: number;
  questionType: QuestionType;
  level: Level;
  outcome: Outcome;
  chosenOptionId: string | null;
  /** `null` si correct o skipped. */
  errorTag: string | null;
  /** Tags dels distractors mostrats (per al domini per tag). */
  presentedErrorTags: string[];
  explanationOpened: boolean;
  /** ISO 8601. */
  clientCreatedAt: string;
  appVersion: string;
  contentVersion: string;
}

export type SessionMode = "apren" | "practica" | "repas";

export interface Session {
  id: string;
  mode: SessionMode;
  block: string | null;
  startedAt: string;
  endedAt: string | null;
}
