import { build } from "vite";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
const output = "node_modules/.cache/pcwise-render-checks";
await build({
  logLevel: "error",
  build: {
    ssr: "tests/render-checks.jsx",
    outDir: output,
    emptyOutDir: true,
    rollupOptions: {
      output: {
        entryFileNames: "checks.mjs",
      },
    },
  },
});
await import(pathToFileURL(resolve(output, "checks.mjs")).href);
