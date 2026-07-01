import { carpool } from './carpool'

// Which physical car is "first" doesn't matter, and order within a car doesn't
// matter — so compare as a set of sorted name-groups.
const asGroupSet = (cars) =>
  new Set(cars.map((names) => [...names].sort().join(',')))

const roads1_1 = [
  ['Bridgewater', 'Caledonia', '30'],
  ['Caledonia', 'New Grafton', '15'],
  ['New Grafton', 'Campground', '5'],
  ['Milton', 'New Grafton', '30'],
  ['Liverpool', 'Milton', '10'],
]
const roads1_2 = [
  ['Bridgewater', 'Caledonia', '30'],
  ['Caledonia', 'New Grafton', '15'],
  ['New Grafton', 'Campground', '5'],
  ['Milton', 'New Grafton', '40'],
  ['Liverpool', 'Milton', '10'],
]
const starts1 = ['Bridgewater', 'Liverpool']
const people1 = [
  ['Jessie', 'Bridgewater'],
  ['Travis', 'Caledonia'],
  ['Jeremy', 'New Grafton'],
  ['Katie', 'Liverpool'],
]

const roads3 = [
  ['Riverport', 'Bridgewater', '1'],
  ['Bridgewater', 'Liverpool', '1'],
  ['Liverpool', 'Campground', '1'],
]
const people3 = [
  ['Colin', 'Riverport'],
  ['Jessie', 'Bridgewater'],
  ['Sam', 'Liverpool'],
]

describe('carpool', () => {
  it('picks up each person at the first car to reach them', () => {
    expect(asGroupSet(carpool(roads1_1, starts1, people1))).toEqual(
      asGroupSet([['Jessie', 'Travis'], ['Katie', 'Jeremy']])
    )
  })

  it('reassigns a shared stop when a route gets slower', () => {
    expect(asGroupSet(carpool(roads1_2, starts1, people1))).toEqual(
      asGroupSet([['Jessie', 'Travis', 'Jeremy'], ['Katie']])
    )
  })

  it('handles a car that starts further along the same road', () => {
    expect(
      asGroupSet(carpool(roads3, ['Riverport', 'Liverpool'], people3))
    ).toEqual(asGroupSet([['Jessie', 'Colin'], ['Sam']]))
  })
})
