# Batch Executor - Solution

```javascript
async function batchExecute(tasks, batchSize) {
    let counter = 0;
    let results = [];
    while(counter<tasks.length){
        let batch = [];
        for (let i=0; i<batchSize; ++i){
            if (counter>=tasks.length){
                break
            }
            batch.push(tasks[counter]());
            counter++;
        }
        let batchResult = await Promise.all(batch);
        results = results.concat(batchResult);
    }
    return results
}
```

## How it works

The function processes tasks in chunks. For each chunk, it **starts** all tasks at once (without awaiting), collects the promises, then waits for the entire batch with `Promise.all` before moving on.

### Step-by-step trace

5 tasks, batchSize of 2:

```
Iteration 1 (while loop):
  for loop: push tasks[0]() → promise running
  for loop: push tasks[1]() → promise running
  batch = [promise0, promise1]
  await Promise.all(batch) → waits for BOTH to finish
  results = [result0, result1]

Iteration 2 (while loop):
  for loop: push tasks[2]() → promise running
  for loop: push tasks[3]() → promise running
  batch = [promise2, promise3]
  await Promise.all(batch) → waits for BOTH to finish
  results = [result0, result1, result2, result3]

Iteration 3 (while loop):
  for loop: push tasks[4]() → promise running
  for loop: counter >= tasks.length → break
  batch = [promise4]
  await Promise.all(batch) → waits for it to finish
  results = [result0, result1, result2, result3, result4]

counter >= tasks.length → while loop ends
return results
```

## Why `tasks[counter]()` without `await`

This is the most important line in the solution. Calling `tasks[counter]()` **starts** the async operation and returns a promise immediately. By not awaiting it, we let the `for` loop continue and start the next task.

```javascript
// WITHOUT await — tasks start in parallel (what we want)
batch.push(tasks[counter]());  // starts task, pushes promise
batch.push(tasks[counter]());  // starts task, pushes promise
// both tasks are now running at the same time

// WITH await — tasks run one at a time (defeats the purpose)
batch.push(await tasks[counter]());  // waits for task to finish, pushes result
batch.push(await tasks[counter]());  // only now starts the second task
```

The key insight: **calling an async function starts it. `await` just waits for the result.** If you don't need the result yet, don't await — let it run in the background.

## Why `await Promise.all(batch)` needs the `await`

Without `await`, `Promise.all(batch)` returns a promise but doesn't wait for it. The `while` loop would immediately start the next batch while the current one is still running — destroying the batch behavior entirely.

```javascript
// WITHOUT await — batches overlap (broken)
let batchResult = Promise.all(batch);     // doesn't wait
results = results.concat(batchResult);    // concat a promise object, not results!
// while loop immediately starts next batch

// WITH await — batches are sequential (correct)
let batchResult = await Promise.all(batch);  // pauses here until all tasks finish
results = results.concat(batchResult);       // concat actual values
// while loop starts next batch only now
```

## Why `results.concat()` instead of `results.push()`?

`push` adds a single element. If `batchResult` is `[1, 2, 3]`, then `results.push(batchResult)` gives you `[[1, 2, 3]]` — an array inside an array.

`concat` merges arrays: `results.concat([1, 2, 3])` gives you `[...results, 1, 2, 3]` — a flat list. Since `Promise.all` returns an array, `concat` is the right choice to build a flat results array.

## How this compares to Promise Pool

Both limit concurrency, but in different ways:

| | **Promise Pool** | **Batch Executor** |
|---|---|---|
| When does the next task start? | As soon as any worker finishes | After the entire batch finishes |
| Idle time | None — workers always grab more work | Fast tasks wait for the slowest in their batch |
| Where is `await`? | Inside each worker (`await tasks[index]()`) | On `Promise.all(batch)` |
| Parallelism | Dynamic — workers self-balance | Fixed — always `batchSize` at a time |

Visual comparison with 4 tasks (concurrency/batchSize = 2), where task B is slow:

```
Promise Pool:
  Worker 1: [A ✓] [C ✓] [D ✓]
  Worker 2: [B ~~~~~~~~~~~✓]
  Total: ~~~~~~~~~~~~ (fast tasks fill gaps)

Batch Executor:
  Batch 1:  [A ✓ idle...] [B ~~~~~~~~~~~✓]
  Batch 2:  [C ✓] [D ✓]
  Total: ~~~~~~~~~~~~~~~~~~ (A waits for B to finish)
```

## Mental model

Think of it like a shuttle bus at an airport:

- **Tasks** = passengers waiting to board
- **Batch size** = number of seats on the shuttle
- **`for` loop** = loading passengers onto the bus (everyone boards before the bus leaves)
- **`Promise.all`** = the bus driving to the terminal (everyone rides together)
- **`while` loop** = the bus coming back for the next group
- The bus doesn't leave early when half the seats are filled, and it doesn't come back for more passengers until everyone has arrived at the terminal
