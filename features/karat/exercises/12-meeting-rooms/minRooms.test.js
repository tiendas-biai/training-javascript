const { minRooms } = require('./minRooms')

describe('minRooms', () => {
  it('returns 0 for no meetings', () => {
    expect(minRooms([])).toBe(0)
  })

  it('returns 1 for a single meeting', () => {
    expect(minRooms([[9, 10]])).toBe(1)
  })

  it('counts overlapping meetings', () => {
    expect(minRooms([[0, 30], [5, 10], [15, 20]])).toBe(2)
  })

  it('reuses a room for back-to-back meetings (end is exclusive)', () => {
    expect(minRooms([[10, 20], [20, 30]])).toBe(1)
  })

  it('needs a room per meeting when all fully overlap', () => {
    expect(minRooms([[9, 12], [9, 12], [9, 12]])).toBe(3)
  })

  it('finds the peak, not the total', () => {
    // three meetings, but never more than two at once
    expect(minRooms([[0, 10], [5, 15], [10, 20]])).toBe(2)
  })

  it('handles an ending and a starting meeting at the same instant plus one running', () => {
    // at t=10: [0,10] ends, [10,20] starts, [5,15] is running → 2 rooms suffice
    expect(minRooms([[0, 10], [5, 15], [10, 20]])).toBe(2)
  })

  it('is not fooled by unsorted input', () => {
    expect(minRooms([[15, 20], [0, 30], [5, 10]])).toBe(2)
  })
})
