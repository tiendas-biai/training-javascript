const { fulfillableOrders } = require('./fulfillableOrders-result')

describe('fulfillableOrders (result)', () => {
  const inventory = ['apple:5', 'banana:2', 'apple:1']

  it('ships orders that fit and skips ones that do not', () => {
    const orders = [
      { id: 'A', lines: [['apple', 4], ['banana', 1]] },
      { id: 'B', lines: [['apple', 3]] },
      { id: 'C', lines: [['apple', 2], ['banana', 1]] },
    ]
    expect(fulfillableOrders(inventory, orders)).toEqual(['A', 'C'])
  })

  it('aggregates repeated SKUs in the inventory', () => {
    expect(fulfillableOrders(inventory, [{ id: 'X', lines: [['apple', 6]] }]))
      .toEqual(['X'])
  })

  it('a rejected order consumes nothing (later orders see intact stock)', () => {
    const orders = [
      { id: 'A', lines: [['apple', 2], ['pear', 1]] },
      { id: 'B', lines: [['apple', 6]] },
    ]
    expect(fulfillableOrders(inventory, orders)).toEqual(['B'])
  })

  it('handles an order repeating a SKU across lines (must not double-count stock)', () => {
    const orders = [{ id: 'A', lines: [['apple', 4], ['apple', 4]] }]
    expect(fulfillableOrders(inventory, orders)).toEqual([])
  })

  it('ships an order repeating a SKU when the total fits', () => {
    const orders = [{ id: 'A', lines: [['apple', 3], ['apple', 3]] }]
    expect(fulfillableOrders(inventory, orders)).toEqual(['A'])
  })

  it('rejects unknown SKUs', () => {
    expect(fulfillableOrders(inventory, [{ id: 'A', lines: [['kiwi', 1]] }]))
      .toEqual([])
  })

  it('earlier orders consume stock for later ones', () => {
    const orders = [
      { id: 'A', lines: [['banana', 2]] },
      { id: 'B', lines: [['banana', 1]] },
    ]
    expect(fulfillableOrders(inventory, orders)).toEqual(['A'])
  })

  it('returns an empty array when nothing ships', () => {
    expect(fulfillableOrders([], [{ id: 'A', lines: [['apple', 1]] }]))
      .toEqual([])
  })
})
