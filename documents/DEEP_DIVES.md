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

**Remaining subjects — not started:** `javascript` and `aws` deepdives files are still
`{}`. Use the matching prompt in `documents/prompts/`, the same batch workflow. JS uses ```js```
snippets — verify with `verify-node-examples.mjs javascript`. AWS cards are scenario-based — examples
optional.
