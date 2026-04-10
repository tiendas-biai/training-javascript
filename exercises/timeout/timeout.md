# Timeout

Implement `withTimeout(fn, ms)` — it calls an async function but rejects if it doesn't resolve within `ms` milliseconds.

This is essential in real-world code: network requests can hang forever, database queries can stall, and third-party APIs can stop responding. A timeout ensures your code doesn't wait indefinitely.

```javascript
// Usage:
const fetchUser = () => fetch('/api/user/123').then(r => r.json());

// Give it 3 seconds, reject if it takes longer
withTimeout(fetchUser, 3000)
  .then(user => console.log(user))
  .catch(err => console.log(err.message)); // "Operation timed out after 3000ms"
```

Write `withTimeout(fn, ms)`. It should:
- Call `fn()` and return its result if it resolves within `ms` milliseconds
- Reject with an `Error("Operation timed out after {ms}ms")` if `fn()` takes too long
- If `fn()` rejects on its own (before the timeout), pass that rejection through
- `fn` is a **function** that returns a promise

Hints:
- You know how to build a promise that resolves after a delay (`sleep`). Can you build one that **rejects** after a delay?
- `Promise.race` takes an array of promises and resolves/rejects with whichever one **settles first**
- Think about what happens to the "loser" of the race
