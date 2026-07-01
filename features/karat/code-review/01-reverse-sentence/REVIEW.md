# Model review — reverse-sentence

## 1. Plain English, then technical

**Plain English:** it looks up a sentence in the database by its id and prints
the sentence with its words in reverse order.

**Technical:** `db.query` fetches the row; the callback splits the text on
spaces into an array `w`, then reverses it **in place** with a two-pointer swap:
the loop runs to the midpoint (`i < w.length / 2`) and swaps `w[i]` with
`w[w.length - 1 - i]`. Trace length 4: i=0 swaps 0↔3, i=1 swaps 1↔2, loop ends
at i=2 — correct. Odd lengths leave the middle word untouched, also correct.
The result is joined and printed.

## 2. Errors, mistakes, bad practices

- **`err` is ignored.** First callback parameter is never checked; a query
  failure crashes on the next line instead of being handled.
- **`rows[0]` unchecked.** An id with no row makes `rows[0].text` throw
  (`reverse(99)` demonstrates it: `Cannot read properties of undefined`).
- **Result is printed, not returned.** The function can't be used by other
  code or tested — it's welded to the console.
- **`var` everywhere, callback style.** `const`/`let` and async/await are the
  modern baseline.
- **Root DB user.** Application code should run under a least-privilege user.
- **The swap loop re-implements `Array.prototype.reverse()`.** Not a bug —
  but say that `w.reverse()` does the same thing in one readable call.

## 3. Refactor

```js
async function reversedSentence(pool, id) {
  const numericId = Number(id);
  if (!Number.isInteger(numericId)) throw new Error('invalid id');
  const [rows] = await pool.query(
    'SELECT text FROM sentences WHERE id = ?',
    [numericId]
  );
  if (rows.length === 0) return null;
  return rows[0].text.split(' ').reverse().join(' ');
}
```

Parameterized query, validated input, awaited result, empty-result handling,
returns a value, pure string logic separable and testable.

## 4. Security & maintainability risks

- **SQL injection** — `id` is concatenated into the SQL string. `1 OR 1=1`
  changes the query's meaning; parameterized queries (`?` + values array) make
  that impossible. This is the headline finding; name it first.
- **Hardcoded credentials** — `root123` lives in source and in git history
  forever; move to environment variables / a secrets manager and rotate.
- **Maintainability** — DB access, business logic and output are one blob;
  the refactor above separates them, which is what makes it unit-testable.
