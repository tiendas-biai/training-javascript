# Karat assessment — study plan

Prep hub for the Karat (karat.com) JavaScript/Node.js technical assessment.
Everything referenced here lives either in this folder or in the Dev Drill app.

## What the assessment looks like

Reconstructed from `karat_assesment.xlsx` (colleagues' first-hand reports) and
web research (links at the bottom):

- **~60 minutes**: brief intro → **10–15 min knowledge/discussion questions**
  → **40–45 min coding** in a browser IDE, up to 3 parts. The widely-reported
  pass bar: **complete ~2 of 3 parts with tests passing**.
- The interviewer is a trained Karat "Interview Engineer" following a script;
  the session is recorded; a free **redo** is usually offered (better attempt
  counts — confirm in your invite email).
- **Block 1 (code review)** — the interviewer pastes messy Node.js code and
  asks the same four questions every time:
  1. Explain this code in plain English, then technically.
  2. What errors, mistakes or bad practices do you see?
  3. What would you do differently / how would you refactor it?
  4. What maintainability or security risks do you see?
  Reported exhibits: sentence-reverse fed by a SQL query (swap algorithm +
  injection), a small Node project with DB connection and hardcoded config, a
  BankAccount class in a concurrent environment, a Reservation/HashMap
  mutable-key bug.
- **Block 2 (live coding)** — HackerRank-style; **completing the algorithm
  and passing the given test cases matters more than optimality**, but expect
  a complexity question afterwards. Reported problems are all in
  `exercises/01…11`; the recurring patterns: hash maps, sets, frequency
  counting, two-sum, sliding window, simulation, string parsing.

## What's here (and where)

| Material | Location | Use it for |
|---|---|---|
| **Karat Prep subject (62 cards, all with deep dives)** | Dev Drill app → "Karat Prep" tile | daily spaced-repetition drilling; Code Review (18), Coding Patterns (22), More Problems (8), Interview Format (6), Domain Knowledge (8) |
| **Block 1 practice snippets** | `code-review/01…04` + model `REVIEW.md`s | timed out-loud code-review rehearsal |
| **Block 2 exercises (reported)** | `exercises/01…11` | re-solving the actual reported problems |
| **Block 2 exercises (new, same style)** | `exercises/12…14` (CommonJS, Jest-runnable) | fresh problems you haven't memorized: sweep line, grouping+window, check-then-commit |
| **Reference guide** | `STUDY_GUIDE.md` | the four-question rubric, checklists, pattern map, tips |
| **Raw reports** | `karat_assesment.xlsx` | the original source |

## Suggested study order

1. **Understand the format** — read `STUDY_GUIDE.md` once; drill the
   *Interview Format* cards in the app until stable.
2. **Block 1** — drill the *Code Review* cards; then run the four
   `code-review/` snippets cold with a 10-minute timer each, answering the
   four questions **out loud**, and compare against the `REVIEW.md`s.
3. **Block 2, reported problems** — re-solve `exercises/01…11` from the
   README alone (don't peek at results), narrating constantly. Drill the
   *Coding Patterns* cards on the days between.
4. **Block 2, fresh problems** — solve `exercises/12…14` against their Jest
   suites (`npx jest features/karat/exercises/12-meeting-rooms/minRooms.test.js`
   etc.); drill the *More Problems* cards.
5. **Knowledge section** — drill the *Domain Knowledge* cards; practice
   answering each in under a minute, out loud.
6. **Dress rehearsal** — one full hour: 15 min of knowledge cards spoken +
   one code-review snippet + two exercises, in a plain editor, narrating.

## Sources

- Karat — the candidate experience: https://karat.com/candidate-experience/
- Karat — interview questions explained: https://karat.com/karat-interview-questions-explained/
- InterviewDB — the ultimate Karat interview guide: https://www.interviewdb.io/guides/karat-interview-guide
- Gaijineer — how to prepare well for the Karat coding interview: https://gaijineer.co/how-to-prepare-well-for-karat-coding-interview
- CodeJeet — how to crack Karat coding interviews: https://codejeet.com/blog/how-to-crack-karat-coding-interviews
- Verve — top 30 Karat interview questions: https://www.vervecopilot.com/interview-questions/top-30-most-common-karat-interview-questions-you-should-prepare-for
- Medium — mastering the Walmart Global Tech Karat interview: https://devin-rosario.medium.com/complete-guide-mastering-the-walmart-global-tech-karat-interview-007de66e2d29
- Glassdoor — Karat interview experiences: https://www.glassdoor.com/Interview/Karat-Interview-Questions-E1286154.htm
