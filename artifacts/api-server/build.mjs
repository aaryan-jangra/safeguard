import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const esbuildPluginPino = require("esbuild-plugin-pino");
const outDir = resolve(__dirname, "dist");

mkdirSync(outDir, { recursive: true });

await build({
  entryPoints: [resolve(__dirname, "src/index.ts")],
  outdir: outDir,
  entryNames: "[name]",
  bundle: true,
  platform: "node",
  target: ["node18"],
  format: "esm",
  outExtension: { ".js": ".mjs" },
  sourcemap: true,
  packages: "external",
  plugins: [esbuildPluginPino()],
});
