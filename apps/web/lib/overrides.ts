/**
 * Textos editats pel tutor (fase 4): es baixen de l'API (el tutor rep també els esborranys; l'alumna
 * només els aprovats), s'apliquen als textos en memòria i es desen a la BD local per arrencar
 * offline amb els mateixos textos.
 */
import { applyOverrides } from "@pasapas/content-algebra/texts/ca";
import { api } from "./api";
import { db } from "./db";

const META_KEY = "overrides";

export interface OverrideRow {
  key: string;
  text: string;
  state: "esborrany" | "aprovat";
  updated_at: string;
}

/** Aplica els textos desats localment (abans de renderitzar res). */
export async function applyCachedOverrides(): Promise<number> {
  const row = await db().meta.get(META_KEY);
  const map = row ? (JSON.parse(row.value) as Record<string, string>) : {};
  applyOverrides(map);
  return Object.keys(map).length;
}

/** Baixa els textos de l'API, els aplica i els desa. Retorna null sense xarxa. */
export async function refreshOverrides(): Promise<OverrideRow[] | null> {
  const r = await api<{ overrides: OverrideRow[] }>("/api/content/overrides");
  const map = Object.fromEntries(r.overrides.map((o) => [o.key, o.text]));
  applyOverrides(map);
  await db().meta.put({ key: META_KEY, value: JSON.stringify(map) });
  return r.overrides;
}
