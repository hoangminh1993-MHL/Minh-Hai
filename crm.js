// ==================== CRM CONTROLLERS & RENDERERS ==================== //
document.addEventListener('DOMContentLoaded', () => {
  initCRMEvents();
});

let draggingLeadId = null; // Backup reference for touch devices or simple drag tracking
let failPromptCallback = null; // Callback for confirm button on fail modal

function initCRMEvents() {
  // Search input
  const searchInput = document.getElementById('crm-search');
  if (searchInput) {
    searchInput.addEventListener('input', renderCRMBoard);
  }

  // Open add lead modal
  const btnAddLead = document.getElementById('btn-add-lead-modal');
  if (btnAddLead) {
    btnAddLead.addEventListener('click', () => {
      const user = getCurrentUser();
      if (user.role !== 'admin' && user.role !== 'sales') {
        showToast('Bạn không có quyền thêm khách hàng. Chỉ Sales và Admin được phép.', 'danger');
        return;
      }
      populateSalesDropdown('lead-sales');
      openModal('modal-add-lead');
    });
  }

  // Form add lead submit
  const formAddLead = document.getElementById('form-add-lead');
  if (formAddLead) {
    formAddLead.addEventListener('submit', handleAddLeadSubmit);
  }

  // Form edit lead submit
  const formEditLead = document.getElementById('form-edit-lead');
  if (formEditLead) {
    formEditLead.addEventListener('submit', handleEditLeadSubmit);
  }

  // Edit lead stage select change (to toggle fail reason group visibility)
  const editStageSelect = document.getElementById('edit-lead-stage');
  if (editStageSelect) {
    editStageSelect.addEventListener('change', (e) => {
      const failGroup = document.getElementById('edit-lead-fail-reason-group');
      if (e.target.value === 'failed') {
        failGroup.style.display = 'block';
        document.getElementById('edit-lead-fail-reason').required = true;
      } else {
        failGroup.style.display = 'none';
        document.getElementById('edit-lead-fail-reason').required = false;
        document.getElementById('edit-lead-fail-reason').value = '';
      }
    });
  }

  // Fail reason other input toggle in edit modal
  const editFailReasonSelect = document.getElementById('edit-lead-fail-reason');
  if (editFailReasonSelect) {
    editFailReasonSelect.addEventListener('change', (e) => {
      const otherInput = document.getElementById('edit-lead-fail-reason-other');
      if (e.target.value === 'Khác') {
        otherInput.style.display = 'block';
        otherInput.required = true;
      } else {
        otherInput.style.display = 'none';
        otherInput.required = false;
      }
    });
  }

  // Prompt Fail Reason Modal - confirm button
  const btnConfirmFail = document.getElementById('btn-confirm-fail');
  if (btnConfirmFail) {
    btnConfirmFail.addEventListener('click', () => {
      const select = document.getElementById('prompt-fail-reason');
      const otherInput = document.getElementById('prompt-fail-reason-other');
      let reason = select.value;

      if (!reason) {
        showToast('Vui lòng chọn lý do thất bại!', 'warning');
        return;
      }

      if (reason === 'Khác') {
        reason = otherInput.value.trim();
        if (!reason) {
          showToast('Vui lòng nhập lý do cụ thể!', 'warning');
          return;
        }
      }

      closeModal('modal-fail-reason-prompt');
      if (failPromptCallback) {
        failPromptCallback(reason);
        failPromptCallback = null;
      }
    });
  }

  // Prompt Fail Reason select change (toggle other input)
  const promptFailSelect = document.getElementById('prompt-fail-reason');
  if (promptFailSelect) {
    promptFailSelect.addEventListener('change', (e) => {
      const otherInput = document.getElementById('prompt-fail-reason-other');
      if (e.target.value === 'Khác') {
        otherInput.style.display = 'block';
        otherInput.required = true;
      } else {
        otherInput.style.display = 'none';
        otherInput.required = false;
      }
    });
  }
}

