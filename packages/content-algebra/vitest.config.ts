import { defineConfig } from "vitest/config";
export default defineConfig({
  test: { include: ["src/**/*.test.ts", "texts/**/*.test.ts"], testTimeout: 60_000 },
});
