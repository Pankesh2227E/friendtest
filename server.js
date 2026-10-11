const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { MongoClient } = require('mongodb');

const PORT = process.env.PORT || 3000;
const DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const FILE = path.join(DIR, 'db.json');
const STATIC_DIR = path.join(__dirname, 'static');

fs.mkdirSync(DIR, { recursive: true });
fs.mkdirSync(STATIC_DIR, { recursive: true });

// Local cache and persistence fallback
let db = {};
try { db = JSON.parse(fs.readFileSync(FILE, 'utf8')); } catch {}
const save = () => {
  try { fs.writeFileSync(FILE, JSON.stringify(db, null, 2)); } catch (e) { console.error('Save error:', e); }
};

// MongoDB Atlas Integration
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;
let mongoClient = null;
let quizzesCollection = null;
let contactsCollection = null;

async function initMongo() {
  if (!MONGODB_URI) {
    console.log('[Database] No MONGODB_URI provided in environment variables.');
    console.log('[Database] Currently using local storage (data/db.json). Ready to connect as soon as MONGODB_URI is provided.');
    return;
  }
  try {
    mongoClient = new MongoClient(MONGODB_URI, {
      maxPoolSize: 20,
      connectTimeoutMS: 10000,
      serverSelectionTimeoutMS: 10000
    });
    await mongoClient.connect();
    const dbInstance = mongoClient.db();
    quizzesCollection = dbInstance.collection('quizzes');
    contactsCollection = dbInstance.collection('contacts');
    await quizzesCollection.createIndex({ id: 1 }, { unique: true }).catch(() => {});
    console.log('[Database] Connected successfully to MongoDB Atlas!');

    // Populate active memory cache from MongoDB
    try {
      const cursor = quizzesCollection.find({});
      let count = 0;
      for await (const doc of cursor) {
        db[doc.id] = doc;
        count++;
      }
      console.log(`[Database] Synced ${count} quiz(zes) from MongoDB Atlas.`);
    } catch (syncErr) {
      console.warn('[Database] Initial sync note:', syncErr.message);
    }
  } catch (err) {
    console.error('[Database] MongoDB Atlas connection error:', err.message);
    console.log('[Database] Continuing with local storage fallback so site stays 100% active.');
  }
}

async function getQuiz(id) {
  if (db[id]) return db[id];
  if (quizzesCollection) {
    try {
      const doc = await quizzesCollection.findOne({ id });
      if (doc) {
        db[id] = doc;
        return doc;
      }
    } catch (e) {
      console.error('[Database] MongoDB fetch error:', e.message);
    }
  }
  return null;
}

async function saveQuiz(quiz) {
  db[quiz.id] = quiz;
  save(); // Persist locally as backup
  if (quizzesCollection) {
    try {
      await quizzesCollection.updateOne(
        { id: quiz.id },
        { $set: quiz },
        { upsert: true }
      );
    } catch (e) {
      console.error('[Database] MongoDB save error:', e.message);
    }
  }
}

async function addQuizResult(id, resultItem) {
  const q = db[id];
  if (q) {
    if (!q.results) q.results = [];
    q.results.push(resultItem);
    save();
  }
  if (quizzesCollection) {
    try {
      await quizzesCollection.updateOne(
        { id },
        { $push: { results: resultItem } }
      );
    } catch (e) {
      console.error('[Database] MongoDB result update error:', e.message);
    }
  }
}

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
  '.ico': 'image/x-icon',
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

// Completely local static assets server
const handleAsset = (req, res, pathname) => {
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
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      return res.end('Read error');
    }
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Asset not found');
};

