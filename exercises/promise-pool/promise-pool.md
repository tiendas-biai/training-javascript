# Promise Pool

Implement `promisePool(tasks, concurrency)` — it runs async tasks with a concurrency limit.

Unlike `Promise.all` which runs everything at once, this ensures only `n` tasks run at the same time. When one finishes, the next one starts.

```javascript
// Usage:
const tasks = [
  () => fetch('/api/1'),
  () => fetch('/api/2'),
  () => fetch('/api/3'),
  () => fetch('/api/4'),
  () => fetch('/api/5'),
];

// Only 2 requests running at a time
promisePool(tasks, 2)
  .then(results => console.log(results)); // [result1, result2, result3, result4, result5]
```

Write `promisePool(tasks, concurrency)`. It should:
- Run at most `concurrency` tasks simultaneously
- Return all results in order
- Reject immediately if any task fails
- `tasks` is an array of **functions** that return promises (not promises themselves)

Hints:
- Think of it as workers picking up the next task from a queue
- Each "worker" runs tasks sequentially, but multiple workers run in parallel
- How many workers do you need?
