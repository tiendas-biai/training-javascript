# Retry

Implement a `retry` function that takes an async function and retries it up to `n` times if it rejects. It should only reject if all attempts fail.

```javascript
// Usage:
const fetchData = () => fetch('https://api.example.com/data');

retry(fetchData, 3)
  .then(response => console.log('Success:', response))
  .catch(err => console.log('All 3 attempts failed:', err));
```

Write the `retry(fn, n)` function. Bonus: add a delay between retries.