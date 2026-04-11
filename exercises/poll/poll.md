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

## Where you'll see this in the real world

- **CI/CD deploy checks** — after deploying, tools like Vercel and AWS CodeDeploy poll the health endpoint until the service is up
- **Kubernetes readiness probes** — K8s polls your container's `/health` endpoint every N seconds to know when it's ready to receive traffic
- **Payment processing** — after initiating a payment with Stripe or PayPal, you poll the payment status until it's `succeeded` or `failed`
- **File upload processing** — services like Cloudinary or AWS S3 process uploads asynchronously. You submit the file, then poll a status endpoint until processing is done
- **Long-running jobs** — when you trigger a report generation or data export, the API returns a job ID and you poll until the job completes