function populateSalesDropdown(selectId, selectedId = '') {
  const select = document.getElementById(selectId);
  if (!select) return;
  select.innerHTML = '';

  const salesUsers = AppState.users.filter(u => u.role === 'sales' || u.role === 'admin');
  salesUsers.forEach(u => {
    const opt = document.createElement('option');
    opt.value = u.id;
    opt.innerText = `${u.name} (${u.role.toUpperCase()})`;
    if (u.id === selectedId) {
      opt.selected = true;
    }
    select.appendChild(opt);
  });
}

// ==================== RENDERING KANBAN ==================== //
function renderCRMBoard() {
  const user = getCurrentUser();
  const searchVal = document.getElementById('crm-search').value.toLowerCase().trim();
  
  // Stages definition
  const stages = ['receive_info', 'get_phone', 'consulting', 'quotation', 'negotiating', 'success', 'failed'];
  
  // Clear columns content
  stages.forEach(st => {
    const container = document.querySelector(`.kanban-cards-container[data-stage="${st}"]`);
    if (container) container.innerHTML = '';
  });

  // Filter leads by search query
  const filteredLeads = AppState.leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchVal) || 
                          (lead.phone && lead.phone.includes(searchVal)) ||
                          (lead.note && lead.note.toLowerCase().includes(searchVal));
    return matchesSearch;
  });

  // Render cards
  filteredLeads.forEach(lead => {
    const container = document.querySelector(`.kanban-cards-container[data-stage="${lead.stage}"]`);
    if (!container) return;

    const card = document.createElement('div');
    card.className = `kanban-card ${lead.stage === 'failed' ? 'failed-card' : ''}`;
    card.setAttribute('draggable', (user.role === 'admin' || user.role === 'sales') ? 'true' : 'false');
    card.setAttribute('data-id', lead.id);

    // Get assigned sales name
    const salesUser = AppState.users.find(u => u.id === lead.salesId);
    const salesName = salesUser ? salesUser.name.split(' ').pop() : 'Chưa giao';

    // Show fail reason badge if failed
    const failReasonHtml = (lead.stage === 'failed' && lead.failReason) 
      ? `<div class="card-fail-reason" title="Lý do: ${lead.failReason}"><i class="fa-solid fa-circle-xmark"></i> ${lead.failReason}</div>`
      : '';

    // Values formatted
    const valRmbStr = lead.valRmb > 0 ? formatRmb(lead.valRmb) : '';
    const valVndStr = lead.valVnd > 0 ? formatVnd(lead.valVnd) : '';
    const valDisplay = [valRmbStr, valVndStr].filter(Boolean).join(' / ');

    card.innerHTML = `
      <div class="card-client-name">${lead.name}</div>
      <div class="card-desc">${lead.note || 'Không có ghi chú thêm.'}</div>
      ${failReasonHtml}
      <div class="card-meta">
        <div class="card-phone">
          <i class="fa-solid fa-phone" style="font-size: 10px; margin-right: 4px;"></i>${lead.phone || 'Chưa có SĐT'}
        </div>
        <div class="card-value">${valDisplay}</div>
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px;">
        <span class="card-sales-assignee" title="Sales phụ trách: ${salesUser ? salesUser.name : ''}"><i class="fa-solid fa-headset"></i> ${salesName}</span>
        <span style="font-size: 9px; color: var(--text-muted);">${lead.date}</span>
      </div>
    `;

    // Click card to open detail
    card.addEventListener('click', (e) => {
      // Don't open detail if dragging
      if (card.classList.contains('dragging')) return;
      openLeadDetailModal(lead.id);
    });

    // Drag and Drop events
    if (user.role === 'admin' || user.role === 'sales') {
      card.addEventListener('dragstart', (e) => {
        draggingLeadId = lead.id;
        e.dataTransfer.setData('text/plain', lead.id);
        card.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
      });

      card.addEventListener('dragend', () => {
        card.classList.remove('dragging');
        draggingLeadId = null;
      });
    }

    container.appendChild(card);
  });

  // Setup Column Dragover/Drop listeners (Only if user has edit permission)
  stages.forEach(st => {
    const col = document.getElementById(`col-${st}`);
    const container = col.querySelector('.kanban-cards-container');
    
    // Update counts
    const countSpan = document.getElementById(`count-${st}`);
    const count = AppState.leads.filter(l => l.stage === st).length;
    countSpan.innerText = count;

    if (user.role === 'admin' || user.role === 'sales') {
      // Drag over
      col.addEventListener('dragover', (e) => {
        e.preventDefault();
        col.classList.add('drag-over');
      });

      col.addEventListener('dragleave', () => {
        col.classList.remove('drag-over');
      });

      col.addEventListener('drop', (e) => {
        e.preventDefault();
        col.classList.remove('drag-over');
        const id = e.dataTransfer.getData('text/plain') || draggingLeadId;
        if (id) {
          handleLeadMove(id, st);
        }
      });
    }
  });
}

