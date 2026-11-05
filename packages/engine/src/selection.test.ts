import { describe, expect, it } from "vitest";
import { mulberry32 } from "./rng";
import { planReviewRound, planRound } from "./selection";
import type { Attempt, Level, Template } from "./types";

const tpl = (id: string, level: Level, block = "B5"): Template => ({
  id,
  version: 1,
  block,
  type: "mc_result",
  level,
  generate: () => {
    throw new Error("no cal");
  },
});
const templates = [
  tpl("B5.T1", 1),
  tpl("B5.T2", 1),
  tpl("B5.T3", 2),
  tpl("B5.T7", 3),
  tpl("B1.T1", 1, "B1"),
];

const t0 = new Date("2026-11-01T10:00:00Z").getTime();
let n = 0;
const at = (outcome: Attempt["outcome"], templateId: string, dayOffset = 0): Attempt => {
  n++;
  return {
    id: `a${n}`,
    sessionId: "s",
    block: templateId.slice(0, 2),
    templateId,
    templateVersion: 1,
    seed: n,
    questionType: "mc_result",
    level: 1,
    outcome,
    chosenOptionId: "x",
    errorTag: outcome === "incorrect" ? "B5_CANCELA_TERME" : null,
    presentedErrorTags: ["B5_CANCELA_TERME"],
    explanationOpened: false,
    clientCreatedAt: new Date(t0 + dayOffset * 86_400_000 + n * 1000).toISOString(),
    appVersion: "t",
    contentVersion: "t",
  };
};

describe("planRound", () => {
  it("sense historial: 8 del nivell 1 i 2 del nivell 2, només del bloc", () => {
    const plan = planRound({ templates, attempts: [], block: "B5", rng: mulberry32(1) });
    expect(plan).toHaveLength(10);
    expect(plan.filter((p) => p.slot === "current")).toHaveLength(8);
    expect(plan.filter((p) => p.slot === "next")).toHaveLength(2);
    expect(plan.every((p) => p.templateId.startsWith("B5"))).toBe(true);
    expect(plan.filter((p) => p.slot === "next").every((p) => p.templateId === "B5.T3")).toBe(true);
    expect(new Set(plan.map((p) => p.seed)).size).toBe(10);
  });
  it("amb una targeta pendent inclou 1 ítem de repàs amb llavor nova", () => {
    const attempts = [at("incorrect", "B5.T1", 0)];
    const now = new Date(t0 + 3 * 86_400_000);
    const plan = planRound({ templates, attempts, block: "B5", rng: mulberry32(2), now });
    const review = plan.filter((p) => p.slot === "review");
    expect(review).toHaveLength(1);
    expect(review[0]).toMatchObject({ templateId: "B5.T1", reviewTag: "B5_CANCELA_TERME" });
    expect(review[0]!.seed).not.toBe(1);
  });
  it("és reproduïble amb la mateixa llavor", () => {
    const a = planRound({ templates, attempts: [], block: "B5", rng: mulberry32(7) });
    const b = planRound({ templates, attempts: [], block: "B5", rng: mulberry32(7) });
    expect(a).toEqual(b);
  });
  it("bloc sense plantilles → ronda buida", () => {
    expect(planRound({ templates, attempts: [], block: "B9", rng: mulberry32(1) })).toEqual([]);
  });
});

describe("planReviewRound", () => {
  it("només targetes vençudes, de qualsevol bloc", () => {
    const attempts = [
      at("incorrect", "B5.T1", 0),
      at("incorrect", "B1.T1", 0),
      at("incorrect", "B5.T2", 5),
    ];
    const now = new Date(t0 + 5.5 * 86_400_000);
    const plan = planReviewRound(templates, attempts, mulberry32(3), now);
    expect(plan.map((p) => p.templateId).sort()).toEqual(["B1.T1", "B5.T1"]);
    expect(plan.every((p) => p.slot === "review")).toBe(true);
  });
});
