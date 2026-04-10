# Timeout - Solution

```javascript
async function withTimeout(fn, ms) {
    return await Promise.race([new Promise((resolve, reject)=>{
        setTimeout(()=>{
            reject(new Error(`Operation timed out after ${ms}ms`))
        },ms)
    }),fn()])
}
```

## How Promise.race works

`Promise.race` takes an array of promises and settles with whichever one **settles first** — whether it resolves or rejects.

```javascript
const fast = new Promise(resolve => setTimeout(() => resolve('fast'), 100));
const slow = new Promise(resolve => setTimeout(() => resolve('slow'), 500));

await Promise.race([fast, slow]); // 'fast' — first one to resolve wins
```

Compare with `Promise.all`:

| | **Promise.all** | **Promise.race** |
|---|---|---|
| Resolves when... | **All** promises resolve | **First** promise resolves |
| Rejects when... | **Any** promise rejects | **First** promise settles (if it's a rejection) |
| Returns | Array of all results | Single result from the winner |

## How the timeout works

The solution races two promises against each other:

```javascript
Promise.race([
    timeoutPromise,  // rejects after ms milliseconds
    fn()             // the actual task
])
```

**Scenario 1: fn() finishes first (before timeout)**
```
t=0ms:     fn() starts, setTimeout starts
t=200ms:   fn() resolves with 'data' → Promise.race resolves with 'data' ✓
t=3000ms:  setTimeout fires, but nobody is listening anymore
```

**Scenario 2: timeout fires first (fn() is too slow)**
```
t=0ms:     fn() starts, setTimeout starts
t=3000ms:  setTimeout fires → reject(new Error(...)) → Promise.race rejects ✗
t=5000ms:  fn() finally resolves, but nobody is listening anymore
```

**Scenario 3: fn() rejects on its own (before timeout)**
```
t=0ms:     fn() starts, setTimeout starts
t=100ms:   fn() rejects with Error('db failed') → Promise.race rejects with that error ✗
t=3000ms:  setTimeout fires, but nobody is listening anymore
```

## Why `new Promise` for the timeout

You need `new Promise` because you're creating a promise from scratch — one that rejects after a delay. There's no built-in "reject after N ms" function in JavaScript, so you build it yourself:

```javascript
new Promise((resolve, reject) => {
    setTimeout(() => {
        reject(new Error(`Operation timed out after ${ms}ms`))
    }, ms)
})
```

This is the opposite of the `sleep` helper you built in previous exercises. `sleep` **resolves** after a delay. Here you **reject** after a delay.

```javascript
// sleep — resolves after delay (for waiting)
new Promise(resolve => setTimeout(resolve, ms))

// timeout — rejects after delay (for deadlines)
new Promise((_, reject) => setTimeout(() => reject(new Error('...')), ms))
```

## Why `reject(new Error(...))` and not `reject('string')`

Rejecting with a string works at runtime, but it's not how errors are meant to be used:

```javascript
reject('Operation timed out')           // string — no .message, no stack trace
reject(new Error('Operation timed out')) // Error — has .message and .stack
```

`Error` objects carry a `.message` property and a `.stack` trace, which makes debugging much easier. Most error-handling code (including `.toThrow()` in Jest) expects `Error` instances.

## What happens to the "loser" of the race?

This is a subtle but important point. When the timeout fires first, `fn()` is **still running** in the background. JavaScript has no way to cancel a running promise.

```javascript
// If fn() is a network request that takes 30 seconds:
t=0ms:     fetch starts, timeout starts
t=3000ms:  timeout fires → Promise.race rejects
           fetch is STILL running in the background
t=30000ms: fetch finally completes, but the result is ignored
```

The abandoned promise eventually resolves or rejects, but since nothing is listening, it's silently discarded. This is generally fine, but worth knowing — the work isn't truly "cancelled", just ignored.

In real applications, if you need true cancellation (e.g., aborting a network request), you'd use `AbortController`:

```javascript
const controller = new AbortController();
setTimeout(() => controller.abort(), 3000);
fetch('/api/data', { signal: controller.signal }); // actually cancels the request
```

But that's a different pattern — `Promise.race` gives you timeout behavior, `AbortController` gives you cancellation.

## Mental model

Think of it like ordering food with a time limit:

- **`fn()`** = the kitchen preparing your meal
- **Timeout promise** = an alarm clock you set when you order
- **`Promise.race`** = you take whichever happens first — food arrives or alarm goes off
- If the food arrives first → you eat (resolve with result)
- If the alarm goes off first → you leave (reject with timeout error)
- The kitchen doesn't stop cooking when you leave — your food is just wasted (the abandoned promise)
