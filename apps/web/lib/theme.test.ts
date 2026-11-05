import { describe, expect, it } from "vitest";
import { DEFAULT_THEME, isTheme, resolveDark, THEME_INIT_SCRIPT } from "./theme";

describe("theme", () => {
  it("clar és el tema per defecte", () => {
    expect(DEFAULT_THEME).toBe("light");
  });
  it("resolveDark només és fosc si es demana o si el sistema ho és en mode sistema", () => {
    expect(resolveDark("light", true)).toBe(false);
    expect(resolveDark("dark", false)).toBe(true);
    expect(resolveDark("system", true)).toBe(true);
    expect(resolveDark("system", false)).toBe(false);
  });
  it("isTheme rebutja valors desconeguts", () => {
    expect(isTheme("light")).toBe(true);
    expect(isTheme("blue")).toBe(false);
    expect(isTheme(null)).toBe(false);
  });
  it("l'script inicial és JS vàlid i respecta el valor per defecte", () => {
    expect(() => new Function(THEME_INIT_SCRIPT)).not.toThrow();
    expect(THEME_INIT_SCRIPT).toContain('"light"');
  });
});
