  // Auto-purge stale cache when client version changes
  const CURRENT_APP_VER = 'v20.72';
  if (localStorage.getItem('minhhai_app_version') !== CURRENT_APP_VER) {
    console.log('New version detected! Purging stale local cache...');
    ['votr_users', 'votr_leads', 'votr_tasks', 'votr_workflows', 'votr_logs', 'votr_notifs', 'votr_clients_db', 'votr_projects_db', 'votr_shipment_workflows_db', 'votr_single_tasks_db', 'votr_suggestions_db', 'votr_last_updated'].forEach(k => localStorage.removeItem(k));
    localStorage.setItem('minhhai_app_version', CURRENT_APP_VER);
  }
window.BaseState = null;
window.formatDateTimeLocal = function(date) {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';
  const tzOffset = d.getTimezoneOffset() * 60000;
  return (new Date(d.getTime() - tzOffset)).toISOString().slice(0, 16);
};

function getApiUrl(path) {
  const customApiBase = localStorage.getItem('minhhai_custom_api_base');
  if (customApiBase) {
    const base = customApiBase.endsWith('/') ? customApiBase.slice(0, -1) : customApiBase;
    return `${base}${path}`;
  }
  // Nếu là file:// hoặc github.io thì mới trỏ về Render
  if (window.location.hostname.includes('github.io') || window.location.protocol === 'file:') {
    return `https://minh-hai.onrender.com${path}`;
  }
  // Còn lại khi truy cập qua HTTP/HTTPS thì tự động dùng origin hiện tại
  return `${window.location.origin}${path}`;
}

const CONFIG = {
  LS_KEY_USERS: 'votr_users_db',
  LS_KEY_LEADS: 'votr_leads_db',
  LS_KEY_TASKS: 'votr_tasks_db',
  LS_KEY_WORKFLOWS: 'votr_workflows_db',
  LS_KEY_LOGS: 'votr_sausage_logs',
  LS_KEY_NOTIFS: 'votr_notifications',
  LS_KEY_CURRENT_USER: 'votr_current_user_id'
};

// Initial Mock Data: 20 Employees
const INITIAL_USERS = [
  // Admin & Kế toán (3)
  { id: 'usr-1', name: 'Nguyễn Đức Việt', role: 'admin', dept: 'admin', points: 350, avatar: 'fa-user-tie' },
  { id: 'usr-2', name: 'Trần Thị Mai', role: 'admin', dept: 'admin', points: 280, avatar: 'fa-user-tie' },
  { id: 'usr-3', name: 'Lê Hoàng Yến', role: 'admin', dept: 'admin', points: 150, avatar: 'fa-user-tie' },
  
  // Sales & CSKH (5)
  { id: 'usr-4', name: 'Phạm Thanh Bình', role: 'sales', dept: 'sales', points: 420, avatar: 'fa-user-nurse' },
  { id: 'usr-5', name: 'Hoàng Kim Oanh', role: 'sales', dept: 'sales', points: 310, avatar: 'fa-user-nurse' },
  { id: 'usr-6', name: 'Lê Anh Tuấn', role: 'sales', dept: 'sales', points: 290, avatar: 'fa-user-ninja' },
  { id: 'usr-7', name: 'Đỗ Hồng Hạnh', role: 'sales', dept: 'sales', points: 210, avatar: 'fa-user-nurse' },
  { id: 'usr-8', name: 'Nguyễn Văn Dũng', role: 'sales', dept: 'sales', points: 180, avatar: 'fa-user-ninja' },
  
  // Sourcing & Đặt hàng (5)
  { id: 'usr-9', name: 'Bùi Quốc Đạt', role: 'sourcing', dept: 'sourcing', points: 320, avatar: 'fa-user-astronaut' },
  { id: 'usr-10', name: 'Đặng Khánh Linh', role: 'sourcing', dept: 'sourcing', points: 250, avatar: 'fa-user-nurse' },
  { id: 'usr-11', name: 'Ngô Gia Bảo', role: 'sourcing', dept: 'sourcing', points: 230, avatar: 'fa-user-astronaut' },
  { id: 'usr-12', name: 'Phùng Tiến Dũng', role: 'sourcing', dept: 'sourcing', points: 190, avatar: 'fa-user-ninja' },
  { id: 'usr-13', name: 'Trịnh Hoài Nam', role: 'sourcing', dept: 'sourcing', points: 140, avatar: 'fa-user-ninja' },
  
  // Kho bãi (7)
  { id: 'usr-14', name: 'Lý Hải Nam', role: 'warehouse', dept: 'warehouse', points: 240, avatar: 'fa-user-ninja', loc: 'Kho Quảng Châu' },
  { id: 'usr-15', name: 'Vương Hồng Quân', role: 'warehouse', dept: 'warehouse', points: 260, avatar: 'fa-user-ninja', loc: 'Kho Thâm Quyến' },
  { id: 'usr-16', name: 'Nguyễn Văn Hùng', role: 'warehouse', dept: 'warehouse', points: 180, avatar: 'fa-user-ninja', loc: 'Kho Hà Nội' },
  { id: 'usr-17', name: 'Lê Văn Nam', role: 'warehouse', dept: 'warehouse', points: 190, avatar: 'fa-user-ninja', loc: 'Kho Hà Nội' },
  { id: 'usr-18', name: 'Đinh Gia Huy', role: 'warehouse', dept: 'warehouse', points: 200, avatar: 'fa-user-ninja', loc: 'Kho Sài Gòn' },
  { id: 'usr-19', name: 'Võ Minh Triết', role: 'warehouse', dept: 'warehouse', points: 150, avatar: 'fa-user-ninja', loc: 'Kho Sài Gòn' },
  { id: 'usr-20', name: 'Trương Quốc Khánh', role: 'warehouse', dept: 'warehouse', points: 120, avatar: 'fa-user-ninja', loc: 'Kho Sài Gòn' }
];

// Initial Workflows
const DEFAULT_WORKFLOWS = {
  sales: ['Nhận thông tin', 'Lấy SĐT', 'Báo giá', 'Thương lượng', 'Thành công', 'Thất bại'],
  sourcing: ['Nhận yêu cầu đặt hàng', 'Tìm nguồn & Đàm phán giá', 'Yêu cầu khách cọc', 'Mua hàng & Thanh toán tệ (RMB)', 'Hàng về kho Quảng Châu'],
  warehouse: ['Nhận hàng tại Quảng Châu', 'Kiểm đếm & Đóng bao gỗ', 'Xuất kho Trung Quốc', 'Thông quan biên giới', 'Nhập kho đích (HN/SG)', 'Giao hàng thành công'],
  admin: ['Nhận phiếu yêu cầu chi', 'Kế toán phê duyệt thanh toán', 'Đối soát công nợ cuối tháng']
};

// Initial Mock CRM Leads (Khách Hàng)
const INITIAL_LEADS = [
  { id: 'lead-1', name: 'Nguyễn Minh Thảo', phone: '0912445882', wechat: 'thaominhtao', valRmb: 12000, valVnd: 42000000, note: 'Ký gửi lô quần áo Quảng Châu về Hà Nội. Cần đi nhanh đường bộ.', salesId: 'usr-4', stage: 'success', failReason: null, date: '2026-07-01' },
  { id: 'lead-2', name: 'Trần Văn Quyết', phone: '0985223114', wechat: 'quyetshipp', valRmb: 45000, valVnd: 157500000, note: 'Nhập sỉ 500 cái balo học sinh Taobao về Sài Gòn. Đang thương lượng giá ký gửi.', salesId: 'usr-4', stage: 'negotiating', failReason: null, date: '2026-07-03' },
  { id: 'lead-3', name: 'Shop Giày Sneaker HN', phone: '0977665221', wechat: 'sneakerhn_vip', valRmb: 8500, valVnd: 29750000, note: 'Khách cần tìm nguồn hàng giày thể thao nhái MLB Quảng Châu chất lượng 1:1.', salesId: 'usr-5', stage: 'get_phone', failReason: null, date: '2026-07-05' },
  { id: 'lead-4', name: 'Công ty Gia Dụng Sunhouse', phone: '0904321987', wechat: 'sunhouse_import', valRmb: 180000, valVnd: 630000000, note: 'Lô hàng máy xay sinh tố đi chính ngạch Quảng Châu -> Hải Phòng. Đã gửi bảng báo giá cước biển.', salesId: 'usr-6', stage: 'quotation', failReason: null, date: '2026-07-06' },
  { id: 'lead-5', name: 'Lê Hữu Đạt', phone: '0963554112', wechat: 'datle99', valRmb: 5000, valVnd: 17500000, note: 'Hỏi ship 3 cái máy in 3D cũ. Đã báo giá nhưng khách chê đắt hơn bên khác.', salesId: 'usr-7', stage: 'failed', failReason: 'Giá dịch vụ cao', date: '2026-07-07' },
  { id: 'lead-6', name: 'Hoàng Thùy Dương', phone: '0915668779', wechat: 'duongthuyy92', valRmb: 15000, valVnd: 52500000, note: 'Cần gom hàng sỉ phụ kiện tóc từ Yiwu về Hà Nội. Đang chờ liên hệ lại lấy số.', salesId: 'usr-5', stage: 'get_phone', failReason: null, date: '2026-07-08' },
  { id: 'lead-7', name: 'Mai Phương Anh', phone: '0944221776', wechat: '', valRmb: 2300, valVnd: 8050000, note: 'Hỏi vận chuyển lô mỹ phẩm nội địa Trung. Đã liên hệ 3 lần nhưng không nghe máy.', salesId: 'usr-8', stage: 'failed', failReason: 'Mất liên lạc / Không nghe máy', date: '2026-07-04' },
  { id: 'lead-8', name: 'Vũ Quốc Khánh', phone: '0888223445', wechat: 'khanh_quocvu', valRmb: 25000, valVnd: 87500000, note: 'Khách nhắn tin trên page cần tìm xưởng sản xuất đồ chơi gỗ trẻ em.', salesId: 'usr-4', stage: 'receive_info', failReason: null, date: '2026-07-09' }
];

// Initial Mock Tasks (Công Việc)
const INITIAL_TASKS = [
  { id: 'task-1', title: 'Đàm phán giá lô hàng 500 balo với xưởng Taobao', dept: 'sourcing', assigneeId: 'usr-9', stepsStatus: [true, true, false, false, false], deadline: '2026-07-12', points: 35, status: 'doing', desc: 'Mã khách hàng: Trần Văn Quyết. Đàm phán giảm giá ship nội địa Trung Quốc.', creatorId: 'usr-1' },
  { id: 'task-2', title: 'Đóng kiện gỗ & dán tem mã HN-Thảo cho lô 50kg quần áo', dept: 'warehouse', assigneeId: 'usr-14', stepsStatus: [true, true, true, false, false, false], deadline: '2026-07-10', points: 20, status: 'doing', desc: 'Đóng kỹ chống nước vì đi mùa mưa. Chụp hình kiện trước khi xếp xe.', creatorId: 'usr-4' },
  { id: 'task-3', title: 'Thông báo báo giá hải quan chính ngạch máy xay Sunhouse', dept: 'sales', assigneeId: 'usr-6', stepsStatus: [true, true, true, true, false, false, false], deadline: '2026-07-10', points: 40, status: 'checking', desc: 'Báo giá trọn gói bao gồm thuế nhập khẩu và VAT. Chờ khách duyệt.', creatorId: 'usr-1' },
  { id: 'task-4', title: 'Kiểm toán doanh thu tuần 1 tháng 7', dept: 'admin', assigneeId: 'usr-2', stepsStatus: [true, true, true], deadline: '2026-07-08', points: 50, status: 'completed', desc: 'Đối soát các bill thành công trong tuần đầu tiên.', creatorId: 'usr-1' },
  { id: 'task-5', title: 'Tìm nguồn sỉ giày MLB cho shop Sneaker HN', dept: 'sourcing', assigneeId: 'usr-10', stepsStatus: [true, false, false, false, false], deadline: '2026-07-15', points: 30, status: 'doing', desc: 'Cần tìm 3 xưởng khác nhau có phân khúc chất lượng Super Fake và Rep 1:1.', creatorId: 'usr-5' },
  { id: 'task-6', title: 'Thông quan lô hàng Quảng Châu xe số 3', dept: 'warehouse', assigneeId: 'usr-16', stepsStatus: [true, true, true, true, false, false], deadline: '2026-07-09', points: 25, status: 'checking', desc: 'Hàng đã về tới Lạng Sơn, đang làm thủ tục tờ khai.', creatorId: 'usr-1' }
];

// Initial Sausage Logs
const INITIAL_LOGS = [
  { id: 'log-1', userId: 'usr-4', points: 50, type: 'success', text: 'Chốt thành công khách Nguyễn Minh Thảo (+50)', date: '2026-07-01 14:32' },
  { id: 'log-2', userId: 'usr-2', points: 50, type: 'task', text: 'Hoàn thành công việc: Kiểm toán doanh thu tuần 1 (+50)', date: '2026-07-08 17:05' },
  { id: 'log-3', userId: 'usr-9', points: 30, type: 'task', text: 'Hoàn thành công việc: Tìm xưởng nệm hơi (+30)', date: '2026-07-05 11:20' },
  { id: 'log-4', userId: 'usr-14', points: 20, type: 'task', text: 'Hoàn thành công việc: Bốc xếp xe hàng Quảng Châu (+20)', date: '2026-07-04 09:15' }
];

// Global variables to hold state
let AppState = {
  users: [],
  leads: [],
  tasks: [],
  workflows: {},
  sausageLogs: [],
  notifications: [],
  currentUserId: '',
  clients: [],
  projects: [],
  shipment_workflows: [],
  single_tasks: []
};

// Charts references
let crmChartInstance = null;
let failChartInstance = null;

// ==================== APP INITIALIZATION ==================== //
document.addEventListener('DOMContentLoaded', async () => {
  initLocalStorage();
  await syncLoadState();
  initSidebarRouter();
  initNotificationSystem();
  initRoleSwitcher();
  initStaffManagement();
  
  const sessionUser = JSON.parse(localStorage.getItem('minhhai_user') || '{}');
  const navStaff = document.getElementById('nav-staff-mgmt');
  if (navStaff) {
    navStaff.style.display = sessionUser.role === 'admin' ? 'block' : 'none';
  }
  
  // Initialize settings API Base URL input value
  const apiInput = document.getElementById('settings-api-base-input');
  if (apiInput) {
    apiInput.value = localStorage.getItem('minhhai_custom_api_base') || '';
  }

  const formApiConfig = document.getElementById('form-api-config');
  if (formApiConfig) {
    formApiConfig.onsubmit = (e) => {
      e.preventDefault();
      const val = document.getElementById('settings-api-base-input').value.trim();
      localStorage.setItem('minhhai_custom_api_base', val);
      showToast('Đã lưu địa chỉ API Server mới!', 'success');
      setTimeout(() => window.location.reload(), 1000);
    };
  }

  const btnClearApi = document.getElementById('btn-settings-clear-api');
  if (btnClearApi) {
    btnClearApi.onclick = () => {
      localStorage.removeItem('minhhai_custom_api_base');
      showToast('Đã xoá địa chỉ API Server tuỳ chỉnh, khôi phục kết nối mặc định.', 'info');
      setTimeout(() => window.location.reload(), 1000);
    };
  }

  const btnLogout = document.getElementById('btn-logout');
  if (btnLogout) {
    btnLogout.onclick = (e) => {
      e.preventDefault();
      localStorage.removeItem('minhhai_user');
      window.location.href = 'login.html';
    };
  }
  
  // Initial render
  renderCurrentUser();
  
  // Start background polling to receive new leads dynamically from webhooks
  startStatePolling();
  
  // Custom navigation shortcuts
  document.querySelectorAll('.nav-shortcut').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const target = e.currentTarget.getAttribute('data-target');
      navigateToView(target);
    });
  });

  // Dashboard Stat Cards Click Events
  const cardLeads = document.getElementById('card-stat-leads');
  if (cardLeads) cardLeads.addEventListener('click', () => openLeadsListModal('all'));

  const cardSuccess = document.getElementById('card-stat-success');
  if (cardSuccess) cardSuccess.addEventListener('click', () => openLeadsListModal('success'));

  const cardFailed = document.getElementById('card-stat-failed');
  if (cardFailed) cardFailed.addEventListener('click', () => openLeadsListModal('failed'));

  const cardSausage = document.getElementById('card-stat-sausage');
  if (cardSausage) cardSausage.addEventListener('click', () => navigateToView('rewards'));

  // Global modal close events
  document.querySelectorAll('.btn-close-modal').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const modalId = e.currentTarget.getAttribute('data-modal');
      closeModal(modalId);
    });
  });
});

function initLocalStorage() {
  if (!localStorage.getItem(CONFIG.LS_KEY_USERS)) {
    localStorage.setItem(CONFIG.LS_KEY_USERS, JSON.stringify(INITIAL_USERS));
  }
  if (!localStorage.getItem(CONFIG.LS_KEY_LEADS)) {
    localStorage.setItem(CONFIG.LS_KEY_LEADS, JSON.stringify(INITIAL_LEADS));
  }
  if (!localStorage.getItem(CONFIG.LS_KEY_TASKS)) {
    localStorage.setItem(CONFIG.LS_KEY_TASKS, JSON.stringify(INITIAL_TASKS));
  }
  if (!localStorage.getItem(CONFIG.LS_KEY_WORKFLOWS)) {
    localStorage.setItem(CONFIG.LS_KEY_WORKFLOWS, JSON.stringify(DEFAULT_WORKFLOWS));
  }
  if (!localStorage.getItem(CONFIG.LS_KEY_LOGS)) {
    localStorage.setItem(CONFIG.LS_KEY_LOGS, JSON.stringify(INITIAL_LOGS));
  }
  if (!localStorage.getItem(CONFIG.LS_KEY_NOTIFS)) {
    localStorage.setItem(CONFIG.LS_KEY_NOTIFS, JSON.stringify([
      { id: 'notif-1', title: 'Lead mới', text: 'Khách hàng Vũ Quốc Khánh nhắn tin trên Fanpage.', read: false, time: '2026-07-09 15:10' }
    ]));
  }
  if (!localStorage.getItem(CONFIG.LS_KEY_CURRENT_USER)) {
    localStorage.setItem(CONFIG.LS_KEY_CURRENT_USER, 'usr-1'); // Default to Admin
  }
}

