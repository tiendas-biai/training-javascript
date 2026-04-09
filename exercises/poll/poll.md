# Poll

Implement a `poll` function that repeatedly calls an async function until a condition is met. If the condition isn't met after `maxAttempts`, it should reject.

```javascript
// Usage:
// Check every 2 seconds if the order status is "ready", up to 5 times
poll(
  () => fetch('/api/order/123').then(r => r.json()),
  (result) => result.status === 'ready',
  { interval: 2000, maxAttempts: 5 }
)
  .then(result => console.log('Order is ready!', result))
  .catch(() => console.log('Timed out waiting for order'));
```

Write `poll(fn, condition, options)`.

Hints:
- You'll need a `sleep` helper (you can use Promises for that)
- Don't delay before the first attempt
- Think about what happens if `fn` itself throws