"use client";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { api, ApiError, type Me } from "@/lib/api";
import { migrateLegacy, setCurrentUser } from "@/lib/db";
import {
  cachedMeSnapshot,
  cacheMe,
  noSubscribe,
  readCachedMe,
  SessionContext,
} from "@/lib/session";
import { scheduleSync, syncAll } from "@/lib/sync";
import { UI } from "@/lib/texts";
import { Frame, Notice } from "./Frame";

const PUBLIC = ["/entrar"];

/**
 * Porta d'entrada: resol qui és l'usuari (cache local → /api/me), fixa la BD local del seu compte,
 * migra el que hi hagués de la fase 1 i arrenca la sincronització. Les rutes públiques (/entrar)
 * passen sense sessió.
 */
export function AuthGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isPublic = PUBLIC.some((p) => pathname === p || pathname.startsWith(p + "/"));
  // Còpia local (arrenca de seguida, també offline); `me` és el resultat de /api/me quan arriba.
  const cached = useSyncExternalStore(noSubscribe, cachedMeSnapshot, () => null);
  const [me, setMeState] = useState<Me | null | undefined>(undefined);
  const [offline, setOffline] = useState(false);
  const effective: Me | null | undefined = me !== undefined ? me : (cached ?? undefined);

  const setMe = useCallback((m: Me) => {
    cacheMe(m);
    setMeState(m);
  }, []);

  /** Pregunta /api/me. Resultat pur: l'estat s'aplica a `apply` (fora de l'efecte). */
  const resolve = useCallback(async (): Promise<{ me?: Me | null; offline: boolean }> => {
    const had = readCachedMe() !== null;
    try {
      const fresh = await api<Me>("/api/me");
      cacheMe(fresh);
      return { me: fresh, offline: false };
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        cacheMe(null);
        return { me: null, offline: false };
      }
      // sense xarxa: amb còpia local continuem (me queda undefined → effective = cached);
      // sense còpia, no podem saber qui és
      return had ? { offline: false } : { me: null, offline: true };
    }
  }, []);
  const apply = useCallback((r: { me?: Me | null; offline: boolean }) => {
    if (r.me !== undefined) setMeState(r.me);
    setOffline(r.offline);
  }, []);
  const check = useCallback(() => resolve().then(apply), [resolve, apply]);

  useEffect(() => {
    void check();
  }, [check]);

  // Usuari conegut: BD local del seu compte, migració de la fase 1 i sync.
  const userId = effective?.id ?? null;
  useEffect(() => {
    if (userId === null) return;
    setCurrentUser(userId);
    void migrateLegacy(userId).then(() => syncAll());
    const onOnline = () => scheduleSync(500);
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, [userId]);

  useEffect(() => {
    if (effective === null && !offline && !isPublic) router.replace("/entrar");
  }, [effective, offline, isPublic, router]);

  if (isPublic) return <>{children}</>;
  if (effective === undefined || (effective === null && !offline)) {
    return (
      <Frame nav={false}>
        <p className="text-soft">{UI.carregant}</p>
      </Frame>
    );
  }
  if (effective === null) {
    return (
      <Frame nav={false}>
        <div className="card max-w-md space-y-3">
          <Notice kind="error">{UI.errors.offlineSenseSessio}</Notice>
          <button className="btn-soft" onClick={() => void check()}>
            {UI.errors.reintentar}
          </button>
        </div>
      </Frame>
    );
  }
  return (
    <SessionContext.Provider value={{ me: effective, setMe }}>
      <Frame me={effective}>{children}</Frame>
    </SessionContext.Provider>
  );
}
