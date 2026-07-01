import { wrapLines } from './wrapLines'

describe('wrapLines', () => {

  it('packs words that all fit onto one line', () => {
    expect(wrapLines(['a', 'b', 'c'], 5)).toEqual(['a-b-c'])
  })

  it('wraps to a new line when the next word would exceed maxLen', () => {
    expect(wrapLines(['hello', 'world', 'foo'], 11)).toEqual([
      'hello-world',
      'foo',
    ])
  })

  it('returns an empty array for no words', () => {
    expect(wrapLines([], 5)).toEqual([])
  })

  it('places an over-long word on its own line', () => {
    expect(wrapLines(['single'], 3)).toEqual(['single'])
  })

  it('counts the hyphen separator toward the line length', () => {
    // 'a-b' is length 3; adding '-c' would make 5 which is > 4.
    expect(wrapLines(['a', 'b', 'c'], 4)).toEqual(['a-b', 'c'])
  })
})
