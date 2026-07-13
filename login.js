const INITIAL_USERS = [
  { id: 'usr-1', name: 'Nguyễn Hoàng Minh', username: 'hoangminh', role: 'admin' },
  { id: 'usr-2', name: 'Trần Tú Anh', username: 'tuanh', role: 'sales' },
  { id: 'usr-3', name: 'M.Phương (CSKH)', username: 'minhphuong', role: 'sales' },
  { id: 'usr-6', name: 'Trang (CSKH)', username: 'trang', role: 'sales' },
  { id: 'usr-7', name: 'Phượng (CSKH)', username: 'phuong', role: 'sales' }
];

document.getElementById('login-form').onsubmit = async (e) => {
  e.preventDefault();
  const u = document.getElementById('username').value.trim();
  const p = document.getElementById('password').value;
  const errorBox = document.getElementById('error-box');
  
  errorBox.style.display = 'none';
  
  const customApiBase = localStorage.getItem('minhhai_custom_api_base') || '';
  const apiBase = customApiBase.endsWith('/') ? customApiBase.slice(0, -1) : customApiBase;
  
  // 1. Try online login first if API server is configured
  if (apiBase) {
    try {
      const res = await fetch(`${apiBase}/api/login`, {
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
      console.warn('Không thể kết nối đến API Server, chuyển sang kiểm tra tài khoản offline.');
    }
  }
  
  // 2. Offline / Local fallback: Chỉ cần đúng tài khoản (username) là cho vào!
  const localUsers = JSON.parse(localStorage.getItem('votr_users_db')) || INITIAL_USERS;
  const foundUser = localUsers.find(usr => usr.username.toLowerCase() === u.toLowerCase());
  
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
