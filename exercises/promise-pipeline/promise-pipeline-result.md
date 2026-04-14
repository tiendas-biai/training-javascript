# Promise Pipeline - Solution

```javascript
async function pipeline(functions, initialValue) {
    let output = initialValue;
    for (let i = 0; i < functions.length; i++) {
        const fn = functions[i];
        output = await fn(output);
    }
    return output;
}
```

## How the pipeline pattern works

`pipeline` threads a value through a sequence of async steps, where each step's output becomes the next step's input. The loop is dead simple — an `output` accumulator, overwritten on every iteration with the next function's resolved value.

Three properties make this work:

1. **Sequential, not parallel.** Each step needs the previous step's result, so they can't overlap. The `await` inside the loop is what enforces this — the next iteration doesn't start until `fn(output)` resolves.
2. **One value flows through.** Unlike `Promise.all` (which fans out and collects an array), pipeline carries a single value, rewriting it at each stage.
3. **Failures short-circuit.** A rejected `await` throws inside the `async` function, which exits the loop and propagates as a rejection to the caller. No manual error handling needed.

### Why `await` inside the loop serializes execution

This is the key difference from the parallel patterns (`promise.all`, `promisePool`, `asyncQueue`). Those fire multiple promises at once; pipeline doesn't.

```javascript
for (let i = 0; i < functions.length; i++) {
    output = await fn(output);  // blocks here until fn resolves
}
```

When JavaScript hits the `await`, the current function pauses. The loop doesn't advance to `i++` until `fn(output)` settles. That pause is exactly what we want — step 2 literally cannot start until step 1 has produced its output.

If you wrote this without `await` (e.g. `output = fn(output)`), `output` would end up being a *pending promise*, and the next `fn` would receive that promise object instead of the resolved value. Everything would break.

### Why errors propagate for free

```javascript
test('rejects if any step fails', async () => {
    await expect(pipeline([
        (x) => Promise.resolve(x + 1),
        (x) => Promise.reject(new Error(`bad value: ${x}`)),
        (x) => Promise.resolve(x * 2),
    ], 5)).rejects.toThrow('bad value: 6');
});
```

When step 2 rejects, `await fn(output)` throws inside the loop. No `catch` is present, so the throw bubbles out of the `async` function, which converts it back into a rejected promise for the caller. Step 3 is never reached — the loop never gets to `i === 2`.

This is a nice property: `async`/`await` + a plain loop gives you "fail fast" semantics automatically, the same way a normal synchronous loop would if one line threw.

### The empty array case

```javascript
await pipeline([], 42); // → 42
```

The `for` loop condition `i < 0` is false on entry, so the body never runs. `output` keeps its initial value (`initialValue`), and we return it. No special-case branch needed — the loop handles it naturally.

### Step-by-step trace

```javascript
pipeline([
    (x) => Promise.resolve(x + 1),
    (x) => Promise.resolve(x * 2),
    (x) => Promise.resolve(x + 10),
], 5);
```

```
output = 5

i=0: fn = (x) => Promise.resolve(x + 1)
     await fn(5) → resolves 6
     output = 6

i=1: fn = (x) => Promise.resolve(x * 2)
     await fn(6) → resolves 12
     output = 12

i=2: fn = (x) => Promise.resolve(x + 10)
     await fn(12) → resolves 22
     output = 22

loop exits
return 22
```

### Alternative: `reduce`

You can write the same pipeline as a promise chain built up with `reduce`:

```javascript
function pipeline(functions, initialValue) {
    return functions.reduce(
        (acc, fn) => acc.then(fn),
        Promise.resolve(initialValue)
    );
}
```

This starts with `Promise.resolve(initialValue)` as the accumulator, and each step tacks another `.then(fn)` onto the chain. By the time `reduce` finishes, you have one long promise chain that the caller awaits.

Both versions are correct and produce identical behavior. The `for`/`await` version is usually easier to read and step through in a debugger; the `reduce` version is more compact and shows off the "folding over a list" structure of the pattern. Pick whichever reads better to you.

## Mental model

Think of Unix pipes:

```
cat file | grep error | sort | uniq
```

- **`cat file`** is the `initialValue` — the raw input
- **Each `|` stage** is one function in the array
- **The value threading through** is whatever bytes the previous stage emitted
- **If any stage errors**, the whole pipeline aborts — later stages never see data
- **Empty pipeline** (`cat file` with no `|`) just passes the input through unchanged

Express/Koa middleware, Gulp task chains, Redux middleware, and ETL stages all share this shape: sequential steps transforming a single value, with errors stopping the chain.
