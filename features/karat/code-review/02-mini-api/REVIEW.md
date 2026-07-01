# Model review — mini-api

## 1. Plain English, then technical

**Plain English:** a tiny web API with two endpoints — one evaluates a math
expression sent by the client and returns the result, one saves a user.

**Technical:** `/calc` passes the request body's `expr` string to `eval`,
appends the raw expression to a log file synchronously, and responds with the
result plus an API key. `/user` takes the whole request body as the user
object and calls `saveUser`, swallowing any error, then always reports success.

## 2. Errors, mistakes, bad practices

- **`res.send({ ok: true })` after a swallowed error** — `/user` reports
  success even when `saveUser` threw (run it: the no-email user "saves" fine).
  Lying to clients is worse than failing.
- **Empty `catch (e) {}`** — the failure is also invisible to operators; at
  minimum log with context, normally return a 4xx/5xx.
- **`appendFileSync` in a request handler** — blocks the event loop; every
  concurrent request waits for this disk write.
- **`var`, no input validation, no size limits** anywhere.

## 3. Refactor

- `/calc`: remove `eval` — use a real expression parser (mathjs) or an
  allow-listed operations table; validate `expr` is a short string; log
  asynchronously (or to a proper logger); never include the key in responses.
- `/user`: validate the body against a schema (zod/Joi) — types, required
  fields, **reject unknown fields** (mass assignment: a client can send
  `isAdmin: true` and this code would persist it); let errors produce a 400/500
  instead of `ok: true`.

## 4. Security & maintainability risks

Ordered by severity — say them in this order:

1. **`eval(req.body.expr)` is remote code execution.** The second simulated
   call proves it: client-supplied code executed with the server's full
   permissions (`require('child_process')…` would work too). Worst possible
   finding; always name it first.
2. **Secret exposed twice** — hardcoded in source *and* returned in the
   response body. Env vars / secrets manager; rotate the key; never echo it.
3. **Unvalidated input written to disk** — unbounded size (disk-fill DoS) and
   attacker-controlled newlines (log injection / forged log lines).
4. **Mass assignment** — inserting `req.body` wholesale lets clients set
   fields you never intended.
5. **Maintainability** — no validation layer, no error strategy, handlers do
   I/O + logic + formatting; each fix above also gives the code seams.
