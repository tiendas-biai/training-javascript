// TODO: Implement `minRooms(meetings)`.
//
// Given meetings as [start, end] pairs (end exclusive: a meeting ending at 60
// frees its room for one starting at 60), return the minimum number of rooms
// so no two meetings overlap in a room.
//
//   minRooms([[0, 30], [5, 10], [15, 20]]) => 2
//   minRooms([[10, 20], [20, 30]])         => 1
//   minRooms([[9, 12], [9, 12], [9, 12]])  => 3
//
// Hint: min rooms = the maximum number of meetings running simultaneously.
// Turn each meeting into (start, +1) and (end, -1) events, sort, sweep.
// Mind the tie-break: at equal times, ends must be processed before starts.
//
// Run: npx jest features/karat/exercises/12-meeting-rooms/minRooms.test.js

function minRooms(meetings) {
  return 0
}

module.exports = { minRooms }
