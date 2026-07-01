import { findPair } from './findPair-result'

// The spec allows the pair in either order, so compare order-insensitively.
const asSet = (pair) => new Set(pair)

describe('findPair (result)', () => {
  it('finds two songs that sum to exactly 7:00', () => {
    const result = findPair([
      { title: 'Stairway to Heaven', duration: '8:05' },
      { title: 'Rock and Roll', duration: '3:41' },
      { title: 'Hot Dog', duration: '3:19' },
    ])
    expect(asSet(result)).toEqual(asSet(['Rock and Roll', 'Hot Dog']))
  })

  it('returns [] when no pair sums to 7:00', () => {
    expect(
      findPair([
        { title: 'A', duration: '2:00' },
        { title: 'B', duration: '2:00' },
      ])
    ).toEqual([])
  })

  it('does not pair a single song with itself', () => {
    expect(findPair([{ title: 'Half', duration: '3:30' }])).toEqual([])
  })

  it('pairs two equal-length songs that sum to 7:00', () => {
    const result = findPair([
      { title: 'X', duration: '3:30' },
      { title: 'Y', duration: '3:30' },
    ])
    expect(asSet(result)).toEqual(asSet(['X', 'Y']))
  })

  it('returns [] for an empty list', () => {
    expect(findPair([])).toEqual([])
  })
})
