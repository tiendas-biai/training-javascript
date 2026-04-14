# Promise.any - Solution

```javascript
function promiseAny(promises) {
    const failed = [];
    let rejectedCount = 0;

    return new Promise((resolve, reject) => {
        if (promises.length === 0) {
            reject(new AggregateError([]));
            return;
        }
        promises.forEach((promise, i) => {
            Promise.resolve(promise)
                .then(resolve)
                .catch((error) => {
                    failed[i] = error;
                    rejectedCount++;
                    if (rejectedCount === promises.length) {
                        reject(new AggregateError(failed));
                    }
                });
        });
    });
}
```

## How `promiseAny` works

`promiseAny` is structurally the mirror of `promiseAll`:

- `promiseAll` — `.then` collects, `.catch` exits early
- `promiseAny` — `.then` exits early, `.catch` collects

We wrap everything in a `new Promise(...)` so we can call `resolve`/`reject` from inside each per-promise handler. The first `.then` that fires wins the race and calls `resolve(value)` — later calls to `resolve` are no-ops because a promise can only settle once. The `.catch` handlers accumulate errors until every input has rejected, then reject with an `AggregateError`.

### Why the `failed` array is indexed, not pushed

```javascript
failed[i] = error;
```

Not `failed.push(error)`. If you pushed, the errors would end up in **settle order** (fastest rejection first), not **input order**. The test `"AggregateError preserves order of rejections"` explicitly checks that input order is preserved:

```javascript
await promiseAny([
    new Promise((_, reject) => setTimeout(() => reject('slow'), 100)),
    new Promise((_, reject) => setTimeout(() => reject('fast'), 10)),
]);
// err.errors must be ['slow', 'fast'] — input order
```

`'fast'` rejects first at 10ms but belongs at index 1. `'slow'` rejects second at 100ms but belongs at index 0. Indexing by `i` places each error in its original slot regardless of timing.

### Why a separate counter, not `failed.length`

This is the subtle one. A natural first attempt is:

```javascript
failed[i] = error;
if (failed.length === promises.length) { reject(...); }
```

But `failed` is a **sparse array**. When `'fast'` rejects first:
- `failed[1] = 'fast'` → `failed = [<empty>, 'fast']`
- `failed.length === 2` (highest index + 1, not filled slots)
- This equals `promises.length`, so we reject **immediately**
- `AggregateError` goes out with `[<empty>, 'fast']` instead of `['slow', 'fast']`

Worse, we rejected before `'slow'` even settled.

A second attempt might be `failed.filter(v => v).length`, but that drops any **falsy** rejection reason: `0`, `null`, `''`, `false`, `undefined`. Nothing stops someone from doing `Promise.reject(0)`.

The fix is a plain counter:

```javascript
let rejectedCount = 0;
// ...
rejectedCount++;
if (rejectedCount === promises.length) { reject(...); }
```

Now the counter tracks *how many rejections have occurred*, independent of array bookkeeping and independent of what the rejection values look like.

### Why `.then(resolve)` is enough

```javascript
.then(resolve)
```

`resolve` is a function that takes one argument. When a promise fulfills with `value`, `.then(resolve)` calls `resolve(value)` — exactly what we want. No need for `.then(value => resolve(value))`.

The first resolve wins and settles the outer promise. All subsequent `resolve` and `reject` calls become no-ops. This is why we don't need a "stop processing" flag — Promise's own one-shot settlement semantics handle it for us.

### The empty-array edge case

```javascript
if (promises.length === 0) {
    reject(new AggregateError([]));
    return;
}
```

With no input promises, `forEach` never runs, so `rejectedCount` never increments and the outer promise would hang forever. Native `Promise.any([])` rejects immediately with an empty `AggregateError`, so we mirror that. The `return` is important — without it, we'd still run `forEach` (a no-op on an empty array, but leaving the code open-ended).

### Step-by-step trace

For the order-preservation test:

```
t=0ms
  forEach iteration 0: register handlers for 'slow' promise (index 0)
  forEach iteration 1: register handlers for 'fast' promise (index 1)
  rejectedCount = 0, failed = []

t=10ms  'fast' rejects
  .catch fires with 'fast'
  failed[1] = 'fast'   → failed = [<empty>, 'fast']
  rejectedCount = 1
  1 !== 2, don't reject yet

t=100ms  'slow' rejects
  .catch fires with 'slow'
  failed[0] = 'slow'   → failed = ['slow', 'fast']
  rejectedCount = 2
  2 === 2 → reject(new AggregateError(['slow', 'fast']))
```

And for the happy path (`ignores rejections if at least one fulfills`):

```
Promise.reject('fail1')  → .catch: failed[0] = 'fail1', rejectedCount = 1
Promise.resolve('success') → .then(resolve) → outer promise resolves with 'success'
Promise.reject('fail2')  → .catch: failed[2] = 'fail2', rejectedCount = 2
  (outer promise is already resolved — this reject is a no-op)
```

## Mental model

Think of a race with a podium:
- **First runner to finish** (fulfill) wins outright — `.then(resolve)`
- **Every runner that crashes** gets logged in the DNF list *in their bib number order* (input order), not the order they dropped out — `failed[i] = error`
- **Only if every runner crashes** do we announce the race failed, reading out the DNF list — `AggregateError(failed)`
- **Counting crashes by bib number** doesn't work because bibs have gaps — count people, not bibs — `rejectedCount`
