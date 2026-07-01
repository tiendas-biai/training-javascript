# Exercise 09 — Highway

## What it does

Scans the toll-booth log once, tracking whether each plate currently has an open
entry, and increments a counter each time an open entry is closed by an exit.

## Key concepts

### "Open entry" flag per plate

```js
const active = new Map() // plate -> is currently inside?
if (entry.booth_type === 'ENTRY') {
  active.set(plate, true)
} else if (entry.booth_type === 'EXIT') {
  if (active.get(plate)) {       // only count if there was an open entry
    journeys++
    active.set(plate, false)
  }
}
```

The `Map` records, per plate, whether the car is mid-journey. An exit only counts
when the flag is `true`, and it immediately flips back to `false` so the same
entry can't be closed twice.

## Implementation notes

- **Idempotent entry.** Setting `active.set(plate, true)` on a repeat `ENTRY` is a
  no-op for counting — the flag was already true — which is exactly the "don't
  start a second journey" rule.
- **Single pass, O(n).** One walk of the log with O(1) map operations.

## Things to watch out for

- **Unmatched exits.** An `EXIT` with no prior `ENTRY` (flag `undefined`/`false`)
  must be ignored, not counted. The `if (active.get(plate))` guard handles both
  the never-seen and the already-closed cases.
- **Reset on exit.** Forgetting to set the flag back to `false` would let a
  trailing duplicate `EXIT` over-count the journey.
- **Per-plate state.** Cars are independent; keying the flag by plate keeps one
  car's exit from closing another's journey.
