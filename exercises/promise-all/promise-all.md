# Promise.all

Implement your own version of `Promise.all`.

It takes an array of promises and:
- Resolves with an array of all results (in order) when every promise fulfills
- Rejects immediately with the first error if any promise rejects

```javascript
// Usage:
promiseAll([
  Promise.resolve(1),
  Promise.resolve(2),
  Promise.resolve(3),
]).then(results => console.log(results)); // [1, 2, 3]

promiseAll([
  Promise.resolve(1),
  Promise.reject(new Error('fail')),
  Promise.resolve(3),
]).catch(e => console.log(e.message)); // 'fail'
```

Write `promiseAll(promises)`. No using `Promise.all` — build it from scratch.

Hints:
- You'll need `new Promise` for this one — you're coordinating multiple promises
- Think about how to track which promises have resolved and maintain order
- What should happen with an empty array?
