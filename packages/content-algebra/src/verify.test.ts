import { buildItem } from "@pasapas/engine";
import { describe, expect, it } from "vitest";
import { B5_TEMPLATES } from "./blocks/B5/templates";
import { rfMachine } from "./machine";
import { RF } from "./math/rf";
import { verifyItem } from "./verify";

const tpl = (id: string) => B5_TEMPLATES.find((t) => t.id === id)!;

describe("verifyItem detecta errors de debò", () => {
  it("una «correcta» que no equival a l'enunciat", () => {
    const item = buildItem(tpl("B5.T1"), 1);
    const correct = item.options.find((o) => o.correct)!;
    correct.machine = rfMachine(RF.X);
    expect(verifyItem(item).join()).toMatch(/NO equival/);
  });
  it("un distractor que sí equival", () => {
    const item = buildItem(tpl("B5.T4"), 1);
    const d = item.options.find((o) => !o.correct && o.machine?.kind === "rf")!;
    d.machine = item.promptMachine!;
    expect(verifyItem(item).join()).toMatch(/equival a l'enunciat/);
  });
  it("«No es pot simplificar» marcada correcta quan sí es pot", () => {
    const item = buildItem(tpl("B5.T1"), 2);
    for (const o of item.options) o.correct = o.machine?.kind === "claim";
    expect(verifyItem(item).join()).toMatch(/SÍ es pot simplificar/);
  });
  it("valid_step amb el flag girat", () => {
    const item = buildItem(tpl("B5.T6"), 3);
    if (item.type !== "valid_step") throw new Error("tipus");
    item.step.valid = !item.step.valid;
    expect(verifyItem(item).join()).toMatch(/marcat/);
  });
  it("find_error amb errorIndex mogut", () => {
    let seed = 1;
    let item = buildItem(tpl("B5.T9"), seed);
    while (item.type !== "find_error" || item.errorIndex !== 2)
      item = buildItem(tpl("B5.T9"), ++seed);
    item.errorIndex = 1;
    expect(verifyItem(item).join()).toMatch(/pas 1 \(erroni\) equival/);
  });
  it("tag desconegut", () => {
    const item = buildItem(tpl("B5.T2"), 1);
    item.options.find((o) => !o.correct)!.errorTag = "B5_INVENTAT";
    expect(verifyItem(item).join()).toMatch(/desconegut/);
  });
});
