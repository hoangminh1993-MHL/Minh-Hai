document.getElementById('login-form').onsubmit = async (e) => {
  e.preventDefault();
  const u = document.getElementById('username').value.trim();
  const p = document.getElementById('password').value;
  const errorBox = document.getElementById('error-box');
  
  errorBox.style.display = 'none';
  
  const customApiBase = localStorage.getItem('minhhai_custom_api_base') || '';
  const apiBase = customApiBase.endsWith('/') ? customApiBase.slice(0, -1) : customApiBase;
  
  try {
    const res = await fetch(`${apiBase}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: u, password: p })
    });
    const result = await res.json();
    if (result.success) {
      // Store logged in user session
      localStorage.setItem('minhhai_user', JSON.stringify(result.user));
      window.location.href = 'index.html';
    } else {
      errorBox.innerText = result.message || 'Đăng nhập thất bại!';
      errorBox.style.display = 'block';
    }
  } catch (err) {
    errorBox.innerText = 'Không thể kết nối đến máy chủ!';
    errorBox.style.display = 'block';
  }
};

document.getElementById('btn-config-api').onclick = (e) => {
  e.preventDefault();
  const current = localStorage.getItem('minhhai_custom_api_base') || '';
  const url = prompt('Nhập địa chỉ API Server (ví dụ: https://xxxx.free.pinggy.net hoặc http://localhost:3000):', current);
  if (url !== null) {
    localStorage.setItem('minhhai_custom_api_base', url.trim());
    alert('Đã lưu cấu hình kết nối API!');
  }
};
