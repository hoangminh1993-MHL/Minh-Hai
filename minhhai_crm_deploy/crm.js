// ==================== CRM CONTROLLERS & RENDERERS ==================== //
document.addEventListener('DOMContentLoaded', () => {
  initCRMEvents();
});

let draggingLeadId = null; // Backup reference for touch devices or simple drag tracking
let failPromptCallback = null; // Callback for confirm button on fail modal

function formatDateTime(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${d} ${h}:${min}`;
}

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
      populateSalesDropdown('lead-sales', getCurrentUser().id);
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

  const salesUsers = AppState.users.filter(u => u.role === 'staff' || u.role === 'manager' || u.role === 'admin');
  const roleLabels = { admin: 'Admin', manager: 'Quản lý', staff: 'Nhân viên' };
  salesUsers.forEach(u => {
    const opt = document.createElement('option');
    opt.value = u.id;
    opt.innerText = `${u.name} (${roleLabels[u.role] || u.role})`;
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
  const stages = ['receive_info', 'get_phone', 'explore_info', 'quotation', 'negotiating', 'success', 'failed'];
  
  // Clear columns content
  stages.forEach(st => {
    const container = document.querySelector(`.kanban-cards-container[data-stage="${st}"]`);
    if (container) container.innerHTML = '';
  });

  // Filter leads by search query and user role permission
  const currentUser = getCurrentUser();
  const filteredLeads = AppState.leads.filter(lead => {
    if (currentUser.role !== 'admin' && lead.salesId !== currentUser.id) {
      return false;
    }
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
    card.setAttribute('draggable', (user.role === 'admin' || user.role === 'manager' || user.role === 'staff') ? 'true' : 'false');
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

    // Highlight if updated today
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
    const isUpdatedToday = (lead.updatedTime && lead.updatedTime.startsWith(todayStr)) || (lead.date && lead.date.startsWith(todayStr));
    const timeClass = isUpdatedToday ? 'time-updated-today' : '';

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
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-top: 4px;">
        <span class="card-sales-assignee" title="Người phụ trách: ${salesUser ? salesUser.name : ''}"><i class="fa-solid fa-headset"></i> ${salesName}</span>
        <div style="font-size: 11.5px; line-height: 1.3; color: var(--text-muted); text-align: right; display: flex; flex-direction: column; gap: 2px;">
          <div><i class="fa-solid fa-clock"></i> Tạo: ${lead.createdTime || lead.date}</div>
          <div class="${timeClass}"><i class="fa-solid fa-rotate"></i> Cập nhật: ${lead.updatedTime || lead.createdTime || lead.date}</div>
        </div>
      </div>
    `;

    // Click card to open detail
    card.addEventListener('click', (e) => {
      if (card.classList.contains('dragging')) return;
      openLeadDetailModal(lead.id);
    });

    // Drag and Drop events
    if (user.role === 'admin' || user.role === 'manager' || user.role === 'staff') {
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

  // Setup Column Dragover/Drop listeners
  stages.forEach(st => {
    const col = document.getElementById(`col-${st}`);
    const container = col.querySelector('.kanban-cards-container');
    
    const countSpan = document.getElementById(`count-${st}`);
    const count = AppState.leads.filter(l => l.stage === st).length;
    countSpan.innerText = count;

    if (user.role === 'admin' || user.role === 'manager' || user.role === 'staff') {
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
  if (currentRole !== 'admin' && currentRole !== 'manager' && currentRole !== 'staff') {
    showToast('Bạn không có quyền chuyển đổi trạng thái khách hàng!', 'danger');
    return;
  }

  // Initialize steps if missing
  window.initLeadSteps(lead);

  const stageToStepNum = {
    receive_info: 1,
    get_phone: 2,
    explore_info: 3,
    quotation: 4,
    negotiating: 5,
    success: 6,
    failed: 7
  };

  const currentStepNum = stageToStepNum[lead.stage] || 1;
  const targetStepNum = stageToStepNum[targetStage] || 1;

  // If attempting to advance stage (target step > current step), validate checklist of CURRENT step
  if (targetStepNum > currentStepNum) {
    const currentStepData = lead.steps.find(s => s.stepNum === currentStepNum);
    if (currentStepData && currentStepData.checklist && currentStepData.checklist.length > 0) {
      const requiredPending = currentStepData.checklist.filter(c => c.required && !c.done);
      if (requiredPending.length > 0) {
        showToast(`Bạn cần hoàn thành các việc bắt buộc (*) ở bước hiện tại (${currentStepData.name}) trước khi chuyển bước!`, 'warning');
        renderCRMBoard(); // Reset visual drag status
        return;
      }
    }
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
      lead.updatedTime = formatDateTime(new Date());
      
      // Update step status
      const currentStepData = lead.steps.find(s => s.stepNum === currentStepNum);
      if (currentStepData) currentStepData.status = 'done';
      const failStep = lead.steps.find(s => s.stepNum === 7);
      if (failStep) failStep.status = 'doing';

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
    lead.updatedTime = formatDateTime(new Date());
    
    // Update step status
    const currentStepData = lead.steps.find(s => s.stepNum === currentStepNum);
    if (currentStepData) currentStepData.status = 'done';
    const successStep = lead.steps.find(s => s.stepNum === 6);
    if (successStep) successStep.status = 'doing';

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
      renderCurrentUser(); // Refresh points display
      addNotification('Đơn Hàng Thành Công 🎉', `Chúc mừng ${salesRep.name} đã chốt đơn hàng từ ${lead.name}! +50 Xúc xích thưởng.`, 'success');
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
    lead.updatedTime = formatDateTime(new Date());
    
    // Update step status
    const currentStepData = lead.steps.find(s => s.stepNum === currentStepNum);
    if (currentStepData) currentStepData.status = 'done';
    const nextStep = lead.steps.find(s => s.stepNum === targetStepNum);
    if (nextStep) nextStep.status = 'doing';

    saveState();
    renderCRMBoard();
    
    const stageNames = {
      receive_info: 'Nhận thông tin',
      get_phone: 'Lấy SĐT',
      explore_info: 'Khai thác thông tin',
      quotation: 'Báo giá',
      negotiating: 'Thương lượng'
    };
    addNotification('Cập nhật CRM', `Di chuyển khách hàng ${lead.name} sang bước: ${stageNames[targetStage]}`, 'info');
  }
}

window.initLeadSteps = function initLeadSteps(lead) {
  if (lead.steps && lead.steps.length === 7) return;

  const defaultSteps = [
    {
      stepNum: 1,
      name: "Nhận thông tin",
      assigneeId: lead.salesId || "usr-admin",
      status: lead.stage === "receive_info" ? "doing" : "todo",
      checklist: [
        { text: "Xác định nhu cầu của khách", done: false, required: true },
        { text: "Tạo ghi chú ban đầu về hàng hóa", done: false, required: false }
      ],
      comments: [],
      note: lead.stage === "receive_info" ? (lead.note || "") : ""
    },
    {
      stepNum: 2,
      name: "Lấy SĐT",
      assigneeId: lead.salesId || "usr-admin",
      status: lead.stage === "get_phone" ? "doing" : "todo",
      checklist: [
        { text: "Xin số điện thoại/Zalo liên hệ", done: !!lead.phone, required: true },
        { text: "Xác nhận phương thức liên lạc chính", done: false, required: false }
      ],
      comments: [],
      note: lead.stage === "get_phone" ? (lead.note || "") : ""
    },
    {
      stepNum: 3,
      name: "Khai thác thông tin",
      assigneeId: lead.salesId || "usr-admin",
      status: lead.stage === "explore_info" ? "doing" : "todo",
      checklist: [
        { text: "Tìm hiểu loại mặt hàng & số lượng dự kiến", done: false, required: true },
        { text: "Tìm hiểu địa chỉ nhận hàng tại Việt Nam", done: false, required: true },
        { text: "Hỏi về tần suất nhập hàng (lẻ hay lô)", done: false, required: false }
      ],
      comments: [],
      note: lead.stage === "explore_info" ? (lead.note || "") : ""
    },
    {
      stepNum: 4,
      name: "Báo giá",
      assigneeId: lead.salesId || "usr-admin",
      status: lead.stage === "quotation" ? "doing" : "todo",
      checklist: [
        { text: "Tìm nguồn hàng / Liên hệ xưởng", done: false, required: false },
        { text: "Tính toán thuế phí & cước vận chuyển", done: false, required: true },
        { text: "Gửi báo giá chi tiết cho khách", done: false, required: true }
      ],
      comments: [],
      note: lead.stage === "quotation" ? (lead.note || "") : ""
    },
    {
      stepNum: 5,
      name: "Thương lượng",
      assigneeId: lead.salesId || "usr-admin",
      status: lead.stage === "negotiating" ? "doing" : "todo",
      checklist: [
        { text: "Thảo luận về giá và chính sách cọc", done: false, required: true },
        { text: "Giải đáp thắc mắc của khách", done: false, required: false }
      ],
      comments: [],
      note: lead.stage === "negotiating" ? (lead.note || "") : ""
    },
    {
      stepNum: 6,
      name: "Thành công",
      assigneeId: lead.salesId || "usr-admin",
      status: lead.stage === "success" ? "doing" : "todo",
      checklist: [
        { text: "Xác nhận khách đã đồng ý và cọc (hoặc lên đơn)", done: lead.stage === "success", required: true },
        { text: "Chuyển khách sang danh sách Khách cũ / Tạo lô hàng mới", done: lead.stage === "success", required: false }
      ],
      comments: [],
      note: lead.stage === "success" ? (lead.note || "") : ""
    },
    {
      stepNum: 7,
      name: "Thất bại",
      assigneeId: lead.salesId || "usr-admin",
      status: lead.stage === "failed" ? "doing" : "todo",
      checklist: [
        { text: "Chọn lý do thất bại", done: lead.stage === "failed", required: true },
        { text: "Lưu lịch sử phản hồi để chăm sóc lại sau", done: lead.stage === "failed", required: false }
      ],
      comments: [],
      note: lead.stage === "failed" ? (lead.note || "") : ""
    }
  ];

  const stageToStepNum = {
    receive_info: 1,
    get_phone: 2,
    explore_info: 3,
    quotation: 4,
    negotiating: 5,
    success: 6,
    failed: 7
  };
  const currentStepNum = stageToStepNum[lead.stage] || 1;
  for (let i = 0; i < defaultSteps.length; i++) {
    if (defaultSteps[i].stepNum < currentStepNum) {
      defaultSteps[i].status = "done";
      defaultSteps[i].checklist.forEach(c => c.done = true);
    }
  }
  
  lead.steps = defaultSteps;
  lead.files = lead.files || [];
};

function openLeadDetailModal(leadId) {
  const lead = AppState.leads.find(l => l.id === leadId);
  if (!lead) return;

  // Initialize steps if missing
  window.initLeadSteps(lead);

  currentActiveLeadId = leadId;
  
  const stageToStepNum = {
    receive_info: 1,
    get_phone: 2,
    explore_info: 3,
    quotation: 4,
    negotiating: 5,
    success: 6,
    failed: 7
  };
  currentActiveLeadStepNum = stageToStepNum[lead.stage] || 1;

  document.getElementById('lead-detail-title').innerText = lead.name;
  document.getElementById('lead-detail-subtitle').innerText = `Nguồn: ${lead.source} - SĐT: ${lead.phone || 'Chưa có'}`;

  // Render 7 steps timeline bubbles
  const timeline = document.querySelector('.lead-steps-timeline');
  timeline.innerHTML = '';
  
  const stepNames = [
    "Nhận thông tin", "Lấy SĐT", "Khai thác thông tin", "Báo giá", "Thương lượng", "Thành công", "Thất bại"
  ];

  for (let i = 1; i <= 7; i++) {
    const bubble = document.createElement('div');
    const stepData = lead.steps.find(s => s.stepNum === i) || {};
    
    const leadStepNum = stageToStepNum[lead.stage] || 1;
    let stepStatusClass = 'todo';
    if (i < leadStepNum) stepStatusClass = 'done';
    else if (i === leadStepNum) stepStatusClass = 'doing';
    
    bubble.className = `flow-step-bubble ${stepStatusClass} ${i === currentActiveLeadStepNum ? 'active' : ''}`;
    bubble.innerHTML = `
      <div class="flow-step-circle">${i}</div>
      <span class="flow-step-lbl" style="font-size: 10px;">${stepNames[i - 1]}</span>
    `;

    bubble.onclick = () => {
      document.querySelectorAll('#modal-lead-detail .flow-step-bubble').forEach(b => b.classList.remove('active'));
      bubble.classList.add('active');
      currentActiveLeadStepNum = i;
      renderActiveLeadStepPanel();
    };

    timeline.appendChild(bubble);
  }

  renderActiveLeadStepPanel();

  // Wire delete button
  document.getElementById('btn-lead-delete').onclick = () => {
    if (confirm(`Bạn chắc chắn muốn xóa cơ hội khách hàng "${lead.name}"? Dữ liệu sẽ mất vĩnh viễn.`)) {
      AppState.leads = AppState.leads.filter(l => l.id !== leadId);
      saveState();
      closeModal('modal-lead-detail');
      renderCRMBoard();
      addNotification('Xóa khách hàng', `Đã xóa khách hàng khỏi CRM.`, 'warning');
    }
  };

  // Wire buttons inside modal
  document.getElementById('btn-lead-step-save').onclick = handleSaveActiveLeadStepData;
  document.getElementById('btn-lead-step-add-chk').onclick = handleLeadAddStepChecklistItem;
  document.getElementById('btn-lead-step-add-file').onclick = handleLeadAddStepFile;
  document.getElementById('btn-lead-step-add-comment').onclick = handleLeadAddStepComment;

  openModal('modal-lead-detail');
}

function renderActiveLeadStepPanel() {
  const lead = AppState.leads.find(l => l.id === currentActiveLeadId);
  if (!lead) return;

  const stepData = lead.steps.find(s => s.stepNum === currentActiveLeadStepNum);
  if (!stepData) return;

  const stepNames = [
    "Nhận thông tin", "Lấy SĐT", "Khai thác thông tin", "Báo giá", "Thương lượng", "Thành công", "Thất bại"
  ];

  document.getElementById('lead-step-panel-title').innerText = `Bước ${currentActiveLeadStepNum}: ${stepNames[currentActiveLeadStepNum - 1]}`;

  const assigneeSelect = document.getElementById('lead-step-assignee');
  assigneeSelect.innerHTML = '';
  AppState.users.forEach(u => {
    const opt = document.createElement('option');
    opt.value = u.id;
    opt.innerText = u.name;
    if (u.id === (stepData.assigneeId || lead.salesId)) opt.selected = true;
    assigneeSelect.appendChild(opt);
  });

  document.getElementById('lead-step-phone').value = lead.phone || '';
  document.getElementById('lead-step-source').value = lead.source || 'Fanpage';
  document.getElementById('lead-step-deadline').value = stepData.deadline || '';
  document.getElementById('lead-step-note').value = stepData.note || '';

  const valRow = document.getElementById('lead-step-values-row');
  if (currentActiveLeadStepNum === 6) {
    valRow.style.display = 'flex';
    document.getElementById('lead-step-val-rmb').value = lead.valRmb || 0;
    document.getElementById('lead-step-val-vnd').value = lead.valVnd || 0;
  } else {
    valRow.style.display = 'none';
  }

  const failGroup = document.getElementById('lead-step-fail-group');
  if (currentActiveLeadStepNum === 7) {
    failGroup.style.display = 'block';
    document.getElementById('lead-step-fail-reason').value = lead.failReason || '';
  } else {
    failGroup.style.display = 'none';
  }

  const chkContainer = document.getElementById('lead-step-checklist-container');
  chkContainer.innerHTML = '';
  if (stepData.checklist && stepData.checklist.length > 0) {
    stepData.checklist.forEach((item, idx) => {
      const row = document.createElement('div');
      row.style.cssText = 'display:flex; justify-content:space-between; align-items:center; background:#111827; padding:4px 8px; border-radius:4px; margin-bottom: 4px;';
      
      const label = document.createElement('label');
      label.style.cssText = 'display:flex; align-items:center; gap:8px; font-size:12.5px; cursor:pointer; margin: 0;';
      label.innerHTML = `
        <input type="checkbox" ${item.done ? 'checked' : ''}>
        <span style="${item.done ? 'text-decoration:line-through; opacity:0.6;' : ''}">${item.text} ${item.required ? '<span style="color:#ef4444;">*</span>' : ''}</span>
      `;
      
      label.querySelector('input').onchange = (e) => {
        item.done = e.target.checked;
        renderActiveLeadStepPanel();
      };

      const btnDel = document.createElement('button');
      btnDel.type = 'button';
      btnDel.className = 'btn btn-sm btn-outline';
      btnDel.style.cssText = 'padding: 2px 6px; font-size:10px; color:#ef4444; border-color:rgba(239,68,68,0.2);';
      btnDel.innerHTML = '<i class="fa-solid fa-trash"></i>';
      btnDel.onclick = () => {
        stepData.checklist.splice(idx, 1);
        renderActiveLeadStepPanel();
      };

      row.appendChild(label);
      row.appendChild(btnDel);
      chkContainer.appendChild(row);
    });
  } else {
    chkContainer.innerHTML = `<span class="text-muted" style="font-size:12px; font-style:italic;">Không có checklist.</span>`;
  }

  const filesContainer = document.getElementById('lead-step-files-list');
  filesContainer.innerHTML = '';
  const stepFiles = lead.files ? lead.files.filter(f => f.stepNum === currentActiveLeadStepNum) : [];
  if (stepFiles.length > 0) {
    stepFiles.forEach((file, idx) => {
      const row = document.createElement('div');
      row.style.cssText = 'display:flex; flex-direction:column; gap:4px; font-size:12px; background:#111827; padding:6px 8px; border-radius:4px; margin-bottom:4px;';
      
      const fileInfo = document.createElement('div');
      fileInfo.style.cssText = 'display:flex; justify-content:space-between; align-items:center;';
      fileInfo.innerHTML = `
        <a href="${file.url}" target="_blank" style="color:var(--color-info); text-decoration:underline;"><i class="fa-solid fa-file-arrow-up"></i> ${file.name}</a>
        <button type="button" class="btn btn-sm btn-outline" style="padding:2px 6px; font-size:10px; color:#ef4444;" title="Xóa file"><i class="fa-solid fa-trash"></i></button>
      `;
      
      fileInfo.querySelector('button').onclick = () => {
        const leadFileIdx = lead.files.findIndex(f => f.name === file.name && f.url === file.url && f.stepNum === currentActiveLeadStepNum);
        if (leadFileIdx !== -1) {
          lead.files.splice(leadFileIdx, 1);
        }
        renderActiveLeadStepPanel();
      };
      row.appendChild(fileInfo);
      filesContainer.appendChild(row);
    });
  } else {
    filesContainer.innerHTML = `<span class="text-muted" style="font-size:12px; font-style:italic;">Chưa có tài liệu đính kèm bước.</span>`;
  }

  const commentsContainer = document.getElementById('lead-step-comments');
  commentsContainer.innerHTML = '';
  if (stepData.comments && stepData.comments.length > 0) {
    stepData.comments.forEach(c => {
      const div = document.createElement('div');
      div.style.cssText = 'font-size:12px; padding:4px 6px; background:rgba(255,255,255,0.03); border-radius:4px; margin-bottom:4px;';
      div.innerHTML = `<strong style="color:var(--color-primary);">${c.user}:</strong> <span>${c.text}</span> <span style="font-size:10px; color:var(--text-muted); float:right; margin-top:2px;">${c.date}</span>`;
      commentsContainer.appendChild(div);
    });
  } else {
    commentsContainer.innerHTML = `<span class="text-muted" style="font-size:12px; font-style:italic;">Chưa có thảo luận nào ở bước này.</span>`;
  }
}

function handleSaveActiveLeadStepData() {
  const lead = AppState.leads.find(l => l.id === currentActiveLeadId);
  if (!lead) return;

  const stepData = lead.steps.find(s => s.stepNum === currentActiveLeadStepNum);
  if (!stepData) return;

  const stageToStepNum = {
    receive_info: 1,
    get_phone: 2,
    explore_info: 3,
    quotation: 4,
    negotiating: 5,
    success: 6,
    failed: 7
  };
  const stepNumToStage = {
    1: 'receive_info',
    2: 'get_phone',
    3: 'explore_info',
    4: 'quotation',
    5: 'negotiating',
    6: 'success',
    7: 'failed'
  };

  const currentStepNum = stageToStepNum[lead.stage] || 1;

  lead.phone = document.getElementById('lead-step-phone').value.trim();
  lead.source = document.getElementById('lead-step-source').value;
  
  const assigneeId = document.getElementById('lead-step-assignee').value;
  stepData.assigneeId = assigneeId;
  lead.salesId = assigneeId;
  
  stepData.deadline = document.getElementById('lead-step-deadline').value;
  stepData.note = document.getElementById('lead-step-note').value;

  if (currentActiveLeadStepNum === 6) {
    lead.valRmb = parseFloat(document.getElementById('lead-step-val-rmb').value) || 0;
    lead.valVnd = parseFloat(document.getElementById('lead-step-val-vnd').value) || 0;
  }
  if (currentActiveLeadStepNum === 7) {
    lead.failReason = document.getElementById('lead-step-fail-reason').value;
  }

  if (currentActiveLeadStepNum !== currentStepNum) {
    if (currentActiveLeadStepNum > currentStepNum) {
      const currentStepData = lead.steps.find(s => s.stepNum === currentStepNum);
      const requiredPending = currentStepData.checklist.filter(c => c.required && !c.done);
      if (requiredPending.length > 0) {
        showToast(`Bạn cần hoàn thành các việc bắt buộc (*) ở bước hiện tại (${currentStepData.name}) trước khi chuyển sang bước tiếp theo!`, 'warning');
        return;
      }
    }

    const currentStepData = lead.steps.find(s => s.stepNum === currentStepNum);
    currentStepData.status = 'done';

    const targetStage = stepNumToStage[currentActiveLeadStepNum];
    
    if (targetStage === 'success') {
      if (lead.stage !== 'success') {
        const salesRep = AppState.users.find(u => u.id === lead.salesId);
        if (salesRep) {
          salesRep.points = (salesRep.points || 0) + 50;
          
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
        }
      }
    }

    lead.stage = targetStage;
    stepData.status = 'doing';
    lead.updatedTime = formatDateTime(new Date());

    const stepNames = [
      "Nhận thông tin", "Lấy SĐT", "Khai thác thông tin", "Báo giá", "Thương lượng", "Thành công", "Thất bại"
    ];
    addNotification('Cập nhật CRM', `Di chuyển khách hàng ${lead.name} sang bước: ${stepNames[currentActiveLeadStepNum - 1]}`, 'info');
  }

  saveState();
  renderCRMBoard();
  closeModal('modal-lead-detail');
  showToast('Lưu thông tin bước thành công!', 'success');
  renderCurrentUser();
}

function handleLeadAddStepChecklistItem() {
  const lead = AppState.leads.find(l => l.id === currentActiveLeadId);
  if (!lead) return;

  const stepData = lead.steps.find(s => s.stepNum === currentActiveLeadStepNum);
  if (!stepData) return;

  const input = document.getElementById('lead-step-new-chk');
  const val = input.value.trim();
  if (!val) return;

  stepData.checklist = stepData.checklist || [];
  stepData.checklist.push({
    text: val,
    done: false,
    required: false
  });

  input.value = '';
  renderActiveLeadStepPanel();
}

function handleLeadAddStepFile() {
  const lead = AppState.leads.find(l => l.id === currentActiveLeadId);
  if (!lead) return;

  const nameInput = document.getElementById('lead-step-new-file-name');
  const urlInput = document.getElementById('lead-step-new-file-url');

  const name = nameInput.value.trim();
  const url = urlInput.value.trim();

  if (!name || !url) {
    showToast('Vui lòng nhập tên tài liệu và đường dẫn link!', 'warning');
    return;
  }

  lead.files = lead.files || [];
  lead.files.push({
    name: name,
    url: url,
    stepNum: currentActiveLeadStepNum,
    date: formatDateTime(new Date()).substring(0, 10)
  });

  nameInput.value = '';
  urlInput.value = '';
  renderActiveLeadStepPanel();
}

function handleLeadAddStepComment() {
  const lead = AppState.leads.find(l => l.id === currentActiveLeadId);
  if (!lead) return;

  const stepData = lead.steps.find(s => s.stepNum === currentActiveLeadStepNum);
  if (!stepData) return;

  const input = document.getElementById('lead-step-new-comment');
  const val = input.value.trim();
  if (!val) return;

  const currentUser = getCurrentUser();
  stepData.comments = stepData.comments || [];
  stepData.comments.push({
    user: currentUser.name || 'Người dùng',
    text: val,
    date: formatDateTime(new Date()).substring(11, 16) + ' ' + formatDateTime(new Date()).substring(8, 10) + '/' + formatDateTime(new Date()).substring(5, 7)
  });

  input.value = '';
  renderActiveLeadStepPanel();
}

// ==================== AUTO DRAG SCROLL HELPER ==================== //
let dragScrollInterval = null;

document.addEventListener('dragover', (e) => {
  if (!draggingLeadId) return;
  
  const boardWrapper = document.querySelector('.kanban-board-wrapper');
  if (!boardWrapper) return;
  
  const mouseX = e.clientX;
  const width = window.innerWidth;
  const edgeSize = 120; // threshold pixels from screen edge
  const scrollSpeed = 15;
  
  if (mouseX < edgeSize) {
    if (!dragScrollInterval) {
      dragScrollInterval = setInterval(() => {
        boardWrapper.scrollLeft -= scrollSpeed;
      }, 15);
    }
  } else if (width - mouseX < edgeSize) {
    if (!dragScrollInterval) {
      dragScrollInterval = setInterval(() => {
        boardWrapper.scrollLeft += scrollSpeed;
      }, 15);
    }
  } else {
    if (dragScrollInterval) {
      clearInterval(dragScrollInterval);
      dragScrollInterval = null;
    }
  }
});

document.addEventListener('dragend', () => {
  if (dragScrollInterval) {
    clearInterval(dragScrollInterval);
    dragScrollInterval = null;
  }
});

document.addEventListener('drop', () => {
  if (dragScrollInterval) {
    clearInterval(dragScrollInterval);
    dragScrollInterval = null;
  }
});

// ==================== ADD LEAD LOGIC ==================== //
function handleAddLeadSubmit(e) {
  e.preventDefault();

  const name = document.getElementById('lead-name').value.trim();
  const phone = document.getElementById('lead-phone').value.trim();
  const source = document.getElementById('lead-source').value;
  const valRmb = parseInt(document.getElementById('lead-val-rmb').value) || 0;
  const valVnd = parseInt(document.getElementById('lead-val-vnd').value) || 0;
  const note = document.getElementById('lead-note').value.trim();
  const salesId = document.getElementById('lead-sales').value;

  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
  const nowStr = formatDateTime(now);

  const newLead = {
    id: `lead-${Date.now()}`,
    name,
    phone,
    source,
    valRmb,
    valVnd,
    note,
    salesId,
    stage: 'receive_info',
    failReason: null,
    date: dateStr,
    createdTime: nowStr,
    updatedTime: nowStr
  };

  window.initLeadSteps(newLead);
  AppState.leads.push(newLead);
  saveState();
  closeModal('modal-add-lead');
  document.getElementById('form-add-lead').reset();
  
  renderCRMBoard();
  
  addNotification('Khách hàng mới', `Đã thêm khách hàng ${name} vào bước Nhận thông tin.`, 'success');
}
