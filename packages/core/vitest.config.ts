import { defineConfig } from "vitest/config";
import * as path from "node:path";

export default defineConfig({
  test: {
    alias: {
      "@root": path.resolve(__dirname, "./src"),
    },
    server: {
      sourcemap: "inline",
    },
    fileParallelism: true,
    name: "RuleEngine",
    benchmark: {
      include: ["./benchmarks/**/*.bench.ts"],
    },
    typecheck: {
      enabled: true,
      checker: "vue-tsc",
      ignoreSourceErrors: true,
      tsconfig: path.resolve(process.cwd(), "./tsconfig.json"),
    },
    coverage: {
      all: false,
      clean: true,
      provider: "v8",
      cleanOnRerun: true,
      reportOnFailure: true,
      include: ["**/src/**"],
      ignoreEmptyLines: true,
      exclude: [
        "**/src/**/*.spec.ts",
        "**/src/**/*.test.ts",
        "**/src/**/*.bench.ts",
        "**/src/**/*.d.ts",
        "**/src/**/*.config.ts",
        "**/src/**/index.ts",
      ],
      processingConcurrency: 4,
      experimentalAstAwareRemapping: true,
      reporter: ["clover", "json", "html", "html-spa"],
      reportsDirectory: path.resolve(__dirname, "./coverage"),
    },
    // dir: path.resolve(__dirname, "./test"),
    cache: {
      dir: path.resolve(__dirname, "node_modules/.cache/vitest"),
    },
    globals: true,
    isolate: true,
    update: true,
    printConsoleTrace: true,
    pool: "vmForks",
    poolOptions: {
      vmForks: {
        singleFork: true,
        memoryLimit: "2GB",
        minForks: 1,
        maxForks: 4,
        isolate: true,
      },
    },
  },
});
