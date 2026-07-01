const { frequentBadgers } = require('./frequentBadgers')

describe('frequentBadgers', () => {
  it('flags a person with limit badge events inside the window', () => {
    const events = [
      ['Curtis', '2'], ['Curtis', '51'], ['Curtis', '62'], ['Curtis', '187'],
      ['Raj', '10'], ['Raj', '100'],
    ]
    const result = frequentBadgers(events, 3, 60)
    expect([...result.keys()]).toEqual(['Curtis'])
    expect(result.get('Curtis')).toEqual([2, 51, 62])
  })

  it('treats the window as inclusive (exactly windowMinutes apart counts)', () => {
    const events = [['Ana', '0'], ['Ana', '30'], ['Ana', '60']]
    expect(frequentBadgers(events, 3, 60).get('Ana')).toEqual([0, 30, 60])
  })

  it('does not flag events just outside the window', () => {
    const events = [['Ana', '0'], ['Ana', '30'], ['Ana', '61']]
    expect(frequentBadgers(events, 3, 60).size).toBe(0)
  })

  it('handles unsorted timestamps', () => {
    const events = [['Bo', '62'], ['Bo', '2'], ['Bo', '51']]
    expect(frequentBadgers(events, 3, 60).get('Bo')).toEqual([2, 51, 62])
  })

  it('returns the FIRST qualifying window, not a later one', () => {
    const events = [
      ['Cy', '10'], ['Cy', '20'], ['Cy', '30'],
      ['Cy', '200'], ['Cy', '210'], ['Cy', '220'],
    ]
    expect(frequentBadgers(events, 3, 60).get('Cy')).toEqual([10, 20, 30])
  })

  it('the window can hold more than limit events', () => {
    const events = [['Di', '0'], ['Di', '10'], ['Di', '20'], ['Di', '30']]
    // first window reaching 3 events is [0, 10, 20]
    expect(frequentBadgers(events, 3, 60).get('Di')).toEqual([0, 10, 20])
  })

  it('flags multiple people independently', () => {
    const events = [
      ['A', '0'], ['A', '1'], ['A', '2'],
      ['B', '500'], ['B', '501'], ['B', '502'],
      ['C', '0'], ['C', '400'], ['C', '800'],
    ]
    const result = frequentBadgers(events, 3, 60)
    expect(new Set(result.keys())).toEqual(new Set(['A', 'B']))
  })

  it('returns an empty map for no events', () => {
    expect(frequentBadgers([], 3, 60).size).toBe(0)
  })
})
