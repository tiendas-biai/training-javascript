# Model answer — query → loop → reverse

The composition reported from a real session: a mysql2-style query whose
callback loops over the rows and pushes each one through a hand-rolled
`reverse`. Answer the four questions in order.

## 1. Plain English, then technically

Plain English: it fetches every post with more than N likes and prints each
post's words in reverse order.

Technically: a callback-style query (`(err, rows)` signature). For each row,
`text.split(' ')` tokenizes the sentence, `reverse` flips the array in place
with a two-pointer swap (walk it: length 4 → i=0 swaps 0↔3, i=1 swaps 1↔2,
loop stops at i=2 because `2 < 4/2` is false), and `join(' ')` rebuilds the
sentence.

## 2. Errors / bad practices

- **`err` is never checked.** On a query failure `rows` is `undefined` and
  `rows.length` throws a `TypeError` that masks the real error.
- **`var out = arr` in `reverse` copies the reference, not the array** — the
  name promises a copy that never happened; the caller's array is mutated.
- **Results are `console.log`-ed instead of returned** (or passed to a
  callback), so the function can't be used by other code and can't be tested.
- Callback API where mysql2 ships `mysql2/promise`; connection config built at
  module load with no pool and no cleanup; `var` everywhere.

## 3. How would you refactor

```js
const mysql = require('mysql2/promise');

const reverseWords = (s) => s.split(' ').reverse().join(' ');

async function getReversedPosts(pool, minLikes) {
  const [rows] = await pool.query(
    'SELECT text FROM posts WHERE likes > ?',
    [minLikes]
  );
  return rows.map((r) => reverseWords(r.text));
}
```

Parameterized query, async/await, data returned to the caller, printing left
to the CLI edge — and `reverseWords` is now a pure function with a unit test.

## 4. Security / maintainability risks

- **SQL injection** via the concatenated `minLikes` (string-built SQL is never
  OK for anything user-influenced).
- **Hardcoded root credentials** in source — they also live in git history
  forever; move to environment variables and rotate.
- DB access and string logic welded together — the pure part should be
  extracted so it tests without a database.
