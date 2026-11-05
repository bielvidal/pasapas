import { describe, expect, it } from "vitest";
import {
  activeDays,
  allTagsMastery,
  blockMastery,
  currentLevel,
  tagMastery,
  weekKey,
  weeklySeries,
} from "./mastery";
import type { Attempt, Level, Outcome, QuestionType } from "./types";

let n = 0;
const at = (outcome: Outcome, extra: Partial<Attempt> & { minutesAgo?: number } = {}): Attempt => {
  const { minutesAgo, ...rest } = extra;
  const base = new Date("2026-11-05T12:00:00Z").getTime();
  n++;
  return {
    id: `a${n}`,
    sessionId: "s",
    block: "B5",
    templateId: "B5.T1",
    templateVersion: 1,
    seed: n,
    questionType: "mc_result" as QuestionType,
    level: 1 as Level,
    outcome,
    chosenOptionId: outcome === "skipped" ? null : "x",
    errorTag: outcome === "incorrect" ? "B5_CANCELA_TERME" : null,
    presentedErrorTags: ["B5_CANCELA_TERME", "B5_NUMERO_PARCIAL"],
    explanationOpened: false,
    clientCreatedAt: new Date(base - (minutesAgo ?? 1000 - n) * 60_000).toISOString(),
    appVersion: "t",
    contentVersion: "t",
    ...rest,
  };
};

describe("blockMastery", () => {
  it("menys de 6 intents → en_marxa", () => {
    const m = blockMastery([at("correct"), at("correct"), at("correct")], "B5");
    expect(m.state).toBe("en_marxa");
    expect(m.total).toBe(3);
  });
  it("els saltats no compten", () => {
    const list = [...Array.from({ length: 6 }, () => at("correct")), at("skipped"), at("skipped")];
    expect(blockMastery(list, "B5").total).toBe(6);
  });
  it("60-84 % → ho_vaig_agafant", () => {
    const list = [
      ...Array.from({ length: 7 }, () => at("correct")),
      ...Array.from({ length: 3 }, () => at("incorrect")),
    ];
    expect(blockMastery(list, "B5").state).toBe("ho_vaig_agafant");
  });
  it("≥85 % amb ≥10 intents i 2 tipus → dominat; amb un sol tipus no", () => {
    const one = Array.from({ length: 10 }, () => at("correct"));
    expect(blockMastery(one, "B5").state).toBe("ho_vaig_agafant");
    const two = [
      ...Array.from({ length: 5 }, () => at("correct")),
      ...Array.from({ length: 5 }, () => at("correct", { questionType: "valid_step" })),
    ];
    expect(blockMastery(two, "B5").state).toBe("dominat");
  });
  it("només mira els últims 12", () => {
    const list = [
      ...Array.from({ length: 12 }, () => at("incorrect")),
      ...Array.from({ length: 6 }, () => at("correct")),
      ...Array.from({ length: 6 }, () => at("correct", { questionType: "find_error" })),
    ];
    expect(blockMastery(list, "B5").state).toBe("dominat");
  });
  it("currentLevel és el primer no dominat", () => {
    const l1 = [
      ...Array.from({ length: 6 }, () => at("correct")),
      ...Array.from({ length: 6 }, () => at("correct", { questionType: "valid_step" })),
    ];
    expect(currentLevel(l1, "B5")).toBe(2);
    expect(currentLevel([], "B5")).toBe(1);
  });
});

describe("tagMastery", () => {
  it("superat quan les 4 últimes presentacions no s'han triat", () => {
    const list = [at("incorrect"), at("correct"), at("correct"), at("correct"), at("correct")];
    expect(tagMastery(list, "B5_CANCELA_TERME").state).toBe("superat");
    expect(tagMastery(list, "B5_CANCELA_TERME").chosen).toBe(1);
  });
  it("actiu si s'ha triat dins de la finestra o hi ha poques dades", () => {
    expect(tagMastery([at("correct"), at("correct")], "B5_CANCELA_TERME").state).toBe("actiu");
    const list = [at("correct"), at("correct"), at("incorrect"), at("correct")];
    expect(tagMastery(list, "B5_CANCELA_TERME").state).toBe("actiu");
  });
  it("sense_dades si no ha aparegut", () => {
    expect(tagMastery([], "B5_X").state).toBe("sense_dades");
    expect(
      allTagsMastery([at("correct")])
        .map((t) => t.tag)
        .sort(),
    ).toEqual(["B5_CANCELA_TERME", "B5_NUMERO_PARCIAL"]);
  });
});

describe("setmanes i dies", () => {
  it("weekKey dona el dilluns", () => {
    expect(weekKey("2026-11-05T12:00:00")).toBe("2026-11-02");
    expect(weekKey("2026-11-02T00:30:00")).toBe("2026-11-02");
    expect(weekKey("2026-11-08T23:00:00")).toBe("2026-11-02");
  });
  it("weeklySeries té totes les setmanes", () => {
    const now = new Date("2026-11-05T12:00:00");
    const s = weeklySeries([at("correct", { minutesAgo: 10 })], 4, now);
    expect(s).toHaveLength(4);
    expect(s.at(-1)!.attempts).toBe(1);
    expect(s[0]!.attempts).toBe(0);
  });
  it("activeDays", () => {
    expect(
      activeDays([at("correct", { minutesAgo: 1 }), at("correct", { minutesAgo: 2 })]),
    ).toHaveLength(1);
  });
});
