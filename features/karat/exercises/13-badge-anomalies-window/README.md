# Exercise 13: Badge Anomalies (Time Window)

## Question

Security wants to flag suspicious badge usage. You get an unordered list of
badge events as `[name, timestamp]` pairs (`timestamp` = minutes since the
building opened, as a **string** — parse it!).

Write a function `frequentBadgers(events, limit, windowMinutes)` that returns,
for every person who badged **`limit` or more times within any window of
`windowMinutes` minutes (inclusive)**, their name and the timestamps of the
**first** qualifying window.

Return a `Map<name, number[]>`. People who never qualify are absent.

### Example

```js
const events = [
  ['Curtis', '2'], ['Curtis', '51'], ['Curtis', '62'], ['Curtis', '187'],
  ['Raj', '10'], ['Raj', '100'],
]
frequentBadgers(events, 3, 60)
// => Map { 'Curtis' => [2, 51, 62] }   (62 − 2 = 60 → within the window, inclusive)
```

This extends the security-system family (exercise 07) with the time dimension —
the same two-layer shape Karat uses for "part 2 of 3": hash-map grouping, then
a sliding window per group.
