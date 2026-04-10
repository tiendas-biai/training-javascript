# Poll - Solution

```javascript
function sleep(timeout){
    return new Promise((resolve)=>setTimeout(resolve,timeout))
}

async function poll(fn, condition, { interval, maxAttempts }) {
    for (let attempt=0; attempt<maxAttempts; attempt++){
        try {
            let data = await fn();
            if (condition(data)){
                return data;
            }
            await sleep(interval)
        } catch (error) {
            throw error;
        }
    }
    throw new Error();
}
```

## How the sleep helper works

JavaScript doesn't have a built-in "wait" function for async code. But we can build one using `setTimeout` wrapped in a `Promise`:

```javascript
function sleep(timeout){
    return new Promise((resolve) => setTimeout(resolve, timeout))
}
```

Breaking it down:

1. `new Promise((resolve) => ...)` — creates a promise that we control manually
2. `setTimeout(resolve, timeout)` — schedules `resolve` to be called after `timeout` ms
3. When `resolve` fires, the promise fulfills, and any `await sleep(...)` resumes

This is one of the most common patterns in JavaScript: **turning a callback-based API (`setTimeout`) into a promise-based one**.

### Why not just use `setTimeout` directly?

```javascript
// This does NOT pause execution:
setTimeout(() => {}, 2000);
console.log('this runs immediately, not after 2 seconds');

// This DOES pause execution:
await sleep(2000);
console.log('this runs after 2 seconds');
```

`setTimeout` schedules work but doesn't block. `await` on a promise is the only way to "pause" inside an `async` function.

## How the polling loop works

### Step-by-step trace

Imagine we're polling an order API with `interval: 2000` and `maxAttempts: 3`. The order becomes ready on the 3rd call:

```
Attempt 0: fn() → { status: 'pending' } → condition? NO → sleep 2s
Attempt 1: fn() → { status: 'pending' } → condition? NO → sleep 2s
Attempt 2: fn() → { status: 'ready' }  → condition? YES → return data
```

If the order never becomes ready:

```
Attempt 0: fn() → { status: 'pending' } → condition? NO → sleep 2s
Attempt 1: fn() → { status: 'pending' } → condition? NO → sleep 2s
Attempt 2: fn() → { status: 'pending' } → condition? NO → sleep 2s
Loop ends → throw new Error()
```

### Why check the condition before sleeping?

Notice the order: call `fn()`, check condition, *then* sleep. This means:

- **No delay before the first attempt** — we call `fn()` right away
- **No delay after success** — if condition is met, we `return` before reaching `sleep`
- **Delay only between attempts** — sleep happens after a failed condition check, before the next loop iteration

If you put `sleep` at the top of the loop, you'd wait unnecessarily before the very first call.

### Why does sleep happen even on the last failed attempt?

It does — on the last attempt where the condition isn't met, we sleep and *then* the loop ends and we throw. This is a minor inefficiency: we could skip the sleep on the last attempt with something like:

```javascript
if (attempt < maxAttempts - 1) {
    await sleep(interval);
}
```

But it doesn't affect correctness, and keeping the code simpler is usually the better trade-off.

### How is this different from retry?

Both poll and retry loop and call an async function multiple times. The difference is **what triggers a new attempt**:

| | **Retry** | **Poll** |
|---|---|---|
| Try again when... | `fn()` throws an error | `fn()` succeeds but condition is not met |
| Stop on success when... | `fn()` doesn't throw | `condition(result)` returns `true` |
| Delay between attempts | Optional | Required (that's the point of polling) |
| Use case | Unreliable operations (network, etc.) | Waiting for state to change over time |

### Why `catch (error) { throw error }`?

This catch block re-throws the error as-is, which means it behaves the same as if the `try/catch` wasn't there. If `fn()` throws, polling stops immediately — we don't retry on errors, only on unmet conditions. You could simplify the code by removing the `try/catch` entirely and the behavior would be identical.

## Mental model

Think of polling like checking if your food delivery has arrived:

- **`fn()`** = looking out the window
- **`condition(data)`** = "is the delivery driver there?"
- **`interval`** = how long you wait before checking again
- **`maxAttempts`** = how many times you're willing to check before giving up
- **`sleep`** = sitting back down and waiting before your next check
- **`throw new Error()`** = "I've checked enough times, it's not coming"
