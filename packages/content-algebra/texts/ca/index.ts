export { TAGS, blockOfTag } from "./tags";
export type { TagText } from "./tags";
export { BLOCS, blocById } from "./blocs";
export type { BlockText } from "./blocs";
export { B5_TEXTS } from "./B5";
export { B1_TEXTS } from "./B1";
export { B2_TEXTS } from "./B2";
export { B3_TEXTS } from "./B3";
export { B4_TEXTS } from "./B4";
export { B6_TEXTS } from "./B6";
export { B7_TEXTS } from "./B7";
export { COMU } from "./comu";
export { listTexts, applyOverrides, currentOverrides } from "./overrides";
export type { TextEntry } from "./overrides";

/** Substitueix els [[param]] d'un text pels valors donats. Llança si en falta algun. */
export function fill(text: string, params: Record<string, string | number | bigint>): string {
  return text.replace(/\[\[(\w+)\]\]/g, (_, name: string) => {
    const v = params[name];
    if (v === undefined) throw new Error(`falta el paràmetre [[${name}]] al text: ${text}`);
    return String(v);
  });
}
