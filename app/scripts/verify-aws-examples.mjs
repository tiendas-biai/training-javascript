// Validates every deep-dive `example` for the AWS subject by fence language. AWS
// deep dives are scenario-based; examples (when present) are CLI workflows, IAM/policy
// JSON, or CloudFormation YAML, so each is gated by its fence:
//   ```bash / ```sh / ```shell -> `bash -n` (shell syntax check; SKIPs if no bash)
//   ```json                    -> JSON.parse (IAM policies, CLI input/output)
//   ```yaml / ```yml           -> parsed with the `yaml` package (CloudFormation/config)
// Other fence languages are skipped. Like the docker/python verifiers this is a
// parse gate, not execution. Usage: node scripts/verify-aws-examples.mjs aws
import { readFile, mkdir, writeFile, rm } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { parseAllDocuments } from 'yaml';

const run = promisify(execFile);
const here = dirname(fileURLToPath(import.meta.url));
const appDir = join(here, '..');
const subject = process.argv[2] ?? 'aws';
const OUT = join(appDir, '.aws-verify');

const FENCE = /^```(\w*)\n([\s\S]*?)```$/;

async function onPath(cmd, args) {
  try { await run(cmd, args); return true; } catch { return false; }
}

function lintYaml(code) {
  const errors = [];
  for (const doc of parseAllDocuments(code)) {
    for (const e of doc.errors) errors.push(e.message.split('\n')[0]);
  }
  return errors;
}

const hasBash = await onPath('bash', ['--version']);

const dd = JSON.parse(await readFile(join(appDir, 'data', 'deepdives', `${subject}.json`), 'utf8'));
await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });

let checked = 0;
let skippedLang = 0;
let skippedNoBash = 0;
const failures = [];

for (const [id, entry] of Object.entries(dd)) {
  if (!entry.example) continue;
  const m = entry.example.match(FENCE);
  const lang = (m ? m[1] : '').toLowerCase();
  const code = m ? m[2] : entry.example;

  if (lang === 'json') {
    checked++;
    try { JSON.parse(code); } catch (e) { failures.push(`${id} (json): ${e.message.split('\n')[0]}`); }
  } else if (lang === 'yaml' || lang === 'yml') {
    checked++;
    const errs = lintYaml(code);
    if (errs.length) failures.push(`${id} (yaml): ${errs[0]}`);
  } else if (lang === 'bash' || lang === 'sh' || lang === 'shell') {
    if (!hasBash) { skippedNoBash++; continue; }
    checked++;
    const file = join(OUT, `${id.replace(/[^a-zA-Z0-9_-]/g, '_')}.sh`);
    await writeFile(file, code);
    try {
      await run('bash', ['-n', file]);
    } catch (e) {
      failures.push(`${id} (bash): ${(e.stderr || e.message).split('\n').filter(Boolean).pop()}`);
    }
  } else {
    skippedLang++;
  }
}

console.log(`Checked ${checked} AWS example(s) for "${subject}" (json via JSON.parse, yaml via yaml parser` +
  `${hasBash ? ', shell via bash -n' : ''}).`);
if (skippedLang) console.log(`(skipped ${skippedLang} example(s) in other fence languages)`);
if (skippedNoBash) console.log(`(skipped ${skippedNoBash} shell example(s) — bash not on PATH)`);
if (failures.length === 0) {
  console.log('✓ All examples parse clean.');
  await rm(OUT, { recursive: true, force: true });
} else {
  console.log(`✗ ${failures.length} example(s) failed:\n`);
  console.log(failures.join('\n'));
  await rm(OUT, { recursive: true, force: true });
  process.exit(1);
}
