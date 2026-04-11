# Promise.allSettled

Implement your own version of `Promise.allSettled`.

It takes an array of promises and **always resolves** — never rejects. It waits for every promise to finish (resolve or reject) and returns an array describing the outcome of each one.

```javascript
// Usage:
promiseAllSettled([
  Promise.resolve('ok'),
  Promise.reject(new Error('fail')),
  Promise.resolve(42),
]).then(results => console.log(results));
// [
//   { status: 'fulfilled', value: 'ok' },
//   { status: 'rejected', reason: Error('fail') },
//   { status: 'fulfilled', value: 42 },
// ]
```

Write `promiseAllSettled(promises)`. It should:
- Wait for all promises to settle (resolve or reject)
- **Never reject** — always resolve with an array of result objects
- Each result is either `{ status: 'fulfilled', value }` or `{ status: 'rejected', reason }`
- Results must be in the same order as the input
- Handle non-promise values (treat them as fulfilled)
- Handle an empty array (resolve immediately with `[]`)
- Do NOT use `Promise.allSettled` — build it from scratch

Hints:
- Your `promiseAll` implementation is a good starting point — what needs to change?
- Think about what `.catch` should do differently here compared to `promiseAll`
- When do you know that all promises have settled? A promise that rejects has also "settled"

## Where you'll see this in the real world

- **Built into JavaScript** — `Promise.allSettled` is a native method (ES2020). You're building it to understand it
- **Batch notifications** — when sending push notifications to 1,000 users, some tokens might be invalid. You want to send to everyone and then report which ones failed, not stop on the first bad token
- **Health checks** — monitoring dashboards ping multiple services and display the status of each one. A failing database shouldn't prevent you from seeing that the cache is healthy
- **Data sync** — when syncing records between systems, you try all of them and log which ones failed for retry, rather than aborting the whole sync
- **Graceful shutdown** — Node.js servers use this pattern to close all connections during shutdown: `Promise.allSettled([closeDB(), closeRedis(), closeHTTP()])` — you want to attempt closing everything even if one fails
