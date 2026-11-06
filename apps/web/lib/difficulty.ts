"use client";
/**
 * Dificultat triada per bloc («auto» o un nivell fix). Es desa al dispositiu (localStorage): és una
 * preferència de pràctica, no una dada. Mateix patró de «store» extern que el tema.
 */
import type { Level } from "@pasapas/engine";
import { useCallback, useSyncExternalStore } from "react";

export type Difficulty = Level | "auto";
const KEY = (block: string) => `pasapas-dificultat-${block}`;
const listeners = new Set<() => void>();

export function parseDifficulty(v: string | null | undefined): Difficulty | null {
  if (v === "auto") return "auto";
  const n = Number(v);
  return n === 1 || n === 2 || n === 3 ? (n as Level) : null;
}

export function readDifficulty(block: string): Difficulty {
  try {
    return parseDifficulty(localStorage.getItem(KEY(block))) ?? "auto";
  } catch {
    return "auto";
  }
}

export function useDifficulty(block: string): [Difficulty, (d: Difficulty) => void] {
  const d = useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => {
        listeners.delete(cb);
      };
    },
    () => readDifficulty(block),
    () => "auto" as Difficulty,
  );
  const set = useCallback(
    (v: Difficulty) => {
      try {
        localStorage.setItem(KEY(block), String(v));
      } catch {
        // sense localStorage: no es recorda
      }
      listeners.forEach((cb) => cb());
    },
    [block],
  );
  return [d, set];
}
