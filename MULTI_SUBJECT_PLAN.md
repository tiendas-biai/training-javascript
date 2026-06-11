# Multi-Subject Refactor Plan (v2)

**Goal:** Extend JS Drill from a single JavaScript question bank to four subjects — **JavaScript, React, Node.js (Express-focused), TypeScript** — with a subject-picker home screen, per-subject storage and data files, and an Open/Closed architecture so new subjects are added by config only.

Question content for the three new subjects is **authored from official documentation** (react.dev, nodejs.org, expressjs.com, typescriptlang.org), batch by topic, directly into JSON files in this repo. Target: **~60–80 questions per new subject**.

---

## 1. Subjects

| id | Label | Data file | Storage key | Primary sources |
|---|---|---|---|---|
| `javascript` | JavaScript | `data/javascript.json` (current `data.json`, 267 q) | `srs:javascript` | — (already complete) |
| `react` | React | `data/react.json` | `srs:react` | https://react.dev/learn, https://react.dev/reference/react |
| `node` | Node.js | `data/node.json` | `srs:node` | https://nodejs.org/docs/latest/api/, https://expressjs.com/en/guide/ |
| `typescript` | TypeScript | `data/typescript.json` | `srs:typescript` | https://www.typescriptlang.org/docs/ (Handbook) |

All data files are **local** — questions are authored into the repo, so the remote-fetch loader from plan v1 is dropped. Data loading is a dynamic `import()` per subject (keeps the initial bundle small).

---

## 2. Architecture: Open/Closed via a subject registry

`app/src/subjects.js` is the single point of extension. Adding a subject = one registry entry + one data file. No other module changes.

```js
// app/src/subjects.js
export const subjects = {
  javascript: {
    id: 'javascript', label: 'JavaScript', icon: 'JS', color: '#f7df1e',
    storageKey: 'srs:javascript',
    loadData: () => import('../data/javascript.json'),
  },
  react: {
    id: 'react', label: 'React', icon: '⚛', color: '#61dafb',
    storageKey: 'srs:react',
    loadData: () => import('../data/react.json'),
  },
  node: {
    id: 'node', label: 'Node.js', icon: 'No', color: '#8cc84b',
    storageKey: 'srs:node',
    loadData: () => import('../data/node.json'),
  },
  typescript: {
    id: 'typescript', label: 'TypeScript', icon: 'TS', color: '#3178c6',
    storageKey: 'srs:typescript',
    loadData: () => import('../data/typescript.json'),
  },
};

export const getSubject = (id) => subjects[id] ?? null;
export const listSubjects = () => Object.values(subjects);
```

Every module receives the `subject` config object — no `if (subject === 'react')` branches anywhere.

### Code changes (unchanged in spirit from v1)

- **`storage.js`** — `loadProgress(storageKey)` / `saveProgress(storageKey, map)` / `clearProgress(storageKey)`. Per-subject reset clears only that subject's key.
- **`migrate.js`** (new) — one-time: copy `srs:all` → `srs:javascript`, delete old key. Existing JS progress survives untouched.
- **Routes** — `/` becomes the subject picker; existing screens move under a subject prefix:
  ```
  /                        → subject picker tiles
  /:subject                → subject home (current start screen)
  /:subject/card-library   → card library
  /:subject/card/:id       → card detail
  ```
  Unknown subject ids redirect to `/`. The router already supports `:params`.
- **`main.js`** — route handlers resolve `getSubject(subject)`, await `subject.loadData()`, and pass the config through. Session state is rebuilt per subject entry, so nothing leaks between subjects.
- **`ui.js`** — new `renderSubjectPicker(subjects, …)`; existing render functions take the subject only to build back-nav URLs. Each tile shows label, total cards, due-today count.
- **Unchanged:** `srs.js` (SM-2), `session.js`, grading flow, card types, library/detail screens, code rendering.

---

## 3. Content pipeline: authoring questions from official docs

**Method:** Claude in-session, batch by topic. For each batch:

