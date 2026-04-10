# Promise Pool - Solution

```javascript
async function promisePool(tasks, concurrency) {
    let currentIndex = 0;
    let results = new Array(tasks.length);
    async function useWorker() {
        while (currentIndex < tasks.length) {
            const index = currentIndex++;
            results[index] = await tasks[index]();
        }
    }
    let workers = [];
    let numberOfWorkers = Math.min(concurrency, tasks.length)
    for (let i=0; i<numberOfWorkers; ++i){
        workers.push(useWorker())
    }
    await Promise.all(workers)
    return results;
}
```

## How Promise.all works

`Promise.all` takes an array of promises and returns a single promise that resolves when **all** of them resolve. Critically, it doesn't *run* anything — the promises are already running. It just waits for all of them to finish.

```javascript
const p1 = doSomething();   // already running
const p2 = doSomethingElse(); // already running

await Promise.all([p1, p2]); // just waits for both to finish
```

This is different from awaiting sequentially:

```javascript
await doSomething();      // waits until done
await doSomethingElse();  // only starts AFTER the first one finishes
```

The key: **a promise starts running the moment the function is called**, not when you `await` it. `await` just pauses your code until the result is ready. `Promise.all` lets you pause for *multiple* promises at once.

## How the worker pattern works

This is the trickiest part. Let's trace through an example with 5 tasks and concurrency of 2.

### Step 1: Workers are created

```javascript
for (let i = 0; i < 2; i++) {
    workers.push(useWorker());  // calling useWorker() starts executing it
}
```

Each `useWorker()` call **immediately starts executing** the async function. It doesn't wait — it returns a promise and begins running the function body. So after this loop, two workers are already running.

### Step 2: Each worker grabs a task

Both workers enter the `while` loop and grab a task:

```
Worker 0: grabs task[0], awaits it
Worker 1: grabs task[1], awaits it
```

When a worker hits `await tasks[index]()`, that specific worker **pauses**. But the other worker keeps running independently. This is how concurrency works — `await` only pauses the function it's inside, not the entire program.

### Step 3: A worker finishes and grabs the next task

Say task[1] finishes first. Worker 1 resumes, loops back to the `while`, and grabs task[2]:

```
Worker 0: still waiting on task[0]
Worker 1: grabs task[2], awaits it
```

This is the "pool" behavior — **the worker doesn't wait for permission. It just loops back and picks up the next available task.** The shared `currentIndex` acts as a queue pointer.

### Step 4: Workers drain the queue

This continues until `currentIndex >= tasks.length`. Each worker exits the loop and its async function resolves:

```
Worker 0: done (ran tasks 0, 3)
Worker 1: done (ran tasks 1, 2, 4)
```

### Step 5: Promise.all resolves

```javascript
await Promise.all(workers);
```

Both worker promises have resolved, so `Promise.all` resolves too. The results array is filled in order because each worker stored its result at `results[index]`.

## Why `await` is the key to everything

Without `await` inside the worker, all tasks would fire at once — the `while` loop would run synchronously and call every task without waiting. The `await` is what creates the "one task at a time per worker" behavior:

```javascript
// WITHOUT await — all tasks fire immediately (defeats the purpose)
while (currentIndex < tasks.length) {
    const index = currentIndex++;
    results[index] = tasks[index](); // no await = no waiting = no concurrency limit
}

// WITH await — worker pauses, other workers get CPU time
while (currentIndex < tasks.length) {
    const index = currentIndex++;
    results[index] = await tasks[index](); // pauses HERE, lets other workers run
}
```

## Why `Math.min(concurrency, tasks.length)`?

If you have 2 tasks but concurrency is 5, you only need 2 workers. The extra 3 would enter the `while` loop, see `currentIndex >= tasks.length`, and exit immediately — harmless but wasteful. `Math.min` avoids creating workers that have nothing to do.

## Why `currentIndex++` and not two separate lines?

```javascript
const index = currentIndex++;
```

This is shorthand for:

```javascript
const index = currentIndex;
currentIndex = currentIndex + 1;
```

It captures the current value *and* increments in one step. This matters because after the `await`, another worker might have changed `currentIndex`. By capturing it first, each worker remembers which task it's responsible for.

## Mental model

Think of it like a grocery store with multiple checkout lanes:

- **Tasks** = customers in a single line
- **Workers** = checkout lanes (cashiers)
- **Concurrency** = number of open lanes
- **`currentIndex`** = the "next in line" sign
- **`await`** = the cashier scanning items (takes time, one customer at a time per lane)
- **`Promise.all`** = the store manager waiting for all lanes to finish

Each lane processes one customer at a time. When a lane finishes, the next customer in line steps up. The manager doesn't leave until every lane is done and every customer is served.
