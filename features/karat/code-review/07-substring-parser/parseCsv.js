// You are shown this code in the interview. Read it cold, then answer the
// four Block 1 questions out loud. It runs — and mis-parses real CSV.

function parseLine(line) {
  var fields = [];
  var start = 0;
  for (var i = 0; i < line.length; i++) {
    if (line.substring(i, i + 1) == ',') {
      fields.push(line.substring(start, i));
      start = i + 1;
    }
  }
  fields.push(line.substring(start, line.length));
  return fields;
}

function parseCsv(text) {
  var out = [];
  var lines = text.split('\n');
  for (var j = 0; j < lines.length; j++) {
    if (lines[j] != '') {
      out.push(parseLine(lines[j]));
    }
  }
  return out;
}

console.log(parseCsv('name,age\nada,36\ngrace,45\n'));
// looks fine…

console.log(parseCsv('name,notes\n"Smith, John",fast\n'));
// ← ['"Smith', ' John"', 'fast'] — quoted field torn apart

console.log(parseCsv('a,b\r\n1,2\r\n')[0][1] === 'b');
// ← false: CRLF input leaves '\r' glued to the last field
