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

## Where you'll see this in the real world

- **p-limit / p-pool (npm)** — the most popular concurrency libraries on npm. Used by tools like ESLint, Webpack, and npm itself to limit parallel operations
- **Database connection pools** — PostgreSQL's `pg-pool`, MySQL's connection pool, and Prisma's connection manager all work this way: a fixed number of connections (workers) pick up queries from a queue
- **Web scrapers** — Puppeteer and Playwright scripts limit concurrent browser pages to avoid running out of memory. Each "worker" is a browser tab processing URLs from a list
- **Image/file processing** — Sharp (image resizer) and ffmpeg wrappers use pools to limit CPU-intensive operations to the number of available cores
- **AWS Lambda fan-out** — when processing thousands of S3 objects, you limit concurrent Lambda invocations to avoid throttling
