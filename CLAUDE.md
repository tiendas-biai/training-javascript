# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Repo Is

A learning repo with three parts:

1. **`exercises/`** — Coding challenges (mostly async/Promise patterns) with Jest tests.
2. **`app/`** — A Vite + React + TypeScript spaced-repetition drill app (Dev Drill) with separate question banks for JavaScript, TypeScript, React, Node.js, and AWS SAA. Anonymous users work against `localStorage`; signed-in users get **Auth0 login + per-user cloud progress**.
3. **`backend/`** — An AWS SAM project (Lambdas + DynamoDB) behind the shared `entorno-biai` HTTP API, providing the per-user progress API and the question-banks read model. See **Part 3** and `documents/INFRA_PLAN.md`.

## Part 1 — Exercises

### Commands

- **Run all tests:** `npm test`
- **Run a single exercise:** `npx jest exercises/retry`
- **Run a specific test file:** `npx jest exercises/retry/retry.test.js`

Jest is the only root dependency. No build step, no TypeScript.

### Exercise structure

Each exercise lives in `exercises/<name>/` and contains:

- `<name>.md` — Problem description and real-world context
- `<name>.js` — Starter code or completed solution. Exports via `module.exports`.
- `<name>.test.js` — Jest tests (CommonJS `require`). Tests are the source of truth.
- `<name>-result.md` (some) — Solution walkthrough with step-by-step traces

`promise-chain-recovery` is theory-only: `questions.md` / `questions-result.md`, no code files.

### Current exercises

async-cache, async-queue, batch-executor, circuit-breaker, poll, promise-all, promise-all-settled, promise-any, promise-chain-recovery, promise-pipeline, promise-pool, rate-limiter, retry, retry-backoff, tech-check, timeout

### Conventions

- All code is CommonJS (`require` / `module.exports`), not ESM.
- No external runtime dependencies — only built-in JS/Node APIs.
- Tests use `jest.fn()` for mocking; no real network calls or I/O.
- `index.js` at the root is a standalone scratch file, unrelated to exercises.

---

## Part 2 — Dev Drill App (`app/`)

A multi-subject spaced-repetition flashcard app. **Vite + React 19 + TypeScript**, with React Router for routing and Jest + React Testing Library for tests. The home screen is a subject picker; each subject has its own question bank, progress storage, and routes. Deployed to Vercel (training-javascript-one.vercel.app) on push to main; `app/vercel.json` holds the SPA rewrite.

### Commands

```bash
cd app
npm install        # first time only
npm run dev        # dev server at http://localhost:5173
npm run build      # production build to app/dist/ (gitignored)
npm test           # Jest + React Testing Library (app suites only)
npm run typecheck  # tsc --noEmit, strict mode
```

From the repo root (no cd needed): `npm run app` (dev server), `npm run app:build`, `npm run app:test`, `npm run app:typecheck`.

### App structure

