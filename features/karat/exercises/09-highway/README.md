# Exercise 09: Highway

## Question

You are given a chronological list of toll-booth log entries. Each entry is an
object `{ license_plate, booth_type }`, where `booth_type` is `"ENTRY"` or
`"EXIT"`.

Write a function `countJourneys(logEntries)` that returns the number of
**completed journeys**. A journey completes when a car that currently has an open
`ENTRY` records an `EXIT`.

Rules:

- An `EXIT` with no open `ENTRY` for that plate is ignored.
- A second `ENTRY` before an `EXIT` does **not** start a second journey — the car
  is simply still considered inside.

### Examples

```js
countJourneys([
  { license_plate: 'A', booth_type: 'ENTRY' },
  { license_plate: 'A', booth_type: 'EXIT' },
]) // => 1

countJourneys([
  { license_plate: 'A', booth_type: 'ENTRY' },
  { license_plate: 'A', booth_type: 'ENTRY' },
  { license_plate: 'A', booth_type: 'EXIT' },
]) // => 1
```
