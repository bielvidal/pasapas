/**
 * Tokens de disseny: la mateixa pell que el portal de PPER (fons gris verdós, targetes blanques,
 * accent teal, IBM Plex) amb una variant fosca. Es publiquen com a variables CSS (`--c-*`) des del
 * plugin de Tailwind, així `.dark` només canvia les variables i els components no necessiten `dark:`.
 */
export const LIGHT = {
  paper: "#F6F8F8",
  paper2: "#EEF2F3",
  card: "#FFFFFF",
  ink: "#1B2426",
  soft: "#5B6B6E",
  faint: "#8A9A9D",
  line: "#D6DFE1",
  line2: "#B9C7CA",
  teal: "#1F5F6B",
  tealSoft: "#E3EEF0",
  amber: "#9A6B00",
  amberSoft: "#FFF4D6",
  ok: "#2E7D4F",
  okSoft: "#DDF1E4",
  danger: "#B3261E",
  dangerSoft: "#F9DEDC",
  heat0: "#EEF2F3",
  heat1: "#BFE3CB",
  heat2: "#D3E8EC",
  heat3: "#FCEBB8",
  heat4: "#F5CF94",
} as const;

export const DARK: Record<keyof typeof LIGHT, string> = {
  paper: "#15191B",
  paper2: "#1C2225",
  card: "#1F2629",
  ink: "#E6ECEC",
  soft: "#A3B2B5",
  faint: "#7D8C8F",
  line: "#2E383B",
  line2: "#445256",
  teal: "#7FC4CF",
  tealSoft: "#173A41",
  amber: "#E7B94B",
  amberSoft: "#3D2F0A",
  ok: "#7FD4A0",
  okSoft: "#163A27",
  danger: "#F2A49C",
  dangerSoft: "#4A1C19",
  heat0: "#1C2225",
  heat1: "#1E5136",
  heat2: "#1B4249",
  heat3: "#4E3D10",
  heat4: "#663C12",
};

export type Token = keyof typeof LIGHT;

/** Nom de la variable CSS d'un token. */
export const cssVar = (k: Token) => `--c-${k}`;

export function cssVars(palette: Record<Token, string>): Record<string, string> {
  return Object.fromEntries((Object.keys(palette) as Token[]).map((k) => [cssVar(k), palette[k]]));
}

export const FONTS = {
  display: ['"IBM Plex Serif"', "Georgia", "serif"],
  sans: ['"IBM Plex Sans"', "system-ui", "sans-serif"],
} as const;
