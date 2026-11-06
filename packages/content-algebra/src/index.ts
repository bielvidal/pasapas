// @pasapas/content-algebra — plantilles, textos i verificació.
import type { Template } from "@pasapas/engine";
import { B1_TEMPLATES } from "./blocks/B1/templates";
import { B2_TEMPLATES } from "./blocks/B2/templates";
import { B3_TEMPLATES } from "./blocks/B3/templates";
import { B4_TEMPLATES } from "./blocks/B4/templates";
import { B5_TEMPLATES } from "./blocks/B5/templates";
import { B6_TEMPLATES } from "./blocks/B6/templates";
import { B7_TEMPLATES } from "./blocks/B7/templates";
import type { Machine } from "./machine";

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
