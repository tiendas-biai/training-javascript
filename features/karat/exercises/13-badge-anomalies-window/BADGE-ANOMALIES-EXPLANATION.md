# Exercise 13 — Badge Anomalies (Time Window)

## What it does

Groups badge timestamps per person, sorts each person's list, and slides a
two-pointer window over it to find the first stretch of `limit`+ events within
`windowMinutes`.

## Key concepts

### Two independent layers

```js
// Layer 1 — group (the robots/highway move):
timesByName.get(name).push(Number(time))

// Layer 2 — per person, sliding window (the substring move):
while (times[right] - times[left] > windowMinutes) left++
if (right - left + 1 >= limit) { /* flagged */ }
```

Each layer is a pattern you already know; the composition is what Karat's
multi-part questions test. Solve and verify them independently — print the
grouped map before writing the window.

### Parse at the boundary

Timestamps arrive as strings (`'62'`). `Number(time)` happens once, in the
grouping loop — otherwise `times.sort()` without a comparator sorts
lexicographically (`'100' < '2'`) and every window is wrong. The numeric
comparator `(a, b) => a - b` is required even after parsing: default `sort`
stringifies.

### Window semantics

- **Inclusive boundary:** `62 − 2 = 60` counts as "within 60 minutes", so we
  shrink only while the span is `> windowMinutes` (strictly greater).
- **First window:** the window grows by one element per step of `right`, so
  the first time `right - left + 1 >= limit` holds, the window has exactly
  `limit` elements — `times.slice(left, left + limit)` is the evidence, and
  `break` moves on to the next person.

## Things to watch out for

- **Sort per person.** Even a globally-ordered log is only ordered per person
  by accident; state the assumption and sort each group.
- **Both pointers only move forward** — that's the O(m) argument for the
  window after the O(m log m) sort.
- **Off-by-one in the boundary:** `>=` vs `>` in the shrink condition flips
  the "exactly 60 apart" answer; the test suite pins the inclusive reading.
