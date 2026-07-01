/**
 * Finds two songs whose durations sum to exactly seven minutes.
 * @param {{title: string, duration: string}[]} songs
 * @returns {[string, string] | []} a pair of titles, or [] if none
 */
export function findPair(songs) {
  const SEVEN_MINUTES = 7 * 60
  const seenByDuration = new Map()

  for (const song of songs) {
    const [mins, seconds] = song.duration.split(':')
    const totalSeconds = Number(mins) * 60 + Number(seconds)
    const complement = SEVEN_MINUTES - totalSeconds

    if (seenByDuration.has(complement)) {
      return [song.title, seenByDuration.get(complement)]
    }

    seenByDuration.set(totalSeconds, song.title)
  }

  return []
}
