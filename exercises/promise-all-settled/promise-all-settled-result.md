# Promise.allSettled - Solution

```javascript
function promiseAllSettled(promises) {

    return new Promise((resolve) => {
        let results = new Array(promises.length);
        let settled = 0;
        if (promises.length===0){
            resolve([]);
        }
        promises.forEach((promise,i)=>{
            Promise.resolve(promise).then((value)=>{
                results[i] = {status: 'fulfilled', value};
            }).catch((reason)=>{
                results[i] = {status: 'rejected', reason}
            }).finally(()=>{
                settled++
                if (settled === promises.length) resolve(results);
            })
        })
    })
}
```

## Why `Promise.resolve()` is needed (and when to use it)

This was the trickiest part. `Promise.resolve()` solves a specific problem: **the input might not be a promise**.

```javascript
const inputs = [Promise.resolve(1), 42, 'hello'];
```

The value `42` is just a number. It doesn't have a `.then` method. If you try:

```javascript
42.then(value => ...)  // TypeError: 42.then is not a function
```

`Promise.resolve()` normalizes everything into a promise:

```javascript
Promise.resolve(42)                    // → Promise that resolves to 42
Promise.resolve('hello')               // → Promise that resolves to 'hello'
Promise.resolve(Promise.resolve(42))   // → same Promise, no double wrapping
Promise.resolve(Promise.reject('err')) // → same rejected Promise
```

### When do you need it?

Any time you're writing a function that accepts "promises or values" and needs to call `.then` on them. This applies to:

- `promiseAll` — you used it there too
- `promiseAllSettled` — same reason
- Any utility that processes an array of "thenables"

### When do you NOT need it?

When you know the input is already a promise:

```javascript
// fn() always returns a promise — no wrapping needed
async function retry(fn, n) {
    return await fn();  // fn() is guaranteed to return a promise
}
```

### Mental model

Think of `Promise.resolve()` as a universal adapter plug. You're traveling to a country (`.then`/`.catch`) that only accepts one type of plug (promises). `Promise.resolve()` converts any plug (value) to the right format. If it's already the right format, it does nothing.

## Why `forEach` gives you concurrency

This is a pattern that appears in both `promiseAll` and `promiseAllSettled`. It's worth understanding deeply.

### The key insight: `forEach` is synchronous, `.then` callbacks are not

```javascript
promises.forEach((promise, i) => {
    Promise.resolve(promise).then(value => {
        // this runs LATER
    });
});
// by this point: all .then callbacks are REGISTERED, none have FIRED
```

`forEach` runs through the entire array **instantly**. On each iteration, it attaches a `.then` callback to the promise. Attaching a callback is instant — it doesn't wait for the promise.

### Why this creates concurrency

```javascript
// Iteration 0: "hey promise[0], when you're done, call this function"
// Iteration 1: "hey promise[1], when you're done, call this function"
// Iteration 2: "hey promise[2], when you're done, call this function"
// forEach done. All three promises are running independently.
```

All three promises were already running (or just started). The `.then` callbacks fire independently, whenever each promise settles. This is **parallel execution**.

### Compare with `for...of` + `await` (sequential)

```javascript
for (const promise of promises) {
    const value = await promise;  // PAUSES here — one at a time
}
```

`await` inside a loop makes each iteration wait for the previous one. No concurrency.

### Compare with `for` loop without `await` (also parallel, but different)

```javascript
for (let i = 0; i < promises.length; i++) {
    Promise.resolve(promises[i]).then(value => {
        results[i] = value;
    });
}
```

This also works! `forEach` isn't magic — any loop that attaches callbacks without awaiting achieves the same parallelism. `forEach` is just cleaner because it gives you both the element and the index.

### Why you can't use `forEach` with `await`

```javascript
// THIS DOES NOT WORK AS EXPECTED
promises.forEach(async (promise, i) => {
    const value = await promise;  // each callback awaits independently
    results[i] = value;
});
// forEach returns IMMEDIATELY — it doesn't wait for the async callbacks
```

`forEach` ignores the return value of its callback. Even with `async`, it doesn't wait. The callbacks run concurrently (which happens to be what we want here), but `forEach` itself finishes before any of them complete. That's why we need the `settled` counter — `forEach` can't tell us when everything is done.

