const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
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
        
        // Auto-sync users list from local db.json if the database users list is different or doesn't have the new users
        try {
          const localStateRaw = fs.readFileSync(path.join(__dirname, 'db.json'), 'utf8');
          const localState = JSON.parse(localStateRaw);
          const hasNewUsers = localState.users && (!dbState.users || dbState.users.length !== localState.users.length || !dbState.users.some(u => u.username === 'hoangminh'));
          if (hasNewUsers) {
            console.log('Syncing updated users list from db.json to Supabase...');
            dbState.users = localState.users;
            await client.query('UPDATE app_state SET state_json = $1 WHERE id = 1', [JSON.stringify(dbState)]);
          }
        } catch (e) {
          console.error('Failed to sync users list:', e);
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
    https.get(url, (res) => {
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
    }).on('error', () => {
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
      const state = await loadState();
      let leadsUpdated = false;
      
      for (const entry of body.entry || []) {
        for (const event of entry.messaging || []) {
          if (event.message && !event.message.is_echo) {
            const senderId = event.sender.id;
            const messageText = event.message.text;
            console.log(`Received FB Messenger message from ${senderId} - ${messageText}`);
            
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

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
