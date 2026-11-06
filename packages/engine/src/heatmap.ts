/**
 * Mapa de calor del progrés (calcat del de PPER): files per bloc, columnes per nivell o per tipus
 * de pregunta. Dues vistes:
 * - «recent»: cada plantilla compta sobretot pels últims intents (l'últim pesa la meitat, l'anterior
 *   un quart…) i la cel·la és la mitjana de les seves plantilles amb dades. Els errors del principi
 *   es van diluint a mesura que s'encerta.
 * - «historic»: encerts / intents des del principi.
 * Els intents saltats («Encara no ho sé») no compten.
 */
import { sortAttempts } from "./mastery";
import type { Attempt, Level, QuestionType, Template } from "./types";

export type HeatView = "recent" | "historic";
export type HeatColumns = "level" | "type";
export type HeatKey = Level | QuestionType | "total";

export interface HeatCell {
  /** Plantilles de la cel·la (al catàleg). */
  templates: number;
  /** Plantilles amb almenys un intent. */
  seen: number;
  ok: number;
  ko: number;
  /** 0..1, o null si no hi ha intents. */
  rate: number | null;
}

export const LEVEL_COLUMNS: Level[] = [1, 2, 3];
export const TYPE_COLUMNS: QuestionType[] = ["mc_result", "next_step", "valid_step", "find_error"];

/** Puntuació recent d'una llista d'encerts (ordenada en el temps): pesos 1/2, 1/4… des del final. */
export function recentScore(results: readonly boolean[]): number | null {
  if (!results.length) return null;
  let num = 0;
  let den = 0;
  let w = 0.5;
  for (let i = results.length - 1; i >= 0; i--) {
    num += w * (results[i] ? 1 : 0);
    den += w;
    w /= 2;
  }
  return num / den;
}

export function heatCell(
  templates: readonly Template[],
  attempts: readonly Attempt[],
  view: HeatView,
): HeatCell {
  const ids = new Set(templates.map((t) => t.id));
  const byTpl = new Map<string, boolean[]>();
  let ok = 0;
  let ko = 0;
  for (const a of sortAttempts(attempts)) {
    if (a.outcome === "skipped" || !ids.has(a.templateId)) continue;
    const correct = a.outcome === "correct";
    if (correct) ok++;
    else ko++;
    const list = byTpl.get(a.templateId) ?? [];
    list.push(correct);
    byTpl.set(a.templateId, list);
  }
  let rate: number | null = null;
  if (view === "historic") rate = ok + ko ? ok / (ok + ko) : null;
  else {
    const scores = [...byTpl.values()].map(recentScore).filter((v): v is number => v !== null);
    rate = scores.length ? scores.reduce((s, v) => s + v, 0) / scores.length : null;
  }
  return { templates: ids.size, seen: byTpl.size, ok, ko, rate };
}

export interface HeatRow {
  block: string;
  cells: { key: HeatKey; cell: HeatCell }[];
}

/** Totes les files (una per bloc donat) amb les columnes demanades i una de «total». */
export function heatmap(
  templates: readonly Template[],
  attempts: readonly Attempt[],
  blocks: readonly string[],
  columns: HeatColumns,
  view: HeatView,
): HeatRow[] {
  const keys: HeatKey[] = columns === "level" ? LEVEL_COLUMNS : TYPE_COLUMNS;
  return blocks.map((block) => {
    const inBlock = templates.filter((t) => t.block === block);
    const att = attempts.filter((a) => a.block === block);
    const cells = keys.map((key) => {
      const ts = inBlock.filter((t) => (columns === "level" ? t.level === key : t.type === key));
      return { key, cell: heatCell(ts, att, view) };
    });
    cells.push({ key: "total", cell: heatCell(inBlock, att, view) });
    return { block, cells };
  });
}

/** Banda de color: 0 = sense dades, 1 = ≥ 85 %, 2 = 70-84 %, 3 = 50-69 %, 4 = < 50 %. */
export function heatBand(cell: HeatCell): 0 | 1 | 2 | 3 | 4 {
  if (cell.rate === null) return 0;
  if (cell.rate >= 0.85) return 1;
  if (cell.rate >= 0.7) return 2;
  if (cell.rate >= 0.5) return 3;
  return 4;
}
