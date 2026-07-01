# Exercise 07: Security System

## Question

A badged-access room records an ordered log of employees entering and exiting.
You are given that log as a list of `[employee, action]` entries, where `action`
is `"enter"` or `"exit"`. The room is **empty when the log begins**, and every
employee is required to leave before the log ends.

Write a function `mismatches(records)` that returns two collections (as a
two-element array):

1. All employees who **entered without a matching exit** — they recorded an
   enter with no corresponding exit (including re-entering while already inside,
   or still being inside when the log ends).
2. All employees who **exited without a matching enter** — they recorded an exit
   while not inside the room.

Each collection contains no duplicates, no matter how many times an employee
qualifies. Ordering within a collection does not matter.

### Examples

```js
mismatches([['Paul', 'enter'], ['Paul', 'exit']])
// => [[], []]

mismatches([['Paul', 'enter'], ['Paul', 'enter'], ['Paul', 'exit'], ['Paul', 'exit']])
// => [['Paul'], ['Paul']]

mismatches([
  ['Raj', 'enter'], ['Paul', 'enter'], ['Paul', 'exit'],
  ['Paul', 'exit'], ['Paul', 'enter'], ['Raj', 'enter'],
])
// => [['Raj', 'Paul'], ['Paul']]
```
