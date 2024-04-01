import { defineConfig } from "vitest/config";

// https://vitejs.dev/config/
export default defineConfig({
  test: {
    include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    globalSetup: "src/tests/globalSetup.ts",
    sequence: { hooks: "stack" },
  },
});
