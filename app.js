// ==================== GLOBAL STATE & CONFIGURATION ==================== //
function getApiUrl(path) {
  const customApiBase = localStorage.getItem('minhhai_custom_api_base');
  if (customApiBase) {
    const base = customApiBase.endsWith('/') ? customApiBase.slice(0, -1) : customApiBase;
    return `${base}${path}`;
  }
  // Tự động kết nối cố định tới API Server trên Render nếu chạy trực tuyến (v18)
  if (window.location.hostname.includes('github.io')) {
    return `https://minh-hai.onrender.com${path}`;
  }
  // Nếu chạy thử nghiệm trên máy tính cá nhân
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return `http://127.0.0.1:3000${path}`;
  }
  return path;
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
  
  const btnConfigApi = document.getElementById('btn-config-api');
  if (btnConfigApi) {
    btnConfigApi.onclick = (e) => {
      e.preventDefault();
      const current = localStorage.getItem('minhhai_custom_api_base') || '';
      const url = prompt('Nhập địa chỉ API Server (ví dụ: https://xxxx.free.pinggy.net hoặc http://localhost:3000):', current);
      if (url !== null) {
        localStorage.setItem('minhhai_custom_api_base', url.trim());
        alert('Đã lưu cấu hình kết nối API! Trình duyệt sẽ tự động tải lại.');
        window.location.reload();
      }
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
    const res = await fetch(getApiUrl('/api/state'));
    if (res.ok) {
      const data = await res.json();
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
      updateMyTasksBadge();
      return;
    }
  } catch (err) {
    console.warn('Không kết nối được server API, sử dụng LocalStorage offline:', err);
  }
  loadState();
}

function loadState() {
  AppState.users = JSON.parse(localStorage.getItem(CONFIG.LS_KEY_USERS)) || [];
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
  updateMyTasksBadge();
}

async function saveState() {
  // Sync to local storage
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
  
  // Sync to server API in background
  try {
    await fetch(getApiUrl('/api/state'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(AppState)
    });
  } catch (err) {
    console.error('Không lưu được lên server API:', err);
  }
  updateMyTasksBadge();
}

