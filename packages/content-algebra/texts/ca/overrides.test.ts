import { describe, expect, it } from "vitest";
import { B5_TEXTS } from "./B5";
import { BLOCS } from "./blocs";
import { applyOverrides, listTexts } from "./overrides";
import { TAGS } from "./tags";

describe("overrides", () => {
  it("llista tots els textos amb claus estables", () => {
    const keys = listTexts().map((t) => t.key);
    expect(keys).toContain("tag:B5_CANCELA_TERME:nom");
    expect(keys).toContain("bloc:B5:reglaOr");
    expect(keys).toContain("template:B5.T1:explicacioCorrecta");
    expect(keys).toContain("template:B3.T5:pool.quadratSuma.valid");
    expect(new Set(keys).size).toBe(keys.length);
    expect(keys.length).toBeGreaterThan(200);
  });
  it("aplica, torna a l'original i avisa de claus desconegudes", () => {
    const orig = TAGS.B5_CANCELA_TERME!.nom;
    const origExpl = B5_TEXTS.plantilles["B5.T1"].explicacioCorrecta;
    const unknown = applyOverrides({
      "tag:B5_CANCELA_TERME:nom": "Nou nom",
      "template:B5.T1:explicacioCorrecta": "Nova explicació [[k]]",
      "bloc:B5:titol": "Fraccions",
      "tag:NO_EXISTEIX:nom": "x",
      "template:B5.T1:camp.inexistent": "x",
    });
    expect(unknown).toEqual(["tag:NO_EXISTEIX:nom", "template:B5.T1:camp.inexistent"]);
    expect(TAGS.B5_CANCELA_TERME!.nom).toBe("Nou nom");
    expect(B5_TEXTS.plantilles["B5.T1"].explicacioCorrecta).toBe("Nova explicació [[k]]");
    expect(BLOCS.find((b) => b.id === "B5")!.titol).toBe("Fraccions");
    applyOverrides({});
    expect(TAGS.B5_CANCELA_TERME!.nom).toBe(orig);
    expect(B5_TEXTS.plantilles["B5.T1"].explicacioCorrecta).toBe(origExpl);
    expect(BLOCS.find((b) => b.id === "B5")!.titol).toBe("Simplificar fraccions algebraiques");
  });
});
