/**
 * Textos editables sense desplegar (fase 4). Cada text té una clau estable:
 *   tag:<TAG>:nom | tag:<TAG>:explicacio | bloc:<ID>:titol | bloc:<ID>:reglaOr |
 *   template:<ID>:<camí.amb.punts>  (p. ex. template:B3.T5:pool.quadratSuma.valid)
 * `applyOverrides` substitueix els textos en memòria (els objectes de text són `as const` només de
 * tipus); `listTexts` enumera tots els textos amb el seu original per al panell del tutor.
 */
import { B1_TEXTS } from "./B1";
import { B2_TEXTS } from "./B2";
import { B3_TEXTS } from "./B3";
import { B4_TEXTS } from "./B4";
import { B5_TEXTS } from "./B5";
import { B6_TEXTS } from "./B6";
import { B7_TEXTS } from "./B7";
import { BLOCS } from "./blocs";
import { TAGS } from "./tags";

type Obj = Record<string, unknown>;
/** B5 té les plantilles sota `plantilles`; la resta, al primer nivell. */
const container = (t: Obj): Obj =>
  t.plantilles && typeof t.plantilles === "object" ? (t.plantilles as Obj) : t;
const BLOCK_TEXTS: Obj[] = [
  B1_TEXTS,
  B2_TEXTS,
  B3_TEXTS,
  B4_TEXTS,
  B5_TEXTS,
  B6_TEXTS,
  B7_TEXTS,
].map((t) => container(t as unknown as Obj));

export interface TextEntry {
  key: string;
  original: string;
}

function walk(obj: Obj, prefix: string, out: TextEntry[]): void {
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === "string") out.push({ key: `${prefix}.${k}`, original: v });
    else if (v && typeof v === "object") walk(v as Obj, `${prefix}.${k}`, out);
  }
}

/** Tots els textos editables, amb l'original (el del codi). */
export function listTexts(): TextEntry[] {
  const out: TextEntry[] = [];
  for (const [tag, t] of Object.entries(ORIGINAL_TAGS)) {
    out.push(
      { key: `tag:${tag}:nom`, original: t.nom },
      { key: `tag:${tag}:explicacio`, original: t.explicacio },
    );
  }
  for (const b of ORIGINAL_BLOCS) {
    out.push(
      { key: `bloc:${b.id}:titol`, original: b.titol },
      { key: `bloc:${b.id}:reglaOr`, original: b.reglaOr },
    );
  }
  for (const texts of ORIGINAL_BLOCK_TEXTS) {
    for (const [id, v] of Object.entries(texts)) {
      if (!/^B\d\.T/.test(id) || !v || typeof v !== "object") continue;
      const sub: TextEntry[] = [];
      walk(v as Obj, "", sub);
      for (const e of sub)
        out.push({ key: `template:${id}:${e.key.slice(1)}`, original: e.original });
    }
  }
  return out;
}

const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v)) as T;
const ORIGINAL_TAGS = clone(TAGS);
const ORIGINAL_BLOCS = clone(BLOCS);
const ORIGINAL_BLOCK_TEXTS = BLOCK_TEXTS.map(clone);

function setPath(root: Obj, path: string[], value: string): boolean {
  let cur: Obj = root;
  for (const p of path.slice(0, -1)) {
    const next = cur[p];
    if (!next || typeof next !== "object") return false;
    cur = next as Obj;
  }
  const last = path[path.length - 1]!;
  if (typeof cur[last] !== "string") return false;
  cur[last] = value;
  return true;
}

let applied: Record<string, string> = {};

/** Torna tots els textos a l'original i aplica el mapa donat. Retorna les claus desconegudes. */
export function applyOverrides(overrides: Record<string, string>): string[] {
  // reset
  for (const [tag, t] of Object.entries(ORIGINAL_TAGS)) {
    if (TAGS[tag]) Object.assign(TAGS[tag], t);
  }
  ORIGINAL_BLOCS.forEach((b, i) => Object.assign(BLOCS[i] as unknown as Obj, b));
  ORIGINAL_BLOCK_TEXTS.forEach((o, i) => {
    for (const [id, v] of Object.entries(o)) {
      const target = (BLOCK_TEXTS[i] as Obj)[id];
      if (target && typeof target === "object") resetDeep(target as Obj, v as Obj);
    }
  });
  const unknown: string[] = [];
  for (const [key, text] of Object.entries(overrides)) {
    const [kind, id, ...rest] = key.split(":");
    const path = rest.join(":").split(".");
    let ok = false;
    if (kind === "tag" && id && TAGS[id]) ok = setPath(TAGS[id] as unknown as Obj, path, text);
    else if (kind === "bloc") {
      const b = BLOCS.find((x) => x.id === id);
      if (b) ok = setPath(b as unknown as Obj, path, text);
    } else if (kind === "template" && id) {
      for (const texts of BLOCK_TEXTS) {
        const t = texts[id];
        if (t && typeof t === "object") ok = setPath(t as Obj, path, text) || ok;
      }
    }
    if (!ok) unknown.push(key);
  }
  applied = { ...overrides };
  return unknown;
}

function resetDeep(target: Obj, original: Obj): void {
  for (const [k, v] of Object.entries(original)) {
    if (typeof v === "string") target[k] = v;
    else if (v && typeof v === "object" && target[k] && typeof target[k] === "object")
      resetDeep(target[k] as Obj, v as Obj);
  }
}

/** Mapa aplicat ara mateix (per a la UI). */
export const currentOverrides = (): Record<string, string> => ({ ...applied });
