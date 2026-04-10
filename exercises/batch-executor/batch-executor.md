# Batch Executor

Implement `batchExecute(tasks, batchSize)` — it runs async tasks in fixed-size batches.

Unlike `promisePool` where workers dynamically grab the next task, here you run a batch of `batchSize` tasks, wait for **all of them** to finish, then run the next batch.

```javascript
// Usage:
const tasks = [
  () => fetch('/api/1'),
  () => fetch('/api/2'),
  () => fetch('/api/3'),
  () => fetch('/api/4'),
  () => fetch('/api/5'),
];

// Batch 1: tasks 0,1,2 run in parallel → wait for all 3
// Batch 2: tasks 3,4 run in parallel → wait for both
batchExecute(tasks, 3)
  .then(results => console.log(results)); // [result1, result2, result3, result4, result5]
```

Write `batchExecute(tasks, batchSize)`. It should:
- Run tasks in batches of `batchSize`
- Wait for the entire batch to finish before starting the next one
- Return all results in order
- Reject immediately if any task fails
- `tasks` is an array of **functions** that return promises

Hints:
- How do you split an array into chunks?
- What tool do you already know that waits for multiple promises at once?
- Think about what happens with the last batch if it's smaller than `batchSize`
