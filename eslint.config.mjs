// ESLint 9 (flat config). Reglas de Next para apps/web; TypeScript para todo.
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier";

export default tseslint.config(
  {
    ignores: [
      "**/node_modules/**",
      "**/.next/**",
      "**/out/**",
      "apps/web/public/sw.js",
      "apps/web/public/workbox-*.js",
      "apps/web/next-env.d.ts",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...nextVitals,
  ...nextTs,
  {
    settings: { next: { rootDir: "apps/web" } },
    rules: {
      // El motor no debe usar Math.random: todo pasa por el RNG con semilla (§5.4).
      "no-restricted-properties": [
        "error",
        { object: "Math", property: "random", message: "Usa el Rng con semilla del motor." },
      ],
      "@typescript-eslint/consistent-type-imports": "error",
    },
  },
  {
    // Las plantillas y textos tienen nombres de parámetros de una letra a propósito.
    files: ["packages/**/*.ts"],
    rules: { "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }] },
  },
  prettier,
);
