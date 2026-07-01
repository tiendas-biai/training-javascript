# Exercise 11: Campground

## Question

You and your friends are driving to a campground. Only some of you have cars, so
you carpool.

`roads` is a directed list of `[origin, destination, durationMinutes]` entries
(durations are strings). Routes are **linear**: each location leads to exactly
one next location, with no loops or branches.

`starts` is a list of the cars' starting locations. All cars leave at the **same
time** and drive toward the campground. `people` is a list of `[name, location]`
pairs giving where each person waits.

The **first** car to reach a person's location picks them up. If two cars arrive
at the same time, either car may take them.

Write a function `carpool(roads, starts, people)` that returns who ends up in
each car: an array parallel to `starts`, where entry `i` is the list of names in
the car that started at `starts[i]`.

### Example

```
Bridgewater--(30)-->Caledonia--(15)-->New Grafton--(5)-->Campground
                                       ^
Liverpool---(10)---Milton-----(30)----+
```

```js
const roads1_1 = [
  ['Bridgewater', 'Caledonia', '30'],
  ['Caledonia', 'New Grafton', '15'],
  ['New Grafton', 'Campground', '5'],
  ['Milton', 'New Grafton', '30'],
  ['Liverpool', 'Milton', '10'],
]
const people1 = [
  ['Jessie', 'Bridgewater'],
  ['Travis', 'Caledonia'],
  ['Jeremy', 'New Grafton'],
  ['Katie', 'Liverpool'],
]

carpool(roads1_1, ['Bridgewater', 'Liverpool'], people1)
// => [['Jessie', 'Travis'], ['Katie', 'Jeremy']]
```

(Cars may be returned in either order, and names within a car in any order.)
