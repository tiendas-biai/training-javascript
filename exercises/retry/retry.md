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

## Where you'll see this in the real world

- **Axios interceptors** — `axios-retry` automatically retries failed HTTP requests. Under the hood, it's this exact pattern: call, catch, try again
- **AWS SDK** — every call to S3, DynamoDB, Lambda, etc. has built-in retry. When AWS returns a 500 or throttle error, the SDK retries automatically
- **Node.js `fetch` libraries** — `node-fetch-retry`, `ky` (from the creator of Sindre Sorhus) all wrap fetch with retry logic
- **Database connections** — ORMs like Prisma and TypeORM retry failed connections on startup, because the DB might not be ready yet
- **CI/CD pipelines** — GitHub Actions and Jenkins retry flaky steps automatically