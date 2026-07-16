// ==================== IDEAS & SUGGESTIONS CONTROLLER ==================== //
document.addEventListener('DOMContentLoaded', () => {
  initSuggestions();
});

function initSuggestions() {
  // Ensure AppState array exists
  if (!AppState.suggestions) AppState.suggestions = [];

  const form = document.getElementById('form-add-suggestion');
  if (form) {
    form.addEventListener('submit', handleSuggestionSubmit);
  }

  // Handle active navigation click
  const navItem = document.querySelector('.nav-item[data-view="suggestions"]');
  if (navItem) {
    navItem.addEventListener('click', () => {
      renderSuggestions();
    });
  }
}

function renderSuggestions() {
  const user = getCurrentUser();
  if (!user) return;

  const staffLayout = document.getElementById('suggestions-staff-layout');
  const adminLayout = document.getElementById('suggestions-admin-layout');

  if (user.username === 'hoangminh') {
    if (staffLayout) staffLayout.style.display = 'none';
    if (adminLayout) adminLayout.style.display = 'block';
    renderAdminSuggestions();
  } else {
    if (staffLayout) staffLayout.style.display = 'grid';
    if (adminLayout) adminLayout.style.display = 'none';
    renderStaffSuggestions();
  }
}

// ------------------------------------------
// STAFF LOGIC: Submit & View My Own History
// ------------------------------------------
function handleSuggestionSubmit(e) {
  e.preventDefault();
  const user = getCurrentUser();
  if (!user) return;

  const titleInput = document.getElementById('sugg-title');
  const typeSelect = document.getElementById('sugg-type');
  const descInput = document.getElementById('sugg-desc');
  const imageInput = document.getElementById('sugg-image');

  const title = titleInput.value.trim();
  const type = typeSelect.value;
  const desc = descInput.value.trim();
  const imageUrl = imageInput ? imageInput.value.trim() : '';

  if (!title || !desc) {
    showToast("Vui lòng nhập đầy đủ thông tin đề xuất!", "warning");
    return;
  }

  if (!imageUrl) {
    showToast("Vui lòng dán link hình ảnh minh họa bắt buộc!", "warning");
    return;
  }

  // Create suggestion object
  const sugg = {
    id: `sugg-${Date.now()}`,
    title: title,
    type: type,
    desc: desc,
    imageUrl: imageUrl,
    authorId: user.id,
    authorName: user.name,
    date: new Date().toISOString().split('T')[0],
    status: 'pending' // 'pending' | 'approved' | 'rejected'
  };

  // Immediate reward: +5 points for submitting
  let pointsBonusText = '';
  if (user.role !== 'admin') {
    user.points += 5;
    pushSuggSausageLog(user.id, 5, `Đề xuất đóng góp ý kiến: "${title}"`);
    pointsBonusText = " Bạn được cộng ngay +5 điểm Xúc xích!";
  }

  AppState.suggestions.push(sugg);
  saveState();

  showToast(`Gửi đề xuất thành công!${pointsBonusText}`, "success");

  // Reset form
  titleInput.value = '';
  descInput.value = '';
  if (imageInput) imageInput.value = '';

  // Refresh
  renderSuggestions();
  if (typeof renderCurrentUser === 'function') renderCurrentUser();
}

function renderStaffSuggestions() {
  const container = document.getElementById('suggestions-my-list');
  if (!container) return;
  container.innerHTML = '';

  const user = getCurrentUser();
  const mySuggs = (AppState.suggestions || []).filter(s => s.authorId === user.id);

  if (mySuggs.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding:30px 10px; color:var(--text-muted); font-size:13px; font-style:italic;">
        Bạn chưa gửi đề xuất nào. Hãy chia sẻ ý tưởng để tích lũy xúc xích nhé!
      </div>
    `;
    return;
  }

  // Sort newest first
  const sorted = [...mySuggs].reverse();

  sorted.forEach(s => {
    const card = document.createElement('div');
    card.style.cssText = 'background:#1f2937; border:1px solid var(--border-color); border-radius:8px; padding:12px 15px; display:flex; flex-direction:column; gap:8px;';
    
    let statusBadge = '<span class="badge bg-muted" style="background:#4b5563;">Đang chờ duyệt</span>';
    if (s.status === 'approved') {
      statusBadge = '<span class="badge bg-green" style="background:#10b981;">Đã duyệt (+20 xúc xích)</span>';
    } else if (s.status === 'rejected') {
      statusBadge = '<span class="badge bg-rose" style="background:#ef4444;">Từ chối</span>';
    }

    const typeLabels = { bug: 'Báo lỗi phần mềm', idea: 'Ý tưởng tối ưu', other: 'Đóng góp khác' };
    const typeLabel = typeLabels[s.type] || s.type;

    card.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:10px;">
        <div>
          <span style="font-size:11px; font-weight:bold; color:var(--color-primary); text-transform:uppercase;">[${typeLabel}]</span>
          <h4 style="margin:4px 0 0 0; font-size:13.5px; font-weight:bold; color:#fff;">${s.title}</h4>
        </div>
        <div>${statusBadge}</div>
      </div>
      <p style="margin:4px 0; font-size:12.5px; color:var(--text-muted); line-height:1.4; white-space:pre-wrap;">${s.desc}</p>
      ${s.imageUrl ? `<div style="margin-top:4px;"><a href="${s.imageUrl}" target="_blank" style="font-size:11.5px; color:#3b82f6;"><i class="fa-solid fa-image"></i> Xem hình ảnh đính kèm</a></div>` : ''}
      <span style="font-size:10.5px; color:var(--text-muted); align-self:flex-end;">Ngày gửi: ${s.date}</span>
    `;

    container.appendChild(card);
  });
}

