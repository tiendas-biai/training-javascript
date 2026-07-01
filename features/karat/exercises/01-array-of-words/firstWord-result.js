/**
 * Checks whether a word can be formed from the letters in note.
 * @param {string} word — the word to check
 * @param {Map<string, number>} freqNote — letter frequencies from note
 * @returns {boolean} — true if the word can be formed
 */
function canForm(word, freqNote) {
  const freqWord = new Map()

  for (const c of word) {
    const countInWord = (freqWord.get(c) || 0) + 1

    if (!freqNote.has(c) || countInWord > freqNote.get(c)) {
      return false
    }

    freqWord.set(c, countInWord)
  }

  return true
}

/**
 * Finds the first word that can be formed from the letters in note.
 * @param {string[]} words — array of words, checked in order
 * @param {string} note — the pool of available letters
 * @returns {string} — the first word that can be formed, or '-' if none fit
 */
export function firstWord(words, note) {
  // Count letter frequencies in note
  const freqNote = new Map()
  for (const c of note) {
    freqNote.set(c, (freqNote.get(c) || 0) + 1)
  }

  // Check each word in order
  for (const word of words) {
    if (canForm(word, freqNote)) return word
  }

  return '-'
}
