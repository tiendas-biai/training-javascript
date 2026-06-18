// Syntax-checks every deep-dive `example` for a JS-snippet subject (node/javascript)
// with `node --check`. Unlike the React tsx verifier, this only validates that each
// snippet parses (no type-checking, no module resolution) — the right gate for
// runnable JS examples that may import uninstalled packages (e.g. express). Usage:
//   node scripts/verify-node-examples.mjs node
import { readFile, mkdir, writeFile, rm } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const run = promisify(execFile);
const here = dirname(fileURLToPath(import.meta.url));
const appDir = join(here, '..');
const subject = process.argv[2] ?? 'node';
const OUT = join(appDir, '.node-verify');

const FENCE = /^```\w*\n([\s\S]*?)```$/;
// ESM if it uses top-level import/export or top-level await; else treat as CommonJS.
const isEsm = (code) => /^\s*(import |export )/m.test(code) || /^\s*await /m.test(code);

const dd = JSON.parse(await readFile(join(appDir, 'data', 'deepdives', `${subject}.json`), 'utf8'));
await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });

let total = 0;
const failures = [];
for (const [id, entry] of Object.entries(dd)) {
  if (!entry.example) continue;
  total++;
  const m = entry.example.match(FENCE);
  const code = m ? m[1] : entry.example;
  const ext = isEsm(code) ? 'mjs' : 'cjs';
  const file = join(OUT, `${id.replace(/[^a-zA-Z0-9_-]/g, '_')}.${ext}`);
  await writeFile(file, code);
  try {
    await run('node', ['--check', file]);
  } catch (e) {
    failures.push(`${id}: ${(e.stderr || e.message).split('\n').find(Boolean)}`);
  }
}

console.log(`Syntax-checked ${total} examples for "${subject}".`);
if (failures.length === 0) {
  console.log('✓ All examples parse clean.');
} else {
  console.log(`✗ ${failures.length} example(s) failed:\n`);
  console.log(failures.join('\n'));
}
await rm(OUT, { recursive: true, force: true });
