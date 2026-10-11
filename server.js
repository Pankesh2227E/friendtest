const http = require('http'), fs = require('fs'), path = require('path'), crypto = require('crypto');
const PORT = process.env.PORT || 8080;
const DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const FILE = path.join(DIR, 'db.json'), N = 6;
fs.mkdirSync(DIR, { recursive: true });
let db = {};
try { db = JSON.parse(fs.readFileSync(FILE, 'utf8')); } catch {}
const save = () => fs.writeFileSync(FILE, JSON.stringify(db));
const rid = n => crypto.randomBytes(n).toString('base64url');
const clean = s => String(s || '').trim().slice(0, 24);
const valid = a => Array.isArray(a) && a.length === N && a.every(v => Number.isInteger(v) && v >= 0 && v < 4);
const send = (res, code, obj) => { res.writeHead(code, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(obj)); };
const body = req => new Promise(r => {
  let b = '';
  req.on('data', c => { b += c; if (b.length > 5000) req.destroy(); });
  req.on('end', () => { try { r(JSON.parse(b)); } catch { r({}); } });
  req.on('close', () => r({}));
});
const NEED = 'Add your name and answer every question.';

const handle = async (req, res) => {
  const u = new URL(req.url, 'http://x'), p = u.pathname, m = req.method;
  if (p === '/api/quizzes' && m === 'POST') {
    const b = await body(req), name = clean(b.name);
    if (!name || !valid(b.answers)) return send(res, 400, { error: NEED });
    const id = rid(5), key = rid(12);
    db[id] = { name, answers: b.answers, key, results: [] };
    save();
    return send(res, 201, { id, key });
  }
  const x = p.match(/^\/api\/quizzes\/([\w-]+)(\/play|\/board)?$/);
  if (x) {
    const q = Object.hasOwn(db, x[1]) && db[x[1]];
    if (!q) return send(res, 404, { error: 'This quiz does not exist.' });
    if (!x[2] && m === 'GET') return send(res, 200, { name: q.name });
    if (x[2] === '/play' && m === 'POST') {
      const b = await body(req), player = clean(b.player);
      if (!player || !valid(b.guesses)) return send(res, 400, { error: NEED });
      if (q.results.length >= 300) return send(res, 429, { error: 'This quiz is full.' });
      const score = b.guesses.filter((g, i) => g === q.answers[i]).length;
      q.results.push({ player, guesses: b.guesses, score });
      save();
      return send(res, 200, { score, total: N, answers: q.answers });
    }
    if (x[2] === '/board' && m === 'GET') {
      if (u.searchParams.get('key') !== q.key) return send(res, 403, { error: 'This scoreboard link is wrong.' });
      return send(res, 200, { name: q.name, answers: q.answers, results: q.results });
    }
  }
  if (p.startsWith('/api/')) return send(res, 404, { error: 'Not found' });
  fs.readFile(path.join(__dirname, 'public', 'index.html'), (e, d) => {
    res.writeHead(e ? 500 : 200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(e ? 'Server error' : d);
  });
};
http.createServer((req, res) => handle(req, res).catch(() => res.headersSent || send(res, 500, { error: 'Server error' })))
  .listen(PORT, () => console.log('RealOnes on :' + PORT));
