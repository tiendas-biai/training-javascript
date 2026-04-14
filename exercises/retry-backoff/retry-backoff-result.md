# Retry with Exponential Backoff - Solution

```javascript
function sleep(timeout) {
    return new Promise((resolve) => setTimeout(resolve, timeout));
}

async function retryWithBackoff(fn, { maxAttempts, initialDelay, factor }) {
    for (let i = 0; i < maxAttempts; i++) {
        try {
            return await fn();
        } catch (e) {
            if (i === maxAttempts - 1) {
                throw e;
            }
            const delay = initialDelay * Math.pow(factor, i);
            await sleep(delay);
        }
    }
}
```

## How exponential backoff works

This is `retry` plus `sleep`. The loop structure is the same as plain retry — call `fn`, catch failures, re-throw on the last attempt. The new part is the wait between attempts, which grows exponentially so a struggling server gets more breathing room after every failed call.

### The delay formula

```javascript
const delay = initialDelay * Math.pow(factor, i);
```

On each iteration, `i` is the index of the attempt that just failed. The sleep that follows happens **before the next attempt**. So:

| Failed attempt (`i`) | Next sleep       | Formula                    |
|----------------------|------------------|----------------------------|
| 0                    | `initialDelay`   | `initialDelay * factor^0`  |
| 1                    | `initialDelay*2` | `initialDelay * factor^1`  |
| 2                    | `initialDelay*4` | `initialDelay * factor^2`  |

The last iteration (`i === maxAttempts - 1`) throws before reaching the sleep, so we never wait after the final failure — there's no point, no one is going to call `fn` again.

### Why compute the delay *before* `sleep`, not after

An easy bug to write:

```javascript
// BROKEN — off by one
catch (e) {
    if (i === maxAttempts - 1) throw e;
    await sleep(delay);               // uses stale delay
    delay = initialDelay * Math.pow(factor, i);
}
```

With `delay` starting at `0`, the first `sleep(delay)` waits 0ms. The delay is only updated *after* we've already slept, so every sleep uses the previous iteration's value. Actual delays come out `[0, initialDelay, initialDelay*factor, ...]` — everything shifted by one position.

The fix is either: compute `delay` before calling `sleep`, or initialize `delay` to `initialDelay` before the loop and update *after* the sleep. The version above chooses the first — fewer moving parts, `delay` is a local `const` per iteration.

### Why `return await fn()` and not `return fn()`

Same reason as plain `retry`. Without `await`, the promise from `fn()` passes straight through to the caller without ever entering the `catch` block. `await` converts a rejected promise into a thrown exception inside this function, which is what lets `catch` intercept it.

### Step-by-step trace

With `maxAttempts: 4, initialDelay: 100, factor: 2`, and `fn` failing the first 3 times:

```
t=0ms     i=0, attempt fn() → throws
          i !== 3, delay = 100 * 2^0 = 100
          sleep(100)

t=100ms   i=1, attempt fn() → throws
          i !== 3, delay = 100 * 2^1 = 200
          sleep(200)

t=300ms   i=2, attempt fn() → throws
          i !== 3, delay = 100 * 2^2 = 400
          sleep(400)

t=700ms   i=3, attempt fn() → resolves 'ok'
          return 'ok'
```

Call timestamps: `0, 100, 300, 700` — gaps `100, 200, 400`, exactly the exponential sequence.

If `fn` had failed all four times, the fourth iteration would hit `i === maxAttempts - 1`, re-throw the error, and skip the sleep.

### The `maxAttempts: 1` edge case

With `maxAttempts = 1`, the loop runs once with `i = 0`, which is both the first *and* the last attempt. On failure, `i === maxAttempts - 1` (`0 === 0`) fires immediately and re-throws — no sleep, no retry. `fn` is called exactly once, which is what "no retries" should mean.

## Mental model

Think of it like redialing a phone number that keeps getting a busy signal:

- **First call** — try immediately, no wait
- **After it fails** — wait a bit before trying again (the number might free up)
- **After it fails again** — wait longer (if it's still busy, the line is probably congested)
- **After it keeps failing** — wait exponentially longer (stop hammering it, give the other side time to recover)
- **After `maxAttempts` total failures** — give up and report the last error

The growth factor turns the knob from "polite" (factor 2) to "very polite" (factor 3+). Real systems also add **jitter** (a random offset) to avoid a thundering herd of clients all retrying at exactly the same moment — but that's a separate layer on top of this base pattern.