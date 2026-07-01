# Exercise 04: Radio Songs

## Question

You are given a list of songs. Each song is an object `{ title, duration }`
where `duration` is a string in `"M:SS"` format (for example `"3:41"`).

Write a function `findPair(songs)` that returns the titles of **two different
songs** whose durations add up to exactly **7 minutes** (`7:00`), as a
two-element array `[titleA, titleB]`. If no such pair exists, return `[]`. If
several pairs qualify, returning any one of them is acceptable.

### Examples

```js
findPair([
  { title: 'Stairway to Heaven', duration: '8:05' },
  { title: 'Rock and Roll', duration: '3:41' },
  { title: 'Hot Dog', duration: '3:19' },
]) // => ['Rock and Roll', 'Hot Dog']   (either order)

findPair([
  { title: 'A', duration: '2:00' },
  { title: 'B', duration: '2:00' },
]) // => []
```
