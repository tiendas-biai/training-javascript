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

---

## Solution

```javascript
function promiseAll(promises) {
  return new Promise((resolve, reject) => {
    const results = [];
    let resolved = 0;

    if (promises.length === 0) {
      resolve([]);
      return;
    }

    promises.forEach((promise, i) => {
      Promise.resolve(promise).then(value => {
        results[i] = value;
        resolved++;
        if (resolved === promises.length) {
          resolve(results);
        }
      }).catch(reject);
    });
  });
}
```

## Explanation

### Why `new Promise`?

You can't use `async/await` here because you need all promises running **in parallel**, not sequentially. `new Promise` gives you access to `resolve` and `reject` so you can call them when the right conditions are met.

### Why `results[i]` instead of `results.push()`?

Promises resolve in any order. If the 3rd promise resolves first, `push` would put it at index 0. Using `results[i] = value` stores each result at its original index, maintaining order.

### Why a `resolved` counter?

You can't check `results.length` to know if all promises finished. Setting `results[2] = value` on an empty array creates a **sparse array** with `.length === 3`, even though indices 0 and 1 are empty. The counter tracks how many have **actually** resolved.

### Why `Promise.resolve(promise)`?

The input array might contain non-promise values like `42` or `'hello'`. These don't have a `.then` method, so calling `.then` directly would throw. `Promise.resolve()` wraps them into fulfilled promises. If the value is already a promise, it returns it as-is.

### Why `.catch(reject)` instead of `.catch(e => reject(e))`?

They're equivalent. `reject` is already a function that takes one argument, so you can pass it directly as the callback — it's just shorthand.

### Why the empty array check?

`Promise.all([])` resolves immediately with `[]`. Without this check, `forEach` would never run, so `resolve` would never be called, and the returned promise would hang forever.

### How does `forEach` work with async?

`forEach` runs **synchronously** — it just attaches `.then` callbacks to each promise and finishes immediately. The callbacks run **later**, as each promise resolves on its own time. It's like registering event listeners: you set them up now, they fire later.