1. Fetch the relevant official doc page(s) with WebFetch.
2. Author ~8–12 questions for that topic: mix of **reveal** and **multiple-choice**, difficulty spread roughly 30% easy / 45% medium / 25% hard, code blocks in fenced markdown where it helps.
3. Append to the subject's JSON file; validate IDs unique and MCQ answers exactly match an option.
4. User reviews the batch (spot-check in the app via card library) before the next one.

**ID convention:** `<subject>-<subtopic>-<nnn>` for reveal, `…-mcq-<nnn>` for MCQ, e.g. `react-hooks-003`, `node-express-mw-001`, `ts-generics-mcq-002`.

Existing question schema is reused as-is — `topic` / `subtopic` / `difficulty` / `tags` keep the current filters working per subject with zero code changes.

---

## 4. Topic priorities per subject

Priorities follow the provided curriculum lists. **P1** topics are authored first and get the deepest coverage; **P2** next; **P3** only after P1/P2 are in and reviewed.

### React (~60–80 q) — source: react.dev

| Tier | Topics |
|---|---|
| **P1** | Component definition, JSX, component state, component lifecycle, Hooks (useState/useEffect/useRef/custom), component composition, Forms, Context |
| **P2** | Performance (memo, useMemo/useCallback), code reuse patterns, Virtual DOM, React DOM, typechecking, routing |
| **P3** | Redux / React-Redux / Redux async flow (source: redux.js.org), security, automated testing, building, server rendering, static site rendering |

### Node.js (~60–80 q) — sources: nodejs.org API docs + expressjs.com guides

| Tier | Topics |
|---|---|
| **P1 — Core** | Event loop, NodeJS modules (CJS/ESM), NodeJS events (EventEmitter), async programming, NodeJS API (fs, streams, buffers, http, path, process), error handling |
| **P1 — Express** | Concepts & configuration, routing, **middleware** (per the using-middleware guide), error handling |
| **P2** | NPM, NodeJS CLI, module publishing, Web API architecture, NodeJS network, testing, patterns and principles, Express optimizations |
| **P3** | NVM, code style, JSDoc, Swagger, security / authorization / authentication / OWASP / npm audit, debugging & profiling & memory leaks, containerization, high-load operation, serverless, V8 |

### TypeScript (~60–80 q) — source: typescriptlang.org Handbook

| Tier | Topics |
|---|---|
| **P1** | Primitive types; arrays, tuples, objects, records; functions; interfaces, types, generics; classes; type narrowing |
| **P2** | Type manipulations (mapped/conditional/template literal types), utility types, TS config, namespaces & modules |
| **P3** | Decorators, compilation troubleshooting and optimization |

---

## 5. Implementation order

**Phase A — refactor (app works exactly as today, plus picker):**
1. Move `data/data.json` → `data/javascript.json`; create empty `react.json` / `node.json` / `typescript.json` (`[]`).
2. Write `subjects.js` registry.
3. Write `migrate.js` (storage key migration) and parameterise `storage.js`.
4. Re-register routes under `/:subject`; add subject-picker route at `/`.
5. Update `main.js` to resolve subject config and dynamic-import data per route.
6. Add `renderSubjectPicker` to `ui.js`; thread subject into back-nav URLs.
7. Smoke test: JS subject behaves identically, old progress migrated, empty subjects show an empty state.

**Phase B — content (one batch per sitting, review between):**
8. TypeScript P1 batches (6 subtopics ≈ 5–6 batches).
9. Node P1 batches (core + Express ≈ 7–8 batches).
10. React P1 batches (≈ 6–7 batches).
11. P2 tiers for each subject, then P3 as desired.

Phase A is a prerequisite for B (need the per-subject library to review batches in-app), but B batches can be interleaved in any subject order.

---

## 6. Decisions resolved from v1

- **Remote URLs** — dropped; all data files are local, authored in-repo.
- **Authoring method** — Claude in-session, batch by topic, user reviews each batch.
- **Bank size** — ~60–80 questions per new subject.
- **Empty subjects** — tile is clickable, subject home shows an empty state ("No cards yet").
- **Per-subject reset** — clears only that subject's storage key.
