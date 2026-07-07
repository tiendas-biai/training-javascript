// The code this manifest belongs to. In the interview the interviewer opened
// package.json FIRST — review the project files, not just the code.

var mysql; // require('mysql2') — left unresolved so the exhibit runs standalone

function shorten(t) {
  if (t.length > 40) {
    return t.substring(40, 0) + '...';
  }
  return t;
}

console.log(shorten('a fairly long sentence that will definitely get cut off here'));