```
app/
├── data/
│   ├── javascript.json     # one question bank per subject — single source of truth
│   ├── typescript.json
│   ├── react.json
│   ├── node.json
│   ├── aws.json
│   └── deepdives/          # per-subject deep-dive write-ups, keyed by card id (see Deep dives)
├── public/fonts/           # Antonio + Inter woff2 (brand fonts)
├── src/
│   ├── main.tsx            # entry: storage migration, mounts <App/> in BrowserRouter + Auth0Provider
│   ├── App.tsx             # route table; runs useCloudSync (login → local progress merge)
│   ├── types.ts            # Card (discriminated union), Progress, Subject, Rating, …
│   ├── auth/               # Auth0 (gated on isAuthConfigured; dormant until VITE_* set)
│   │   ├── authEnv.ts      # reads VITE_AUTH0_*/VITE_API_URL (authEnv.mock for Jest); cardsFromApi flag
│   │   ├── Auth0ProviderWithNavigate.tsx  # provider inside Router (localStorage token cache)
│   │   ├── AuthButtons.tsx # login/logout/avatar (renders null until configured)
│   │   ├── useIsAdmin.ts   # reads user_roles/roles from the Auth0 user
│   │   └── RequireAdmin.tsx# route guard for admin-only screens
│   ├── lib/                # pure logic — no DOM, fully unit-tested
│   │   ├── subjects.ts     # subject registry; loadData prefers cards API when cardsFromApi, else bundled JSON
│   │   ├── srs.ts          # SM-2: grade(), graduate(), previewIntervals(), getDueCards(), computeStats()
│   │   ├── session.ts      # buildQueue(), advance(), applyFilters(), getCardType(), isMCQ/isMR guards
│   │   ├── storage.ts      # localStorage wrapper, parameterised by storage key
│   │   ├── migrate.ts      # one-time legacy migration: 'srs:all' → 'srs:javascript'
│   │   ├── apiClient.ts    # makeApiClient(getToken): typed fetch + bearer token
│   │   ├── cardsApi.ts     # CRUD client for the cards API (admin editor)
│   │   ├── mergeProgress.ts# diffForUpload: later-wins per-card merge rule
│   │   ├── cloudSync.ts    # syncSubjectToCloud: merge local → cloud, then clear local
│   │   ├── deepdives.ts    # loadDeepDives(subject): cached dynamic import of data/deepdives/<subject>.json
│   │   ├── progress/       # ProgressStore seam: types, localStore, remoteStore
│   │   └── shuffle.ts
│   ├── hooks/
│   │   ├── useProgress.ts  # auth-aware: Local vs Remote ProgressStore by isAuthenticated; loading guard; setFlag() toggle
│   │   ├── useCloudSync.ts # one-time local→cloud merge prompt on first authenticated load
│   │   ├── useSubjectData.ts # cached dynamic import of a subject's cards
│   │   └── useDeepDives.ts # cached dynamic import of a subject's deep-dive map
│   ├── components/         # RichText, badges/CardMeta, GradeButtons, SessionHeader, DeepDive
│   ├── screens/            # SubjectPicker, SubjectLayout, SubjectHome, Session,
│   │                       # RevealCard/MCQCard/MRCard, Summary, NothingDue,
│   │                       # CardLibrary, CardDetail, AdminCards, AdminCardForm
│   └── styles.css          # global, class-based (no CSS-in-JS); tiendasbiai brand palette
│                           # (white/cream, cyan #0cc0df accent), Antonio headings + Inter body
├── index.html
├── jest.config.cjs         # app-local Jest config (root config belongs to exercises/)
├── tsconfig.json           # app; tsconfig.test.json for ts-jest
├── vercel.json             # SPA rewrite: all paths → index.html
└── vite.config.ts
```

### Testing

