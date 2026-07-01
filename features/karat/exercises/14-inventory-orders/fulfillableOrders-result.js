/**
 * Ships all-or-nothing orders against shared stock, in order.
 * @param {string[]} inventory — 'sku:qty' entries; repeated SKUs add up
 * @param {Array<{id: string, lines: Array<[string, number]>}>} orders
 * @returns {string[]} — ids of shipped orders, in processing order
 */
function fulfillableOrders(inventory, orders) {
  // Parse at the boundary: Map<sku, number>, aggregating repeated entries.
  const stock = new Map()
  for (const entry of inventory) {
    const [sku, qty] = entry.split(':')
    stock.set(sku, (stock.get(sku) ?? 0) + Number(qty))
  }

  const shipped = []
  for (const { id, lines } of orders) {
    // An order may repeat a SKU across lines — aggregate its demand first,
    // otherwise two lines can each pass the check while their sum does not.
    const demand = new Map()
    for (const [sku, qty] of lines) {
      demand.set(sku, (demand.get(sku) ?? 0) + qty)
    }

    // CHECK — read-only pass; a failed order must leave stock untouched.
    let ok = true
    for (const [sku, qty] of demand) {
      if ((stock.get(sku) ?? 0) < qty) {
        ok = false
        break
      }
    }
    if (!ok) continue

    // COMMIT — only after the whole order passed.
    for (const [sku, qty] of demand) {
      stock.set(sku, stock.get(sku) - qty)
    }
    shipped.push(id)
  }
  return shipped
}

module.exports = { fulfillableOrders }
