import { sortAttempts } from "./mastery";
import type { Attempt } from "./types";

/** Dies d'espera per caixa 1..4. La caixa 5 és «retirada». */
export const LEITNER_INTERVALS_DAYS = [1, 3, 7, 14] as const;
export const RETIRED_BOX = LEITNER_INTERVALS_DAYS.length + 1;
const DAY_MS = 86_400_000;

export interface ReviewCard {
  templateId: string;
  errorTag: string;
  block: string;
  /** 1..4 actives, 5 = retirada. */
  box: number;
  /** ISO de l'últim moviment. */
  lastAt: string;
  /** ISO a partir del qual toca repassar (només si box < RETIRED_BOX). */
  dueAt: string | null;
}

export const cardKey = (templateId: string, errorTag: string): string =>
  `${templateId}|${errorTag}`;

function dueFrom(lastAt: string, box: number): string | null {
  if (box >= RETIRED_BOX) return null;
  const days =
    LEITNER_INTERVALS_DAYS[box - 1] ?? LEITNER_INTERVALS_DAYS[LEITNER_INTERVALS_DAYS.length - 1]!;
  return new Date(new Date(lastAt).getTime() + days * DAY_MS).toISOString();
}

/**
 * Estat de la caixa de Leitner per (plantilla, error_tag), derivat només dels intents (§5.6):
 * - un error triant el tag posa el parell a la caixa 1;
 * - un encert en un ítem de la mateixa plantilla on el tag s'ha presentat i NO s'ha triat
 *   puja el parell una caixa (si el parell està en repàs);
 * - els intents saltats no mouen res.
 */
export function reviewState(attempts: readonly Attempt[]): Map<string, ReviewCard> {
  const cards = new Map<string, ReviewCard>();
  for (const a of sortAttempts(attempts)) {
    if (a.outcome === "skipped") continue;
    if (a.outcome === "incorrect" && a.errorTag) {
      cards.set(cardKey(a.templateId, a.errorTag), {
        templateId: a.templateId,
        errorTag: a.errorTag,
        block: a.block,
        box: 1,
        lastAt: a.clientCreatedAt,
        dueAt: dueFrom(a.clientCreatedAt, 1),
      });
      continue;
    }
    if (a.outcome === "correct") {
      for (const tag of a.presentedErrorTags) {
        const k = cardKey(a.templateId, tag);
        const c = cards.get(k);
        if (!c || c.box >= RETIRED_BOX) continue;
        const box = c.box + 1;
        cards.set(k, {
          ...c,
          box,
          lastAt: a.clientCreatedAt,
          dueAt: dueFrom(a.clientCreatedAt, box),
        });
      }
    }
  }
  return cards;
}

/** Targetes pendents de repassar ara (ordenades: les més endarrerides primer). */
export function dueReviews(
  state: Map<string, ReviewCard>,
  now: Date = new Date(),
  block?: string,
): ReviewCard[] {
  const t = now.getTime();
  return [...state.values()]
    .filter((c) => c.dueAt !== null && new Date(c.dueAt).getTime() <= t)
    .filter((c) => block === undefined || c.block === block)
    .sort((x, y) => (x.dueAt! < y.dueAt! ? -1 : 1));
}

/** Targetes actives (en repàs, encara no retirades), per mostrar «Per repassar». */
export function activeReviews(state: Map<string, ReviewCard>): ReviewCard[] {
  return [...state.values()].filter((c) => c.box < RETIRED_BOX);
}
