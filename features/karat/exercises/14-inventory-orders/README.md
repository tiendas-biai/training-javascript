# Exercise 14: Inventory Orders

## Question

A warehouse's stock is given as an array of `'sku:qty'` strings (the same SKU
may appear multiple times — quantities add up). Orders arrive as
`{ id, lines }` objects where `lines` is a list of `[sku, qty]` pairs.

Orders are processed **in the given order** and are **all-or-nothing**: an
order ships only if *every* line can be satisfied from current stock. A
shipped order consumes its quantities; a rejected order consumes **nothing**
(stock must be untouched for the following orders).

Write a function `fulfillableOrders(inventory, orders)` that returns the ids
of the orders that ship, in processing order.

### Example

```js
const inventory = ['apple:5', 'banana:2', 'apple:1'] // apple totals 6

const orders = [
  { id: 'A', lines: [['apple', 4], ['banana', 1]] }, // ships → apple 2, banana 1
  { id: 'B', lines: [['apple', 3]] },                // needs 3, only 2 → rejected
  { id: 'C', lines: [['apple', 2], ['banana', 1]] }, // ships with what's left
]

fulfillableOrders(inventory, orders) // => ['A', 'C']
```

The trap is procedural: decrement stock while checking, hit an unsatisfiable
line halfway through, and you've corrupted the inventory for every later
order. The fix — **check everything, then commit** — is a baby transaction.
