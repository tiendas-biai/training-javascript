import { mismatches } from './mismatches-result'

// Order within each collection is unspecified, so compare as sets.
const asSets = ([a, b]) => [new Set(a), new Set(b)]

describe('mismatches (result)', () => {
  it('returns empty collections for a clean log', () => {
    expect(
      mismatches([
        ['Paul', 'enter'],
        ['Paul', 'exit'],
      ])
    ).toEqual([[], []])
  })

  it('reports a double enter and a double exit', () => {
    expect(
      asSets(
        mismatches([
          ['Paul', 'enter'],
          ['Paul', 'enter'],
          ['Paul', 'exit'],
          ['Paul', 'exit'],
        ])
      )
    ).toEqual(asSets([['Paul'], ['Paul']]))
  })

  it('reports an employee still inside at the end', () => {
    expect(
      asSets(
        mismatches([
          ['Raj', 'enter'],
          ['Paul', 'enter'],
          ['Paul', 'exit'],
          ['Paul', 'exit'],
          ['Paul', 'enter'],
          ['Raj', 'enter'],
        ])
      )
    ).toEqual(asSets([['Raj', 'Paul'], ['Paul']]))
  })

  it('deduplicates repeated mismatches', () => {
    const [enter, exit] = mismatches([
      ['Joe', 'exit'],
      ['Joe', 'exit'],
    ])
    expect(enter).toEqual([])
    expect(new Set(exit)).toEqual(new Set(['Joe']))
  })
})
