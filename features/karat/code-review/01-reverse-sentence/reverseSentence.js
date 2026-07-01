// You are shown this code in the interview. Read it cold, then answer the
// four Block 1 questions out loud. (The db object stands in for a real
// mysql connection so the file runs; treat db.query as a real SQL call.)

var config = {
  host: 'localhost',
  user: 'root',
  password: 'root123',
  database: 'app',
};

var db = {
  // pretend this is mysql: query(sql, cb) → rows
  _table: { 1: 'the quick brown fox', 2: 'hello world' },
  query: function (sql, cb) {
    var id = sql.split('=')[1].trim();
    var text = this._table[id];
    cb(null, text ? [{ text: text }] : []);
  },
};

function reverse(id) {
  db.query('SELECT text FROM sentences WHERE id = ' + id, function (err, rows) {
    var s = rows[0].text;
    var w = s.split(' ');
    for (var i = 0; i < w.length / 2; i++) {
      var tmp = w[i];
      w[i] = w[w.length - 1 - i];
      w[w.length - 1 - i] = tmp;
    }
    console.log(w.join(' '));
  });
}

reverse(1);
reverse(2);
reverse(99); // ← crashes. Why?
