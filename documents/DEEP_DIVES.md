# Deep Dives — content status & authoring runbook

Context for continuing the per-card **deep dive** work. Pairs with the "Deep dives"
section in `CLAUDE.md` (feature/architecture) and `documents/prompts/` (per-subject
authoring prompts). This file is about **content state + the authoring workflow**.

## What a deep dive is (recap)

An optional teaching write-up per card — `{ explanation, example?, resources? }` keyed by
card id in `app/data/deepdives/<subject>.json`. Shown collapsibly on the card detail page
(`/:subject/card/:id`) and inside study sessions (after the answer is revealed). See `CLAUDE.md`.

Quality bar for each entry:
- **explanation** — markdown, ~4–6 sentences, structured **problem → why it happens → why the
  solution works → common mistakes**. Write the section labels as inline bold ending in a colon
  (`**The problem:** …`, `**Why it happens:** …`); the `DeepDive` component automatically inserts
  a blank line before each such label, so do **not** add manual line breaks. Uses `**bold**`,
  `` `inline code` ``, fenced blocks.
- **example** — one fenced ```` ```tsx ```` block that is a **complete, copy-paste-ready file** for
  a standard Vite React+TS project:
  - Include **all imports actually used** (e.g. `import { useState } from 'react'`). You do **not**
    need `import React` — Vite/React 17+ uses the automatic JSX runtime, so hook-free examples
    legitimately have no import line.
  - Default-export a component named `App`: start with `export default function App() {` (mounting/
    infra snippets like `createRoot` are the exception and may be `main.tsx`-style instead).
  - A **single clean runnable demo** — no unreachable code after `return`, no unused helper
    components, no placeholders. Make it interactive when it helps show the behavior.
  - Optional only for purely conceptual cards (e.g. "what is the Virtual DOM", "Fiber", "is the
    VDOM always faster") — omit the `example` key entirely rather than forcing one.
- **resources** — 1–3 links, prefer official docs (react.dev, typescriptlang.org, MDN, the
  library's own docs).

The `verify-deepdive-examples.mjs` harness is the source of truth for "compilable": every example
must type-check there (against the app's installed libs — see caveats below).

## How this content was created (and a warning)

The first pass used a background agent over all 200 React cards. **It faked 187 of them** with a
template: explanation `"Understanding X concepts. The explanation should cover…"` and example
`return <div>Example implementation</div>;`. Lesson: do **not** delegate the whole bank to one
agent and trust it — author in small, verified batches.

## Detecting remaining filler

```bash
cd app
node -e "
const cards=require('./data/react.json'), dd=require('./data/deepdives/react.json');
const filler=id=>(dd[id]?.example||'').includes('Example implementation')||(dd[id]?.explanation||'').includes('The explanation should cover');
const t={}; cards.forEach(c=>{t[c.topic]=t[c.topic]||{n:0,f:0};t[c.topic].n++;if(filler(c.id))t[c.topic].f++;});
Object.entries(t).forEach(([k,v])=>console.log((v.f?'TODO ':'ok   ')+v.f+'/'+v.n+'  '+k));
"
```

## Authoring workflow (per topic batch)

1. **Read the cards** for the topic to get accurate Q/A:
   ```bash
   cd app && node -e "require('./data/react.json').filter(c=>c.topic==='State').forEach(c=>console.log(c.id, c.question))"
   ```
2. **Write the batch** into `app/scripts/dd-batch.mjs` — fill the `batch` object with
   `{ "<card-id>": { explanation, example?, resources } }`. (The file is a reusable template;
   overwrite the `batch` object each time.)
3. **Merge** into the JSON (pretty-printed, only touches the listed ids):
   ```bash
   cd app && node scripts/dd-batch.mjs
   ```
4. **Verify examples compile** (extracts every `example`, type-checks with the app's React types):
   ```bash
   cd app && node scripts/verify-deepdive-examples.mjs react
   # then list any failing ids:
   node scripts/verify-deepdive-examples.mjs react 2>&1 | grep -oE '[a-zA-Z0-9_-]+\.tsx' | sort -u
   ```
   Aim for "✓ All examples type-check clean." Cards without an `example` are skipped.
5. **Commit per topic**: `git add data/deepdives/react.json && git commit -m "rewrite <topic> deep dives with real content"`.

## Verifier caveats — installed libraries only

`verify-deepdive-examples.mjs` compiles against the app's `node_modules`, so an example can only
type-check if its imports are installed:

- ✅ Installed: `react`, `react-dom` (incl. `react-dom/client`, `react-dom/server`),
  **`react-router-dom`**, **`@testing-library/react`**, `@testing-library/user-event`.
- ❌ NOT installed: **`redux`, `@reduxjs/toolkit`, `react-redux`** — this app doesn't use Redux.

For the Redux-family topics, write correct idiomatic examples that import the real libraries; they
will **not** pass the local harness (module-not-found). **Do not add Redux as a dependency just to
verify snippets** — self-review those instead. Testing examples use Jest globals (`test`, `expect`)
that aren't in the harness's types; verify the `render`/RTL usage and accept global-type noise.

## Status (update this as you go)

**React — DONE: all 23 topics / 200 cards** have genuine content (problem → why → solution →
mistakes) and the filler detector reports `0`. Also fixed 3 originally-broken examples
(`react-comp-mcq-001`, `react-jsx-004`, `react-jsx-mcq-002`) and normalized 4 awkward originals.

**Verifier state for React:** 192 of 200 cards have examples; **all type-check clean except 8** that
import uninstalled Redux packages (`@reduxjs/toolkit`, `react-redux`, `reselect`):
`react-redux-005`, `react-rr-001/002/003/004/005`, `react-rr-mcq-001`, `react-rax-003`. Their only
errors are `Cannot find module` + cascaded implicit-`any` — the examples are idiomatic and correct
for a project with Redux installed (self-reviewed). The Redux *core* cards (reducers, actions, store,
data flow, thunk mechanics) use plain-TS demos that **do** compile. Conceptual cards (RTK Query,
sagas, when-to-use, Provider-missing, several Building/SSG/SSR cards) intentionally have no `example`.

**Node.js — DONE: all 61 cards** across Event Loop, Modules, Events, Core API, Streams & Buffers,
HTTP, Error Handling, Express. Examples are runnable CommonJS/ESM `js` snippets (not React). Verified
with **`verify-node-examples.mjs node`** — a separate harness that runs **`node --check`** (syntax
only) on each example, since these snippets import core/uninstalled modules (e.g. `express`) and
shouldn't be type-checked. 60 of 61 have an example (`node-mod-mcq-002` is conceptual). All parse clean.

**TypeScript — DONE: all 63 cards / 6 topics** (Primitive Types 11, Arrays & Objects 11, Functions 11,
Interfaces & Generics 10, Classes 10, Type Narrowing 10) have genuine content and an `example`.
Examples are `ts` snippets; verified with **`verify-deepdive-examples.mjs typescript`** (the tsx harness
handles `ts` content fine — `.tsx` is a superset). **All 63 type-check clean.** A few examples use
`// @ts-expect-error` to demonstrate the compile error a card is about (e.g. `typeof null === 'object'`
leaking `null`); those are intentional and the verifier passes because the error is expected.

