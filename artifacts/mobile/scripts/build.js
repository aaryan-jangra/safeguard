const { spawnSync } = require("node:child_process");
const path = require("node:path");

const cwd = path.resolve(__dirname, "..");
const tscBin = require.resolve("typescript/bin/tsc");

const result = spawnSync(process.execPath, [tscBin, "-p", "tsconfig.json", "--noEmit"], {
  cwd,
  stdio: "inherit",
  shell: false,
});

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

console.log("Mobile build validation completed successfully.");
