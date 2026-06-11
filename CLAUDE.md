# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Repo Is

A learning repo with two distinct parts:

1. **`exercises/`** — Coding challenges (mostly async/Promise patterns) with Jest tests.
2. **`app/`** — A Vite vanilla-JS spaced-repetition drill app (Dev Drill) with separate question banks for JavaScript, TypeScript, React, Node.js, and AWS SAA.

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

A multi-subject spaced-repetition flashcard app. Vite + vanilla JS, no framework. The home screen is a subject picker; each subject has its own question bank, progress storage, and routes.

### Commands

```bash
cd app
npm install      # first time only
npm run dev      # dev server at http://localhost:5173
npm run build    # production build to app/dist/
```

### App structure

```
app/
├── data/
│   ├── javascript.json  # one question bank per subject — single source of truth
│   ├── typescript.json
│   ├── react.json
│   ├── node.json
│   └── aws.json
├── src/
│   ├── main.js          # entry point: registers routes, wires all modules
│   ├── subjects.js      # subject registry — THE extension point for new subjects
│   ├── router.js        # tiny History API router: route(), navigate(), replaceState()
│   ├── srs.js           # SM-2 algorithm: grade(), graduate(), previewIntervals(), getDueCards(), computeStats()
│   ├── storage.js       # localStorage wrapper, parameterised by storage key
│   ├── migrate.js       # one-time legacy migration: 'srs:all' → 'srs:javascript'
│   ├── session.js       # buildQueue(), advance(), applyFilters(), getCardType()
│   ├── ui.js            # render functions for every screen/phase
│   └── styles.css
├── index.html
├── package.json         # vite + prismjs
└── vite.config.js
```

### Subjects (`subjects.js`)

The registry follows the open/closed principle: **adding a subject = one registry entry + one data file in `data/`**. Nothing else changes.

```js
aws: {
  id: 'aws', label: 'AWS SAA', icon: '☁', color: '#ff9900',
  storageKey: 'srs:aws',
  loadData: () => import('../data/aws.json'),
},
```

Data files are dynamic-imported per subject, so Vite code-splits each bank into its own chunk. Progress is stored per subject under `srs:<id>`; "Reset progress" clears only the active subject.

Current subjects: `javascript`, `react`, `node`, `typescript`, `aws`.

### Routes

- `/` — subject picker (tiles with card count + due count; empty banks show "No cards yet")
- `/:subject` — subject home / start screen (e.g. `/javascript`)
- `/:subject/card-library` — card library; filters live in the URL (`?filter=due&topic=Arrays&attempted=attempted&q=typeof`)
- `/:subject/card/:id` — card detail page (e.g. `/javascript/card/types-prim-002`)

Unknown subject ids redirect to `/`; unknown card ids redirect to that subject's library.

### SM-2 algorithm (`srs.js`)

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

Progress shape stored in `localStorage` (key `srs:<subject>`):
```js
{ id, phase: 'learning'|'review', interval, ease, nextDue, lastReviewed, totalSeen }
```
Legacy single-subject data (`srs:all`) is moved to `srs:javascript` once at boot by `migrate.js`. Old Leitner data (box/correctStreak shape) is auto-migrated on first load via `migrateIfNeeded()` in `srs.js`.

### Session

- Subject home lets you filter by topic / difficulty / type / tag and pick session size: **10 / 20 / All**
- Session builds a queue of due cards (shuffled). Learning cards cycle back; review cards exit after one answer.
- After grading, a 2-second toast confirms the outcome before advancing.

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
| React | 62 | Authored from react.dev: Components, JSX, State, Effects & Lifecycle, Props & Composition, Forms, Context, Refs |
| Node.js | 61 | Authored from nodejs.org + expressjs.com: Event Loop, Modules, Events, Core API, Streams & Buffers, HTTP, Error Handling, Express |
| AWS SAA | 64 | SAA-C03 exam-style scenario questions, weighted by official domain percentages (Secure 20, Resilient 18, High-Performing 14, Cost-Optimized 12); uses multiple-response cards |

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

Read-only view of a single card. Accessible by clicking any question row in the card library. Back button uses `history.back()` to return to the exact library URL (preserving filters).

Sections:
- **Card block** — full badges (topic, subtopic, difficulty, type, tags), full question text, answer/explanation for reveal cards, all options with the correct answer(s) highlighted for MCQ/multiple-response cards
- **Progress block** — SM-2 status badge, interval/ease/next-due for review cards, "Never studied" for new cards, card ID

### Card library (`/:subject/card-library`)

Read-only table of the subject's cards. Accessible by clicking any stat tile on the subject home (pre-filters to that group).

Columns: Question (with ID below) | Topic | Difficulty | Status

Filter controls:
- **Status chips**: All / New / Learning / Due / Mastered
- **Search box**: free-text filter on question text (`?q=`)
- **Topic dropdown** (`?topic=`)
- **Attempted select**: All / Attempted / Not attempted (`?attempted=`)

All filter state is reflected in the URL via `replaceState` — shareable/bookmarkable. Chip counts show global totals and don't change when other filters are applied.

### Text rendering (`ui.js`)

Question, answer, and explanation text supports markdown-like formats:

- **Fenced code blocks** — ` ```js\n...\n``` ` are rendered as highlighted `<pre>` blocks using **Prism.js** (One Dark token colors).
- **Inline code** — `` `backtick` `` spans are rendered as styled `<code>` chips.
- **Emphasis** — `*italic*` and `**bold**` render as `<em>`/`<strong>`. Code spans are protected: a literal `*` inside backticks (e.g. `` `s3:*` ``) is never treated as emphasis.
- `renderText(str)` — parses and renders all formats; used for all question/answer/explanation fields.
- `plainText(str)` — strips code fences to `[code]` for library table previews.

### Planning docs

- `PROJECT_SPEC.md` — original spec for the drill app
- `FEATURE_PLAN.md` — implementation plan with architecture decisions and reference to `training-ai`
- `MULTI_SUBJECT_PLAN.md` — multi-subject refactor plan (subject registry, per-subject storage, content pipeline)
