import { writeFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { TAGS } from "../texts/ca";
import { computeTagTemplateIndex, TAG_TEMPLATE_INDEX } from "./index";

describe("índex tag → plantilles", () => {
  it("el precalculat coincideix amb el calculat (si no: npm run gen:tags)", () => {
    const computed = computeTagTemplateIndex();
    if (process.env.PASAPAS_GEN_TAGS === "1") {
      writeFileSync(
        new URL("./tagIndex.generated.ts", import.meta.url),
        "// GENERAT per `npm run gen:tags` (src/tagIndex.test.ts). No editar a mà.\n" +
          `export const TAG_TEMPLATE_INDEX: Readonly<Record<string, readonly string[]>> = ${JSON.stringify(computed, null, 2)};\n`,
      );
      return;
    }
    expect(TAG_TEMPLATE_INDEX).toEqual(computed);
  });
  it("tots els 61 tags tenen almenys una plantilla que els presenta", () => {
    expect(Object.keys(TAGS).filter((t) => !TAG_TEMPLATE_INDEX[t]?.length)).toEqual([]);
  });
});