**Verification harnesses:**
- `verify-deepdive-examples.mjs <subject>` — tsx type-check (React; uses installed libs).
- `verify-node-examples.mjs <subject>` — `node --check` syntax pass (Node/JS snippets). ESM detected
  via top-level `import`/`export`/`await` (written as `.mjs`), else CommonJS (`.cjs`).
- `verify-graphql-examples.mjs graphql` — routes by fence language: ` ```graphql ` blocks are parsed
  with `parse()` from the **`graphql`** package (a `^17` devDependency added for this; validates
  SDL *and* executable-document syntax **without a schema**, never executed), ` ```js ` blocks go
  through `node --check`. Reports failing ids; prints `✓ All examples parse clean.`
- `verify-java-examples.mjs java` — full `javac` type-check (not syntax-only). Bank snippets are
  *fragments*, so each ` ```java ` example is wrapped into one compilable class before compiling:
  imports hoisted (plus a standard set injected, so snippets needn't repeat `import java.util.*;`),
  top-level type declarations turned into `static` nested types (instantiable from the synthetic
  `main` with no enclosing instance), file-scope methods made `static`, and loose statements moved
  into `public static void main(...) throws Exception`. Needs a **JDK 17+ on PATH** — e.g.
  `PATH="$(brew --prefix openjdk@21)/bin:$PATH" node scripts/verify-java-examples.mjs java` — and
  **SKIPs cleanly (exit 0)** when `javac` isn't runnable. `--emit-only` writes the wrapped sources to
  `app/.java-verify/` without compiling (handy to eyeball the wrapping). Scratch dir is gitignored,
  removed on success, kept on failure. Caveat: because a standard import set is injected, a genuinely
  *missing* import in a snippet won't be flagged — the gate checks logic/types, not import hygiene.

**JavaScript — DONE: all 267 cards / 12 topics** — Types (20), Arrays (84), Strings (83), Coercion (8),
Scope (11), Execution (10), this (7), Prototypes (6), Async (11), Functions (9), Error Handling (6),
Modern JS (12). Every card has an `example`; verified with **`verify-node-examples.mjs javascript`**,
**all 267 parse clean** (and the Unicode/locale/regex/async examples were runtime-spot-checked with
`node -e`). Examples are runnable `js` snippets. Authored with colon-ending bold labels
(`**The problem:** …`) so the `DeepDive` spacing regex fires — the one pre-existing `types-prim-001`
used periods and was rewritten. Also **fixed a wrong card answer** while authoring: `array-join-002`
claimed `[1,null,undefined,2].join('-')` is `'1--2'`; it's `'1---2'` (4 elements → 3 separators) —
corrected in `data/javascript.json` too.

**GraphQL — DONE: all 72 cards / 9 topics** — Introduction (8), Queries (10), Mutations (6),
Schema & Type System (12), Resolvers & Execution (9), Subscriptions (5), Performance/N+1/DataLoader/
caching (8), Best Practices & Security (8), Ecosystem & Tooling (6). Every card has a deep dive; 60 of
72 carry an `example` (conceptual cards — e.g. GraphQL vs REST, when-to-use — omit it). Examples are
` ```graphql ` SDL/queries/mutations or ` ```js ` resolver/DataLoader/client snippets; verified with
**`verify-graphql-examples.mjs graphql`**, **all 60 parse clean**. Authored with colon-ending bold
labels so the `DeepDive` spacing regex fires. Plan/runbook: `documents/GRAPHQL_PLAN.md`.

**Spring Boot — DONE: all 55 cards / 9 topics** — Introduction (5), Dependency Injection (8),
Auto-Configuration (5), Configuration (6), Web & REST (10), Data & JPA (8), Testing (5),
Actuator & Production (4), Security (4). Every card has an `example`; fences are mostly ` ```java `
(46) with a few ` ```xml ` (pom/bean config), ` ```yaml `/` ```properties ` (config), and a ` ```bash `.
**No automated verifier:** the Java snippets use Spring types (`@RestController`, `@Autowired`,
`@SpringBootApplication`, JPA, etc.) that aren't on a local classpath, so `javac` can't resolve them —
these were **self-reviewed**, not machine-checked. Authored with colon-ending bold labels so the
`DeepDive` spacing regex fires.

