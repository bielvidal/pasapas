import { afterEach, describe, expect, it, vi } from "vitest";
import { api, ApiError } from "./api";
import { ago, UI } from "./texts";

afterEach(() => vi.unstubAllGlobals());

describe("api", () => {
  it("sense xarxa: ApiError offline amb text en català", async () => {
    vi.stubGlobal("fetch", async () => {
      throw new TypeError("Failed to fetch");
    });
    const e = (await api("/api/me").catch((x: unknown) => x)) as ApiError;
    expect(e).toBeInstanceOf(ApiError);
    expect(e.offline).toBe(true);
    expect(e.message).toBe(UI.errors.xarxa);
  });
  it("401 no_session: missatge de sessió caducada", async () => {
    vi.stubGlobal(
      "fetch",
      async () =>
        new Response(JSON.stringify({ error: "no_session", message: "x" }), { status: 401 }),
    );
    const e = (await api("/api/me").catch((x: unknown) => x)) as ApiError;
    expect(e.status).toBe(401);
    expect(e.code).toBe("no_session");
    expect(e.message).toBe(UI.errors.sessio);
  });
  it("altres errors: el missatge de l'API", async () => {
    vi.stubGlobal(
      "fetch",
      async () =>
        new Response(
          JSON.stringify({ error: "code_invalid", message: "El codi no és correcte." }),
          {
            status: 400,
          },
        ),
    );
    await expect(api("/api/auth/login")).rejects.toThrow("El codi no és correcte.");
  });
});

describe("ago", () => {
  const now = new Date("2026-11-06T12:00:00Z");
  it("formata distàncies curtes i llargues", () => {
    expect(ago(null, now)).toBe("mai");
    expect(ago("2026-11-06T11:59:40Z", now)).toBe("ara mateix");
    expect(ago("2026-11-06T11:30:00Z", now)).toBe("fa 30 min");
    expect(ago("2026-11-06T09:00:00Z", now)).toBe("fa 3 h");
    expect(ago("2026-11-04T12:00:00Z", now)).toBe("fa 2 dies");
  });
});
