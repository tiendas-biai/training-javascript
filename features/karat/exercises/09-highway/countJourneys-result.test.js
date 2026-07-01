import { countJourneys } from './countJourneys-result'

const entry = (plate) => ({ license_plate: plate, booth_type: 'ENTRY' })
const exit = (plate) => ({ license_plate: plate, booth_type: 'EXIT' })

describe('countJourneys (result)', () => {
  it('counts a single entry/exit as one journey', () => {
    expect(countJourneys([entry('A'), exit('A')])).toBe(1)
  })

  it('counts repeated round trips for the same car', () => {
    expect(countJourneys([entry('A'), exit('A'), entry('A'), exit('A')])).toBe(2)
  })

  it('ignores an exit with no open entry', () => {
    expect(countJourneys([exit('A')])).toBe(0)
  })

  it('does not double-count a repeated entry', () => {
    expect(countJourneys([entry('A'), entry('A'), exit('A')])).toBe(1)
  })

  it('ignores a second exit after the journey already completed', () => {
    expect(countJourneys([entry('A'), exit('A'), exit('A')])).toBe(1)
  })

  it('tracks multiple cars independently', () => {
    expect(
      countJourneys([entry('A'), entry('B'), exit('A'), exit('B')])
    ).toBe(2)
  })

  it('returns 0 for an empty log', () => {
    expect(countJourneys([])).toBe(0)
  })
})
