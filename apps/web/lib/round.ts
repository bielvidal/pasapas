/**
 * Lògica d'una ronda, pura i testable: construir els ítems a partir del pla, qualificar una
 * elecció (incloent-hi els dos passos de valid_step) i preparar l'intent que es desa.
 */
import {
  buildItem,
  grade,
  mulberry32,
  planReviewRound,
  planRound,
  type Attempt,
  type Grade,
  type Item,
  type Level,
  type PlannedItem,
  type QuestionType,
  type Template,
} from "@pasapas/engine";
import { CONTENT_VERSION, type Machine } from "@pasapas/content-algebra";
import { APP_VERSION } from "./db";
import { uuid } from "./ids";

export interface RoundItem {
  plan: PlannedItem;
  item: Item<Machine>;
}

export function buildPracticeRound(
  templates: readonly Template<Machine>[],
  attempts: readonly Attempt[],
  block: string,
  seed: number,
  now = new Date(),
  choice: { level?: Level | "auto"; types?: QuestionType[] } = {},
): RoundItem[] {
  const plan = planRound({ templates, attempts, block, rng: mulberry32(seed), now, ...choice });
  return plan.map((p) => ({
    plan: p,
    item: buildItem(
      templates.find((t) => t.id === p.templateId)!,
      p.seed,
    ),
  }));
}

export function buildReviewRound(
  templates: readonly Template<Machine>[],
  attempts: readonly Attempt[],
  seed: number,
  now = new Date(),
): RoundItem[] {
  const plan = planReviewRound(templates, attempts, mulberry32(seed), now);
  return plan.map((p) => ({
    plan: p,
    item: buildItem(
      templates.find((t) => t.id === p.templateId)!,
      p.seed,
    ),
  }));
}

/**
 * Qualifica un valid_step: la resposta «És vàlid?» i la raó triada. Només compta com a encert
 * si les dues coses són correctes. Si la raó és correcta però la validesa no, el tag és el de
 * l'error del pas (ha acceptat un pas invàlid) o, si el pas era vàlid, el del primer distractor.
 */
export function gradeValidStep(
  item: Item<Machine>,
  saidValid: boolean,
  reasonId: string | null,
): Grade {
  if (item.type !== "valid_step") throw new Error("no és valid_step");
  const g = grade(item, reasonId);
  if (g.outcome === "skipped") return g;
  if (saidValid === item.step.valid) return g;
  if (g.outcome === "incorrect") return g; // la raó ja porta el seu tag
  const fallback = item.step.errorTag ?? item.options.find((o) => !o.correct)?.errorTag ?? null;
  return { ...g, outcome: "incorrect", errorTag: fallback };
}

export function makeAttempt(sessionId: string, ri: RoundItem, g: Grade, now = new Date()): Attempt {
  return {
    id: uuid(),
    sessionId,
    block: ri.item.block,
    templateId: ri.item.templateId,
    templateVersion: ri.item.templateVersion,
    seed: ri.item.seed,
    questionType: ri.item.type,
    level: ri.item.level,
    outcome: g.outcome,
    chosenOptionId: g.chosenOptionId,
    errorTag: g.errorTag,
    presentedErrorTags: g.presentedErrorTags,
    explanationOpened: false,
    clientCreatedAt: now.toISOString(),
    appVersion: APP_VERSION,
    contentVersion: CONTENT_VERSION,
  };
}

export interface RoundSummary {
  total: number;
  correct: number;
  skipped: number;
  /** Tags presentats en la ronda i no triats mai. */
  avoided: string[];
  /** Tags triats (errors comesos), amb recompte. */
  chosen: { tag: string; count: number }[];
}

export function summarizeRound(attempts: readonly Attempt[]): RoundSummary {
  const chosen = new Map<string, number>();
  const presented = new Set<string>();
  let correct = 0;
  let skipped = 0;
  for (const a of attempts) {
    if (a.outcome === "correct") correct++;
    if (a.outcome === "skipped") skipped++;
    for (const t of a.presentedErrorTags) presented.add(t);
    if (a.errorTag) chosen.set(a.errorTag, (chosen.get(a.errorTag) ?? 0) + 1);
  }
  return {
    total: attempts.length,
    correct,
    skipped,
    avoided: [...presented].filter((t) => !chosen.has(t)).sort(),
    chosen: [...chosen.entries()]
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count),
  };
}
