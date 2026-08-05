// Cleaned server.js v22.15
const fs = require('fs');
const path = require('path');
let EMBEDDED_DEFAULT_STATE = {};
try {
  const defaultStatePath = path.join(__dirname, 'db.json');
  if (fs.existsSync(defaultStatePath)) {
    let raw = fs.readFileSync(defaultStatePath, 'utf8');
    if (raw && raw.charCodeAt(0) === 0xFEFF) raw = raw.slice(1);
    EMBEDDED_DEFAULT_STATE = JSON.parse(raw);
  }
} catch (e) {
  console.error('Error loading fallback EMBEDDED_DEFAULT_STATE:', e.message);
}

const express = require('express');
const cors = require('cors');
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
    if (!raw || raw.trim().length === 0) return (typeof EMBEDDED_DEFAULT_STATE !== 'undefined') ? JSON.parse(JSON.stringify(EMBEDDED_DEFAULT_STATE)) : {};
    if (raw.charCodeAt(0) === 0xFEFF) raw = raw.slice(1);
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.leads) || parsed.leads.length === 0 || !Array.isArray(parsed.users) || parsed.users.length < 15) {
      return (typeof EMBEDDED_DEFAULT_STATE !== 'undefined') ? JSON.parse(JSON.stringify(EMBEDDED_DEFAULT_STATE)) : parsed;
    }
    return parsed;
  } catch (err) {
    console.error('Error reading/parsing:', err);
    return (typeof EMBEDDED_DEFAULT_STATE !== 'undefined') ? JSON.parse(JSON.stringify(EMBEDDED_DEFAULT_STATE)) : {};
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
    .replace(/H╞░╞íng V┼⌐/gi, 'Hương Vũ')
    .replace(/Cß║ºn t├¼m nguß╗ôn[\s\S]*?ko/gi, '[Mã KH: MH404 - Liên193] Cần tìm nguồn hàng ruy băng decor \n15/6 : Làm việc với xưởng ruy băng và lưới Kh gửi. Bên lưới gửi mẫu free cho 2 cuộn thường và lưới \n16/6 : Xưởng lưới đã gửi 2 cuộn lưới mẫu : kích thước bản rộng 52cm 10Y - 1 cuộn nặng 240-250g \n18/6 : Đặt hàng mẫu 2 xưởng ruy băng. Đang đợi hàng về \n25/6 : Hàng mẫu về đợi khách làm dòng sp cần ko')
    .replace(/Nh├ƒΓò[\s\S]*?hΓö£ng/gi, 'Nhập sáp vuốt tóc.\nĐang làm thủ tục công bố ở VN : dự kiến 1,5 tháng nữa mới xong\nSau khi xong mới có thể nhập hàng')
    .replace(/CN : \u0110i[\s\S]*?ttin sp/gi, 'CN : Điều hòa cho oto\n9/7 : Bên xưởng TQ đang ảnh hưởng mưa bão nên chưa cập nhật được ttin sp')
    .replace(/\[M├\u00C2 KH: MH406[\s\S]*?đặt sau/gi, '[Mã KH: MH406 - C. Hồng VPP] 4/7 : Đang chốt lại số lượng thẻ để lên đơn. Sang tuần T2 kế toán ck\n6/7 : Đã ck cọc hàng - đi hàng thẻ trước. Bút sẽ đặt sau')
    .replace(/10\/7 : Cß║ºn t╞░[\s\S]*?B├║t thß╗¡ ─iß╗n/gi, '10/7 : Cần tư vấn nhập hàng - Zalo Đinh Chí Thiết bị điện : \n1. Bút thử điện : đi CN\n2. Đàm phán xưởng nhập hàng : Xưởng sx đèn chiếu sáng\n11/7 : Báo giá CN sp Bút thử điện')
    .replace(/CN : ─Éß╗i KH[\s\S]*?ttin sp/gi, 'CN : Đợi KH xin thông tin NCC về lô hàng gạch \n10/7 : KH đang đợi NCC cập nhật ttin sp')
    .replace(/MH : 20 cuß╗Ön[\s\S]*?dc/gi, 'MH : 20 cuộn băng dính 3M. Đã báo giá\n26/6 : Liên hệ KH chưa rep\n27/6: Gđ ko liên lạc được')
    .replace(/Hß╗Åi KG : b[\s\S]*?TQ/gi, 'Hỏi KG : bình dầu xanh, ... gửi sang TQ')
    .replace(/KH y├¬u cß║ºu[\s\S]*?cty/gi, 'KH yêu cầu : Hướng dẫn tạo tk app cty')
    .replace(/Dang xin sdt[\s\S]*?gß╗¡i/gi, 'Đang xin sđt hỗ trợ. Đã gửi')
    .replace(/\[M├\u00C2 KH: MH409[\s\S]*?ph├¡ dv/gi, '[Mã KH: MH409 - Vũ Huyền] KH cũ trước đó giờ mới đặt lại : 4050 , 30k/1kg, 2% phí dv')
    .replace(/\[M├\u00C2 KH: MH408[\s\S]*?ph├¡ dv\./gi, '[Mã KH: MH408 - Nguyễn Minh Tâm] Đặt set váy : KH lẻ 35k/1kg. 0% phí dv.')
    .replace(/Nhß║⌐n giß║íy Tiß║æu[\s\S]*?trao dß╗òi/gi, 'Nhận giấy Tiểu ngạch và CN\n3/7 : Đã báo giá CN. Hẹn KH sang tuần qua công ty để làm việc.\n11/7 : Hẹn lịch KH thứ 2 qua công ty trao đổi')
    .replace(/Mua hß╗Ö h[\s\S]*?quan t├óm/gi, 'Mua hộ hàng trên TMĐT. Mua máy cân da báo cước. Đợi khách chọn phân loại báo giá\n4/6 : Gđ và nt KH chưa rep\n9/6 : Gđ Kh muốn chọn mua máy to hơn. Sẽ liên hệ lại sau\n13/6: Lhe Kh hỏi thăm\n23/6: Gđ cho KH để hỗ trợ. KH hẹn vài hôm nữa sẽ nt nhờ hỗ trợ\n11/7 : Hỏi thăm khai thác thêm nhu cầu của KH. KH ko quan tâm')
    .replace(/KG : h[\s\S]*?b[\s\S]*?o l[\s\S]*?i/gi, 'KG : hàng lẻ và lô quần áo- Tiên Lãng HP. Đang báo giá lẻ : 30k- Lô : 26k.\n. KH phản hồi đang đi hàng Lô về HN là 20k/1kg.\n9/6 : Báo giá hàng lô 22k/1kg - Hàng lẻ: 30k\n11/6: Gđ cho KH ko nghe máy\n12/6: Đang chốt lại với KH\n13/6 : KH đợi mấy hôm nữa có đơn sẽ báo lại')
    .replace(/Nhß║¡p khß║⌐u CN : Cß║⌐u[\s\S]*?nß╗»a/gi, 'Nhập khẩu CN : Cẩu cần trục - đang xin ttin check thủ tục : 83 tấn\n10/7 : đang check thủ tục line sea\n12/7 : Hẹn khách sang tuần báo lại. Minh đang liên hệ thêm lần nữa')
    .replace(/Cß╗¡a cu[\s\S]*?hß╗Åi th─âm KH/gi, 'Cửa cuốn tại HP : KG CN bộ cửa : cần báo giá 1 bộ và 10 bộ. Đang check thủ tục và thuế phí\n5/7 : Liên hệ hỏi thăm KH. KH phản hồi giá ok. Hỏi thêm về dv TTH\n11/7 : Liên hệ lại hỏi thăm KH')
    .replace(/3\/7 :B[\s\S]*?o gi[\s\S]*? CN : 8 bß╗Ö[\s\S]*?d[\s\S]*?n h[\s\S]*?ng/gi, '3/7 : Báo giá CN : 8 bộ kẹp Phanh của Nga\n4/7 : Đã nt cho KH để hỏi thăm\n11/7 : Liên hệ Kh hỏi thăm về đơn hàng')
    .replace(/Hß╗Åi b[\s\S]*?ng qu[\s\S]*?i/gi, 'Hỏi bóng quái')
    .replace(/KG : h[\s\S]*?ng l[\s\S]*? v[\s\S]*? l[\s\S]*? qu[\s\S]*?n[\s\S]*?o- Ti[\s\S]*?n Lang HP[\s\S]*?b[\s\S]*?o l[\s\S]*?i/gi, 'KG : hàng lẻ và lô quần áo- Tiên Lãng HP. Đang báo giá lẻ : 30k- Lô : 26k.\n. KH phản hồi đang đi hàng Lô về HN là 20k/1kg.\n9/6 : Báo giá hàng lô 22k/1kg - Hàng lẻ: 30k\n11/6: Gđ cho KH ko nghe máy\n12/6: Đang chốt lại với KH\n13/6 : KH đợi mấy hôm nữa có đơn sẽ báo lại')
    .replace(/\uFFFD/g, '');
}

// Helper to clean any residual Mojibake in server state
function sanitizeServerState(state) {
  if (!state) return state;
  state.dbVersion = '22.15';

  if (Array.isArray(state.users)) {
    const authenticNames = {
      'usr-1': 'Nguyễn Hoàng Minh',
      'usr-2': 'Trần Tú Anh',
      'usr-3': 'Phùng Thị Minh Phương',
      'usr-4': 'Đoàn Thị Hải Linh',
      'usr-5': 'Đặng Thị Phương Thảo',
      'usr-6': 'Lê Thị Thùy Trang',
      'usr-7': 'Bùi Thị Bích Phượng',
      'usr-8': 'Nguyễn Phương Anh',
      'usr-9': 'Phạm Duy Hưng',
      'usr-10': 'Đỗ Như Quỳnh',
      'usr-11': 'Vũ Linh Chi',
      'usr-12': 'Lưu Thành Đạt',
      'usr-13': 'Dương Thị Hồng Yến',
      'usr-14': 'Đào Minh Tuấn',
      'usr-15': 'Nguyễn Tuấn Anh',
      'usr-16': 'Trịnh Thị Bình Dương',
      'usr-17': 'Mai Thị Thu Hiền'
    };

    state.users.forEach(u => {
      if (authenticNames[u.id]) {
        u.name = authenticNames[u.id];
      }
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
  localState.dbVersion = '22.15';

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
          console.warn('Could not parse Postgres state_json:', e.message);
        }

        if (!dbState || !Array.isArray(dbState.leads) || dbState.leads.length === 0 || !Array.isArray(dbState.users) || dbState.users.length === 0) {
          console.log('Postgres DB state is empty, initializing with local db.json...');
          await client.query('INSERT INTO app_state (id, state_json) VALUES (1, $1) ON CONFLICT (id) DO UPDATE SET state_json = $1', [JSON.stringify(localState)]);
          await client.end();
          return sanitizeServerState(localState);
        }
        if (!dbState.shipment_workflows || !Array.isArray(dbState.shipment_workflows) || dbState.shipment_workflows.length < localState.shipment_workflows.length) {
          const workflowMap = new Map();
          if (localState.shipment_workflows) localState.shipment_workflows.forEach(w => { if (w && w.id) workflowMap.set(String(w.id), w); });
          if (dbState.shipment_workflows) dbState.shipment_workflows.forEach(w => { if (w && w.id) workflowMap.set(String(w.id), w); });
          dbState.shipment_workflows = Array.from(workflowMap.values());
          try {
            await client.query('INSERT INTO app_state (id, state_json) VALUES (1, $1) ON CONFLICT (id) DO UPDATE SET state_json = $1', [JSON.stringify(dbState)]);
          } catch (e) {}
        }
        dbState.dbVersion = '22.15';
        await client.end();
        return sanitizeServerState(dbState);
      } else {
        await client.query('INSERT INTO app_state (id, state_json) VALUES (1, $1)', [JSON.stringify(localState)]);
        await client.end();
        return sanitizeServerState(localState);
      }
    } catch (err) {
      console.error('Database connection error, falling back to local db.json:', err);
      try { await client.end(); } catch (e) {}
      return sanitizeServerState(localState);
    }
  }
  return sanitizeServerState(localState);
}

function parseTimestampSafe(val) {
  if (!val) return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  if (typeof val === 'string') {
    if (/^\d+$/.test(val)) return parseInt(val, 10);
    let iso = val.trim().replace(' ', 'T');
    let parsed = new Date(iso).getTime();
    if (!isNaN(parsed)) return parsed;
    const parts = val.split(/[\s/:\-]+/);
    if (parts.length >= 3) {
      if (parts[0].length === 2 && parts[2].length === 4) {
        parsed = new Date(parts[2], parts[1] - 1, parts[0], parts[3] || 0, parts[4] || 0).getTime();
        if (!isNaN(parsed)) return parsed;
      }
      if (parts[0].length === 4) {
        parsed = new Date(parts[0], parts[1] - 1, parts[2], parts[3] || 0, parts[4] || 0).getTime();
        if (!isNaN(parsed)) return parsed;
      }
    }
  }
  return 0;
}

function getItemLatestTimestamp(item) {
  if (!item) return 0;
  let maxT = 0;
  if (item.stageEntryTimes && typeof item.stageEntryTimes === 'object') {
    Object.values(item.stageEntryTimes).forEach(t => {
      const val = parseTimestampSafe(t);
      if (val > maxT) maxT = val;
    });
  }
  const uTime = parseTimestampSafe(item.updatedTime);
  if (uTime > maxT) maxT = uTime;
  const uAt = parseTimestampSafe(item.updatedAt);
  if (uAt > maxT) maxT = uAt;
  return maxT;
}

function mergeStateObjects(existingState, incomingState) {
  if (!existingState) return incomingState;
  if (!incomingState) return existingState;

  const merged = { ...existingState, ...incomingState };
  merged.lastUpdated = Date.now();
  merged.dbVersion = '22.15';

  const deletedSet = new Set([
    ...(existingState.deletedIds || []),
    ...(incomingState.deletedIds || [])
  ]);
  merged.deletedIds = Array.from(deletedSet);

  const mergeArrayById = (arr1, arr2) => {
    const map = new Map();
    if (Array.isArray(arr1)) {
      arr1.forEach(item => {
        if (item && item.id && !deletedSet.has(String(item.id))) {
          map.set(String(item.id), item);
        }
      });
    }
    if (Array.isArray(arr2)) {
      arr2.forEach(item => {
        if (!item || !item.id || deletedSet.has(String(item.id))) return;
        const key = String(item.id);
        const existing = map.get(key);
        if (!existing) {
          map.set(key, item);
        } else {
          const existingTime = getItemLatestTimestamp(existing);
          const incomingTime = getItemLatestTimestamp(item);
          if (incomingTime >= existingTime) {
            map.set(key, { ...existing, ...item });
          } else {
            map.set(key, { ...item, ...existing });
          }
        }
      });
    }
    return Array.from(map.values());
  };

  if (incomingState.shipment_workflows || existingState.shipment_workflows) {
    merged.shipment_workflows = mergeArrayById(existingState.shipment_workflows, incomingState.shipment_workflows);
  }
  if (incomingState.clients || existingState.clients) {
    merged.clients = mergeArrayById(existingState.clients, incomingState.clients);
  }
  if (incomingState.leads || existingState.leads) {
    merged.leads = mergeArrayById(existingState.leads, incomingState.leads);
  }
  if (incomingState.projects || existingState.projects) {
    merged.projects = mergeArrayById(existingState.projects, incomingState.projects);
  }
  if (incomingState.single_tasks || existingState.single_tasks) {
    merged.single_tasks = mergeArrayById(existingState.single_tasks, incomingState.single_tasks);
  }

  return merged;
}

async function saveState(newState) {
  if (!newState || !newState.leads || !Array.isArray(newState.leads) || newState.leads.length === 0) {
    console.warn('Rejected attempt to save empty state to database!');
    return false;
  }

  let currentState = readJsonFile(path.join(__dirname, 'db.json'));
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
        let rawDb = res.rows[0].state_json;
        if (rawDb && rawDb.charCodeAt(0) === 0xFEFF) rawDb = rawDb.slice(1);
        try { currentState = JSON.parse(rawDb); } catch(e) {}
      }
      
      const mergedState = mergeStateObjects(currentState, newState);
      await client.query('INSERT INTO app_state (id, state_json) VALUES (1, $1) ON CONFLICT (id) DO UPDATE SET state_json = $1', [JSON.stringify(mergedState)]);
      await client.end();

      try {
        fs.writeFileSync(path.join(__dirname, 'db.json'), JSON.stringify(mergedState, null, 2), 'utf8');
      } catch (err) {}
      return mergedState.lastUpdated;
    } catch (err) {
      console.error('Error saving state to Postgres:', err);
      try { await client.end(); } catch (e) {}
    }
  }

  const mergedState = mergeStateObjects(currentState, newState);
  try {
    fs.writeFileSync(path.join(__dirname, 'db.json'), JSON.stringify(mergedState, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing local db.json:', err);
  }
  return mergedState.lastUpdated;
}

// GET /api/state: Load entire CRM database
app.get('/api/state', async (req, res) => {
  try {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    const state = await loadState();
    if (!state || !Array.isArray(state.leads) || state.leads.length === 0) {
      console.warn('/api/state loadState returned empty leads, serving local db.json fallback...');
      const fallbackState = readJsonFile(path.join(__dirname, 'db.json'));
      return res.json(sanitizeServerState(fallbackState));
    }
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
      const lastUpdated = await saveState(req.body);
      res.json({ success: true, lastUpdated: lastUpdated || Date.now() });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  });
  await saveStateQueue;
});

