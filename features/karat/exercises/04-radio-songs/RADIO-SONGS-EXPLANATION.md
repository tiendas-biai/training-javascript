# Exercise 04 — Radio Songs

## What it does

Finds two songs whose lengths total exactly seven minutes, in a single pass over
the list.

## Key concepts

### Complement lookup (the "two-sum" pattern)

```js
const complement = SEVEN_MINUTES - totalSeconds
if (seenByDuration.has(complement)) {
  return [song.title, seenByDuration.get(complement)]
}
seenByDuration.set(totalSeconds, song.title)
```

For each song we ask: *have we already seen a song that would complete the 7:00
total?* The `Map` of previously-seen durations turns that question into an O(1)
lookup, giving an overall O(n) solution instead of the O(n²) of checking every
pair.

### Parsing `"M:SS"`

```js
const [mins, seconds] = song.duration.split(':')
const totalSeconds = Number(mins) * 60 + Number(seconds)
```

Normalizing to total seconds makes the arithmetic trivial and avoids
minute/second carry bugs.

## Implementation notes

- **Store after checking.** We look for the complement *before* inserting the
  current song. This guarantees a song is never paired with itself — a song can
  only match something seen on an earlier iteration.
- **First match wins.** The function returns as soon as a pair is found; it does
  not enumerate all pairs.

## Things to watch out for

- **Self-pairing.** If you insert into the map before checking, a single `3:30`
  song would match its own complement (`3:30`) and report a bogus pair. Order
  matters.
- **String vs number math.** `mins * 60` works because `*` coerces, but `+ seconds`
  on a raw string would concatenate. Convert with `Number(...)` first.
- **Exact total only.** The target is exactly 420 seconds; `6:59` + `0:01` counts,
  `7:01` does not.
