/**
 * Groups users by connection count after replaying the event log.
 * @param {[string, string, string][]} events — [type, userA, userB] triples
 * @param {number} count — the threshold separating the two groups
 * @returns {{ less: string[], more: string[] }}
 */
export function grouping(events, count) {
  const connections = new Map()

  const ensure = (user) => {
    if (!connections.has(user)) connections.set(user, new Set())
    return connections.get(user)
  }

  for (const [type, a, b] of events) {
    const setA = ensure(a)
    const setB = ensure(b)

    if (type === 'CONNECT') {
      setA.add(b)
      setB.add(a)
    } else if (type === 'DISCONNECT') {
      setA.delete(b)
      setB.delete(a)
    }
  }

  const result = { less: [], more: [] }
  for (const [user, neighbors] of connections) {
    if (neighbors.size >= count) result.more.push(user)
    else result.less.push(user)
  }

  return result
}