// ==================== DRAG & DROP LOGIC ==================== //
function handleLeadMove(leadId, targetStage) {
  const lead = AppState.leads.find(l => l.id === leadId);
  if (!lead) return;

  if (lead.stage === targetStage) return;

  const currentRole = getCurrentUser().role;
  if (currentRole !== 'admin' && currentRole !== 'sales') {
    showToast('Bạn không có quyền chuyển đổi trạng thái khách hàng!', 'danger');
    return;
  }

  // If moving to FAILED, ask for reason
  if (targetStage === 'failed') {
    document.getElementById('fail-prompt-client-name').innerText = lead.name;
    document.getElementById('prompt-fail-reason').value = '';
    document.getElementById('prompt-fail-reason-other').value = '';
    document.getElementById('prompt-fail-reason-other').style.display = 'none';
    
    openModal('modal-fail-reason-prompt');
    
    failPromptCallback = (reason) => {
      const oldStage = lead.stage;
      lead.stage = 'failed';
      lead.failReason = reason;
      saveState();
      renderCRMBoard();
      addNotification('Cập nhật CRM', `Khách hàng ${lead.name} đã chuyển sang Thất bại: ${reason}`, 'warning');
    };
  } 
  // If moving to SUCCESS, check and reward points
  else if (targetStage === 'success') {
    const oldStage = lead.stage;
    lead.stage = 'success';
    lead.failReason = null;
    
    // Reward sales owner (+50 points)
    const salesRep = AppState.users.find(u => u.id === lead.salesId);
    if (salesRep) {
      salesRep.points += 50;
      
      const now = new Date();
      const dateStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
      
      AppState.sausageLogs.push({
        id: `log-${Date.now()}`,
        userId: salesRep.id,
        points: 50,
        type: 'success',
        text: `Chốt thành công cơ hội ${lead.name} (+50 Xúc xích)`,
        date: dateStr
      });
      
      saveState();
      renderCRMBoard();
      renderCurrentUser(); // Refresh points display if current user is that sales rep
      addNotification('Đơn Hàng Thành Công 🎉', `Chúc mừng ${salesRep.name} đã chốt đơn hàng trị giá ${formatVnd(lead.valVnd)} từ ${lead.name}! +50 Xúc xích thưởng.`, 'success');
    } else {
      saveState();
      renderCRMBoard();
    }
  } 
  // Standard moves
  else {
    const oldStage = lead.stage;
    lead.stage = targetStage;
    lead.failReason = null;
    saveState();
    renderCRMBoard();
    
    const stageNames = {
      receive_info: 'Nhận thông tin',
      get_phone: 'Lấy SĐT',
      consulting: 'Tư vấn sơ bộ',
      quotation: 'Báo giá',
      negotiating: 'Thương lượng'
    };
    addNotification('Cập nhật CRM', `Di chuyển khách hàng ${lead.name} sang bước: ${stageNames[targetStage]}`, 'info');
  }
}

