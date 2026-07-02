# Algorithms to study for Karat — and why

Extracted from the 14 exercises in `exercises/` (01–11 are the reported real
problems; 12–14 are same-style additions). Ordered by payoff: the top three
techniques appear in almost every exercise; the later ones in one or two.

Quick map — where each technique shows up:

| Technique | Exercises |
|---|---|
| Hash maps (frequency / lookup / grouping) | 01, 03, 04, 05, 06, 08, 09, 11, 13, 14 |
| Sets (membership, dedup, state) | 03, 05, 06, 07, 08 |
| Parsing at the boundary | 03, 04, 05, 09, 11, 13, 14 |
| One-pass state machines | 07, 09 |
| Two-sum / complement lookup | 04 |
| Sliding window | 13 (+ longest-unique-substring card) |
| Sweep line & intervals | 12 (+ merge-intervals card) |
| Greedy | 02 |
| Simulation | 05, 11 |
| Sorting + comparators | 12, 13 (+ top-K card) |
| Check-then-commit | 14 |
| Graphs (adjacency) | 08, 11 |

---

## 1. Hash maps — the Karat workhorse

**Study because:** 10 of the 14 exercises are, at their core, "put things in a
`Map` keyed by the right thing." Array-of-words (01) counts letters,
radio-songs (04) maps duration→title, robots (03) groups parts by robot,
shopping-list (06) maps product→department, social-network (08) maps
user→neighbors, highway (09) maps plate→state, campground (11) maps
origin→next-stop, badge-anomalies (13) maps name→timestamps, inventory (14)
maps sku→quantity. If you drill one thing, drill this.

**Theory.** A hash map gives O(1) average insert/lookup/delete by hashing the
key to a bucket. That turns "for each X, find its Y" from a nested O(n·m) scan
into a single O(n + m) pass: index one collection first, then look things up.
The design question is never "should I use a map" — it's **what is the key?**
Good keys are stable (immutable — see exercise 10) and are the thing you'll
*look up by*, not the thing you'll read out.

Three recurring shapes:

- **Frequency map** — count occurrences: letters in a note (01), song
  durations, word counts. The idiom:
  ```js
  const counts = new Map()
  for (const item of items) counts.set(item, (counts.get(item) ?? 0) + 1)
  ```
- **Index/lookup map** — precompute `key → data` once, query many times:
  `new Map(products)` in 06 (the Map constructor takes `[key, value]` pairs),
  duration→title in 04, origin→road in 11.
- **Grouping map** — `key → array/Set of members`: parts per robot (03),
  timestamps per person (13). The lazy-create idiom:
  ```js
  if (!groups.has(key)) groups.set(key, [])
  groups.get(key).push(member)
  ```

**Complexity to quote:** O(1) average per operation, O(n) to build, O(k) space
for k distinct keys.

**Pitfalls:** object keys compare by *reference*, not content (exercise 10 —
key by a primitive id); `'3'` and `3` are different keys (parse first!);
deriving a key from mutable fields orphans the entry.

---

## 2. Sets — membership, dedup, and "who's currently in"

**Study because:** security-system (07) is *entirely* a Set problem (who is
inside the room right now, plus deduped offender lists); robots (03) needs
"does this robot have part X" in O(1); teleporters (05) needs distinct
destinations; shopping-list (06) needs distinct departments; social-network
(08) needs each user's distinct neighbors (duplicate CONNECTs must not
double-count).

**Theory.** A `Set` is a hash map without values: O(1) `add` / `has` /
`delete`, and it silently ignores duplicates — which is a *feature* you design
with, not just a container. Three distinct jobs:

- **Membership testing** — `required.every(p => owned.has(p))` (03). An array
  `includes` does the same in O(n); the Set makes it O(1) and says "lookup" to
  the reader.