async function syncLoadState() {
  try {
    const res = await fetch(getApiUrl('/api/state'), { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      AppState.lastUpdated = data.lastUpdated || parseInt(localStorage.getItem('votr_last_updated')) || 0;
      AppState.users = data.users;
      AppState.leads = data.leads;
      AppState.tasks = data.tasks;
      AppState.workflows = data.workflows;
      AppState.sausageLogs = data.sausageLogs;
      AppState.notifications = data.notifications;
      AppState.fbConfig = data.fbConfig || { accessToken: '', pageUrl: 'https://www.facebook.com/MinhHailogistcs.Muahangtaobao.vanchuyentrungviet' };
      
      // Seed operational lists (v18)
      AppState.clients = data.clients || [];
      AppState.projects = data.projects || [];
      AppState.shipment_workflows = data.shipment_workflows || [];
      AppState.single_tasks = data.single_tasks || [];
      AppState.suggestions = data.suggestions || [];

      if (window.initLeadSteps && AppState.leads) {
        AppState.leads.forEach(window.initLeadSteps);
      }
      backfillGamificationData();

      const loggedUser = JSON.parse(localStorage.getItem('minhhai_user') || '{}');
      AppState.currentUserId = localStorage.getItem(CONFIG.LS_KEY_CURRENT_USER) || loggedUser.id || (data.users && data.users[0]?.id) || 'usr-admin';
      
      // Also cache locally
      localStorage.setItem(CONFIG.LS_KEY_USERS, JSON.stringify(AppState.users));
      localStorage.setItem(CONFIG.LS_KEY_LEADS, JSON.stringify(AppState.leads));
      localStorage.setItem(CONFIG.LS_KEY_TASKS, JSON.stringify(AppState.tasks));
      localStorage.setItem(CONFIG.LS_KEY_WORKFLOWS, JSON.stringify(AppState.workflows));
      localStorage.setItem(CONFIG.LS_KEY_LOGS, JSON.stringify(AppState.sausageLogs));
      localStorage.setItem(CONFIG.LS_KEY_NOTIFS, JSON.stringify(AppState.notifications));

      localStorage.setItem('votr_clients_db', JSON.stringify(AppState.clients));
      localStorage.setItem('votr_projects_db', JSON.stringify(AppState.projects));
      localStorage.setItem('votr_shipment_workflows_db', JSON.stringify(AppState.shipment_workflows));
      localStorage.setItem('votr_single_tasks_db', JSON.stringify(AppState.single_tasks));
      localStorage.setItem('votr_suggestions_db', JSON.stringify(AppState.suggestions));
      updateMyTasksBadge();
      window.BaseState = JSON.parse(JSON.stringify(AppState));
      return;
    }
  } catch (err) {
    console.warn('Không kết nối được server API, sử dụng LocalStorage offline:', err);
  }
  loadState();
}

function loadState() {
  AppState.users = JSON.parse(localStorage.getItem(CONFIG.LS_KEY_USERS)) || INITIAL_USERS;
  if (!AppState.users || AppState.users.length === 0) {
    AppState.users = [...INITIAL_USERS];
  }
  AppState.leads = JSON.parse(localStorage.getItem(CONFIG.LS_KEY_LEADS)) || [];
  AppState.tasks = JSON.parse(localStorage.getItem(CONFIG.LS_KEY_TASKS)) || [];
  AppState.workflows = JSON.parse(localStorage.getItem(CONFIG.LS_KEY_WORKFLOWS)) || {};
  AppState.sausageLogs = JSON.parse(localStorage.getItem(CONFIG.LS_KEY_LOGS)) || [];
  AppState.notifications = JSON.parse(localStorage.getItem(CONFIG.LS_KEY_NOTIFS)) || [];
  AppState.currentUserId = localStorage.getItem(CONFIG.LS_KEY_CURRENT_USER) || (AppState.users && AppState.users[0]?.id) || 'usr-1';

  AppState.clients = JSON.parse(localStorage.getItem('votr_clients_db')) || [];
  AppState.projects = JSON.parse(localStorage.getItem('votr_projects_db')) || [];
  AppState.shipment_workflows = JSON.parse(localStorage.getItem('votr_shipment_workflows_db')) || [];
  AppState.single_tasks = JSON.parse(localStorage.getItem('votr_single_tasks_db')) || [];
  AppState.suggestions = JSON.parse(localStorage.getItem('votr_suggestions_db')) || [];

  if (window.initLeadSteps && AppState.leads) {
    AppState.leads.forEach(window.initLeadSteps);
  }

  updateMyTasksBadge();
  backfillGamificationData();
}

function backfillGamificationData() {
  if (AppState.users) {
    AppState.users.forEach(u => {
      if (u.teamPoints === undefined) u.teamPoints = 0;
      if (u.streakDays === undefined) u.streakDays = 0;
      if (u.lastUpdateDate === undefined) u.lastUpdateDate = null;
      if (u.spinsCount === undefined) u.spinsCount = 0;
      if (u.lastSpinDate === undefined) u.lastSpinDate = null;
      if (u.treeLevel === undefined) u.treeLevel = 1;
      if (u.treeProgress === undefined) u.treeProgress = 0;
      if (!u.badges) u.badges = [];
      if (!u.completedMissions) u.completedMissions = [];
      if (u.quizTakenToday === undefined) u.quizTakenToday = false;
    });
  }
}

async function saveState() {
  AppState.lastUpdated = Date.now();

  // Sync to local storage
  localStorage.setItem('votr_last_updated', String(AppState.lastUpdated));
  localStorage.setItem(CONFIG.LS_KEY_USERS, JSON.stringify(AppState.users));
  localStorage.setItem(CONFIG.LS_KEY_LEADS, JSON.stringify(AppState.leads));
  localStorage.setItem(CONFIG.LS_KEY_TASKS, JSON.stringify(AppState.tasks));
  localStorage.setItem(CONFIG.LS_KEY_WORKFLOWS, JSON.stringify(AppState.workflows));
  localStorage.setItem(CONFIG.LS_KEY_LOGS, JSON.stringify(AppState.sausageLogs));
  localStorage.setItem(CONFIG.LS_KEY_NOTIFS, JSON.stringify(AppState.notifications));
  localStorage.setItem(CONFIG.LS_KEY_CURRENT_USER, AppState.currentUserId);

  localStorage.setItem('votr_clients_db', JSON.stringify(AppState.clients));
  localStorage.setItem('votr_projects_db', JSON.stringify(AppState.projects));
  localStorage.setItem('votr_shipment_workflows_db', JSON.stringify(AppState.shipment_workflows));
  localStorage.setItem('votr_single_tasks_db', JSON.stringify(AppState.single_tasks));
  localStorage.setItem('votr_suggestions_db', JSON.stringify(AppState.suggestions || []));
  
  // Sync to server API in background using Delta Sync
  if (true) {
    if (!window.syncStateQueue) window.syncStateQueue = Promise.resolve();
    window.syncStateQueue = window.syncStateQueue.then(async () => {
      try {
        if (!window.BaseState) {
          // Fallback if no BaseState available
          await fetch(getApiUrl('/api/state'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(AppState)
          });
          window.BaseState = JSON.parse(JSON.stringify(AppState));
          updateMyTasksBadge();
          return;
        }

        const collections = ['users', 'leads', 'tasks', 'workflows', 'sausageLogs', 'notifications', 'clients', 'projects', 'shipment_workflows', 'single_tasks', 'suggestions'];
        const syncData = { lastUpdated: AppState.lastUpdated };
        let hasChanges = false;

        collections.forEach(key => {
          const baseArr = window.BaseState[key] || (key === 'workflows' ? {} : []);
          const currArr = AppState[key] || (key === 'workflows' ? {} : []);
          
          if (!Array.isArray(currArr)) {
            if (JSON.stringify(baseArr) !== JSON.stringify(currArr)) {
              syncData[key] = { isObject: true, data: currArr };
              hasChanges = true;
            }
            return;
          }

          const baseMap = new Map();
          baseArr.forEach(i => baseMap.set(i.id || JSON.stringify(i), JSON.stringify(i)));
          
          const modified = [];
          currArr.forEach(i => {
            const id = i.id || JSON.stringify(i);
            if (baseMap.get(id) !== JSON.stringify(i)) {
              modified.push(i);
              hasChanges = true;
            }
          });
          
          const currMap = new Map();
          currArr.forEach(i => currMap.set(i.id || JSON.stringify(i), true));
          const deletedIds = [];
          baseArr.forEach(i => {
            const id = i.id || JSON.stringify(i);
            if (!currMap.has(id)) {
              deletedIds.push(id);
              hasChanges = true;
            }
          });
          
          syncData[key] = { modified, deletedIds };
        });

        if (!hasChanges) {
          updateMyTasksBadge();
          return;
        }

        window.BaseState = JSON.parse(JSON.stringify(AppState));

        const res = await fetch(getApiUrl('/api/sync'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(syncData),
          keepalive: true
        });
        
        if (!res.ok) {
           console.warn('Lỗi đồng bộ Delta Sync, gửi toàn bộ trạng thái...');
           await fetch(getApiUrl('/api/state'), {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify(AppState)
           });
        }
      } catch (err) {
        console.error('Không lưu được lên server API:', err);
      }
    });
  }
  updateMyTasksBadge();
}
const CLIENT_VERSION = '20.72';

async function checkCodeVersionUpdate() {
  try {
    const res = await fetch('/index.html', { cache: 'no-store' });
    if (res.ok) {
      const htmlText = await res.text();
      const match = htmlText.match(/app\.js\?v=([\d\.]+)/);
      if (match && match[1]) {
        const serverVersion = match[1];
        if (serverVersion !== CLIENT_VERSION) {
          console.log(`[Version] Server version is ${serverVersion}, local is ${CLIENT_VERSION}. Reloading page...`);
          window.location.reload();
        }
      }
    }
  } catch (err) {
    console.error('Lỗi kiểm tra phiên bản mới:', err);
  }
}

let pollingInterval = null;
let pollingTicks = 0;
function startStatePolling() {
  checkCodeVersionUpdate();
  if (pollingInterval) clearInterval(pollingInterval);
  pollingInterval = setInterval(async () => {
    pollingTicks++;
    if (pollingTicks % 30 === 0) {
      checkCodeVersionUpdate();
    }
    try {
      const res = await fetch(getApiUrl('/api/state'));
      if (res.ok) {
        // Skip state update if user is actively interacting (typing, open modal, dragging) to prevent data overwrite and focus loss
        const isUserInteracting = 
          document.querySelector('.dragging') !== null || 
          document.querySelector('.modal.active') !== null || 
          ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName);
        
        if (isUserInteracting) {
          return;
        }

        const data = await res.json();
        
        // Ignore server state if it's older than or equal to our local updates (to prevent race conditions)
        const clientLastUpdated = AppState.lastUpdated || 0;
        const serverLastUpdated = data.lastUpdated || 0;
        if (clientLastUpdated > 0 && serverLastUpdated <= clientLastUpdated) {
          return;
        }

        if (clientLastUpdated < serverLastUpdated || clientLastUpdated === 0) {
          console.log('Phát hiện dữ liệu mới từ server. Cập nhật giao diện...');
          AppState.lastUpdated = data.lastUpdated || 0;
          AppState.users = data.users;
          AppState.leads = data.leads;
          AppState.tasks = data.tasks;
          AppState.workflows = data.workflows;
          AppState.sausageLogs = data.sausageLogs;
          AppState.notifications = data.notifications;
          AppState.suggestions = data.suggestions || [];
          AppState.fbConfig = data.fbConfig || AppState.fbConfig || { accessToken: '', pageUrl: 'https://www.facebook.com/MinhHailogistcs.Muahangtaobao.vanchuyentrungviet' };
          
          // Đồng bộ các phân hệ vận hành mới
          AppState.clients = data.clients || [];
          AppState.projects = data.projects || [];
          AppState.shipment_workflows = data.shipment_workflows || [];
          AppState.single_tasks = data.single_tasks || [];

          // Đồng bộ dữ liệu trò chơi online
          AppState.active_caro_games = data.active_caro_games || [];
          AppState.daily_lottery_tickets = data.daily_lottery_tickets || [];
          AppState.bet_pools = data.bet_pools || [];
          
          if (window.initLeadSteps && AppState.leads) {
            AppState.leads.forEach(window.initLeadSteps);
          }

          // Re-render active view
          const activeTabElement = document.querySelector('.nav-item.active');
          if (activeTabElement) {
            const currentViewId = activeTabElement.getAttribute('data-view');
            navigateToView(currentViewId, false);
          }
          
          // Refresh user context and notification dropdown
          renderCurrentUser();
          renderNotifications();
          updateMyTasksBadge();

          // Refresh mini games UI dynamically if changed
          if (typeof renderMiniGames === 'function') {
            renderMiniGames();
          }

          window.BaseState = JSON.parse(JSON.stringify(AppState));
        }
      }
    } catch (err) {
      console.warn('Lỗi khi polling trạng thái:', err);
    }
  }, 4000); // Poll every 4 seconds
}

// ==================== ROUTING / NAVIGATION ==================== //
function initSidebarRouter() {
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const view = e.currentTarget.getAttribute('data-view');
      navigateToView(view);
    });
  });

  // Handle browser back/forward buttons
  window.addEventListener('hashchange', () => {
    const view = window.location.hash.substring(1) || 'dashboard';
    navigateToView(view, false);
  });

  // Set initial view from hash
  const initialView = window.location.hash.substring(1) || 'dashboard';
  navigateToView(initialView, false);
}

