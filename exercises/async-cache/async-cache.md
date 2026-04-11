# Async Cache

Implement `createAsyncCache(fn)` — it wraps an async function so that:
1. The first call executes `fn` and caches the result
2. Subsequent calls return the cached result without calling `fn` again
3. If `fn` is called again **while the first call is still in flight**, it returns the same promise (no duplicate calls)

This pattern is everywhere in real-world code: API clients, data loaders, React Query, SWR — all deduplicate in-flight requests.

```javascript
// Usage:
const cachedFetch = createAsyncCache((userId) => {
    console.log('fetching...');
    return fetch(`/api/users/${userId}`).then(r => r.json());
});

const p1 = cachedFetch('alice');  // logs "fetching..." — makes the request
const p2 = cachedFetch('alice');  // no log — returns the SAME promise as p1
const p3 = cachedFetch('bob');    // logs "fetching..." — different key, new request

console.log(p1 === p2); // true — literally the same promise object

const [alice1, alice2, bob] = await Promise.all([p1, p2, p3]);
console.log(alice1 === alice2); // true — same result
```

Write `createAsyncCache(fn)`. It should:
- Return a function that accepts a single **string key** argument
- First call for a key: execute `fn(key)` and cache the promise
- Later calls for the same key: return the cached result (don't call `fn` again)
- While `fn(key)` is still running: return the same in-flight promise (dedup)
- Different keys should cache independently
- If `fn(key)` rejects, **don't cache the failure** — the next call should retry

Hints:
- Where do you store the cache? Think about closures
- What do you cache — the result, or the promise?
- Think about the rejection case carefully: when do you remove from the cache?

## Where you'll see this in the real world

- **React Query / TanStack Query** — the core of React Query is an async cache. When two components request the same data, only one fetch happens. The second component gets the cached promise
- **SWR (Vercel)** — "stale-while-revalidate" is built on this pattern. It serves cached data instantly while revalidating in the background
- **Apollo Client (GraphQL)** — Apollo's normalized cache deduplicates in-flight queries. If two components query the same data at the same time, one network request is made
- **DataLoader (Facebook)** — used in GraphQL servers to batch and cache database lookups within a single request. Prevents the N+1 query problem
- **Node.js `require()`** — Node's module system caches modules after the first `require()`. The second `require('express')` returns the cached module, not a new execution
