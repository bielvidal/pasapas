/**
 * «Proposats per a tu»: ronda personal sempre disponible, calculada amb els intents de l'alumna.
 * Prioritats (§ proposta acordada amb Biel, REGISTRO S6):
 *  1. Errors a reforçar: triats ≥ 2 vegades a la finestra, o actius (no superats) i triats alguna
 *     vegada a la finestra. Un error aïllat no és una confusió. Es tornen a presentar amb plantilles
 *     que el tenen com a distractor (llavor nova).
 *  2. La cel·la més fluixa del mapa de calor (bloc × nivell amb ≥ 3 intents i < 70 %).
 *  3. Targetes de Leitner pendents.
 *  4. Un error superat recentment, per confirmar-lo.
 * Sense dates límit ni pressió. El motor no sap d'àlgebra: rep l'índex tag → plantilles.
 */
import { heatmap } from "./heatmap";
import { dueReviews, reviewState } from "./leitner";
import { allTagsMastery } from "./mastery";
import type { Rng } from "./rng";
import type { PlannedItem } from "./selection";
import type { Attempt, Level, Template } from "./types";

export const PROPOSAL_WINDOW_DAYS = 28;

export interface ProposalReason {
  /** Errors que es reforcen (per al resum). */
  reinforce: string[];
  /** Cel·la fluixa (bloc i nivell) si n'hi ha. */
  weakCell: { block: string; level: Level } | null;
  /** Error superat que es confirma. */
  confirm: string | null;
  reviews: number;
}

export interface Proposal {
  plan: PlannedItem[];
  reason: ProposalReason;
}

export interface ProposalOptions {
  templates: readonly Template[];
  attempts: readonly Attempt[];
  /** tag → ids de plantilles que el presenten com a distractor. */
  tagTemplates: Readonly<Record<string, readonly string[]>>;
  rng: Rng;
  now?: Date;
  size?: number;
}

/** Errors a reforçar, ordenats: més triats a la finestra primer, després el més recent. */
export function tagsToReinforce(attempts: readonly Attempt[], now: Date = new Date()): string[] {
  const since = new Date(now.getTime() - PROPOSAL_WINDOW_DAYS * 86_400_000).toISOString();
  const count = new Map<string, number>();
  const last = new Map<string, string>();
  for (const a of attempts) {
    if (!a.errorTag || a.clientCreatedAt < since) continue;
    count.set(a.errorTag, (count.get(a.errorTag) ?? 0) + 1);
    if ((last.get(a.errorTag) ?? "") < a.clientCreatedAt) last.set(a.errorTag, a.clientCreatedAt);
  }
  const active = new Set(
    allTagsMastery(attempts)
      .filter((t) => t.state === "actiu")
      .map((t) => t.tag),
  );
  return [...count.entries()]
    .filter(([tag, n]) => n >= 2 || active.has(tag))
    .sort((a, b) => b[1] - a[1] || (last.get(b[0])! < last.get(a[0])! ? -1 : 1))
    .map(([tag]) => tag);
}

/** Error superat que es va triar a la finestra (per confirmar-lo), el més recent. */
function tagToConfirm(attempts: readonly Attempt[], now: Date): string | null {
  const since = new Date(now.getTime() - PROPOSAL_WINDOW_DAYS * 86_400_000).toISOString();
  const overcome = allTagsMastery(attempts)
    .filter((t) => t.state === "superat" && t.lastChosenAt && t.lastChosenAt >= since)
    .sort((a, b) => (a.lastChosenAt! < b.lastChosenAt! ? 1 : -1));
  return overcome[0]?.tag ?? null;
}

export function planProposedRound(opts: ProposalOptions): Proposal {
  const { templates, attempts, tagTemplates, rng } = opts;
  const now = opts.now ?? new Date();
  const size = opts.size ?? 10;
  const byId = new Map(templates.map((t) => [t.id, t]));
  const plan: PlannedItem[] = [];
  let previous: string | null = null;
  const push = (t: Template, slot: PlannedItem["slot"], reviewTag?: string) => {
    const item: PlannedItem = { templateId: t.id, seed: rng.seed32(), slot };
    if (reviewTag !== undefined) item.reviewTag = reviewTag;
    plan.push(item);
    previous = t.id;
  };
  const pickFor = (tag: string): Template | null => {
    const ts = (tagTemplates[tag] ?? [])
      .map((id) => byId.get(id))
      .filter((t): t is Template => !!t);
    if (!ts.length) return null;
    const pool = ts.length > 1 && previous ? ts.filter((t) => t.id !== previous) : ts;
    return rng.pick(pool.length ? pool : ts);
  };

  // 4. confirmació (es reserva 1 lloc)
  const confirm = tagToConfirm(attempts, now);
  // 3. Leitner pendents (fins a 2)
  const due = rng
    .shuffle(dueReviews(reviewState(attempts), now).filter((c) => byId.has(c.templateId)))
    .slice(0, 2);
  // 2. cel·la fluixa (2 llocs)
  const blocks = [...new Set(templates.map((t) => t.block))];
  let weakCell: ProposalReason["weakCell"] = null;
  let weakest = 1;
  for (const row of heatmap(templates, attempts, blocks, "level", "recent")) {
    for (const { key, cell } of row.cells) {
      if (key === "total" || cell.rate === null || cell.ok + cell.ko < 3 || cell.rate >= 0.7)
        continue;
      if (cell.rate < weakest) {
        weakest = cell.rate;
        weakCell = { block: row.block, level: key as Level };
      }
    }
  }
  // 1. errors a reforçar: la resta dels llocs, repartits entre els 3 primers
  const reinforce = tagsToReinforce(attempts, now)
    .filter((t) => (tagTemplates[t] ?? []).some((id) => byId.has(id)))
    .slice(0, 3);
  const reserved = (confirm ? 1 : 0) + due.length + (weakCell ? 2 : 0);
  const nReinforce = reinforce.length ? Math.max(size - reserved, Math.min(size, 4)) : 0;
  for (let i = 0; i < nReinforce && plan.length < size; i++) {
    const tag = reinforce[i % reinforce.length]!;
    const t = pickFor(tag);
    if (t) push(t, "reinforce", tag);
  }
  if (weakCell) {
    const pool = templates.filter(
      (t) => t.block === weakCell!.block && t.level === weakCell!.level,
    );
    for (let i = 0; i < 2 && plan.length < size; i++) {
      const cand = pool.length > 1 && previous ? pool.filter((t) => t.id !== previous) : pool;
      push(rng.pick(cand), "current");
    }
  }
  for (const card of due)
    if (plan.length < size) push(byId.get(card.templateId)!, "review", card.errorTag);
  if (confirm && plan.length < size) {
    const t = pickFor(confirm);
    if (t) push(t, "confirm", confirm);
  }
  // Si encara hi ha lloc, més dels errors a reforçar (si n'hi ha).
  for (let i = 0; reinforce.length && plan.length < size && i < size; i++) {
    const tag = reinforce[i % reinforce.length]!;
    const t = pickFor(tag);
    if (t) push(t, "reinforce", tag);
  }
  return {
    plan: rng.shuffle(plan),
    reason: {
      reinforce,
      weakCell,
      confirm: plan.some((p) => p.slot === "confirm") ? confirm : null,
      reviews: due.length,
    },
  };
}
