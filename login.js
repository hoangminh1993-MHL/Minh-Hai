const INITIAL_USERS = [
  { id: 'usr-1', name: 'Nguyễn Hoàng Minh', username: 'hoangminh', password: 'a123', role: 'admin', dept: 'admin' },
  { id: 'usr-2', name: 'Trần Tú Anh', username: 'tuanh', password: 'a123', role: 'admin', dept: 'admin' },
  { id: 'usr-3', name: 'Phùng Thị Minh Phương', username: 'minhphuong', password: 'a123', role: 'manager', dept: 'cskh' },
  { id: 'usr-4', name: 'Đoàn Thị Hải Linh', username: 'hailinh', password: 'a123', role: 'cskh', dept: 'cskh' },
  { id: 'usr-5', name: 'Đặng Thị Phương Thảo', username: 'phuongthao', password: 'a123', role: 'manager', dept: 'sales' },
  { id: 'usr-6', name: 'Lê Thị Thùy Trang', username: 'thuytrang', password: 'a123', role: 'sales', dept: 'sales' },
  { id: 'usr-7', name: 'Bùi Thị Bích Phượng', username: 'bichphuong', password: 'a123', role: 'sales', dept: 'sales' },
  { id: 'usr-8', name: 'Nguyễn Phương Anh', username: 'phuonganh', password: 'a123', role: 'sales', dept: 'sales' },
  { id: 'usr-9', name: 'Phạm Duy Hưng', username: 'duyhung', password: 'a123', role: 'sourcing', dept: 'sourcing' },
  { id: 'usr-10', name: 'Đỗ Như Quỳnh', username: 'nhuquynh', password: 'a123', role: 'sales', dept: 'sales' },
  { id: 'usr-11', name: 'Vũ Linh Chi', username: 'linhchi', password: 'a123', role: 'cskh', dept: 'cskh' },
  { id: 'usr-12', name: 'Lưu Thành Đạt', username: 'thanhdat', password: 'a123', role: 'sourcing', dept: 'sourcing' },
  { id: 'usr-13', name: 'Dương Thị Hồng Yến', username: 'hongyen', password: 'a123', role: 'cskh', dept: 'cskh' },
  { id: 'usr-14', name: 'Đào Minh Tuấn', username: 'minhtuan', password: 'a123', role: 'warehouse', dept: 'warehouse' },
  { id: 'usr-15', name: 'Nguyễn Tuấn Anh', username: 'tuananh', password: 'a123', role: 'warehouse', dept: 'warehouse' },
  { id: 'usr-16', name: 'Trịnh Thị Bình Dương', username: 'binhduong', password: 'a123', role: 'sales', dept: 'sales' },
  { id: 'usr-17', name: 'Mai Thị Thu Hiền', username: 'thuhien', password: 'a123', role: 'cskh', dept: 'cskh' }
];

function getApiUrl(path) {
  let customApiBase = localStorage.getItem('minhhai_custom_api_base');
  if (customApiBase === 'undefined' || customApiBase === 'null' || customApiBase === '/api' || customApiBase === '/api/') {
    localStorage.removeItem('minhhai_custom_api_base');
    customApiBase = null;
  }
  if (customApiBase) {
    const base = customApiBase.endsWith('/') ? customApiBase.slice(0, -1) : customApiBase;
    return `${base}${path}`;
  }
  if (window.location.hostname.includes('github.io') || window.location.protocol === 'file:') {
    return `https://minh-hai.onrender.com${path}`;
  }
  return `${window.location.origin}${path}`;
}

document.getElementById('login-form').onsubmit = async (e) => {
  e.preventDefault();
  const u = document.getElementById('username').value.trim();
  const p = document.getElementById('password').value;
  const errorBox = document.getElementById('error-box');
  
  errorBox.style.display = 'none';
  
  // 1. Try online login first
  const apiLoginUrl = getApiUrl('/api/login');
  try {
    const res = await fetch(apiLoginUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: u, password: p })
    });
    if (res.ok) {
      const result = await res.json();
      if (result.success) {
        localStorage.setItem('minhhai_user', JSON.stringify(result.user));
        localStorage.setItem('votr_current_user_id', result.user.id);
        window.location.href = 'index.html';
        return;
      }
    }
  } catch (err) {
    console.warn('Không thể kết nối đến API Server, chuyển sang kiểm tra tài khoản offline:', err);
  }
  
  // 2. Offline / Local fallback: Robust against corrupted votr_users_db
  let localUsers = null;
  try {
    const stored = localStorage.getItem('votr_users_db');
    if (stored && stored !== 'undefined' && stored !== 'null') {
      localUsers = JSON.parse(stored);
    }
  } catch (err) {
    console.warn('Lỗi đọc votr_users_db, tự động lập về mặc định:', err);
    localStorage.removeItem('votr_users_db');
  }
  if (!localUsers || !Array.isArray(localUsers)) localUsers = INITIAL_USERS;

  const foundUser = localUsers.find(usr => usr.username && usr.username.toLowerCase() === u.toLowerCase());
  
  if (foundUser) {
    localStorage.setItem('minhhai_user', JSON.stringify(foundUser));
    localStorage.setItem('votr_current_user_id', foundUser.id);
    window.location.href = 'index.html';
  } else {
    errorBox.innerText = 'Tên đăng nhập không tồn tại trong hệ thống!';
    errorBox.style.display = 'block';
  }
};

// Toggle password visibility
const togglePassword = document.getElementById('toggle-password');
const passwordInput = document.getElementById('password');
if (togglePassword && passwordInput) {
  togglePassword.onclick = () => {
    if (passwordInput.type === 'password') {
      passwordInput.type = 'text';
      togglePassword.classList.replace('fa-eye', 'fa-eye-slash');
    } else {
      passwordInput.type = 'password';
      togglePassword.classList.replace('fa-eye-slash', 'fa-eye');
    }
  };
}

// Config API connection base url
document.getElementById('btn-config-api').onclick = (e) => {
  e.preventDefault();
  const current = localStorage.getItem('minhhai_custom_api_base') || '';
  const url = prompt('Nhập địa chỉ API Server (ví dụ: https://xxxx.free.pinggy.net hoặc http://localhost:3000):', current);
  if (url !== null) {
    localStorage.setItem('minhhai_custom_api_base', url.trim());
    alert('Đã lưu cấu hình kết nối API!');
  }
};
