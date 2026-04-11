# Promise Chain Recovery

## Where you'll see this in the real world

- **Express error handling** — Express middleware chains work like promise chains. An error skips normal middleware until it hits an error handler (`app.use((err, req, res, next) => ...)`), which can "recover" and continue
- **Axios interceptors** — response interceptors can catch errors (like a 401) and recover by refreshing the token and retrying, letting the rest of the chain continue normally
- **Redux Toolkit (RTK Query)** — `queryFn` chains handle API errors and can recover with fallback data, similar to `.catch` returning a value
- **RxJS (Angular)** — the `catchError` operator works exactly like `.catch` in a promise chain: it catches errors and can recover by returning a new Observable

---

## Question

What does the following code output?

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

---

## Question 2

What does this code output?

```javascript
Promise.resolve(1)
  .then(v => v + 1)
  .then(v => { throw new Error('oops') })
  .then(v => v + 1)
  .catch(e => 10)
  .then(v => console.log(v));
```

---

## Question 3

What does this code output?

```javascript
Promise.reject('error')
  .catch(e => e)
  .catch(e => console.log('caught:', e))
  .then(v => console.log('then:', v));
```