// ==================== ADD LEAD LOGIC ==================== //
function handleAddLeadSubmit(e) {
  e.preventDefault();
  
  const user = getCurrentUser();
  if (user.role !== 'admin' && user.role !== 'sales') {
    showToast('Chỉ Sales và Admin mới có quyền tạo mới khách hàng.', 'danger');
    return;
  }

  const name = document.getElementById('lead-name').value.trim();
  const phone = document.getElementById('lead-phone').value.trim();
  const wechat = document.getElementById('lead-wechat').value.trim();
  const valRmb = parseInt(document.getElementById('lead-val-rmb').value) || 0;
  const valVnd = parseInt(document.getElementById('lead-val-vnd').value) || 0;
  const note = document.getElementById('lead-note').value.trim();
  const salesId = document.getElementById('lead-sales').value;

  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;

  const newLead = {
    id: `lead-${Date.now()}`,
    name,
    phone,
    wechat,
    valRmb,
    valVnd,
    note,
    salesId,
    stage: 'receive_info',
    failReason: null,
    date: dateStr
  };

  AppState.leads.push(newLead);
  saveState();
  closeModal('modal-add-lead');
  document.getElementById('form-add-lead').reset();
  
  renderCRMBoard();
  
  addNotification('Khách hàng mới', `Đã thêm khách hàng ${name} vào bước Nhận thông tin.`, 'success');
}

// ==================== DETAIL / EDIT LEAD LOGIC ==================== //
function openLeadDetailModal(leadId) {
  const lead = AppState.leads.find(l => l.id === leadId);
  if (!lead) return;

  const user = getCurrentUser();
  const isEditable = (user.role === 'admin' || user.role === 'sales');

  document.getElementById('edit-lead-id').value = lead.id;
  document.getElementById('edit-lead-title-name').innerText = lead.name;
  
  // Set stage badge
  const stageNames = {
    receive_info: 'Nhận thông tin',
    get_phone: 'Lấy SĐT',
    consulting: 'Tư vấn sơ bộ',
    quotation: 'Báo giá',
    negotiating: 'Thương lượng',
    success: 'Thành công',
    failed: 'Thất bại'
  };
  const badge = document.getElementById('edit-lead-stage-badge');
  badge.innerText = stageNames[lead.stage];
  badge.className = 'badge';
  if (lead.stage === 'success') badge.classList.add('bg-emerald');
  else if (lead.stage === 'failed') badge.classList.add('bg-rose');
  else badge.classList.add('bg-blue');

  // Fill form
  document.getElementById('edit-lead-name').value = lead.name;
  document.getElementById('edit-lead-phone').value = lead.phone || '';
  document.getElementById('edit-lead-wechat').value = lead.wechat || '';
  document.getElementById('edit-lead-val-rmb').value = lead.valRmb || 0;
  document.getElementById('edit-lead-val-vnd').value = lead.valVnd || 0;
  document.getElementById('edit-lead-note').value = lead.note || '';
  
  // Populates sales select
  populateSalesDropdown('edit-lead-sales', lead.salesId);
  
  // Stage select
  const stageSelect = document.getElementById('edit-lead-stage');
  stageSelect.value = lead.stage;

  // Fail reason panel logic
  const failGroup = document.getElementById('edit-lead-fail-reason-group');
  const failSelect = document.getElementById('edit-lead-fail-reason');
  const otherInput = document.getElementById('edit-lead-fail-reason-other');

  if (lead.stage === 'failed') {
    failGroup.style.display = 'block';
    failSelect.required = true;
    
    // Check if the reason fits standard options
    const standardOptions = ['Giá dịch vụ cao', 'Thời gian vận chuyển lâu', 'Mất liên lạc / Không nghe máy', 'Đã chọn đối thủ cạnh tranh', 'Không có nhu cầu thực tế'];
    if (lead.failReason && !standardOptions.includes(lead.failReason)) {
      failSelect.value = 'Khác';
      otherInput.value = lead.failReason;
      otherInput.style.display = 'block';
      otherInput.required = true;
    } else {
      failSelect.value = lead.failReason || '';
      otherInput.value = '';
      otherInput.style.display = 'none';
      otherInput.required = false;
    }
  } else {
    failGroup.style.display = 'none';
    failSelect.required = false;
    failSelect.value = '';
    otherInput.value = '';
    otherInput.style.display = 'none';
    otherInput.required = false;
  }

  // Control read-only state based on role
  const form = document.getElementById('form-edit-lead');
  const inputs = form.querySelectorAll('input, textarea, select');
  
  inputs.forEach(inp => {
    if (inp.id !== 'edit-lead-id') {
      inp.disabled = !isEditable;
    }
  });

  const footer = document.getElementById('edit-lead-footer');
  if (isEditable) {
    footer.innerHTML = `
      <button type="button" class="btn btn-outline btn-close-modal" data-modal="modal-lead-detail">Hủy</button>
      <button type="button" class="btn btn-danger mr-auto" id="btn-delete-lead" style="margin-right: auto;"><i class="fa-solid fa-trash"></i> Xóa khách</button>
      <button type="submit" class="btn btn-primary" id="btn-save-lead">Lưu thông tin</button>
    `;
    
    // Wire delete button
    document.getElementById('btn-delete-lead').addEventListener('click', () => {
      if (confirm(`Bạn có chắc chắn muốn xóa khách hàng ${lead.name}? Dữ liệu sẽ mất vĩnh viễn.`)) {
        AppState.leads = AppState.leads.filter(l => l.id !== lead.id);
        saveState();
        closeModal('modal-lead-detail');
        renderCRMBoard();
        addNotification('Xóa khách hàng', `Đã xóa khách hàng ${lead.name} khỏi CRM.`, 'warning');
      }
    });
  } else {
    footer.innerHTML = `<button type="button" class="btn btn-outline btn-close-modal" data-modal="modal-lead-detail">Đóng</button>`;
  }

  // Wire close buttons inside newly updated footer
  footer.querySelectorAll('.btn-close-modal').forEach(btn => {
    btn.addEventListener('click', () => closeModal('modal-lead-detail'));
  });

  openModal('modal-lead-detail');
}