- **Deduplication for free** — "no duplicates in the output" (07) costs
  nothing when the collection *is* a Set. `new Set(array)` dedupes an array in
  one call; `set.size` counts distinct items (06's optimal visits).
- **Set-as-state** — `inside.has(name)` answers "is this person mid-episode?"
  — add on enter, delete on exit, and both mismatch types in 07 fall out of
  the membership check.

**Pitfalls:** Sets don't sort (iteration is insertion order); a Set loses
*counts* — the moment quantity matters (14's stock), switch to a
`Map<key, number>`; and remember to convert back (`[...set]`) when the answer
must be an array.

---

## 3. Parsing at the boundary (stringly-typed input)

**Study because:** Karat inputs are deliberately string-encoded — `'Optimus_leg'`
(03), `'3:41'` (04), `'3,1'` (05), `'210E'` inside a log line (09), duration
`'30'` (11), timestamp `'62'` (13), `'apple:5'` (14). The first minutes of
almost every problem are spent reshaping strings into numbers and structures,
and the classic silent bug lives here: `0 + '30' === '030'`.

**Theory.** Convert once, where the data enters, so the entire interior of
your program deals in real numbers and structures — never sprinkle
conversions at use sites. Know your tools precisely:

```js
const [robot, part] = s.split('_')          // destructure a 2-part split
const [m, sec] = d.split(':').map(Number)   // parse both halves at once
Number('30')      // 30      — strict: whole string must be numeric
Number('210E')    // NaN     — strict rejects trailing junk
parseInt('210E')  // 210     — lenient: reads the numeric prefix
s.slice(0, -1)    // all but last char  ('210E' → '210')
s.slice(-1)       // last char          ('210E' → 'E')
```

Also: default `array.sort()` compares *strings* (`'100' < '2'`), so sorting
parsed numbers needs `(a, b) => a - b` — the exercise-13 bug in waiting.

**Pitfalls:** `+` concatenates when either side is a string (no error, wrong
data); Map keys are type-sensitive (`get(3)` misses key `'3'`); choose
`Number` vs `parseInt` deliberately and say why.

---

## 4. One-pass state machines

**Study because:** security-system (07) and highway (09) are the same problem
wearing different clothes: walk an event log once, keep tiny per-entity state,
react to each event based on the current state. This shape ("logs with
paired open/close events") is a Karat favorite because it's real production
work — sessions, transactions, brackets.

**Theory.** The insight to internalize: you usually don't need to *match
pairs* — you need to know, at each event, **what state the entity is in**.
For 07 that's `inside: Set<name>`; for 09 it's `Map<plate, hasOpenEntry>`.
Each event either transitions the state or reveals an anomaly:

```js
// enter while inside  → previous enter never closed (07)
// exit while outside  → exit with no enter (07)
// EXIT with open flag → complete journey, close it (09)
// EXIT without flag   → ignore, nothing to close (09)
```

Two universal lessons from these exercises: **balanced counts prove nothing**
(Paul enter/enter/exit/exit balances and is guilty twice — pairing is
positional), and **the log's end is an event too** (whoever is still `inside`
at the end never exited — merge them into the answer).

**Complexity to quote:** O(n) time, one pass, O(entities) space.

---

## 5. Two-sum / complement lookup

**Study because:** radio-songs (04) is literally two-sum with `'M:SS'` parsing
— and two colleagues reported it word-for-word, Led Zeppelin catalog included.

**Theory.** To find a pair summing to a target, you don't need all pairs
(O(n²)) — for each element, the partner is fully determined: `target − x`.
Keep a map of what you've *already seen* and ask for the complement:

```js
const seen = new Map() // seconds → title
for (const song of songs) {
  const match = seen.get(TARGET - secs(song))
  if (match) return [match, song.title]
  seen.set(secs(song), song.title)   // insert AFTER checking
}
```

**Check-before-insert is the load-bearing detail:** the current element can't
match itself (it isn't in the map yet), but a true duplicate value pairs with
its earlier twin — which is exactly what the all-3:30 test case (`song_times_5`)
probes. The invariant to narrate: "the map only ever contains songs strictly
before the current one."

**Complexity:** O(n) time, O(n) space, versus O(n²)/O(1) brute force — say
the trade-off out loud.

---

## 6. Sliding window

**Study because:** badge-anomalies (13) needs "3+ badges within any 60-minute
window", and the longest-substring-without-repeats question (drilled in the
app's More Problems topic) is a top-frequency interview classic. Karat's
"part 2 of 3" often adds a time-window twist to a part-1 grouping problem —
exactly the 07→13 progression.

**Theory.** A sliding window maintains two pointers over a *sorted/ordered*
sequence such that the range between them always satisfies an invariant
("spans ≤ 60 minutes", "contains no repeats"). Advance `right` one step at a
time; when the invariant breaks, advance `left` just enough to restore it:

```js
let left = 0
for (let right = 0; right < times.length; right++) {
  while (times[right] - times[left] > windowSize) left++   // restore invariant
  if (right - left + 1 >= limit) { /* window qualifies */ }
}
```

Why it's O(n): **both pointers only ever move forward**, so each moves at most
n times total — that sentence *is* the complexity argument, use it. The
skill being tested is stating the invariant before coding; the bugs live in
the boundary (`>` vs `>=` decides whether "exactly 60 apart" counts — ask!)
and, in the last-seen-index variant, in moving `left` backwards (guard with
`Math.max`).

**Recognize it when:** the question says "within any window of K", "longest
run such that…", "at most/at least N inside a range".

---

## 7. Sweep line & intervals

**Study because:** meeting-rooms (12) is the canonical interval problem, and
merge-intervals is its sibling (both drilled in the app). Schedules, bookings,
and server-load questions are all this family.

**Theory.** Two moves cover the family:

- **Sort by start, then merge locally** (merge intervals): after sorting,
  an interval can only overlap its neighbors — one pass with a `current`
  block, extending with `Math.max(currentEnd, nextEnd)` (the `max` handles
  containment: [1,10] then [2,3] must not shrink the end).
- **Explode into events, then sweep** (min rooms): each interval becomes
  (start, +1) and (end, −1); sort all events; walk them with a running
  counter. The counter's peak = max simultaneous intervals = min rooms. The
  reframing to say first: *"you never assign rooms — you measure peak
  concurrency."*

The subtlety that changes answers is the **tie-break at equal timestamps**:
does an ending meeting free its room for one starting at the same instant?
Usually yes → sort ends before starts (`a[0] - b[0] || a[1] - b[1]` with
deltas −1/+1). State the assumption; it's one comparator character.

**Complexity:** O(n log n) sort + O(n) pass, both variants.

---

## 8. Greedy algorithms

**Study because:** word-wrap (02) — reported in at least three sessions — is a
pure greedy: each line takes as many words as fit, no lookahead, done.

**Theory.** Greedy = make the locally best choice and never revisit it. It's
the *right* answer only when the problem's structure guarantees local choices
can't hurt later ones — in word-wrap, the spec literally says "as many words
as possible per line", so taking the maximal prefix *is* the specification.
Contrast with the balanced-wrap variant (minimize raggedness), which needs
dynamic programming — knowing *which* variant you're in is the senior move.

The word-wrap mechanics to over-learn, because they're pure off-by-one
territory: the candidate length is `current.length + 1 + word.length` (the
+1 is the separator), and the final line must be flushed after the loop (the
single-word test case exists to catch exactly that).

**Recognize greedy when:** the spec itself says "as many/much as possible at
each step" and choices don't interact. Be suspicious when they do.

---

## 9. Simulation

**Study because:** teleporters (05) and campground (11) aren't solved by a
named algorithm at all — they're solved by *carefully executing the rules*.
Karat uses these to test spec reading: the grade lives in details like "only
one teleport per turn" and "overshoot stops at N".

**Theory.** When the input space is small and bounded (6 die faces; a handful
of linear routes), simulate every scenario directly instead of reaching for
graph theory. Discipline that keeps simulations correct:

- **Restate the rules in your own words before coding** and flag the
  load-bearing ones. In 05, the one-hop rule is also what makes teleporter
  *cycles* (`3→8→9→3`) terminate — a chained `while` loop hangs forever.
- **Order of operations matters:** clamp to N *first*, then check the
  teleporter (you can teleport off the last square).
- **Phase it:** in 11 — build the next-stop map, walk each car recording
  arrival times, then assign each person to the earliest car. Three
  independently debuggable phases beat one clever pass; under interview
  pressure, debuggability *is* speed.

Know when it escalates: "distinct squares in ONE roll" is simulation;
"minimum rolls to reach the end" is BFS. Saying that pivot out loud scores.

---

## 10. Sorting + custom comparators

**Study because:** meeting-rooms (12) sorts events with a tie-break,
badge-anomalies (13) sorts timestamps numerically, and top-K-frequent (app
card) needs a compound sort. Karat rarely asks you to *implement* a sort —
it asks you to *drive* one correctly.

**Theory.** `array.sort(cmp)` wants a number: negative = a first, positive =
b first, 0 = equal. The idioms to make automatic:

```js
arr.sort((a, b) => a - b)                            // numbers ascending
events.sort((a, b) => a[0] - b[0] || a[1] - b[1])    // by time, then delta
entries.sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
// count DESC, then word ASC — the top-K compound comparator
```

The `||` chain works because a comparator returning 0 means "tied so far,
consult the next criterion" — and `||` passes 0 along. Compound ordering
("sort by X, break ties by Y") is where these questions hide their
difficulty; practice until you write it without thinking.

**Pitfalls:** bare `sort()` compares as strings even on numbers —
`[100, 2, 30].sort()` gives `[100, 2, 30]` because `'100' < '2' < '30'`
lexicographically; returning booleans from a comparator breaks it silently
(comparators need numbers); `sort` mutates in place (copy with
`[...arr].sort()` if the input must survive).

---

## 11. Check-then-commit (transactional thinking)

**Study because:** inventory-orders (14) plants exactly this trap, and it's
the algorithmic twin of the BankAccount race-condition question from Block 1
— reviewers love candidates who connect the two.

**Theory.** When an operation must be **all-or-nothing** against shared state,
split it into a read-only *check* pass over every requirement and a *commit*
pass that runs only if all checks passed. Mutating while checking corrupts
state for everything that comes after the first failure — and rollback code
written under pressure is where bugs breed. Two small loops beat one clever
loop.

The second trap in 14: an order repeating a SKU across lines (4 + 4 apples
against 6) — each line alone passes, the sum doesn't. **Aggregate demand
before checking.** Same lesson at a different scale: check-then-act on shared
state is also the withdraw race (Block 1, `karat-cr-009`) — there the fix is
making check+act atomic in the database.

---

## 12. Graphs — as far as Karat goes

**Study because:** social-network (08) is a real graph problem (an undirected
graph under edge insertions/deletions), and campground (11) is a degenerate
graph (linear chains). Neither needs traversal algorithms — and knowing *why*
is the study point.

**Theory.** Represent a graph as an adjacency map: `Map<node, Set<neighbor>>`.
For 08, every event updates BOTH endpoints (connections are symmetric —
forgetting to mirror desynchronizes degrees), Sets make duplicate edges
idempotent, and the final answer only needs each node's **degree**
(`neighbors.size`) — no BFS/DFS at all. Users persist even when their edges
vanish: create nodes on first mention, delete edges, never nodes.

For 11, the spec sentence "each location leads to exactly one next location"
collapses the graph to chains — a plain `Map<origin, {dest, duration}>` walk,
no Dijkstra needed (all edge weights simply accumulate along one path).

**The takeaway:** read the spec for the sentence that *downgrades* the
problem. Karat problems look like graph theory and are usually bookkeeping.
Have BFS in your back pocket for the escalation follow-up ("shortest number
of rolls/hops"), but don't reach for it first.

---

## Suggested drilling order

1. **Hash maps + Sets + parsing** (§1–3) — they're in every problem; re-solve
   01, 03, 04, 06 until the idioms are automatic.
2. **State machines** (§4) — re-solve 07 and 09 in one sitting; they're the
   same shape.
3. **Sliding window + intervals + comparators** (§6, 7, 10) — solve 12 and 13
   fresh against their Jest suites.
4. **Two-sum, greedy, simulation** (§5, 8, 9) — 02, 04, 05, 11; focus on
   narrating the invariant/rules.
5. **Check-then-commit + graphs** (§11, 12) — 14 and 08; practice saying the
   "this is a transaction in miniature" / "the spec downgrades the graph"
   observations.

Each technique here has matching drill cards in the app's **Karat Prep**
subject (Coding Patterns + More Problems topics) with deep dives that expand
the theory — use this file to *understand*, the cards to *retain*.
