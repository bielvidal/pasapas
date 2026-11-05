import { ALL_TEMPLATES, templateById, templatesOfBlock } from "@pasapas/content-algebra";
import { BLOCS, TAGS, blocById } from "@pasapas/content-algebra/texts/ca";

export { ALL_TEMPLATES, templateById, templatesOfBlock, BLOCS, TAGS, blocById };

export const tagName = (tag: string): string => TAGS[tag]?.nom ?? tag;
export const tagExplanation = (tag: string): string => TAGS[tag]?.explicacio ?? "";
