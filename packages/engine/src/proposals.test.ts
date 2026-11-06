import { describe, expect, it } from "vitest";
import { planProposedRound, tagsToReinforce } from "./proposals";
import { mulberry32 } from "./rng";
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
  tpl("B3.T1", 1, "B3"),
  tpl("B3.T3", 2, "B3"),
];
const tagTemplates = {
  B5_CANCELA_TERME: ["B5.T1", "B5.T2"],
  B5_SIGNE_OPOSAT: ["B5.T3"],
  B3_COEF_NO_ELEVAT: ["B3.T1", "B3.T3"],
};
const NOW = new Date("2026-11-20T12:00:00Z");
let n = 0;
const at = (
  templateId: string,
  tag: string | null,
  daysAgo = 1,
  presented: string[] = tag ? [tag] : [],
): Attempt => {
  n++;
  const t = templates.find((x) => x.id === templateId)!;
  return {
    id: `a${n}`,
    sessionId: "s",
    block: t.block,
    templateId,
    templateVersion: 1,
    seed: n,
    questionType: "mc_result",
    level: t.level,
    outcome: tag ? "incorrect" : "correct",
    chosenOptionId: "x",
    errorTag: tag,
    presentedErrorTags: presented,
    explanationOpened: false,
    clientCreatedAt: new Date(NOW.getTime() - daysAgo * 86_400_000 + n * 1000).toISOString(),
    appVersion: "t",
    contentVersion: "t",
  };
};

describe("Proposats per a tu", () => {
  it("un error aïllat i superat no es reforça; dos cops sí; antic (fora de finestra) no", () => {
    const superat = [
      at("B5.T3", "B5_SIGNE_OPOSAT", 5),
      ...[4, 3, 2, 1].map((d) => at("B5.T3", null, d, ["B5_SIGNE_OPOSAT"])),
    ];
    const dos = [at("B5.T1", "B5_CANCELA_TERME", 3), at("B5.T2", "B5_CANCELA_TERME", 2)];
    const antic = [at("B3.T1", "B3_COEF_NO_ELEVAT", 60), at("B3.T1", "B3_COEF_NO_ELEVAT", 59)];
    expect(tagsToReinforce([...superat, ...dos, ...antic], NOW)).toEqual(["B5_CANCELA_TERME"]);
  });
  it("un error actiu triat una vegada dins la finestra sí que compta", () => {
    expect(tagsToReinforce([at("B3.T1", "B3_COEF_NO_ELEVAT", 2)], NOW)).toEqual([
      "B3_COEF_NO_ELEVAT",
    ]);
  });
  it("la ronda reforça amb plantilles que presenten l'error i confirma el superat", () => {
    const att = [
      at("B5.T1", "B5_CANCELA_TERME", 3),
      at("B5.T2", "B5_CANCELA_TERME", 2),
      at("B5.T3", "B5_SIGNE_OPOSAT", 10),
      ...[9, 8, 7, 6].map((d) => at("B5.T3", null, d, ["B5_SIGNE_OPOSAT"])),
    ];
    const { plan, reason } = planProposedRound({
      templates,
      attempts: att,
      tagTemplates,
      rng: mulberry32(1),
      now: NOW,
    });
    expect(plan).toHaveLength(10);
    expect(reason.reinforce).toEqual(["B5_CANCELA_TERME"]);
    expect(reason.confirm).toBe("B5_SIGNE_OPOSAT");
    const reinf = plan.filter((p) => p.slot === "reinforce");
    expect(reinf.length).toBeGreaterThanOrEqual(4);
    expect(
      reinf.every(
        (p) => ["B5.T1", "B5.T2"].includes(p.templateId) && p.reviewTag === "B5_CANCELA_TERME",
      ),
    ).toBe(true);
    expect(plan.filter((p) => p.slot === "confirm").map((p) => p.templateId)).toEqual(["B5.T3"]);
    expect(new Set(plan.map((p) => p.seed)).size).toBe(plan.length);
  });
  it("cel·la fluixa del mapa de calor", () => {
    const att = [
      at("B3.T3", "B3_COEF_NO_ELEVAT", 3),
      at("B3.T3", "B3_COEF_NO_ELEVAT", 2),
      at("B3.T3", "B3_COEF_NO_ELEVAT", 1),
    ];
    const { plan, reason } = planProposedRound({
      templates,
      attempts: att,
      tagTemplates,
      rng: mulberry32(2),
      now: NOW,
    });
    expect(reason.weakCell).toEqual({ block: "B3", level: 2 });
    expect(plan.filter((p) => p.slot === "current").every((p) => p.templateId === "B3.T3")).toBe(
      true,
    );
  });
  it("sense dades, ronda buida", () => {
    expect(
      planProposedRound({ templates, attempts: [], tagTemplates, rng: mulberry32(1), now: NOW })
        .plan,
    ).toEqual([]);
  });
});
