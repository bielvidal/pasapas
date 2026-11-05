import type { Config } from "tailwindcss";

// Un color d'accent tranquil (verd-blau), fons càlids, res de vermell agressiu (§8).
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  darkMode: "media",
  theme: {
    extend: {
      colors: {
        accent: { DEFAULT: "#0f766e", soft: "#ccfbf1", dark: "#5eead4" },
        ok: { DEFAULT: "#15803d", soft: "#dcfce7", dark: "#86efac" },
        warm: { DEFAULT: "#b45309", soft: "#fef3c7", dark: "#fcd34d" },
        paper: { DEFAULT: "#fbfaf7", card: "#ffffff", dark: "#15171b", darkcard: "#1f2228" },
      },
      fontFamily: { sans: ["Inter Variable", "system-ui", "sans-serif"] },
      minHeight: { tap: "3rem" },
    },
  },
  plugins: [],
};
export default config;
