import type { Attempt, Level, QuestionType } from "./types";

export type BlockState = "en_marxa" | "ho_vaig_agafant" | "dominat";
export type TagState = "sense_dades" | "actiu" | "superat";

export const MASTERY_WINDOW = 12;
export const TAG_WINDOW = 4;

export interface BlockMastery {
  block: string;
  state: BlockState;
  /** Intents no saltats dins la finestra. */
  total: number;
  correct: number;
  /** Percentatge 0-100 sobre la finestra (null si no hi ha intents). */
  rate: number | null;
  types: QuestionType[];
}

const byTime = (a: Attempt, b: Attempt): number =>
  a.clientCreatedAt < b.clientCreatedAt ? -1 : a.clientCreatedAt > b.clientCreatedAt ? 1 : 0;

export function sortAttempts(attempts: readonly Attempt[]): Attempt[] {
  return attempts.slice().sort(byTime);
}

function stateOf(total: number, correct: number, types: Set<QuestionType>): BlockState {
  if (total < 6) return "en_marxa";
  const rate = correct / total;
  if (rate >= 0.85 && total >= 10 && types.size >= 2) return "dominat";
  if (rate >= 0.6) return "ho_vaig_agafant";
  return "en_marxa";
}

function masteryOver(block: string, pool: Attempt[]): BlockMastery {
  const recent = sortAttempts(pool.filter((a) => a.outcome !== "skipped")).slice(-MASTERY_WINDOW);
  const correct = recent.filter((a) => a.outcome === "correct").length;
  const types = new Set(recent.map((a) => a.questionType));
  return {
    block,
    state: stateOf(recent.length, correct, types),
    total: recent.length,
    correct,
    rate: recent.length ? Math.round((100 * correct) / recent.length) : null,
    types: [...types],
  };
}

/** Domini per bloc sobre els últims 12 intents no saltats (§5.6). */
export function blockMastery(attempts: readonly Attempt[], block: string): BlockMastery {
  return masteryOver(
    block,
    attempts.filter((a) => a.block === block),
  );
}

/** Mateix criteri, restringit a un nivell: serveix per decidir el nivell actual del bloc. */
export function levelMastery(
  attempts: readonly Attempt[],
  block: string,
  level: Level,
): BlockMastery {
  return masteryOver(
    block,
    attempts.filter((a) => a.block === block && a.level === level),
  );
}

/** Nivell actual dins del bloc: el primer que encara no està dominat (màxim 3). */
export function currentLevel(attempts: readonly Attempt[], block: string): Level {
  for (const level of [1, 2, 3] as const) {
    if (levelMastery(attempts, block, level).state !== "dominat") return level;
  }
  return 3;
}

export interface TagMastery {
  tag: string;
  state: TagState;
  /** Vegades presentat com a distractor (intents no saltats). */
  presented: number;
  /** Vegades triat. */
  chosen: number;
  lastChosenAt: string | null;
  /** Les últimes TAG_WINDOW presentacions: true = triat. */
  recent: boolean[];
}

/**
 * Domini per error_tag: «superat» quan les 4 últimes aparicions com a distractor presentat
 * no s'han triat. Els intents saltats no compten (saltar no és evidència de res).
 */
export function tagMastery(attempts: readonly Attempt[], tag: string): TagMastery {
  const relevant = sortAttempts(
    attempts.filter((a) => a.outcome !== "skipped" && a.presentedErrorTags.includes(tag)),
  );
  const chosenList = relevant.filter((a) => a.errorTag === tag);
  const recent = relevant.slice(-TAG_WINDOW).map((a) => a.errorTag === tag);
  let state: TagState = "sense_dades";
  if (relevant.length > 0) {
    state = recent.length >= TAG_WINDOW && recent.every((c) => !c) ? "superat" : "actiu";
  }
  const last = chosenList.at(-1);
  return {
    tag,
    state,
    presented: relevant.length,
    chosen: chosenList.length,
    lastChosenAt: last ? last.clientCreatedAt : null,
    recent,
  };
}

/** Tots els tags que han aparegut mai, amb el seu estat. */
export function allTagsMastery(attempts: readonly Attempt[]): TagMastery[] {
  const tags = new Set<string>();
  for (const a of attempts) {
    for (const t of a.presentedErrorTags) tags.add(t);
    if (a.errorTag) tags.add(a.errorTag);
  }
  return [...tags].map((t) => tagMastery(attempts, t));
}

/** Dilluns 00:00 (hora local) de la setmana de la data, com a clau "AAAA-MM-DD". */
export function weekKey(iso: string): string {
  const d = new Date(iso);
  const day = (d.getDay() + 6) % 7; // dilluns = 0
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - day);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

export interface WeekBucket {
  week: string;
  attempts: number;
  correct: number;
  skipped: number;
}

/** Sèrie setmanal (les últimes `weeks` setmanes fins a `now`, totes presents encara que siguin 0). */
export function weeklySeries(
  attempts: readonly Attempt[],
  weeks: number,
  now: Date = new Date(),
  filter: (a: Attempt) => boolean = () => true,
): WeekBucket[] {
  const buckets = new Map<string, WeekBucket>();
  const cursor = new Date(now);
  for (let i = 0; i < weeks; i++) {
    const k = weekKey(cursor.toISOString());
    buckets.set(k, { week: k, attempts: 0, correct: 0, skipped: 0 });
    cursor.setDate(cursor.getDate() - 7);
  }
  for (const a of attempts) {
    if (!filter(a)) continue;
    const b = buckets.get(weekKey(a.clientCreatedAt));
    if (!b) continue;
    b.attempts++;
    if (a.outcome === "correct") b.correct++;
    if (a.outcome === "skipped") b.skipped++;
  }
  return [...buckets.values()].sort((x, y) => (x.week < y.week ? -1 : 1));
}

/** Vegades que s'ha triat cada tag, per setmana (per a l'sparkline del panell). */
export function weeklyTagChoices(
  attempts: readonly Attempt[],
  tag: string,
  weeks: number,
  now: Date = new Date(),
): number[] {
  return weeklySeries(attempts, weeks, now, (a) => a.errorTag === tag).map((b) => b.attempts);
}

/** Dies (AAAA-MM-DD, hora local) amb almenys un intent. */
export function activeDays(attempts: readonly Attempt[]): string[] {
  const days = new Set<string>();
  for (const a of attempts) {
    const d = new Date(a.clientCreatedAt);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    days.add(`${y}-${m}-${dd}`);
  }
  return [...days].sort();
}