// ==================== AUTO BACKUP SCHEDULER & MANAGEMENT ==================== //
const BACKUP_DIR = path.join(__dirname, 'backups');
if (!fs.existsSync(BACKUP_DIR)) {
  try { fs.mkdirSync(BACKUP_DIR, { recursive: true }); } catch (e) {}
}

async function createBackupSnapshot(type = 'auto', customLabel = '') {
  try {
    const currentState = await loadState();
    if (!currentState || !Array.isArray(currentState.leads)) {
      console.warn('[Backup] Cannot create backup of invalid or empty state.');
      return null;
    }

    const now = new Date();
    const utcMs = now.getTime() + (now.getTimezoneOffset() * 60000);
    const vnTime = new Date(utcMs + (7 * 3600000));

    const yyyy = vnTime.getFullYear();
    const mm = String(vnTime.getMonth() + 1).padStart(2, '0');
    const dd = String(vnTime.getDate()).padStart(2, '0');
    const hh = String(vnTime.getHours()).padStart(2, '0');
    const min = String(vnTime.getMinutes()).padStart(2, '0');
    const ss = String(vnTime.getSeconds()).padStart(2, '0');

    const timestampStr = `${yyyy}-${mm}-${dd}_${hh}-${min}-${ss}`;
    const filename = `${type}_backup_${timestampStr}${customLabel ? '_' + customLabel : ''}.json`;
    const filePath = path.join(BACKUP_DIR, filename);

    const snapshot = {
      backupMeta: {
        type: type === 'auto_daily' ? `Tự động (${customLabel || 'Khung giờ 12h/17h30'})` : 'Sao lưu thủ công',
        createdAt: `${dd}/${mm}/${yyyy} ${hh}:${min}:${ss}`,
        timestamp: vnTime.getTime(),
        dbVersion: currentState.dbVersion || '22.15',
        totalLeads: currentState.leads ? currentState.leads.length : 0,
        totalTasks: currentState.tasks ? currentState.tasks.length : 0,
        totalUsers: currentState.users ? currentState.users.length : 0
      },
      data: currentState
    };

    fs.writeFileSync(filePath, JSON.stringify(snapshot, null, 2), 'utf8');
    console.log(`[Backup] Successfully created ${type} backup: ${filename}`);

    cleanOldBackups(30);

    return {
      filename: filename,
      meta: snapshot.backupMeta,
      size: fs.statSync(filePath).size
    };
  } catch (err) {
    console.error('[Backup] Error creating backup snapshot:', err);
    return null;
  }
}

