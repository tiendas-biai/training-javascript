import { firstWord } from './firstWord'

describe('firstWord', () => {
  it('returns a word that can be formed from the note letters', () => {
    expect(firstWord(['baby', 'cat'], 'act')).toBe('cat')
  })

  it("returns '-' when no word can be formed", () => {
    expect(firstWord(['baby', 'cat'], 'tab')).toBe('-')
  })

  it('respects letter counts (repeated letters must be available)', () => {
    expect(firstWord(['coco', 'cocoa'], 'coco')).toBe('coco')
  })

  it('ignores letter order in the note', () => {
    expect(firstWord(['hello', 'world'], 'hlelo')).toBe('hello')
  })

  it('returns the FIRST matching word in array order', () => {
    expect(firstWord(['abc', 'def'], 'fed')).toBe('def')
  })

  it('returns the first match, not the last, when several qualify', () => {
    expect(firstWord(['act', 'cat'], 'act')).toBe('act')
  })

  it('forms a word that uses fewer letters than the note provides', () => {
    // 'cat' fits in 'cats' even though it does not use every letter.
    expect(firstWord(['cat'], 'cats')).toBe('cat')
  })

  it('does not require the word to be an anagram of the note', () => {
    expect(firstWord(['hi'], 'highway')).toBe('hi')
  })

  it('rejects a word that needs a letter more times than the note has it', () => {
    expect(firstWord(['aa'], 'a')).toBe('-')
  })

  it('skips an earlier word that does not fit and returns a later one', () => {
    expect(firstWord(['xyz', 'cat'], 'act')).toBe('cat')
  })

  // Containment is directional: the WORD must fit inside the NOTE, not the
  // other way around. These pin that direction down.
  describe('containment direction', () => {
    it('rejects a word longer than the note, even if the note fits inside the word', () => {
      // note 'cat' IS a subset of word 'cats', but 'cats' cannot be formed
      // from only the letters in 'cat'. A reversed check wrongly accepts this.
      expect(firstWord(['cats'], 'cat')).toBe('-')
    })

    it('rejects a word whose extra letters the note lacks', () => {
      expect(firstWord(['notes'], 'note')).toBe('-')
    })

    it('accepts a short word when the note has leftover letters', () => {
      expect(firstWord(['go'], 'good')).toBe('go')
    })

    it('rejects when a repeated letter is needed more often than the note has it', () => {
      // word needs two a's and two b's; note supplies one of each.
      expect(firstWord(['aabb'], 'ab')).toBe('-')
    })

    it('accepts when repeated letters are exactly covered', () => {
      expect(firstWord(['aabb'], 'abab')).toBe('aabb')
    })

    it('returns the first word that fits, skipping an earlier too-large word', () => {
      // 'notes' cannot be formed from 'note'; 'note' can. Direction + first-match.
      expect(firstWord(['notes', 'note'], 'note')).toBe('note')
    })
  })

  it("returns '-' for an empty word list", () => {
    expect(firstWord([], 'abc')).toBe('-')
  })

  it('treats an empty word as always formable', () => {
    expect(firstWord([''], '')).toBe('')
  })
})
