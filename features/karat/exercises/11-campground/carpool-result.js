/**
 * Assigns each person to the car that reaches their location first.
 * @param {[string, string, string][]} roads — [origin, dest, durationMinutes]
 * @param {string[]} starts — each car's starting location
 * @param {[string, string][]} people — [name, location] pairs
 * @returns {string[][]} — names per car, parallel to `starts`
 */
export function carpool(roads, starts, people) {
  // Linear routes: each location has at most one outgoing road.
  const nextStop = new Map()
  for (const [origin, dest, duration] of roads) {
    nextStop.set(origin, { dest, duration: Number(duration) })
  }

  // For each car, the arrival time at every location along its route.
  const arrivalsPerCar = starts.map((start) => {
    const arrivals = new Map()
    let location = start
    let time = 0
    arrivals.set(location, time)
    while (nextStop.has(location)) {
      const { dest, duration } = nextStop.get(location)
      time += duration
      location = dest
      if (!arrivals.has(location)) arrivals.set(location, time)
    }
    return arrivals
  })

  const cars = starts.map(() => [])

  for (const [name, location] of people) {
    let bestCar = -1
    let bestTime = Infinity
    arrivalsPerCar.forEach((arrivals, carIndex) => {
      if (arrivals.has(location)) {
        const time = arrivals.get(location)
        // Strict `<` makes ties go to the earlier-indexed car.
        if (time < bestTime) {
          bestTime = time
          bestCar = carIndex
        }
      }
    })
    if (bestCar !== -1) cars[bestCar].push(name)
  }

  return cars
}
