# Exercise 05 — Teleporters

## What it does

Simulates every possible die roll from the starting square and collects the
distinct squares the player could land on after at most one teleport.

## Key concepts

### Index the teleporters

```js
const teleMap = new Map()
for (const t of teleporters) {
  const [from, to] = t.split(',').map(Number)
  teleMap.set(from, to)
}
```

Parsing the `"from,to"` strings into a `Map` once gives O(1) "is there a
teleporter on this square?" lookups during the roll loop.

### Enumerate the rolls

```js
const moves = new Set()
for (let roll = 1; roll <= dieSides; roll++) {
  let next = startPos + roll
  if (next > lastSquare) next = lastSquare   // clamp overshoot
  if (teleMap.has(next)) next = teleMap.get(next) // one teleport
  moves.add(next)
}
```

A `Set` collects the results, deduplicating squares that multiple rolls reach.

## Implementation notes

- **Clamp before teleporting.** Overshoot is resolved first (stop on
  `lastSquare`), and only then do we check for a teleporter on the resting
  square.
- **Exactly one teleport.** We apply at most a single `teleMap` lookup per roll;
  we never loop teleporters, so chained teleporters (`3→8→9`) only take the first
  hop.

## Things to watch out for

- **Order of clamp vs. teleport.** Teleporting before clamping would let a player
  warp from a square beyond the board. Clamp first.
- **Chaining.** The single-teleport rule is the subtle part: landing on `3` with
  `'3,8','8,9'` ends on `8`, not `9`.
- **Deduplication is required.** Different rolls (and teleporters) routinely land
  on the same square; the `Set` keeps the output distinct.
