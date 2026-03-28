const { spawnSync } = require('node:child_process');

const OFFLINE_ENGINE_PATTERNS = [
  'Failed to fetch the engine file',
  'Failed to fetch sha256 checksum',
  "Cannot find module '.prisma/client/default'",
];

function run(command, args, extraEnv = {}) {
  const result = spawnSync(command, args, {
    stdio: 'pipe',
    encoding: 'utf8',
    env: {
      ...process.env,
      PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING: '1',
      ...extraEnv,
    },
  });

  if (result.stdout) {
    process.stdout.write(result.stdout);
  }

  if (result.stderr) {
    process.stderr.write(result.stderr);
  }

  return result;
}

function hasOfflineEngineError(result) {
  const output = `${result.stdout || ''}\n${result.stderr || ''}`;
  return OFFLINE_ENGINE_PATTERNS.some((pattern) => output.includes(pattern));
}

const generate = run('npx', ['prisma', 'generate'], {
  PRISMA_CLIENT_ENGINE_TYPE: 'binary',
});
if (generate.status !== 0 && hasOfflineEngineError(generate)) {
  console.warn('[db:seed] Prisma engine download failed in this environment. Skipping seed without failing.');
  process.exit(0);
}
if (generate.status !== 0) {
  process.exit(generate.status ?? 1);
}

const seed = run('node', ['prisma/seed.cjs']);
if (seed.status !== 0 && hasOfflineEngineError(seed)) {
  console.warn('[db:seed] Prisma client/engine is unavailable in this environment. Skipping seed without failing.');
  process.exit(0);
}

process.exit(seed.status ?? 0);
