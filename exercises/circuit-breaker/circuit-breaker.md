# Circuit Breaker

Implement a `CircuitBreaker` class — it wraps an async function and stops calling it after too many consecutive failures, giving the service time to recover.

This is a resilience pattern from distributed systems. If an API is down, hammering it with retries makes things worse. A circuit breaker "trips" after N failures, rejects calls instantly for a cooldown period, then lets one call through to test if the service is back.

```javascript
// Usage:
const breaker = new CircuitBreaker(fetchData, {
  maxFailures: 3,     // trip after 3 consecutive failures
  cooldownMs: 5000,   // wait 5 seconds before trying again
});

await breaker.call(); // calls fetchData()
await breaker.call(); // calls fetchData() — fails
await breaker.call(); // calls fetchData() — fails
await breaker.call(); // calls fetchData() — fails (3rd failure → circuit OPENS)
await breaker.call(); // rejects immediately with "Circuit is open" (no call to fetchData)

// ... 5 seconds later ...
await breaker.call(); // calls fetchData() again (testing if service recovered)
//   → if it succeeds: circuit CLOSES, back to normal
//   → if it fails: circuit stays OPEN, cooldown resets
```

The circuit has three states:
- **CLOSED**: normal operation, calls go through
- **OPEN**: failing, all calls rejected instantly without calling fn
- **HALF-OPEN**: cooldown expired, the next call is a test — success closes the circuit, failure re-opens it

Write the `CircuitBreaker` class. It should:
- Constructor: `(fn, { maxFailures, cooldownMs })`
- `call(...args)`: calls `fn(...args)` if circuit is closed/half-open, rejects if open
- Track consecutive failures — a single success resets the count to 0
- Trip to OPEN after `maxFailures` consecutive failures
- After `cooldownMs`, move to HALF-OPEN and allow one test call
- Reject with `Error("Circuit is open")` when the circuit is open

Hints:
- You need to track: failure count, circuit state, and when it opened
- How do you know if cooldown has passed? Compare `Date.now()` with when the circuit opened
- HALF-OPEN is the trickiest state — what happens if the test call fails?

## Where you'll see this in the real world

- **Netflix Hystrix** — Netflix invented this pattern for microservices. When one service goes down, Hystrix stops calling it and returns a fallback response instantly. This prevents cascading failures across hundreds of services
- **opossum (npm)** — the most popular circuit breaker library for Node.js. Red Hat maintains it. Same states (closed/open/half-open) as this exercise
- **AWS App Mesh** — AWS's service mesh has built-in circuit breaking. When a backend service returns too many 5xx errors, the mesh stops routing traffic to it
- **Istio / Envoy** — Kubernetes service meshes implement circuit breaking at the network level. Your exercise is the application-level version of the same concept
- **Polly (.NET) / resilience4j (Java)** — the most popular resilience libraries in their ecosystems. Both implement circuit breaker, retry, and timeout — the three patterns you've already built
