# JS Drill — Implementation Plan

Reference app: `/Users/mario/WebstormProjects/training-ai` (React + TypeScript).  
Target app: Vite vanilla-JS, per `PROJECT_SPEC.md`.

This document is the build brief. Read `PROJECT_SPEC.md` alongside it.

---

## 1. What already exists

### In `training-javascript`
- `data/questions-types.json` — 16 reveal-style flashcard questions (no `type` or `options` fields). This becomes `data/data.json` or can stay as-is with the filename updated.

### In `training-ai` (reference for drill architecture)
| training-ai file | Pattern to reuse |
|---|---|
| `src/quiz/drillTypes.ts` | Card state shape (adapt to Leitner) |
| `src/quiz/drillEngine.ts` | `getDueCards()` + `computeNextState()` pure functions |
| `src/quiz/drillStorage.ts` | localStorage wrapper keyed by `drill_deck_{deckId}` |
| `src/quiz/drillStats.ts` | `computeDrillStats()` — attempted / mastered / dueToday |
| `src/quiz/DrillSession.tsx` | Phase machine: `session → self-rating → summary → nothing-due` |

---

## 2. Key divergences from training-ai

| Concern | training-ai | This app |
|---|---|---|
| Framework | React + TypeScript | Vanilla JS (ES modules) |
| Algorithm | SM-2 (interval × easeFactor) | **Leitner 5-box** (fixed intervals) |
| Card state | `interval, repetitions, easeFactor` | `box, nextDue, lastReviewed, correctStreak, totalSeen` |
| Question types in drill | Reveal only (self-rate) | **Both reveal and MCQ** |
| MCQ answer format | Index-based (`correctIndex`) | **String equality** (`answer === option`) |
| Start screen filters | None | topic / subtopic / difficulty / tag / type |
| Modes | Drill (all due cards, capped 15) | **Drill** (filtered set) + **SRS** (due today only) |
| Multi-deck registry | 7 decks in `modeConfig.ts` | Single deck (`data/data.json`) |

---

## 3. Repo structure to scaffold

```
js-drill/
├── data/
│   └── data.json          # question bank (source of truth)
├── src/
│   ├── main.js            # entry: load data + state, wire up UI events
│   ├── srs.js             # Leitner scheduling: grade(), getDueCards(), nextInterval()
│   ├── storage.js         # localStorage wrapper for per-card progress
│   ├── session.js         # session logic: buildQueue(), advance(), computeStats()
│   ├── ui.js              # render: filters, card flows, summary, nothing-due
│   └── styles.css
├── index.html
├── package.json           # vite dev dependency only
└── vite.config.js         # minimal: enable JSON imports
```

---

## 4. Module contracts

### `storage.js`
Mirrors `drillStorage.ts` but with the Leitner card state shape.

```js
// Key per deck: 'srs:all'  (one combined map is simpler than per-card keys)
// Card state shape (per spec §5):
// { box: 1..5, nextDue: epochMs, lastReviewed: epochMs|null,
//   correctStreak: 0, totalSeen: 0 }

export function loadProgress()          // → Record<id, CardState> | {}
export function saveProgress(map)       // void
export function clearProgress()         // void
```

### `srs.js`
Pure functions. Mirrors `drillEngine.ts` but uses Leitner instead of SM-2.

```js
// Box → interval (ms):
// box 1 → 0 (due immediately next session)
// box 2 → 1 day
// box 3 → 3 days
// box 4 → 7 days
// box 5 → 14 days

export function grade(state, isCorrect)       // → new CardState
// correct: box = min(box+1,5), correctStreak++, nextDue = now + interval(newBox)
// wrong:   box = 1, correctStreak = 0, nextDue = now + interval(1)

export function getDueCards(allCards, progressMap)
// returns cards where progressMap[id] is missing (new) OR nextDue <= Date.now()
// shuffled (Fisher-Yates), same as training-ai drillEngine.ts:21-28

export function computeStats(allCards, progressMap)
// returns { attempted, mastered, dueToday, total }
// mastered = correctStreak >= 2  (analogous to training-ai: repetitions >= 2)
```

### `session.js`
Adapts the DrillSession phase machine from `DrillSession.tsx` into a plain JS object.

