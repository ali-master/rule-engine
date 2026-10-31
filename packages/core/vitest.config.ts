import { defineConfig } from "vitest/config";
import * as path from "node:path";

export default defineConfig({
  test: {
    alias: {
      "@root": path.resolve(import.meta.dirname, "./src"),
    },
    name: "RuleEngine",
    benchmark: {
      include: ["./benchmarks/**/*.bench.ts"],
    },
    coverage: {
      provider: "v8",
      include: ["src/**/*.ts"],
      exclude: [
        "**/*.spec.ts",
        "**/*.test.ts",
        "**/*.bench.ts",
        "**/*.d.ts",
        "**/*.config.ts",
        "**/index.ts",
      ],
      reporter: ["clover", "json", "html", "html-spa", "lcov"],
      reportsDirectory: path.resolve(import.meta.dirname, "./coverage"),
    },
    globals: true,
    isolate: true,
    pool: "forks",
  },
});
