// TODO: Implement `frequentBadgers(events, limit, windowMinutes)`.
//
// events: [name, timestamp] pairs, timestamps are STRINGS in minutes,
// not sorted. Flag every person with `limit`+ badge events inside some
// window of `windowMinutes` minutes (inclusive: t2 - t1 <= windowMinutes).
// Return Map<name, number[]> with the FIRST qualifying window's timestamps.
//
//   frequentBadgers([['Curtis','2'],['Curtis','51'],['Curtis','62']], 3, 60)
//   => Map { 'Curtis' => [2, 51, 62] }
//
// Plan: group timestamps per person (Map<name, number[]>), sort each
// person's list, then slide a two-pointer window over it.
//
// Run: npx jest features/karat/exercises/13-badge-anomalies-window/frequentBadgers.test.js

function frequentBadgers(events, limit, windowMinutes) {
  return new Map()
}

module.exports = { frequentBadgers }
