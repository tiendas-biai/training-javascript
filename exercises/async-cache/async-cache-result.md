# Async Cache - Solution

```javascript
function createAsyncCache(fn) {
    const cache = new Map();

    return function(key){
        if (!cache.has(key)){
            const value = fn(key);
            cache.set(key, value);
            value.catch(()=>{
                cache.delete(key);
            })
        }
        return cache.get(key);
    }
}
```

## How does the async cache pattern work?

`createAsyncCache(fn)` returns a wrapper function that stores promises in a `Map`, keyed by the argument. The first call for a given key runs `fn(key)` and caches the promise. Every subsequent call returns that same cached promise without calling `fn` again.

### Step-by-step trace

Imagine two concurrent calls for `'alice'`, then a later call for `'bob'`:

```
cached('alice')  → cache is empty → calls fn('alice'), stores promise, returns it
cached('alice')  → cache has 'alice' → returns the SAME promise (no second fn call)
cached('bob')    → cache has no 'bob' → calls fn('bob'), stores promise, returns it
```

Both `cached('alice')` calls get the exact same promise object — this is how in-flight deduplication works.

### Why cache the promise, not the resolved value?

This is the key insight. If you cached the resolved value, you'd need to `await` the result before storing it. That means a second call arriving while the first is still in-flight would see an empty cache and fire `fn` again — no deduplication.

```javascript
// This does NOT deduplicate:
if (!cache.has(key)) {
    const result = await fn(key);  // second call arrives here while we're waiting
    cache.set(key, result);
}

// This DOES deduplicate:
if (!cache.has(key)) {
    cache.set(key, fn(key));  // promise is cached immediately, before it resolves
}
```

By caching the promise itself, the entry exists in the map **synchronously** — before `fn` has even finished. Any concurrent call sees it and gets the same promise.

### Why no `async` on the wrapper function?

If you mark the wrapper as `async`, every call returns a **new** promise (the async wrapper), even when returning the same cached promise inside. This breaks reference equality:

```javascript
// With async:
return async function(key) {
    // ...
    return cache.get(key);  // async wraps this in a NEW promise every time
}

const p1 = cached('alice');
const p2 = cached('alice');
p1 === p2  // false — two different wrapper promises
```

Without `async`, `cache.get(key)` returns the original promise directly, so `p1 === p2` is `true`.

### How does the rejection cleanup work?

```javascript
cache.set(key, value);
value.catch(() => {
    cache.delete(key);
});
```

We cache the promise immediately (needed for dedup), but attach a `.catch()` that removes the entry if it fails. This means:

```
cached('alice')  → fn rejects → .catch fires → cache.delete('alice')
cached('alice')  → cache is empty again → retries fn('alice')
```

Two in-flight calls to the same key still share the same promise (and both see the rejection). But after the rejection settles, the cache entry is gone, so the next call retries.

### Why not check for rejection synchronously?

A common mistake is trying to check the error before caching:

```javascript
const value = fn(key);
let rejected;
value.catch(() => { rejected = true; });
if (!rejected) {           // always runs before .catch callback
    cache.set(key, value);
}
```

This doesn't work because `.catch()` callbacks are **asynchronous** — they run after the current synchronous code finishes. The `if (!rejected)` check always sees `undefined`, so the entry is always cached.

## Mental model

Think of it like a shared taxi queue at an airport:

- **`cache`** = the queue board listing rides in progress
- **`key`** = the destination
- **`fn(key)`** = dispatching a taxi to that destination
- **First person going to "downtown"** = a taxi is dispatched, "downtown" goes on the board
- **Second person going to "downtown"** = sees it on the board, shares the same taxi (same promise)
- **Taxi breaks down (rejection)** = "downtown" is removed from the board, next person triggers a new taxi
- **Someone going to "airport"** = different destination, different taxi, independent entry