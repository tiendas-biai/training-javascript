# Exercise 10 — Restaurant

## What it does

Stores reservation times in a `Map` keyed by a value that never changes — the
reservation's `id` — so lookups keep working after the object's mutable fields
are modified.

## The bug this exercise is about

The naive approach keys the map by something derived from the reservation's
mutable state, e.g.:

```js
hash() { return `${this.id}-${this.name}` } // name is mutable!
this.reservations.set(reservation.hash(), hour)
```

Store the reservation, then mutate `name` (or `personCount`), and the recomputed
key no longer matches the stored one — `getReservationTime` returns `undefined`
even though nothing was deleted. This is the JavaScript echo of the classic
"**never derive a hash key from mutable fields**" rule (the `hashCode`/`equals`
contract in languages like Java).

## The fix

```js
makeReservation(reservation, hour) {
  this.reservations.set(reservation.id, hour) // immutable key
}
getReservationTime(reservation) {
  return this.reservations.get(reservation.id)
}
```

`id` is immutable, so the key computed at lookup time always equals the key used
at storage time, regardless of how the rest of the object changes.

## Things to watch out for

- **Key on identity, not data.** Anything that can change after insertion is
  unsafe as a map key. Use a stable identifier.
- **`undefined` for misses.** `Map.get` already returns `undefined` for an unknown
  key, which satisfies the "never stored" requirement for free.
- **Object references aren't keys here.** Even keying by the reservation object
  itself would work for lookups with the same reference, but the spec models a
  stable domain id — the robust, intention-revealing choice.
