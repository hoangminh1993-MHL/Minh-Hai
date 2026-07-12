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

// Helper to load state from Supabase PostgreSQL or local db.json
async function loadState() {
  if (DATABASE_URL) {
    const client = new Client({
      connectionString: DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });
    try {
      await client.connect();
      // Ensure table exists
      await client.query('CREATE TABLE IF NOT EXISTS app_state (id INT PRIMARY KEY, state_json TEXT)');
      const res = await client.query('SELECT state_json FROM app_state WHERE id = 1');
      if (res.rows.length > 0) {
        const dbState = JSON.parse(res.rows[0].state_json);
        
        // Auto-sync users list and new operational fields from local db.json if missing in database state
        try {
          const localStateRaw = fs.readFileSync(path.join(__dirname, 'db.json'), 'utf8');
          const localState = JSON.parse(localStateRaw);
          let needsUpdate = false;

          // Check if users need sync
          const hasNewUsers = localState.users && (!dbState.users || dbState.users.length !== localState.users.length || !dbState.users.some(u => u.username === 'hoangminh'));
          if (hasNewUsers) {
            console.log('Syncing updated users list from db.json to Supabase...');
            dbState.users = localState.users;
            needsUpdate = true;
          }

          // Check if new operational tables need sync (v18)
          const opFields = ['clients', 'projects', 'shipment_workflows', 'single_tasks'];
          opFields.forEach(field => {
            if (localState[field] && (!dbState[field] || dbState[field].length === 0)) {
              console.log(`Syncing new operational field: ${field} from db.json to Supabase...`);
              dbState[field] = localState[field];
              needsUpdate = true;
            }
          });

          if (needsUpdate) {
            await client.query('UPDATE app_state SET state_json = $1 WHERE id = 1', [JSON.stringify(dbState)]);
          }
        } catch (e) {
          console.error('Failed to sync database state:', e);
        }
        
        return dbState;
      } else {
        // Seed database from local db.json
        console.log('Seeding database with default mock data...');
        const defaultState = fs.readFileSync(path.join(__dirname, 'db.json'), 'utf8');
        await client.query('INSERT INTO app_state (id, state_json) VALUES (1, $1)', [defaultState]);
        return JSON.parse(defaultState);
      }
    } catch (err) {
      console.error('Database load error:', err);
    } finally {
      await client.end().catch(() => {});
    }
  }
  
  // Local fallback
  const data = fs.readFileSync(path.join(__dirname, 'db.json'), 'utf8');
  return JSON.parse(data);
}

// Helper to save state to Supabase PostgreSQL or local db.json
async function saveState(state) {
  if (DATABASE_URL) {
    const client = new Client({
      connectionString: DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });
    try {
      await client.connect();
      // Ensure table exists
      await client.query('CREATE TABLE IF NOT EXISTS app_state (id INT PRIMARY KEY, state_json TEXT)');
      const checkRes = await client.query('SELECT 1 FROM app_state WHERE id = 1');
      if (checkRes.rows.length > 0) {
        await client.query('UPDATE app_state SET state_json = $1 WHERE id = 1', [JSON.stringify(state)]);
      } else {
        await client.query('INSERT INTO app_state (id, state_json) VALUES (1, $1)', [JSON.stringify(state)]);
      }
    } catch (err) {
      console.error('Database save error:', err);
    } finally {
      await client.end().catch(() => {});
    }
  } else {
    fs.writeFileSync(path.join(__dirname, 'db.json'), JSON.stringify(state, null, 2), 'utf8');
  }
}

