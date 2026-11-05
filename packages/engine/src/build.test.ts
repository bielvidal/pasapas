import { describe, expect, it } from "vitest";
import { buildItem, grade, presentedErrorTags, structuralProblems } from "./build";
import type { ItemDraft, Template } from "./types";

const draft = (opts: Partial<ItemDraft> = {}): ItemDraft =>
  ({
    type: "mc_result",
    block: "T",
    level: 1,
    promptLatex: "p",
    instruction: "i",
    explanationCorrect: "e",
    options: [
      { id: "a", latex: "1", correct: true, errorTag: null, key: "1" },
      { id: "b", latex: "2", correct: false, errorTag: "T_X", key: "2" },
      { id: "c", latex: "3", correct: false, errorTag: "T_Y", key: "3" },
      { id: "d", latex: "4", correct: false, errorTag: "T_Z", key: "4" },
    ],
    ...opts,
  }) as ItemDraft;

describe("structuralProblems", () => {
  it("accepta un esborrany ben format", () => {
    expect(structuralProblems(draft())).toEqual([]);
  });
  it("detecta latex i claus repetides, tags que falten i més d'una correcta", () => {
    const d = draft();
    d.options[1]!.latex = "1";
    d.options[2]!.key = "4";
    d.options[3]!.errorTag = null;
    d.options[3]!.correct = true;
    const p = structuralProblems(d);
    expect(p.join("\n")).toMatch(/es mostren igual/);
    expect(p.join("\n")).toMatch(/mateixa forma màquina/);
    expect(p.join("\n")).toMatch(/2 opcions correctes/);
  });
});

describe("buildItem", () => {
  it("regenera amb llavor derivada quan hi ha col·lisió i acaba trobant un ítem vàlid", () => {
    let calls = 0;
    const t: Template = {
      id: "T.T1",
      version: 1,
      block: "T",
      type: "mc_result",
      level: 1,
      generate() {
        calls++;
        const d = draft();
        if (calls === 1) d.options[1]!.latex = "1"; // col·lisió només al primer intent
        return d;
      },
    };
    const item = buildItem(t, 123);
    expect(calls).toBe(2);
    expect(item.seed).toBe(123);
    expect(item.options).toHaveLength(4);
  });
  it("llança GenerationError si no se'n surt en 20 intents", () => {
    const t: Template = {
      id: "T.T2",
      version: 1,
      block: "T",
      type: "mc_result",
      level: 1,
      generate() {
        const d = draft();
        d.options[1]!.latex = "1";
        return d;
      },
    };
    expect(() => buildItem(t, 1)).toThrow(/20 intents/);
  });
  it("és reproduïble i barreja les opcions", () => {
    const t: Template = {
      id: "T.T3",
      version: 1,
      block: "T",
      type: "mc_result",
      level: 1,
      generate: () => draft(),
    };
    const a = buildItem(t, 99);
    const b = buildItem(t, 99);
    expect(a.options.map((o) => o.id)).toEqual(b.options.map((o) => o.id));
    const orders = new Set<string>();
    for (let s = 1; s < 30; s++)
      orders.add(
        buildItem(t, s)
          .options.map((o) => o.id)
          .join(""),
      );
    expect(orders.size).toBeGreaterThan(3);
  });
});

describe("grade", () => {
  const t: Template = {
    id: "T.T4",
    version: 1,
    block: "T",
    type: "mc_result",
    level: 1,
    generate: () => draft(),
  };
  const item = buildItem(t, 5);
  it("encert", () => {
    const g = grade(item, "a");
    expect(g.outcome).toBe("correct");
    expect(g.errorTag).toBeNull();
    expect(g.presentedErrorTags.sort()).toEqual(["T_X", "T_Y", "T_Z"]);
  });
  it("error amb el seu tag", () => {
    expect(grade(item, "c")).toMatchObject({ outcome: "incorrect", errorTag: "T_Y" });
  });
  it("«Encara no ho sé» no compta com a error", () => {
    expect(grade(item, null)).toMatchObject({
      outcome: "skipped",
      errorTag: null,
      chosenOptionId: null,
    });
    expect(presentedErrorTags(item)).toHaveLength(3);
  });
});
