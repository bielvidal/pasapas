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
    <fieldset className="flex flex-col gap-2">
      <legend className="sr-only">{UI.aparenca.titol}</legend>
      <span className="label">{UI.aparenca.titol}</span>
      <div
        role="radiogroup"
        aria-label={UI.aparenca.titol}
        className="inline-flex self-start rounded-full border border-line bg-paper2 p-1"
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
                (active ? "bg-teal text-card" : "text-soft hover:text-ink")
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
