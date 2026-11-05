import { describe, expect, it } from "vitest";
import {
  B1_TEXTS,
  B2_TEXTS,
  B3_TEXTS,
  B4_TEXTS,
  B5_TEXTS,
  B6_TEXTS,
  B7_TEXTS,
  BLOCS,
  TAGS,
  fill,
} from "./index";

function strings(v: unknown): string[] {
  if (typeof v === "string") return [v];
  if (v && typeof v === "object") return Object.values(v).flatMap(strings);
  return [];
}
const BLOCK_TEXTS = [B1_TEXTS, B2_TEXTS, B3_TEXTS, B4_TEXTS, B5_TEXTS, B6_TEXTS, B7_TEXTS];

describe("textos", () => {
  it("fill substitueix i avisa si falta un paràmetre", () => {
    expect(fill("Treu [[k]] i [[m]]", { k: 3, m: "x" })).toBe("Treu 3 i x");
    expect(() => fill("[[zz]]", {})).toThrow(/zz/);
  });
  it("els 61 tags del catàleg hi són, amb nom i explicació", () => {
    const keys = Object.keys(TAGS);
    expect(keys).toHaveLength(61);
    for (const k of keys) {
      expect(TAGS[k]!.nom.length).toBeGreaterThan(3);
      expect(TAGS[k]!.explicacio.length).toBeGreaterThan(10);
      expect(k).toMatch(/^B[1-7]_[A-Z_]+$/);
    }
  });
  it("els $ estan aparellats a tots els textos", () => {
    const all = [
      ...Object.values(TAGS).flatMap((t) => [t.nom, t.explicacio]),
      ...BLOCS.map((b) => b.reglaOr),
      ...BLOCK_TEXTS.flatMap(strings),
    ];
    for (const s of all) expect((s.match(/\$/g) ?? []).length % 2, s).toBe(0);
  });
  it("hi ha 7 blocs i tots estan disponibles", () => {
    expect(BLOCS.map((b) => b.id)).toEqual(["B1", "B2", "B3", "B4", "B5", "B6", "B7"]);
    expect(BLOCS.every((b) => b.disponible)).toBe(true);
  });
  it("tots els paràmetres [[...]] dels textos es poden omplir", () => {
    for (const s of BLOCK_TEXTS.flatMap(strings)) {
      const names = [...s.matchAll(/\[\[(\w+)\]\]/g)].map((m) => m[1]!);
      const filled = fill(s, Object.fromEntries(names.map((n) => [n, 1])));
      expect(filled, s).not.toMatch(/\[\[\w+\]\]/);
    }
  });
});
