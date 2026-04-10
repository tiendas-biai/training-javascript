# Rate Limiter - Solution

```javascript
function sleep(timelapse){
    return new Promise((resolve)=>setTimeout(resolve,timelapse))
}

async function rateLimitedExecute(tasks, maxPerWindow, windowMs) {
    let counter = 0;
    let promises = [];
    while(counter<tasks.length){
        for (let i=0; i<maxPerWindow; i++){
            if (counter>=tasks.length){break}
            promises.push(tasks[counter]());
            counter++
        }
        if (counter < tasks.length){
            await sleep(windowMs);
        }
    }
    return await Promise.all(promises);
}
```

## How it works

The function launches tasks in groups of `maxPerWindow`, waits `windowMs` between each group, and collects all results at the very end. The crucial detail: tasks keep running in the background while we sleep — we're only pacing the **starts**, not waiting for results.

### Step-by-step trace

5 tasks, maxPerWindow = 2, windowMs = 1000ms. Tasks 0 and 3 are slow (1500ms), the rest are fast (100ms):

```
t=0ms:     for loop: tasks[0]() → starts, push promise   (running: 0)
           for loop: tasks[1]() → starts, push promise   (running: 0, 1)
           counter < tasks.length → sleep(1000)

t=100ms:   task 1 finishes ✓                             (running: 0)
           (we're still sleeping, not starting new tasks)

t=1000ms:  sleep done
           for loop: tasks[2]() → starts, push promise   (running: 0, 2)
           for loop: tasks[3]() → starts, push promise   (running: 0, 2, 3)
           counter < tasks.length → sleep(1000)

t=1100ms:  task 2 finishes ✓                             (running: 0, 3)

t=1500ms:  task 0 finishes ✓                             (running: 3)

t=2000ms:  sleep done
           for loop: tasks[4]() → starts, push promise   (running: 3, 4)
           counter >= tasks.length → no sleep

t=2100ms:  task 4 finishes ✓                             (running: 3)

t=2500ms:  task 3 finishes ✓                             (running: none)

           Promise.all resolves → [result0, result1, result2, result3, result4]
```

Notice at t=1000ms there are **3 tasks active** (0, 2, 3) even though maxPerWindow is 2. That's correct — we limit starts per window, not active tasks.

## Why calling a function returns a promise that's already running

This is the most important concept in the exercise. When you write:

```javascript
const p = fetch('/api/data');
```

The HTTP request fires **immediately**. The promise `p` is not a plan to do something — it's a handle to something that's **already happening**. You don't need to `await` it to start it. `await` just pauses your code until the result is ready.

```javascript
const p1 = tasks[0]();   // starts NOW
const p2 = tasks[1]();   // starts NOW

await sleep(5000);        // we wait 5 seconds, but p1 and p2 keep running

// p1 and p2 might already be done by now
const results = await Promise.all([p1, p2]); // just picks up the results
```

This is why `promises` can live **outside** the while loop. Each promise is pushed the moment the task starts. By the time we call `Promise.all` at the end, some tasks may have finished long ago — `Promise.all` just collects whatever results are ready (or waits for the ones that aren't).

## Why `promises` is outside the while loop

This is the key structural difference from the batch executor:

```javascript
// BATCH EXECUTOR — await per batch (waits for results before continuing)
while (counter < tasks.length) {
    let batch = [];                          // new array per batch
    // ... fill batch ...
    let result = await Promise.all(batch);   // wait HERE
    results = results.concat(result);
}

// RATE LIMITER — await once at the end (only paces the starts)
let promises = [];                           // ONE array for everything
while (counter < tasks.length) {
    // ... push to promises ...
    await sleep(windowMs);                   // only paces starts, not results
}
return await Promise.all(promises);          // wait HERE, once
```

In the batch executor, each batch's results are collected before moving on. In the rate limiter, we don't care when tasks finish — we only care when they **start**. The single `Promise.all` at the end waits for everything at once.

## Why skip sleep on the last batch

```javascript
if (counter < tasks.length) {
    await sleep(windowMs);
}
```

Without this check, after launching the last batch we'd sleep for `windowMs` for no reason — there are no more tasks to space out. It's a small optimization that avoids unnecessary delay.

## How this compares to the other exercises

| | **Promise Pool** | **Batch Executor** | **Rate Limiter** |
|---|---|---|---|
| What it limits | Active tasks | Tasks per batch | Task starts per time window |
| When does next task start? | When a worker finishes | After entire batch finishes | After `windowMs` elapses |
| Can tasks overlap across groups? | N/A (continuous) | No | Yes |
| Where is `await`? | Inside each worker | On `Promise.all` per batch | On `sleep` + one final `Promise.all` |
| Max active at once | `concurrency` | `batchSize` | Unbounded (tasks pile up) |

Visual comparison — 4 tasks, limit of 2, task A is slow:

```
Promise Pool (concurrency: 2):
  Worker 1: [A ~~~~~~~~~~~~✓] [D ✓]
  Worker 2: [B ✓] [C ✓]
  Max active: 2 (always)

Batch Executor (batchSize: 2):
  Batch 1:  [A ~~~~~~~~~~~~✓]     ← B finished but waits for A
            [B ✓ ...idle...]
  Batch 2:  [C ✓] [D ✓]
  Max active: 2 (always)

Rate Limiter (2 per 1000ms):
  Window 1: [A ~~~~~~~~~~~~✓]     ← A is still running when window 2 starts
            [B ✓]
  Window 2: [C ✓] [D ✓]
  Max active: 3 (at t=1000ms: A + C + D)
```

## Mental model

Think of it like a highway on-ramp with a traffic light:

- **Tasks** = cars waiting to enter the highway
- **`maxPerWindow`** = how many cars the light lets through per cycle
- **`windowMs`** = how long each cycle lasts
- **`sleep`** = the red light (pauses new entries)
- **The highway** = tasks running in the background (cars already on the highway keep driving regardless of the light)
- **`Promise.all`** = waiting at the destination for all cars to arrive

The light doesn't control how fast cars drive on the highway. It only controls how often new cars get on. That's why you can have more cars on the highway than the light allows per cycle — slow cars from earlier cycles haven't exited yet.