function navigateToView(viewId, updateHash = true) {
  const activeView = document.querySelector(`.app-view[id="view-${viewId}"]`);
  if (!activeView) return;

  // Update hash
  if (updateHash) {
    window.location.hash = viewId;
  }

  // Toggle active class in nav
  document.querySelectorAll('.nav-item').forEach(item => {
    if (item.getAttribute('data-view') === viewId) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  // Switch views
  document.querySelectorAll('.app-view').forEach(view => {
    view.classList.remove('active');
    view.style.display = 'none';
  });

  activeView.style.display = 'block';
  setTimeout(() => {
    activeView.classList.add('active');
  }, 50);

  // Update Title and Subtitle dynamically
  const titles = {
    dashboard: { main: 'Báo Cáo Tổng Quan', sub: 'Tổng quan doanh số chuyển đổi và hiệu suất công việc phòng ban.' },
    crm: { main: 'Bảng CRM Khách Hàng', sub: 'Quản lý phễu chuyển đổi khách hàng 7 bước từ nhận thông tin đến chốt.' },
    tasks: { main: 'Quản Lý Công Việc', sub: 'Giao việc, bám sát quy trình từng phòng ban và tích điểm Xúc Xích.' },
    'inbox-simulator': { main: 'Giả Lập Fanpage Message', sub: 'Thử nghiệm tính năng tự động tạo lead trên CRM từ tin nhắn của khách.' },
    settings: { main: 'Thiết Lập Hệ Thống', sub: 'Cấu hình liên kết Fanpage Facebook, quản lý kết nối API Server và dữ liệu hệ thống.' },
    rewards: { main: 'Đua Top Tích Xúc Xích', sub: 'Bảng thi đua xếp hạng thưởng dựa trên điểm hoàn thành công việc.' },
    'staff-management': { main: 'Quản Lý Nhân Sự', sub: 'Tạo tài khoản, phân quyền hệ thống cho cán bộ nhân viên Minh Hải Logistics.' },
    'crm-clients-workflows': { main: 'CRM Khách Cũ & Lô Hàng', sub: 'Quản lý quy trình vận chuyển 11 bước cho khách hàng thân thiết.' },
    'tasks-single': { main: 'Quản Lý Công Việc Đơn Lẻ', sub: 'Theo dõi, giao việc phát sinh hàng ngày của nhân viên.' },
    'tasks-projects': { main: 'Dự Án & Phòng Ban', sub: 'Tập trung quản lý tài liệu, công việc, thảo luận theo phòng ban/khách VIP.' },
    'my-tasks': { main: 'Công Việc Của Tôi', sub: 'Danh sách tổng hợp các khâu vận chuyển lô hàng, việc đơn lẻ và dự án do bạn phụ trách.' },
    'customer-health': { main: 'Sức Khỏe Khách Hàng', sub: 'Phân tích dữ liệu vận chuyển các tháng và cảnh báo nguy cơ sụt giảm sản lượng hoặc mất khách.' },
    'mini-games': { main: 'Khu Vui Chơi & Giải Trí', sub: 'Đấu trí cờ caro cược điểm, chơi xổ số bao/đề 18h hàng ngày, và tổ chức bet kèo nội bộ.' },
    'suggestions': { main: 'Ý Tưởng & Đề Xuất Quy Trình', sub: 'Nhận đóng góp ý kiến tối ưu quy trình và báo cáo lỗi phần mềm từ nhân sự.' }
  };

  if (titles[viewId]) {
    document.getElementById('view-title').innerText = titles[viewId].main;
    document.getElementById('view-description').innerText = titles[viewId].sub;
  }

  // Trigger view specific rendering
  if (viewId === 'dashboard') {
    renderDashboard();
  } else if (viewId === 'crm') {
    renderCRMBoard();
  } else if (viewId === 'tasks') {
    renderTasksList();

  } else if (viewId === 'crm-clients-workflows') {
    if (typeof renderOpsWorkflows === 'function') renderOpsWorkflows();
  } else if (viewId === 'tasks-single') {
    if (typeof renderOpsSingleTasks === 'function') renderOpsSingleTasks();
  } else if (viewId === 'tasks-projects') {
    if (typeof renderOpsProjects === 'function') renderOpsProjects();
  } else if (viewId === 'my-tasks') {
    if (typeof renderMyTasks === 'function') renderMyTasks();
  } else if (viewId === 'rewards') {
    renderRewardsView();
  } else if (viewId === 'customer-health') {
    renderCustomerHealthView();
  } else if (viewId === 'settings') {
    renderFacebookConfig();
    const apiInput = document.getElementById('settings-api-base-input');
    if (apiInput) {
      apiInput.value = localStorage.getItem('minhhai_custom_api_base') || '';
    }
  } else if (viewId === 'staff-management') {
    renderStaffManagementTable();
  } else if (viewId === 'mini-games') {
    if (typeof renderMiniGames === 'function') renderMiniGames();
  } else if (viewId === 'suggestions') {
    if (typeof renderSuggestions === 'function') renderSuggestions();
  }
}

function renderFacebookConfig() {
  if (!AppState.fbConfig) {
    AppState.fbConfig = { accessToken: '', pageUrl: 'https://www.facebook.com/MinhHailogistcs.Muahangtaobao.vanchuyentrungviet' };
  }
  
  const tokenInput = document.getElementById('fb-config-access-token');
  if (tokenInput) {
    tokenInput.value = AppState.fbConfig.accessToken || '';
  }

  const webhookUrlInput = document.getElementById('fb-config-webhook-url');
  if (webhookUrlInput) {
    const customApiBase = localStorage.getItem('minhhai_custom_api_base');
    if (customApiBase) {
      const base = customApiBase.endsWith('/') ? customApiBase.slice(0, -1) : customApiBase;
      webhookUrlInput.value = `${base}/webhook`;
    } else {
      const origin = window.location.origin;
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        webhookUrlInput.value = 'https://whgxg-116-107-238-198.free.pinggy.net/webhook';
      } else {
        webhookUrlInput.value = `${origin}/webhook`;
      }
    }
  }

  const copyWebhook = document.getElementById('btn-copy-webhook');
  if (copyWebhook) {
    copyWebhook.onclick = () => {
      navigator.clipboard.writeText(webhookUrlInput.value);
      showToast('Đã sao chép Webhook URL!', 'success');
    };
  }

  const copyVerify = document.getElementById('btn-copy-verify');
  if (copyVerify) {
    copyVerify.onclick = () => {
      navigator.clipboard.writeText(document.getElementById('fb-config-verify-token').value);
      showToast('Đã sao chép Verify Token!', 'success');
    };
  }

  const form = document.getElementById('form-fb-config');
  if (form) {
    form.onsubmit = async (e) => {
      e.preventDefault();
      const tokenVal = document.getElementById('fb-config-access-token').value.trim();
      AppState.fbConfig.accessToken = tokenVal;
      await saveState();
      showToast('Đã lưu cấu hình Fanpage thành công!', 'success');
    };
  }

  const btnReset = document.getElementById('btn-reset-db');
  if (btnReset) {
    btnReset.onclick = async () => {
      if (!confirm('Bạn có chắc chắn muốn xóa toàn bộ dữ liệu nháp (khách hàng, công việc, thông báo, nhật ký xúc xích) để nhập test mới từ đầu không?')) {
        return;
      }
      try {
        const res = await fetch(getApiUrl('/api/reset'), { method: 'POST' });
        const result = await res.json();
        if (result.success) {
          showToast('Đã xóa dữ liệu nháp thành công! Đang tải lại...', 'success');
          setTimeout(() => window.location.reload(), 1500);
        } else {
          showToast('Có lỗi xảy ra: ' + result.error, 'error');
        }
      } catch (err) {
        showToast('Không thể kết nối đến máy chủ!', 'error');
      }
    };
  }

  // Export Database
  const btnExport = document.getElementById('btn-export-db');
  if (btnExport) {
    btnExport.onclick = () => {
      try {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(AppState, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href",     dataStr);
        downloadAnchor.setAttribute("download", `minhhai_crm_backup_${new Date().toISOString().slice(0,10)}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        showToast('Đã xuất file sao lưu dữ liệu thành công!', 'success');
      } catch (err) {
        showToast('Lỗi khi xuất dữ liệu!', 'error');
        console.error(err);
      }
    };
  }

  // Import Database
  const inputImport = document.getElementById('input-import-db');
  if (inputImport) {
    inputImport.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = async (evt) => {
        try {
          const parsed = JSON.parse(evt.target.result);
          if (!parsed.users || !parsed.leads) {
            showToast('Định dạng file sao lưu không hợp lệ!', 'error');
            return;
          }
          if (!confirm('Bạn có chắc chắn muốn khôi phục dữ liệu từ file này? Dữ liệu hiện tại trên hệ thống sẽ bị ghi đè hoàn toàn.')) {
            inputImport.value = '';
            return;
          }
          
          // Copy values to AppState
          AppState.users = parsed.users || AppState.users;
          AppState.leads = parsed.leads || AppState.leads;
          AppState.tasks = parsed.tasks || AppState.tasks;
          AppState.workflows = parsed.workflows || AppState.workflows;
          AppState.sausageLogs = parsed.sausageLogs || AppState.sausageLogs;
          AppState.notifications = parsed.notifications || AppState.notifications;
          AppState.clients = parsed.clients || AppState.clients;
          AppState.projects = parsed.projects || AppState.projects;
          AppState.shipment_workflows = parsed.shipment_workflows || AppState.shipment_workflows;
          AppState.single_tasks = parsed.single_tasks || AppState.single_tasks;
          if (parsed.currentUserId) AppState.currentUserId = parsed.currentUserId;
          
          showToast('Đang đồng bộ dữ liệu lên máy chủ...', 'info');
          await saveState();
          showToast('Đồng bộ dữ liệu thành công! Đang tải lại...', 'success');
          setTimeout(() => window.location.reload(), 1500);
        } catch (err) {
          showToast('Lỗi khi đọc file hoặc ghi đè dữ liệu!', 'error');
          console.error(err);
        }
      };
      reader.readAsText(file);
    };
  }
}

function initRoleSwitcher() {
  const sessionUser = JSON.parse(localStorage.getItem('minhhai_user') || '{}');
  const selectorContainer = document.querySelector('.test-user-selector');
  if (selectorContainer) {
    if (sessionUser.role === 'admin' || sessionUser.role === 'manager') {
      selectorContainer.style.display = 'flex';
    } else {
      selectorContainer.style.display = 'none';
    }
  }

  const switcher = document.getElementById('user-switcher');
  switcher.innerHTML = '';
  
  const roleLabels = { admin: 'Admin', manager: 'Quản lý', staff: 'Nhân viên' };
  AppState.users.forEach(u => {
    const opt = document.createElement('option');
    opt.value = u.id;
    const roleLabel = roleLabels[u.role] || u.role.toUpperCase();
    opt.innerText = `${u.name} (${roleLabel})`;
    if (u.id === AppState.currentUserId) {
      opt.selected = true;
    }
    switcher.appendChild(opt);
  });

  switcher.addEventListener('change', (e) => {
    AppState.currentUserId = e.target.value;
    saveState();
    
    // Rerender user context
    renderCurrentUser();
    
    // Rerender active view
    const currentViewId = document.querySelector('.nav-item.active').getAttribute('data-view');
    navigateToView(currentViewId, false);
    
    showToast(`Đã chuyển sang vai trò: ${getCurrentUser().name}`, 'info');
  });
}

function getCurrentUser() {
  const sessionUser = JSON.parse(localStorage.getItem('minhhai_user') || '{}');
  const defaultUser = (AppState.users && AppState.users[0]) || INITIAL_USERS[0];
  if (!AppState.users || AppState.users.length === 0) {
    AppState.users = [...INITIAL_USERS];
  }
  return AppState.users.find(u => u.id === AppState.currentUserId) || AppState.users.find(u => u.id === sessionUser.id) || AppState.users[0] || defaultUser;
}

window.getUserAvatarInnerHtml = function(avatar) {
  if (!avatar) {
    return `<i class="fa-solid fa-user"></i>`;
  }
  if (avatar.startsWith('http://') || avatar.startsWith('https://') || avatar.startsWith('data:image/')) {
    return `<img src="${avatar}" style="width:100%; height:100%; object-fit:cover; display:block; border-radius:50%;">`;
  }
  return `<i class="fa-solid ${avatar}"></i>`;
};

window.initDragToScroll = function(slider) {
  if (!slider) return;
  let isDown = false;
  let startX;
  let scrollLeft;
  let hasDragged = false;

  slider.addEventListener('mousedown', (e) => {
    const tag = e.target.tagName.toLowerCase();
    if (tag === 'input' || tag === 'select' || tag === 'textarea' || tag === 'button' || tag === 'a' || e.target.closest('button') || e.target.closest('a')) {
      return;
    }
    isDown = true;
    hasDragged = false;
    startX = e.pageX - slider.offsetLeft;
    scrollLeft = slider.scrollLeft;
    document.body.style.userSelect = 'none';
  });

  const stopDragging = () => {
    isDown = false;
    document.body.style.userSelect = '';
  };

  slider.addEventListener('mouseleave', stopDragging);
  slider.addEventListener('mouseup', stopDragging);

  slider.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    const x = e.pageX - slider.offsetLeft;
    const walk = (x - startX) * 1.5;
    if (Math.abs(x - startX) > 5) {
      hasDragged = true;
    }
    slider.scrollLeft = scrollLeft - walk;
  });

  slider.addEventListener('click', (e) => {
    if (hasDragged) {
      e.stopPropagation();
      e.preventDefault();
      hasDragged = false;
    }
  }, true);
};

function renderCurrentUser() {
  const user = getCurrentUser();
  document.getElementById('current-user-name').innerText = user.name;
  document.getElementById('current-user-points').innerText = user.role === 'admin' ? 'Vô hạn' : user.points;
  
  // Set role badge classes
  const badge = document.getElementById('current-user-role-badge');
  badge.className = 'role-badge';
  const roleLabels = { admin: 'Quản trị viên (Admin)', manager: 'Quản lý', staff: 'Nhân viên' };
  badge.innerText = roleLabels[user.role] || user.role;
  badge.classList.add(`badge-${user.role}`);
  
  // Set user avatar
  const avatarDiv = document.getElementById('current-user-avatar');
  if (avatarDiv) {
    avatarDiv.style.overflow = 'hidden';
    avatarDiv.innerHTML = window.getUserAvatarInnerHtml(user.avatar);
  }
  
  applyRoleBasedNavigation();
}

function applyRoleBasedNavigation() {
  const user = getCurrentUser();
  const isAdmin = user && user.role === 'admin';
  const isAdminOrManager = user && (user.role === 'admin' || user.role === 'manager');

  const navSettings = document.getElementById('nav-settings');
  const navStaffMgmt = document.getElementById('nav-staff-mgmt');

  if (navSettings) navSettings.style.display = isAdmin ? '' : 'none';
  if (navStaffMgmt) navStaffMgmt.style.display = isAdmin ? '' : 'none';

  // Toggle sub-dashboard views inside view-dashboard
  const adminView = document.getElementById('dashboard-admin-view');
  const staffView = document.getElementById('dashboard-staff-view');
  if (adminView && staffView) {
    if (isAdminOrManager) {
      adminView.style.display = 'block';
      staffView.style.display = 'none';
    } else {
      adminView.style.display = 'none';
      staffView.style.display = 'block';
    }
  }

  // Hide project creation button for non-admins
  const btnAddProjectModal = document.getElementById('btn-add-project-modal');
  if (btnAddProjectModal) {
    btnAddProjectModal.style.display = isAdmin ? '' : 'none';
  }

  // Redirect non-admin away from restricted views
  const activeTabElement = document.querySelector('.nav-item.active');
  if (activeTabElement) {
    const currentViewId = activeTabElement.getAttribute('data-view');
    const restrictedViews = ['settings', 'staff-management'];
    if (!isAdmin && restrictedViews.includes(currentViewId)) {
      navigateToView('my-tasks');
    }
  }
}

// ==================== DASHBOARD RENDER & CHARTS ==================== //
function renderDashboard() {
  const user = getCurrentUser();
  const isAdminOrManager = user && (user.role === 'admin' || user.role === 'manager');
  if (!isAdminOrManager) {
    renderStaffDashboard(user);
    return;
  }

  // 1. Compute Stats
  const totalLeads = AppState.leads.length;
  const successLeads = AppState.leads.filter(l => l.stage === 'success').length;
  const failedLeads = AppState.leads.filter(l => l.stage === 'failed').length;
  const totalSausage = AppState.users.reduce((acc, u) => acc + u.points, 0);

  document.getElementById('stat-total-leads').innerText = totalLeads;
  document.getElementById('stat-success-leads').innerText = successLeads;
  document.getElementById('stat-failed-leads').innerText = failedLeads;
  document.getElementById('stat-total-sausage').innerText = totalSausage;

  const convRate = totalLeads > 0 ? Math.round((successLeads / totalLeads) * 100) : 0;
  const failRate = totalLeads > 0 ? Math.round((failedLeads / totalLeads) * 100) : 0;

  document.getElementById('stat-conversion-rate').innerHTML = `<i class="fa-solid fa-arrow-trend-up"></i> ${convRate}% Tỉ lệ chuyển đổi`;
  document.getElementById('stat-fail-rate').innerHTML = `<i class="fa-solid fa-arrow-trend-down"></i> ${failRate}% Tỉ lệ thất bại`;

  // 1.1 Compute Fanpage Monthly Conversion Rate
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  let closedSuccessInMonth = 0;
  let newLeadsInMonth = 0;
  let oldActiveLeadsInMonth = 0;

  if (AppState.leads) {
    AppState.leads.forEach(lead => {
      if (lead.source !== 'Fanpage') return;

      // Extract creation year and month from lead.date ("YYYY-MM-DD") timezone-safely
      let leadYear = 0;
      let leadMonth = -1;
      if (lead.date) {
        const parts = lead.date.split('-');
        if (parts.length >= 2) {
          leadYear = parseInt(parts[0]);
          leadMonth = parseInt(parts[1]) - 1;
        }
      }

      const isCreatedThisMonth = leadYear === currentYear && leadMonth === currentMonth;
      const isCreatedBeforeThisMonth = (leadYear < currentYear) || (leadYear === currentYear && leadMonth < currentMonth);

      // 1. Count closed success in this month
      if (lead.stage === 'success') {
        let successYear = 0;
        let successMonth = -1;

        const successTime = lead.stageEntryTimes ? lead.stageEntryTimes['success'] : null;
        if (successTime) {
          const d = new Date(successTime);
          if (!isNaN(d.getTime())) {
            successYear = d.getFullYear();
            successMonth = d.getMonth();
          }
        }
        
        // Fallback to updatedTime, createdTime, or date if successTime is missing or invalid
        if (successMonth === -1) {
          const refTime = lead.updatedTime || lead.createdTime || lead.date;
          if (refTime) {
            const parts = refTime.split('-');
            if (parts.length >= 2) {
              successYear = parseInt(parts[0]);
              successMonth = parseInt(parts[1]) - 1;
            }
          }
        }

        if (successYear === currentYear && successMonth === currentMonth) {
          closedSuccessInMonth++;
        }
      }

      // 2. Count new leads in this month
      if (isCreatedThisMonth) {
        newLeadsInMonth++;
      } else if (isCreatedBeforeThisMonth) {
        // 3. Count active leads from previous months
        let isActiveAtStart = false;
        if (lead.stage !== 'success' && lead.stage !== 'failed') {
          isActiveAtStart = true;
        } else {
          // Check when it reached the current terminal stage
          let resolveYear = 0;
          let resolveMonth = -1;
          const resolveTime = lead.stageEntryTimes ? lead.stageEntryTimes[lead.stage] : null;
          if (resolveTime) {
            const d = new Date(resolveTime);
            if (!isNaN(d.getTime())) {
              resolveYear = d.getFullYear();
              resolveMonth = d.getMonth();
            }
          }
          if (resolveMonth === -1) {
            const refTime = lead.updatedTime || lead.createdTime || lead.date;
            if (refTime) {
              const parts = refTime.split('-');
              if (parts.length >= 2) {
                resolveYear = parseInt(parts[0]);
                resolveMonth = parseInt(parts[1]) - 1;
              }
            }
          }
          // If resolved in current month (or later), it was still active at start of current month
          const isResolvedThisMonthOrLater = (resolveYear > currentYear) || (resolveYear === currentYear && resolveMonth >= currentMonth);
          if (isResolvedThisMonthOrLater) {
            isActiveAtStart = true;
          }
        }

        if (isActiveAtStart) {
          oldActiveLeadsInMonth++;
        }
      }
    });
  }

  const fanpageTotalDenominator = newLeadsInMonth + oldActiveLeadsInMonth;
  const fanpageConvRate = fanpageTotalDenominator > 0 
    ? Math.round((closedSuccessInMonth / fanpageTotalDenominator) * 100) 
    : 0;

  const statFanpageConvRateEl = document.getElementById('stat-fanpage-conv-rate');
  const statFanpageConvDetailEl = document.getElementById('stat-fanpage-conv-detail');
  if (statFanpageConvRateEl) statFanpageConvRateEl.innerText = `${fanpageConvRate}%`;
  if (statFanpageConvDetailEl) {
    statFanpageConvDetailEl.innerText = `Chốt ${closedSuccessInMonth} / Tổng ${fanpageTotalDenominator} (Mới: ${newLeadsInMonth}, Cũ: ${oldActiveLeadsInMonth})`;
  }

  // 2. Render Charts
  renderDashboardCharts();

  // 3. Render Mini Tasks list
  renderMiniTasks();

  // 4. Render Mini Leaderboard
  renderMiniLeaderboard();

  // 5. Render Admin Staff Workload Monitoring
  renderAdminStaffWorkloadTable();
}

function renderAdminStaffWorkloadTable() {
  const tbody = document.getElementById('admin-staff-workload-tbody');
  if (!tbody) return;
  tbody.innerHTML = '';

  if (window.workloadSortKey === undefined) {
    window.workloadSortKey = 'active';
    window.workloadSortAsc = false; // Descending default
  }

  const usersList = AppState.users || [];

  // 1. Calculate stats for each user
  const usersData = usersList.map(u => {
    const userId = u.id;
    let activeTasksCount = 0;
    let overdueTasksCount = 0;
    let completedTasksCount = 0;

    // Shipment steps
    if (AppState.shipment_workflows) {
      AppState.shipment_workflows.forEach(flow => {
        const stepData = flow.steps.find(s => s.stepNum === flow.stage);
        if (stepData && stepData.assigneeId === userId) {
          if (stepData.status !== 'done') {
            activeTasksCount++;
            const isOverdue = flow.deadline && new Date(flow.deadline) < new Date();
            if (isOverdue) overdueTasksCount++;
          } else {
            completedTasksCount++;
          }
        }
      });
    }

    // Single Tasks
    if (AppState.single_tasks) {
      AppState.single_tasks.forEach(t => {
        if (t.assigneeId === userId) {
          if (t.status !== 'completed' && t.status !== 'canceled') {
            activeTasksCount++;
            const isOverdue = t.deadline && new Date(t.deadline) < new Date();
            if (isOverdue) overdueTasksCount++;
          } else if (t.status === 'completed') {
            completedTasksCount++;
          }
        }
      });
    }

    // CRM Tasks
    if (AppState.tasks) {
      AppState.tasks.forEach(t => {
        if (t.assigneeId === userId) {
          if (t.status !== 'completed' && t.status !== 'canceled') {
            activeTasksCount++;
            const isOverdue = t.deadline && new Date(t.deadline) < new Date();
            if (isOverdue) overdueTasksCount++;
          } else if (t.status === 'completed') {
            completedTasksCount++;
          }
        }
      });
    }

    return {
      user: u,
      active: activeTasksCount,
      overdue: overdueTasksCount,
      completed: completedTasksCount
    };
  });

  // 2. Compute overall department KPIs
  let overloadedStaff = 0;
  let busyStaff = 0;
  let balancedStaff = 0;
  let totalOverdueTasks = 0;

  usersData.forEach(ud => {
    totalOverdueTasks += ud.overdue;
    if (ud.active > 5) {
      overloadedStaff++;
    } else if (ud.active >= 3) {
      busyStaff++;
    } else {
      balancedStaff++;
    }
  });

  const kpiOverloaded = document.getElementById('workload-kpi-overloaded');
  const kpiBusy = document.getElementById('workload-kpi-busy');
  const kpiBalanced = document.getElementById('workload-kpi-balanced');
  const kpiOverdue = document.getElementById('workload-kpi-overdue');

  if (kpiOverloaded) kpiOverloaded.innerText = overloadedStaff;
  if (kpiBusy) kpiBusy.innerText = busyStaff;
  if (kpiBalanced) kpiBalanced.innerText = balancedStaff;
  if (kpiOverdue) kpiOverdue.innerText = totalOverdueTasks;

  // 3. Sort users list
  usersData.sort((a, b) => {
    let valA, valB;
    if (window.workloadSortKey === 'name') {
      valA = a.user.name.toLowerCase();
      valB = b.user.name.toLowerCase();
    } else if (window.workloadSortKey === 'points') {
      valA = a.user.points || 0;
      valB = b.user.points || 0;
    } else if (window.workloadSortKey === 'active') {
      valA = a.active;
      valB = b.active;
    } else if (window.workloadSortKey === 'overdue') {
      valA = a.overdue;
      valB = b.overdue;
    } else if (window.workloadSortKey === 'completed') {
      valA = a.completed;
      valB = b.completed;
    } else if (window.workloadSortKey === 'status') {
      valA = a.active;
      valB = b.active;
    }

    if (valA < valB) return window.workloadSortAsc ? -1 : 1;
    if (valA > valB) return window.workloadSortAsc ? 1 : -1;
    return 0;
  });

  // 4. Render Table rows
  usersData.forEach(ud => {
    // Calculate visual metrics
    const pct = Math.min((ud.active / 8) * 100, 100);
    let barColor = '#10b981'; // Balanced / Idle
    if (ud.active > 5) {
      barColor = '#ef4444'; // Overloaded
    } else if (ud.active >= 3) {
      barColor = '#f59e0b'; // Busy
    } else if (ud.active > 0) {
      barColor = '#3b82f6'; // Light active
    }

    let statusText = 'Nhàn rỗi';
    if (ud.active > 5) {
      statusText = 'Quá tải ⚠️';
    } else if (ud.active >= 3) {
      statusText = 'Bận rộn';
    } else if (ud.active > 0) {
      statusText = 'Vừa phải';
    }

    if (ud.overdue > 0) {
      statusText += ` (Trễ: ${ud.overdue})`;
    }

    const tr = document.createElement('tr');
    tr.style.borderBottom = '1px solid var(--border-color)';
    tr.innerHTML = `
      <td style="padding: 10px; font-weight: bold; display:flex; align-items:center; gap:8px;">
        <div style="width:28px; height:28px; font-size:12px; display:flex; align-items:center; justify-content:center; border-radius:50%; overflow:hidden; background:rgba(255,255,255,0.05);">
          ${window.getUserAvatarInnerHtml(ud.user.avatar)}
        </div>
        <span>${ud.user.name}</span>
      </td>
      <td style="padding: 10px; color: var(--text-secondary); text-transform: capitalize;">${ud.user.role}</td>
      <td style="padding: 10px; text-align: center; font-weight: bold; color: #f59e0b;">${ud.user.points} xúc xích</td>
      <td style="padding: 10px; text-align: center; font-weight: bold;">${ud.active}</td>
      <td style="padding: 10px; text-align: center; font-weight: bold; color: ${ud.overdue > 0 ? '#ef4444' : 'var(--text-muted)'};">${ud.overdue}</td>
      <td style="padding: 10px; text-align: center; font-weight: bold; color: #10b981;">${ud.completed}</td>
      <td style="padding: 10px; text-align: center; vertical-align: middle;">
        <div class="workload-bar-bg" style="margin-right: 8px;">
          <div class="workload-bar-fill" style="width: ${pct}%; background-color: ${barColor};"></div>
        </div>
        <span style="font-weight: bold; color: ${barColor}; font-size: 11px;">${statusText}</span>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function renderDashboardCharts() {
  // Destroy old charts to prevent duplicate canvases on reload
  if (crmChartInstance) crmChartInstance.destroy();
  if (failChartInstance) failChartInstance.destroy();

  // CRM Funnel Chart Data
  const stages = ['receive_info', 'get_phone', 'explore_info', 'quotation', 'negotiating', 'success', 'failed'];
  const stageNames = ['Nhận thông tin', 'Lấy SĐT', 'Khai thác thông tin', 'Báo giá', 'Thương lượng', 'Thành công', 'Thất bại'];
  const stageCounts = stages.map(st => AppState.leads.filter(l => l.stage === st).length);

  const crmCtx = document.getElementById('crmFunnelChart').getContext('2d');
  crmChartInstance = new Chart(crmCtx, {
    type: 'bar',
    data: {
      labels: stageNames,
      datasets: [{
        label: 'Số lượng cơ hội',
        data: stageCounts,
        backgroundColor: [
          'rgba(59, 130, 246, 0.6)',   // Blue (receive_info)
          'rgba(139, 92, 246, 0.6)',   // Purple (get_phone)
          'rgba(244, 63, 94, 0.6)',    // Pink (explore_info)
          'rgba(245, 158, 11, 0.6)',   // Yellow (quotation)
          'rgba(249, 115, 22, 0.6)',   // Orange (negotiating)
          'rgba(16, 185, 129, 0.6)',   // Emerald (success)
          'rgba(239, 68, 68, 0.6)'     // Rose (failed)
        ],
        borderColor: [
          '#3b82f6', '#8b5cf6', '#f43f5e', '#f59e0b', '#f97316', '#10b981', '#ef4444'
        ],
        borderWidth: 1.5,
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#1f2937',
          titleColor: '#fff',
          bodyColor: '#e5e7eb',
          borderColor: 'rgba(255,255,255,0.1)',
          borderWidth: 1
        }
      },
      scales: {
        y: {
          grid: { color: 'rgba(255, 255, 255, 0.05)' },
          ticks: { color: '#9ca3af', stepSize: 1 }
        },
        x: {
          grid: { display: false },
          ticks: { color: '#9ca3af' }
        }
      }
    }
  });

  // Failure Reasons Chart Data
  const failLeads = AppState.leads.filter(l => l.stage === 'failed');
  const reasonsMap = {};
  failLeads.forEach(l => {
    const r = l.failReason || 'Không rõ';
    reasonsMap[r] = (reasonsMap[r] || 0) + 1;
  });

  const failLabels = Object.keys(reasonsMap);
  const failCounts = Object.values(reasonsMap);

  const failCtx = document.getElementById('crmFailReasonsChart').getContext('2d');
  
  if (failLabels.length === 0) {
    // If no failure leads yet, draw empty placeholder
    failChartInstance = new Chart(failCtx, {
      type: 'doughnut',
      data: {
        labels: ['Không có dữ liệu'],
        datasets: [{
          data: [1],
          backgroundColor: ['rgba(255, 255, 255, 0.05)'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: true, position: 'bottom', labels: { color: '#9ca3af' } }
        }
      }
    });
  } else {
    failChartInstance = new Chart(failCtx, {
      type: 'doughnut',
      data: {
        labels: failLabels,
        datasets: [{
          data: failCounts,
          backgroundColor: [
            'rgba(239, 68, 68, 0.7)',
            'rgba(249, 115, 22, 0.7)',
            'rgba(245, 158, 11, 0.7)',
            'rgba(139, 92, 246, 0.7)',
            'rgba(6, 182, 212, 0.7)',
            'rgba(255, 255, 255, 0.2)'
          ],
          borderColor: '#111827',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#9ca3af',
              boxWidth: 12,
              padding: 15,
              font: { size: 11 }
            }
          },
          tooltip: {
            backgroundColor: '#1f2937',
            borderColor: 'rgba(255,255,255,0.1)',
            borderWidth: 1
          }
        },
        cutout: '65%'
      }
    });
  }
}

function renderMiniTasks() {
  const container = document.getElementById('dashboard-mini-tasks');
  container.innerHTML = '';
  
  const user = getCurrentUser();
  // Filter: If admin show all tasks, otherwise show only assigned to user
  const userTasks = user.role === 'admin' 
    ? AppState.tasks.filter(t => t.status !== 'completed').slice(0, 5)
    : AppState.tasks.filter(t => t.assigneeId === user.id && t.status !== 'completed').slice(0, 5);

  const totalActiveTasks = user.role === 'admin' 
    ? AppState.tasks.length 
    : AppState.tasks.filter(t => t.assigneeId === user.id).length;
    
  const completedCount = user.role === 'admin' 
    ? AppState.tasks.filter(t => t.status === 'completed').length 
    : AppState.tasks.filter(t => t.assigneeId === user.id && t.status === 'completed').length;

  const percent = totalActiveTasks > 0 ? Math.round((completedCount / totalActiveTasks) * 100) : 0;
  
  document.getElementById('dashboard-task-progress').style.width = `${percent}%`;
  document.getElementById('dashboard-task-progress-text').innerText = `${percent}% hoàn thành (${completedCount}/${totalActiveTasks} nhiệm vụ)`;

  if (userTasks.length === 0) {
    container.innerHTML = `<div class="empty-state"><i class="fa-solid fa-list-check empty-state-icon" style="font-size: 28px;"></i><span>Không có công việc nào đang xử lý.</span></div>`;
    return;
  }

  userTasks.forEach(t => {
    const div = document.createElement('div');
    div.className = 'mini-task-item';
    
    // Status text class
    let statusClass = 'bg-blue';
    let statusLabel = 'Chưa làm';
    if (t.status === 'doing') { statusClass = 'bg-orange'; statusLabel = 'Đang làm'; }
    else if (t.status === 'checking') { statusClass = 'bg-purple'; statusLabel = 'Đang duyệt'; }
    
    div.innerHTML = `
      <div class="mini-task-left">
        <span class="badge ${statusClass} mini-task-dept">${statusLabel}</span>
        <span class="mini-task-title" title="${t.title}">${t.title}</span>
      </div>
      <span class="mini-task-reward">+${t.points} <i class="fa-solid fa-hotdog"></i></span>
    `;
    container.appendChild(div);
  });
}

function renderMiniLeaderboard() {
  const container = document.getElementById('dashboard-leaderboard');
  container.innerHTML = '';

  // Sort users descending by points
  const sortedUsers = [...AppState.users].sort((a, b) => b.points - a.points).slice(0, 5);

  const roleLabels = { admin: 'Admin', sales: 'Sales', sourcing: 'Sourcing', warehouse: 'Kho bãi' };
  sortedUsers.forEach((u, index) => {
    const rank = index + 1;
    const div = document.createElement('div');
    div.className = `ranking-item rank-${rank}`;
    
    let medal = `<span class="rank-num">${rank}</span>`;
    if (rank === 1) medal = `<i class="fa-solid fa-trophy trophy-1 rank-num"></i>`;
    else if (rank === 2) medal = `<i class="fa-solid fa-trophy trophy-2 rank-num"></i>`;
    else if (rank === 3) medal = `<i class="fa-solid fa-trophy trophy-3 rank-num"></i>`;

    const roleLabel = roleLabels[u.role] || u.role.toUpperCase();
    div.innerHTML = `
      ${medal}
      <div class="rank-avatar">
        <i class="fa-solid ${u.avatar}"></i>
      </div>
      <div style="display: flex; flex-direction: column;">
        <span class="rank-name">${u.name}</span>
        <span class="rank-dept">${roleLabel}</span>
      </div>
      <span class="rank-points">${u.points} <i class="fa-solid fa-hotdog" style="font-size: 11px;"></i></span>
    `;
    container.appendChild(div);
  });
}

// ==================== REWARDS & LEADERBOARD VIEW ==================== //
const REWARDS_STORE_PRODUCTS = [
  { id: 'p-1', name: 'Ly trà sữa Trân châu', points: 40, icon: 'fa-glass-water', desc: 'Ly trà sữa size L mát lạnh tự chọn tại quầy.' },
  { id: 'p-2', name: 'Combo ăn trưa văn phòng', points: 80, icon: 'fa-bowl-food', desc: 'Suất cơm trưa đầy đặn kèm nước ngọt.' },
  { id: 'p-3', name: 'Bình nước Minh Hải', points: 120, icon: 'fa-bottle-water', desc: 'Bình giữ nhiệt in logo Minh Hải cực cool.' },
  { id: 'p-4', name: 'Voucher 100.000đ ăn uống', points: 180, icon: 'fa-ticket', desc: 'Voucher ăn uống thanh toán trực tiếp tại các quán liên kết.' },
  { id: 'p-5', name: 'Vé đi muộn 30 phút', points: 200, icon: 'fa-user-clock', desc: 'Đăng ký trước đi muộn 30 phút không bị tính ngày công trễ.' },
  { id: 'p-6', name: 'Vé về sớm 60 phút', points: 250, icon: 'fa-clock', desc: 'Về sớm 1 tiếng được phê duyệt trước cho công việc gia đình.' },
  { id: 'p-7', name: 'Vé nghỉ phép nửa ngày', points: 600, icon: 'fa-calendar-day', desc: 'Nửa ngày nghỉ phép hưởng nguyên lương được phê duyệt.' }
];

const REWARDS_BADGES = [
  { id: 'badge-ontime', name: 'Chiến Binh Đúng Hạn', icon: 'fa-calendar-check', desc: 'Hoàn thành task đúng hạn trong 7 ngày liên tục.', color: '#10b981' },
  { id: 'badge-supporter', name: 'Đồng Đội Vàng', icon: 'fa-handshake-angle', desc: 'Có ít nhất 3 task hỗ trợ đồng đội được quản lý duyệt.', color: '#3b82f6' },
  { id: 'badge-innovator', name: 'Vua Cải Tiến', icon: 'fa-lightbulb', desc: 'Có đề xuất cải tiến được áp dụng thành công.', color: '#f59e0b' },
  { id: 'badge-caring', name: 'Không Bỏ Sót', icon: 'fa-heart', desc: 'Không trễ phản hồi bất kỳ tin nhắn Fanpage nào trong tuần.', color: '#ef4444' },
  { id: 'badge-debt', name: 'Dũng Sĩ Thu Nợ', icon: 'fa-shield-halved', desc: 'Xử lý và hoàn tất nợ cước của 3 workflow hàng hóa.', color: '#8b5cf6' }
];

const REWARDS_QUIZZES = [
  {
    question: "Khi khách hàng gửi hàng ký gửi từ Trung Quốc về Việt Nam, bước đầu tiên trong quy trình vận hành (workflow) là gì?",
    options: [
      "Báo giá và thương lượng",
      "Nhận thông tin và tạo mã khách hàng",
      "Mua hàng hộ",
      "Giao hàng và thu nợ"
    ],
    correct: 1,
    explanation: "Đầu tiên, nhân viên CSKH/Sales phải Nhận thông tin, thiết lập mã số khách hàng và xác định nhu cầu ký gửi."
  },
  {
    question: "Hạn mức tối đa số ngày xử lý thông tin nợ cước (Thu nợ) của Minh Hải Logistics đối với khách hàng VIP là bao nhiêu ngày?",
    options: [
      "3 ngày kể từ khi giao hàng",
      "7 ngày kể từ khi giao hàng",
      "15 ngày kể từ khi giao hàng",
      "Không giới hạn thời gian"
    ],
    correct: 1,
    explanation: "Theo chính sách của Minh Hải Logistics, công nợ khách hàng VIP cần được thu hồi trong vòng 7 ngày kể từ khi giao hàng xong."
  },
  {
    question: "Nguyên tắc cốt lõi trong văn hóa phục vụ của Minh Hải Logistics là gì?",
    options: [
      "Nhanh nhất có thể",
      "Không bỏ sót khách hàng, xử lý phát sinh đến cùng",
      "Giá rẻ nhất thị trường",
      "Chỉ tập trung phục vụ khách mua sỉ"
    ],
    correct: 1,
    explanation: "Nguyên tắc cốt lõi là 'Không bỏ sót khách hàng, theo sát đơn nợ và xử lý phát sinh khiếu nại đến cùng'."
  }
];

const REWARDS_MISSIONS = [
  { id: 'm-1', type: 'daily', title: 'Cập nhật công việc hàng ngày', desc: 'Cập nhật trạng thái công việc của bạn ít nhất 1 lần trong ngày.', reward: '+2 Xúc xích', points: 2 },
  { id: 'm-2', type: 'daily', title: 'Hoàn thành bài Quiz nội bộ', desc: 'Tham gia trả lời câu hỏi tìm hiểu quy trình dịch vụ hàng ngày.', reward: '+5 Xúc xích', points: 5 },
  { id: 'm-3', type: 'weekly', title: 'Chiến binh Đúng Hạn tuần', desc: 'Không để bất kỳ công việc nào trễ hạn trong suốt cả tuần.', reward: '+10 Xúc xích & +1 Lượt quay', points: 10, spins: 1 },
  { id: 'm-4', type: 'weekly', title: 'Đồng đội vàng chuyên cần', desc: 'Hỗ trợ đồng nghiệp hoàn thành ít nhất 1 công việc khó.', reward: '+5 Xúc xích', points: 5 },
  { id: 'm-5', type: 'monthly', title: 'Forward Everyday', desc: 'Duy trì tỷ lệ hoàn thành công việc đúng hạn trên 95% trong tháng.', reward: '+30 Xúc xích & Huy hiệu "Chiến Binh Đúng Hạn"', points: 30, badge: 'badge-ontime' }
];

window.rewardsActiveTab = 'leaderboard';
window.leaderboardSubTab = 'personal';

function renderRewardsView() {
  const container = document.getElementById('view-rewards');
  if (!container) return;

  // Initialize sub-tab events once
  if (!window.rewardsTabsInitialized) {
    window.rewardsTabsInitialized = true;
    
    document.querySelectorAll('.rewards-tab-btn').forEach(btn => {
      btn.onclick = (e) => {
        document.querySelectorAll('.rewards-tab-btn').forEach(b => {
          b.classList.remove('active');
          b.style.color = 'var(--text-muted)';
          b.style.borderBottom = 'none';
        });
        const targetBtn = e.currentTarget;
        targetBtn.classList.add('active');
        targetBtn.style.color = 'var(--color-primary)';
        targetBtn.style.borderBottom = '3px solid var(--color-primary)';
        
        const tab = targetBtn.getAttribute('data-reward-tab');
        window.rewardsActiveTab = tab;
        document.querySelectorAll('.reward-tab-content').forEach(c => c.style.display = 'none');
        document.getElementById(`reward-tab-content-${tab}`).style.display = 'block';
        
        renderRewardsTabContent(tab);
      };
    });

    // Leaderboard submenu filter buttons
    const btnPers = document.getElementById('btn-leaderboard-personal');
    if (btnPers) {
      btnPers.onclick = () => {
        window.leaderboardSubTab = 'personal';
        switchLeaderboardSubTab('personal');
      };
    }
    const btnTeam = document.getElementById('btn-leaderboard-team');
    if (btnTeam) {
      btnTeam.onclick = () => {
        window.leaderboardSubTab = 'team';
        switchLeaderboardSubTab('team');
      };
    }
    const btnHonor = document.getElementById('btn-leaderboard-honor');
    if (btnHonor) {
      btnHonor.onclick = () => {
        window.leaderboardSubTab = 'honor';
        switchLeaderboardSubTab('honor');
      };
    }
  }

  // Render currently active tab
  renderRewardsTabContent(window.rewardsActiveTab);
}

function renderRewardsTabContent(tab) {
  if (tab === 'leaderboard') {
    switchLeaderboardSubTab(window.leaderboardSubTab);
    renderRecentPointsLog();
  } else if (tab === 'missions') {
    renderMissionsTab();
    renderQuiz();
  } else if (tab === 'store') {
    renderStoreTab();
  } else if (tab === 'games') {
    renderGamesTab();
  }
}

function switchLeaderboardSubTab(subTab) {
  const btns = {
    personal: document.getElementById('btn-leaderboard-personal'),
    team: document.getElementById('btn-leaderboard-team'),
    honor: document.getElementById('btn-leaderboard-honor')
  };
  const tables = {
    personal: document.getElementById('table-leaderboard-personal'),
    team: document.getElementById('table-leaderboard-team'),
    honor: document.getElementById('table-leaderboard-honor')
  };
  
  Object.keys(btns).forEach(k => {
    if (btns[k]) {
      btns[k].className = k === subTab ? 'btn btn-sm btn-primary' : 'btn btn-sm btn-outline';
    }
    if (tables[k]) {
      tables[k].style.display = k === subTab ? 'table' : 'none';
    }
  });
  
  renderLeaderboardData(subTab);
}

function renderLeaderboardData(subTab) {
  if (subTab === 'personal') {
    const tbody = document.getElementById('rewards-leaderboard-body');
    if (!tbody) return;
    tbody.innerHTML = '';
    
    const sortedUsers = [...AppState.users].sort((a, b) => b.points - a.points);
    const roleLabels = { admin: 'Admin', sales: 'Sales & CSKH', sourcing: 'Sourcing', warehouse: 'Kho bãi' };
    
    sortedUsers.forEach((u, index) => {
      const rank = index + 1;
      const tr = document.createElement('tr');
      
      let rankHtml = `<td class="text-center font-weight-bold" style="padding: 10px;">${rank}</td>`;
      if (rank === 1) rankHtml = `<td class="text-center" style="padding: 10px;"><i class="fa-solid fa-trophy text-gold" style="color: #f59e0b;"></i> 1</td>`;
      else if (rank === 2) rankHtml = `<td class="text-center" style="padding: 10px;"><i class="fa-solid fa-trophy text-muted"></i> 2</td>`;
      else if (rank === 3) rankHtml = `<td class="text-center" style="padding: 10px;"><i class="fa-solid fa-trophy" style="color: #b45309;"></i> 3</td>`;

      let title = 'Tập sự';
      let titleClass = 'text-muted';
      if (u.points >= 350) { title = 'Đại vương Xúc xích'; titleClass = 'text-gold'; }
      else if (u.points >= 280) { title = 'Chiến thần Săn việc'; titleClass = 'text-orange'; }
      else if (u.points >= 200) { title = 'Kẻ hủy diệt Task'; titleClass = 'text-blue'; }
      else if (u.points >= 150) { title = 'Thợ săn Điểm'; titleClass = 'text-purple'; }

      const totalEarned = Math.round(u.points * 1.25);
      const roleLabel = roleLabels[u.role] || u.role.toUpperCase();
      
      tr.innerHTML = `
        ${rankHtml}
        <td style="padding: 10px;">
          <div style="display:flex; align-items:center; gap: 8px;">
            <div class="rank-avatar" style="margin: 0; background: rgba(255,255,255,0.05); border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;"><i class="fa-solid ${u.avatar || 'fa-user-tie'}"></i></div>
            <div>
              <h4 style="font-size: 13px; font-weight:600; margin: 0;">${u.name}</h4>
              <span style="font-size: 10px; color: var(--text-muted)">ID: ${u.id}</span>
            </div>
          </div>
        </td>
        <td style="padding: 10px;"><span class="role-badge badge-${u.role}">${roleLabel}</span></td>
        <td class="text-center text-gold font-weight-bold" style="font-size:14px; font-weight:700; padding: 10px; color: #f59e0b;">${u.points} <i class="fa-solid fa-hotdog" style="font-size:12px;"></i></td>
        <td class="text-center text-muted" style="padding: 10px;">${totalEarned}</td>
        <td style="padding: 10px;"><span class="${titleClass}" style="font-size:12px; font-weight:600;"><i class="fa-solid fa-star" style="font-size:10px; margin-right:4px;"></i>${title}</span></td>
      `;
      tbody.appendChild(tr);
    });
  } else if (subTab === 'team') {
    const tbody = document.getElementById('rewards-leaderboard-team-body');
    if (!tbody) return;
    tbody.innerHTML = '';
    
    const depts = ['admin', 'sales', 'sourcing', 'warehouse'];
    const roleLabels = { admin: 'Ban Giám Đốc', sales: 'Đội Sales & CSKH', sourcing: 'Đội Sourcing tìm hàng', warehouse: 'Đội Kho bãi & Vận hành' };
    
    const deptData = depts.map(d => {
      const users = AppState.users.filter(u => u.role === d);
      const totalPoints = users.reduce((sum, u) => sum + (u.teamPoints || 0), 0);
      
      const userIds = users.map(u => u.id);
      let totalTasks = 0;
      let completedTasks = 0;
      
      if (AppState.tasks) {
        AppState.tasks.forEach(t => {
          if (userIds.includes(t.assigneeId)) {
            totalTasks++;
            if (t.status === 'completed') completedTasks++;
          }
        });
      }
      if (AppState.single_tasks) {
        AppState.single_tasks.forEach(t => {
          if (userIds.includes(t.assigneeId)) {
            totalTasks++;
            if (t.status === 'completed') completedTasks++;
          }
        });
      }
      
      const rate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 100;
      return { dept: d, label: roleLabels[d], points: totalPoints, rate: rate };
    }).sort((a, b) => b.points - a.points);

    deptData.forEach((d, index) => {
      const rank = index + 1;
      const tr = document.createElement('tr');
      
      let rating = 'Bình thường';
      let ratingColor = 'var(--text-muted)';
      if (d.rate >= 90) { rating = 'Xuất sắc 🌟'; ratingColor = '#10b981'; }
      else if (d.rate >= 80) { rating = 'Tốt 👍'; ratingColor = '#3b82f6'; }
      else if (d.rate < 60) { rating = 'Cần cải thiện ⚠️'; ratingColor = '#ef4444'; }
      
      tr.innerHTML = `
        <td class="text-center font-weight-bold" style="padding: 12px 10px;">${rank}</td>
        <td style="padding: 12px 10px; font-weight: bold; font-size: 13px;">${d.label}</td>
        <td class="text-center text-gold font-weight-bold" style="padding: 12px 10px; color:#f59e0b;">${d.points} Pts</td>
        <td class="text-center" style="padding: 12px 10px;">
          <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
            <div style="width: 60px; height: 8px; background: #374151; border-radius: 4px; overflow:hidden;">
              <div style="width: ${d.rate}%; height: 100%; background: #10b981;"></div>
            </div>
            <span style="font-size: 12px; font-weight: bold;">${d.rate}%</span>
          </div>
        </td>
        <td style="padding: 12px 10px; color: ${ratingColor}; font-weight: bold; font-size: 12.5px;">${rating}</td>
      `;
      tbody.appendChild(tr);
    });
  } else if (subTab === 'honor') {
    const tbody = document.getElementById('rewards-leaderboard-honor-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    const topOntimeUser = [...AppState.users].sort((a,b) => b.points - a.points)[0] || { name: 'Chưa có', points: 0 };
    const topHelperUser = [...AppState.users].sort((a,b) => (b.teamPoints||0) - (a.teamPoints||0))[0] || { name: 'Chưa có', teamPoints: 0 };
    const topInnovatorUser = AppState.users.find(u => u.role === 'admin') || AppState.users[0] || { name: 'Chưa có' };

    const rows = [
      { category: '🏆 Chiến Binh Đúng Hạn Nhất', user: topOntimeUser.name, score: `${topOntimeUser.points} task hoàn tất`, title: 'Forward Master' },
      { category: '🤝 Người Hỗ Trợ Đội Nhóm Tốt Nhất', user: topHelperUser.name, score: `${topHelperUser.teamPoints || 0} điểm hỗ trợ`, title: 'Golden Supporter' },
      { category: '💡 Ngôi Sao Sáng Tạo & Cải Tiến', user: topInnovatorUser.name, score: 'Có đề xuất hữu ích', title: 'Innovation Star' }
    ];

    rows.forEach(r => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="padding: 12px 10px; font-weight: bold; font-size: 13px; color: var(--color-primary);">${r.category}</td>
        <td style="padding: 12px 10px; font-weight: bold;">${r.user}</td>
        <td class="text-center text-muted" style="padding: 12px 10px; font-size: 12px;">${r.score}</td>
        <td style="padding: 12px 10px;"><span class="text-gold" style="font-weight: bold; font-size: 12px;"><i class="fa-solid fa-medal"></i> ${r.title}</span></td>
      `;
      tbody.appendChild(tr);
    });
  }
}

function renderRecentPointsLog() {
  const logContainer = document.getElementById('rewards-points-log');
  if (!logContainer) return;
  logContainer.innerHTML = '';

  const recentLogs = [...AppState.sausageLogs].sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0, 10);
  
  if (recentLogs.length === 0) {
    logContainer.innerHTML = `<div class="empty-state" style="padding: 20px 0; text-align: center; color: var(--text-muted);">Chưa có nhật ký phát thưởng nào.</div>`;
    return;
  }

  recentLogs.forEach(l => {
    const user = AppState.users.find(u => u.id === l.userId);
    const div = document.createElement('div');
    div.className = 'log-item';
    div.style.cssText = 'display:flex; justify-content:space-between; align-items:center; padding: 8px; border-bottom:1px solid rgba(255,255,255,0.03);';
    div.innerHTML = `
      <div class="log-text" style="font-size:12px;">
        <strong>${user ? user.name : 'Nhân viên'}</strong>: ${l.text}
        <div class="notification-time" style="font-size:10px; color:var(--text-muted); margin-top:2px;">${l.date}</div>
      </div>
      <span class="log-pts" style="font-weight:bold; font-size:13px; color:#f59e0b;">${l.points > 0 ? '+' : ''}${l.points} <i class="fa-solid fa-hotdog" style="font-size: 10px;"></i></span>
    `;
    logContainer.appendChild(div);
  });
}

function renderMissionsTab() {
  const container = document.getElementById('missions-list-container');
  if (!container) return;
  container.innerHTML = '';

  const loggedUser = AppState.users.find(u => u.id === AppState.currentUserId) || AppState.users[0];
  
  REWARDS_MISSIONS.forEach(m => {
    const isCompleted = loggedUser.completedMissions && loggedUser.completedMissions.includes(m.id);
    
    // Check if daily update status is claimable
    let claimable = false;
    if (m.id === 'm-1' && loggedUser.lastUpdateDate === new Date().toISOString().split('T')[0]) {
      claimable = true;
    }
    if (m.id === 'm-2' && loggedUser.quizTakenToday) {
      claimable = true;
    }

    const div = document.createElement('div');
    div.style.cssText = 'display:flex; justify-content:space-between; align-items:center; background: rgba(255,255,255,0.02); border:1px solid var(--border-color); padding: 15px; border-radius: 8px;';
    
    let btnHtml = `<button class="btn btn-sm btn-outline" disabled style="font-size:11px; padding: 4px 10px;">Chưa Đạt</button>`;
    if (isCompleted) {
      btnHtml = `<span style="color:#10b981; font-weight:bold; font-size:12px;"><i class="fa-solid fa-circle-check"></i> Đã Nhận</span>`;
    } else if (claimable) {
      btnHtml = `<button class="btn btn-sm btn-primary" onclick="claimMission('${m.id}')" style="font-size:11px; padding: 4px 10px; background: #10b981; border-color:#10b981;">Nhận Thưởng</button>`;
    }

    div.innerHTML = `
      <div>
        <h4 style="margin: 0 0 4px 0; font-size: 14px; font-weight: bold; display: flex; align-items: center; gap: 8px;">
          <span class="badge" style="font-size:9.5px; padding: 2px 6px; background: ${m.type === 'daily' ? '#3b82f6' : m.type === 'weekly' ? '#8b5cf6' : '#ec4899'}; color: white;">${m.type.toUpperCase()}</span>
          ${m.title}
        </h4>
        <p style="margin: 0; font-size:12px; color:var(--text-muted);">${m.desc}</p>
        <span style="font-size: 11px; color:#f59e0b; font-weight:bold; display:block; margin-top:4px;"><i class="fa-solid fa-gift"></i> Thưởng: ${m.reward}</span>
      </div>
      <div>
        ${btnHtml}
      </div>
    `;
    container.appendChild(div);
  });
}

window.claimMission = function(missionId) {
  const loggedUser = AppState.users.find(u => u.id === AppState.currentUserId) || AppState.users[0];
  if (!loggedUser.completedMissions) loggedUser.completedMissions = [];
  
  if (loggedUser.completedMissions.includes(missionId)) return;
  
  const m = REWARDS_MISSIONS.find(mission => mission.id === missionId);
  if (!m) return;

  loggedUser.completedMissions.push(missionId);
  loggedUser.points += m.points;
  if (m.spins) loggedUser.spinsCount = (loggedUser.spinsCount || 0) + m.spins;
  if (m.badge && !loggedUser.badges.includes(m.badge)) {
    loggedUser.badges.push(m.badge);
    addNotification('Huy hiệu mới! 🏅', `Chúc mừng bạn đã đạt huy hiệu "${REWARDS_BADGES.find(b => b.id === m.badge)?.name}"`, 'success');
  }

  AppState.sausageLogs.push({
    userId: loggedUser.id,
    text: `Hoàn thành nhiệm vụ: ${m.title}`,
    points: m.points,
    date: new Date().toISOString().split('T')[0]
  });

  saveState();
  showToast(`Đã nhận thành công ${m.reward}!`, 'success');
  renderRewardsView();
};

function renderQuiz() {
  const container = document.getElementById('quiz-container');
  if (!container) return;
  container.innerHTML = '';

  const loggedUser = AppState.users.find(u => u.id === AppState.currentUserId) || AppState.users[0];
  const todayStr = new Date().toISOString().split('T')[0];
  const alreadyTaken = loggedUser.lastQuizTakenDate === todayStr;

  const quizIdx = new Date().getDate() % REWARDS_QUIZZES.length;
  const quiz = REWARDS_QUIZZES[quizIdx];

  if (alreadyTaken) {
    container.innerHTML = `
      <div style="text-align: center; padding: 20px;">
        <i class="fa-solid fa-circle-check" style="font-size:42px; color:#10b981; margin-bottom:12px;"></i>
        <h4 style="font-size:14px; font-weight:bold; margin-bottom:6px;">Bạn đã tham gia Quiz hôm nay!</h4>
        <p style="font-size:12px; color:var(--text-muted); margin-bottom:12px;">Hệ thống câu hỏi sẽ được làm mới vào ngày mai. Hãy tiếp tục duy trì thói quen học tập!</p>
        <div style="background: rgba(255,255,255,0.03); border: 1px dashed var(--border-color); border-radius: 8px; padding: 12px; font-size: 11.5px; text-align: left;">
          <strong>Giải thích đáp án hôm nay:</strong> ${quiz.explanation}
        </div>
      </div>
    `;
    return;
  }

  let optionsHtml = '';
  quiz.options.forEach((opt, idx) => {
    optionsHtml += `
      <label style="display:flex; align-items:center; gap: 8px; background: rgba(255,255,255,0.01); border:1px solid var(--border-color); border-radius: 6px; padding: 10px; cursor:pointer; font-size:12.5px; transition: var(--transition-fast);">
        <input type="radio" name="daily-quiz-option" value="${idx}">
        <span>${opt}</span>
      </label>
    `;
  });

  container.innerHTML = `
    <div style="display:flex; flex-direction:column; gap: 12px;">
      <p style="font-size: 13px; font-weight: bold; margin: 0; line-height: 1.4;">${quiz.question}</p>
      <div style="display:flex; flex-direction:column; gap: 8px; margin-top:6px;">
        ${optionsHtml}
      </div>
      <button class="btn btn-primary btn-sm" id="btn-submit-quiz" onclick="submitQuizAnswer(${quizIdx})" style="margin-top:10px; width:100%; font-weight:bold;">Gửi Câu Trả Lời</button>
    </div>
  `;
}

window.submitQuizAnswer = function(quizIdx) {
  const selectedOpt = document.querySelector('input[name="daily-quiz-option"]:checked');
  if (!selectedOpt) {
    showToast('Vui lòng chọn một phương án trả lời!', 'warning');
    return;
  }

  const selectedAnswer = parseInt(selectedOpt.value);
  const quiz = REWARDS_QUIZZES[quizIdx];
  const loggedUser = AppState.users.find(u => u.id === AppState.currentUserId) || AppState.users[0];

  const todayStr = new Date().toISOString().split('T')[0];
  loggedUser.lastQuizTakenDate = todayStr;
  loggedUser.quizTakenToday = true;

  const correct = selectedAnswer === quiz.correct;
  if (correct) {
    loggedUser.points += 5;
    AppState.sausageLogs.push({
      userId: loggedUser.id,
      text: "Trả lời chính xác Quiz nội bộ hàng ngày",
      points: 5,
      date: todayStr
    });
    showToast('Chính xác! Bạn được cộng +5 điểm xúc xích.', 'success');
  } else {
    showToast('Rất tiếc, câu trả lời chưa chính xác!', 'error');
  }

  saveState();
  renderRewardsView();
};

function renderStoreTab() {
  const grid = document.getElementById('store-products-grid');
  const history = document.getElementById('store-history-list');
  if (!grid || !history) return;

  grid.innerHTML = '';
  history.innerHTML = '';

  const loggedUser = AppState.users.find(u => u.id === AppState.currentUserId) || AppState.users[0];

  // Render products
  REWARDS_STORE_PRODUCTS.forEach(p => {
    const card = document.createElement('div');
    card.className = 'store-product-card';
    card.innerHTML = `
      <div style="text-align: center;">
        <i class="fa-solid ${p.icon}" style="font-size:28px; color:var(--color-primary); margin-bottom:8px; display:block;"></i>
        <h4 style="margin: 0; font-size:13.5px; font-weight:bold;">${p.name}</h4>
        <p style="margin:4px 0 0 0; font-size:11px; color:var(--text-muted); line-height: 1.3;">${p.desc}</p>
      </div>
      <div>
        <div class="store-product-points">${p.points} <i class="fa-solid fa-hotdog" style="font-size:11px;"></i></div>
        <button class="btn btn-sm btn-primary" onclick="redeemProduct('${p.id}')" style="width:100%; font-size:11px; font-weight:bold; border-radius: 4px;">Đổi Quà</button>
      </div>
    `;
    grid.appendChild(card);
  });

  // Render redemption history logs (Negative points in logs)
  const redeemLogs = AppState.sausageLogs.filter(l => l.points < 0 && l.userId === loggedUser.id);
  if (redeemLogs.length === 0) {
    history.innerHTML = `<div class="empty-state" style="text-align:center; padding: 20px 0; color:var(--text-muted); font-style:italic; font-size:12px;">Bạn chưa thực hiện giao dịch đổi quà nào.</div>`;
    return;
  }

  redeemLogs.sort((a,b) => new Date(b.date) - new Date(a.date)).forEach(l => {
    const div = document.createElement('div');
    div.style.cssText = 'display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.02); border:1px solid var(--border-color); padding: 8px 12px; border-radius: 6px; font-size:12px;';
    div.innerHTML = `
      <div>
        <span style="font-weight:bold; color:#10b981;">Thành công</span>
        <div style="font-size:11.5px; margin-top:2px;">${l.text}</div>
        <div style="font-size:10px; color:var(--text-muted); margin-top:2px;">${l.date}</div>
      </div>
      <span style="font-weight:bold; color:#ef4444;">${l.points} <i class="fa-solid fa-hotdog" style="font-size:10px;"></i></span>
    `;
    history.appendChild(div);
  });
}

window.redeemProduct = function(productId) {
  const p = REWARDS_STORE_PRODUCTS.find(product => product.id === productId);
  if (!p) return;

  const loggedUser = AppState.users.find(u => u.id === AppState.currentUserId) || AppState.users[0];
  if (loggedUser.points < p.points) {
    showToast(`Không đủ điểm! Bạn cần tích lũy thêm ${p.points - loggedUser.points} xúc xích để đổi quà này.`, 'error');
    return;
  }

  // Deduct points and log
  loggedUser.points -= p.points;
  AppState.sausageLogs.push({
    userId: loggedUser.id,
    text: `Đổi thưởng: ${p.name}`,
    points: -p.points,
    date: new Date().toISOString().split('T')[0]
  });

  saveState();
  showToast(`Đổi quà thành công: ${p.name}. Vui lòng liên hệ Admin để nhận quà!`, 'success');
  renderRewardsView();
};

function renderGamesTab() {
  const loggedUser = AppState.users.find(u => u.id === AppState.currentUserId) || AppState.users[0];
  
  // Render Cây Tiến Lên Title & Progress
  const treeTitle = document.getElementById('progress-tree-level-title');
  const treeBar = document.getElementById('progress-tree-bar');
  const treeText = document.getElementById('progress-tree-percent-text');
  
  const levelNames = ['Hạt Mầm Thử Thách', 'Chồi Non Chăm Chỉ', 'Cây Con Cố Gắng', 'Cây Lớn Vững Vàng', 'Cây Cổ Thụ Forward'];
  const treeLevel = loggedUser.treeLevel || 1;
  const treeProgress = loggedUser.treeProgress || 0;
  
  if (treeTitle) treeTitle.innerText = `Cây Tiến Lên: ${levelNames[treeLevel - 1] || 'Cây Con'} (Cấp ${treeLevel})`;
  if (treeBar) treeBar.style.width = `${treeProgress}%`;
  if (treeText) treeText.innerText = `Tiến trình tới cấp kế tiếp: ${treeProgress}%`;

  // Draw tree graphic
  const treeContainer = document.getElementById('progress-tree-graphic-container');
  if (treeContainer) {
    let html = `<div class="tree-pot-graphic"></div>`;
    const trunkHeight = 15 + treeLevel * 12;
    html += `<div class="tree-trunk" style="height: ${trunkHeight}px;"></div>`;
    const foliageSize = 25 + treeLevel * 10;
    const foliageBottom = 10 + trunkHeight - 8;
    html += `<div class="tree-foliage" style="width: ${foliageSize}px; height: ${foliageSize}px; bottom: ${foliageBottom}px;"></div>`;
    html += `<div style="position: absolute; bottom: 5px; right: 5px; background: #10b981; color: white; font-size: 9px; padding: 2px 5px; border-radius: 4px; font-weight: bold;">Cấp ${treeLevel}</div>`;
    treeContainer.innerHTML = html;
  }

  // Render Badges grid
  const badgesContainer = document.getElementById('badges-grid-container');
  if (badgesContainer) {
    badgesContainer.innerHTML = '';
    REWARDS_BADGES.forEach(b => {
      const unlocked = loggedUser.badges && loggedUser.badges.includes(b.id);
      const card = document.createElement('div');
      card.className = `badge-item-card ${unlocked ? 'unlocked' : 'locked'}`;
      card.style.cssText = `background: ${unlocked ? 'rgba(16, 185, 129, 0.04)' : 'rgba(255,255,255,0.01)'}; border:1px solid ${unlocked ? 'rgba(16, 185, 129, 0.25)' : 'var(--border-color)'}; border-radius:8px; padding:12px; text-align:center; opacity: ${unlocked ? '1' : '0.3'}; filter: ${unlocked ? 'none' : 'grayscale(100%)'}; transition: all 0.2s ease;`;
      
      card.innerHTML = `
        <i class="fa-solid ${b.icon}" style="font-size:24px; color:${unlocked ? b.color : 'var(--text-muted)'}; margin-bottom:6px; display:block;"></i>
        <h5 style="margin:0; font-size:11.5px; font-weight:bold; color:${unlocked ? 'white' : 'var(--text-muted)'};">${b.name}</h5>
        <p style="margin:4px 0 0 0; font-size:9.5px; color:var(--text-muted); line-height:1.2;">${b.desc}</p>
      `;
      badgesContainer.appendChild(card);
    });
  }

  // Render Lucky Spin
  const spinsText = document.getElementById('lucky-spins-count-text');
  if (spinsText) {
    spinsText.innerText = `Số lượt quay khả dụng: ${loggedUser.spinsCount || 0} lượt`;
  }
  
  const btnSpin = document.getElementById('btn-spin-wheel');
  if (btnSpin) {
    btnSpin.onclick = () => spinLuckyWheel();
    btnSpin.disabled = (loggedUser.spinsCount || 0) <= 0;
  }
  
  drawLuckyWheel();

  // Render Secret Box status and button
  const boxStatus = document.getElementById('secret-gift-box-status');
  const btnOpenBox = document.getElementById('btn-open-gift-box');
  const boxIcon = document.getElementById('secret-gift-box-icon');
  
  const claimableCount = Math.floor(loggedUser.points / 100);
  const openedCount = loggedUser.openedGiftBoxes || 0;
  const boxesAvailable = claimableCount - openedCount;

  if (boxesAvailable > 0) {
    if (boxStatus) boxStatus.innerText = `Chúc mừng! Bạn có ${boxesAvailable} hộp quà bí mật chưa mở!`;
    if (btnOpenBox) {
      btnOpenBox.style.display = 'inline-block';
      btnOpenBox.onclick = () => openSecretGiftBox();
    }
    if (boxIcon) boxIcon.className = 'pulse-gift';
  } else {
    const nextPoints = 100 - (loggedUser.points % 100);
    if (boxStatus) boxStatus.innerText = `Tích lũy thêm ${nextPoints} điểm nữa để nhận hộp quà bí mật tiếp theo.`;
    if (btnOpenBox) btnOpenBox.style.display = 'none';
    if (boxIcon) boxIcon.className = '';
  }
}

function drawLuckyWheel() {
  const canvas = document.getElementById('lucky-wheel-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  const sectors = ["+5 Điểm", "+10 Điểm", "Ly trà sữa", "+20 Điểm", "Mất lượt", "+1 Lượt", "Huy hiệu", "+15 Điểm"];
  const colors = ["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#14b8a6", "#6b7280"];
  
  const numSectors = sectors.length;
  const arc = Math.PI * 2 / numSectors;
  
  ctx.clearRect(0, 0, 180, 180);
  
  for (let i = 0; i < numSectors; i++) {
    const angle = i * arc;
    ctx.fillStyle = colors[i];
    ctx.beginPath();
    ctx.moveTo(90, 90);
    ctx.arc(90, 90, 86, angle, angle + arc);
    ctx.lineTo(90, 90);
    ctx.fill();
    
    // Text
    ctx.save();
    ctx.translate(90, 90);
    ctx.rotate(angle + arc / 2);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 8.5px Arial";
    ctx.textAlign = "right";
    ctx.fillText(sectors[i], 80, 3);
    ctx.restore();
  }
}

function spinLuckyWheel() {
  const loggedUser = AppState.users.find(u => u.id === AppState.currentUserId) || AppState.users[0];
  if ((loggedUser.spinsCount || 0) <= 0) {
    showToast('Bạn không còn lượt quay nào!', 'error');
    return;
  }

  const canvas = document.getElementById('lucky-wheel-canvas');
  const btnSpin = document.getElementById('btn-spin-wheel');
  if (!canvas || !btnSpin) return;

  btnSpin.disabled = true;
  loggedUser.spinsCount--;

  // Pick prize randomly
  const prizeIndex = Math.floor(Math.random() * 8);
  const degrees = 1800 + (360 - (prizeIndex * 45) - 22.5);
  
  canvas.style.transform = `rotate(${degrees}deg)`;

  setTimeout(() => {
    // Reset transform transition and style
    canvas.style.transition = 'none';
    canvas.style.transform = `rotate(${degrees % 360}deg)`;
    setTimeout(() => {
      canvas.style.transition = 'transform 4s cubic-bezier(0.15, 0.9, 0.25, 1)';
    }, 50);

    const prizeTexts = ["+5 Điểm cá nhân", "+10 Điểm cá nhân", "Ly trà sữa miễn phí", "+20 Điểm cá nhân", "Chúc bạn may mắn lần sau", "+1 Lượt quay mới", "Huy hiệu ngẫu nhiên", "+15 Điểm cá nhân"];
    const pointsPrizes = [5, 10, 0, 20, 0, 0, 0, 15];

    const prizeText = prizeTexts[prizeIndex];
    const pts = pointsPrizes[prizeIndex];

    if (pts > 0) {
      loggedUser.points += pts;
      AppState.sausageLogs.push({
        userId: loggedUser.id,
        text: `Quay thưởng: ${prizeText}`,
        points: pts,
        date: new Date().toISOString().split('T')[0]
      });
    } else if (prizeIndex === 5) { // +1 Spin
      loggedUser.spinsCount++;
    } else if (prizeIndex === 6) { // Random Badge
      const unearned = REWARDS_BADGES.filter(b => !loggedUser.badges.includes(b.id));
      if (unearned.length > 0) {
        const newBadge = unearned[Math.floor(Math.random() * unearned.length)];
        loggedUser.badges.push(newBadge.id);
        addNotification('Huy hiệu mới! 🏅', `Chúc mừng bạn đã quay trúng huy hiệu "${newBadge.name}"`, 'success');
      }
    }

    saveState();
    showToast(`Kết quả vòng quay: Bạn đã trúng "${prizeText}"!`, 'success');
    btnSpin.disabled = false;
    renderRewardsView();
  }, 4000);
}

function openSecretGiftBox() {
  const loggedUser = AppState.users.find(u => u.id === AppState.currentUserId) || AppState.users[0];
  const claimableCount = Math.floor(loggedUser.points / 100);
  const openedCount = loggedUser.openedGiftBoxes || 0;
  const boxesAvailable = claimableCount - openedCount;

  if (boxesAvailable <= 0) return;

  loggedUser.openedGiftBoxes = openedCount + 1;

  // Pick random box prize
  const prizeOptions = [
    { text: 'Thêm +10 Xúc xích cá nhân', points: 10 },
    { text: 'Thêm +20 Xúc xích cá nhân', points: 20 },
    { text: 'Thêm +1 Lượt quay Vòng quay may mắn', points: 0, spin: 1 }
  ];
  const prize = prizeOptions[Math.floor(Math.random() * prizeOptions.length)];

  if (prize.points > 0) {
    loggedUser.points += prize.points;
    AppState.sausageLogs.push({
      userId: loggedUser.id,
      text: `Mở hộp quà bí mật: ${prize.text}`,
      points: prize.points,
      date: new Date().toISOString().split('T')[0]
    });
  }
  if (prize.spin) {
    loggedUser.spinsCount = (loggedUser.spinsCount || 0) + 1;
  }

  saveState();
  showToast(`Mở hộp quà thành công: ${prize.text}!`, 'success');
  renderRewardsView();
}

// ==================== TOAST & NOTIFICATION SYSTEM ==================== //
function initNotificationSystem() {
  const bell = document.getElementById('notification-bell');
  const dropdown = document.getElementById('notification-dropdown');
  const clearBtn = document.getElementById('clear-notifications');

  bell.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.classList.toggle('active');
  });

  document.addEventListener('click', () => {
    dropdown.classList.remove('active');
  });

  dropdown.addEventListener('click', (e) => {
    e.stopPropagation();
  });

  clearBtn.addEventListener('click', () => {
    AppState.notifications = [];
    saveState();
    renderNotifications();
    showToast('Đã xóa tất cả thông báo.', 'info');
  });

  renderNotifications();
}

function renderNotifications() {
  const badge = document.getElementById('bell-badge');
  const list = document.getElementById('notification-list');
  list.innerHTML = '';

  const unreadCount = AppState.notifications.filter(n => !n.read).length;
  if (unreadCount > 0) {
    badge.innerText = unreadCount;
    badge.style.display = 'flex';
  } else {
    badge.style.display = 'none';
  }

  if (AppState.notifications.length === 0) {
    list.innerHTML = `<div class="empty-state">Không có thông báo mới.</div>`;
    return;
  }

  // Sort descending
  const sorted = [...AppState.notifications].reverse();

  sorted.forEach(n => {
    const item = document.createElement('div');
    item.className = `notification-item ${n.read ? '' : 'unread'}`;
    item.innerHTML = `
      <p><strong>${n.title}</strong>: ${n.text}</p>
      <span class="notification-time">${n.time}</span>
    `;
    
    // Mark as read when clicking the item
    item.addEventListener('click', () => {
      n.read = true;
      saveState();
      renderNotifications();
    });

    list.appendChild(item);
  });
}

function addNotification(title, text, type = 'info') {
  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
  
  const notif = {
    id: `notif-${Date.now()}`,
    title,
    text,
    read: false,
    time: dateStr
  };
  
  AppState.notifications.push(notif);
  saveState();
  renderNotifications();
  showToast(`${title}: ${text}`, type);
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  let icon = 'fa-info-circle';
  if (type === 'success') icon = 'fa-circle-check';
  else if (type === 'warning') icon = 'fa-triangle-exclamation';
  else if (type === 'danger') icon = 'fa-circle-xmark';

  toast.innerHTML = `
    <i class="fa-solid ${icon} toast-icon"></i>
    <span class="toast-message">${message}</span>
  `;

  container.appendChild(toast);
  
  // Trigger animation
  setTimeout(() => {
    toast.classList.add('active');
  }, 10);

  // Auto remove
  setTimeout(() => {
    toast.classList.remove('active');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 4000);
}

// ==================== MODAL HELPERS ==================== //
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
  }
}

// Global modal helpers for ESC key and click backdrop to close
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const activeModals = document.querySelectorAll('.modal.active');
    activeModals.forEach(m => closeModal(m.id));
  }
});

window.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal')) {
    closeModal(e.target.id);
  }
});

// ==================== FORMAT HELPERS ==================== //
function formatVnd(val) {
  if (val === null || val === undefined || isNaN(val)) return '0 đ';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
}

function formatRmb(val) {
  if (val === null || val === undefined || isNaN(val)) return '¥0';
  return '¥' + new Intl.NumberFormat('zh-CN', { minimumFractionDigits: 0 }).format(val);
}

// ==================== DASHBOARD STATS DRILLDOWN ==================== //
function openLeadsListModal(type) {
  const modal = document.getElementById('modal-leads-list');
  const titleEl = document.getElementById('leads-list-modal-title');
  const bodyEl = document.getElementById('leads-list-modal-body');
  const thExtra = document.getElementById('leads-list-modal-th-extra');

  if (!modal || !titleEl || !bodyEl || !thExtra) return;

  // Filter leads
  let filtered = [];
  let titleText = '';
  
  if (type === 'all') {
    filtered = AppState.leads;
    titleText = 'Danh Sách Khách Hàng Tiềm Năng (Tất cả)';
    thExtra.innerText = 'Ghi chú / Nhu cầu';
  } else if (type === 'success') {
    filtered = AppState.leads.filter(l => l.stage === 'success');
    titleText = 'Danh Sách Đơn Hàng Thành Công';
    thExtra.innerText = 'Ghi chú đơn hàng';
  } else if (type === 'failed') {
    filtered = AppState.leads.filter(l => l.stage === 'failed');
    titleText = 'Danh Sách Khách Hàng Thất Bại';
    thExtra.innerText = 'Lý do thất bại';
  }

  titleEl.innerText = `${titleText} (${filtered.length})`;
  bodyEl.innerHTML = '';

  if (filtered.length === 0) {
    bodyEl.innerHTML = `<tr><td colspan="6" class="text-center" style="padding: 20px; color: var(--text-muted);">Không có dữ liệu khách hàng.</td></tr>`;
    openModal('modal-leads-list');
    return;
  }

  filtered.forEach(lead => {
    const salesUser = AppState.users.find(u => u.id === lead.salesId);
    const salesName = salesUser ? salesUser.name : 'Chưa giao';

    // Format money
    const valRmbStr = lead.valRmb > 0 ? formatRmb(lead.valRmb) : '';
    const valVndStr = lead.valVnd > 0 ? formatVnd(lead.valVnd) : '';
    const valDisplay = [valRmbStr, valVndStr].filter(Boolean).join(' / ') || 'Chưa định giá';

    // Extra Column text
    let extraText = '';
    if (type === 'failed') {
      extraText = `<span class="text-rose" style="font-weight:600;"><i class="fa-solid fa-circle-xmark"></i> ${lead.failReason || 'Không rõ lý do'}</span>`;
    } else {
      extraText = lead.note || 'Không có ghi chú.';
    }

    const tr = document.createElement('tr');
    tr.style.cursor = 'pointer';
    tr.title = 'Click để xem chi tiết';
    tr.innerHTML = `
      <td><strong>${lead.name}</strong></td>
      <td>
        <div>${lead.phone || 'Chưa có SĐT'}</div>
        <div style="font-size: 11px; color: var(--text-secondary);">${lead.source || 'Fanpage'}</div>
      </td>
      <td>${salesName}</td>
      <td class="text-gold" style="font-weight:600;">${valDisplay}</td>
      <td><span style="font-size:11px; color:var(--text-muted);">${lead.date}</span></td>
      <td style="font-size:12px; max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${lead.failReason || lead.note || ''}">${extraText}</td>
    `;

    // Row click: Close current modal and open the standard lead detail/edit modal
    tr.addEventListener('click', () => {
      closeModal('modal-leads-list');
      setTimeout(() => {
        // Defined in crm.js
        openLeadDetailModal(lead.id);
      }, 250);
    });

    bodyEl.appendChild(tr);
  });

  openModal('modal-leads-list');
}

function initStaffManagement() {
  const formAddUser = document.getElementById('form-add-user');
  if (formAddUser) {
    formAddUser.onsubmit = async (e) => {
      e.preventDefault();
      const name = document.getElementById('new-user-name').value.trim();
      const u = document.getElementById('new-user-username').value.trim();
      const p = document.getElementById('new-user-password').value.trim();
      const r = document.getElementById('new-user-role').value;

      try {
        const res = await fetch(getApiUrl('/api/users'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, username: u, password: p, role: r })
        });
        const result = await res.json();
        if (result.success) {
          showToast('Đã tạo tài khoản nhân viên thành công!', 'success');
          formAddUser.reset();
          await syncLoadState();
          renderStaffManagementTable();
          initRoleSwitcher();
        } else {
          showToast(result.message || 'Lỗi khi tạo tài khoản!', 'error');
        }
      } catch (err) {
        showToast('Không thể kết nối đến máy chủ!', 'error');
      }
    };
  }
}

function renderStaffManagementTable() {
  const tbody = document.getElementById('staff-table-body');
  if (!tbody) return;
  tbody.innerHTML = '';

  const roleLabels = { admin: 'Admin', manager: 'Quản lý', staff: 'Nhân viên' };
  const sessionUser = JSON.parse(localStorage.getItem('minhhai_user') || '{}');

  AppState.users.forEach(u => {
    const tr = document.createElement('tr');
    
    const isSelf = u.id === sessionUser.id;
    const isSupremeAdmin = u.id === 'usr-1';
    
    // Only admins can delete, and they cannot delete themselves or the supreme admin
    const deleteBtnHtml = (isSelf || isSupremeAdmin)
      ? `<span class="text-muted" style="font-size:11px;">Mặc định</span>`
      : `<button class="btn btn-outline btn-xs btn-delete-user" data-id="${u.id}" style="color:var(--color-error); border-color:var(--color-error);"><i class="fa-solid fa-trash-can"></i> Xóa</button>`;

    // Only admin role (specifically hoangminh and other admins) can edit other accounts
    const isAdminUser = sessionUser.role === 'admin';
    const editBtnHtml = isAdminUser
      ? `<button class="btn btn-outline btn-xs btn-edit-user-details" data-id="${u.id}" style="color:var(--color-primary); border-color:var(--color-primary); margin-right:6px;"><i class="fa-solid fa-user-pen"></i> Sửa</button>`
      : '';

    const contactHtml = (u.phone || u.email)
      ? `<div style="font-size:10.5px; color:var(--text-muted); margin-top:2px; display:flex; gap:8px;">
          ${u.phone ? `<span><i class="fa-solid fa-phone" style="font-size:9.5px;"></i> ${u.phone}</span>` : ''}
          ${u.email ? `<span><i class="fa-solid fa-envelope" style="font-size:9.5px;"></i> ${u.email}</span>` : ''}
         </div>`
      : '';

    const bankHtml = u.bankAccount
      ? `<div style="font-size:10.5px; color:var(--color-primary); margin-top:2px;">
          <i class="fa-solid fa-credit-card" style="font-size:9.5px;"></i> ${u.bankName || 'NH'}: <strong>${u.bankAccount}</strong> ${u.bankAccountName ? `(${u.bankAccountName})` : ''}
         </div>`
      : '';

    tr.innerHTML = `
      <td>
        <div style="display:flex; align-items:center; gap:12px;">
          <div class="user-avatar" style="width:42px; height:42px; font-size:16px; overflow:hidden; display:flex; align-items:center; justify-content:center; flex-shrink:0;">${window.getUserAvatarInnerHtml(u.avatar)}</div>
          <div>
            <strong>${u.name}</strong>
            ${contactHtml}
            ${bankHtml}
          </div>
        </div>
      </td>
      <td><code>${u.username || ''}</code></td>
      <td><span class="role-badge badge-${u.role}">${roleLabels[u.role] || u.role}</span></td>
      <td class="text-center"><strong>${u.points}</strong> <i class="fa-solid fa-hotdog" style="color:var(--color-primary); font-size:11px;"></i></td>
      <td class="text-center" style="white-space:nowrap;">${editBtnHtml}${deleteBtnHtml}</td>
    `;
    
    tbody.appendChild(tr);
  });

  tbody.querySelectorAll('.btn-delete-user').forEach(btn => {
    btn.onclick = async (e) => {
      const userId = e.currentTarget.getAttribute('data-id');
      if (!confirm('Bạn có chắc chắn muốn xóa nhân viên này khỏi hệ thống không?')) {
        return;
      }
      try {
        const res = await fetch(getApiUrl(`/api/users/${userId}`), { method: 'DELETE' });
        const result = await res.json();
        if (result.success) {
          showToast('Đã xóa tài khoản nhân viên!', 'success');
          await syncLoadState();
          renderStaffManagementTable();
          initRoleSwitcher();
        } else {
          showToast(result.message || 'Lỗi khi xóa nhân viên!', 'error');
        }
      } catch (err) {
        showToast('Không thể kết nối đến máy chủ!', 'error');
      }
    };
  });

  tbody.querySelectorAll('.btn-edit-user-details').forEach(btn => {
    btn.onclick = (e) => {
      const userId = e.currentTarget.getAttribute('data-id');
      const targetUser = AppState.users.find(u => u.id === userId);
      if (!targetUser) return;

      document.getElementById('admin-edit-user-id').value = targetUser.id;
      document.getElementById('admin-edit-user-name').value = targetUser.name || '';
      document.getElementById('admin-edit-user-role').value = targetUser.role || 'staff';
      document.getElementById('admin-edit-user-password').value = targetUser.password || '';
      document.getElementById('admin-edit-user-phone').value = targetUser.phone || '';
      document.getElementById('admin-edit-user-email').value = targetUser.email || '';
      document.getElementById('admin-edit-user-bank-name').value = targetUser.bankName || '';
      document.getElementById('admin-edit-user-bank-account').value = targetUser.bankAccount || '';
      document.getElementById('admin-edit-user-bank-account-name').value = targetUser.bankAccountName || '';

      openModal('modal-admin-edit-user');
    };
  });
}

function updateMyTasksBadge() {
  const badge = document.getElementById('my-tasks-badge');
  if (!badge) return;

  const loggedUser = JSON.parse(localStorage.getItem('minhhai_user') || '{}');
  const userId = AppState.currentUserId || loggedUser.id || 'usr-admin';

  // 1. Shipment steps owned by the user
  let flowsCount = 0;
  if (AppState.shipment_workflows) {
    AppState.shipment_workflows.forEach(flow => {
      const stepData = flow.steps.find(s => s.stepNum === flow.stage);
      if (stepData && stepData.assigneeId === userId && stepData.status !== 'done') {
        flowsCount++;
      }
    });
  }

  // 2. Single tasks and project tasks owned by the user
  let singleCount = 0;
  if (AppState.single_tasks) {
    singleCount = AppState.single_tasks.filter(t => t.assigneeId === userId && t.status !== 'completed' && t.status !== 'canceled').length;
  }

  // 3. CRM leads owned by the user
  let crmLeadsCount = 0;
  if (AppState.leads) {
    crmLeadsCount = AppState.leads.filter(l => l.salesId === userId && l.stage !== 'success' && l.stage !== 'failed').length;
  }

  // 4. CRM tasks owned by the user
  let crmTasksCount = 0;
  if (AppState.tasks) {
    crmTasksCount = AppState.tasks.filter(t => t.assigneeId === userId && t.status !== 'completed' && t.status !== 'canceled').length;
  }

  const totalPending = flowsCount + singleCount + crmLeadsCount + crmTasksCount;

  if (totalPending > 0) {
    badge.innerText = totalPending;
    badge.style.display = 'inline-block';
  } else {
    badge.style.display = 'none';
  }
}

function renderStaffDashboard(user) {
  const userId = user.id;

  // 1. Sausage Points
  const pointsEl = document.getElementById('staff-stat-points');
  if (pointsEl) pointsEl.innerText = user.points;

  // 2. Compute Rank
  const rankEl = document.getElementById('staff-stat-rank');
  if (rankEl) {
    const sortedUsers = [...AppState.users].sort((a,b) => b.points - a.points);
    const myRank = sortedUsers.findIndex(u => u.id === userId) + 1;
    rankEl.innerHTML = `<i class="fa-solid fa-trophy"></i> Hạng ${myRank} trên ${sortedUsers.length} thành viên`;
  }

  // 3. Active Shipment Workflows
  let myFlowsCount = 0;
  if (AppState.shipment_workflows) {
    AppState.shipment_workflows.forEach(flow => {
      const stepData = flow.steps.find(s => s.stepNum === flow.stage);
      if (stepData && stepData.assigneeId === userId && stepData.status !== 'done') {
        myFlowsCount++;
      }
    });
  }
  const flowsEl = document.getElementById('staff-stat-flows');
  if (flowsEl) flowsEl.innerText = myFlowsCount;

  // 4. Single tasks
  let myActiveTasks = 0;
  let myCompletedTasks = 0;
  if (AppState.single_tasks) {
    const myTasks = AppState.single_tasks.filter(t => t.assigneeId === userId);
    myActiveTasks = myTasks.filter(t => t.status !== 'completed' && t.status !== 'canceled').length;
    myCompletedTasks = myTasks.filter(t => t.status === 'completed').length;
  }
  if (AppState.tasks) {
    const myCrmTasks = AppState.tasks.filter(t => t.assigneeId === userId);
    myActiveTasks += myCrmTasks.filter(t => t.status !== 'completed' && t.status !== 'canceled').length;
    myCompletedTasks += myCrmTasks.filter(t => t.status === 'completed').length;
  }
  const tasksEl = document.getElementById('staff-stat-tasks');
  if (tasksEl) tasksEl.innerText = myActiveTasks;
  const compTasksEl = document.getElementById('staff-stat-tasks-completed');
  if (compTasksEl) compTasksEl.innerHTML = `<i class="fa-solid fa-circle-check"></i> Đã hoàn thành ${myCompletedTasks} việc`;

  // 5. Render personal sausage logs
  const logsContainer = document.getElementById('staff-sausage-logs');
  if (logsContainer) {
    logsContainer.innerHTML = '';
    const myLogs = (AppState.sausageLogs || []).filter(log => {
      return log.msg && log.msg.toLowerCase().includes(user.name.toLowerCase());
    }).slice(-10).reverse(); // top 10 recent

    if (myLogs.length === 0) {
      logsContainer.innerHTML = `<span class="text-muted" style="font-size:11.5px; font-style:italic;">Chưa có lịch sử tích lũy điểm thưởng.</span>`;
    } else {
      myLogs.forEach(log => {
        const item = document.createElement('div');
        item.className = 'mini-task-item';
        item.style.cssText = 'padding: 8px; border-bottom: 1px solid var(--border-color); font-size: 11.5px;';
        item.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span>${log.msg}</span>
            <span style="font-size: 10px; color: var(--text-muted);">${log.time || ''}</span>
          </div>
        `;
        logsContainer.appendChild(item);
      });
    }
  }

  // 6. Render urgent & upcoming tasks
  const urgentContainer = document.getElementById('staff-urgent-tasks');
  if (urgentContainer) {
    urgentContainer.innerHTML = '';
    const urgentList = [];

    if (AppState.shipment_workflows) {
      AppState.shipment_workflows.forEach(flow => {
        const stepData = flow.steps.find(s => s.stepNum === flow.stage);
        if (stepData && stepData.assigneeId === userId && stepData.status !== 'done') {
          urgentList.push({
            id: flow.id,
            title: `Lô hàng: ${flow.name} (Khâu: ${flow.stage})`,
            deadline: flow.deadline,
            type: 'flow'
          });
        }
      });
    }

    if (AppState.single_tasks) {
      AppState.single_tasks.forEach(t => {
        if (t.assigneeId === userId && t.status !== 'completed' && t.status !== 'canceled') {
          urgentList.push({
            id: t.id,
            title: `Việc đơn lẻ: ${t.title}`,
            deadline: t.deadline,
            type: 'single'
          });
        }
      });
    }

    if (AppState.tasks) {
      AppState.tasks.forEach(t => {
        if (t.assigneeId === userId && t.status !== 'completed' && t.status !== 'canceled') {
          urgentList.push({
            id: t.id,
            title: `CRM Task: ${t.title}`,
            deadline: t.deadline,
            type: 'crm_task'
          });
        }
      });
    }

    urgentList.sort((a, b) => {
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return new Date(a.deadline) - new Date(b.deadline);
    });

    const displayList = urgentList.slice(0, 5);
    if (displayList.length === 0) {
      urgentContainer.innerHTML = `<span class="text-muted" style="font-size:11.5px; font-style:italic;">Tuyệt vời! Bạn không có việc nào cận hạn hay quá hạn.</span>`;
    } else {
      displayList.forEach(item => {
        const isOverdue = item.deadline && new Date(item.deadline) < new Date();
        const div = document.createElement('div');
        div.className = 'mini-task-item';
        div.style.cssText = 'padding: 8px; border-bottom: 1px solid var(--border-color); font-size: 11.5px; display:flex; justify-content:space-between; align-items:center; cursor:pointer;';
        div.innerHTML = `
          <div>
            <strong style="color: ${item.type === 'flow' ? '#3b82f6' : (item.type === 'single' ? '#f59e0b' : '#a855f7')};">[${item.type.toUpperCase()}]</strong> ${item.title}
          </div>
          <span style="font-size: 10px; padding: 2px 6px; border-radius: 4px; background: ${isOverdue ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.05)'}; color: ${isOverdue ? '#ef4444' : 'var(--text-muted)'};">
            ${item.deadline || 'Hạn chót: -'}
          </span>
        `;
        div.onclick = () => {
          if (item.type === 'flow') {
            if (typeof openFlowDetailModal === 'function') openFlowDetailModal(item.id);
          } else if (item.type === 'single') {
            if (typeof openOpsTaskDetail === 'function') openOpsTaskDetail(item.id);
          } else {
            window.location.hash = 'tasks';
          }
        };
        urgentContainer.appendChild(div);
      });
    }
  }
}

window.updateStreakOnActivity = function(userId) {
  const user = AppState.users.find(u => u.id === userId);
  if (!user) return;
  
  const todayStr = new Date().toISOString().split('T')[0];
  if (user.lastUpdateDate === todayStr) return; // Already updated today
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  
  if (user.lastUpdateDate === yesterdayStr) {
    user.streakDays = (user.streakDays || 0) + 1;
  } else {
    user.streakDays = 1;
  }
  
  user.lastUpdateDate = todayStr;
  
  // Award for 5 days streak
  if (user.streakDays === 5) {
    user.points = (user.points || 0) + 10;
    user.spinsCount = (user.spinsCount || 0) + 1;
    AppState.sausageLogs.push({
      userId: user.id,
      text: "Duy trì 5 ngày liên tiếp cập nhật công việc",
      points: 10,
      date: todayStr
    });
    addNotification('Chuỗi hoạt động 5 ngày! 🔥', `${user.name} nhận thêm +10 điểm & +1 lượt quay.`, 'success');
  }
};

window.awardPointsForCompletedTask = function(task) {
  if (!task || task.status !== 'completed') return;
  const assignee = AppState.users.find(u => u.id === task.assigneeId);
  if (!assignee) return;
  
  const loggedUserId = AppState.currentUserId;
  if (assignee.id === loggedUserId) {
    showToast("Đã hoàn tất công việc cá nhân! Đang chờ Quản lý duyệt điểm.", "info");
    return;
  }
  
  let pts = task.priority === 'high' ? 10 : 5;
  const now = new Date();
  if (task.deadline && new Date(task.deadline) > now) {
    pts += 2; // перед сроком
  }
  
  assignee.points = (assignee.points || 0) + pts;
  
  // Update tree progress
  assignee.treeProgress = (assignee.treeProgress || 0) + (task.priority === 'high' ? 15 : 10);
  if (assignee.treeProgress >= 100) {
    assignee.treeProgress = assignee.treeProgress % 100;
    assignee.treeLevel = Math.min((assignee.treeLevel || 1) + 1, 5);
    addNotification('Cây Tiến Lên tiến hóa! 🌳', `Chúc mừng ${assignee.name} đã nuôi dưỡng Cây Tiến Lên lên Cấp ${assignee.treeLevel}!`, 'success');
  }
  
  // Update team points
  assignee.teamPoints = (assignee.teamPoints || 0) + Math.round(pts * 0.3);
  
  AppState.sausageLogs.push({
    userId: assignee.id,
    text: `Được phê duyệt hoàn thành công việc: ${task.title}`,
    points: pts,
    date: new Date().toISOString().split('T')[0]
  });
  
  showToast(`Đã duyệt hoàn thành! Cộng +${pts} điểm cho ${assignee.name}.`, 'success');
};


// ==================== CUSTOMER HEALTH REPORT SYSTEM ==================== //

let isSyncingHealth = false;
let healthChartInstance = null;
let healthPieChartInstance = null;
let filtersInitialized = false;

window.renderCustomerHealthView = function() {
  initCustomerHealthFilters();
  
  if (!AppState.customerHealthData) {
    window.syncCustomerHealthData();
    return;
  }
  
  const timeEl = document.getElementById('health-last-sync-time');
  if (timeEl) {
    const syncTime = AppState.customerHealthData.lastSyncTime;
    timeEl.innerText = `Cập nhật: ${formatDateTime(syncTime)}`;
  }
  
  displayCustomerHealthMetrics();
};

window.syncCustomerHealthData = function() {
  if (isSyncingHealth) return;
  isSyncingHealth = true;
  
  const btn = document.getElementById('btn-sync-health');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Đang đồng bộ...`;
  }
  
  fetch(getApiUrl('/api/customer-health/sync'))
    .then(res => {
      if (!res.ok) {
        return res.json().then(errData => {
          throw new Error(errData.error || `HTTP error ${res.status}`);
        }).catch(() => {
          throw new Error(`HTTP error ${res.status}`);
        });
      }
      return res.json();
    })
    .then(data => {
      if (!data || data.error || !data.customers) {
        throw new Error(data?.error || 'Dữ liệu không đúng cấu trúc');
      }
      AppState.customerHealthData = data;
      showToast('Đồng bộ dữ liệu sức khỏe thành công!', 'success');
      renderCustomerHealthView();
    })
    .catch(err => {
      console.error(err);
      showToast(`Lỗi đồng bộ: ${err.message || 'Không kết nối được server'}`, 'error');
    })
    .finally(() => {
      isSyncingHealth = false;
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `<i class="fa-solid fa-rotate"></i> Đồng bộ ngay`;
      }
    });
};

function initCustomerHealthFilters() {
  const syncBtn = document.getElementById('btn-sync-health');
  if (syncBtn) {
    syncBtn.onclick = () => window.syncCustomerHealthData();
  }
  
  const searchInput = document.getElementById('health-search-input');
  const statusFilter = document.getElementById('health-filter-status');
  const cskhFilter = document.getElementById('health-filter-cskh');
  
  if (searchInput && !searchInput.oninput) searchInput.oninput = () => filterCustomerHealthTable();
  if (statusFilter && !statusFilter.onchange) statusFilter.onchange = () => filterCustomerHealthTable();
  if (cskhFilter && !cskhFilter.onchange) cskhFilter.onchange = () => filterCustomerHealthTable();
  
  if (filtersInitialized) return;
  
  const cskhSelect = document.getElementById('health-filter-cskh');
  if (cskhSelect && AppState.customerHealthData) {
    filtersInitialized = true;
    cskhSelect.innerHTML = '<option value="">Tất cả CSKH</option>';
    const uniqueCSKH = [...new Set((AppState.customerHealthData.customers || []).map(c => c.cskh).filter(Boolean))];
    uniqueCSKH.forEach(name => {
      const opt = document.createElement('option');
      opt.value = name;
      opt.innerText = name;
      opt.style.background = 'var(--card-bg)';
      cskhSelect.appendChild(opt);
    });
  }
}

function displayCustomerHealthMetrics() {
  const data = AppState.customerHealthData;
  const customers = data.customers || [];
  
  let countHealthy = 0;
  let countWarning = 0;
  let countAttention = 0;
  let countDanger = 0;
  let countLost = 0;
  
  customers.forEach(c => {
    if (c.status === 'healthy') countHealthy++;
    else if (c.status === 'warning') {
      if (c.volumeT7 > 0) countWarning++;
      else countAttention++;
    }
    else if (c.status === 'danger') countDanger++;
    else if (c.status === 'lost') countLost++;
  });
  
  document.getElementById('health-count-healthy').innerText = countHealthy;
  document.getElementById('health-count-warning').innerText = countWarning;
  document.getElementById('health-count-attention').innerText = countAttention;
  document.getElementById('health-count-danger').innerText = countDanger;
  document.getElementById('health-count-lost').innerText = countLost;
  
  filterCustomerHealthTable();
  renderCustomerHealthCharts();
}

function filterCustomerHealthTable() {
  const data = AppState.customerHealthData;
  const customers = data.customers || [];
  
  const query = (document.getElementById('health-search-input')?.value || '').trim().toLowerCase();
  const statusVal = document.getElementById('health-filter-status')?.value || '';
  const cskhVal = document.getElementById('health-filter-cskh')?.value || '';
  
  const tbody = document.getElementById('health-table-body');
  if (!tbody) return;
  tbody.innerHTML = '';
  
  const filtered = customers.filter(c => {
    const matchSearch = !query || c.name.toLowerCase().indexOf(query) >= 0;
    
    let matchStatus = true;
    if (statusVal === 'healthy') matchStatus = c.status === 'healthy';
    else if (statusVal === 'warning') matchStatus = c.status === 'warning';
    else if (statusVal === 'danger') matchStatus = c.status === 'danger';
    else if (statusVal === 'lost') matchStatus = c.status === 'lost';
    
    const matchCSKH = !cskhVal || c.cskh === cskhVal;
    
    return matchSearch && matchStatus && matchCSKH;
  });
  
  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:20px; font-style:italic; color:var(--text-muted);">Không tìm thấy khách hàng phù hợp.</td></tr>`;
    return;
  }
  
  const statusLabelMap = {
    healthy: '<span class="badge bg-emerald" style="font-size:9.5px;">🟢 Khỏe mạnh</span>',
    warning: '<span class="badge bg-orange" style="font-size:9.5px;">🟡 Cảnh báo</span>',
    danger: '<span class="badge bg-rose" style="font-size:9.5px;">🔴 Nguy cơ mất</span>',
    lost: '<span class="badge bg-gray" style="font-size:9.5px;">⚫ Đã mất</span>'
  };
  
  filtered.forEach(c => {
    let statusHtml = statusLabelMap[c.status] || c.status;
    if (c.status === 'warning' && c.volumeT7 === 0) {
      statusHtml = '<span class="badge bg-purple" style="font-size:9.5px;">🟣 Cần chú ý</span>';
    }
    
    const tr = document.createElement('tr');
    tr.style.cssText = 'border-bottom: 1px solid var(--border-color);';
    tr.innerHTML = `
      <td style="padding: 10px 5px; font-weight: bold;">${c.name}</td>
      <td style="padding: 10px 5px;">${c.cskh}</td>
      <td style="padding: 10px 5px;"><span style="font-size:10px; padding:2px 6px; border-radius:4px; background:rgba(255,255,255,0.05);">${c.brand}</span></td>
      <td style="padding: 10px 5px; text-align:right; font-weight:500;">${formatVND(c.volumeT5)}</td>
      <td style="padding: 10px 5px; text-align:right; font-weight:500;">${formatVND(c.volumeT6)}</td>
      <td style="padding: 10px 5px; text-align:right; font-weight:500; color:var(--color-primary);">${formatVND(c.volumeT7)}</td>
      <td style="padding: 10px 5px; color:var(--text-muted);">${c.lastShipmentDate || '-'}</td>
      <td style="padding: 10px 5px; text-align:center;">${statusHtml}</td>
    `;
    tbody.appendChild(tr);
  });
}

function formatVND(val) {
  if (!val) return '0 đ';
  return Math.round(val).toLocaleString('vi-VN') + ' đ';
}

function renderCustomerHealthCharts() {
  const data = AppState.customerHealthData;
  const totals = data.monthlyTotals || {};
  
  const ctx = document.getElementById('health-chart');
  if (ctx) {
    if (healthChartInstance) healthChartInstance.destroy();
    healthChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['T4/2026', 'T5/2026', 'T6/2026', 'T7/2026'],
        datasets: [{
          label: 'Doanh thu (VND)',
          data: [totals.T4 || 0, totals.T5 || 0, totals.T6 || 0, totals.T7 || 0],
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: {
              color: '#9ca3af',
              callback: function(value) {
                return (value / 1e6) + 'M';
              }
            }
          },
          x: {
            grid: { display: false },
            ticks: { color: '#9ca3af' }
          }
        }
      }
    });
  }
  
  const ctxPie = document.getElementById('health-pie-chart');
  if (ctxPie) {
    if (healthPieChartInstance) healthPieChartInstance.destroy();
    
    let countHealthy = 0;
    let countWarning = 0;
    let countAttention = 0;
    let countDanger = 0;
    let countLost = 0;
    
    (data.customers || []).forEach(c => {
      if (c.status === 'healthy') countHealthy++;
      else if (c.status === 'warning') {
        if (c.volumeT7 > 0) countWarning++;
        else countAttention++;
      }
      else if (c.status === 'danger') countDanger++;
      else if (c.status === 'lost') countLost++;
    });
    
    healthPieChartInstance = new Chart(ctxPie, {
      type: 'doughnut',
      data: {
        labels: ['Khỏe mạnh', 'Suy giảm', 'Cần chú ý', 'Nguy cơ mất', 'Đã mất'],
        datasets: [{
          data: [countHealthy, countWarning, countAttention, countDanger, countLost],
          backgroundColor: ['#10b981', '#f59e0b', '#a855f7', '#ef4444', '#6b7280'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              color: '#9ca3af',
              font: { size: 10 }
            }
          }
        }
      }
    });
  }
}
window.toggleNavGroup = function(groupId, forceState) {
  const items = document.getElementById(`nav-group-${groupId}-items`);
  const chevron = document.getElementById(`nav-group-${groupId}-chevron`);
  if (!items) return;
  
  let collapse;
  if (forceState !== undefined) {
    collapse = forceState;
  } else {
    collapse = items.style.display !== 'none';
  }
  
  if (collapse) {
    items.style.display = 'none';
    if (chevron) chevron.style.transform = 'rotate(-90deg)';
    localStorage.setItem(`nav_group_${groupId}_collapsed`, 'true');
  } else {
    items.style.display = 'flex';
    if (chevron) chevron.style.transform = 'rotate(0deg)';
    localStorage.removeItem(`nav_group_${groupId}_collapsed`);
  }
};

// Bind Edit Profile events when page loads
document.addEventListener('DOMContentLoaded', () => {
  // Initialize drag-to-scroll on kanban boards
  document.querySelectorAll('.kanban-board-wrapper').forEach(wrapper => {
    window.initDragToScroll(wrapper);
  });

  // Restore collapsed state
  const isCollapsed = localStorage.getItem('nav_group_settings_collapsed') === 'true';
  if (isCollapsed) {
    window.toggleNavGroup('settings', true);
  }

  const editProfileMenu = document.getElementById('btn-edit-profile-menu');
  if (editProfileMenu) {
    editProfileMenu.onclick = (e) => {
      e.preventDefault();
      
      const user = getCurrentUser();
      if (!user) return;
      
      document.getElementById('edit-profile-name').value = user.name || '';
      document.getElementById('edit-profile-phone').value = user.phone || '';
      document.getElementById('edit-profile-email').value = user.email || '';
      document.getElementById('edit-profile-bank-name').value = user.bankName || '';
      document.getElementById('edit-profile-bank-account').value = user.bankAccount || '';
      document.getElementById('edit-profile-bank-account-name').value = user.bankAccountName || '';
      document.getElementById('edit-profile-password').value = user.password || '';
      document.getElementById('edit-profile-avatar').value = user.avatar || 'fa-user-ninja';
      
      openModal('modal-edit-profile');
    };
  }
  
  const editProfileForm = document.getElementById('form-edit-profile');
  if (editProfileForm) {
    editProfileForm.onsubmit = (e) => {
      e.preventDefault();
      
      const user = AppState.users.find(u => u.id === AppState.currentUserId);
      if (!user) return;
      
      const newName = document.getElementById('edit-profile-name').value.trim();
      const newPhone = document.getElementById('edit-profile-phone').value.trim();
      const newEmail = document.getElementById('edit-profile-email').value.trim();
      const newBankName = document.getElementById('edit-profile-bank-name').value.trim();
      const newBankAccount = document.getElementById('edit-profile-bank-account').value.trim();
      const newBankAccountName = document.getElementById('edit-profile-bank-account-name').value.trim();
      const newPassword = document.getElementById('edit-profile-password').value;
      const newAvatar = document.getElementById('edit-profile-avatar').value;
      
      if (!newName || !newPassword) {
        showToast('Vui lòng nhập đầy đủ thông tin!', 'warning');
        return;
      }
      
      const fileInput = document.getElementById('edit-profile-avatar-file');
      const file = fileInput && fileInput.files ? fileInput.files[0] : null;

      const proceedSave = (avatarVal) => {
        user.name = newName;
        user.phone = newPhone;
        user.email = newEmail;
        user.bankName = newBankName;
        user.bankAccount = newBankAccount;
        user.bankAccountName = newBankAccountName;
        user.password = newPassword;
        user.avatar = avatarVal;
        
        // Update session storage
        localStorage.setItem('minhhai_user', JSON.stringify(user));
        
        // Save state to database
        saveState();
        
        // Close modal
        closeModal('modal-edit-profile');
        
        // Update sidebar visual elements
        const userCardName = document.getElementById('current-user-name');
        if (userCardName) userCardName.innerText = newName;
        
        const userCardAvatar = document.getElementById('current-user-avatar');
        if (userCardAvatar) {
          userCardAvatar.style.overflow = 'hidden';
          userCardAvatar.innerHTML = window.getUserAvatarInnerHtml(avatarVal);
        }

        // Reset file input
        if (fileInput) fileInput.value = '';
        
        showToast('Đã cập nhật thông tin cá nhân!', 'success');
        
        // Refresh views
        if (typeof renderStaffManagementTable === 'function') renderStaffManagementTable();
      };

      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          proceedSave(event.target.result);
        };
        reader.readAsDataURL(file);
      } else {
        proceedSave(newAvatar);
      }
    };
  }

  const adminEditUserForm = document.getElementById('form-admin-edit-user');
  if (adminEditUserForm) {
    adminEditUserForm.onsubmit = (e) => {
      e.preventDefault();
      
      const targetUserId = document.getElementById('admin-edit-user-id').value;
      const targetUser = AppState.users.find(u => u.id === targetUserId);
      if (!targetUser) return;

      const newName = document.getElementById('admin-edit-user-name').value.trim();
      const newRole = document.getElementById('admin-edit-user-role').value;
      const newPassword = document.getElementById('admin-edit-user-password').value;
      const newPhone = document.getElementById('admin-edit-user-phone').value.trim();
      const newEmail = document.getElementById('admin-edit-user-email').value.trim();
      const newBankName = document.getElementById('admin-edit-user-bank-name').value.trim();
      const newBankAccount = document.getElementById('admin-edit-user-bank-account').value.trim();
      const newBankAccountName = document.getElementById('admin-edit-user-bank-account-name').value.trim();

      if (!newName || !newPassword) {
        showToast('Vui lòng điền họ tên và mật khẩu!', 'warning');
        return;
      }

      // Update fields
      targetUser.name = newName;
      targetUser.role = newRole;
      targetUser.password = newPassword;
      targetUser.phone = newPhone;
      targetUser.email = newEmail;
      targetUser.bankName = newBankName;
      targetUser.bankAccount = newBankAccount;
      targetUser.bankAccountName = newBankAccountName;

      // If the edited user is the current logged-in user, update session as well
      const loggedUser = JSON.parse(localStorage.getItem('minhhai_user') || '{}');
      if (loggedUser.id === targetUserId) {
        Object.assign(loggedUser, targetUser);
        localStorage.setItem('minhhai_user', JSON.stringify(loggedUser));
        renderCurrentUser();
      }

      // Save state to database
      saveState();

      closeModal('modal-admin-edit-user');
      showToast('Đã cập nhật thông tin tài khoản nhân viên!', 'success');

      // Refresh views
      if (typeof renderStaffManagementTable === 'function') renderStaffManagementTable();
      if (typeof initRoleSwitcher === 'function') initRoleSwitcher();
    };
  }

  // Bind Changelog modal
  const btnViewChangelog = document.getElementById('btn-view-changelog');
  if (btnViewChangelog) {
    btnViewChangelog.onclick = (e) => {
      e.preventDefault();
      openModal('modal-changelog');
    };
  }

  const appVersionTag = document.getElementById('app-version-tag');
  if (appVersionTag) {
    appVersionTag.onclick = (e) => {
      e.preventDefault();
      openModal('modal-changelog');
    };
  }

  // Bind Workload sorting headers
  document.querySelectorAll('.sort-header').forEach(th => {
    th.onclick = (e) => {
      const newKey = e.currentTarget.getAttribute('data-sort');
      if (window.workloadSortKey === newKey) {
        window.workloadSortAsc = !window.workloadSortAsc;
      } else {
        window.workloadSortKey = newKey;
        window.workloadSortAsc = false;
      }
      
      document.querySelectorAll('.sort-header i').forEach(icon => {
        icon.className = 'fa-solid fa-sort';
      });
      const icon = e.currentTarget.querySelector('i');
      if (icon) {
        icon.className = window.workloadSortAsc ? 'fa-solid fa-sort-up' : 'fa-solid fa-sort-down';
      }
      
      renderAdminStaffWorkloadTable();
    };
  });
});









