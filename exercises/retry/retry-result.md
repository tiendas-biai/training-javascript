# Retry - Solution

```javascript
async function retry(fn, n) {
    for (let i=0; i<n; i++){
        try{
            return await fn();
        } catch (e) {
            if (i===n-1){
                throw(e);
            }
        }
    }
}
```

## How does the retry pattern work?

The idea is simple: call the function, and if it fails, try again. The `for` loop gives us a fixed number of attempts. The `try/catch` inside is what lets us "absorb" failures and keep going.

### Step-by-step trace

Imagine `fn` fails twice, then succeeds on the third call, with `n = 3`:

```
Attempt 0: fn() throws → catch runs → i (0) !== n-1 (2) → loop continues
Attempt 1: fn() throws → catch runs → i (1) !== n-1 (2) → loop continues
Attempt 2: fn() succeeds → return result → function exits
```

Now imagine `fn` fails all 3 times:

```
Attempt 0: fn() throws → catch runs → i (0) !== n-1 (2) → loop continues
Attempt 1: fn() throws → catch runs → i (1) !== n-1 (2) → loop continues
Attempt 2: fn() throws → catch runs → i (2) === n-1 (2) → throw error
```

### Why `return await fn()` and not just `return fn()`?

This is subtle. If you write `return fn()`, the promise returned by `fn()` bypasses the `try/catch` — it goes directly to the caller. The `catch` block would never execute because there's no `await` to "unwrap" the rejection inside this function.

```javascript
// This does NOT work for retrying:
try {
    return fn(); // returns the promise as-is, catch never fires
} catch (e) {
    // unreachable for async errors!
}

// This works:
try {
    return await fn(); // unwraps the promise, catch can intercept rejections
} catch (e) {
    // now we can handle it
}
```

`await` converts a rejected promise into a thrown exception inside the `async` function. Without it, the rejection just passes through.

### Why check `i === n-1` instead of just always continuing?

You could also write it without the check by letting the last error naturally escape:

```javascript
async function retry(fn, n) {
    let lastError;
    for (let i = 0; i < n; i++) {
        try {
            return await fn();
        } catch (e) {
            lastError = e;
        }
    }
    throw lastError;
}
```

Both approaches work. The current solution is slightly more direct — it re-throws immediately on the last attempt rather than storing the error and throwing after the loop.

### Why `throw(e)` and not `throw new Error(...)`?

We re-throw the **original error**, preserving its message, stack trace, and type. If `fn` throws a `TypeError`, the caller sees a `TypeError`. Wrapping it in `new Error(...)` would lose that information.

## Mental model

Think of retry like calling a friend who has bad cell reception:

- **`fn()`** = the call attempt
- **`n`** = how many times you're willing to redial
- **`try/catch`** = if the call drops (error), you try again instead of giving up
- **`return await`** = you stay on the line waiting for an answer (if you hang up immediately with just `return`, you can't tell if the call dropped)
- **`i === n-1`** = on your last attempt, if it fails, you give up and tell someone "I couldn't reach them"