function cleanOldBackups(daysToKeep = 30) {
  try {
    const files = fs.readdirSync(BACKUP_DIR);
    const cutoff = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);
    files.forEach(file => {
      if (file.endsWith('.json')) {
        const fp = path.join(BACKUP_DIR, file);
        const stat = fs.statSync(fp);
        if (stat.mtimeMs < cutoff) {
          try { fs.unlinkSync(fp); } catch (e) {}
        }
      }
    });
  } catch (err) {}
}

let lastAutoBackupSlot = '';
setInterval(() => {
  try {
    const now = new Date();
    const utcMs = now.getTime() + (now.getTimezoneOffset() * 60000);
    const vnTime = new Date(utcMs + (7 * 3600000));

    const hh = vnTime.getHours();
    const mm = vnTime.getMinutes();
    const dateStr = `${vnTime.getFullYear()}-${vnTime.getMonth() + 1}-${vnTime.getDate()}`;

    // Auto backup at 12:00 PM and 17:30 PM ICT
    if ((hh === 12 && mm === 0) || (hh === 17 && mm === 30)) {
      const currentSlot = `${dateStr}_${hh}_${mm}`;
      if (lastAutoBackupSlot !== currentSlot) {
        lastAutoBackupSlot = currentSlot;
        const slotName = (hh === 12) ? '12h00' : '17h30';
        createBackupSnapshot('auto_daily', slotName);
      }
    }
  } catch (e) {
    console.error('[BackupScheduler] Error:', e);
  }
}, 45000);

