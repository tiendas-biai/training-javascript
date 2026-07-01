/**
 * Minimum rooms = peak number of simultaneous meetings (sweep line).
 * @param {Array<[number, number]>} meetings — [start, end) pairs
 * @returns {number} — minimum rooms needed
 */
function minRooms(meetings) {
  // Explode meetings into timeline events: +1 when one starts, -1 when one ends.
  const events = []
  for (const [start, end] of meetings) {
    events.push([start, +1])
    events.push([end, -1])
  }

  // Sort by time; at equal times process ends (-1) before starts (+1),
  // so a room freed at t is reusable by a meeting starting at t.
  events.sort((a, b) => a[0] - b[0] || a[1] - b[1])

  // Sweep: the running counter is "meetings in progress"; its peak is the answer.
  let current = 0
  let peak = 0
  for (const [, delta] of events) {
    current += delta
    if (current > peak) peak = current
  }
  return peak
}

module.exports = { minRooms }
