const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = process.env.PORT || 3000;
const DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const FILE = path.join(DIR, 'db.json');
const STATIC_DIR = path.join(__dirname, 'static');

fs.mkdirSync(DIR, { recursive: true });
fs.mkdirSync(STATIC_DIR, { recursive: true });

let db = {};
try { db = JSON.parse(fs.readFileSync(FILE, 'utf8')); } catch {}
const save = () => {
  try { fs.writeFileSync(FILE, JSON.stringify(db, null, 2)); } catch (e) { console.error('Save error:', e); }
};

let questionsSeed = [];
try {
  questionsSeed = JSON.parse(fs.readFileSync(path.join(__dirname, 'questions_seed.json'), 'utf8'));
} catch (e) {
  console.warn('questions_seed.json not loaded, using fallback');
  questionsSeed = [
    { id: "9", question: "What makes userName happy? 🥹", options: ["Food 🍕", "Compliments 💕", "Money 💸", "Shopping 🛍️", "Sleeping 😴", "Gossip ☕"] },
    { id: "24", question: "When did userName usually study for exams? 📝", options: ["Days in advance 📚", "The night before 🌙", "5 minutes before 😭", "Didn't study 💀"] },
    { id: "11", question: "What does userName hate the most? 😤", options: ["Someone farting 💨", "Pimples 🔴", "Playing with feelings 🥺", "Lying 🤥", "Fake friends 🎭"] },
    { id: "435", question: "What’s userName’s favorite animated show? 📺", options: ["SpongeBob SquarePants 🧽", "The Amazing World of Gumball 🐱", "Pokémon ⚡", "Naruto 🍥", "Demon Slayer ⚔️"] },
    { id: "437", question: "What did userName love playing most as a kid? 🛝", options: ["Tag 🏃", "Hide-and-seek 🙈", "Four square 🟦", "UNO 🃏", "Jenga 🪵"] }
  ];
}

const rid = n => crypto.randomBytes(n).toString('base64url').replace(/[-_]/g, 'a').slice(0, n);
const clean = s => String(s || '').trim().slice(0, 32);
const send = (res, code, obj) => {
  res.writeHead(code, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(obj));
};

const MIME_MAP = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.woff2': 'font/woff2'
};

const body = req => new Promise(r => {
  let b = '';
  req.on('data', c => { b += c; if (b.length > 50000) req.destroy(); });
  req.on('end', () => { try { r(JSON.parse(b)); } catch { r({}); } });
  req.on('close', () => r({}));
});

// Proxy and cache static assets on demand
const handleAsset = async (req, res, pathname) => {
  const relPath = pathname.replace(/^\/+/, ''); // remove leading slash
  const localFile = path.join(__dirname, relPath);
  const ext = path.extname(localFile).toLowerCase();
  const mime = MIME_MAP[ext] || 'application/octet-stream';

  if (fs.existsSync(localFile)) {
    try {
      const data = fs.readFileSync(localFile);
      res.writeHead(200, {
        'Content-Type': mime,
        'Cache-Control': 'public, max-age=86400'
      });
      return res.end(data);
    } catch {}
  }

  // Not locally cached yet -> proxy from block.youtest.me
  const remoteUrl = 'https://block.youtest.me/' + relPath;
  try {
    const upstream = await fetch(remoteUrl);
    if (!upstream.ok) {
      res.writeHead(upstream.status, { 'Content-Type': 'text/plain' });
      return res.end('Asset not found');
    }
    const buf = Buffer.from(await upstream.arrayBuffer());
    // Save to disk for fast subsequent loads
    try {
      fs.mkdirSync(path.dirname(localFile), { recursive: true });
      fs.writeFileSync(localFile, buf);
    } catch (err) {
      console.warn('Could not cache asset to disk:', err.message);
    }
    res.writeHead(200, {
      'Content-Type': mime,
      'Cache-Control': 'public, max-age=86400'
    });
    return res.end(buf);
  } catch (err) {
    res.writeHead(502, { 'Content-Type': 'text/plain' });
    return res.end('Asset fetch error');
  }
};