// Helper to download Google Sheet file as Buffer
function downloadFile(url) {
  const https = require('https');
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        downloadFile(res.headers.location).then(resolve).catch(reject);
        return;
      }
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to download file: status code ${res.statusCode}`));
        return;
      }
      const data = [];
      res.on('data', (chunk) => data.push(chunk));
      res.on('end', () => resolve(Buffer.concat(data)));
    }).on('error', reject);
  });
}

// Convert Excel serial date to YYYY-MM-DD
function parseExcelDate(val) {
  if (!val) return '';
  if (!isNaN(val)) {
    const date = new Date((val - 25569) * 86400 * 1000);
    return date.toISOString().split('T')[0];
  }
  const parts = String(val).split(/[-/]/);
  if (parts.length === 3) {
    if (parts[0].length === 4) return parts.join('-');
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return String(val);
}

// Parse sheet and extract customer records
function parseSheet(sheet, XLSX) {
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  if (!data || data.length === 0) return [];
  
  let headerRowIdx = -1;
  let khColIdx = -1;
  let cskhColIdx = -1;
  let brandColIdx = -1;
  let statusColIdx = -1;
  let amountColIdx = -1;
  let dateColIdx = -1;
  
  for (let r = 0; r < Math.min(data.length, 10); r++) {
    const row = data[r];
    if (!row) continue;
    
    let hasKH = false;
    let hasAmount = false;
    
    for (let c = 0; c < row.length; c++) {
      const val = String(row[c] || '').trim().toLowerCase();
      if (val === 'kh' || val === 'khách hàng' || val === 'khách') {
        hasKH = true;
      }
      if (val.indexOf('thu tiền hàng') >= 0 || val.indexOf('thu tiền') >= 0 || val === 'doanh thu') {
        hasAmount = true;
      }
    }
    
    if (hasKH) {
      headerRowIdx = r;
      for (let c = 0; c < row.length; c++) {
        const val = String(row[c] || '').trim().toLowerCase();
        if (val === 'kh' || val === 'khách hàng' || val === 'khách') khColIdx = c;
        else if (val === 't' || val === 'cskh' || val === 'nhân viên' || val === 'ctv') cskhColIdx = c;
        else if (val === 'brand' || val === 'hệ thống') brandColIdx = c;
        else if (val === 'trạng thái') statusColIdx = c;
        else if (val.indexOf('thu tiền hàng') >= 0 || val.indexOf('thu tiền') >= 0 || val === 'doanh thu') amountColIdx = c;
        else if (val === 'ngày' || val === 'ngay') dateColIdx = c;
      }
      break;
    }
  }
  
  if (headerRowIdx === -1 || khColIdx === -1) {
    return [];
  }
  
  const parsedRows = [];
  for (let r = headerRowIdx + 1; r < data.length; r++) {
    const row = data[r];
    if (!row || !row[khColIdx]) continue;
    
    const rawKH = String(row[khColIdx] || '').trim();
    if (!rawKH || rawKH === '0' || rawKH.toLowerCase() === 'chuyển từ' || rawKH.toLowerCase().indexOf('tổng cộng') >= 0) continue;
    
    const amountVal = parseFloat(String(row[amountColIdx] || '').replace(/[^\d.-]/g, '')) || 0;
    const dateVal = row[dateColIdx] ? parseExcelDate(row[dateColIdx]) : '';
    
    parsedRows.push({
      kh: rawKH,
      cskh: cskhColIdx >= 0 ? String(row[cskhColIdx] || '').trim() : '',
      brand: brandColIdx >= 0 ? String(row[brandColIdx] || '').trim() : '',
      status: statusColIdx >= 0 ? String(row[statusColIdx] || '').trim() : '',
      amount: amountVal,
      date: dateVal
    });
  }
  
  return parsedRows;
}

// GET /api/customer-health/sync: Sync data from Google Sheet
app.get('/api/customer-health/sync', async (req, res) => {
  try {
    let XLSX;
    try {
      XLSX = require('xlsx');
    } catch (e) {
      console.warn("xlsx library not available locally, returning mock customer health data.");
      const state = await loadState();
      state.customerHealthData = {
        lastSyncTime: new Date().toISOString() + " (Simulated local data)",
        monthlyTotals: { T4: 86400000, T5: 124500000, T6: 94800000, T7: 15398420 },
        customers: [
          { name: "OTV162 - Nam434", cskh: "Hiền", brand: "OTV", volumeT4: 4562000, volumeT5: 12000000, volumeT6: 17222000, volumeT7: 1676723, lastShipmentDate: "2026-07-11", status: "healthy" },
          { name: "HPD551 - LinhAuth", cskh: "Phượng", brand: "HPD", volumeT4: 36795000, volumeT5: 68173000, volumeT6: 93646000, volumeT7: 1539842, lastShipmentDate: "2026-07-09", status: "warning" },
          { name: "MH351 - Gia Phan", cskh: "TRANG", brand: "MHL", volumeT4: 554319, volumeT5: 8649600, volumeT6: 0, volumeT7: 0, lastShipmentDate: "2026-05-15", status: "danger" },
          { name: "MH47 - Thảo MHL", cskh: "Thảo", brand: "MHL", volumeT4: 0, volumeT5: 0, volumeT6: 3886280, volumeT7: 0, lastShipmentDate: "2026-06-20", status: "warning" },
          { name: "OTV999 - Dương Test", cskh: "Dương", brand: "OTV", volumeT4: 0, volumeT5: 0, volumeT6: 0, volumeT7: 0, lastShipmentDate: "2026-03-10", status: "lost" }
        ]
      };
      await saveState(state);
      return res.json(state.customerHealthData);
    }

    const url = 'https://docs.google.com/spreadsheets/d/1CRbubTwnm4zSrX17d7pmZIUZshvXnKjnnX6dg9fC2sg/export?format=xlsx';
    console.log("Downloading spreadsheet from Google Sheets...");
    const buffer = await downloadFile(url);
    console.log("Parsing workbook...");
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    
    const customers = {};
    let totalT4 = 0, totalT5 = 0, totalT6 = 0, totalT7 = 0;
    
    const targetSheets = [
      { name: 'T42026', key: 'T4' },
      { name: 'T52026', key: 'T5' },
      { name: 'T62026', key: 'T6' },
      { name: 'T72026', key: 'T7' }
    ];
    
    targetSheets.forEach(ts => {
      const sheet = workbook.Sheets[ts.name];
      if (!sheet) return;
      
      const parsedRows = parseSheet(sheet, XLSX);
      parsedRows.forEach(row => {
        const cKey = row.kh;
        if (!customers[cKey]) {
          customers[cKey] = {
            name: cKey,
            cskh: row.cskh || 'Chưa giao',
            brand: row.brand || 'Khác',
            volumeT4: 0,
            volumeT5: 0,
            volumeT6: 0,
            volumeT7: 0,
            lastShipmentDate: ''
          };
        }
        
        const c = customers[cKey];
        
        if (ts.key === 'T4') { c.volumeT4 += row.amount; totalT4 += row.amount; }
        else if (ts.key === 'T5') { c.volumeT5 += row.amount; totalT5 += row.amount; }
        else if (ts.key === 'T6') { c.volumeT6 += row.amount; totalT6 += row.amount; }
        else if (ts.key === 'T7') { c.volumeT7 += row.amount; totalT7 += row.amount; }
        
        if (row.date && (!c.lastShipmentDate || row.date > c.lastShipmentDate)) {
          c.lastShipmentDate = row.date;
        }
        
        if (row.cskh) c.cskh = row.cskh;
        if (row.brand) c.brand = row.brand;
      });
    });
    
    Object.values(customers).forEach(c => {
      const volT7 = c.volumeT7 || 0;
      const volT6 = c.volumeT6 || 0;
      const volT5 = c.volumeT5 || 0;
      const avgPrevious = (volT6 + volT5) / 2;
      
      if (volT7 > 0) {
        if (avgPrevious > 0 && volT7 < avgPrevious * 0.7) {
          c.status = 'warning';
        } else {
          c.status = 'healthy';
        }
      } else if (volT6 > 0) {
        c.status = 'warning';
      } else if (volT5 > 0) {
        c.status = 'danger';
      } else {
        c.status = 'lost';
      }
    });
    
    const state = await loadState();
    state.customerHealthData = {
      lastSyncTime: new Date().toISOString(),
      monthlyTotals: {
        T4: Math.round(totalT4),
        T5: Math.round(totalT5),
        T6: Math.round(totalT6),
        T7: Math.round(totalT7)
      },
      customers: Object.values(customers)
    };
    
    await saveState(state);
    res.json(state.customerHealthData);
  } catch (err) {
    console.error("Sync error:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/state: Load entire CRM database
app.get('/api/state', async (req, res) => {
  try {
    const state = await loadState();
    res.json(state);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/state: Save entire CRM database
app.post('/api/state', async (req, res) => {
  try {
    await saveState(req.body);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/reset: Clear all leads, tasks, notifications, and logs to clean test state
app.post('/api/reset', async (req, res) => {
  try {
    const state = await loadState();
    
    // Clear leads, tasks, logs, and notifications
    state.leads = [];
    state.tasks = [];
    state.sausageLogs = [];
    state.notifications = [];
    state.fbConfig = {
      accessToken: state.fbConfig ? state.fbConfig.accessToken : "",
      pageUrl: state.fbConfig ? state.fbConfig.pageUrl : ""
    };
    
    // Reset user points
    if (Array.isArray(state.users)) {
      state.users.forEach(u => {
        u.points = 0;
      });
    }
    
    await saveState(state);
    res.json({ success: true, message: 'Database reset successfully!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/login: User authentication
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Vui lòng điền tài khoản và mật khẩu!' });
  }
  
  try {
    const state = await loadState();
    const user = (state.users || []).find(
      u => u.username && u.username.toLowerCase() === username.toLowerCase() && u.password === password
    );
    
    if (user) {
      const safeUser = { id: user.id, name: user.name, username: user.username, role: user.role };
      res.json({ success: true, user: safeUser });
    } else {
      res.status(401).json({ success: false, message: 'Tài khoản hoặc mật khẩu không chính xác!' });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/users: Add new staff account
app.post('/api/users', async (req, res) => {
  const { name, username, password, role } = req.body;
  if (!name || !username || !password || !role) {
    return res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ thông tin nhân viên!' });
  }
  
  try {
    const state = await loadState();
    state.users = state.users || [];
    
    const exists = state.users.some(u => u.username && u.username.toLowerCase() === username.toLowerCase());
    if (exists) {
      return res.status(400).json({ success: false, message: 'Tên đăng nhập đã tồn tại!' });
    }
    
    const newUser = {
      id: 'usr-' + Math.random().toString(36).substring(2, 10),
      name,
      username,
      password,
      role,
      points: 0,
      avatar: role === 'admin' ? 'fa-user-tie' : (role === 'manager' ? 'fa-user-nurse' : 'fa-user-ninja')
    };
    
    state.users.push(newUser);
    await saveState(state);
    res.json({ success: true, user: { id: newUser.id, name: newUser.name, role: newUser.role } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/users/:id: Delete staff account
app.delete('/api/users/:id', async (req, res) => {
  const userId = req.params.id;
  if (userId === 'usr-admin') {
    return res.status(400).json({ success: false, message: 'Không thể xóa tài khoản Admin tối cao!' });
  }
  
  try {
    const state = await loadState();
    state.users = state.users || [];
    const index = state.users.findIndex(u => u.id === userId);
    if (index !== -1) {
      state.users.splice(index, 1);
      await saveState(state);
      res.json({ success: true, message: 'Đã xóa nhân viên thành công!' });
    } else {
      res.status(404).json({ success: false, message: 'Không tìm thấy nhân viên!' });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /webhook: Facebook Webhook verification endpoint
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  
  if (mode === 'subscribe' && (token === 'minh_hai_verify_token_123' || token === 'minhhai_verify_token_2026')) {
    console.log('Webhook verified successfully!');
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

const https = require('https');

function getFBProfileName(senderId, accessToken) {
  return new Promise((resolve) => {
    const url = `https://graph.facebook.com/v20.0/${senderId}?fields=first_name,last_name&access_token=${accessToken}`;
    const req = https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const profile = JSON.parse(data);
          if (profile && profile.first_name) {
            const fullName = `${profile.first_name} ${profile.last_name || ''}`.trim();
            resolve(fullName);
          } else {
            resolve(null);
          }
        } catch (e) {
          resolve(null);
        }
      });
    });
    
    req.on('error', () => {
      resolve(null);
    });
    
    // Set 2-second timeout to prevent hanging the webhook
    req.setTimeout(2000, () => {
      req.destroy();
      resolve(null);
    });
  });
}

