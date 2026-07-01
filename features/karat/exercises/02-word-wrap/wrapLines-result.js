/**
 * Greedily wraps words into hyphen-joined lines no longer than maxLen.
 * @param {string[]} words — the words to lay out, in order
 * @param {number} maxLen — the maximum length of any line
 * @returns {string[]} — the wrapped lines
 */
export function wrapLines(words, maxLen) {
  const result = []
  let line = ''

  for (const word of words) {
    if (line.length === 0) {
      line = word
      continue
    }

    // +1 accounts for the '-' separator between the current line and the word.
    const candidateLength = line.length + 1 + word.length

    if (candidateLength <= maxLen) {
      line += '-' + word
    } else {
      result.push(line)
      line = word
    }
  }

  if (line.length > 0) {
    result.push(line)
  }

  return result
}
