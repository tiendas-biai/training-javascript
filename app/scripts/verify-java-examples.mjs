// Type-checks every deep-dive `example` for a Java subject with `javac`.
//
//   node scripts/verify-java-examples.mjs java
//
// Unlike the JS/Node verifier (`node --check`, syntax only), `javac` does full
// symbol + type resolution, so examples must be self-contained. The snippets in
// the banks are *fragments* (loose statements, bare class/method declarations),
// not whole compilation units — so each is wrapped into one compilable class:
//
//   - `import` lines are hoisted to the top (a standard set is also injected, so
//     teaching snippets needn't repeat `import java.util.*;` boilerplate);
//   - top-level type declarations become `static` nested types (so they can be
//     instantiated from the synthetic `main` with no enclosing instance);
//   - file-scope method declarations become `static` methods on the wrapper;
//   - everything else (loose statements) goes into `public static void main`.
//
// Requires a JDK on PATH. If `javac` is absent the check is SKIPPED (exit 0) and
// the generated sources are kept in app/.java-verify for inspection.
//
// Flags: --emit-only  generate the wrapped sources but don't compile (or run
//                     without a JDK) — useful to eyeball the wrapping.
import { readFile, mkdir, writeFile, rm, readdir } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const run = promisify(execFile);
const here = dirname(fileURLToPath(import.meta.url));
const appDir = join(here, '..');
const subject = process.argv[2] ?? 'java';
const emitOnly = process.argv.includes('--emit-only');
const OUT = join(appDir, '.java-verify');
const CLASSES = join(OUT, 'classes');
const FENCE = /^```\w*\n([\s\S]*?)```$/;

// Imported into every wrapper so fragment snippets don't need import boilerplate.
const COMMON_IMPORTS = [
  'java.util.*',
  'java.util.stream.*',
  'java.util.function.*',
  'java.io.*',
  'java.util.concurrent.*',
  'java.util.concurrent.locks.*',
  'java.time.*',
  'java.util.regex.*',
];

// Replace the contents of strings, char literals, and comments with spaces of
// equal length (newlines preserved), so brace/semicolon scanning ignores them.
// Indices in the masked copy line up 1:1 with the original.
function mask(src) {
  const out = src.split('');
  const blank = (i) => { if (src[i] !== '\n') out[i] = ' '; };
  let i = 0;
  const n = src.length;
  while (i < n) {
    const c = src[i];
    const d = src[i + 1];
    if (c === '/' && d === '/') {
      while (i < n && src[i] !== '\n') blank(i++);
    } else if (c === '/' && d === '*') {
      blank(i++); blank(i++);
      while (i < n && !(src[i] === '*' && src[i + 1] === '/')) blank(i++);
      if (i < n) { blank(i++); blank(i++); }
    } else if (c === '"' || c === "'") {
      const quote = c;
      blank(i++);
      while (i < n && src[i] !== quote) {
        if (src[i] === '\\') { blank(i++); if (i < n) blank(i++); continue; }
        blank(i++);
      }
      if (i < n) blank(i++);
    } else {
      i++;
    }
  }
  return out.join('');
}

// Split a snippet into top-level units. A unit ends at a `;` at depth 0, or at a
// `}` that closes a top-level block (continuing across else/catch/finally and
// do…while). Returns [{ text, masked }] slices, indices shared with the source.
function splitUnits(src) {
  const m = mask(src);
  const units = [];
  let brace = 0, paren = 0, brack = 0, start = 0;
  const push = (end) => {
    const text = src.slice(start, end);
    if (text.trim()) units.push({ text, masked: m.slice(start, end) });
    start = end;
  };
  for (let i = 0; i < m.length; i++) {
    const c = m[i];
    if (c === '(') paren++;
    else if (c === ')') paren--;
    else if (c === '[') brack++;
    else if (c === ']') brack--;
    else if (c === '{') brace++;
    else if (c === ';') {
      if (brace === 0 && paren === 0 && brack === 0) push(i + 1);
    } else if (c === '}') {
      brace--;
      if (brace === 0 && paren === 0 && brack === 0) {
        let j = i + 1;
        while (j < m.length && /\s/.test(m[j])) j++;
        const rest = m.slice(j);
        const cur = src.slice(start, i + 1).trimStart();
        if (m[j] === ';') { push(j + 1); i = j; }            // `... = {..};`, anon class
        else if (/^(else|catch|finally)\b/.test(rest)) { /* continue unit */ }
        else if (/^while\b/.test(rest) && /^do\b/.test(cur)) { /* do…while */ }
        else push(i + 1);                                     // type/method/control block
      }
    }
  }
  push(src.length);
  return units;
}

