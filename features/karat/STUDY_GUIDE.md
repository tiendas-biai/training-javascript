# Karat study guide

The reference doc: what happens in the hour, how to answer each block, and the
checklists to internalize. Sources linked at the bottom and in `PLANNING.md`.

## 1. Anatomy of the hour

| Phase | Time | What happens |
|---|---|---|
| Intro | ~5 min | Interview Engineer confirms role/level, explains format. No behavioral questions. |
| Knowledge / discussion | ~10–15 min | Short conceptual + scenario questions. Keep answers to 30–60 seconds. |
| Coding | ~40–45 min | Up to 3 parts in a shared browser IDE with runnable test cases. |

- Pass bar (widely reported): **~2 of 3 coding parts complete with tests
  passing**. Partial credit exists for narrated pseudocode.
- The session is **recorded**; the interviewer writes an evidence-based report,
  and the client company applies its own bar.
- Most engagements include a **free redo** within days — better attempt counts.
  Treat attempt one as a scored rehearsal.

## 2. Block 1 — code review

The four questions, always in this order (reported verbatim):

1. *Explain this code in plain English, then explain it technically.*
2. *What errors, mistakes or bad practices do you see?*
3. *What would you do differently / how would you refactor this?*
4. *Point out any maintainability or security risk.*

**The method (drill card `karat-cr-018`):** plain-English outcome (1–2
sentences, no jargon) → technical walk (data flow, structures; trace one
example through any index arithmetic) → issues in fixed severity order →
refactor plan (top 2–3 changes + payoff). Never read silently more than ~20
seconds without saying something.

**The issue checklist (walk it every time):**

- **Bugs first:** crashes on empty/missing data? wrong result? unchecked
  `err` / missing `await` / try-catch that can't fire? check-then-act races?
  float money math? map keyed by mutable data / object identity?
- **Bad practices:** swallowed errors (`catch {}`), `var`, `==`, magic
  numbers, cryptic names, global mutable state, results printed instead of
  returned, sync fs in handlers.
- **Security:** SQL injection (string-concatenated queries → parameterized),
  hardcoded secrets (env vars / secrets manager; git history means rotate),
  `eval`/`new Function`/`exec` on input (RCE), unvalidated input (schema
  validation, allow-lists, size limits, mass assignment), secrets echoed in
  responses/logs.
- **Maintainability:** god functions (split along seams; pure logic vs I/O),
  duplication, no tests around business rules, mixed concerns.

**Practice:** the four snippets in `code-review/` with model answers.

## 3. Block 2 — live coding

**Priorities, in order: correct → complete → clear → fast.** The graded
outcome is passing the provided tests; complexity is a follow-up question, so
know the answer ("O(W·S) time, O(S) space" in the problem's own variables)
even when you skip the optimization.

**Pattern map (exercise → pattern → key gotcha):**

| Exercise | Pattern | Gotcha |
|---|---|---|
| 01 array-of-words | frequency map (budget) | counts, not presence — `'coco'` needs two c's |
| 02 word-wrap | greedy line packing | the `+1` separator; flush the last line |
| 03 robots | parse + Map of Sets | check *which* parts, not how many |
| 04 radio-songs | two-sum complement map | check **before** insert (all-3:30 catalog) |
| 05 teleporters | simulation + Set | clamp at N first; exactly ONE teleport hop |
| 06 shopping-list | transitions vs distinct Set | naive counts *changes*, not products |
| 07 security-system | inside-Set state machine | merge end-of-log stragglers into the answer |
| 08 social-network | adjacency Map of Sets | mirror BOTH endpoints; 0-connection users still count |
| 09 highway | per-plate open/closed flag | guard unmatched EXITs; reset on close |
| 10 restaurant | key by immutable id | mutable-derived keys orphan entries |
| 11 campground | next-stop map + simulate | `Number()` the durations; strict `<` for ties |
| 12 meeting-rooms | sweep line (+1/−1 events) | ends before starts at equal times |
| 13 badge-anomalies | grouping + sliding window | sort per person; inclusive boundary |
| 14 inventory-orders | check-then-commit | aggregate repeated SKUs before checking |

**Recurring mechanics worth over-learning:** parse stringly input at the
boundary (`Number()`, `split`), numeric sort comparators
(`(a,b) => a - b`, compound `b[1]-a[1] || a[0].localeCompare(b[0])`),
`Map`/`Set` idioms (`(m.get(k) ?? 0) + 1`, lazy `ensure`), and walking the
provided test cases out loud before running.

## 4. Knowledge section — one-minute answers

Template: definition → key trade-off → one example → **stop**. If unknown:
say so immediately, bridge to the nearest thing you know. Scenario questions
want a *diagnostic order*, not a tool name.

Drilled in the app (Domain Knowledge topic): cookies vs localStorage (and the
HttpOnly/XSS/CSRF asymmetry), REST vs GraphQL, the event loop (single-threaded
for your code, not for I/O), HTTP caching (freshness vs validation, ETag/304),
SQL vs NoSQL, idempotency (+ keys for retried POSTs), N+1 (join/batch/
DataLoader), offset vs cursor pagination.

## 5. Do / don't

- **Do narrate constantly** — restate the problem, announce data structures
  with the *why*, think out loud at forks. Announced silence ("30 seconds to
  write this loop") is fine; dead air is the one unrecoverable mistake.
- **Do run tests early and often** — skeleton first, grow it green.
- **Do ask spec questions** — delimiters in names? inclusive boundaries?
  ties? They're scored as communication.
- **Don't gold-plate part 1** — finish it, bank the time for part 2.
- **Don't open with the clever solution** — the obvious Map/Set/sort version
  you can write without thinking is the one that leaves time for part 3.
- **Don't bluff the knowledge section** — a fast honest gap costs one
  question; a bluff invites the follow-up that exposes it.
- **After any attempt:** write down every question immediately (that's how
  the xlsx this prep is built on came to exist).

## Sources

- https://karat.com/candidate-experience/
- https://karat.com/karat-interview-questions-explained/
- https://www.interviewdb.io/guides/karat-interview-guide
- https://gaijineer.co/how-to-prepare-well-for-karat-coding-interview
- https://codejeet.com/blog/how-to-crack-karat-coding-interviews
- https://www.vervecopilot.com/interview-questions/top-30-most-common-karat-interview-questions-you-should-prepare-for
- https://devin-rosario.medium.com/complete-guide-mastering-the-walmart-global-tech-karat-interview-007de66e2d29