const handle = async (req, res) => {
  const u = new URL(req.url, 'http://x');
  const p = u.pathname;
  const m = req.method;

  // Static assets serve locally
  if (p.startsWith('/static/assets/')) {
    return handleAsset(req, res, p);
  }

  // Favicon and icon image routes
  if (p === '/favicon.ico' || p === '/favicon.svg' || p === '/bears.png' || p === '/favicon-32.png' || p === '/favicon-192.png' || p === '/favicon-512.png') {
    const file = path.join(__dirname, p === '/bears.png' ? 'bears.png' : (p.startsWith('/favicon') ? p.slice(1) : p.slice(1)));
    if (fs.existsSync(file)) {
      const ext = path.extname(file).toLowerCase();
      res.writeHead(200, {
        'Content-Type': MIME_MAP[ext] || 'application/octet-stream',
        'Cache-Control': 'public, max-age=86400'
      });
      return res.end(fs.readFileSync(file));
    }
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
    const newQuiz = {
      id,
      name,
      gender,
      questions,
      answers,
      key,
      createdAt: Date.now(),
      results: []
    };
    await saveQuiz(newQuiz);
    return send(res, 201, { id, key });
  }

  // API: Quiz operations
  const x = p.match(/^\/api\/quizzes\/([\w-]+)(\/play|\/board)?$/);
  if (x) {
    const q = await getQuiz(x[1]);
    if (!q) return send(res, 404, { error: 'This quiz does not exist or was deleted.' });

    // Public quiz metadata (for player)
    if (!x[2] && m === 'GET') {
      return send(res, 200, {
        id: q.id,
        name: q.name,
        gender: q.gender,
        questions: q.questions,
        answers: q.answers,
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

      if (q.results && q.results.length >= 500) {
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

      await addQuizResult(q.id, resultItem);

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
        results: q.results || []
      });
    }
  }

  // API: Contact Us submission
  if (p === '/api/contact' && m === 'POST') {
    const b = await body(req);
    const name = clean(b.name);
    const email = clean(b.email);
    const subject = clean(b.subject) || 'General Inquiry';
    const message = String(b.message || '').trim().slice(0, 3000);

    if (!name || !email || !message) {
      return send(res, 400, { error: 'Please enter your name, email, and message.' });
    }

    const contactItem = {
      id: rid(8),
      name,
      email,
      subject,
      message,
      createdAt: Date.now()
    };

    if (!db.contacts) db.contacts = [];
    db.contacts.push(contactItem);
    save();

    if (contactsCollection) {
      try {
        await contactsCollection.insertOne(contactItem);
      } catch (err) {
        console.error('[Database] Failed to insert contact message into MongoDB:', err.message);
      }
    }

    return send(res, 200, { success: true, message: 'Your message has been received! We will be in touch shortly.' });
  }

  // SEO & Multi-Page Application (MPA) Routes
  if (p === '/about-us' || p === '/about-us.html' || p === '/about') {
    return fs.readFile(path.join(__dirname, 'about-us.html'), (e, d) => {
      res.writeHead(e ? 500 : 200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(e ? 'Server error' : d);
    });
  }

  if (p === '/privacy-policy' || p === '/privacy-policy.html' || p === '/privacy') {
    return fs.readFile(path.join(__dirname, 'privacy-policy.html'), (e, d) => {
      res.writeHead(e ? 500 : 200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(e ? 'Server error' : d);
    });
  }

  if (p === '/terms-and-conditions' || p === '/terms-and-conditions.html' || p === '/terms' || p === '/terms-of-service') {
    return fs.readFile(path.join(__dirname, 'terms-and-conditions.html'), (e, d) => {
      res.writeHead(e ? 500 : 200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(e ? 'Server error' : d);
    });
  }

  if (p === '/contact-us' || p === '/contact-us.html' || p === '/contact') {
    return fs.readFile(path.join(__dirname, 'contact-us.html'), (e, d) => {
      res.writeHead(e ? 500 : 200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(e ? 'Server error' : d);
    });
  }

  const pLower = p.toLowerCase();

  if (pLower === '/sitemap.xml') {
    const file = path.join(__dirname, 'sitemap.xml');
    if (fs.existsSync(file)) {
      let content = fs.readFileSync(file, 'utf8');
      const host = (req.headers['x-forwarded-host'] || req.headers.host || '').split(':')[0];
      const proto = req.headers['x-forwarded-proto'] || 'https';
      if (host && !host.includes('localhost') && !host.includes('127.0.0.1')) {
        content = content.replace(/https:\/\/ais-dev-hnj5fdszvpruhkimd7mw4e-160152659162\.asia-east1\.run\.app/g, `${proto}://${host}`);
      }
      res.writeHead(200, { 'Content-Type': 'application/xml; charset=utf-8' });
      return res.end(content);
    }
  }

  if (pLower === '/robots.xml') {
    const file = path.join(__dirname, 'robots.xml');
    if (fs.existsSync(file)) {
      let content = fs.readFileSync(file, 'utf8');
      const host = (req.headers['x-forwarded-host'] || req.headers.host || '').split(':')[0];
      const proto = req.headers['x-forwarded-proto'] || 'https';
      if (host && !host.includes('localhost') && !host.includes('127.0.0.1')) {
        content = content.replace(/https:\/\/ais-dev-hnj5fdszvpruhkimd7mw4e-160152659162\.asia-east1\.run\.app/g, `${proto}://${host}`);
      }
      res.writeHead(200, { 'Content-Type': 'application/xml; charset=utf-8' });
      return res.end(content);
    }
  }

  if (pLower === '/robots.txt') {
    const file = path.join(__dirname, 'robots.txt');
    if (fs.existsSync(file)) {
      let content = fs.readFileSync(file, 'utf8');
      const host = (req.headers['x-forwarded-host'] || req.headers.host || '').split(':')[0];
      const proto = req.headers['x-forwarded-proto'] || 'https';
      if (host && !host.includes('localhost') && !host.includes('127.0.0.1')) {
        content = content.replace(/https:\/\/ais-dev-hnj5fdszvpruhkimd7mw4e-160152659162\.asia-east1\.run\.app/g, `${proto}://${host}`);
      }
      res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end(content);
    }
  }

  // Explicit error page routes for testing and inspection
  if (p === '/404' || p === '/404.html') {
    return fs.readFile(path.join(__dirname, '404.html'), (e, d) => {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(e ? '404 Not Found' : d);
    });
  }

  if (p === '/500' || p === '/500.html') {
    return fs.readFile(path.join(__dirname, '500.html'), (e, d) => {
      res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(e ? '500 Server Error' : d);
    });
  }

  if (p.startsWith('/api/')) return send(res, 404, { error: 'Endpoint not found' });

  // Serve Single Page Application only on root / or /index.html
  if (p === '/' || p === '/index.html') {
    return fs.readFile(path.join(__dirname, 'index.html'), (e, d) => {
      res.writeHead(e ? 500 : 200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(e ? 'Server error' : d);
    });
  }

  // Real HTTP 404 for any unknown route (prevents soft 404s for SEO & Google Ads compliance)
  fs.readFile(path.join(__dirname, '404.html'), (e, d) => {
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(e ? '404 Not Found' : d);
  });
};

initMongo();

http.createServer((req, res) => handle(req, res).catch(err => {
  console.error('Server unhandled error:', err);
  if (!res.headersSent) {
    if (req.url && req.url.startsWith('/api/')) {
      send(res, 500, { error: 'Internal server error' });
    } else {
      const error500Path = path.join(__dirname, '500.html');
      if (fs.existsSync(error500Path)) {
        res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(fs.readFileSync(error500Path));
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Internal Server Error');
      }
    }
  }
})).listen(PORT, '0.0.0.0', () => {
  console.log('RealOnes / Don\'t Block Me server running on http://0.0.0.0:' + PORT);
});
