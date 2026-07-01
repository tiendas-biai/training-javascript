# Exercise 08: Social Network

## Question

You are analyzing a social network where connections are always **symmetrical**:
if Alice is connected to Bob, then Bob is connected to Alice.

You are given a chronological log of events, each of the form:

```js
['CONNECT', 'Alice', 'Bob']     // connects Alice and Bob
['DISCONNECT', 'Bob', 'Alice']  // disconnects them (order of users doesn't matter)
```

Write a function `grouping(events, count)` that replays the log and then splits
users by their number of connections. Return an object `{ less, more }` where:

- `less` — users with **fewer than** `count` connections
- `more` — users with **`count` or more** connections

Ordering within each group does not matter.

### Example

```js
const events = [
  ['CONNECT', 'Alice', 'Bob'],
  ['DISCONNECT', 'Bob', 'Alice'],
  ['CONNECT', 'Alice', 'Charlie'],
  ['CONNECT', 'Dennis', 'Bob'],
  ['CONNECT', 'Pam', 'Dennis'],
  ['DISCONNECT', 'Pam', 'Dennis'],
  ['CONNECT', 'Pam', 'Dennis'],
  ['CONNECT', 'Edward', 'Bob'],
  ['CONNECT', 'Dennis', 'Charlie'],
  ['CONNECT', 'Alice', 'Nicole'],
  ['CONNECT', 'Pam', 'Edward'],
  ['DISCONNECT', 'Dennis', 'Charlie'],
  ['CONNECT', 'Dennis', 'Edward'],
  ['CONNECT', 'Charlie', 'Bob'],
]

grouping(events, 3)
// => {
//   less: ['Alice', 'Charlie', 'Pam', 'Nicole'],
//   more: ['Dennis', 'Bob', 'Edward'],
// }
```
