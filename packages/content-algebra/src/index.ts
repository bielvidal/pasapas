// @pasapas/content-algebra — plantilles, textos i verificació.
import { buildItem, presentedErrorTags, type Template } from "@pasapas/engine";
import { B1_TEMPLATES } from "./blocks/B1/templates";
import { B2_TEMPLATES } from "./blocks/B2/templates";
import { B3_TEMPLATES } from "./blocks/B3/templates";
import { B4_TEMPLATES } from "./blocks/B4/templates";
import { B5_TEMPLATES } from "./blocks/B5/templates";
import { B6_TEMPLATES } from "./blocks/B6/templates";
import { B7_TEMPLATES } from "./blocks/B7/templates";
import type { Machine } from "./machine";
import { TAG_TEMPLATE_INDEX } from "./tagIndex.generated";

export type { Machine, AlgOption } from "./machine";
export { verifyItem, machineEquals } from "./verify";
export * from "./math";
export {
  B1_TEMPLATES,
  B2_TEMPLATES,
  B3_TEMPLATES,
  B4_TEMPLATES,
  B5_TEMPLATES,
  B6_TEMPLATES,
  B7_TEMPLATES,
};

/** Versió del contingut (es desa a cada intent). Pujar-la quan canviï qualsevol plantilla o text. */
export const CONTENT_VERSION = "0.3.0";

export const ALL_TEMPLATES: Template<Machine>[] = [
  ...B1_TEMPLATES,
  ...B2_TEMPLATES,
  ...B3_TEMPLATES,
  ...B4_TEMPLATES,
  ...B5_TEMPLATES,
  ...B6_TEMPLATES,
  ...B7_TEMPLATES,
];

export const templateById = (id: string): Template<Machine> | undefined =>
  ALL_TEMPLATES.find((t) => t.id === id);

export const templatesOfBlock = (block: string): Template<Machine>[] =>
  ALL_TEMPLATES.filter((t) => t.block === block);

/** Blocs que tenen almenys una plantilla. */
export const availableBlocks = (): string[] => [...new Set(ALL_TEMPLATES.map((t) => t.block))];

/**
 * Índex error_tag → plantilles que el presenten com a distractor (per a «Proposats per a tu»).
 * `computeTagTemplateIndex` el calcula generant ítems de cada plantilla (les variants de
 * valid_step i find_error presenten tags diferents segons la llavor); com que triga, la web fa
 * servir la versió precalculada `TAG_TEMPLATE_INDEX` (`npm run gen:tags`; un test comprova que
 * coincideixen).
 */
export function computeTagTemplateIndex(seeds = 40): Record<string, string[]> {
  const idx: Record<string, Set<string>> = {};
  for (const t of ALL_TEMPLATES) {
    for (let seed = 1; seed <= seeds; seed++) {
      for (const tag of presentedErrorTags(buildItem(t, seed))) (idx[tag] ??= new Set()).add(t.id);
    }
  }
  return Object.fromEntries(
    Object.keys(idx)
      .sort()
      .map((k) => [k, [...idx[k]!].sort()]),
  );
}

export { TAG_TEMPLATE_INDEX };
export const tagTemplateIndex = (): Readonly<Record<string, readonly string[]>> =>
  TAG_TEMPLATE_INDEX;