function classify(mu) {
  const t = mu.trim();
  if (/^import\b/.test(t)) return 'import';
  const he = mu.indexOf('{');
  const header = he >= 0 ? mu.slice(0, he) : mu;
  if (/(?<![@\w])(class|interface|enum|record)\b/.test(header)) return 'type';
  if (t.endsWith('}')) {
    if (/^\s*(for|if|else|while|do|switch|try|catch|finally|synchronized)\b/.test(t)) return 'statement';
    if (/\(/.test(header)) return 'method';
  }
  return 'statement';
}

// Insert `static` before the type keyword (after any modifiers/annotations) so
// the nested type needs no enclosing instance.
function staticType(text, masked) {
  const he = masked.indexOf('{');
  const header = he >= 0 ? masked.slice(0, he) : masked;
  if (/\bstatic\b/.test(header)) return text;
  const m = header.match(/(?<![@\w])(class|interface|enum|record)\b/);
  if (!m) return text;
  return text.slice(0, m.index) + 'static ' + text.slice(m.index);
}

// Make a file-scope method static so the synthetic main can call it.
function staticMethod(text, masked) {
  const he = masked.indexOf('{');
  const header = he >= 0 ? masked.slice(0, he) : masked;
  if (/\bstatic\b/.test(header)) return text;
  const idx = masked.search(/\S/); // first real token (comments are blanked)
  return text.slice(0, idx) + 'static ' + text.slice(idx);
}

const indent = (s, n) => s.split('\n').map((l) => (l ? ' '.repeat(n) + l : l)).join('\n');

function wrap(id, code) {
  const imports = new Set(COMMON_IMPORTS);
  const types = [], methods = [], statements = [];
  for (const u of splitUnits(code)) {
    switch (classify(u.masked)) {
      case 'import': {
        const m = u.text.match(/import\s+(static\s+)?([^;]+);/);
        if (m) imports.add((m[1] ?? '') + m[2].trim());
        break;
      }
      case 'type': types.push(staticType(u.text, u.masked)); break;
      case 'method': methods.push(staticMethod(u.text, u.masked)); break;
      default: statements.push(u.text.trim());
    }
  }
  const cls = 'V_' + id.replace(/[^A-Za-z0-9]/g, '_');
  const importLines = [...imports].map((i) => `import ${i};`).join('\n');
  const body = statements.map((s) => indent(s, 8)).join('\n');
  const members = [...methods, ...types].map((t) => indent(t, 4)).join('\n\n');
  const source =
    `${importLines}\n\n` +
    `public class ${cls} {\n` +
    `    public static void main(String[] args) throws Exception {\n` +
    `${body}\n` +
    `    }\n\n` +
    `${members}\n` +
    `}\n`;
  return { cls, source };
}

// ---------------------------------------------------------------------------
const ddPath = join(appDir, 'data', 'deepdives', `${subject}.json`);
const dd = JSON.parse(await readFile(ddPath, 'utf8'));

await rm(OUT, { recursive: true, force: true });
await mkdir(CLASSES, { recursive: true });

const files = []; // { id, cls, file }
for (const [id, entry] of Object.entries(dd)) {
  if (!entry.example) continue;
  const m = entry.example.match(FENCE);
  const code = m ? m[1] : entry.example;
  const { cls, source } = wrap(id, code);
  const file = join(OUT, `${cls}.java`);
  await writeFile(file, source);
  files.push({ id, cls, file });
}
console.log(`Wrapped ${files.length} example(s) for "${subject}" into ${OUT}`);

if (emitOnly) {
  console.log('--emit-only: skipping compilation.');
  process.exit(0);
}

// Need a JDK. If javac can't run, skip cleanly (keep sources for inspection).
try {
  await run('javac', ['-version']);
} catch {
  console.log('\n⚠ SKIPPED: no JDK found on PATH (javac not runnable).');
  console.log('  Install a JDK 17+ (e.g. Temurin) to run this check.');
  console.log(`  Generated sources kept in ${OUT} for inspection.`);
  process.exit(0);
}

const failures = [];
for (const { id, file } of files) {
  try {
    await run('javac', ['-nowarn', '-d', CLASSES, file]);
  } catch (e) {
    const firstError = (e.stderr || e.message)
      .split('\n')
      .find((l) => /error:/.test(l)) || (e.stderr || e.message).split('\n').find(Boolean);
    failures.push(`${id}: ${firstError.trim()}`);
  }
}

console.log(`\nCompiled ${files.length} examples for "${subject}".`);
if (failures.length === 0) {
  console.log('✓ All examples compile clean.');
  await rm(OUT, { recursive: true, force: true });
} else {
  console.log(`✗ ${failures.length} example(s) failed:\n`);
  console.log(failures.join('\n'));
  console.log(`\nWrapped sources kept in ${OUT} for inspection.`);
  process.exit(1);
}
