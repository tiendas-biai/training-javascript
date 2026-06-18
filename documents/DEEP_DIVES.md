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
  solution works → common mistakes**. Uses `**bold**`, `` `inline code` ``, fenced blocks.
- **example** — one fenced ```` ```tsx ```` block, **complete and compilable**, starting with
  `export default function App() {` where it's a full component (mounting/infra snippets may
  differ). Optional for purely conceptual cards (e.g. "what is the Virtual DOM", "Fiber").
- **resources** — 1–3 links, prefer official docs (react.dev, typescriptlang.org, MDN, the
  library's own docs).

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

**Done — 13 topics / 128 cards** (genuine content, examples compile clean):
Components, JSX, State, Effects & Lifecycle, Props & Composition, Forms, Context, Refs,
React DOM, Hooks, Performance, Typechecking, Virtual DOM. Also fixed 3 originally-broken examples
(`react-comp-mcq-001`, `react-jsx-004`, `react-jsx-mcq-002`).

**Remaining — 10 topics / 72 cards (still placeholder filler):**

| Topic | Cards | Notes for the example |
|---|---|---|
| Code Reuse Patterns | 8 | HOCs, render props, custom hooks — pure React, examples compile |
| Routing | 7 | `react-router-dom` v7 is installed — examples compile (use `MemoryRouter` in snippets) |
| Redux | 8 | external lib (not installed) — self-review |
| React Redux | 7 | external lib (not installed) — self-review |
| Redux Async Flow | 7 | external lib (not installed) — self-review |
| Security | 8 | mostly React/concept (XSS, `dangerouslySetInnerHTML`) — examples compile |
| Static Site Rendering | 6 | Next.js/SSG concepts — often conceptual, example optional |
| Server Rendering | 7 | `react-dom/server` installed; Next concepts conceptual |
| Testing | 7 | `@testing-library/*` installed; Jest globals not typed in harness |
| Building | 7 | Vite/bundler concepts — often conceptual, example optional |

When all show `ok` in the detector above, the React bank is fully done. The same workflow applies
to the other subjects (`javascript`, `typescript`, `node`, `aws`) whose deepdives files are still
`{}` — use the matching prompt in `documents/prompts/` and `verify-deepdive-examples.mjs <subject>`.
