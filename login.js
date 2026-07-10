document.getElementById('login-form').onsubmit = async (e) => {
  e.preventDefault();
  const u = document.getElementById('username').value.trim();
  const p = document.getElementById('password').value;
  const errorBox = document.getElementById('error-box');
  
  errorBox.style.display = 'none';
  
  try {
    const res = await fetch('/api/login', {
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
