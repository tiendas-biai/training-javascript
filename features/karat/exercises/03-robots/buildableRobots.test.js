import { buildableRobots } from './buildableRobots'

describe('buildableRobots', () => {
  it('returns robots that have all required parts', () => {
    expect(
      buildableRobots(
        ['Optimus_leg', 'Rosie_arm', 'Optimus_wheel', 'Optimus_screw', 'Rosie_claw'],
        'leg,wheel,screw'
      )
    ).toEqual(['Optimus'])
  })

  it('returns multiple robots in first-seen order', () => {
    expect(buildableRobots(['A_x', 'B_x', 'B_y'], 'x')).toEqual(['A', 'B'])
  })

  it('excludes robots missing a required part', () => {
    expect(buildableRobots(['A_x'], 'x,y')).toEqual([])
  })

  it('returns an empty array when there are no parts', () => {
    expect(buildableRobots([], 'x')).toEqual([])
  })
})
