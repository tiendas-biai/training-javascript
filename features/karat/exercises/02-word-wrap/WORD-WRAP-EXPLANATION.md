# Exercise 02 — Word Wrap

## What it does

Lays words out across lines greedily, joining words on a line with `-` and
breaking to a new line as soon as the next word wouldn't fit within `maxLen`.

## Key concepts

### Greedy accumulation

```js
let line = ''
for (const word of words) {
  if (line.length === 0) { line = word; continue }
  const candidateLength = line.length + 1 + word.length
  if (candidateLength <= maxLen) line += '-' + word
  else { result.push(line); line = word }
}
if (line.length > 0) result.push(line)
```

We keep a running `line` string and only commit it to `result` when the next
word forces a break (or at the end). Greedy is optimal here because each line is
filled as much as possible before moving on.

## Implementation notes

- **The `+ 1` is the separator.** `candidateLength = line.length + 1 + word.length`
  accounts for the `-` that would be inserted. Forgetting it lets lines run one
  character over `maxLen`.
- **First word on a line is unconditional.** When `line` is empty we assign the
  word directly (no separator, no length check), which is what allows a word
  longer than `maxLen` to still be placed.
- **Flush the tail.** The final, partially built `line` is pushed after the loop;
  otherwise the last line would be lost.

## Things to watch out for

- **Empty input.** With no words, `line` stays `''` and the final `if` guard
  (`line.length > 0`) keeps it out of the result, yielding `[]`.
- **Off-by-one on the separator.** The most common bug is comparing
  `line.length + word.length` (no `+1`), which silently produces lines one char
  too long whenever they're packed tight.
- **Greedy, not balanced.** This does *not* minimize raggedness across lines
  (that's a harder DP problem); it simply fills each line as full as it can.
