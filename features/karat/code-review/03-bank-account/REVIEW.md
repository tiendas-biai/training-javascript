# Model review — bank-account

## 1. Plain English, then technical

**Plain English:** a bank account class that supports reading the balance,
withdrawing, depositing, adding interest, and transferring to another account.

**Technical:** every operation is read-modify-write: read the balance (async,
like a DB read), compute, write back. `withdraw` guards with a balance check;
`transferTo` composes withdraw + deposit inside a try/catch.

## 2. Errors, mistakes, bad practices

- **`transferTo` ignores `withdraw`'s return value.** `withdraw` reports
  insufficient funds by returning `false`, not throwing — so the transfer
  deposits money that was never withdrawn (run the file: 50 appears from
  nothing). Mixed error channels (return codes vs exceptions) is the root
  smell; pick one and make callers respect it.
- **Empty catch in `transferTo`** — a real failure between the two steps is
  swallowed, and a half-completed transfer is silently accepted.
- **No validation of `amount`** — negative amounts turn `withdraw` into a
  deposit.

## 3. Refactor

- Make the balance change **atomic where the data lives**: a conditional
  update — `UPDATE accounts SET balance = balance - ? WHERE id = ? AND
  balance >= ?` — then check affected rows; or a transaction with row locking
  (`SELECT … FOR UPDATE`) covering the whole transfer.
- Make `withdraw` **throw** a typed error (`InsufficientFundsError`) so
  composition can't ignore failure; or return a result the caller must check
  (and check it).
- Represent money as **integer cents** (or a decimal type). Validate
  `amount > 0`.
- A transfer must be **one transaction**, not two independent operations —
  otherwise a crash between them loses or creates money.

## 4. Security & maintainability risks

1. **Check-then-act race condition** — the headline. Two concurrent
   withdrawals both read 100, both pass `balance >= 80`, both write. The demo
   prints `[true, true]` and a plausible-looking final balance: the account
   paid out 160 from 100. Note that an in-process lock is *not* a full fix —
   production runs multiple instances, so atomicity must live in the database.
   Also mention retries: a client that retries a timed-out withdraw repeats
   it — idempotency keys make retries safe.
2. **Floating-point money** — `0.1 + 0.2` prints the famous
   `0.30000000000000004`; sums drift and equality checks lie. Integer cents.
3. **Maintainability** — error-channel inconsistency (return vs throw) is a
   trap for every future caller; the silent catch hides production incidents.
