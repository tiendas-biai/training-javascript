# Exercise 03: Robots

## Question

You have a collection of available robot parts, each given as a string in the
form `"Robot_part"` (for example `"Optimus_leg"`). You are also given a
comma-separated list of required part names (for example `"leg,wheel,screw"`).

Write a function `buildableRobots(parts, requiredStr)` that returns the names of
all robots for which **every** required part is available. Robots should appear
in the order they first show up in `parts`.

### Examples

```js
buildableRobots(
  ['Optimus_leg', 'Rosie_arm', 'Optimus_wheel', 'Optimus_screw', 'Rosie_claw'],
  'leg,wheel,screw'
) // => ['Optimus']

buildableRobots(['A_x', 'B_x', 'B_y'], 'x') // => ['A', 'B']
buildableRobots(['A_x'], 'x,y')             // => []
```
