# Async Queue - Solution

```javascript
class AsyncQueue {
    constructor(concurrency) {
        this.queue = [];
        this.concurrenty = concurrency;
        this.running = 0;
    }

    run() {
        while (this.running < this.concurrenty && this.queue.length > 0) {
            const {fn, resolve, reject} = this.queue.shift();
            this.running++
            fn()
                .then(resolve)
                .catch(reject)
                .finally(() => {
                    this.running--;
                    this.run();
                })
        }
    }

    enqueue(fn) {
        return new Promise((resolve, reject) => {
            this.queue.push({fn, resolve, reject});
            this.run();
        })
    }
}
```

## How does the async queue pattern work?

Unlike `promisePool`, where all tasks are known upfront, `AsyncQueue` is a **dynamic** queue. Tasks can be added at any time — before any task starts, while others are running, or after the queue has drained.

The key ideas are:
1. **Each `enqueue()` call returns a promise that the caller awaits.**
2. **That promise is not tied to when the task is created — it's tied to when the task actually runs.**
3. **`run()` processes the queue whenever there's capacity**, whether that's right after an `enqueue` or after a previous task finishes.

### The deferred promise pattern

This is the trickiest concept. When you write:

```javascript
enqueue(fn) {
    return new Promise((resolve, reject) => {
        this.queue.push({ fn, resolve, reject });
        this.run();
    });
}
```

You're creating a promise that **you control from the outside**. Normally, `new Promise((resolve, reject) => { ... })` resolves inside the executor. Here, we save `resolve` and `reject` in the queue so they can be called **later**, when the task finally runs.

The caller immediately gets back a promise — but that promise won't settle until `run()` picks up this task and calls `resolve(result)` or `reject(error)`.

This decouples two things:
- **When the caller gets a promise** (immediately on `enqueue`)
- **When the task actually executes** (later, when there's capacity)

### Step-by-step trace

With `concurrency = 2`, enqueueing 3 tasks:

```
enqueue(task1) → queue: [{task1}], running: 0
  run() → running(0) < 2 and queue not empty → shift task1, running: 1, start task1
         → loop: running(1) < 2 and queue empty → exit

enqueue(task2) → queue: [{task2}], running: 1
  run() → running(1) < 2 and queue not empty → shift task2, running: 2, start task2
         → loop: running(2) = 2, not < 2 → exit

enqueue(task3) → queue: [{task3}], running: 2
  run() → running(2) = 2, not < 2 → exit immediately, task3 waits

...task1 finishes...
  .finally → running: 1, call run()
  run() → running(1) < 2 and queue not empty → shift task3, running: 2, start task3

...task2 finishes...
  .finally → running: 1, call run()
  run() → queue empty → exit

...task3 finishes...
  .finally → running: 0, call run()
  run() → queue empty → exit
```

### Why the `while` loop runs tasks in parallel

A common confusion: doesn't a `while` loop run things sequentially?

The loop itself is synchronous, but **the tasks inside are not awaited**:

```javascript
while (this.running < this.concurrenty && this.queue.length > 0) {
    // ...
    fn()                      // starts the task — does NOT wait
        .then(resolve)
        .catch(reject)
        .finally(() => { ... });
    // loop continues immediately
}
```

Each iteration:
1. Pulls a task from the queue
2. Increments `running`
3. Calls `fn()`, which returns a promise
4. Attaches `.then/.catch/.finally` handlers — synchronously registered, not awaited
5. Continues to the next iteration

So with `concurrency = 2`, the loop fires off both tasks in quick succession, then exits. Both tasks run in parallel.

Compare that to an `await` version:

```javascript
while (...) {
    await fn();  // blocks here — next iteration doesn't start until fn resolves
}
```

That would serialize them.

### How the queue refills: the self-recursive pattern

When a task finishes, `.finally()` calls `this.run()` again:

```javascript
.finally(() => {
    this.running--;
    this.run();
})
```

This checks if there are queued tasks and available slots, and starts more. It's not unbounded recursion — it only restarts the loop when there's actual work to do. If the queue is empty, `run()` does nothing.

There are two "entry points" for `run()`:
- **`enqueue()`** calls it when a new task arrives (starts the task if there's capacity)
- **`.finally()`** calls it when a task completes (starts the next queued task)

Together, they keep the queue flowing.

### Why tasks run in enqueue order

`this.queue.push({fn, resolve, reject})` adds to the **end**, and `this.queue.shift()` takes from the **front** — FIFO. As long as only one `run()` is draining the queue at a time, the order is preserved.

### Why a failed task doesn't block the queue

```javascript
fn()
    .then(resolve)
    .catch(reject)
    .finally(() => {
        this.running--;
        this.run();
    });
```

`.finally()` fires whether the task resolved or rejected. So `running` is always decremented and `run()` is always called next — rejected tasks don't leave `running` incorrectly incremented and don't prevent the next task from starting.

## Mental model

Think of a restaurant with N chefs (`concurrency`) and a ticket rail:

- **`enqueue(fn)`** = a waiter clips a ticket to the rail. They hand the customer a promise: "here's your meal, it'll come when it comes."
- **`queue`** = the ticket rail with pending orders
- **`running`** = how many chefs are currently cooking
- **`run()`** = "is there an idle chef? Grab the next ticket."
- **`.finally() → run()`** = when a chef finishes a dish, they check the rail for the next ticket
- **`resolve/reject` stored with the ticket** = the waiter needs to know *which customer* to hand the finished dish to

The customer (caller) never knows or cares how long they waited — they just await their promise, and it resolves when the kitchen gets to them.
