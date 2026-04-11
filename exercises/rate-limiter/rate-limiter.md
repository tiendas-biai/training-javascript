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

## Where you'll see this in the real world

- **GitHub API** — 5,000 requests/hour for authenticated users. The `octokit` client has built-in rate limiting that throttles your calls
- **Stripe API** — 100 requests/second in live mode. Stripe's Node SDK queues requests to stay under the limit
- **Bottleneck (npm)** — the most popular rate limiting library on npm, used by bots, scrapers, and API wrappers. Your exercise is a simplified version of it
- **Twitter/X API** — strict per-endpoint limits (e.g., 15 requests/15 minutes for search). Every Twitter bot uses rate limiting
- **Google Maps API** — 50 requests/second. Geocoding tools batch addresses and pace requests to avoid 429 errors
