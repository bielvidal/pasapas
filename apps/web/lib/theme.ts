/**
 * Tema visual: «clar» per defecte (petició de Biel, 2026-11-05), «fosc» o «sistema».
 * La preferència es guarda a localStorage i s'aplica com a classe `dark` a <html>
 * (Tailwind `darkMode: "class"`). Lògica pura aquí; el hook viu a components/ThemeSelector.
 */
export type Theme = "light" | "dark" | "system";

export const THEMES: readonly Theme[] = ["light", "dark", "system"];
export const THEME_KEY = "pasapas-theme";
export const DEFAULT_THEME: Theme = "light";

export const THEME_COLORS = { light: "#fbfaf7", dark: "#15171b" } as const;

export function isTheme(v: unknown): v is Theme {
  return typeof v === "string" && (THEMES as readonly string[]).includes(v);
}

/** Resol la preferència a fosc (true) o clar (false). */
export function resolveDark(theme: Theme, systemDark: boolean): boolean {
  return theme === "dark" || (theme === "system" && systemDark);
}

export function readTheme(): Theme {
  try {
    const v = window.localStorage.getItem(THEME_KEY);
    return isTheme(v) ? v : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

export function storeTheme(theme: Theme): void {
  try {
    window.localStorage.setItem(THEME_KEY, theme);
  } catch {
    // Sense localStorage (mode privat): el tema només dura la sessió.
  }
}

export function applyTheme(theme: Theme): void {
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const dark = resolveDark(theme, systemDark);
  document.documentElement.classList.toggle("dark", dark);
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", dark ? THEME_COLORS.dark : THEME_COLORS.light);
}

/**
 * Script inline per a <head>: aplica el tema abans del primer render, per evitar
 * el parpelleig clar→fosc. Ha de ser autònom (no pot importar res).
 */
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem(${JSON.stringify(THEME_KEY)});if(t!=="dark"&&t!=="system")t=${JSON.stringify(DEFAULT_THEME)};var d=t==="dark"||(t==="system"&&matchMedia("(prefers-color-scheme: dark)").matches);if(d)document.documentElement.classList.add("dark");}catch(e){}})();`;
