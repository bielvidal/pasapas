import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";
import { cssVar, cssVars, DARK, FONTS, LIGHT, type Token } from "./lib/tokens";

const colors = Object.fromEntries(
  (Object.keys(LIGHT) as Token[]).map((k) => [k, `var(${cssVar(k)})`]),
) as Record<Token, string>;

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors,
      fontFamily: FONTS as unknown as Record<string, string[]>,
      minHeight: { tap: "3rem" },
      keyframes: {
        fadeUp: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "none" },
        },
      },
      animation: { fadeUp: "fadeUp .35s ease both" },
    },
  },
  plugins: [
    plugin(({ addBase }) => {
      addBase({
        ":root": { ...cssVars(LIGHT), colorScheme: "light" },
        ".dark": { ...cssVars(DARK), colorScheme: "dark" },
      });
    }),
  ],
};
export default config;
