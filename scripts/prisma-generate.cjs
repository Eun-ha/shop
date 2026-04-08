const { spawnSync } = require("node:child_process");

const OFFLINE_ENGINE_PATTERNS = [
  "Failed to fetch the engine file",
  "Failed to fetch sha256 checksum",
];

function runGenerate() {
  return spawnSync("pnpm", ["exec", "prisma", "generate"], {
    stdio: "pipe",
    encoding: "utf8",
    env: {
      ...process.env,
      PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING: "1",
    },
  });
}

function hasOfflineEngineError(result) {
  const output = `${result.stdout || ""}\n${result.stderr || ""}`;
  return OFFLINE_ENGINE_PATTERNS.some((pattern) => output.includes(pattern));
}

const result = runGenerate();

if (result.stdout) process.stdout.write(result.stdout);
if (result.stderr) process.stderr.write(result.stderr);

if (result.status !== 0 && hasOfflineEngineError(result)) {
  console.warn(
    "[postinstall] Prisma engine download failed in this environment. Skipping prisma generate without failing."
  );
  process.exit(0);
}

process.exit(result.status ?? 1);
