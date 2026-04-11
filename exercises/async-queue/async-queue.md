# Async Queue

Implement an `AsyncQueue` class — a queue where you can **dynamically add** tasks and they execute with a concurrency limit.

Unlike `promisePool` where all tasks are known upfront, here tasks arrive over time. The queue starts processing immediately and keeps going as new tasks are added.

```javascript
// Usage:
const queue = new AsyncQueue(2); // concurrency of 2

// Add tasks at any time — they return a promise with the result
const p1 = queue.enqueue(() => fetch('/api/1'));
const p2 = queue.enqueue(() => fetch('/api/2'));
const p3 = queue.enqueue(() => fetch('/api/3')); // waits — 2 already running

const result1 = await p1;
const result3 = await p3; // resolves when its turn comes and it completes
```

Write the `AsyncQueue` class. It should:
- Constructor takes `concurrency` — max number of tasks running at once
- `enqueue(fn)` — adds a task function and returns a promise that resolves/rejects with the task's result
- Tasks run in the order they were enqueued
- When a running task finishes, the next queued task starts automatically
- If concurrency isn't full, the task starts immediately when enqueued

Hints:
- Each `enqueue` call needs to return a promise — but who controls when it resolves?
- Think about storing the resolve/reject functions alongside the task
- You need to track how many tasks are currently running

## Where you'll see this in the real world

- **Bull / BullMQ** — the most popular job queue for Node.js (used by Shopify, Mozilla, Autodesk). Workers pull jobs from a Redis-backed queue with concurrency control — exactly this pattern, but distributed
- **p-queue (npm)** — a popular in-memory async queue. Used by tools that need to dynamically add tasks at runtime, unlike promise pool where all tasks are known upfront
- **RTK Query (Redux Toolkit)** — queues API requests and manages in-flight deduplication. When multiple components request the same endpoint, the requests are queued and deduplicated
- **Puppeteer/Playwright test runners** — test frameworks queue browser test tasks and run N at a time, dynamically adding more as test files are discovered
- **Message queues (RabbitMQ, SQS)** — the server-side equivalent. Producers enqueue messages, consumers process them with concurrency limits. Your AsyncQueue is the in-memory version of this architecture
