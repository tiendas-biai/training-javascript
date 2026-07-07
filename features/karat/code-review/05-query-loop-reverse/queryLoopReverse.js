// You are shown this code in the interview. Read it cold, then answer the
// four Block 1 questions out loud. (The db object stands in for a real
// mysql2 connection so the file runs; treat db.query as a real SQL call.)

var config = {
  host: 'localhost',
  user: 'root',
  password: 'root123',
  database: 'app',
};

var db = {
  // pretend this is mysql2: query(sql, cb) → rows
  _posts: [
    { likes: 12, text: 'the quick brown fox' },
    { likes: 3, text: 'hello world' },
    { likes: 40, text: 'karat block one drill' },
  ],
  query: function (sql, cb) {
    var min = Number(sql.split('>')[1]);
    cb(null, this._posts.filter(function (p) { return p.likes > min; }));
  },
};

function reverse(arr) {
  var out = arr;
  for (var i = 0; i < out.length / 2; i++) {
    var tmp = out[i];
    out[i] = out[out.length - 1 - i];
    out[out.length - 1 - i] = tmp;
  }
  return out;
}

function printReversed(minLikes) {
  db.query('SELECT text FROM posts WHERE likes > ' + minLikes, function (err, rows) {
    for (var i = 0; i < rows.length; i++) {
      var w = rows[i].text.split(' ');
      console.log(reverse(w).join(' '));
    }
  });
}

printReversed(5);
