"use client";
import type { Attempt } from "@pasapas/engine";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "./db";

/** Tots els intents locals, en viu (undefined mentre carrega). */
export function useAttempts(): Attempt[] | undefined {
  return useLiveQuery(() => db().attempts.toArray(), []);
}
