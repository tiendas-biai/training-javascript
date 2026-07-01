# Exercise 02: Word Wrap

## Question

Write a function `wrapLines(words, maxLen)` that:

- Takes an array of `words` and a maximum line length `maxLen`.
- Greedily packs words onto lines. Words on the same line are joined by a single
  hyphen (`-`), and that hyphen **counts toward the line length**.
- Starts a new line whenever adding the next word would make the line exceed
  `maxLen`.
- Always places a word on a line, even if that word alone is longer than
  `maxLen`.
- Returns the array of lines.

### Examples

```js
wrapLines(['a', 'b', 'c'], 5)            // => ['a-b-c']
wrapLines(['hello', 'world', 'foo'], 11) // => ['hello-world', 'foo']
wrapLines([], 5)                         // => []
wrapLines(['single'], 3)                 // => ['single']
```
