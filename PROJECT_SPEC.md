# JS Drill — Project Spec

A self-study app for drilling JavaScript concepts. Supports a **drill mode** (loop through a filtered set) and a **spaced-repetition mode** (only what's due today). Question content lives in a single JSON file that grows over time; learning progress is tracked separately so the bank can grow without ever wiping your history.

This file is written as a brief for **Claude Code**. Drop it at the repo root. You can also rename it `CLAUDE.md` so Claude Code picks it up as persistent context automatically.

---

## 1. Goals & non-goals

**Goals**
- Two study modes: **Drill** (cram a filtered set) and **SRS** (spaced repetition, due cards only).
- Two question types: **reveal** (flashcard: show question → reveal answer → self-grade) and **multiple-choice** (pick an option → auto-graded).
- Content (`data/data.json`) is the single source of truth and is edited by hand (copy-paste).
- Progress survives across sessions and is **never** stored inside the content file.

**Non-goals (MVP)**
- No backend, no accounts, no sync across devices.
- No in-app question editor (you edit `data/data.json` directly for now).

---

## 2. Stack & key decisions

> These are sensible defaults. Change the stack line if you prefer React — the rest of the spec is framework-agnostic.

- **Build tool:** Vite (vanilla JS template). Zero-config, instant dev server.
- **Language:** vanilla JavaScript (ES modules). No framework for MVP.
- **Styling:** plain CSS (one `styles.css`).
- **Persistence:** `localStorage`, keyed by question `id`. Valid here because this is a standalone web app, not a Claude.ai artifact.
- **Data loading:** `import questions from '../data/data.json'` — Vite supports JSON imports natively, which keeps the file in the `/data` folder as desired.
- **SRS algorithm:** Leitner, 5 boxes (simple, debuggable). Can migrate to SM-2 later.

---

## 3. Repo structure

```
js-drill/
├── data/
│   └── data.json          # question bank (source of truth — paste questions here)
├── src/
│   ├── main.js            # entry point: load data + state, wire up UI
│   ├── srs.js             # Leitner scheduling: grade(), getDueCards(), nextInterval()
│   ├── storage.js         # localStorage wrapper for per-card progress
│   ├── session.js         # session logic: build queue for drill/srs, advance, summary
│   ├── ui.js              # render card, reveal flow, MCQ flow, filters, summary
│   └── styles.css
├── index.html
├── package.json
└── README.md
```

---

## 4. Data schema (`data/data.json`)

An array of question objects. Two shapes depending on `type`.

**Shared fields:** `id`, `topic`, `subtopic`, `difficulty` (`easy` | `medium` | `hard`), `question`, `answer`, `explanation`, `tags`.

**Type inference rule:** if `type` is absent, treat as `"reveal"`. If `options` is present, treat as `"multiple-choice"`. This keeps the existing 16 questions valid with no edits.

### reveal (default — flashcard)
```json
{
  "id": "types-prim-001",
  "type": "reveal",
  "topic": "Types",
  "subtopic": "Primitive Types",
  "difficulty": "easy",
  "question": "List the 7 primitive types in JavaScript.",
  "answer": "string, number, bigint, boolean, undefined, symbol, null",
  "explanation": "Anything that isn't one of these 7 is an object...",
  "tags": ["primitives", "fundamentals"]
}
```

### multiple-choice
```json
{
  "id": "types-mcq-001",
  "type": "multiple-choice",
  "topic": "Types",
  "subtopic": "Primitive Types",
  "difficulty": "easy",
  "question": "Which of these is NOT a primitive type?",
  "options": ["string", "symbol", "array", "bigint"],
  "answer": "array",
  "explanation": "Arrays are objects; the 7 primitives are string, number, bigint, boolean, undefined, symbol, null.",
  "tags": ["primitives", "mcq"]
}
```

**MCQ rule:** `answer` must be **exactly equal** to one of the strings in `options`. The UI shuffles `options` at render time and grades by string equality (not by index), so reordering options never breaks correctness.

---

## 5. Progress model (`storage.js`)

Per-card learning state, stored in `localStorage`. **Never** written into `data.json`.

- Storage key per card: `srs:{id}` (or one combined key `srs:all` holding a map — combined is fewer reads; pick one and be consistent).
- State per card:

```js
{
  box: 1,             // Leitner box, 1..5
  nextDue: 1718000000000,  // epoch ms; due when nextDue <= Date.now()
  lastReviewed: 1717900000000,
  correctStreak: 0,
  totalSeen: 0
}
```

- Cards with no stored state are treated as **new** (box 1, due now).
- Provide a `reset()` to clear all progress (handy while testing).

---

## 6. SRS algorithm (`srs.js`) — Leitner, 5 boxes

Box → interval before a card is due again:

| Box | Interval |
|-----|----------|
| 1   | same session / immediate |
| 2   | 1 day  |
| 3   | 3 days |
| 4   | 7 days |
| 5   | 14 days |

**Grading:**
- **Correct** → `box = min(box + 1, 5)`, `correctStreak++`, set `nextDue = now + interval(box)`.
- **Incorrect** → `box = 1`, `correctStreak = 0`, set `nextDue = now + interval(1)`.

Where "correct" comes from:
- **reveal cards:** the self-grade buttons ("I knew it" / "Missed it").
- **multiple-choice cards:** automatic — selected option equals `answer`.

`getDueCards(allCards, state)` returns cards where `nextDue <= Date.now()` (or new cards), used by SRS mode.

---

## 7. Modes & user flow

### Start screen
- Pick mode: **Drill** or **SRS**.
- Filters (combinable): `topic`, `subtopic`, `difficulty`, `tag`, `type`.
- Drill builds a queue from all cards matching the filters (optionally shuffled). SRS builds the queue from due cards matching the filters.

### Card flow — reveal
1. Show `question` (preserve `\n` line breaks — questions contain code snippets).
2. Button **Show answer** → reveals `answer` + `explanation`.
3. Buttons **I knew it** / **Missed it** → grade → SRS update → next card.

### Card flow — multiple-choice
1. Show `question` + shuffled `options` as buttons.
2. On click: highlight correct/incorrect, reveal `explanation`.
3. Auto-grade → SRS update → **Next** → next card.

### End of session
- Summary: cards reviewed, correct/incorrect count, how many are now scheduled for later.

---

## 8. Adding questions (your workflow)

`data/data.json` is the source of truth. To add questions, paste new objects into the array — that's it. The app reads the file on load. Keep `id`s unique (prefix by topic, e.g. `types-prim-009`). Because progress is keyed by `id` in `localStorage`, adding questions never disturbs existing progress.

*(Future enhancement: an in-app "add question" form with a "Download data.json" export button, so you can add without touching the file. Out of scope for MVP.)*

---

## 9. MVP checklist

- [ ] Vite vanilla project scaffolded; `data/data.json` imported.
- [ ] Load progress from `localStorage`; new cards default to box 1 / due now.
- [ ] Start screen with mode toggle + filters.
- [ ] Reveal flow (show answer → self-grade).
- [ ] Multiple-choice flow (shuffle options → auto-grade).
- [ ] Leitner grading + due-card scheduling.
- [ ] End-of-session summary.
- [ ] `reset()` to clear progress.

## 10. Future (post-MVP)
- In-app add/export of questions.
- Stats dashboard (accuracy by topic/tag, streaks).
- Keyboard shortcuts (space = reveal, 1/2 = grade, number keys = MCQ).
- "Gotchas only" mode using the `gotcha` tag.
- Export/import progress as JSON.

---

## 11. Getting started with Claude Code

Suggested first prompt once this file is at the repo root:

> "Read PROJECT_SPEC.md and scaffold the MVP: a Vite vanilla-JS app matching the repo structure in section 3. Implement `storage.js`, `srs.js` (Leitner per section 6), `session.js`, and `ui.js` (both reveal and multiple-choice flows per section 7). Import questions from `data/data.json`. Don't write progress into the content file. Stop after the MVP checklist in section 9 is met."

Then paste your question bank into `data/data.json` and run `npm run dev`.
