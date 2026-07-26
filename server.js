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

  if (Array.isArray(state.users)) {
    state.users.forEach(u => {
      if (u.username === 'hoangminh' || u.id === 'usr-1') u.name = 'Nguyễn Hoàng Minh';
      if (u.username === 'tuanh' || u.id === 'usr-2') u.name = 'Trần Tú Anh';
      if (u.username === 'minhphuong' || u.id === 'usr-3') u.name = 'Phượng Thị Minh Phương';
      if (u.username === 'hailinh' || u.id === 'usr-4') u.name = 'Đoàn Thị Hải Linh';
      if (u.username === 'sales1' || u.id === 'usr-5') u.name = 'Sales 1';
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
  localState.dbVersion = '21.09';

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

        if (!dbState || dbState.dbVersion !== '21.09' || !Array.isArray(dbState.leads) || dbState.leads.length === 0) {
          console.log('Force updating Postgres DB state with clean db.json v21.09...');
          await client.query('INSERT INTO app_state (id, state_json) VALUES (1, $1) ON CONFLICT (id) DO UPDATE SET state_json = $1', [JSON.stringify(localState)]);
          await client.end();
          return sanitizeServerState(localState);
        }
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

async function saveState(newState) {
  if (!newState || !newState.leads || !Array.isArray(newState.leads) || newState.leads.length === 0) {
    console.warn('Rejected attempt to save empty state to database!');
    return false;
  }
  newState.dbVersion = '21.09';
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
      return true;
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