import { describe, expect, it } from "vitest";
import { heatBand, heatCell, heatmap, recentScore } from "./heatmap";
import { mulberry32 } from "./rng";
import { planRound } from "./selection";
import type { Attempt, Level, QuestionType, Template } from "./types";

const tpl = (
  id: string,
  level: Level,
  type: QuestionType = "mc_result",
  block = "B5",
): Template => ({
  id,
  version: 1,
  block,
  type,
  level,
  generate: () => {
    throw new Error("no cal");
  },
});
const templates = [
  tpl("B5.T1", 1),
  tpl("B5.T2", 1, "valid_step"),
  tpl("B5.T3", 2),
  tpl("B5.T9", 3, "find_error"),
  tpl("B6.T1", 1, "mc_result", "B6"),
];

let n = 0;
const at = (templateId: string, outcome: Attempt["outcome"]): Attempt => {
  n++;
  const t = templates.find((x) => x.id === templateId)!;
  return {
    id: `a${n}`,
    sessionId: "s",
    block: t.block,
    templateId,
    templateVersion: 1,
    seed: n,
    questionType: t.type,
    level: t.level,
    outcome,
    chosenOptionId: "x",
    errorTag: outcome === "incorrect" ? "B5_X" : null,
    presentedErrorTags: ["B5_X"],
    explanationOpened: false,
    clientCreatedAt: new Date(Date.UTC(2026, 10, 1) + n * 60_000).toISOString(),
    appVersion: "t",
    contentVersion: "t",
  };
};

describe("dificultat fixa", () => {
  it("nivell 3: tota la ronda (sense repàs pendent) és de nivell 3 i no hi ha «nivell següent»", () => {
    const plan = planRound({ templates, attempts: [], block: "B5", rng: mulberry32(3), level: 3 });
    expect(plan).toHaveLength(10);
    expect(plan.every((p) => p.templateId === "B5.T9" && p.slot === "current")).toBe(true);
  });
  it("auto continua com abans (70/20)", () => {
    const plan = planRound({
      templates,
      attempts: [],
      block: "B5",
      rng: mulberry32(3),
      level: "auto",
    });
    expect(plan.filter((p) => p.slot === "next")).toHaveLength(2);
  });
  it("un nivell sense plantilles agafa el més proper", () => {
    const plan = planRound({ templates, attempts: [], block: "B6", rng: mulberry32(1), level: 3 });
    expect(plan.every((p) => p.templateId === "B6.T1")).toBe(true);
  });
  it("filtre per tipus", () => {
    const plan = planRound({
      templates,
      attempts: [],
      block: "B5",
      rng: mulberry32(2),
      types: ["valid_step"],
    });
    expect(plan.every((p) => p.templateId === "B5.T2")).toBe(true);
    expect(
      planRound({
        templates,
        attempts: [],
        block: "B6",
        rng: mulberry32(2),
        types: ["find_error"],
      }),
    ).toEqual([]);
  });
});

describe("mapa de calor", () => {
  it("recentScore: l'últim pesa la meitat", () => {
    expect(recentScore([])).toBeNull();
    expect(recentScore([true])).toBe(1);
    expect(recentScore([false, true])).toBeCloseTo(0.5 / 0.75);
    expect(recentScore([true, false])).toBeCloseTo(0.25 / 0.75);
  });
  it("recent vs històric i saltats exclosos", () => {
    const att = [
      at("B5.T1", "incorrect"),
      at("B5.T1", "incorrect"),
      at("B5.T1", "correct"),
      at("B5.T1", "correct"),
      at("B5.T1", "skipped"),
    ];
    const tpls = templates.filter((t) => t.id === "B5.T1");
    const h = heatCell(tpls, att, "historic");
    expect([h.ok, h.ko, h.rate]).toEqual([2, 2, 0.5]);
    const r = heatCell(tpls, att, "recent");
    expect(r.rate!).toBeGreaterThan(0.7);
    expect(heatBand(r)).toBe(2);
    expect(heatBand(heatCell(tpls, [], "recent"))).toBe(0);
  });
  it("files per bloc amb columnes per nivell i total", () => {
    const att = [at("B5.T1", "correct"), at("B5.T3", "incorrect"), at("B6.T1", "correct")];
    const rows = heatmap(templates, att, ["B5", "B6"], "level", "historic");
    expect(rows.map((r) => r.block)).toEqual(["B5", "B6"]);
    const b5 = rows[0]!.cells;
    expect(b5.map((c) => c.key)).toEqual([1, 2, 3, "total"]);
    expect(b5.map((c) => c.cell.rate)).toEqual([1, 0, null, 0.5]);
    expect(b5[0]!.cell.templates).toBe(2);
    const byType = heatmap(templates, att, ["B5"], "type", "historic")[0]!.cells;
    expect(byType.map((c) => c.key)).toEqual([
      "mc_result",
      "next_step",
      "valid_step",
      "find_error",
      "total",
    ]);
    expect(byType[1]!.cell.templates).toBe(0);
  });
});