// API: List all backups
app.get('/api/backups', (req, res) => {
  try {
    if (!fs.existsSync(BACKUP_DIR)) {
      return res.json([]);
    }
    const files = fs.readdirSync(BACKUP_DIR).filter(f => f.endsWith('.json'));
    const list = files.map(file => {
      const fp = path.join(BACKUP_DIR, file);
      const stat = fs.statSync(fp);
      let meta = {
        type: file.includes('auto') ? 'Khung giờ 12h/17h30' : 'Thủ công',
        createdAt: stat.mtime.toLocaleString('vi-VN'),
        timestamp: stat.mtimeMs,
        totalLeads: 0
      };
      try {
        const raw = fs.readFileSync(fp, 'utf8');
        const parsed = JSON.parse(raw);
        if (parsed.backupMeta) meta = parsed.backupMeta;
      } catch (e) {}

      return {
        id: file,
        filename: file,
        size: stat.size,
        date: meta.createdAt,
        type: meta.type || (file.includes('auto') ? 'Khung giờ 12h/17h30' : 'Thủ công'),
        totalLeads: meta.totalLeads || 0,
        mtimeMs: stat.mtimeMs
      };
    }).sort((a, b) => b.mtimeMs - a.mtimeMs);

    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Manual backup creation
app.post('/api/backups/create', async (req, res) => {
  try {
    const label = (req.body && req.body.label) ? req.body.label : 'manual';
    const result = await createBackupSnapshot('manual', label);
    if (result) {
      res.json({ success: true, backup: result });
    } else {
      res.status(500).json({ error: 'Không thể tạo bản sao lưu' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Restore backup
app.post('/api/backups/restore', async (req, res) => {
  try {
    const filename = req.body ? (req.body.filename || req.body.id) : null;
    if (!filename) {
      return res.status(400).json({ error: 'Thiếu tên file sao lưu' });
    }
    const fp = path.join(BACKUP_DIR, filename);
    if (!fs.existsSync(fp)) {
      return res.status(404).json({ error: 'Bản sao lưu không tồn tại' });
    }

    const raw = fs.readFileSync(fp, 'utf8');
    const parsed = JSON.parse(raw);
    const stateToRestore = parsed.data || parsed;

    if (!stateToRestore || !Array.isArray(stateToRestore.leads) || stateToRestore.leads.length === 0) {
      return res.status(400).json({ error: 'Dữ liệu bản sao lưu bị trống hoặc không hợp lệ' });
    }

    stateToRestore.lastUpdated = Date.now();
    await saveState(stateToRestore);

    res.json({
      success: true,
      message: `Đã phục hồi thành công dữ liệu từ bản sao lưu ${filename}!`,
      restoredLeads: stateToRestore.leads.length
    });
  } catch (err) {
    console.error('Error restoring backup:', err);
    res.status(500).json({ error: err.message });
  }
});

// API: Download backup file
app.get('/api/backups/download/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const fp = path.join(BACKUP_DIR, filename);
    if (!fs.existsSync(fp)) {
      return res.status(404).send('File không tồn tại');
    }
    res.download(fp, filename);
  } catch (err) {
    res.status(500).send(err.message);
  }
});


app.use((req, res, next) => {
  if (req.url.endsWith('.html') || req.url.endsWith('.js') || req.url.endsWith('.css') || req.url === '/') {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  next();
});

app.get('*', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.sendFile(path.join(__dirname, 'index.html'));
});


app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});