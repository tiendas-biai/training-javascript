# Model review — reservations

## 1. Plain English, then technical

**Plain English:** a restaurant stores the hour of each reservation and can
look it up later — but lookups mysteriously fail after a reservation is
edited, even though nothing was removed from the store.

**Technical:** the map key is *derived from mutable fields*
(`name + ':' + personCount`). Store computes `'Anton:2'`; after
`personCount = 4`, lookup computes `'Anton:4'` — a different key. The entry
still sits in the map under the old key (size stays 1): it is **orphaned**,
not deleted.

## 2. Errors, mistakes, bad practices

- **Key derivation from mutable state** — the single root cause.
- **Orphaned entries are also a memory leak**: every mutate-then-store cycle
  strands another unreachable entry; a long-running process grows forever.
- `var` inside `getReservationTime`; the `key()` method name hides that it's
  unstable.

## 3. Refactor

Key by the immutable identity — that's the whole fix:

```js
makeReservation(reservation, hour) {
  this.reservations.set(reservation.id, hour);
}
getReservationTime(reservation) {
  return this.reservations.get(reservation.id) ?? null;
}
```

The key computed at lookup time now always equals the key used at store time,
no matter what else changes. (`Map.get` returning `undefined` for unknown
keys gives the "never stored" case for free.)

## 4. Security & maintainability risks / the Java connection

- **This is the Java `hashCode`/`equals` trap, translated.** In the original
  Karat task, `Reservation` overrides `hashCode()` over mutable fields; a
  `HashMap` files the entry in a bucket chosen by the hash at insert time,
  and after mutation `get()` computes a different hash and searches the wrong
  bucket. The contract: **a key's hash must not change while it's in the
  map** — practically, hash only immutable fields.
- **The portable rule** (say it as the summary): *map keys, cache keys, dedup
  keys and hash inputs come from immutable identity only.* Any
  `set(deriveKey(obj), …)` where `deriveKey` reads a mutable field is a
  finding, even if nothing mutates yet.
- Maintainability: the failure is intermittent from the caller's viewpoint
  (only edited reservations vanish), which makes it expensive to diagnose —
  exactly why it makes a good interview exhibit.
