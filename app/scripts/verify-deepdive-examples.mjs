// Extracts every deep-dive `example` for a subject, writes each to a temp .tsx,
// and type-checks them with the app's React types. Usage:
//   node scripts/verify-deepdive-examples.mjs react
import { readFile, mkdir, writeFile, rm } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const run = promisify(execFile);
const here = dirname(fileURLToPath(import.meta.url));
const appDir = join(here, '..');
const subject = process.argv[2] ?? 'react';
const OUT = join(appDir, '.dd-verify');

const FENCE = /^```\w*\n([\s\S]*?)```$/;

const dd = JSON.parse(await readFile(join(appDir, 'data', 'deepdives', `${subject}.json`), 'utf8'));
await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });

const files = [];
for (const [id, entry] of Object.entries(dd)) {
  if (!entry.example) continue;
  const m = entry.example.match(FENCE);
  const code = m ? m[1] : entry.example;
  const safe = id.replace(/[^a-zA-Z0-9_-]/g, '_');
  const file = join(OUT, `${safe}.tsx`);
  await writeFile(file, code);
  files.push({ id, file: `${safe}.tsx` });
}

// The temp dir lives inside app/, so `react` resolves via the parent node_modules.
await writeFile(join(OUT, 'tsconfig.json'), JSON.stringify({
  compilerOptions: {
    target: 'ES2022', lib: ['ES2022', 'DOM', 'DOM.Iterable'], module: 'ESNext',
    moduleResolution: 'bundler', jsx: 'react-jsx', strict: true, noEmit: true,
    skipLibCheck: true, esModuleInterop: true,
    // Treat every snippet as its own module so import-free script examples
    // (e.g. plain-TS reducer demos) don't collide on shared top-level names.
    moduleDetection: 'force',
  },
  include: ['*.tsx'],
}, null, 2));

let errors = '';
try {
  await run('npx', ['tsc', '-p', join(OUT, 'tsconfig.json')], { cwd: appDir });
} catch (e) {
  errors = (e.stdout || '') + (e.stderr || '');
}

console.log(`Checked ${files.length} examples for "${subject}".`);
if (!errors.trim()) {
  console.log('✓ All examples type-check clean.');
} else {
  const failed = new Set();
  for (const line of errors.split('\n')) {
    const m = line.match(/([a-zA-Z0-9_-]+)\.tsx\(/);
    if (m) failed.add(m[1]);
  }
  console.log(`✗ ${failed.size} example(s) failed:\n`);
  console.log(errors.trim());
}
await rm(OUT, { recursive: true, force: true });
