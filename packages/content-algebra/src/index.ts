// @pasapas/content-algebra — plantilles, textos i verificació.
import type { Template } from "@pasapas/engine";
import { B5_TEMPLATES } from "./blocks/B5/templates";
import type { Machine } from "./machine";

export type { Machine, AlgOption } from "./machine";
export { verifyItem } from "./verify";
export * from "./math";
export { B5_TEMPLATES };

/** Versió del contingut (es desa a cada intent). Pujar-la quan canviï qualsevol plantilla o text. */
export const CONTENT_VERSION = "0.1.0";

export const ALL_TEMPLATES: Template<Machine>[] = [...B5_TEMPLATES];

export const templateById = (id: string): Template<Machine> | undefined =>
  ALL_TEMPLATES.find((t) => t.id === id);

export const templatesOfBlock = (block: string): Template<Machine>[] =>
  ALL_TEMPLATES.filter((t) => t.block === block);

/** Blocs que tenen almenys una plantilla. */
export const availableBlocks = (): string[] => [...new Set(ALL_TEMPLATES.map((t) => t.block))];