## How `.finally()` works

`.finally()` runs a callback after the promise settles, **regardless of the outcome**. It runs after `.then` if the promise fulfilled, or after `.catch` if it rejected.

```javascript
Promise.resolve('ok')
    .then(v => console.log('then:', v))    // runs: "then: ok"
    .catch(e => console.log('catch:', e))  // skipped
    .finally(() => console.log('done'));   // runs: "done"

Promise.reject('fail')
    .then(v => console.log('then:', v))    // skipped
    .catch(e => console.log('catch:', e))  // runs: "catch: fail"
    .finally(() => console.log('done'));   // runs: "done"
```

### The chain flow with `.finally()`

```
fulfilled → .then(callback) → .finally(callback)
rejected  → .catch(callback) → .finally(callback)
```

`.finally` always runs last. It doesn't receive any arguments (it doesn't know if the promise fulfilled or rejected), and it doesn't change the result — it's purely for side effects.

### Why `.finally()` is perfect here

In `promiseAllSettled`, both the `.then` and `.catch` need to increment the counter and check if we're done. Without `.finally`:

```javascript
.then(value => {
    results[i] = { status: 'fulfilled', value };
    settled++;                                    // duplicated
    if (settled === promises.length) resolve(results);  // duplicated
})
.catch(reason => {
    results[i] = { status: 'rejected', reason };
    settled++;                                    // duplicated
    if (settled === promises.length) resolve(results);  // duplicated
})
```

With `.finally`:

```javascript
.then(value => {
    results[i] = { status: 'fulfilled', value };
})
.catch(reason => {
    results[i] = { status: 'rejected', reason };
})
.finally(() => {
    settled++;
    if (settled === promises.length) resolve(results);  // once, in one place
})
```

`.then` and `.catch` handle their specific job (recording the result). `.finally` handles the shared job (counting and resolving). Clean separation.

### Common uses of `.finally()` in real code

```javascript
// Loading spinners
setLoading(true);
fetch('/api/data')
    .then(data => render(data))
    .catch(err => showError(err))
    .finally(() => setLoading(false));  // always hide spinner

// Database connections
const connection = await db.connect();
connection.query('SELECT ...')
    .then(rows => process(rows))
    .catch(err => log(err))
    .finally(() => connection.close());  // always close connection
```

## How `promiseAllSettled` differs from `promiseAll`

The structure is almost identical. Here's what changed:

| | **promiseAll** | **promiseAllSettled** |
|---|---|---|
| `.then` | `results[i] = value` | `results[i] = { status: 'fulfilled', value }` |
| `.catch` | `reject(reason)` — stops everything | `results[i] = { status: 'rejected', reason }` — records it |
| Counter tracks | fulfilled promises only | all settled promises (fulfilled + rejected) |
| Outer promise | can reject | **never** rejects |

The core difference: in `promiseAll`, `.catch` is an escape hatch that aborts the whole operation. In `promiseAllSettled`, `.catch` is just another data point — a rejection is recorded, not propagated.

## Step-by-step trace

Three promises: resolves, rejects, resolves. The second one settles first:

```
forEach runs synchronously:
  i=0: attaches .then/.catch/.finally to slowPromise
  i=1: attaches .then/.catch/.finally to fastRejection
  i=2: attaches .then/.catch/.finally to mediumPromise
(forEach done — all callbacks registered, none fired yet)

fastRejection settles (rejected):
  .then → skipped
  .catch → results[1] = { status: 'rejected', reason: Error }
  .finally → settled = 1, 1 !== 3, don't resolve

mediumPromise settles (fulfilled):
  .then → results[2] = { status: 'fulfilled', value: 'medium' }
  .catch → skipped
  .finally → settled = 2, 2 !== 3, don't resolve

slowPromise settles (fulfilled):
  .then → results[0] = { status: 'fulfilled', value: 'slow' }
  .catch → skipped
  .finally → settled = 3, 3 === 3, resolve(results)!

results = [
  { status: 'fulfilled', value: 'slow' },
  { status: 'rejected', reason: Error },
  { status: 'fulfilled', value: 'medium' },
]
```

All in order, all accounted for — no matter who finished first or who failed.
