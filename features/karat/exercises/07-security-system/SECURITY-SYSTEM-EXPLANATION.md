# Exercise 07 — Security System

## What it does

Walks the badge log once, tracking who is currently inside, and flags the two
kinds of mismatch: an enter with no exit, and an exit with no enter.

## Key concepts

### A "currently inside" set as the source of truth

```js
const inside = new Set()
for (const [name, action] of records) {
  if (action === 'enter') {
    if (inside.has(name)) enterWithoutExit.add(name) // re-enter while inside
    else inside.add(name)
  } else if (action === 'exit') {
    if (inside.has(name)) inside.delete(name)
    else exitWithoutEnter.add(name)                  // exit while outside
  }
}
```

Membership in `inside` answers both questions:

- An **enter** while already inside means the *previous* enter never paired with
  an exit → enter-without-exit.
- An **exit** while not inside means there was no enter to pair with →
  exit-without-enter.

### The leftovers matter

```js
Array.from(new Set([...enterWithoutExit, ...inside]))
```

Anyone *still* in `inside` when the log ends also entered without exiting, so the
first collection is the union of the mid-log offenders and the final stragglers.

## Implementation notes

- **Sets dedupe for free.** Each collection is a `Set`, so repeated offenses
  collapse to a single entry automatically.
- **Single pass, O(n).** One walk of the log with O(1) set operations per entry.

## Things to watch out for

- **Don't forget the end-of-log stragglers.** A common bug is reporting only the
  re-entries and missing employees who simply never exited. Folding `inside` into
  the first collection covers them.
- **Re-entry is an offense, not a no-op.** Two enters then two exits for the same
  person is *both* an enter-without-exit and an exit-without-enter.
- **Order isn't guaranteed.** The result is assembled from sets, so callers must
  treat each collection as unordered.
