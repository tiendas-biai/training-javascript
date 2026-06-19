// Syntax/structure-checks every deep-dive `example` for the Docker subject. Docker
// content can't be "compiled", so each example is gated by its fence language:
//   ```yaml / ```yml          -> parsed with the `yaml` package (catches the common
//                                authoring error: bad indentation / structure). Multi-doc
//                                manifests separated by `---` are all parsed.
//   ```bash / ```sh / ```shell -> `bash -n` (shell syntax check). SKIPs if no bash.
//   ```dockerfile / ```docker  -> `hadolint` if on PATH, else a dependency-free
//                                instruction lint (every logical line must start with a
//                                known Dockerfile instruction).
// Other fence languages are skipped. Like the java/python verifiers this is a
// parse/structure gate, not execution. Usage: node scripts/verify-docker-examples.mjs docker
import { readFile, mkdir, writeFile, rm } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { parseAllDocuments } from 'yaml';

const run = promisify(execFile);
const here = dirname(fileURLToPath(import.meta.url));
const appDir = join(here, '..');
const subject = process.argv[2] ?? 'docker';
const OUT = join(appDir, '.docker-verify');

const FENCE = /^```(\w*)\n([\s\S]*?)```$/;

const DOCKER_INSTRUCTIONS = new Set([
  'FROM', 'RUN', 'CMD', 'LABEL', 'MAINTAINER', 'EXPOSE', 'ENV', 'ADD', 'COPY',
  'ENTRYPOINT', 'VOLUME', 'USER', 'WORKDIR', 'ARG', 'ONBUILD', 'STOPSIGNAL',
  'HEALTHCHECK', 'SHELL',
]);

async function onPath(cmd, args = ['--version']) {
  try {
    await run(cmd, args);
    return true;
  } catch {
    return false;
  }
}

// Dependency-free Dockerfile lint: each logical line (respecting `\` continuations)
// must begin with a known instruction; blanks and comments are ignored.
function lintDockerfile(code) {
  const errors = [];
  let continuation = false;
  let lineNo = 0;
  for (const raw of code.split('\n')) {
    lineNo++;
    const trimmed = raw.trim();
    if (!continuation) {
      if (trimmed === '' || trimmed.startsWith('#')) continue;
      const word = trimmed.split(/\s+/)[0];
      if (!DOCKER_INSTRUCTIONS.has(word.toUpperCase())) {
        errors.push(`line ${lineNo}: unknown instruction "${word}"`);
      }
    }
    continuation = /\\\s*$/.test(raw) && !trimmed.startsWith('#');
  }
  return errors;
}

function lintYaml(code) {
  const errors = [];
  for (const doc of parseAllDocuments(code)) {
    for (const e of doc.errors) errors.push(e.message.split('\n')[0]);
  }
  return errors;
}

const hasBash = await onPath('bash', ['--version']);
const hasHadolint = await onPath('hadolint', ['--version']);

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

  if (lang === 'yaml' || lang === 'yml') {
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
  } else if (lang === 'dockerfile' || lang === 'docker') {
    checked++;
    if (hasHadolint) {
      const file = join(OUT, `${id.replace(/[^a-zA-Z0-9_-]/g, '_')}.Dockerfile`);
      await writeFile(file, code);
      try {
        await run('hadolint', ['--no-color', file]);
      } catch (e) {
        failures.push(`${id} (hadolint): ${(e.stdout || e.stderr || e.message).split('\n').filter(Boolean)[0]}`);
      }
    } else {
      const errs = lintDockerfile(code);
      if (errs.length) failures.push(`${id} (dockerfile): ${errs[0]}`);
    }
  } else {
    skippedLang++;
  }
}

console.log(`Checked ${checked} Docker example(s) for "${subject}"` +
  ` (dockerfile via ${hasHadolint ? 'hadolint' : 'instruction lint'}, yaml via yaml parser` +
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
