/**
 * Returns the robots that have every required part available.
 * @param {string[]} parts — entries shaped "Robot_part"
 * @param {string} requiredStr — comma-separated required part names
 * @returns {string[]} — buildable robot names, in first-seen order
 */
export function buildableRobots(parts, requiredStr) {
  const required = new Set(requiredStr.split(','))
  const robots = new Map()

  for (const item of parts) {
    const [robot, part] = item.split('_')
    if (!robots.has(robot)) robots.set(robot, new Set())
    robots.get(robot).add(part)
  }

  const result = []
  for (const [robot, pieces] of robots) {
    if ([...required].every((p) => pieces.has(p))) {
      result.push(robot)
    }
  }

  return result
}
