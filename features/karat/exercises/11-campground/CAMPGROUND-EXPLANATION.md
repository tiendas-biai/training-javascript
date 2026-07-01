# Exercise 11 — Campground

## What it does

Traces each car's path along the linear road network, recording when it reaches
every location, then assigns each person to whichever car reaches their pickup
location earliest.

## Key concepts

### Linear routes → a "next stop" map

```js
const nextStop = new Map()
for (const [origin, dest, duration] of roads) {
  nextStop.set(origin, { dest, duration: Number(duration) })
}
```

Because each location leads to exactly one next location, the road network is a
set of chains. A single `Map` from `origin → { dest, duration }` is enough to
walk any car forward.

### Per-car arrival times

```js
const arrivalsPerCar = starts.map((start) => {
  const arrivals = new Map()
  let location = start, time = 0
  arrivals.set(location, time)
  while (nextStop.has(location)) {
    const { dest, duration } = nextStop.get(location)
    time += duration
    location = dest
    if (!arrivals.has(location)) arrivals.set(location, time)
  }
  return arrivals
})
```

Each car follows its chain to the campground, accumulating travel time and
recording the arrival time at every location it passes (including its start, at
time `0`).

### Earliest car wins

```js
arrivalsPerCar.forEach((arrivals, carIndex) => {
  if (arrivals.has(location)) {
    const time = arrivals.get(location)
    if (time < bestTime) { bestTime = time; bestCar = carIndex }
  }
})
```

For each person, we compare the arrival times of the cars that pass their
location and assign them to the earliest. Strict `<` means a tie goes to the
earlier-indexed car (the "either car" rule lets us pick deterministically).

## Implementation notes

- **Two cars can share a stop.** Routes merge (e.g. several roads feed into
  `New Grafton`), so a location may appear in multiple cars' arrival maps — which
  is exactly when the "who got there first" comparison matters.
- **Start counts as an arrival.** A person waiting at a car's start is picked up
  at time `0`.

## Things to watch out for

- **Parse durations.** They arrive as strings; `Number(duration)` is required or
  the running total becomes string concatenation.
- **A person only rides a car that passes them.** If no car's route includes a
  person's location, they're picked up by nobody (left out). Guard with
  `arrivals.has(location)`.
- **Deterministic tie-breaking.** The spec allows either car on a tie; using
  strict `<` keeps the result stable and testable instead of order-dependent.
