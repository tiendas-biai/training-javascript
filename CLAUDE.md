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
│   ├── main.js          # entry point: state machine, wires all modules
│   ├── srs.js           # Leitner 5-box algorithm: grade(), getDueCards(), computeStats()
│   ├── storage.js       # localStorage wrapper (key: 'srs:all')
│   ├── session.js       # buildQueue(), advance(), applyFilters(), getCardType()
│   ├── ui.js            # render functions for every screen/phase
│   └── styles.css
├── index.html
├── package.json         # vite only
└── vite.config.js
```

### Session modes

- **Drill** — shuffled filtered set, capped at 15 cards. Missed cards cycle to the back.
- **SRS** — only cards due today (Leitner `nextDue <= Date.now()`), from the filtered set.

### Card types

- **reveal** — show question → "Show Answer" → answer + explanation → self-grade (Got it / Missed it)
- **multiple-choice** — shuffled options → pick → auto-grade, highlight correct/wrong → Next

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

### Planning docs

- `PROJECT_SPEC.md` — original spec for the drill app
- `FEATURE_PLAN.md` — implementation plan with architecture decisions and reference to `training-ai`