// POST /webhook: Receive Facebook Messenger event payloads
app.post('/webhook', async (req, res) => {
  const body = req.body;
  console.log('POST /webhook body:', JSON.stringify(body));
  
  if (body.object === 'page') {
    try {
      let state = await loadState();
      if (!state) {
        state = { leads: [], notifications: [], users: [], fbConfig: { accessToken: '', pageUrl: '' } };
      }
      let leadsUpdated = false;
      
      for (const entry of body.entry || []) {
        for (const event of entry.messaging || []) {
          const isMessage = event.message && !event.message.is_echo;
          const isPostback = !!event.postback;
          
          if (isMessage || isPostback) {
            const senderId = event.sender.id;
            let messageText = '';
            
            if (isPostback) {
              messageText = event.postback.title || event.postback.payload || '[Click nút/Get Started]';
            } else {
              messageText = event.message.text || (event.message.attachments ? '[Đính kèm: Ảnh/File/Audio]' : '[Tin nhắn]');
            }
            
            console.log(`Received FB Messenger event from ${senderId} - ${messageText}`);
            
            // Add lead
            const leadId = 'lead-fb-' + Math.random().toString(36).substring(2, 10);
            const localNow = new Date(new Date().getTime() + 7 * 60 * 60 * 1000);
            const now = localNow.toISOString().split('T')[0];
            const timeStr = localNow.toISOString().replace('T', ' ').substring(0, 16);
            let clientName = `Khách FB (${senderId})`;
            
            // Try to resolve sender name via Facebook Graph API using the Access Token
            if (state.fbConfig && state.fbConfig.accessToken) {
              const fbName = await getFBProfileName(senderId, state.fbConfig.accessToken);
              if (fbName) {
                clientName = fbName;
                console.log(`Resolved sender profile name: ${clientName}`);
              }
            }
            
            // Randomly assign sales user
            const salesUsers = (state.users || []).filter(u => u.role === 'staff' || u.role === 'manager');
            let assignedSalesId = 'usr-admin';
            let assignedSalesName = 'Quản trị viên';
            if (salesUsers.length > 0) {
              const randUser = salesUsers[Math.floor(Math.random() * salesUsers.length)];
              assignedSalesId = randUser.id;
              assignedSalesName = randUser.name;
            }
            
            const newLead = {
              id: leadId,
              name: clientName,
              phone: '',
              source: 'Fanpage',
              valRmb: 0,
              valVnd: 0,
              note: `[Tin nhắn từ Fanpage]: ${messageText}`,
              salesId: assignedSalesId,
              stage: 'receive_info',
              failReason: null,
              date: now,
              createdTime: timeStr,
              updatedTime: timeStr
            };
            
            state.leads = state.leads || [];
            state.leads.push(newLead);
            
            const newNotif = {
              id: 'notif-' + Math.random().toString(36).substring(2, 10),
              title: 'Tin nhắn từ Fanpage',
              text: `Khách hàng ${clientName} vừa nhắn tin. Đã thêm vào CRM và giao cho Sales ${assignedSalesName}.`,
              read: false,
              time: timeStr
            };
            state.notifications = state.notifications || [];
            state.notifications.push(newNotif);
            
            leadsUpdated = true;
          }
        }
      }
      
      if (leadsUpdated) {
        await saveState(state);
      }
      res.status(200).send('EVENT_RECEIVED');
    } catch (err) {
      console.error('Error processing webhook:', err);
      res.sendStatus(500);
    }
  } else {
    res.sendStatus(404);
  }
});

