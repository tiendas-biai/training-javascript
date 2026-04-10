# Rate Limiter

Implement `rateLimitedExecute(tasks, maxPerWindow, windowMs)` — it runs async tasks but ensures no more than `maxPerWindow` tasks **start** within any rolling window of `windowMs` milliseconds.

Unlike `batchExecute` which waits for the whole batch to finish, here you just control **how often** tasks are launched. A task can still be running while new ones start — you're limiting the *start rate*, not the concurrency.

```javascript
// Usage:
const tasks = [
  () => fetch('/api/1'),
  () => fetch('/api/2'),
  () => fetch('/api/3'),
  () => fetch('/api/4'),
  () => fetch('/api/5'),
];

// Start at most 2 tasks per 1000ms window
rateLimitedExecute(tasks, 2, 1000)
  .then(results => console.log(results)); // [result1, result2, result3, result4, result5]

// Timeline:
// t=0ms:    start task 0, start task 1 (2 started, window full)
// t=1000ms: start task 2, start task 3 (new window, 2 more)
// t=2000ms: start task 4 (new window, 1 more)
```

Write `rateLimitedExecute(tasks, maxPerWindow, windowMs)`. It should:
- Start at most `maxPerWindow` tasks per `windowMs` milliseconds
- Return all results in order
- Reject if any task fails
- `tasks` is an array of **functions** that return promises

Hints:
- You already know how to make a `sleep` function
- Think about when you need to wait: only after starting `maxPerWindow` tasks
- The tasks themselves can overlap — you're limiting starts, not active tasks
