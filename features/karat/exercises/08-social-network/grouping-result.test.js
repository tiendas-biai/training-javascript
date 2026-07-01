import { grouping } from './grouping-result'

const events = [
  ['CONNECT', 'Alice', 'Bob'],
  ['DISCONNECT', 'Bob', 'Alice'],
  ['CONNECT', 'Alice', 'Charlie'],
  ['CONNECT', 'Dennis', 'Bob'],
  ['CONNECT', 'Pam', 'Dennis'],
  ['DISCONNECT', 'Pam', 'Dennis'],
  ['CONNECT', 'Pam', 'Dennis'],
  ['CONNECT', 'Edward', 'Bob'],
  ['CONNECT', 'Dennis', 'Charlie'],
  ['CONNECT', 'Alice', 'Nicole'],
  ['CONNECT', 'Pam', 'Edward'],
  ['DISCONNECT', 'Dennis', 'Charlie'],
  ['CONNECT', 'Dennis', 'Edward'],
  ['CONNECT', 'Charlie', 'Bob'],
]

const sortedSets = ({ less, more }) => ({
  less: new Set(less),
  more: new Set(more),
})

describe('grouping (result)', () => {
  it('splits users at a threshold of 3', () => {
    expect(sortedSets(grouping(events, 3))).toEqual({
      less: new Set(['Alice', 'Charlie', 'Pam', 'Nicole']),
      more: new Set(['Dennis', 'Bob', 'Edward']),
    })
  })

  it('puts everyone in "more" when the threshold is 1', () => {
    const { less, more } = grouping(events, 1)
    expect(less).toEqual([])
    expect(new Set(more)).toEqual(
      new Set(['Alice', 'Charlie', 'Dennis', 'Bob', 'Pam', 'Edward', 'Nicole'])
    )
  })

  it('puts everyone in "less" when the threshold is unreachably high', () => {
    const { less, more } = grouping(events, 10)
    expect(more).toEqual([])
    expect(new Set(less)).toEqual(
      new Set(['Alice', 'Charlie', 'Dennis', 'Bob', 'Pam', 'Edward', 'Nicole'])
    )
  })
})
