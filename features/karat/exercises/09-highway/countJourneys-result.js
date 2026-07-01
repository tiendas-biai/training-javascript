/**
 * Counts completed entry/exit journeys from a toll-booth log.
 * @param {{license_plate: string, booth_type: 'ENTRY' | 'EXIT'}[]} logEntries
 * @returns {number} — number of completed journeys
 */
export function countJourneys(logEntries) {
  const active = new Map()
  let journeys = 0

  for (const entry of logEntries) {
    const plate = entry.license_plate

    if (entry.booth_type === 'ENTRY') {
      active.set(plate, true)
    } else if (entry.booth_type === 'EXIT') {
      if (active.get(plate)) {
        journeys++
        active.set(plate, false)
      }
    }
  }

  return journeys
}
