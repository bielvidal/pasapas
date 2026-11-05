import { dueReviews, reviewState } from "./leitner";
import { currentLevel } from "./mastery";
import type { Rng } from "./rng";
import type { Attempt, Level, Template } from "./types";

export type Slot = "current" | "next" | "review";

export interface PlannedItem {
  templateId: string;
  seed: number;
  slot: Slot;
  /** A les de repàs, el tag que es repassa. */
  reviewTag?: string;
}

export interface PlanOptions {
  templates: readonly Template[];
  attempts: readonly Attempt[];
  block: string;
  rng: Rng;
  now?: Date;
  size?: number;
}

/** Tria una plantilla de la llista evitant repetir la immediatament anterior si es pot. */
function pickTemplate(rng: Rng, pool: readonly Template[], previous: string | null): Template {
  const candidates = pool.length > 1 && previous ? pool.filter((t) => t.id !== previous) : pool;
  return rng.pick(candidates.length ? candidates : pool);
}

/**
 * Ronda de «Practica» (§5.6): 10 ítems del bloc, 70 % del nivell actual, 20 % del següent,
 * 10 % de repàs (targetes de Leitner pendents del bloc). Cada ítem porta la seva llavor:
 * la ronda és reproduïble a partir del rng.
 */
export function planRound(opts: PlanOptions): PlannedItem[] {
  const { templates, attempts, block, rng } = opts;
  const now = opts.now ?? new Date();
  const size = opts.size ?? 10;
  const inBlock = templates.filter((t) => t.block === block);
  if (inBlock.length === 0) return [];

  const level = currentLevel(attempts, block);
  const nextLevel = Math.min(3, level + 1) as Level;
  const atLevel = inBlock.filter((t) => t.level === level);
  const atNext = nextLevel !== level ? inBlock.filter((t) => t.level === nextLevel) : [];
  // Si el nivell actual no té plantilles (contingut incomplet), s'agafa qualsevol del bloc.
  const currentPool = atLevel.length ? atLevel : inBlock;

  const due = dueReviews(reviewState(attempts), now, block).filter((c) =>
    inBlock.some((t) => t.id === c.templateId),
  );
  const nReview = Math.min(Math.round(size * 0.1), due.length);
  const nNext = atNext.length ? Math.round(size * 0.2) : 0;
  const nCurrent = size - nReview - nNext;

  const plan: PlannedItem[] = [];
  let previous: string | null = null;
  const push = (t: Template, slot: Slot, reviewTag?: string): void => {
    const item: PlannedItem = { templateId: t.id, seed: rng.seed32(), slot };
    if (reviewTag !== undefined) item.reviewTag = reviewTag;
    plan.push(item);
    previous = t.id;
  };
  for (let i = 0; i < nCurrent; i++) push(pickTemplate(rng, currentPool, previous), "current");
  for (let i = 0; i < nNext; i++) push(pickTemplate(rng, atNext, previous), "next");
  for (const card of rng.shuffle(due).slice(0, nReview)) {
    const t = inBlock.find((x) => x.id === card.templateId)!;
    push(t, "review", card.errorTag);
  }
  // Barreja final: el repàs i el nivell següent no van sempre al final.
  return rng.shuffle(plan);
}

/**
 * Ronda de «Repassa els meus errors»: només targetes pendents (de qualsevol bloc), un ítem
 * nou per targeta (llavor nova: no es repeteix l'ítem, es repeteix la plantilla).
 */
export function planReviewRound(
  templates: readonly Template[],
  attempts: readonly Attempt[],
  rng: Rng,
  now: Date = new Date(),
  max = 10,
): PlannedItem[] {
  const due = dueReviews(reviewState(attempts), now).filter((c) =>
    templates.some((t) => t.id === c.templateId),
  );
  return rng
    .shuffle(due)
    .slice(0, max)
    .map((card) => ({
      templateId: card.templateId,
      seed: rng.seed32(),
      slot: "review" as const,
      reviewTag: card.errorTag,
    }));
}
