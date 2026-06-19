// Syntax-checks every deep-dive `example` for the GraphQL subject. Routes by fence
// language: ```graphql blocks are parsed with the `graphql` package's parse() (which
// validates type-system SDL *and* executable-document syntax without needing a schema),
// ```js / ```ts blocks fall back to `node --check`. No type-checking, no execution.
// Usage:  node scripts/verify-graphql-examples.mjs graphql
import { readFile, mkdir, writeFile, rm } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { parse } from 'graphql';

const run = promisify(execFile);
const here = dirname(fileURLToPath(import.meta.url));
const appDir = join(here, '..');
const subject = process.argv[2] ?? 'graphql';
const OUT = join(appDir, '.graphql-verify');

// Capture the fence language so we can route graphql → parse(), js/ts → node --check.
const FENCE = /^```(\w*)\n([\s\S]*?)```$/;

const dd = JSON.parse(await readFile(join(appDir, 'data', 'deepdives', `${subject}.json`), 'utf8'));
await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });

let total = 0;
const failures = [];
for (const [id, entry] of Object.entries(dd)) {
  if (!entry.example) continue;
  total++;
  const m = entry.example.match(FENCE);
  const lang = m ? m[1] : '';
  const code = m ? m[2] : entry.example;
  try {
    if (lang === 'graphql' || lang === 'gql' || lang === '') {
      parse(code); // throws GraphQLError on a syntax problem
    } else {
      // js/ts snippet (resolver / DataLoader / server) — syntax-only check.
      const ext = /^\s*(import |export )/m.test(code) || /^\s*await /m.test(code) ? 'mjs' : 'cjs';
      const file = join(OUT, `${id.replace(/[^a-zA-Z0-9_-]/g, '_')}.${ext}`);
      await writeFile(file, code);
      await run('node', ['--check', file]);
    }
  } catch (e) {
    failures.push(`${id}: ${(e.message || String(e)).split('\n').find(Boolean)}`);
  }
}

console.log(`Checked ${total} examples for "${subject}".`);
if (failures.length === 0) {
  console.log('✓ All examples parse clean.');
} else {
  console.log(`✗ ${failures.length} example(s) failed:\n`);
  console.log(failures.join('\n'));
}
await rm(OUT, { recursive: true, force: true });
if (failures.length > 0) process.exitCode = 1;
