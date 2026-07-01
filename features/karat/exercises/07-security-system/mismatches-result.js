/**
 * Finds badge mismatches: entries without exits and exits without entries.
 * @param {[string, string][]} records — ordered [employee, "enter"|"exit"] log
 * @returns {[string[], string[]]} — [enteredWithoutExit, exitedWithoutEnter]
 */
export function mismatches(records) {
  const inside = new Set()
  const exitWithoutEnter = new Set()
  const enterWithoutExit = new Set()

  for (const [name, action] of records) {
    if (action === 'enter') {
      // Already inside? The previous enter never got a matching exit.
      if (inside.has(name)) enterWithoutExit.add(name)
      else inside.add(name)
    } else if (action === 'exit') {
      if (inside.has(name)) inside.delete(name)
      else exitWithoutEnter.add(name)
    }
  }

  // Anyone still inside at the end also entered without exiting.
  return [
    Array.from(new Set([...enterWithoutExit, ...inside])),
    Array.from(exitWithoutEnter),
  ]
}