```js
// Phases (mirror training-ai): 'session' | 'self-rating' | 'summary' | 'nothing-due'

export function buildQueue(allCards, progressMap, filters, mode)
// mode: 'drill' (filtered set) | 'srs' (due today only from filtered set)
// cap at 15 per session (same as training-ai DrillSession.tsx:24)
// applies filters: topic, subtopic, difficulty, tag, type

export function advance(queue, currentId, isCorrect)
// correct → remove from front
// wrong   → append to back (same as DrillSession.tsx:57-61)
// returns new queue

export function isSessionDone(queue)   // queue.length === 0
```

### `ui.js`
Render functions. No framework — update DOM directly.

```js
export function renderStartScreen(allCards, progressMap, onStart)
// Shows: mode toggle (Drill | SRS), filter controls, stats tile grid, Start button
// Stats tiles: ATTEMPTED / MASTERED / DUE TODAY / SESSION LENGTH  ← from training-ai hub

export function renderRevealCard(question, questionNumber, remaining, onShowAnswer)
// Phase 1 of reveal flow: show question, "Show answer" button

export function renderRevealGrade(question, onGrade)
// Phase 2: show answer + explanation, "Got it ✓" / "Missed it ✗" buttons
// (self-rating screen from training-ai DrillSession.tsx:121-145)

export function renderMCQCard(question, questionNumber, remaining, onPick)
// Show question + shuffled option buttons
// On pick: highlight correct/incorrect, reveal explanation, show "Next →"
// Auto-grade (no self-rating needed for MCQ)

export function renderSummary(stats, onDrillAgain, onBack)
// Mirror training-ai summary: cards reviewed / got it / accuracy %
// DrillSession.tsx:148-176 for reference

export function renderNothingDue(progressMap, totalCount, onBack)
// Mirror training-ai nothing-due: celebration, next-due date, learned/total
// DrillSession.tsx:89-118 for reference
```

### `main.js`
Wires everything together.

```js
import questions from '../data/data.json' assert { type: 'json' }
// (Vite handles JSON imports natively)

// On load:
//   1. loadProgress()
//   2. renderStartScreen(questions, progress, startSession)
//
// startSession(mode, filters):
//   1. buildQueue(questions, progress, filters, mode)
//   2. if queue empty → renderNothingDue
//   3. else → runSession(queue)
//
// runSession(queue):
//   show card (reveal or MCQ based on question.type)
//   on answer:
//     grade card → saveProgress
//     advance queue
//     if done → renderSummary
//     else → show next card
```

---

## 5. Data schema

Extend the existing `questions-types.json` questions. Rename file to `data.json`.

**Type inference rule** (from spec §4): if `type` absent → `"reveal"`; if `options` present → `"multiple-choice"`. Existing 16 questions need no edits.

```jsonc
// reveal (existing questions are already this shape)
{
  "id": "types-prim-001",
  "topic": "Types",
  "subtopic": "Primitive Types",
  "difficulty": "easy",
  "question": "List the 7 primitive types in JavaScript.",
  "answer": "string, number, bigint, boolean, undefined, symbol, null",
  "explanation": "...",
  "tags": ["primitives", "fundamentals"]
}

// multiple-choice (new questions can use this shape)
{
  "id": "types-mcq-001",
  "type": "multiple-choice",
  "topic": "Types",
  "subtopic": "Primitive Types",
  "difficulty": "easy",
  "question": "Which of these is NOT a primitive type?",
  "options": ["string", "symbol", "array", "bigint"],
  "answer": "array",
  "explanation": "...",
  "tags": ["primitives", "mcq"]
}
```

**MCQ grading**: shuffle `options` at render time, grade by `selectedOption === question.answer` (string equality, not index). This means reordering options never breaks correctness.

---

## 6. Leitner algorithm (srs.js detail)

```
Box intervals:
  1 → 0 ms     (immediate — stays in session queue)
  2 → 86400000   (1 day)
  3 → 259200000  (3 days)
  4 → 604800000  (7 days)
  5 → 1209600000 (14 days)

grade(state, isCorrect):
  if correct:
    newBox = min(state.box + 1, 5)
    return { ...state, box: newBox, nextDue: Date.now() + INTERVALS[newBox],
             lastReviewed: Date.now(), correctStreak: state.correctStreak + 1,
             totalSeen: state.totalSeen + 1 }
  if wrong:
    return { ...state, box: 1, nextDue: Date.now() + INTERVALS[1],
             lastReviewed: Date.now(), correctStreak: 0,
             totalSeen: state.totalSeen + 1 }
```

