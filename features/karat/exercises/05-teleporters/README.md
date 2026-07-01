# Exercise 05: Teleporters

## Question

A board game has squares numbered `0` to `lastSquare`. Some squares contain
teleporters, given as a list of `"from,to"` strings: landing **exactly** on
`from` immediately moves the player to `to`. Only one teleporter is followed per
turn.

A turn works like this:

1. The player rolls a die numbered `1` to `dieSides`.
2. They move forward that many squares.
3. They never move past `lastSquare` — overshooting stops them on `lastSquare`.
4. If they finish on a teleporter's `from` square, they move to its `to`.

Write a function `destinations(teleporters, dieSides, startPos, lastSquare)` that
returns the collection of distinct squares a player could end a single turn on
(any order, no duplicates).

### Examples

```js
destinations(['3,1', '4,2', '5,10'], 6, 0, 20) // => [1, 2, 10, 6]
destinations(['3,8', '8,9', '9,3'], 7, 2, 20)  // => [3, 4, 5, 6, 7, 8, 9]
```
