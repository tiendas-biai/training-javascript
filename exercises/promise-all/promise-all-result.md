# Promise All - Solution

```javascript
function promiseAll(promises) {
    return new Promise((resolve,reject)=>{
        let results = [];
        let resolved = 0;
        if (promises.length===0){
            resolve(promises);
            return
        }
        promises.forEach((promise, i)=>{
            Promise.resolve(promise).then((value)=>{
                results[i] = value;
                ++resolved
                if (resolved === promises.length){
                    resolve(results)
                }
            }).catch(reject)
        })
    })
}
```

## Why `new Promise` instead of `async/await`?

You can't use `async/await` here because you need all promises running **in parallel**, not sequentially. Compare:

```javascript
// SEQUENTIAL — each waits for the previous one
async function promiseAll(promises) {
    const results = [];
    for (const p of promises) {
        results.push(await p); // waits here before moving to the next
    }
    return results;
}

// PARALLEL — all run at the same time
function promiseAll(promises) {
    return new Promise((resolve, reject) => {
        // forEach runs synchronously, attaching .then to ALL promises at once
        promises.forEach((promise, i) => {
            Promise.resolve(promise).then(value => {
                // each callback fires independently when its promise resolves
            });
        });
    });
}
```

With `async/await`, `await p` pauses the function until `p` resolves. That means the second promise doesn't even get checked until the first one finishes. With `new Promise` + `forEach`, you attach `.then` callbacks to all promises immediately — they all run concurrently.

## How `forEach` works here (this is important)

`forEach` is **synchronous**. It runs through the entire array instantly, attaching `.then` callbacks to every promise. It doesn't wait for any of them.

```javascript
promises.forEach((promise, i) => {
    Promise.resolve(promise).then(value => {
        // this callback runs LATER, when the promise resolves
    });
});
// by the time we get here, ALL .then callbacks are registered
// but NONE of them have fired yet
```

Think of it like setting up dominoes. `forEach` places all the dominoes (registers callbacks). The dominoes fall later (callbacks fire) on their own time, in whatever order the promises resolve.

## Why `results[i] = value` instead of `results.push(value)`?

Promises resolve in any order. If you have 3 promises and the third one resolves first:

```javascript
// With push — order is WRONG:
results.push(value); // results = [thirdValue, firstValue, secondValue]

// With index — order is CORRECT:
results[i] = value;  // results = [firstValue, secondValue, thirdValue]
```

The index `i` comes from `forEach`, which gives us the **original position** in the array. This guarantees results match the input order regardless of which promise resolves first.

## Why a `resolved` counter?

You might think: "just check if `results.length === promises.length`". But that doesn't work because of how JavaScript arrays behave:

```javascript
const arr = [];
arr[2] = 'hello';
console.log(arr.length); // 3 (!)
console.log(arr);        // [empty, empty, 'hello']
```

Setting `arr[2]` creates a **sparse array** with length 3, even though indices 0 and 1 are empty. So `results.length` would report the wrong count.

The `resolved` counter tracks how many promises have **actually** resolved. Only when it equals `promises.length` do we know every single one is done.

## Why `Promise.resolve(promise)`?

The input array might contain non-promise values:

```javascript
promiseAll([1, Promise.resolve(2), 'hello'])
```

The value `1` doesn't have a `.then` method. Calling `.then` on it would throw. `Promise.resolve()` wraps it:

- If the value is a promise → returns it as-is
- If the value is not a promise → wraps it in a fulfilled promise

```javascript
Promise.resolve(42)              // → Promise that resolves to 42
Promise.resolve(Promise.resolve(42)) // → same Promise, no double wrapping
```

## Why the empty array check?

```javascript
if (promises.length === 0) {
    resolve(promises);
    return;
}
```

Without this, `forEach` never runs (nothing to iterate). That means `resolve` is never called, and the returned promise **hangs forever** — it never resolves or rejects.

`Promise.all([])` resolves immediately with `[]`, so we match that behavior.

## Why `.catch(reject)` instead of `.catch(e => reject(e))`?

They're equivalent. `reject` is a function that takes one argument, so it can be passed directly as a callback. It's just shorthand:

```javascript
.catch(reject)          // passes reject function directly
.catch(e => reject(e))  // wraps it in an arrow function — same result
```

## Step-by-step trace

Three promises where the second one resolves first:

```
Input: [slowPromise, fastPromise, mediumPromise]

forEach runs synchronously:
  i=0: attaches .then to slowPromise
  i=1: attaches .then to fastPromise
  i=2: attaches .then to mediumPromise
(forEach done — all callbacks registered, none fired yet)

Time passes...

fastPromise resolves → callback fires:
  results[1] = 'fast'    → results = [empty, 'fast', empty]
  resolved = 1           → 1 !== 3, don't resolve yet

mediumPromise resolves → callback fires:
  results[2] = 'medium'  → results = [empty, 'fast', 'medium']
  resolved = 2           → 2 !== 3, don't resolve yet

slowPromise resolves → callback fires:
  results[0] = 'slow'    → results = ['slow', 'fast', 'medium']
  resolved = 3           → 3 === 3, resolve(results)!
```

## Mental model

Think of it like a teacher collecting homework from a class:

- **`promises`** = students working on their homework simultaneously
- **`forEach` + `.then`** = the teacher writes each student's name on an empty slot on the board (registers who goes where)
- **`results[i] = value`** = as each student finishes, they put their homework in their assigned slot
- **`resolved` counter** = the teacher tallies how many have turned in work
- **`resolve(results)`** = once everyone has turned in, the teacher collects the stack — all in the correct order
- **`reject`** = if any student says "I can't do it" (rejects), the teacher immediately stops and reports the failure
