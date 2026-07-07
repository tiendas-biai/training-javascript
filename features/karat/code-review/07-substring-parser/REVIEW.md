# Model answer — the substring parser

A var-heavy character-scan parser using `substring` where `slice` (or no
manual scanning at all) is the right tool. The skill being tested is speed:
recognize the reimplemented built-in fast, then show you know what the honest
rewrite still *doesn't* handle.

## 1. Plain English, then technically

Plain English: it turns CSV text into an array of rows, each row an array of
field strings.

Technically: `parseLine` scans character by character, remembering where the
current field starts; at each comma it cuts a field with `substring(start, i)`
and after the loop flushes the tail with `substring(start, line.length)`.
`parseCsv` splits on `\n` and skips empty lines.

## 2. Errors / bad practices

- **The whole of `parseLine` is `line.split(',')`** reimplemented in nine
  lines of index bookkeeping.
- `line.substring(i, i + 1)` as a one-character test — `line[i]` says it
  honestly. (Same family as `substring(max, 0)` "working" only because
  substring swaps out-of-order arguments; `slice` never swaps.)
- **No quoted-field support**: `"Smith, John",42` splits inside the quotes;
  escaped quotes (`""`) and newlines inside quoted fields are equally broken.
- **CRLF files leave `\r` glued to the last field of every row** — invisible
  in a console.log, lethal in comparisons (the third demo call shows it).
- Loose `==` / `!=`; `var` throughout.

## 3. How would you refactor

Be honest about scope. For simple, unquoted data you control:

```js
function parseCsv(text) {
  return text
    .split(/\r?\n/)          // handles LF and CRLF
    .filter((line) => line !== '')
    .map((line) => line.split(','));
}
```

The moment quoting matters, real CSV (RFC 4180) is a state machine — use
csv-parse or PapaParse. "Hand-rolling CSV is a known bug farm" is the line.

## 4. Security / maintainability risks

- **Silently mis-parsed data is worse than a crash** — wrong rows flow
  downstream with no error to catch.
- If the output ever feeds spreadsheets, mention CSV/formula injection
  (`=cmd(...)` in a field) as a hardening concern.
- Maintainability: six lines of index arithmetic vs one `split` — plus the
  format edge cases the hand-rolled version hides.
