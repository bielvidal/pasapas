import { ALL_TEMPLATES } from "@pasapas/content-algebra";
import { describe, expect, it } from "vitest";
import { PasapasDB } from "./db";
import {
  buildPracticeRound,
  buildReviewRound,
  gradeValidStep,
  makeAttempt,
  summarizeRound,
} from "./round";

describe("ronda", () => {
  it("construeix 10 ítems de B5 i cap d'un altre bloc", () => {
    const round = buildPracticeRound(ALL_TEMPLATES, [], "B5", 123);
    expect(round).toHaveLength(10);
    expect(round.every((r) => r.item.block === "B5")).toBe(true);
    expect(round.filter((r) => r.plan.slot === "next")).toHaveLength(2);
  });
  it("sense errors previs, la ronda de repàs és buida", () => {
    expect(buildReviewRound(ALL_TEMPLATES, [], 1)).toEqual([]);
  });
  it("valid_step: cal encertar validesa i raó", () => {
    const round = buildPracticeRound(ALL_TEMPLATES, [], "B5", 7);
    const vs = round.find((r) => r.item.type === "valid_step");
    // amb la llavor 7 potser no n'hi ha; busquem una llavor amb valid_step
    let seed = 7;
    let item = vs?.item;
    while (!item) {
      const rr = buildPracticeRound(ALL_TEMPLATES, [], "B5", ++seed).find(
        (r) => r.item.type === "valid_step",
      );
      item = rr?.item;
    }
    if (item.type !== "valid_step") throw new Error();
    const correctReason = item.options.find((o) => o.correct)!;
    const wrongReason = item.options.find((o) => !o.correct)!;
    expect(gradeValidStep(item, item.step.valid, correctReason.id).outcome).toBe("correct");
    expect(gradeValidStep(item, item.step.valid, wrongReason.id)).toMatchObject({
      outcome: "incorrect",
      errorTag: wrongReason.errorTag,
    });
    const g = gradeValidStep(item, !item.step.valid, correctReason.id);
    expect(g.outcome).toBe("incorrect");
    expect(g.errorTag).not.toBeNull();
    expect(gradeValidStep(item, true, null).outcome).toBe("skipped");
  });
  it("makeAttempt + summarizeRound + Dexie", async () => {
    const round = buildPracticeRound(ALL_TEMPLATES, [], "B5", 99);
    const db = new PasapasDB(`test-${Date.now()}`);
    const attempts = round.slice(0, 3).map((ri, i) => {
      const opt = ri.item.options.find((o) => (i === 0 ? o.correct : !o.correct))!;
      const g = {
        outcome: opt.correct ? "correct" : "incorrect",
        chosenOptionId: opt.id,
        errorTag: opt.errorTag,
        presentedErrorTags: ri.item.options.filter((o) => o.errorTag).map((o) => o.errorTag!),
      } as const;
      return makeAttempt("s1", ri, { ...g, presentedErrorTags: [...g.presentedErrorTags] });
    });
    await db.attempts.bulkAdd(attempts.map((a) => ({ ...a, synced: 0 as const })));
    expect(await db.attempts.count()).toBe(3);
    const s = summarizeRound(attempts);
    expect(s.total).toBe(3);
    expect(s.correct).toBe(1);
    expect(s.chosen.length).toBeGreaterThan(0);
    expect(attempts[0]!.contentVersion).toBe("0.1.0");
  });
});
