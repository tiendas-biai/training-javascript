// Syntax-checks every deep-dive `example` for the Python subject by parsing each
// snippet with CPython's own parser (`python3 -m py_compile`). Like the Node verifier,
// this only validates that each snippet *parses* — it does not run it or resolve
// imports — the right gate for runnable examples that may import stdlib/3rd-party
// modules or reference names defined elsewhere. SKIPs cleanly (exit 0) if no python3.
// Usage: node scripts/verify-python-examples.mjs python
import { readFile, mkdir, writeFile, rm } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const run = promisify(execFile);
const here = dirname(fileURLToPath(import.meta.url));
const appDir = join(here, '..');
const subject = process.argv[2] ?? 'python';
const OUT = join(appDir, '.python-verify');

// Match a fenced block; capture only ```python (or bare) bodies, skip other langs
// (e.g. a shell snippet) so we don't try to py_compile non-Python.
const FENCE = /^```(\w*)\n([\s\S]*?)```$/;
const PY_LANGS = new Set(['', 'python', 'py']);

// Find a runnable python3 (prefer python3, fall back to python).
async function findPython() {
  for (const candidate of ['python3', 'python']) {
    try {
      await run(candidate, ['--version']);
      return candidate;
    } catch {
      // try next
    }
  }
  return null;
}

const python = await findPython();
if (!python) {
  console.log('python3 not found on PATH — skipping Python example verification.');
  process.exit(0);
}

const dd = JSON.parse(await readFile(join(appDir, 'data', 'deepdives', `${subject}.json`), 'utf8'));
await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });

let total = 0;
let skippedLang = 0;
const failures = [];
for (const [id, entry] of Object.entries(dd)) {
  if (!entry.example) continue;
  const m = entry.example.match(FENCE);
  const lang = m ? m[1].toLowerCase() : '';
  if (m && !PY_LANGS.has(lang)) {
    skippedLang++;
    continue;
  }
  total++;
  const code = m ? m[2] : entry.example;
  const file = join(OUT, `${id.replace(/[^a-zA-Z0-9_-]/g, '_')}.py`);
  await writeFile(file, code);
  try {
    await run(python, ['-m', 'py_compile', file]);
  } catch (e) {
    failures.push(`${id}: ${(e.stderr || e.message).split('\n').filter(Boolean).pop()}`);
  }
}

console.log(`Syntax-checked ${total} Python example(s) for "${subject}" with ${python}.`);
if (skippedLang) console.log(`(skipped ${skippedLang} non-Python fenced example(s))`);
if (failures.length === 0) {
  console.log('✓ All examples parse clean.');
  await rm(OUT, { recursive: true, force: true });
} else {
  console.log(`✗ ${failures.length} example(s) failed:\n`);
  console.log(failures.join('\n'));
  await rm(OUT, { recursive: true, force: true });
  process.exit(1);
}
