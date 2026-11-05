"use client";
import { useCallback, useEffect, useSyncExternalStore } from "react";
import { applyTheme, DEFAULT_THEME, readTheme, storeTheme, THEMES, type Theme } from "@/lib/theme";
import { UI } from "@/lib/texts";

// Petit «store» extern: la preferència viu a localStorage; els components s'hi subscriuen.
const listeners = new Set<() => void>();
function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}
function useTheme(): [Theme, (t: Theme) => void] {
  // Al servidor (i durant la hidratació) es retorna el tema per defecte.
  const theme = useSyncExternalStore(subscribe, readTheme, () => DEFAULT_THEME);
  useEffect(() => {
    applyTheme(theme);
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme("system");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [theme]);
  const set = useCallback((t: Theme) => {
    storeTheme(t);
    listeners.forEach((cb) => cb());
  }, []);
  return [theme, set];
}

/** Selector segmentat Clar / Fosc / Com el mòbil. */
export function ThemeSelector() {
  const [theme, setTheme] = useTheme();
  return (
    <fieldset className="flex flex-col items-center gap-2">
      <legend className="sr-only">{UI.aparenca.titol}</legend>
      <span className="text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">
        {UI.aparenca.titol}
      </span>
      <div
        role="radiogroup"
        aria-label={UI.aparenca.titol}
        className="inline-flex rounded-full border border-stone-300 bg-paper-card p-1 dark:border-stone-600 dark:bg-paper-darkcard"
      >
        {THEMES.map((t) => {
          const active = theme === t;
          return (
            <button
              key={t}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setTheme(t)}
              className={
                "min-h-tap rounded-full px-4 text-sm font-medium transition-colors " +
                (active
                  ? "bg-accent text-white dark:bg-accent-dark dark:text-stone-900"
                  : "text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-700")
              }
            >
              {UI.aparenca[t]}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