let pollingInterval = null;
function startStatePolling() {
  if (pollingInterval) clearInterval(pollingInterval);
  pollingInterval = setInterval(async () => {
    try {
      const res = await fetch(getApiUrl('/api/state'));
      if (res.ok) {
        const data = await res.json();
        
        // Detect if anything changed
        const oldLeadsCount = AppState.leads ? AppState.leads.length : 0;
        const newLeadsCount = data.leads ? data.leads.length : 0;
        const oldNotifsCount = AppState.notifications ? AppState.notifications.length : 0;
        const newNotifsCount = data.notifications ? data.notifications.length : 0;
        const oldTasksCount = AppState.tasks ? AppState.tasks.length : 0;
        const newTasksCount = data.tasks ? data.tasks.length : 0;
        
        const oldFlowsCount = AppState.shipment_workflows ? AppState.shipment_workflows.length : 0;
        const newFlowsCount = data.shipment_workflows ? data.shipment_workflows.length : 0;
        const oldClientsCount = AppState.clients ? AppState.clients.length : 0;
        const newClientsCount = data.clients ? data.clients.length : 0;
        const oldProjectsCount = AppState.projects ? AppState.projects.length : 0;
        const newProjectsCount = data.projects ? data.projects.length : 0;
        const oldSingleCount = AppState.single_tasks ? AppState.single_tasks.length : 0;
        const newSingleCount = data.single_tasks ? data.single_tasks.length : 0;

        if (
          newLeadsCount !== oldLeadsCount || 
          newNotifsCount !== oldNotifsCount || 
          newTasksCount !== oldTasksCount ||
          newFlowsCount !== oldFlowsCount ||
          newClientsCount !== oldClientsCount ||
          newProjectsCount !== oldProjectsCount ||
          newSingleCount !== oldSingleCount
        ) {
          console.log('Phát hiện dữ liệu mới từ server. Cập nhật giao diện...');
          AppState.users = data.users;
          AppState.leads = data.leads;
          AppState.tasks = data.tasks;
          AppState.workflows = data.workflows;
          AppState.sausageLogs = data.sausageLogs;
          AppState.notifications = data.notifications;
          AppState.fbConfig = data.fbConfig || AppState.fbConfig || { accessToken: '', pageUrl: 'https://www.facebook.com/MinhHailogistcs.Muahangtaobao.vanchuyentrungviet' };
          
          // Đồng bộ các phân hệ vận hành mới (v18)
          AppState.clients = data.clients || [];
          AppState.projects = data.projects || [];
          AppState.shipment_workflows = data.shipment_workflows || [];
          AppState.single_tasks = data.single_tasks || [];

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
    workflows: { main: 'Cấu Hình Quy Trình Công Việc', sub: 'Tùy chỉnh các bước thực hiện nghiệp vụ cho từng bộ phận.' },
    'inbox-simulator': { main: 'Giả Lập Fanpage Message', sub: 'Thử nghiệm tính năng tự động tạo lead trên CRM từ tin nhắn của khách.' },
    'facebook-config': { main: 'Cấu Hình Liên Kết Fanpage', sub: 'Kết nối Fanpage Facebook thực tế để tự động nhận tin nhắn khách hàng đổ về CRM.' },
    rewards: { main: 'Đua Top Tích Xúc Xích', sub: 'Bảng thi đua xếp hạng thưởng dựa trên điểm hoàn thành công việc.' },
    'staff-management': { main: 'Quản Lý Nhân Sự', sub: 'Tạo tài khoản, phân quyền hệ thống cho cán bộ nhân viên Minh Hải Logistics.' },
    'crm-clients-workflows': { main: 'CRM Khách Cũ & Lô Hàng', sub: 'Quản lý quy trình vận chuyển 11 bước cho khách hàng thân thiết.' },
    'tasks-single': { main: 'Quản Lý Công Việc Đơn Lẻ', sub: 'Theo dõi, giao việc phát sinh hàng ngày của nhân viên.' },
    'tasks-projects': { main: 'Dự Án & Phòng Ban', sub: 'Tập trung quản lý tài liệu, công việc, thảo luận theo phòng ban/khách VIP.' },
    'my-tasks': { main: 'Công Việc Của Tôi', sub: 'Danh sách tổng hợp các khâu vận chuyển lô hàng, việc đơn lẻ và dự án do bạn phụ trách.' }
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
  } else if (viewId === 'workflows') {
    renderWorkflowSettings();
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
  } else if (viewId === 'facebook-config') {
    renderFacebookConfig();
  } else if (viewId === 'staff-management') {
    renderStaffManagementTable();
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
  return AppState.users.find(u => u.id === AppState.currentUserId) || AppState.users.find(u => u.id === sessionUser.id) || AppState.users[0];
}

function renderCurrentUser() {
  const user = getCurrentUser();
  document.getElementById('current-user-name').innerText = user.name;
  document.getElementById('current-user-points').innerText = user.points;
  
  // Set role badge classes
  const badge = document.getElementById('current-user-role-badge');
  badge.className = 'role-badge';
  const roleLabels = { admin: 'Quản trị viên (Admin)', manager: 'Quản lý', staff: 'Nhân viên' };
  badge.innerText = roleLabels[user.role] || user.role;
  badge.classList.add(`badge-${user.role}`);
  
  // Set user avatar
  const avatarDiv = document.getElementById('current-user-avatar');
  avatarDiv.innerHTML = `<i class="fa-solid ${user.avatar || 'fa-user'}"></i>`;
  
  applyRoleBasedNavigation();
}

function applyRoleBasedNavigation() {
  const user = getCurrentUser();
  const isAdmin = user && user.role === 'admin';

  const navFbConfig = document.querySelector('.nav-item[data-view="facebook-config"]');
  const navWorkflowsConfig = document.querySelector('.nav-item[data-view="workflows"]');
  const navStaffMgmt = document.getElementById('nav-staff-mgmt');

  if (navFbConfig) navFbConfig.style.display = isAdmin ? '' : 'none';
  if (navWorkflowsConfig) navWorkflowsConfig.style.display = isAdmin ? '' : 'none';
  if (navStaffMgmt) navStaffMgmt.style.display = isAdmin ? '' : 'none';

  // Toggle sub-dashboard views inside view-dashboard
  const adminView = document.getElementById('dashboard-admin-view');
  const staffView = document.getElementById('dashboard-staff-view');
  if (adminView && staffView) {
    if (isAdmin) {
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
    const restrictedViews = ['facebook-config', 'workflows', 'staff-management'];
    if (!isAdmin && restrictedViews.includes(currentViewId)) {
      navigateToView('my-tasks');
    }
  }
}

// ==================== DASHBOARD RENDER & CHARTS ==================== //
function renderDashboard() {
  const user = getCurrentUser();
  if (user && user.role !== 'admin') {
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

  const usersList = AppState.users || [];

  usersList.forEach(u => {
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

    // Workload status tag
    let statusText = 'Nhàn rỗi';
    let statusClass = 'bg-gray';
    if (activeTasksCount > 0 && activeTasksCount <= 2) {
      statusText = 'Vừa phải';
      statusClass = 'bg-emerald';
    } else if (activeTasksCount > 2 && activeTasksCount <= 5) {
      statusText = 'Bận rộn';
      statusClass = 'bg-blue';
    } else if (activeTasksCount > 5) {
      statusText = 'Quá tải ⚠️';
      statusClass = 'bg-rose';
    }

    if (overdueTasksCount > 0) {
      statusText += ` (Trễ: ${overdueTasksCount})`;
    }

    const tr = document.createElement('tr');
    tr.style.borderBottom = '1px solid var(--border-color)';
    tr.innerHTML = `
      <td style="padding: 10px; font-weight: bold; display:flex; align-items:center; gap:8px;">
        <div style="width:28px; height:28px; font-size:12px; display:flex; align-items:center; justify-content:center; background:rgba(255,255,255,0.05); border-radius:50%; color: var(--color-primary);">
          <i class="fa-solid ${u.avatar || 'fa-user'}"></i>
        </div>
        <span>${u.name}</span>
      </td>
      <td style="padding: 10px; color: var(--text-secondary); text-transform: capitalize;">${u.role}</td>
      <td style="padding: 10px; text-align: center; font-weight: bold; color: #f59e0b;">${u.points} xúc xích</td>
      <td style="padding: 10px; text-align: center; font-weight: bold;">${activeTasksCount}</td>
      <td style="padding: 10px; text-align: center; font-weight: bold; color: ${overdueTasksCount > 0 ? '#ef4444' : 'var(--text-muted)'};">${overdueTasksCount}</td>
      <td style="padding: 10px; text-align: center; font-weight: bold; color: #10b981;">${completedTasksCount}</td>
      <td style="padding: 10px; text-align: center;">
        <span class="badge ${statusClass}" style="font-size: 11px; padding: 4px 8px; border-radius:4px; font-weight: bold;">${statusText}</span>
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
  const stages = ['receive_info', 'get_phone', 'quotation', 'negotiating', 'success', 'failed'];
  const stageNames = ['Nhận thông tin', 'Lấy SĐT', 'Báo giá', 'Thương lượng', 'Thành công', 'Thất bại'];
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
          'rgba(245, 158, 11, 0.6)',   // Yellow (quotation)
          'rgba(249, 115, 22, 0.6)',   // Orange (negotiating)
          'rgba(16, 185, 129, 0.6)',   // Emerald (success)
          'rgba(239, 68, 68, 0.6)'     // Rose (failed)
        ],
        borderColor: [
          '#3b82f6', '#8b5cf6', '#f59e0b', '#f97316', '#10b981', '#ef4444'
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
function renderRewardsView() {
  const tbody = document.getElementById('rewards-leaderboard-body');
  tbody.innerHTML = '';

  const sortedUsers = [...AppState.users].sort((a, b) => b.points - a.points);
  
  // Find highest points to determine levels or titles
  const maxPts = sortedUsers[0]?.points || 1;

  const roleLabels = { admin: 'Admin', sales: 'Sales & CSKH', sourcing: 'Sourcing', warehouse: 'Kho bãi' };
  sortedUsers.forEach((u, index) => {
    const rank = index + 1;
    const tr = document.createElement('tr');
    
    let rankHtml = `<td class="text-center font-weight-bold">${rank}</td>`;
    if (rank === 1) rankHtml = `<td class="text-center"><i class="fa-solid fa-trophy trophy-1"></i> 1</td>`;
    else if (rank === 2) rankHtml = `<td class="text-center"><i class="fa-solid fa-trophy trophy-2"></i> 2</td>`;
    else if (rank === 3) rankHtml = `<td class="text-center"><i class="fa-solid fa-trophy trophy-3"></i> 3</td>`;

    // Determine custom titles
    let title = 'Tập sự Xúc xích';
    let titleClass = 'text-muted';
    if (u.points >= 350) { title = 'Đại vương Xúc xích'; titleClass = 'text-gold'; }
    else if (u.points >= 280) { title = 'Chiến thần Săn Xúc xích'; titleClass = 'text-orange'; }
    else if (u.points >= 200) { title = 'Kẻ hủy diệt Xúc xích'; titleClass = 'text-blue'; }
    else if (u.points >= 150) { title = 'Thợ săn Xúc xích'; titleClass = 'text-purple'; }

    // Mock Total Earned: Current Points + 20% estimated spent
    const totalEarned = Math.round(u.points * 1.25);

    const roleLabel = roleLabels[u.role] || u.role.toUpperCase();
    tr.innerHTML = `
      ${rankHtml}
      <td>
        <div style="display:flex; align-items:center; gap: 8px;">
          <div class="rank-avatar" style="margin: 0;"><i class="fa-solid ${u.avatar}"></i></div>
          <div>
            <h4 style="font-size: 13px; font-weight:600;">${u.name}</h4>
            <span style="font-size: 10px; color: var(--text-muted)">ID: ${u.id}</span>
          </div>
        </div>
      </td>
      <td><span class="role-badge badge-${u.role}">${roleLabel}</span></td>
      <td class="text-center text-gold font-weight-bold" style="font-size:14px; font-weight:700;">${u.points} <i class="fa-solid fa-hotdog" style="font-size:12px;"></i></td>
      <td class="text-center text-muted">${totalEarned}</td>
      <td><span class="${titleClass}" style="font-size:12px; font-weight:600;"><i class="fa-solid fa-star" style="font-size:10px; margin-right:4px;"></i>${title}</span></td>
    `;
    tbody.appendChild(tr);
  });

  // Render recent logs
  const logContainer = document.getElementById('rewards-points-log');
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
    div.innerHTML = `
      <div class="log-text">
        <strong>${user ? user.name : 'Nhân viên'}</strong>: ${l.text}
        <div class="notification-time">${l.date}</div>
      </div>
      <span class="log-pts">+${l.points} <i class="fa-solid fa-hotdog" style="font-size: 10px;"></i></span>
    `;
    logContainer.appendChild(div);
  });
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
    const isSupremeAdmin = u.id === 'usr-admin';
    const deleteBtnHtml = (isSelf || isSupremeAdmin)
      ? `<span class="text-muted" style="font-size:11px;">Mặc định</span>`
      : `<button class="btn btn-outline btn-xs btn-delete-user" data-id="${u.id}" style="color:var(--color-error); border-color:var(--color-error);"><i class="fa-solid fa-trash-can"></i> Xóa</button>`;

    tr.innerHTML = `
      <td>
        <div style="display:flex; align-items:center; gap:8px;">
          <div class="user-avatar" style="width:28px; height:28px; font-size:11px;"><i class="fa-solid ${u.avatar || 'fa-user'}"></i></div>
          <div><strong>${u.name}</strong></div>
        </div>
      </td>
      <td><code>${u.username || ''}</code></td>
      <td><span class="role-badge badge-${u.role}">${roleLabels[u.role] || u.role}</span></td>
      <td class="text-center"><strong>${u.points}</strong> <i class="fa-solid fa-hotdog" style="color:var(--color-primary); font-size:11px;"></i></td>
      <td class="text-center">${deleteBtnHtml}</td>
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

