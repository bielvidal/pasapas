import { describe, expect, it } from "vitest";
import { BLOCS, TAGS, fill } from "./index";

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
    ];
    for (const s of all) expect((s.match(/\$/g) ?? []).length % 2, s).toBe(0);
  });
  it("hi ha 7 blocs i només B5 està disponible", () => {
    expect(BLOCS.map((b) => b.id)).toEqual(["B1", "B2", "B3", "B4", "B5", "B6", "B7"]);
    expect(BLOCS.filter((b) => b.disponible).map((b) => b.id)).toEqual(["B5"]);
  });
});
