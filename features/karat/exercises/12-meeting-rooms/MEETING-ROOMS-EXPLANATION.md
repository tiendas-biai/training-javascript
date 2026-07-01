# Exercise 12 — Meeting Rooms

## What it does

Computes the minimum number of rooms as the peak number of meetings running
at the same moment, using a sweep line over start/end events.

## Key concepts

### The reframing

You never assign rooms. If at some instant k meetings are running, you need at
least k rooms; and k rooms always suffice (any free room takes the next
meeting). So **min rooms = max simultaneous meetings** — say this before
coding; it's the insight the problem is testing.

### Events + sweep

```js
events.push([start, +1])
events.push([end, -1])
events.sort((a, b) => a[0] - b[0] || a[1] - b[1])
```

Each meeting becomes two timeline events. Sorting lets a single pass maintain
"meetings in progress" with a running counter; its historical maximum is the
answer.

### The tie-break carries the semantics

`|| a[1] - b[1]` puts `-1` (end) before `+1` (start) at equal times — a room
freed at 10:00 hosts a meeting starting at 10:00. Flip that ordering and
`[[10,20],[20,30]]` wrongly answers 2. When intervals are inclusive on both
ends (rare), you'd flip it deliberately — the comparator is where that spec
detail lives.

## Things to watch out for

- **Peak, not total.** Three meetings chained `[0,10],[5,15],[10,20]` never
  exceed two at once. The counter/max structure gets this right for free.
- **Don't sort meetings by start and count "overlaps with previous"** — that
  only compares neighbors and undercounts stacked intervals.
- **Complexity:** O(n log n) for the sort, O(n) sweep, O(n) space for events.
  The two-pointer variant (sort starts and ends separately) is equivalent —
  offer it if asked for an alternative.