- Test files live next to their source (`src/lib/*.test.ts`, `src/screens/*.test.tsx`).
- `lib/` has exhaustive unit tests (SM-2 math, queue mechanics, storage, migration). Time is controlled via `jest.spyOn(Date, 'now')`; shuffles via `jest.spyOn(Math, 'random')`.
- Screens are tested with RTL + user-event; routing tests mock `lib/subjects` (dynamic JSON imports don't resolve under Jest) and render `<App/>` in a `MemoryRouter`.
- `jest.polyfills.cjs` provides TextEncoder for react-router under jsdom.
- **Auth in tests** (`jest.config.cjs` moduleNameMapper): `@auth0/auth0-react` → `src/test/auth0.mock.tsx` (anonymous, settled) so existing tests stay on the local path; `auth/authEnv` → `authEnv.mock.ts` because `import.meta.env` is invalid under the CommonJS transpile. Tests that need an authenticated/admin user override `@auth0/auth0-react` with a local `jest.mock` exposing a mutable `authState` (see `useProgress.test.tsx`, `admin.test.tsx`).
- Session gotcha encoded in a test: card components reset via a per-presentation key (`${card.id}:${stats.reviewed}`) — `card.id` alone breaks when a learning card cycles back to the front.

### Subjects (`src/lib/subjects.ts`)

The registry follows the open/closed principle: **adding a subject = one registry entry + one data file in `data/`**. Nothing else changes.

```ts
aws: {
  id: 'aws', label: 'AWS SAA', icon: '☁', color: '#ff9900',
  storageKey: 'srs:aws',
  loadData: () => load(import('../../data/aws.json')),
},
```

Data files are dynamic-imported per subject, so Vite code-splits each bank into its own chunk. Progress is stored per subject under `srs:<id>` (or in the cloud for signed-in users — see Part 3); "Reset progress" clears only the active subject. `loadData` is wrapped so that when `VITE_CARDS_FROM_API=true` it fetches the bank from the cards API and falls back to the bundled import; default (flag off) is the bundled JSON, unchanged.

Current subjects: `javascript`, `react`, `node`, `typescript`, `aws`.

### Routes

- `/` — subject picker (tiles with card count + due count; empty banks show "No cards yet")
- `/:subject` — subject home / start screen (e.g. `/javascript`)
- `/:subject/card-library` — card library; filters live in the URL (`?filter=due&topic=Arrays&attempted=attempted&q=typeof`)
- `/:subject/card/:id` — card detail page (e.g. `/javascript/card/types-prim-002`)
- `/:subject/admin` — admin card editor (behind `RequireAdmin`; "⚙ Manage cards" link on SubjectHome for admins only)

Unknown subject ids redirect to `/`; unknown card ids redirect to that subject's library.

### SM-2 algorithm (`src/lib/srs.ts`)

Single mode — no drill/SRS toggle. Every card follows SM-2 (per subject):

- **Learning phase** — new cards cycle within the session. Needs 2 consecutive correct answers (Good) to graduate, or 1 Easy.
  - Hard: re-inserted after 2 positions in the queue, streak resets
  - Good: goes to end of queue; graduates with 2-day interval on 2nd correct
  - Easy: graduates immediately with 3-day interval
- **Review phase** — card exits the queue after one answer. Intervals grow multiplicatively:
  - Hard: `interval × 1.2`, ease decreases (min 1.3)
  - Good: `interval × ease`
  - Easy: `interval × ease × 1.3`, ease increases (max 3.0)
- **Mastered** = review phase + interval ≥ 7 days

Progress shape (key `srs:<subject>` in `localStorage`, same shape in the cloud):
```js
{ id, phase: 'learning'|'review', interval, ease, nextDue, lastReviewed, totalSeen, flagged? }
```
`flagged?` is an optional "study this later" annotation, orthogonal to SM-2 — see **Flagging cards**.
Legacy single-subject data (`srs:all`) is moved to `srs:javascript` once at boot by `lib/migrate.ts`. Old Leitner data (box/correctStreak shape) is auto-migrated on read via `getOrCreate()` in `lib/srs.ts`. Where progress lives (localStorage vs cloud) is decided by `useProgress` via the `ProgressStore` seam — see Part 3.

### Session

- Subject home lets you filter by topic / difficulty / type / tag and pick session size: **10 / 20 / All**
- Session builds a queue of due cards (shuffled). Learning cards cycle back; review cards exit after one answer.
- Grading advances to the next card immediately (no confirmation toast).

### Flagging cards

Any card can be flagged ("study this later") independently of its SM-2 schedule. The flag is a `flagged?: boolean` field on the card's `Progress` record, so it persists through the same `ProgressStore` seam (localStorage / cloud) with **no backend change** — the progress Lambda already stores the whole record. `useProgress` exposes `setFlag(id, flagged)`, the single toggle used everywhere; it writes the flag without touching the schedule, so it works even in practice/cram sessions where grades are swallowed.

- **Toggle** from: the 🚩 button in the session header (`SessionHeader`, all card types), the Card Detail Progress block, and a clickable 🚩 on each Card Library row.
- **Review** flagged cards via: the **Flagged** status chip in the Card Library (`?filter=flagged`), the **Flagged** stat tile on the subject home, and the **Study flagged** button — a cram session of all flagged cards that won't affect the schedule.

### Card types

- **reveal** — show question → "Show Answer" → answer + explanation → Hard / Good / Easy buttons
- **multiple-choice** — shuffled options → pick one → auto-grade highlights correct/wrong → Hard / Good / Easy buttons
- **multiple-response** — shuffled options + "Select N" hint → toggle selections → Submit (enabled only at exactly N picks) → correct answers highlighted green, wrong picks red → Hard / Good / Easy buttons

All types show a **phase badge** on the card: `Learning · 1/2` (orange) or `Review · 5d` (purple). Grade buttons show the resulting interval: `Hard · again`, `Good · 2d`, `Easy · 3d`. Type badges in library/detail: `reveal`, `MCQ`, `Multi`.

### Question banks (`app/data/*.json`)

As of June 2026:

| Subject | Questions | Notes |
|---|---|---|
| JavaScript | 267 | Arrays/Strings instance methods, Types, Scope, Async, Modern JS, Execution, Coercion, Functions, this, Prototypes, Error Handling |
| TypeScript | 63 | Authored from the official Handbook: Primitive Types, Arrays & Objects, Functions, Interfaces & Generics, Classes, Type Narrowing |
| React | 200 | Authored from react.dev: Components, JSX, State, Effects & Lifecycle, Props & Composition, Forms, Context, Refs |
| Node.js | 61 | Authored from nodejs.org + expressjs.com: Event Loop, Modules, Events, Core API, Streams & Buffers, HTTP, Error Handling, Express |
| AWS SAA | 184 | SAA-C03 exam-style scenario questions, weighted by official domain percentages (Secure 56, Resilient 50, High-Performing 42, Cost-Optimized 36); heaviest user of multiple-response cards |

### Adding questions

Paste new objects into the subject's file in `app/data/`. IDs must be unique within the subject. Three shapes:

```json
// reveal (type field optional)
{ "id": "scope-hoisting-003", "topic": "Scope", "subtopic": "Hoisting",
  "difficulty": "medium", "question": "...", "answer": "...",
  "explanation": "...", "tags": ["hoisting"] }

// multiple-choice (answer must exactly match one option string)
{ "id": "scope-hoisting-mcq-002", "type": "multiple-choice",
  "topic": "Scope", "subtopic": "Hoisting", "difficulty": "hard",
  "question": "...", "options": ["A", "B", "C", "D"], "answer": "B",
  "explanation": "...", "tags": ["hoisting", "mcq"] }

// multiple-response (2+ answers, 5+ options; every answer must match an option)
{ "id": "aws-sec-mr-001", "type": "multiple-response",
  "topic": "Secure Architectures", "subtopic": "Data Protection",
  "difficulty": "medium", "question": "... (Select TWO)",
  "options": ["A", "B", "C", "D", "E"], "answers": ["A", "B"],
  "explanation": "...", "tags": ["s3", "mr"] }
```

Progress is stored separately in `localStorage` and never written into the data files. Adding questions never disturbs existing progress.

### Card detail (`/:subject/card/:id`)

Single-card view (read-only except the flag toggle). Accessible by clicking any question row in the card library. Back button uses `navigate(-1)` to return to the exact library URL (preserving filters).

Sections:
- **Card block** — full badges (topic, subtopic, difficulty, type, tags), full question text, answer/explanation for reveal cards, all options with the correct answer(s) highlighted for MCQ/multiple-response cards
- **Progress block** — SM-2 status badge, interval/ease/next-due for review cards, "Never studied" for new cards, card ID, and a 🚩 flag/unflag toggle
- **Deep Dive** (when authored) — collapsible teaching write-up; see **Deep dives**

### Deep dives

An optional teaching-grade write-up per card: a prose explanation, a copy-pasteable code example, and links to official docs. Shown as a **collapsible "📘 Deep Dive" section** by the `DeepDive.tsx` component — at the bottom of the card detail page **and inside study sessions** (after the answer is revealed, in all three card types), absent when a card has no entry.

- **Source of truth / storage** — kept out of the bank files to keep session/library loads lean. One file per subject, `app/data/deepdives/<subject>.json`, keyed by card id (`{ explanation, example?, resources? }` — the `DeepDive` type in `types.ts`). Dynamic-imported per subject by `lib/deepdives.ts` (cached in `hooks/useDeepDives.ts`, mirroring `useSubjectData`), so each subject's deep dives are their own chunk. `SubjectHome` loads the map and threads it through `Session` → the card components.
- **Rendering** — explanation + example go through `RichText`, so the example's fenced code block reuses the existing **Copy** button (now with `ts`/`tsx` Prism grammars). `DeepDive` inserts a blank line before each bold section label (`**The problem:**`, `**Why it happens:**`, …) so the explanation reads as separate blocks — purely presentational, content is untouched. Examples are complete copy-paste-ready `App.tsx` files (all imports included; no `import React` needed thanks to the JSX runtime). Resources render as an external link list.
- **API path** — `useProgress`-style: `CardDetail`/`Session` resolve `card.deepDive ?? deepDives[card.id]`, so when `VITE_CARDS_FROM_API=true` the deep dive rides along on the card (see Part 3); otherwise it comes from the bundled file.
- **Authoring** — run the per-subject prompt in `documents/prompts/` against a card, then merge the result via `app/scripts/dd-batch.mjs` and verify the example compiles with `app/scripts/verify-deepdive-examples.mjs <subject>`. **Author in small per-topic batches, never one giant pass** (a one-shot agent attempt faked 187/200 cards). Full runbook + current content status (React: 13/23 topics done, 72 cards still placeholder) in **`documents/DEEP_DIVES.md`**.

### Card library (`/:subject/card-library`)

Table of the subject's cards (read-only except the per-row 🚩 flag toggle in the Status column). Accessible by clicking any stat tile on the subject home (pre-filters to that group).

Columns: Question (with ID below) | Topic | Difficulty | Status (🚩 toggle + status badge)

Filter controls:
- **Status chips**: All / New / Learning / Due / Mastered / Flagged
- **Search box**: free-text filter on question text (`?q=`)
- **Topic dropdown** (`?topic=`)
- **Attempted select**: All / Attempted / Not attempted (`?attempted=`)

All filter state lives in the URL via `useSearchParams` (replace mode) — shareable/bookmarkable. Chip counts show global totals and don't change when other filters are applied.

### Text rendering (`src/components/RichText.tsx`)

Question, answer, and explanation text supports markdown-like formats via the `<RichText text={…} />` component:

- **Fenced code blocks** — ` ```js\n...\n``` ` are rendered as highlighted `<pre>` blocks using **Prism.js** (One Dark token colors; the only `dangerouslySetInnerHTML` in the app — Prism output over our own JSON). `js`/`ts`/`jsx`/`tsx` grammars are loaded; other languages fall back to the JS grammar. Each block has a hover **Copy** button.
- **Inline code** — `` `backtick` `` spans are rendered as styled `<code>` chips.
- **Emphasis** — `*italic*` and `**bold**` render as `<em>`/`<strong>`. Code spans are protected: a literal `*` inside backticks (e.g. `` `s3:*` ``) is never treated as emphasis.
- `plainText(str)` — strips code fences to `[code]` for library table previews.

### Planning docs

- `PROJECT_SPEC.md` — original spec for the drill app
- `FEATURE_PLAN.md` — implementation plan with architecture decisions and reference to `training-ai`
- `MULTI_SUBJECT_PLAN.md` — multi-subject refactor plan (subject registry, per-subject storage, content pipeline)
- `REACT_REFACTOR_PLAN.md` — the vanilla-JS → React/TypeScript refactor plan (phases, test scenarios, invariants)
- `documents/AUTH0_AND_BACKEND_PLAN.md` — Auth0 + cloud-progress + cards-API plan (Phases 0–6)
- `documents/INFRA_PLAN.md` — AWS infra: audit of the shared `entorno-biai` API + how this repo's backend integrates
- `documents/DEEP_DIVES.md` — deep-dive content status + per-topic authoring runbook (scripts, verifier, what's done/remaining)
- `documents/prompts/` — per-subject deep-dive authoring prompts (one per subject + README)

---

## Part 3 — Auth0 login, cloud progress & backend

Optional, **dormant until configured**: with no `VITE_*` env vars set, the app behaves exactly as Part 2 (anonymous, `localStorage`). The whole auth surface is gated on `isAuthConfigured` (`auth/authEnv.ts`). Plan + rationale in `documents/AUTH0_AND_BACKEND_PLAN.md`; infra audit/decisions in `documents/INFRA_PLAN.md`.

### Frontend

- **Auth0** via `@auth0/auth0-react`. `Auth0ProviderWithNavigate` wraps `<App/>` inside the router, `cacheLocation: "localstorage"` + refresh tokens. `AuthButtons` (login/logout/avatar) sit in the SubjectPicker/SubjectHome headers and render `null` until configured.
- **Storage seam** — `useProgress(subject)` is auth-aware: `isAuthenticated ? RemoteProgressStore (API) : LocalProgressStore (localStorage)`, both implementing `lib/progress/types.ts`. The anonymous path hydrates synchronously (no loading flash, identical to before); the authenticated path loads async with a loading guard, optimistic writes, and bounded-backoff retry.
- **Login migration** — on first authenticated load, `useCloudSync` offers a one-time merge of this device's local progress into the account (`mergeProgress.diffForUpload`: later-`lastReviewed` wins, `totalSeen` tiebreak; `cloudSync.syncSubjectToCloud` uploads only newer cards then clears local — never on a failed upload).
- **Admin editor** — `/:subject/admin` (`RequireAdmin` + `useIsAdmin`) lists the **live** bank from the cards API and does create/edit/delete via `lib/cardsApi.ts`. Reads/writes `drill-cards`, so edits show in the editor immediately but only reach study sessions when `VITE_CARDS_FROM_API=true`.

Env (`app/.env`, also Vercel) — see `app/.env.example`:
```
VITE_AUTH0_DOMAIN=…        VITE_AUTH0_CLIENT_ID=…
VITE_AUTH0_AUDIENCE=https://entorno-biai
VITE_API_URL=https://m02lp78cnl.execute-api.us-east-1.amazonaws.com/dev
VITE_CARDS_FROM_API=false  # optional: serve banks from the cards API
```

### Backend (`backend/` — AWS SAM, us-east-1)

Deploys **only Lambdas + DynamoDB tables**; routes live on the **shared `entorno-biai` HTTP API** (`m02lp78cnl`, stages `dev`/`prod`), dispatched per stage by stage variables — the account convention. `backend/README.md` has the full runbook.

- **`ProgressFunction`** (`progress/`) — `GET/PUT/DELETE /progress/{subject}[/{cardId}]`; per-user rows in `drill-progress[-dev]` (PK `userId`=Auth0 `sub`, SK `<subject>#<cardId>`). `userId` comes only from `claims.sub`.
- **`CardsFunction`** (`cards/`) — `GET /cards/{subject}` public; `POST/PUT/DELETE` admin-only (Lambda checks `manage:cards` permission OR an `admin` role in `user_roles`/`roles`/the `ROLES_CLAIM` namespaced claim). Banks in `drill-cards[-dev]` (PK `subject`, SK `id`) — a derived read model; **`app/data/*.json` stays the source of truth**, synced up via `backend/scripts/seed-cards.mjs`.
- **Auth** — a dedicated `dev-drill-auth0` JWT authorizer (issuer = the dev Auth0 tenant, audience `https://entorno-biai`) created/converged by `backend/scripts/wire-api.sh`; guards `/progress/*` + card writes.
- **Scripts** (`backend/scripts/`, idempotent, jq-based — never a client-side `--query` under CLI auto-pagination): `wire-api.sh` (authorizer + integrations + routes), `set-stage-vars.sh <env>`, `add-cors-origin.sh`, `unwire-api.sh`.
- **Lambda tests** — `node --test` per function with a mocked `@aws-sdk/client-dynamodb` (`backend/{progress,cards}/test/`). `nodejs22.x`, arm64, `PAY_PER_REQUEST`.

> Status: the **dev** stack is deployed and the dev stage wired + seeded; prod is not. Frontend env is set in Vercel (login live).

---

## Tooling

- **Playwright MCP** — `.mcp.json` (project-scoped) registers `@playwright/mcp` for browser-automation tools (navigate / click / type / screenshot / accessibility snapshot), handy for visually verifying the app against `npm run dev` at `localhost:5173`. Project-scoped MCP servers require a one-time per-user approval on first launch; first run also downloads a Chromium browser.
