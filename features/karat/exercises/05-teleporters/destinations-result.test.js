import { destinations } from './destinations-result'

// Any order is allowed, so compare as sorted arrays.
const sorted = (a) => [...a].sort((x, y) => x - y)

describe('destinations (result)', () => {
  it('applies teleporters and deduplicates the landing squares', () => {
    expect(sorted(destinations(['3,1', '4,2', '5,10'], 6, 0, 20))).toEqual(
      sorted([1, 2, 10, 6])
    )
  })

  it('never moves past the last square', () => {
    expect(sorted(destinations([], 6, 18, 20))).toEqual([19, 20])
  })

  it('follows only one teleporter per turn', () => {
    // 2 + roll lands on 3 -> 8 (stops; not chained to 9 or 3).
    expect(sorted(destinations(['3,8', '8,9', '9,3'], 7, 2, 20))).toEqual(
      sorted([3, 4, 5, 6, 7, 8, 9])
    )
  })

  it('returns a single square when every roll funnels to the end', () => {
    expect(sorted(destinations([], 6, 100, 100))).toEqual([100])
  })
})
