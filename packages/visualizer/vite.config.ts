import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import dts from "vite-plugin-dts";
const demo = process.env.VISUALIZER_DEMO === "1";
export default defineConfig({
  plugins: [
    react(),
    !demo &&
      dts({
        tsconfigPath: "./tsconfig.json",
        include: ["src"],
        exclude: ["src/demo.tsx", "src/sample.ts"],
        outDirs: ["dist"],
      }),
  ],
  build: demo
    ? { outDir: "dist-demo" }
    : {
        lib: {
          entry: "src/index.ts",
          formats: ["es"],
          fileName: "index",
          cssFileName: "style",
        },
        rollupOptions: {
          external: [
            "react",
            "react-dom",
            "react/jsx-runtime",
            "@xyflow/react",
            "lucide-react",
          ],
        },
      },
});
