# Model answer — the fake test script

Reported from a real session: the exhibit wasn't only code — it included a
`package.json` and a `package-lock.json`. The planted tell is one line, and
most candidates never open the scripts block.

## 1. Plain English, then technically

Plain English: this is the manifest of a small Node app — it starts with
`node index.js` and talks to MySQL via mysql2.

Technically: npm reads `scripts` and `dependencies` from here; the
`package-lock.json` next to it pins the exact resolved dependency tree so
`npm ci` installs are reproducible.

## 2. Errors / bad practices

- **The `test` script is npm's untouched default** —
  `echo "Error: no test specified" && exit 1` is exactly what `npm init`
  generates. Translation: **this project has no tests at all.** Say it out
  loud; it's the planted finding. (A variant reported from the interview was
  a plain `echo "no tests"`.)
- **`"mysql2": "*"`** accepts *any* version. The lockfile pins today's
  install, but any fresh resolve (`npm install mysql2`, `npm update`, a
  regenerated lockfile) can silently jump a major version.
- **Database credentials committed in the `config` block** — and in every
  clone and the full git history.
- No `engines` field, no `"private": true` guard against accidental publish.

## 3. How would you refactor

```json
{
  "name": "sentence-tools",
  "version": "1.0.0",
  "private": true,
  "main": "index.js",
  "engines": { "node": ">=20" },
  "scripts": { "test": "node --test", "start": "node index.js" },
  "dependencies": { "mysql2": "^3.9.0" }
}
```

- A real test runner (`node --test` needs zero dependencies) and at least one
  smoke test.
- A sane semver range instead of `*`.
- Credentials to environment variables (dotenv locally, a secrets manager in
  deployment) — then **rotate** them; deleting the line doesn't delete history.

## 4. Security / maintainability risks

- **Committed credentials** — top risk, and rotation is the fix, not removal.
- **Supply chain**: `*` + lockfile drift means a hijacked release gets adopted
  automatically on the next resolve.
- **No tests** means every refactor you proposed for the code next door is
  unverifiable. The strongest closing line ties the files together: “before I
  touch index.js, I'd give this project one passing test — right now nothing
  protects any change I make.”
