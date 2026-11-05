import { deriveSeed, mulberry32 } from "./rng";
import type { Item, ItemDraft, Option, Template } from "./types";

export const MAX_REGENERATIONS = 20;

export class GenerationError extends Error {
  constructor(
    public readonly templateId: string,
    public readonly seed: number,
    message: string,
  ) {
    super(`${templateId} (llavor ${seed}): ${message}`);
    this.name = "GenerationError";
  }
}

/** Problemes estructurals d'un esborrany que el motor pot detectar sense saber de matemàtiques. */
export function structuralProblems(draft: ItemDraft): string[] {
  const problems: string[] = [];
  const opts = draft.options;
  const correct = opts.filter((o) => o.correct);
  if (correct.length !== 1) problems.push(`hi ha ${correct.length} opcions correctes (cal 1)`);
  for (const o of correct)
    if (o.errorTag !== null) problems.push(`l'opció correcta ${o.id} té errorTag`);
  for (const o of opts) {
    if (!o.correct && !o.errorTag) problems.push(`el distractor ${o.id} no té errorTag`);
    if (!o.latex && !o.text) problems.push(`l'opció ${o.id} no té ni latex ni text`);
  }
  const ids = new Set(opts.map((o) => o.id));
  if (ids.size !== opts.length) problems.push("ids d'opció repetits");

  const seenLatex = new Set<string>();
  const seenKey = new Set<string>();
  for (const o of opts) {
    const display = o.text ?? o.latex;
    if (seenLatex.has(display)) problems.push(`dues opcions es mostren igual: ${display}`);
    seenLatex.add(display);
    if (o.key !== undefined) {
      if (seenKey.has(o.key))
        problems.push(`dues opcions tenen la mateixa forma màquina: ${o.key}`);
      seenKey.add(o.key);
    }
  }

  switch (draft.type) {
    case "mc_result":
    case "next_step":
      if (opts.length !== 4)
        problems.push(`${draft.type} ha de tenir 4 opcions, en té ${opts.length}`);
      break;
    case "valid_step":
      if (opts.length !== 3) problems.push(`valid_step ha de tenir 3 raons, en té ${opts.length}`);
      break;
    case "find_error": {
      const n = draft.steps.length;
      if (n < 2) problems.push("find_error necessita almenys 2 passos");
      if (draft.errorIndex !== null && (draft.errorIndex < 0 || draft.errorIndex >= n)) {
        problems.push(`errorIndex ${draft.errorIndex} fora de rang`);
      }
      const expectCorrect = draft.errorIndex === null ? "none" : `step:${draft.errorIndex}`;
      if (correct[0] && correct[0].id !== expectCorrect) {
        problems.push(
          `a find_error la correcta hauria de ser ${expectCorrect}, és ${correct[0].id}`,
        );
      }
      if (opts.length !== n + 1)
        problems.push(`find_error: calen ${n + 1} opcions (passos + «cap»)`);
      break;
    }
  }
  return problems;
}

/**
 * Genera un ítem reproduïble a partir de (plantilla, llavor). Si l'esborrany té opcions
 * coincidents, torna a generar amb la llavor derivada següent (màxim MAX_REGENERATIONS).
 * Les opcions es barregen amb el mateix rng, llevat de find_error (l'ordre dels passos mana).
 */
export function buildItem<M>(template: Template<M>, seed: number): Item<M> {
  let lastProblems: string[] = [];
  for (let i = 0; i < MAX_REGENERATIONS; i++) {
    const s = i === 0 ? seed : deriveSeed(seed, i);
    const rng = mulberry32(s);
    const draft = template.generate(rng);
    lastProblems = structuralProblems(draft);
    if (lastProblems.length > 0) continue;
    const options: Option<M>[] =
      draft.type === "find_error" ? draft.options : rng.shuffle(draft.options);
    return {
      ...draft,
      options,
      templateId: template.id,
      templateVersion: template.version,
      seed, // la llavor "pública" és la demanada; la derivació és interna i determinista
    };
  }
  throw new GenerationError(
    template.id,
    seed,
    `després de ${MAX_REGENERATIONS} intents encara hi ha problemes: ${lastProblems.join("; ")}`,
  );
}

/** Tags dels distractors que es mostren a l'alumna (per al domini per tag). */
export function presentedErrorTags(item: Item): string[] {
  const tags = new Set<string>();
  for (const o of item.options) if (!o.correct && o.errorTag) tags.add(o.errorTag);
  if (item.type === "valid_step" && item.step.errorTag) tags.add(item.step.errorTag);
  return [...tags];
}

export interface Grade {
  outcome: "correct" | "incorrect" | "skipped";
  chosenOptionId: string | null;
  errorTag: string | null;
  presentedErrorTags: string[];
}

/** Qualifica una elecció (o «Encara no ho sé» si `chosenOptionId` és null). */
export function grade(item: Item, chosenOptionId: string | null): Grade {
  const presented = presentedErrorTags(item);
  if (chosenOptionId === null) {
    return {
      outcome: "skipped",
      chosenOptionId: null,
      errorTag: null,
      presentedErrorTags: presented,
    };
  }
  const chosen = item.options.find((o) => o.id === chosenOptionId);
  if (!chosen) throw new RangeError(`opció ${chosenOptionId} desconeguda`);
  return {
    outcome: chosen.correct ? "correct" : "incorrect",
    chosenOptionId,
    errorTag: chosen.correct ? null : chosen.errorTag,
    presentedErrorTags: presented,
  };
}
