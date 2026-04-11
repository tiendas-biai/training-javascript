# Promise.all

Implement your own version of `Promise.all`.

It takes an array of promises and:
- Resolves with an array of all results (in order) when every promise fulfills
- Rejects immediately with the first error if any promise rejects

```javascript
// Usage:
promiseAll([
  Promise.resolve(1),
  Promise.resolve(2),
  Promise.resolve(3),
]).then(results => console.log(results)); // [1, 2, 3]

promiseAll([
  Promise.resolve(1),
  Promise.reject(new Error('fail')),
  Promise.resolve(3),
]).catch(e => console.log(e.message)); // 'fail'
```

Write `promiseAll(promises)`. No using `Promise.all` — build it from scratch.

Hints:
- You'll need `new Promise` for this one — you're coordinating multiple promises
- Think about how to track which promises have resolved and maintain order
- What should happen with an empty array?

## Where you'll see this in the real world

- **Built into JavaScript** — `Promise.all` is a native method used everywhere. You're building it from scratch to understand how it works
- **React Server Components** — Next.js uses `Promise.all` to fetch multiple data sources in parallel before rendering a page
- **GraphQL resolvers** — Apollo Server and GraphQL Yoga resolve multiple fields in parallel using `Promise.all` under the hood
- **API aggregation** — BFF (Backend for Frontend) layers use `Promise.all` to fetch from multiple microservices and combine results into a single response
- **Test setup** — Jest and Vitest use it to run async setup hooks in parallel