const handle = async (req, res) => {
  const u = new URL(req.url, 'http://x');
  const p = u.pathname;
  const m = req.method;

  // Static assets proxy/serve
  if (p.startsWith('/static/assets/')) {
    return handleAsset(req, res, p);
  }

  // API: Get question pool
  if (p === '/api/questions' && m === 'GET') {
    return send(res, 200, {
      questions: questionsSeed
    });
  }

  // API: Create new quiz
  if (p === '/api/quizzes' && m === 'POST') {
    const b = await body(req);
    const name = clean(b.name);
    const gender = b.gender === 'male' ? 'male' : 'female';
    const questions = Array.isArray(b.questions) ? b.questions : [];
    const answers = Array.isArray(b.answers) ? b.answers : [];

    if (!name || questions.length < 5 || answers.length !== questions.length) {
      return send(res, 400, { error: 'Please enter your name and answer all questions.' });
    }

    const id = rid(6);
    const key = rid(14);
    db[id] = {
      id,
      name,
      gender,
      questions,
      answers,
      key,
      createdAt: Date.now(),
      results: []
    };
    save();
    return send(res, 201, { id, key });
  }

  // API: Quiz operations
  const x = p.match(/^\/api\/quizzes\/([\w-]+)(\/play|\/board)?$/);
  if (x) {
    const q = db[x[1]];
    if (!q) return send(res, 404, { error: 'This quiz does not exist or was deleted.' });

    // Public quiz metadata (for player)
    if (!x[2] && m === 'GET') {
      return send(res, 200, {
        id: q.id,
        name: q.name,
        gender: q.gender,
        questions: q.questions,
        total: q.questions.length
      });
    }

    // Play quiz
    if (x[2] === '/play' && m === 'POST') {
      const b = await body(req);
      const player = clean(b.player);
      const guesses = Array.isArray(b.guesses) ? b.guesses : [];

      if (!player || guesses.length !== q.answers.length) {
        return send(res, 400, { error: 'Please enter your name and guess every question.' });
      }

      if (q.results.length >= 500) {
        return send(res, 429, { error: 'This quiz has reached the player limit.' });
      }

      let score = 0;
      for (let i = 0; i < q.answers.length; i++) {
        if (guesses[i] === q.answers[i]) score++;
      }

      const total = q.answers.length;
      let status = 'fake_friend';
      if (score >= Math.ceil(total * 0.7)) {
        status = 'real_one';
      } else if (score >= Math.ceil(total * 0.4)) {
        status = 'average';
      }

      const resultItem = {
        player,
        guesses,
        score,
        total,
        status,
        timestamp: Date.now()
      };

      q.results.push(resultItem);
      save();

      return send(res, 200, {
        score,
        total,
        status,
        answers: q.answers,
        questions: q.questions
      });
    }

    // Scoreboard for creator
    if (x[2] === '/board' && m === 'GET') {
      const authKey = u.searchParams.get('key');
      if (authKey !== q.key) {
        return send(res, 403, { error: 'Invalid scoreboard access link.' });
      }
      return send(res, 200, {
        id: q.id,
        name: q.name,
        gender: q.gender,
        questions: q.questions,
        answers: q.answers,
        results: q.results
      });
    }
  }

  if (p.startsWith('/api/')) return send(res, 404, { error: 'Endpoint not found' });

  // Serve Single Page Application
  fs.readFile(path.join(__dirname, 'index.html'), (e, d) => {
    res.writeHead(e ? 500 : 200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(e ? 'Server error' : d);
  });
};

http.createServer((req, res) => handle(req, res).catch(err => {
  console.error('Server unhandled error:', err);
  if (!res.headersSent) send(res, 500, { error: 'Internal server error' });
})).listen(PORT, '0.0.0.0', () => {
  console.log('RealOnes / Don\'t Block Me server running on http://0.0.0.0:' + PORT);
});
