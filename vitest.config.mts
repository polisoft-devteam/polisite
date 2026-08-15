import { defineConfig } from "vitest/config"

export default defineConfig({
  resolve: {
    // Lets tests use the same "@/..." imports as the app, read from tsconfig.json.
    tsconfigPaths: true,
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
})
