# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Repo Is

A growing collection of JavaScript exercises covering various topics. Each exercise is a self-contained implementation challenge with tests. This is a **learning repo**, not a production application. Exercises are added incrementally — the current set covers async/Promise patterns, but the repo will expand to other areas (array methods, iterators, Big O notation, etc.).

## Commands

- **Run all tests:** `npm test`
- **Run a single exercise's tests:** `npx jest exercises/retry` (pass the folder name)
- **Run a specific test file:** `npx jest exercises/retry/retry.test.js`

Jest is the only dependency. No build step, no linting, no TypeScript.

## Exercise Structure

Each exercise lives in `exercises/<name>/` and contains:

- `<name>.md` — Problem description and real-world context
- `<name>.js` — Starter code with comments (or completed solution). Exports via `module.exports`.
- `<name>.test.js` — Jest tests using CommonJS `require`. Tests are the source of truth for correctness.
- `<name>-result.md` (some exercises) — Detailed solution walkthrough with step-by-step traces and explanations

One exercise (`promise-chain-recovery`) is theory-only: it has `questions.md` / `questions-result.md` with no code files.

## Conventions

- All code is CommonJS (`require` / `module.exports`), not ESM.
- No external runtime dependencies — exercises use only built-in JS/Node APIs (Promises, setTimeout, etc.).
- Tests use `jest.fn()` for mocking; no real network calls or I/O.
- `index.js` at the root is a standalone scratch file (retry example using fetch), unrelated to the exercises.
