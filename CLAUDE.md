# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Repo Is

A JavaScript learning repo with two distinct parts:

1. **`exercises/`** — Coding challenges (mostly async/Promise patterns) with Jest tests.
2. **`app/`** — A Vite vanilla-JS spaced-repetition drill app (JS Drill) for studying JavaScript concepts via flashcards and MCQ.

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

## Part 2 — JS Drill App (`app/`)

A spaced-repetition flashcard app for drilling JavaScript concepts. Vite + vanilla JS, no framework.

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
│   └── data.json        # question bank — single source of truth, edit here
├── src/
│   ├── main.js          # entry point: registers routes, wires all modules
│   ├── router.js        # tiny History API router: route(), navigate(), replaceState()
│   ├── srs.js           # SM-2 algorithm: grade(), graduate(), previewIntervals(), getDueCards(), computeStats()
│   ├── storage.js       # localStorage wrapper (key: 'srs:all')
│   ├── session.js       # buildQueue(), advance(), applyFilters(), getCardType()
│   ├── ui.js            # render functions for every screen/phase
│   └── styles.css
├── index.html
├── package.json         # vite only
└── vite.config.js
```

### Routes

- `/` — start screen
- `/card-library` — card library (read-only table of all cards)
- `/card-library?filter=due&topic=Arrays&attempted=attempted&q=typeof` — library with filters pre-applied
- `/card/:id` — card detail page (e.g. `/card/types-prim-002`)

### SM-2 algorithm (`srs.js`)

Single mode — no drill/SRS toggle. Every card follows SM-2:

- **Learning phase** — new cards cycle within the session. Needs 2 consecutive correct answers (Good) to graduate, or 1 Easy.
  - Hard: re-inserted after 2 positions in the queue, streak resets
  - Good: goes to end of queue; graduates with 2-day interval on 2nd correct
  - Easy: graduates immediately with 3-day interval
- **Review phase** — card exits the queue after one answer. Intervals grow multiplicatively:
  - Hard: `interval × 1.2`, ease decreases (min 1.3)
  - Good: `interval × ease`
  - Easy: `interval × ease × 1.3`, ease increases (max 3.0)
- **Mastered** = review phase + interval ≥ 7 days

Progress shape stored in `localStorage`:
```js
{ id, phase: 'learning'|'review', interval, ease, nextDue, lastReviewed, totalSeen }
```
Old Leitner data (box/correctStreak shape) is auto-migrated on first load via `migrateIfNeeded()`.

### Session

- Start screen lets you filter by topic / difficulty / type / tag and pick session size: **10 / 20 / All**
- Session builds a queue of due cards (shuffled). Learning cards cycle back; review cards exit after one answer.
- After grading, a 5-second toast confirms the outcome before advancing.

### Card types

- **reveal** — show question → "Show Answer" → answer + explanation → Hard / Good / Easy buttons
- **multiple-choice** — shuffled options → pick → auto-grade highlights correct/wrong → Hard / Good / Easy buttons

Both types show a **phase badge** on the card: `Learning · 1/2` (orange) or `Review · 5d` (purple). Grade buttons show the resulting interval: `Hard · again`, `Good · 2d`, `Easy · 3d`.

### Question bank (`app/data/data.json`)

267 questions across 12 topics (as of June 2026):

| Topic | Questions |
|---|---|
| Arrays | 84 (all instance methods) |
| Strings | 83 (all instance methods) |
| Types | 20 |
| Scope | 11 (var/let/const, hoisting, closures) |
| Async | 11 (Promises, async/await, callbacks) |
| Modern JS | 12 (destructuring, spread/rest, optional chaining, ESM) |
| Execution | 10 (call stack, event loop, IIFE) |
| Coercion | 8 |
| Functions | 9 (HOF, currying, generators) |
| this | 7 |
| Prototypes | 6 |
| Error Handling | 6 |

### Adding questions

Paste new objects into `app/data/data.json`. IDs must be unique. Two shapes:

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
```

Progress is stored separately in `localStorage` (key `srs:all`) and never written into `data.json`. Adding questions never disturbs existing progress.

### Card detail (`/card/:id`)

Read-only view of a single card. Accessible by clicking any question row in the card library. Back button uses `history.back()` to return to the exact library URL (preserving filters).

Sections:
- **Card block** — full badges (topic, subtopic, difficulty, type, tags), full question text, answer/explanation for reveal cards, all options with correct answer highlighted for MCQ cards
- **Progress block** — SM-2 status badge, interval/ease/next-due for review cards, "Never studied" for new cards, card ID

Unknown IDs redirect to `/card-library`.

### Card library (`/card-library`)

Read-only table of all cards. Accessible by clicking any stat tile on the start screen (pre-filters to that group).

Columns: Question (with ID below) | Topic | Difficulty | Status

Filter controls:
- **Status chips**: All / New / Learning / Due / Mastered
- **Search box**: free-text filter on question text (`?q=`)
- **Topic dropdown** (`?topic=`)
- **Attempted select**: All / Attempted / Not attempted (`?attempted=`)

All filter state is reflected in the URL via `replaceState` — shareable/bookmarkable. Chip counts show global totals and don't change when other filters are applied.

### Code rendering (`ui.js`)

Question, answer, and explanation text supports two markdown-like formats:

- **Fenced code blocks** — ` ```js\n...\n``` ` are rendered as highlighted `<pre>` blocks using **Prism.js** (One Dark token colors: purple keywords, orange numbers, blue functions, teal operators, gray punctuation).
- **Inline code** — `` `backtick` `` spans are rendered as styled `<code>` chips.
- `renderText(str)` — parses and renders both formats; used for all question/answer/explanation fields.
- `plainText(str)` — strips code fences to `[code]` for library table previews.

Adding code to a question or explanation just requires standard markdown fences in the JSON string — no special handling needed.

### Planning docs

- `PROJECT_SPEC.md` — original spec for the drill app
- `FEATURE_PLAN.md` — implementation plan with architecture decisions and reference to `training-ai`