// ------------------------------------------
// ADMIN LOGIC: Review & Action
// ------------------------------------------
function renderAdminSuggestions() {
  const container = document.getElementById('suggestions-admin-list');
  if (!container) return;
  container.innerHTML = '';

  const allSuggs = AppState.suggestions || [];

  if (allSuggs.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding:40px 10px; color:var(--text-muted); font-size:13px; font-style:italic;">
        Chưa có đề xuất nào được gửi lên hệ thống.
      </div>
    `;
    return;
  }

  // Sort: Pending first, then by date newest first
  const sorted = [...allSuggs].sort((a, b) => {
    if (a.status === 'pending' && b.status !== 'pending') return -1;
    if (a.status !== 'pending' && b.status === 'pending') return 1;
    return b.id.localeCompare(a.id); // newest timestamp first
  });

  sorted.forEach(s => {
    const card = document.createElement('div');
    card.style.cssText = 'background:#1f2937; border:1px solid var(--border-color); border-radius:8px; padding:15px; display:flex; flex-direction:column; gap:10px; border-left: 4px solid #9ca3af;';
    
    let statusText = '';
    let buttonsHtml = '';

    if (s.status === 'pending') {
      card.style.borderLeft = '4px solid #f59e0b';
      statusText = '<span class="badge bg-warning" style="background:#f59e0b; color:#fff;">Đang chờ duyệt</span>';
      buttonsHtml = `
        <div style="display:flex; gap:8px; margin-top:8px;">
          <button class="btn btn-sm btn-primary" onclick="approveSuggestion('${s.id}')"><i class="fa-solid fa-check"></i> Duyệt Đề Xuất (+20đ)</button>
          <button class="btn btn-sm btn-outline text-rose" onclick="rejectSuggestion('${s.id}')"><i class="fa-solid fa-xmark"></i> Từ Chối</button>
        </div>
      `;
    } else if (s.status === 'approved') {
      card.style.borderLeft = '4px solid #10b981';
      statusText = '<span class="badge bg-green" style="background:#10b981;">Đã duyệt (+20đ)</span>';
    } else {
      card.style.borderLeft = '4px solid #ef4444';
      statusText = '<span class="badge bg-rose" style="background:#ef4444;">Đã từ chối</span>';
    }

    const typeLabels = { bug: 'Báo lỗi phần mềm', idea: 'Ý tưởng tối ưu', other: 'Đóng góp khác' };
    const typeLabel = typeLabels[s.type] || s.type;

    card.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:10px;">
        <div>
          <span style="font-size:11px; font-weight:bold; color:var(--color-primary); text-transform:uppercase;">[${typeLabel}]</span>
          <h4 style="margin:4px 0 0 0; font-size:14.5px; font-weight:bold; color:#fff;">${s.title}</h4>
          <span style="font-size:11.5px; color:var(--text-muted);">Gửi bởi: <strong>${s.authorName}</strong> | Ngày: ${s.date}</span>
        </div>
        <div>${statusText}</div>
      </div>
      <div style="background:rgba(0,0,0,0.15); padding:10px; border-radius:6px; border:1px solid var(--border-color); font-size:13px; color:#fff; line-height:1.45; white-space:pre-wrap;">${s.desc}</div>
      ${s.imageUrl ? `<div><a href="${s.imageUrl}" target="_blank" style="font-size:12px; color:#3b82f6;"><i class="fa-solid fa-image"></i> Xem hình ảnh đính kèm</a></div>` : ''}
      ${buttonsHtml}
    `;

    container.appendChild(card);
  });
}

window.approveSuggestion = function(id) {
  const s = AppState.suggestions.find(x => x.id === id);
  if (!s) return;

  if (!confirm(`Bạn có chắc chắn muốn DUYỆT đề xuất "${s.title}" và cộng 20 xúc xích cho ${s.authorName}?`)) {
    return;
  }

  s.status = 'approved';

  // Reward points to the author
  const author = AppState.users.find(u => u.id === s.authorId);
  if (author) {
    if (author.role !== 'admin') {
      author.points += 20;
    }
    pushSuggSausageLog(author.id, 20, `Đề xuất được duyệt: "${s.title}"`);
  }

  saveState();
  showToast("Đã duyệt đề xuất và cộng 20 xúc xích thành công!", "success");
  renderSuggestions();
  if (typeof renderCurrentUser === 'function') renderCurrentUser();
};

window.rejectSuggestion = function(id) {
  const s = AppState.suggestions.find(x => x.id === id);
  if (!s) return;

  if (!confirm(`Bạn có chắc muốn TỪ CHỐI đề xuất "${s.title}"?`)) {
    return;
  }

  s.status = 'rejected';
  saveState();
  showToast("Đã từ chối đề xuất.", "info");
  renderSuggestions();
};

// ------------------------------------------
// HELPERS
// ------------------------------------------
function pushSuggSausageLog(userId, points, text) {
  if (!AppState.sausageLogs) AppState.sausageLogs = [];
  AppState.sausageLogs.push({
    id: `log-${Date.now()}-${Math.floor(Math.random()*1000)}`,
    userId: userId,
    points: points,
    type: 'success',
    text: text,
    date: new Date().toISOString().split('T')[0]
  });
}
