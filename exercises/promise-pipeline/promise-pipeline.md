# Promise Pipeline

Implement `pipeline(functions, initialValue)` — it chains async functions together, passing the output of each one as the input to the next.

Think of it as a data processing pipeline: raw data goes in, each step transforms it, and the final result comes out.

```javascript
// Usage:
const result = await pipeline([
  (x) => Promise.resolve(x + 1),
  (x) => Promise.resolve(x * 2),
  (x) => Promise.resolve(x + 10),
], 5);
// Step 1: 5 + 1 = 6
// Step 2: 6 * 2 = 12
// Step 3: 12 + 10 = 22
console.log(result); // 22
```

Write `pipeline(functions, initialValue)`. It should:
- Execute functions in order, passing each result to the next
- Each function receives one argument and returns a promise
- Return the final result
- If any step rejects, the pipeline stops and rejects with that error
- Handle an empty array (return `initialValue`)

Hints:
- These functions MUST run sequentially — each one needs the previous result
- Think about `reduce` — how can it chain promises?
- Or think about a simple loop with `await`

## Where you'll see this in the real world

- **Express/Koa middleware** — `app.use(auth, validate, handle)` is a pipeline. Each middleware receives the request, transforms it, and passes it to the next one. If one fails, the chain stops
- **Gulp task runner** — `gulp.series(clean, build, minify, deploy)` runs tasks in sequence, each one depending on the previous step completing
- **Unix pipes** — `cat file | grep error | sort | uniq` is the same concept: each command takes the output of the previous one. Node.js streams work the same way
- **ETL pipelines** — data engineering tools (Airflow, dbt) process data in stages: extract → transform → load. Each stage feeds the next
- **Redux middleware** — `applyMiddleware(logger, thunk, api)` chains middleware where each one can transform the action before passing it along
