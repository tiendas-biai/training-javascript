# Exercise 12: Meeting Rooms

## Question

You are given a list of meetings as `[start, end]` pairs of numbers (minutes
since midnight, `start < end`). A meeting occupies a room from `start`
(inclusive) to `end` (exclusive) — a meeting that ends at 60 frees its room
for a meeting that starts at 60.

Write a function `minRooms(meetings)` that returns the minimum number of rooms
needed so that no two meetings share a room at the same time.

### Examples

```js
minRooms([[0, 30], [5, 10], [15, 20]]) // => 2
minRooms([[10, 20], [20, 30]])         // => 1  (back-to-back reuses the room)
minRooms([[9, 12], [9, 12], [9, 12]])  // => 3
minRooms([])                           // => 0
```

Karat frames interval problems like this one constantly (schedules, bookings,
server load). The reframing that unlocks it: the answer equals the **peak
number of meetings running at the same moment** — you never assign rooms at
all.