**Java — DONE: all 45 cards / 7 topics** — Language Basics (8), OOP (12), Strings (3), Collections (6),
Exceptions (5), Generics (3), Modern Java (8). Foundational scope for non-senior devs, authored from
the Oracle Java Tutorials + dev.java. Every card has a ` ```java ` `example`; verified with
**`verify-java-examples.mjs java`** (full `javac` type-check via the fragment-wrapping harness above) —
**all 45 compile clean under javac 21**. Unlike Spring Boot, these are plain-JDK snippets (no external
libraries), so `javac` resolves everything. The verifier caught two examples referencing undefined
symbols while authoring (`java-str-003` used an undeclared `name`; `java-exc-002` called a missing
`doWork()`) — both fixed so they type-check. Authored with colon-ending bold labels.

**Python — DONE: all 48 cards / 10 topics** — Language Basics (5), Data Types (4), Strings (4),
Collections (6), Control Flow (4), Functions (5), OOP (7), Modules & Imports (3), Exceptions (4),
Modern Python (6). Foundational scope authored from the official Python tutorial + docs.python.org.
Every card has a ` ```python ` `example`; verified with **`verify-python-examples.mjs python`** —
a new harness that parses each snippet via CPython's **`python3 -m py_compile`** (syntax-only, no
execution or import resolution), **all 48 parse clean**, and a representative subset was
runtime-spot-checked with `python3` to confirm the inline output comments. Authored with colon-ending
bold labels. Also added the `prismjs/components/prism-python` grammar to `RichText.tsx` so
` ```python ` blocks highlight (previously they'd fall back to the JS grammar).

**Remaining subject — not started:** `aws` deepdives file is still `{}`. AWS cards are scenario-based —
examples optional.

**Python verifier** — `verify-python-examples.mjs <subject>`: finds `python3` (falls back to `python`),
SKIPs cleanly (exit 0) if neither is on PATH; only fences tagged `python`/`py`/bare are compiled (a
shell/other-lang fence is skipped), each run through `python3 -m py_compile`. Like the Node verifier
this is a parse gate, not a type/import check — snippets may reference names defined elsewhere or
import stdlib/3rd-party modules.