// GET /privacy: Simple Privacy Policy page for Facebook App Review
app.get('/privacy', (req, res) => {
  res.status(200).send(`
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <title>Chính Sách Quyền Riêng Tư - Minh Hải Logistics</title>
      <style>
        body { font-family: sans-serif; line-height: 1.6; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #333; }
        h1 { color: #1e3a8a; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; }
        h2 { color: #2563eb; margin-top: 30px; }
      </style>
    </head>
    <body>
      <h1>Chính Sách Quyền Riêng Tư</h1>
      <p>Chào mừng bạn đến với hệ thống quản lý khách hàng của <strong>Minh Hải Logistics</strong>. Chúng tôi cam kết bảo vệ thông tin cá nhân và quyền riêng tư của khách hàng và người dùng.</p>
      
      <h2>1. Thu thập thông tin</h2>
      <p>Chúng tôi chỉ thu thập thông tin khi bạn liên hệ trực tiếp với chúng tôi qua trang Fanpage Facebook (như tên tài khoản Facebook, ảnh đại diện công khai và nội dung tin nhắn gửi đi) để hỗ trợ phản hồi và chăm sóc khách hàng tốt nhất.</p>
      
      <h2>2. Sử dụng thông tin</h2>
      <p>Thông tin thu thập được sử dụng nội bộ để:</p>
      <ul>
        <li>Hỗ trợ tư vấn dịch vụ vận chuyển và logistics.</li>
        <li>Quản lý và giải quyết các yêu cầu, thắc mắc từ phía khách hàng.</li>
        <li>Nâng cao chất lượng dịch vụ của Minh Hải Logistics.</li>
      </ul>
      
      <h2>3. Bảo mật thông tin</h2>
      <p>Chúng tôi áp dụng các biện pháp bảo mật tối ưu để bảo vệ thông tin của bạn khỏi bị truy cập, tiết lộ hoặc phá hủy trái phép. Chúng tôi tuyệt đối không bán hoặc chia sẻ thông tin khách hàng cho bên thứ ba vì bất kỳ mục đích nào.</p>
      
      <h2>4. Liên hệ</h2>
      <p>Nếu bạn có bất kỳ câu hỏi nào về chính sách này, xin vui lòng liên hệ với chúng tôi qua địa chỉ email: <strong>mympro93@gmail.com</strong>.</p>
    </body>
    </html>
  `);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
