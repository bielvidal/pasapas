/**
 * Tests de propietat (§5.5, §10): cada plantilla amb ≥ 500 llavors. PASAPAS_SEEDS per pujar-ho.
 */
import { buildItem, presentedErrorTags, structuralProblems } from "@pasapas/engine";
import { describe, expect, it } from "vitest";
import { TAGS, blockOfTag } from "../../../texts/ca";
import { verifyItem } from "../../verify";
import { B5_TEMPLATES } from "./templates";

const SEEDS = Number(process.env.PASAPAS_SEEDS ?? 500);

describe.each(B5_TEMPLATES.map((t) => [t.id, t] as const))("%s", (_id, t) => {
  it(`genera ${SEEDS} ítems correctes, únics i verificats`, () => {
    const failures: string[] = [];
    for (let seed = 1; seed <= SEEDS; seed++) {
      const item = buildItem(t, seed);
      const p = [...structuralProblems(item), ...verifyItem(item)];
      if (p.length) failures.push(`llavor ${seed}: ${p.join("; ")} :: ${item.promptLatex}`);
      if (item.type !== t.type || item.block !== t.block || item.level !== t.level)
        failures.push(`llavor ${seed}: metadades incoherents`);
      if (failures.length > 10) break;
    }
    expect(failures).toEqual([]);
  });

  it("és reproduïble", () => {
    const a = buildItem(t, 4242);
    const b = buildItem(t, 4242);
    expect(JSON.stringify(a, (_, v) => (typeof v === "bigint" ? v.toString() : v))).toBe(
      JSON.stringify(b, (_, v) => (typeof v === "bigint" ? v.toString() : v)),
    );
  });

  it("varia amb la llavor", () => {
    const prompts = new Set<string>();
    for (let seed = 1; seed <= 40; seed++) prompts.add(buildItem(t, seed).promptLatex);
    expect(prompts.size).toBeGreaterThan(3);
  });
});

describe("cobertura de tags del bloc B5", () => {
  it("cada tag B5_* del catàleg apareix en alguna plantilla, i cada tag usat existeix", () => {
    const seen = new Set<string>();
    for (const t of B5_TEMPLATES) {
      for (let seed = 1; seed <= 200; seed++) {
        for (const tag of presentedErrorTags(buildItem(t, seed))) seen.add(tag);
      }
    }
    const catalog = Object.keys(TAGS).filter((k) => blockOfTag(k) === "B5");
    expect(catalog.filter((k) => !seen.has(k))).toEqual([]);
    expect([...seen].filter((k) => !TAGS[k])).toEqual([]);
  });

  it("els valid_step surten vàlids i invàlids", () => {
    const t = B5_TEMPLATES.find((x) => x.id === "B5.T6")!;
    let valid = 0;
    for (let seed = 1; seed <= 200; seed++) {
      const item = buildItem(t, seed);
      if (item.type === "valid_step" && item.step.valid) valid++;
    }
    expect(valid).toBeGreaterThan(50);
    expect(valid).toBeLessThan(150);
  });

  it("els find_error tenen les tres variants", () => {
    const t = B5_TEMPLATES.find((x) => x.id === "B5.T9")!;
    const idx = new Set<string>();
    for (let seed = 1; seed <= 200; seed++) {
      const item = buildItem(t, seed);
      if (item.type === "find_error") idx.add(String(item.errorIndex));
    }
    expect([...idx].sort()).toEqual(["0", "2", "null"]);
  });
});
