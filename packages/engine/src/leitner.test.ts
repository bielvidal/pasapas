import { describe, expect, it } from "vitest";
import { activeReviews, dueReviews, reviewState } from "./leitner";
import type { Attempt } from "./types";

const t0 = new Date("2026-11-01T10:00:00Z").getTime();
const DAY = 86_400_000;
let n = 0;
const at = (outcome: Attempt["outcome"], day: number, extra: Partial<Attempt> = {}): Attempt => {
  n++;
  return {
    id: `a${n}`,
    sessionId: "s",
    block: "B5",
    templateId: "B5.T1",
    templateVersion: 1,
    seed: n,
    questionType: "mc_result",
    level: 1,
    outcome,
    chosenOptionId: "x",
    errorTag: outcome === "incorrect" ? "B5_CANCELA_TERME" : null,
    presentedErrorTags: ["B5_CANCELA_TERME", "B5_NUMERO_PARCIAL"],
    explanationOpened: false,
    clientCreatedAt: new Date(t0 + day * DAY).toISOString(),
    appVersion: "t",
    contentVersion: "t",
    ...extra,
  };
};

describe("Leitner", () => {
  it("un error crea la targeta a la caixa 1 amb venciment a 1 dia", () => {
    const st = reviewState([at("incorrect", 0)]);
    const c = st.get("B5.T1|B5_CANCELA_TERME")!;
    expect(c.box).toBe(1);
    expect(c.dueAt).toBe(new Date(t0 + DAY).toISOString());
    expect(dueReviews(st, new Date(t0 + 0.5 * DAY))).toHaveLength(0);
    expect(dueReviews(st, new Date(t0 + 1.5 * DAY))).toHaveLength(1);
  });
  it("els encerts successius pugen de caixa amb 1, 3, 7 i 14 dies i la retiren", () => {
    const list = [
      at("incorrect", 0),
      at("correct", 1),
      at("correct", 4),
      at("correct", 11),
      at("correct", 25),
    ];
    const st = reviewState(list);
    const c = st.get("B5.T1|B5_CANCELA_TERME")!;
    expect(c.box).toBe(5);
    expect(c.dueAt).toBeNull();
    expect(activeReviews(st)).toHaveLength(0);
    const partial = reviewState(list.slice(0, 3));
    expect(partial.get("B5.T1|B5_CANCELA_TERME")!.box).toBe(3);
    expect(partial.get("B5.T1|B5_CANCELA_TERME")!.dueAt).toBe(
      new Date(t0 + 4 * DAY + 7 * DAY).toISOString(),
    );
  });
  it("tornar a fallar reinicia a la caixa 1; saltar no mou res; un altre tag no es veu afectat", () => {
    const st = reviewState([
      at("incorrect", 0),
      at("correct", 1),
      at("incorrect", 2),
      at("skipped", 3),
    ]);
    const c = st.get("B5.T1|B5_CANCELA_TERME")!;
    expect(c.box).toBe(1);
    expect(c.lastAt).toBe(new Date(t0 + 2 * DAY).toISOString());
    expect(st.has("B5.T1|B5_NUMERO_PARCIAL")).toBe(false);
  });
  it("els encerts només mouen targetes de la mateixa plantilla", () => {
    const st = reviewState([at("incorrect", 0), at("correct", 1, { templateId: "B5.T2" })]);
    expect(st.get("B5.T1|B5_CANCELA_TERME")!.box).toBe(1);
  });
});
