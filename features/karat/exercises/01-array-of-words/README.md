# Exercise 01: Array of Words

## Question

Write a function `firstWord(words, note)` that:

- Takes an array of `words` and a string `note`.
- Returns the **first** word (in array order) that can be spelled using only
  the letters available in `note`.
- Each letter in `note` may be used **at most as many times as it appears**
  there (it is a budget, not an infinite supply).
- Returns `'-'` if no word qualifies.

### Examples

```js
firstWord(['baby', 'cat'], 'act')    // => 'cat'
firstWord(['baby', 'cat'], 'tab')    // => '-'
firstWord(['coco', 'cocoa'], 'coco') // => 'coco'
firstWord(['hello', 'world'], 'hlelo') // => 'hello'
firstWord(['abc', 'def'], 'fed')     // => 'def'
```
