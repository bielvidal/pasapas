export { TAGS, blockOfTag } from "./tags";
export type { TagText } from "./tags";
export { BLOCS, blocById } from "./blocs";
export type { BlockText } from "./blocs";
export { B5_TEXTS } from "./B5";

/** Substitueix els [[param]] d'un text pels valors donats. Llança si en falta algun. */
export function fill(text: string, params: Record<string, string | number | bigint>): string {
  return text.replace(/\[\[(\w+)\]\]/g, (_, name: string) => {
    const v = params[name];
    if (v === undefined) throw new Error(`falta el paràmetre [[${name}]] al text: ${text}`);
    return String(v);
  });
}