New cards (not in progressMap) are treated as box 1 / due now, same as training-ai's `drillEngine.ts:8-16`.

---

## 7. Session flow (phase machine)

```
Start screen
  ↓  user picks mode + filters, clicks Start
buildQueue()
  ↓  queue empty?
  ├─ YES → renderNothingDue
  └─ NO  → renderCard (phase: 'session')
             ↓  reveal card
             "Show answer" clicked
             ↓  renderRevealGrade (phase: 'self-rating')
             "Got it" / "Missed it"
             ↓  grade() + saveProgress() + advance()
             ↓  queue empty? → renderSummary : renderCard

             OR for MCQ card
             option clicked → auto-grade → renderMCQCard (highlighted state)
             "Next →" → grade() + saveProgress() + advance()
             ↓  queue empty? → renderSummary : renderCard
```

---

## 8. Filter UI design

Start screen has two rows of filter controls above the Start button.

**Row 1 — Mode toggle:** `[ Drill ]  [ SRS ]`
- Drill: all questions matching filters (shuffled, capped 15).
- SRS: only due-today cards matching filters.

**Row 2 — Filters (all optional, combinable):**
- `topic` select (All / values from data.json)
- `difficulty` select (All / easy / medium / hard)
- `type` select (All / reveal / multiple-choice)
- `tag` text input (free-text, matches any tag in `tags[]`)

Stats tiles update live as filters change so the user can see session length before starting.

---

## 9. Build order (MVP checklist)

Follow this sequence — each step is independently testable:

1. **Scaffold** — `npm create vite@latest js-drill -- --template vanilla`, copy `data/questions-types.json` to `data/data.json`.
2. **`storage.js`** — `loadProgress` / `saveProgress` / `clearProgress`. Test in console.
3. **`srs.js`** — `grade()`, `getDueCards()`, `computeStats()`. Pure functions; easy to unit-test.
4. **`session.js`** — `buildQueue()`, `advance()`. Test with mock data.
5. **`index.html` + `styles.css`** — static shell: start-screen skeleton, card placeholder, summary placeholder.
6. **`ui.js` — start screen** — filters wired to live stats display.
7. **`ui.js` — reveal flow** — show question → show answer + explanation → self-grade.
8. **`ui.js` — MCQ flow** — shuffled options → pick → highlight → Next.
9. **`ui.js` — summary + nothing-due screens.**
10. **`main.js`** — wire all modules: load → start screen → session loop → save.
11. **End-to-end smoke test** — drill 5 cards, answer mix of correct/wrong, confirm localStorage state is correct, confirm SRS mode shows only due cards.

---

## 10. Implementation notes

- **MCQ shuffle**: use Fisher-Yates in `ui.js` at render time, not in the data. Store shuffled order in a local variable; grade by value not position.
- **`\n` in questions**: use `question.replaceAll('\n', '<br>')` or `white-space: pre-wrap` on the card element. Code snippets in questions need this.
- **Filter live update**: attach `change` events to all filter inputs; on change call `computeStats()` with the filtered subset and re-render the stat tiles.
- **Nothing-due edge case**: SRS mode with strict filters may return an empty queue even when there are unstarted cards in other topics. Display a helpful message ("No cards due for this filter — try Drill mode to start new cards").
- **Reset button**: add a small "Reset progress" link on the start screen that calls `clearProgress()` and re-renders stats. Handy while building.
- **Vite config**: JSON imports work natively in Vite — no plugin needed. `assert { type: 'json' }` import assertion required in some Node versions; Vite handles it transparently.

---

## 11. What NOT to port from training-ai

- No React, no TypeScript, no CRA/webpack.
- No multi-deck registry (`modeConfig.ts` pattern) — single data file, single deck.
- No SM-2 ease factor — use Leitner fixed intervals only.
- No quiz mode (linear, one-shot, scored) — the spec scope is drill + SRS only for MVP.
- No `ProgressBar` component — a simple `X remaining` text label is sufficient.
