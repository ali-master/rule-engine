import { defineConfig } from "tsup";
import { resolve } from "node:path";

export default defineConfig((options) => ({
  entry: ["src/index.ts"],
  splitting: true,
  format: ["esm", "cjs"],
  treeshake: true,
  watch: options.watch,
  external: [],
  target: "esnext",
  sourcemap: true,
  clean: true,
  dts: true,
  legacyOutput: true,
  minify: !options.watch,
  banner: {
    js: `
// -------------------------------------------------------------
// UseStrict - Rule Engine
// A Powerful Rule Engine for Node.js & Browser environments
//
// License: Proprietary - © UseStrict, All Rights Reserved
//
// Description:
//   This library is part of the Ali Torki ecosystem, designed to
//   handle complex business logic or dynamic decision-making
//   scenarios. It can be seamlessly integrated into both Node.js
//   backends and browser applications.
//
// Author: Ali Torki <ali_4286@live.com>
// Docs:   https://rule-engine.usestrict.dev
// -------------------------------------------------------------
    `,
  },
  tsconfig: resolve(
    __dirname,
    options.watch ? "tsconfig.json" : "tsconfig.build.json",
  ),
}));
