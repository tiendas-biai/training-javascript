# Promise Chain Recovery - Answers

## Question 1

```javascript
Promise.resolve('a')
  .then(v => {
    throw new Error(v);
  })
  .catch(e => {
    return e.message + 'b';
  })
  .then(v => console.log(v))
  .catch(e => console.log('error:', e.message));
```

### Answer: `ab`

### Explanation

1. `Promise.resolve('a')` — creates a fulfilled Promise with value `'a'`
2. `.then(v => { throw new Error(v) })` — throws an error, so the chain switches to the **rejected** path
3. `.catch(e => { return e.message + 'b' })` — catches the error and returns a normal value (`'ab'`). This **recovers** the chain back to the fulfilled path
4. `.then(v => console.log(v))` — receives `'ab'` and logs it
5. The final `.catch` is never called because the chain is no longer rejected

### Key takeaway

`.catch` is just `.then(undefined, onRejected)`. When it returns a normal value (not a throw or rejected Promise), the chain recovers to the **fulfilled** path. This is how you handle errors and continue execution in Promise chains.

---

## Question 2

```javascript
Promise.resolve(1)
  .then(v => v + 1)
  .then(v => { throw new Error('oops') })
  .then(v => v + 1)
  .catch(e => 10)
  .then(v => console.log(v));
```

### Answer: `10`

### Explanation

1. `Promise.resolve(1)` — fulfilled with `1`
2. `.then(v => v + 1)` — returns `2`
3. `.then(v => { throw new Error('oops') })` — throws, chain switches to **rejected** path
4. `.then(v => v + 1)` — **skipped** because the chain is rejected and `.then` only handles fulfilled promises
5. `.catch(e => 10)` — catches the error and returns `10`, **recovering** the chain
6. `.then(v => console.log(v))` — receives `10` and logs it

### Key takeaway

Rejected promises **skip all `.then` handlers** until a `.catch` (or a `.then` with a second argument) is found. Once `.catch` returns a normal value, the chain recovers to the fulfilled path.

---

## Question 3

```javascript
Promise.reject('error')
  .catch(e => e)
  .catch(e => console.log('caught:', e))
  .then(v => console.log('then:', v));
```

### Answer: `then: error`

### Explanation

1. `Promise.reject('error')` — creates a rejected Promise with value `'error'`
2. `.catch(e => e)` — catches the rejection and returns `'error'` (a normal value). The chain **recovers** to fulfilled
3. `.catch(e => console.log('caught:', e))` — **skipped** because the chain is now fulfilled
4. `.then(v => console.log('then:', v))` — receives `'error'` and logs `then: error`

### Key takeaway

Multiple `.catch` handlers don't all run — only the first one that encounters a rejected promise executes. Once it returns a normal value, subsequent `.catch` handlers are skipped just like `.then` skips on rejection.

---

## The big picture: how Promise chains flow

A Promise chain has two paths: **fulfilled** and **rejected**. Each `.then` or `.catch` can switch between them:

```
fulfilled path ──→ .then(callback) ──→ callback returns normally? → fulfilled path
                                    ──→ callback throws?          → rejected path

rejected path ──→ .then(callback) ──→ SKIPPED, stays rejected

rejected path ──→ .catch(callback) ──→ callback returns normally? → fulfilled path
                                    ──→ callback throws?          → rejected path

fulfilled path ──→ .catch(callback) ──→ SKIPPED, stays fulfilled
```

The chain always follows one path at a time. `.then` only runs on the fulfilled path. `.catch` only runs on the rejected path. And either one can switch the path for everything that comes after it.
