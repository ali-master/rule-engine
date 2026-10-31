import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import dts from "vite-plugin-dts";
import path from "node:path";
import { nodePolyfills } from "vite-plugin-node-polyfills";

const isDemoMode = process.env.BUILD_MODE === "demo";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    !isDemoMode &&
      dts({
        tsconfigPath: "./tsconfig.app.json",
        include: ["src/**/*.ts", "src/**/*.tsx"],
        exclude: ["src/demo.tsx", "src/main.tsx"],
        entryRoot: "src",
        outDirs: ["dist"],
        insertTypesEntry: true,
      }),
    nodePolyfills({
      include: ["crypto", "stream", "vm", "buffer", "path", "url"],
    }),
  ].filter(Boolean),
  build: isDemoMode
    ? {
        // Demo build configuration
        outDir: "dist-demo",
        rollupOptions: {
          input: {
            main: path.resolve(import.meta.dirname, "index.html"),
          },
        },
      }
    : {
        // Library build configuration
        outDir: "dist",
        lib: {
          entry: path.resolve(import.meta.dirname, "src/index.ts"),
          name: "RuleEngineBuilder",
          formats: ["es", "cjs"],
          fileName: "index",
        },
        rollupOptions: {
          external: [
            "react",
            "react-dom",
            "react/jsx-runtime",
            "vite-plugin-node-polyfills/shims/process",
          ],
          output: {
            globals: {
              react: "React",
              "react-dom": "ReactDOM",
              "react/jsx-runtime": "react/jsx-runtime",
            },
          },
        },
      },
});
