// A small "API" shown as a Block 1 exhibit. The fake `app`/`fs` stubs make it
// runnable without dependencies; review it as if it were a real Express app.

var fs = require('fs');
var path = require('path');

var API_KEY = 'sk-live-9f2e77aa41c0';
var LOG = path.join(__dirname, 'requests.log');

var app = {
  routes: {},
  post: function (route, handler) { this.routes[route] = handler; },
  simulate: function (route, body) {
    var res = {
      sent: null,
      status: function () { return this; },
      send: function (x) { this.sent = x; console.log('response:', x); },
    };
    this.routes[route]({ body: body }, res);
  },
};

app.post('/calc', function (req, res) {
  var result = eval(req.body.expr);
  fs.appendFileSync(LOG, req.body.expr + '\n');
  res.send({ result: result, key: API_KEY });
});

app.post('/user', function (req, res) {
  var user = req.body;
  try {
    saveUser(user);
  } catch (e) {}
  res.send({ ok: true });
});

function saveUser(user) {
  // pretend: db.insert('users', user)
  if (!user.email) throw new Error('email required');
}

app.simulate('/calc', { expr: '2 + 3' });
app.simulate('/calc', { expr: 'process.platform' }); // ← user code ran on your server
app.simulate('/user', { name: 'no email, silently "saved"' });

// cleanup so repeated runs don't accumulate
fs.rmSync(LOG, { force: true });
