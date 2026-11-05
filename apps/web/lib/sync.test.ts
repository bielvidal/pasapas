import type { Attempt } from "@pasapas/engine";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { db, setCurrentUser } from "./db";
import { fetchAttemptsOf, pullNew, pushPending } from "./sync";

function attempt(id: string, over: Partial<Attempt> = {}): Attempt {
  return {
    id,
    sessionId: "s1",
    block: "B5",
    templateId: "B5.T1",
    templateVersion: 1,
    seed: 7,
    questionType: "mc_result",
    level: 1,
    outcome: "incorrect",
    chosenOptionId: "b",
    errorTag: "B5_X",
    presentedErrorTags: ["B5_X"],
    explanationOpened: false,
    clientCreatedAt: "2026-11-06T10:00:00.000Z",
    appVersion: "t",
    contentVersion: "t",
    ...over,
  };
}

type Call = { url: string; body?: unknown };
let calls: Call[];
let responses: ((url: string, body: unknown) => unknown)[];

beforeEach(async () => {
  setCurrentUser(999);
  await db().delete();
  await db().open();
  calls = [];
  responses = [];
  vi.stubGlobal("fetch", async (url: string, init?: RequestInit) => {
    const body = init?.body ? JSON.parse(init.body as string) : undefined;
    calls.push({ url, body });
    const r = responses.shift();
    if (!r) throw new Error("sense resposta preparada per a " + url);
    return new Response(JSON.stringify(r(url, body)), { status: 200 });
  });
});
afterEach(() => vi.unstubAllGlobals());

describe("sync", () => {
  it("push: envia els pendents i els marca synced", async () => {
    await db().attempts.bulkAdd([
      { ...attempt("a"), synced: 0 },
      { ...attempt("b"), synced: 1 },
      { ...attempt("c"), synced: 0 },
    ]);
    responses.push((_u, body) => ({
      accepted: (body as { attempts: Attempt[] }).attempts.map((a) => a.id),
      ignored: [],
    }));
    expect(await pushPending()).toBe(2);
    expect(calls[0]!.url).toBe("/api/attempts/batch");
    const sent = (calls[0]!.body as { attempts: Record<string, unknown>[] }).attempts;
    expect(sent.map((a) => a.id)).toEqual(["a", "c"]);
    expect(sent[0]).not.toHaveProperty("synced");
    expect(await db().attempts.where("synced").equals(0).count()).toBe(0);
  });

  it("push: els ignorats (d'un altre usuari) també deixen de ser pendents", async () => {
    await db().attempts.add({ ...attempt("x"), synced: 0 });
    responses.push(() => ({ accepted: [], ignored: ["x"] }));
    expect(await pushPending()).toBe(0);
    expect((await db().attempts.get("x"))!.synced).toBe(1);
  });

  it("push: sessions tancades es marquen; les obertes es tornaran a enviar", async () => {
    await db().sessions.bulkAdd([
      {
        id: "s-open",
        mode: "practica",
        block: "B5",
        startedAt: "2026-11-06T10:00:00Z",
        endedAt: null,
        synced: 0,
      },
      {
        id: "s-done",
        mode: "repas",
        block: null,
        startedAt: "2026-11-06T10:00:00Z",
        endedAt: "2026-11-06T10:05:00Z",
        synced: 0,
      },
    ]);
    responses.push(() => ({ accepted: ["s-open", "s-done"] }));
    await pushPending();
    expect(calls[0]!.url).toBe("/api/sessions/batch");
    expect((await db().sessions.get("s-open"))!.synced).toBe(0);
    expect((await db().sessions.get("s-done"))!.synced).toBe(1);
  });

  it("pull: baixa per pàgines, desa el cursor i és idempotent", async () => {
    responses.push(() => ({
      attempts: [{ ...attempt("r1"), receivedAt: "t1" }],
      cursor: "t1|r1",
      more: true,
    }));
    responses.push(() => ({
      attempts: [{ ...attempt("r2"), receivedAt: "t2" }],
      cursor: "t2|r2",
      more: false,
    }));
    expect(await pullNew()).toBe(2);
    expect(calls.map((c) => c.url)).toEqual(["/api/attempts?", "/api/attempts?since=t1%7Cr1"]);
    const r1 = await db().attempts.get("r1");
    expect(r1!.synced).toBe(1);
    expect(r1).not.toHaveProperty("receivedAt");
    expect((await db().meta.get("cursor"))!.value).toBe("t2|r2");
    // segona passada: res de nou, el cursor es manté i no es duplica res
    responses.push(() => ({ attempts: [], cursor: "t2|r2", more: false }));
    expect(await pullNew()).toBe(0);
    expect(calls[2]!.url).toBe("/api/attempts?since=t2%7Cr2");
    expect(await db().attempts.count()).toBe(2);
  });

  it("fetchAttemptsOf: vista del tutor, sense tocar la BD local", async () => {
    responses.push(() => ({
      attempts: [{ ...attempt("z"), receivedAt: "t" }],
      cursor: "t|z",
      more: false,
    }));
    const got = await fetchAttemptsOf(42);
    expect(got.map((a) => a.id)).toEqual(["z"]);
    expect(calls[0]!.url).toBe("/api/attempts?user_id=42&limit=5000");
    expect(await db().attempts.count()).toBe(0);
  });
});
