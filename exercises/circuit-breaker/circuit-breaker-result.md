# Circuit Breaker - Solution

```javascript
const STATE = {
    CLOSED: 'CLOSED',
    OPEN: 'OPEN',
    HALF_OPEN: 'HALF-OPEN',
};

class CircuitBreaker {
    constructor(fn, { maxFailures, cooldownMs }) {
        this.fn = fn;
        this.maxFailures = maxFailures;
        this.cooldownMs = cooldownMs;
        this.failures = 0;
        this.state = STATE.CLOSED;
        this.openedAt = null;
    }

    ensureCircuitAllowsCall() {
        if (this.state !== STATE.OPEN) return;

        const elapsed = Date.now() - this.openedAt;
        if (elapsed < this.cooldownMs) {
            throw new Error('Circuit is open');
        }
        this.state = STATE.CLOSED;
    }

    recordSuccess() {
        this.failures = 0;
        this.state = STATE.CLOSED;
    }

    recordFailure() {
        this.failures++;
        if (this.failures >= this.maxFailures) {
            this.state = STATE.OPEN;
            this.openedAt = Date.now();
        }
    }

    async call(...args) {
        this.ensureCircuitAllowsCall();
        try {
            const value = await this.fn(...args);
            this.recordSuccess();
            return value;
        } catch (e) {
            this.recordFailure();
            throw e;
        }
    }
}
```

## How the circuit breaker works

The circuit breaker wraps an async function and tracks its failures. When the wrapped function fails too many times in a row, the breaker "trips" and starts rejecting calls instantly — giving the failing service time to recover instead of piling on more requests.

It's a small state machine with three states:

- **CLOSED** — normal operation, calls pass through to `fn`
- **OPEN** — tripped, calls rejected immediately without invoking `fn`
- **HALF-OPEN** — cooldown expired, the next call is a probe: success closes the circuit, failure re-opens it

### The main narrative: `call()`

`call` reads top-to-bottom as a short story:

```javascript
async call(...args) {
    this.ensureCircuitAllowsCall();   // 1. gate: may this call even run?
    try {
        const value = await this.fn(...args);
        this.recordSuccess();         // 2a. happy path
        return value;
    } catch (e) {
        this.recordFailure();         // 2b. sad path
        throw e;
    }
}
```

The state-machine bookkeeping is hidden behind three helpers. The main flow isn't cluttered with counters, timestamps, or state strings.

### The gate: `ensureCircuitAllowsCall`

```javascript
ensureCircuitAllowsCall() {
    if (this.state !== STATE.OPEN) return;

    const elapsed = Date.now() - this.openedAt;
    if (elapsed < this.cooldownMs) {
        throw new Error('Circuit is open');
    }
    this.state = STATE.CLOSED;
}
```

Guard clauses, early returns, one job. Three cases:

1. **Not OPEN** → nothing to check, let the call through.
2. **OPEN and cooldown hasn't passed** → reject instantly.
3. **OPEN and cooldown expired** → flip to CLOSED and let the call through as a probe.

Note that HALF-OPEN is *implicit* here. We don't store a separate HALF_OPEN state; when the cooldown passes we just set CLOSED and let the next call run. If it fails, `recordFailure` tracks the failure; if enough consecutive failures happen, we trip again.

The `failures` counter is not reset when we flip from OPEN back to CLOSED. That's deliberate: a probe that fails should trip the circuit back to OPEN immediately, which works because `failures` was already at `maxFailures` when it tripped.

### Recording outcomes

```javascript
recordSuccess() {
    this.failures = 0;
    this.state = STATE.CLOSED;
}

recordFailure() {
    this.failures++;
    if (this.failures >= this.maxFailures) {
        this.state = STATE.OPEN;
        this.openedAt = Date.now();
    }
}
```

`recordSuccess` is the reset button: any success clears the failure count and closes the circuit. This is why the tests can go *fail → success → fail → fail* without tripping — the success wipes the slate.

`recordFailure` increments and, on the threshold, flips to OPEN and stamps the time. Using `>=` instead of `===` is defensive but cheap — keeps the invariant "at or above threshold means open" clear.

### Step-by-step trace

With `maxFailures: 2, cooldownMs: 100`:

```
call() → ensureCircuitAllowsCall: state=CLOSED, return early
       → fn() rejects
       → recordFailure: failures=1, below threshold, stay CLOSED
       → rethrow

call() → ensureCircuitAllowsCall: state=CLOSED, return early
       → fn() rejects
       → recordFailure: failures=2, hit threshold, state=OPEN, openedAt=now
       → rethrow

call() → ensureCircuitAllowsCall: state=OPEN, elapsed=10ms < 100ms
       → throw "Circuit is open"  (fn is NOT called)

... wait 150ms ...

call() → ensureCircuitAllowsCall: state=OPEN, elapsed=150ms >= 100ms
       → state=CLOSED (implicit half-open probe)
       → fn() resolves
       → recordSuccess: failures=0, state=CLOSED
       → return value
```

### Clean code choices worth calling out

- **`STATE` constants** instead of magic strings. A typo in `'CLOSDE'` would silently keep the circuit tripped; a typo in `STATE.CLOSDE` is a `ReferenceError` at parse/runtime.
- **`Date.now()` over `new Date()`** — returns a number directly. `new Date() - new Date()` works via implicit coercion, but `Date.now()` says "I want a timestamp" without ceremony.
- **`this.openedAt = null`** instead of `0`. `0` is a valid-looking epoch timestamp (Jan 1 1970); `null` reads as "never opened."
- **Named methods for state transitions** (`recordSuccess`, `recordFailure`, `ensureCircuitAllowsCall`) rather than inlining the mutations in `call`. Each method has a verb that describes *what the state machine is doing*, so `call` reads as the state machine itself, not as plumbing.
- **Guard clauses** in `ensureCircuitAllowsCall` flatten what would otherwise be nested `if` blocks. The reader scans top-to-bottom: "not OPEN? done. still in cooldown? throw. otherwise, reopen."

## Mental model

Think of a fuse in a house:

- **CLOSED** = fuse intact, electricity (calls) flows normally
- Too many short circuits (failures) in a row → **OPEN** = fuse blown, no current flows, instant reject
- After you wait for things to cool down (**cooldownMs**) you can reset the fuse and try once. That one trial is **HALF-OPEN** — if it works, you're back to normal; if it pops again, the fuse blows again

The breaker's job isn't to fix the underlying problem — it's to stop the house from catching fire while the problem exists.