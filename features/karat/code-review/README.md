# Block 1 practice — code review drills

Karat's first block shows you a block of messy-but-working code and asks four
standard questions (reported almost verbatim by everyone who took it):

1. **Explain this code in plain English, then explain it technically.**
2. **What errors, mistakes or bad practices do you see?**
3. **What would you do differently / how would you refactor this?**
4. **Point out any maintainability or security risk you find.**

Each folder here contains one realistic bad snippet (`<name>.js`) and a model
answer (`REVIEW.md`). The scenarios mirror the ones colleagues reported:

| Folder | Scenario | Main planted issues |
|---|---|---|
| `01-reverse-sentence/` | reverse a sentence fetched from SQL (the classic) | SQL injection, hardcoded creds, ignored errors, swap-loop readability |
| `02-mini-api/` | small Express API | eval, secrets, no validation, sync fs, swallowed errors |
| `03-bank-account/` | account balance operations | check-then-act race, float money, silent catch |
| `04-reservations/` | reservation store | map keyed by mutable data (the Java HashMap trap, JS edition) |

## How to practice

1. Open the `.js` file cold — do **not** read `REVIEW.md` first.
2. Start a 10-minute timer.
3. Answer the four questions **out loud**, in order, as if the interviewer were
   listening. Follow the drill from the app's `karat-cr-018` card:
   plain English → technical walk → issues (bugs → practices → security →
   maintainability) → refactor plan.
4. Compare against `REVIEW.md`. Anything you missed, say out loud once more —
   verbalizing is what makes it stick for the real session.
5. Re-run each snippet a few days later; the goal is that the *categories*
   (injection? secrets? races? unstable keys? swallowed errors?) become a
   checklist you walk automatically.

The snippets run (`node 01-reverse-sentence/reverseSentence.js`) so you can
also demonstrate the bugs to yourself where the REVIEW points them out.
