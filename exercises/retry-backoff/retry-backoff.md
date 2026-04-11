# Retry with Exponential Backoff

Implement `retryWithBackoff(fn, options)` — it retries an async function with increasing delays between attempts.

This is how every serious HTTP client works (AWS SDK, Axios retry, Google APIs). Instead of retrying immediately (which can overwhelm a struggling server), you wait longer after each failure: 1s, 2s, 4s, 8s...

```javascript
// Usage:
retryWithBackoff(() => fetch('/api/data'), {
  maxAttempts: 4,
  initialDelay: 1000,
  factor: 2,
})
// Attempt 1: call fn()                     (t=0s)
// Attempt 2: wait 1000ms, call fn()        (t=1s)
// Attempt 3: wait 2000ms, call fn()        (t=3s)
// Attempt 4: wait 4000ms, call fn()        (t=7s)
// If all fail: reject with last error
```

Write `retryWithBackoff(fn, options)`. It should:
- `options`: `{ maxAttempts, initialDelay, factor }`
- Call `fn()` up to `maxAttempts` times
- No delay before the first attempt
- After each failure, wait `initialDelay * factor^(attempt-1)` ms before retrying
- Reject with the last error if all attempts fail
- Resolve with the result on first success

Hints:
- You already know how to build `retry` and `sleep` — combine them
- The delay doubles each time: `initialDelay`, `initialDelay * factor`, `initialDelay * factor * factor`...
- How do you calculate the delay for attempt N?

## Where you'll see this in the real world

- **AWS SDK** — every AWS service call uses exponential backoff. The SDK starts at 100ms and doubles up to a cap. This is how millions of services talk to AWS without overwhelming it
- **Google Cloud client libraries** — same pattern: exponential backoff with jitter (random offset). The jitter prevents the "thundering herd" problem where all retries happen at exactly the same time
- **gRPC retry policy** — gRPC has a built-in retry config with `initialBackoff`, `maxBackoff`, and `backoffMultiplier` — the exact same parameters as this exercise
- **Stripe API** — Stripe's SDK retries with exponential backoff on 429 (rate limit) and 500 (server error) responses
- **Kubernetes CrashLoopBackOff** — when a pod keeps crashing, K8s restarts it with exponential backoff: 10s, 20s, 40s, up to 5 minutes. The "BackOff" in the name is literally this pattern
