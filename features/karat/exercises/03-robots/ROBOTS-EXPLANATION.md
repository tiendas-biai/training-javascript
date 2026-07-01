# Exercise 03 — Robots

## What it does

Groups the available parts by robot, then keeps the robots whose part set covers
every required part.

## Key concepts

### Group into a `Map<string, Set<string>>`

```js
const robots = new Map()
for (const item of parts) {
  const [robot, part] = item.split('_')
  if (!robots.has(robot)) robots.set(robot, new Set())
  robots.get(robot).add(part)
}
```

Each robot maps to the **set** of parts it owns. A `Set` naturally deduplicates
repeated parts and gives O(1) membership checks.

### Subset test

```js
if ([...required].every((p) => pieces.has(p))) result.push(robot)
```

A robot is buildable exactly when `required` is a subset of its parts — i.e.
every required part is present.

## Implementation notes

- **Insertion order is preserved.** JS `Map` iterates in insertion order, so the
  output respects "first-seen" ordering for free.
- **`required` is built once** as a `Set` from the comma-split string, then
  spread to an array only to drive the `.every(...)` check.

## Things to watch out for

- **Direction of the subset check.** We test that the robot has every *required*
  part — not that the robot's parts are all required. Reversing it would wrongly
  reject robots that happen to own extra parts.
- **Duplicate parts.** Listing `Optimus_leg` twice is harmless because parts are
  stored in a `Set`.
- **`split('_')` assumes single underscore.** Inputs follow the
  `"Robot_part"` shape; a part name containing `_` would need a different parse.