function handleEditLeadSubmit(e) {
  e.preventDefault();

  const user = getCurrentUser();
  if (user.role !== 'admin' && user.role !== 'sales') {
    showToast('Bạn không có quyền sửa thông tin khách hàng.', 'danger');
    return;
  }

  const id = document.getElementById('edit-lead-id').value;
  const lead = AppState.leads.find(l => l.id === id);
  if (!lead) return;

  const oldStage = lead.stage;
  const newStage = document.getElementById('edit-lead-stage').value;

  lead.name = document.getElementById('edit-lead-name').value.trim();
  lead.phone = document.getElementById('edit-lead-phone').value.trim();
  lead.wechat = document.getElementById('edit-lead-wechat').value.trim();
  lead.valRmb = parseInt(document.getElementById('edit-lead-val-rmb').value) || 0;
  lead.valVnd = parseInt(document.getElementById('edit-lead-val-vnd').value) || 0;
  lead.note = document.getElementById('edit-lead-note').value.trim();
  lead.salesId = document.getElementById('edit-lead-sales').value;
  lead.stage = newStage;

  if (newStage === 'failed') {
    const failSelect = document.getElementById('edit-lead-fail-reason');
    let reason = failSelect.value;
    if (reason === 'Khác') {
      reason = document.getElementById('edit-lead-fail-reason-other').value.trim();
    }
    lead.failReason = reason || 'Không có lý do cụ thể';
  } else if (newStage === 'success') {
    lead.failReason = null;
    
    // Reward if transitioned from non-success
    if (oldStage !== 'success') {
      const salesRep = AppState.users.find(u => u.id === lead.salesId);
      if (salesRep) {
        salesRep.points += 50;
        
        const now = new Date();
        const dateStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
        
        AppState.sausageLogs.push({
          id: `log-${Date.now()}`,
          userId: salesRep.id,
          points: 50,
          type: 'success',
          text: `Chốt thành công cơ hội ${lead.name} (+50 Xúc xích)`,
          date: dateStr
        });
        
        addNotification('Đơn Hàng Thành Công 🎉', `Chúc mừng ${salesRep.name} đã chốt đơn hàng! +50 Xúc xích thưởng.`, 'success');
      }
    }
  } else {
    lead.failReason = null;
  }

  saveState();
  closeModal('modal-lead-detail');
  renderCRMBoard();
  renderCurrentUser(); // Refresh header points

  addNotification('Cập nhật khách hàng', `Đã cập nhật thông tin khách hàng ${lead.name}.`, 'info');
}
