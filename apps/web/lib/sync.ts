/**
 * Cua de sincronització (§4.1): puja els intents i sessions locals pendents (lots idempotents) i
 * baixa els que hagin arribat al servidor des d'altres dispositius (cursor keyset `received_at|id`).
 * Tot és tolerant a la manca de xarxa: si falla, es torna a provar més tard.
 */
import type { Attempt } from "@pasapas/engine";
import { api, ApiError, post } from "./api";
import { db, type LocalAttempt } from "./db";

const BATCH = 400;
const CURSOR_KEY = "cursor";

export interface AttemptsPage {
  attempts: (Attempt & { receivedAt: string })[];
  cursor: string | null;
  more: boolean;
}

export async function pushPending(): Promise<number> {
  const d = db();
  let pushed = 0;
  for (;;) {
    const pending = await d.attempts.where("synced").equals(0).limit(BATCH).toArray();
    if (pending.length === 0) break;
    const r = await post<{ accepted: string[]; ignored: string[] }>("/api/attempts/batch", {
      attempts: pending.map(stripLocal),
    });
    const done = [...r.accepted, ...r.ignored]; // els ignorats són d'un altre usuari: no insistim
    if (done.length === 0) break;
    await d.attempts.where("id").anyOf(done).modify({ synced: 1 });
    pushed += r.accepted.length;
    if (pending.length < BATCH) break;
  }
  const sessions = await d.sessions.where("synced").equals(0).limit(BATCH).toArray();
  if (sessions.length > 0) {
    const r = await post<{ accepted: string[] }>("/api/sessions/batch", {
      sessions: sessions.map(({ synced: _s, ...s }) => s),
    });
    // Una sessió oberta (endedAt null) es torna a enviar quan es tanqui: només marquem les tancades.
    const closed = sessions.filter((s) => s.endedAt && r.accepted.includes(s.id)).map((s) => s.id);
    if (closed.length) await d.sessions.where("id").anyOf(closed).modify({ synced: 1 });
  }
  return pushed;
}

function stripLocal(a: LocalAttempt): Attempt {
  const { synced: _s, ...rest } = a;
  return rest;
}

export async function pullNew(): Promise<number> {
  const d = db();
  let cursor = (await d.meta.get(CURSOR_KEY))?.value ?? null;
  let pulled = 0;
  for (;;) {
    const page = await api<AttemptsPage>(
      `/api/attempts?${new URLSearchParams(cursor ? { since: cursor } : {})}`,
    );
    if (page.attempts.length > 0) {
      await d.attempts.bulkPut(
        page.attempts.map(({ receivedAt: _r, ...a }) => ({ ...a, synced: 1 as const })),
      );
      pulled += page.attempts.length;
    }
    if (page.cursor && page.cursor !== cursor) {
      cursor = page.cursor;
      await d.meta.put({ key: CURSOR_KEY, value: cursor });
    }
    if (!page.more) break;
  }
  return pulled;
}

let inFlight: Promise<SyncResult | null> | null = null;
let timer: ReturnType<typeof setTimeout> | null = null;

export interface SyncResult {
  pushed: number;
  pulled: number;
}

/** Puja i baixa; una sola execució alhora. Retorna null si no hi ha xarxa o sessió. */
export function syncAll(): Promise<SyncResult | null> {
  if (inFlight) return inFlight;
  inFlight = (async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.onLine === false) return null;
      const pushed = await pushPending();
      const pulled = await pullNew();
      return { pushed, pulled };
    } catch (e) {
      if (e instanceof ApiError && (e.offline || e.status === 401)) return null;
      console.warn("sync", e);
      return null;
    } finally {
      inFlight = null;
    }
  })();
  return inFlight;
}

/** Sincronitza d'aquí a poc (p. ex. després de desar un intent), agrupant crides. */
export function scheduleSync(delayMs = 1500): void {
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    timer = null;
    void syncAll();
  }, delayMs);
}

/** Tots els intents d'un usuari, directes de l'API (vista del tutor; no toca la BD local). */
export async function fetchAttemptsOf(userId: number): Promise<Attempt[]> {
  const out: Attempt[] = [];
  let cursor: string | null = null;
  for (;;) {
    const q = new URLSearchParams({ user_id: String(userId), limit: "5000" });
    if (cursor) q.set("since", cursor);
    const page: AttemptsPage = await api<AttemptsPage>(`/api/attempts?${q}`);
    for (const { receivedAt: _r, ...a } of page.attempts) out.push(a);
    cursor = page.cursor;
    if (!page.more) break;
  }
  return out;
}
