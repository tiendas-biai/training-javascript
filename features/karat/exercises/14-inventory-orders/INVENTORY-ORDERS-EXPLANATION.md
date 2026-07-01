# Exercise 14 — Inventory Orders

## What it does

Parses the stringly inventory into a count map, then processes each order as a
tiny transaction: aggregate its demand, check every line read-only, and only
commit (decrement) when the whole order fits.

## Key concepts

### Check, then commit

```js
// CHECK — read-only:
if ((stock.get(sku) ?? 0) < qty) { ok = false; break }
// …
// COMMIT — only after ALL lines passed:
stock.set(sku, stock.get(sku) - qty)
```

Decrementing while checking corrupts stock the moment a later line fails —
order B then sees inventory that order A half-consumed and was rolled…
nowhere. Two small loops (check / commit) beat one clever loop with rollback
logic; rollback code is where interview bugs breed. Name the pattern: this is
a transaction in miniature.

### Aggregate the order's demand first

An order repeating a SKU (`[['apple', 4], ['apple', 4]]` against 6 apples) is
the planted trap: each line alone passes, the sum doesn't. Folding lines into
`Map<sku, totalQty>` before checking makes the check see true demand. The
test suite pins both directions (8 > 6 rejects, 3+3 ≤ 6 ships).

### Parse at the boundary

`'apple:5'` → `['apple', 5]` with `Number(qty)`, aggregating repeats
(`apple:5` + `apple:1` = 6). All interior logic then works with numbers —
the same reflex as the campground durations and badge timestamps.

## Things to watch out for

- **`(stock.get(sku) ?? 0)`** covers unknown SKUs — an order for `kiwi`
  rejects cleanly instead of comparing against `undefined`.
- **Sequential consumption is the spec:** earlier orders take stock from
  later ones; don't "optimize" by choosing which orders to ship.
- **Complexity:** O(inventory + total order lines) — every step is one map
  operation.
