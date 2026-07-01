/**
 * Flags people with `limit`+ badge events inside any `windowMinutes` window.
 * @param {Array<[string, string]>} events — [name, timestamp] pairs (unsorted; timestamps are strings)
 * @param {number} limit — events needed to qualify
 * @param {number} windowMinutes — window size, inclusive
 * @returns {Map<string, number[]>} — name → first qualifying window's timestamps
 */
function frequentBadgers(events, limit, windowMinutes) {
  // Layer 1: group timestamps per person, parsing at the boundary.
  const timesByName = new Map()
  for (const [name, time] of events) {
    if (!timesByName.has(name)) timesByName.set(name, [])
    timesByName.get(name).push(Number(time)) // strings → numbers, once
  }

  // Layer 2: per person, sort and slide a two-pointer window.
  const flagged = new Map()
  for (const [name, times] of timesByName) {
    times.sort((a, b) => a - b)

    let left = 0
    for (let right = 0; right < times.length; right++) {
      // Shrink until the window spans at most windowMinutes (inclusive).
      while (times[right] - times[left] > windowMinutes) left++

      if (right - left + 1 >= limit) {
        flagged.set(name, times.slice(left, left + limit)) // first window found
        break
      }
    }
  }
  return flagged
}

module.exports = { frequentBadgers }
