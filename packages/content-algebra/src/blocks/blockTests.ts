/**
 * Tests de propietat compartits (§5.5, §10): cada plantilla amb ≥ 500 llavors (PASAPAS_SEEDS),
 * reproduïbilitat, variació i cobertura de tots els tags del bloc.
 */
import { buildItem, presentedErrorTags, structuralProblems, type Template } from "@pasapas/engine";
import { describe, expect, it } from "vitest";
import { TAGS, blockOfTag } from "../../texts/ca";
import type { Machine } from "../machine";
import { verifyItem } from "../verify";

const SEEDS = Number(process.env.PASAPAS_SEEDS ?? 500);

export function describeBlock(
  block: string,
  templates: Template<Machine>[],
  extra: { validStep?: string[]; findError?: Record<string, string[]> } = {},
) {
  describe.each(templates.map((t) => [t.id, t] as const))("%s", (_id, t) => {
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
      const j = (v: unknown) =>
        JSON.stringify(v, (_, x) => (typeof x === "bigint" ? x.toString() : x));
      expect(j(buildItem(t, 4242))).toBe(j(buildItem(t, 4242)));
    });

    it("varia amb la llavor", () => {
      const prompts = new Set<string>();
      for (let seed = 1; seed <= 40; seed++) prompts.add(buildItem(t, seed).promptLatex);
      expect(prompts.size).toBeGreaterThan(3);
    });
  });

  describe(`cobertura de tags del bloc ${block}`, () => {
    it(`cada tag ${block}_* del catàleg apareix en alguna plantilla, i cada tag usat existeix`, () => {
      const seen = new Set<string>();
      for (const t of templates) {
        for (let seed = 1; seed <= 200; seed++) {
          for (const tag of presentedErrorTags(buildItem(t, seed))) seen.add(tag);
        }
      }
      const catalog = Object.keys(TAGS).filter((k) => blockOfTag(k) === block);
      expect(catalog.filter((k) => !seen.has(k))).toEqual([]);
      expect([...seen].filter((k) => !TAGS[k])).toEqual([]);
    });

    for (const id of extra.validStep ?? []) {
      it(`${id}: els valid_step surten vàlids i invàlids`, () => {
        const t = templates.find((x) => x.id === id)!;
        let valid = 0;
        for (let seed = 1; seed <= 200; seed++) {
          const item = buildItem(t, seed);
          if (item.type === "valid_step" && item.step.valid) valid++;
        }
        expect(valid).toBeGreaterThan(40);
        expect(valid).toBeLessThan(160);
      });
    }

    for (const [id, expected] of Object.entries(extra.findError ?? {})) {
      it(`${id}: els find_error tenen totes les variants`, () => {
        const t = templates.find((x) => x.id === id)!;
        const idx = new Set<string>();
        for (let seed = 1; seed <= 300; seed++) {
          const item = buildItem(t, seed);
          if (item.type === "find_error") idx.add(String(item.errorIndex));
        }
        expect([...idx].sort()).toEqual([...expected].sort());
      });
    }
  });
}
