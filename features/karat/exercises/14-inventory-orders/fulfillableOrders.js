// TODO: Implement `fulfillableOrders(inventory, orders)`.
//
// inventory: ['sku:qty', ...] strings — same SKU may repeat, quantities add.
// orders: [{ id, lines: [[sku, qty], ...] }, ...] processed in order,
// all-or-nothing: ship only if EVERY line fits current stock; a shipped
// order consumes stock, a rejected order consumes NOTHING.
// Return the shipped order ids in processing order.
//
//   fulfillableOrders(['apple:5', 'banana:2', 'apple:1'], [
//     { id: 'A', lines: [['apple', 4], ['banana', 1]] },
//     { id: 'B', lines: [['apple', 3]] },
//     { id: 'C', lines: [['apple', 2], ['banana', 1]] },
//   ]) => ['A', 'C']
//
// Plan: parse inventory into Map<sku, number> (Number the qty!), then per
// order: a read-only CHECK pass over all lines, and only if all pass, a
// COMMIT pass that decrements. Watch out for orders repeating a SKU.
//
// Run: npx jest features/karat/exercises/14-inventory-orders/fulfillableOrders.test.js

function fulfillableOrders(inventory, orders) {
  return []
}

module.exports = { fulfillableOrders }
