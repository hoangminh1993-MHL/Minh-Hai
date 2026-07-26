const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});
app.use(express.static(path.join(__dirname, '.')));

const PORT = process.env.PORT || 3000;
const DATABASE_URL = process.env.DATABASE_URL;

// Helper to safely read and parse JSON file, stripping UTF-8 BOM if present
function readJsonFile(filePath) {
  try {
    let raw = fs.readFileSync(filePath, 'utf8');
    if (raw.charCodeAt(0) === 0xFEFF) {
      raw = raw.slice(1);
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading/parsing:', err);
    return {};
  }
}

function sanitizeVietnameseString(str) {
  if (!str || typeof str !== 'string') return str;
  return str
    .replace(/D├║ng T├║c|D├║ng t├║c|D╞░╞íng T├│c|Dung Tóc/gi, 'Dương Tóc')
    .replace(/Anh Ph╞░╞íng|Anh Phuong/gi, 'Anh Phương')
    .replace(/Minh Nguyß╗àn|Minh Nguyen/gi, 'Minh Nguyễn')
    .replace(/Hu╞░╞íng Phß║ím|Hu╞░╞íng Phạ|Huong Pham/gi, 'Huơng Phạm')
    .replace(/Xu├ón H├ái ─É├¡nh|Xu├ón Hß║úi Đinh|Xuân Hải Dinh/gi, 'Xuân Hải Đinh')
    .replace(/─É├¡nh Ph├║c An|Dinh Phúc An/gi, 'Đinh Phúc An')
    .replace(/Ho├óng Th├╣y Du╞░╞íng/gi, 'Hoàng Thùy Dương')
    .replace(/Phß║ím Thuß║¡n/gi, 'Phạm Thuận')
    .replace(/Mai Hß╗Öng VPP/gi, 'Mai Hồng VPP')
    .replace(/Ho├óng Ph├ít Koffmann/gi, 'Hoàng Phát Koffmann')
    .replace(/V├▓ng bi Ph├║ Qu├╜/gi, 'Vòng bi Phú Quý')
    .replace(/Nha Phuong B├╣i/gi, 'Nha Phuong Bùi')
    .replace(/Quß╗æc Kh├ính/gi, 'Quốc Khánh')
    .replace(/Minh T├ím/gi, 'Minh Tâm')
    .replace(/Bß║úo Ngß╗ìc Rice/gi, 'Bảo Ngọc Rice')
    .replace(/S╞í n Quang L├ím/gi, 'Sơn Quang Lâm')
    .replace(/Phß║ím Thß╗ï Anh Ngß╗ìc/gi, 'Phạm Thị Anh Ngọc')
    .replace(/Ho├óng C╞░╞íng Biz/gi, 'Hoàng Cường Biz')
    .replace(/V┼⌐ Ngß╗ìc Huyß╗ün/gi, 'Vũ Ngọc Huyền')
    .replace(/Trß║ºn Hiß║┐u/gi, 'Trần Hiếu')
    .replace(/H╞░╞íng V┼⌐/gi, 'Hương Vũ');
}

// Helper to clean any residual Mojibake in server state
function sanitizeServerState(state) {
  if (!state) return state;

  if (Array.isArray(state.users)) {
    state.users.forEach(u => {
      if (u.username === 'hoangminh' || u.id === 'usr-1') u.name = 'Nguyễn Hoàng Minh';
      if (u.username === 'tuanh' || u.id === 'usr-2') u.name = 'Trần Tú Anh';
      if (u.username === 'minhphuong' || u.id === 'usr-3') u.name = 'M.Phương (CSKH)';
      if (u.username === 'trang' || u.id === 'usr-6') u.name = 'Trang (CSKH)';
      if (u.username === 'phuong' || u.id === 'usr-7') u.name = 'Phượng (CSKH)';
    });
  }

  if (Array.isArray(state.leads)) {
    state.leads.forEach(l => {
      if (l.name) l.name = sanitizeVietnameseString(l.name);
      if (l.stage) l.stage = sanitizeVietnameseString(l.stage);
      if (l.note) l.note = sanitizeVietnameseString(l.note);
      if (l.failReason) l.failReason = sanitizeVietnameseString(l.failReason);
    });
  }
  return state;
}

// Helper to load state from Supabase PostgreSQL or local db.json
async function loadState() {
  const localState = readJsonFile(path.join(__dirname, 'db.json'));
  localState.dbVersion = '20.98';

  if (DATABASE_URL) {
    const client = new Client({
      connectionString: DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });
    try {
      await client.connect();
      await client.query("SET client_encoding = 'UTF8'");
      await client.query('CREATE TABLE IF NOT EXISTS app_state (id INT PRIMARY KEY, state_json TEXT)');
      const res = await client.query('SELECT state_json FROM app_state WHERE id = 1');
      if (res.rows.length > 0) {
        let dbState = {};
        try {
          let rawDb = res.rows[0].state_json;
          if (rawDb && rawDb.charCodeAt(0) === 0xFEFF) rawDb = rawDb.slice(1);
          dbState = JSON.parse(rawDb);
        } catch (e) {
          console.warn('Could not parse Postgres state_json, will force sync local db.json:', e.message);
        }

        if (!dbState || dbState.dbVersion !== '20.98') {
          console.log('Force updating Postgres DB state with clean db.json v20.98...');
          await client.query('INSERT INTO app_state (id, state_json) VALUES (1, $1) ON CONFLICT (id) DO UPDATE SET state_json = $1', [JSON.stringify(localState)]);
          await client.end();
          return localState;
        }
        await client.end();
        return dbState;
      } else {
        await client.query('INSERT INTO app_state (id, state_json) VALUES (1, $1)', [JSON.stringify(localState)]);
        await client.end();
        return localState;
      }
    } catch (err) {
      console.error('Database connection error, falling back to local db.json:', err);
      try { await client.end(); } catch (e) {}
      return localState;
    }
  }
  return localState;
}

async function saveState(newState) {
  newState.dbVersion = '20.98';
  if (DATABASE_URL) {
    const client = new Client({
      connectionString: DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });
    try {
      await client.connect();
      await client.query("SET client_encoding = 'UTF8'");
      await client.query('CREATE TABLE IF NOT EXISTS app_state (id INT PRIMARY KEY, state_json TEXT)');
      await client.query('INSERT INTO app_state (id, state_json) VALUES (1, $1) ON CONFLICT (id) DO UPDATE SET state_json = $1', [JSON.stringify(newState)]);
      await client.end();
    } catch (err) {
      console.error('Error saving state to Postgres:', err);
      try { await client.end(); } catch (e) {}
    }
  }
  try {
    fs.writeFileSync(path.join(__dirname, 'db.json'), JSON.stringify(newState, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing local db.json:', err);
  }
}

// GET /api/state: Load entire CRM database
app.get('/api/state', async (req, res) => {
  try {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    const state = await loadState();
    res.json(sanitizeServerState(state) || {});
  } catch (err) {
    console.error('Error in /api/state:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/state: Save entire CRM database
let saveStateQueue = Promise.resolve();

app.post('/api/state', async (req, res) => {
  saveStateQueue = saveStateQueue.then(async () => {
    try {
      await saveState(req.body);
      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  });
  await saveStateQueue;
});

// POST /api/sync: Smart Delta Sync
app.post('/api/sync', async (req, res) => {
  saveStateQueue = saveStateQueue.then(async () => {
    try {
      const syncData = req.body || {};
      const currentState = await loadState();
      
      const collections = ['users', 'leads', 'tasks', 'workflows', 'sausageLogs', 'notifications', 'clients', 'projects', 'shipment_workflows', 'single_tasks', 'suggestions'];
      
      collections.forEach(key => {
        if (syncData[key]) {
          currentState[key] = syncData[key];
        }
      });

      if (syncData.currentUserId) currentState.currentUserId = syncData.currentUserId;
      if (syncData.fbConfig) currentState.fbConfig = syncData.fbConfig;
      currentState.lastUpdated = Date.now();

      await saveState(currentState);
      res.json({ success: true, lastUpdated: currentState.lastUpdated });
    } catch (err) {
      console.error('Sync Error:', err);
      res.status(500).json({ error: err.message });
    }
  });
  await saveStateQueue;
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});