"use client";
/**
 * Sessió d'usuari al client. `/api/me` mana; es guarda una còpia a localStorage perquè l'app
 * arrenqui sense xarxa (la PWA ha de funcionar offline un cop s'ha entrat). Un 401 esborra la
 * còpia i envia a /entrar.
 */
import { createContext, useContext } from "react";
import type { Me } from "./api";

export const ME_KEY = "pasapas-me";

export function readCachedMe(): Me | null {
  try {
    const raw = localStorage.getItem(ME_KEY);
    if (!raw) return null;
    const m = JSON.parse(raw) as Partial<Me>;
    return typeof m.id === "number" &&
      typeof m.email === "string" &&
      (m.role === "tutor" || m.role === "student")
      ? { id: m.id, email: m.email, alias: m.alias ?? "", role: m.role }
      : null;
  } catch {
    return null;
  }
}

let snapRaw: string | null | undefined;
let snapMe: Me | null = null;
/** Com `readCachedMe`, però retorna la mateixa referència mentre no canviï (useSyncExternalStore). */
export function cachedMeSnapshot(): Me | null {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(ME_KEY);
  } catch {
    raw = null;
  }
  if (raw !== snapRaw) {
    snapRaw = raw;
    snapMe = readCachedMe();
  }
  return snapMe;
}
export const noSubscribe = () => () => {};

export function cacheMe(me: Me | null): void {
  try {
    if (me) localStorage.setItem(ME_KEY, JSON.stringify(me));
    else localStorage.removeItem(ME_KEY);
  } catch {
    // sense localStorage: només dura la sessió
  }
}

export interface SessionCtx {
  me: Me;
  /** Torna a demanar /api/me (p. ex. després de canviar l'àlies). */
  setMe: (me: Me) => void;
}

export const SessionContext = createContext<SessionCtx | null>(null);

export function useMe(): SessionCtx {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useMe() fora de l'AuthGate");
  return ctx;
}
