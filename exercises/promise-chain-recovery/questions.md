# Promise Chain Recovery

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

