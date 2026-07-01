# Exercise 01 — Array of Words

## What it does

Given a list of candidate words and a pool of available letters (`note`), it
returns the first word that can be assembled from those letters, respecting how
many times each letter is available. If nothing fits, it returns `'-'`.

## Key concepts

### Frequency map of the available letters

```js
const freqNote = new Map()
for (const c of note) {
  freqNote.set(c, (freqNote.get(c) || 0) + 1)
}
```

We count `note` **once** up front, not per word. This is what keeps the whole
algorithm linear instead of quadratic — every word is then checked against the
same precomputed budget.

### Checking a single word against the budget

```js
function canForm(word, freqNote) {
  const freqWord = new Map()
  for (const c of word) {
    const countInWord = (freqWord.get(c) || 0) + 1
    if (!freqNote.has(c) || countInWord > freqNote.get(c)) return false
    freqWord.set(c, countInWord)
  }
  return true
}
```

As we walk the word we track how many times we've needed each letter so far. The
moment that running count exceeds what `note` offers (or the letter isn't in
`note` at all), the word is impossible and we bail out immediately.

## Implementation notes

- **Early exit two ways.** `canForm` returns `false` on the first impossible
  letter, and `firstWord` returns on the first word that passes. No unnecessary
  work after a decision is made.
- **`note` is counted once.** Hoisting the `freqNote` build out of the word loop
  is the difference between O(n + m) and O(n · m).
- **`'-'` sentinel.** The spec uses the string `'-'` (not `null`/`undefined`) to
  signal "no match", so the function always returns a string.

## Things to watch out for

- **Letter counts matter, not just presence.** `'coco'` needs two `c`s and two
  `o`s; a naive `Set`-based "does note contain this letter" check would wrongly
  accept words that reuse a scarce letter. The running-count comparison is what
  enforces the budget.
- **Empty word.** An empty string trivially forms (the loop never runs and
  `canForm` returns `true`), so `firstWord([''], '')` returns `''`.
- **Don't mutate `freqNote`.** We compare against it read-only and build a
  separate `freqWord` per word, so checking one word never corrupts the budget
  for the next.
