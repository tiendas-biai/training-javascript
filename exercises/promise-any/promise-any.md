# Promise.any

Implement your own version of `Promise.any`.

It takes an array of promises and resolves with the value of the **first one that fulfills**. Rejections are ignored — unless ALL promises reject, in which case it rejects with an `AggregateError` containing all the rejection reasons.

This is the opposite of `Promise.all`: `all` fails on the first rejection, `any` succeeds on the first fulfillment.

```javascript
// Usage:
promiseAny([
  Promise.reject('a'),
  Promise.resolve('b'),
  Promise.resolve('c'),
]).then(result => console.log(result)); // 'b' — first to fulfill

promiseAny([
  Promise.reject('a'),
  Promise.reject('b'),
]).catch(err => {
  console.log(err instanceof AggregateError); // true
  console.log(err.errors); // ['a', 'b']
});
```

Write `promiseAny(promises)`. It should:
- Resolve with the first promise that **fulfills**
- Ignore individual rejections (keep waiting for others)
- Reject with `AggregateError(errors)` only if ALL promises reject
- `errors` array must be in the same order as the input
- Handle non-promise values (treat as fulfilled)
- Handle empty array (reject with `AggregateError` with empty errors)
- Do NOT use `Promise.any` — build it from scratch

Hints:
- This is structurally similar to `promiseAll`, but the logic is flipped
- In `promiseAll`, `.then` counts successes and `.catch` exits early. Here it's the opposite
- Look up `AggregateError` — it's a built-in class: `new AggregateError(errorsArray, 'message')`

## Where you'll see this in the real world

- **Built into JavaScript** — `Promise.any` is a native method (ES2021). You're building it to understand it
- **Fastest CDN selection** — ping multiple CDN endpoints and use whichever responds first. Cloudflare and Fastly use this approach for latency-based routing
- **Redundant API calls** — call the same data from multiple sources (primary DB + read replica + cache) and use whichever responds first. Useful for critical, latency-sensitive operations
- **DNS resolution** — DNS resolvers query multiple nameservers in parallel and use the first response
- **Service discovery** — in microservices, you might try multiple instances of a service and use the first one that responds, ignoring the ones that are overloaded or down
