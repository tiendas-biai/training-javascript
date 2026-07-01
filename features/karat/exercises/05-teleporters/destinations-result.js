/**
 * Returns the distinct squares reachable in a single turn.
 * @param {string[]} teleporters — "from,to" strings
 * @param {number} dieSides — die is numbered 1..dieSides
 * @param {number} startPos — the square the player starts on
 * @param {number} lastSquare — the final square (overshooting stops here)
 * @returns {number[]} — reachable squares, deduplicated
 */
export function destinations(teleporters, dieSides, startPos, lastSquare) {
  const teleMap = new Map()
  for (const t of teleporters) {
    const [from, to] = t.split(',').map(Number)
    teleMap.set(from, to)
  }

  const moves = new Set()
  for (let roll = 1; roll <= dieSides; roll++) {
    let next = startPos + roll
    if (next > lastSquare) next = lastSquare
    if (teleMap.has(next)) next = teleMap.get(next)
    moves.add(next)
  }

  return Array.from(moves)
}
