// ==================== CRM CONTROLLERS & RENDERERS ==================== //
document.addEventListener('DOMContentLoaded', () => {
  initCRMEvents();
});

let draggingLeadId = null; // Backup reference for touch devices or simple drag tracking
let failPromptCallback = null; // Callback for confirm button on fail modal

function formatDateTime(date) {
  if (!date) return '';
  if (typeof date === 'string' || typeof date === 'number') {
    date = new Date(date);
  }
  if (isNaN(date.getTime())) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${d} ${h}:${min}`;
}

function initCRMEvents() {
  // View mode toggling
  const btnBoard = document.getElementById('btn-crm-view-board');
  const btnList = document.getElementById('btn-crm-view-list');
  if (btnBoard && btnList) {
    btnBoard.onclick = () => {
      AppState.crmViewMode = 'board';
      saveState();
      renderCRMBoard();
    };
    btnList.onclick = () => {
      AppState.crmViewMode = 'list';
      saveState();
      renderCRMBoard();
    };
  }

  // Sortable headers in list view
  document.querySelectorAll('.crm-sortable-header').forEach(header => {
    header.addEventListener('click', () => {
      const field = header.getAttribute('data-field');
      if (AppState.crmSortField === field) {
        AppState.crmSortOrder = AppState.crmSortOrder === 'asc' ? 'desc' : 'asc';
      } else {
        AppState.crmSortField = field;
        AppState.crmSortOrder = 'asc';
      }
      saveState();
      renderCRMBoard();
    });
  });

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
      const evidenceInput = document.getElementById('prompt-fail-evidence');
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

      const evidence = evidenceInput.value.trim();
      if (!evidence) {
        showToast('Vui lòng nhập link bằng chứng thất bại bắt buộc!', 'warning');
        return;
      }

      closeModal('modal-fail-reason-prompt');
      if (failPromptCallback) {
        failPromptCallback(reason, evidence);
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
  // Sanitize checklists for all leads: remove all default checklist items
  if (AppState.leads) {
    AppState.leads.forEach(lead => {
      if (lead.steps) {
        lead.steps.forEach(s => {
          s.checklist = [];
        });
      }
    });
  }

  // Auto-heal tasks for any lead currently in quotation stage
  let stateChanged = false;

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
    const isSpecialAccess = currentUser.role === 'admin' || currentUser.username === 'minhphuong';
    if (currentUser && !isSpecialAccess && lead.salesId !== currentUser.id) {
      return false;
    }
    const matchesSearch = lead.name.toLowerCase().includes(searchVal) || 
                          (lead.phone && lead.phone.includes(searchVal)) ||
                          (lead.note && lead.note.toLowerCase().includes(searchVal));
    return matchesSearch;
  });

  // Synchronize toggle UI state
  const viewMode = AppState.crmViewMode || 'board';
  const btnBoard = document.getElementById('btn-crm-view-board');
  const btnList = document.getElementById('btn-crm-view-list');
  const kanbanWrapper = document.getElementById('crm-kanban-wrapper');
  const listWrapper = document.getElementById('crm-list-wrapper');

  if (btnBoard && btnList && kanbanWrapper && listWrapper) {
    if (viewMode === 'list') {
      btnList.classList.add('active');
      btnList.style.background = 'var(--color-primary)';
      btnList.style.color = 'white';
      btnBoard.classList.remove('active');
      btnBoard.style.background = 'transparent';
      btnBoard.style.color = 'var(--text-secondary)';
      kanbanWrapper.style.display = 'none';
      listWrapper.style.display = 'block';
    } else {
      btnBoard.classList.add('active');
      btnBoard.style.background = 'var(--color-primary)';
      btnBoard.style.color = 'white';
      btnList.classList.remove('active');
      btnList.style.background = 'transparent';
      btnList.style.color = 'var(--text-secondary)';
      kanbanWrapper.style.display = 'block';
      listWrapper.style.display = 'none';
    }
  }

  if (viewMode === 'list') {
    // Sort leads if in list view and sort configuration is set
    const crmSortField = AppState.crmSortField || 'name';
    const crmSortOrder = AppState.crmSortOrder || 'asc';

    filteredLeads.sort((a, b) => {
      let valA = '';
      let valB = '';
      
      if (crmSortField === 'name') {
        valA = a.name || '';
        valB = b.name || '';
      } else if (crmSortField === 'phone') {
        valA = a.phone || '';
        valB = b.phone || '';
      } else if (crmSortField === 'source') {
        valA = a.source || '';
        valB = b.source || '';
      } else if (crmSortField === 'sales') {
        const uA = AppState.users.find(u => u.id === a.salesId);
        const uB = AppState.users.find(u => u.id === b.salesId);
        valA = uA ? uA.name : '';
        valB = uB ? uB.name : '';
      } else if (crmSortField === 'stage') {
        const stagesOrder = ['receive_info', 'get_phone', 'explore_info', 'quotation', 'negotiating', 'success', 'failed'];
        valA = stagesOrder.indexOf(a.stage);
        valB = stagesOrder.indexOf(b.stage);
      } else if (crmSortField === 'updated') {
        valA = a.updatedTime || a.createdTime || a.date || '';
        valB = b.updatedTime || b.createdTime || b.date || '';
      }
      
      if (valA < valB) return crmSortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return crmSortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    // Update header sort icons
    document.querySelectorAll('.crm-sortable-header').forEach(header => {
      const field = header.getAttribute('data-field');
      const iconSpan = header.querySelector('.sort-icon');
      if (iconSpan) {
        if (field === crmSortField) {
          iconSpan.innerHTML = crmSortOrder === 'asc' ? ' ▲' : ' ▼';
          iconSpan.style.opacity = '1';
        } else {
          iconSpan.innerHTML = ' ⇅';
          iconSpan.style.opacity = '0.3';
        }
      }
    });

    const listBody = document.getElementById('crm-list-table-body');
    if (listBody) {
      listBody.innerHTML = '';
      if (filteredLeads.length === 0) {
        listBody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 20px; color: var(--text-muted);">Không tìm thấy khách hàng nào.</td></tr>`;
      } else {
        filteredLeads.forEach(lead => {
          const salesUser = AppState.users.find(u => u.id === lead.salesId);
          const salesName = salesUser ? salesUser.name : 'Chưa giao';
          
          const stageLabels = {
            receive_info: 'Nhận thông tin',
            get_phone: 'Lấy SĐT',
            explore_info: 'Khai thác thông tin',
            quotation: 'Báo giá',
            negotiating: 'Thương lượng',
            success: 'Thành công',
            failed: 'Thất bại'
          };
          
          const stageColors = {
            receive_info: '#3b82f6',
            get_phone: '#8b5cf6',
            explore_info: '#f97316',
            quotation: '#eab308',
            negotiating: '#f97316',
            success: '#10b981',
            failed: '#ef4444'
          };
          
          const stageBadge = `<span class="badge" style="background: ${stageColors[lead.stage] || '#6b7280'}; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 11px;">${stageLabels[lead.stage] || lead.stage}</span>`;
          
          const tr = document.createElement('tr');
          tr.style.borderBottom = '1px solid var(--border-color)';
          tr.style.cursor = 'pointer';
          tr.addEventListener('click', () => {
            openLeadDetailModal(lead.id);
          });
          
          tr.innerHTML = `
            <td style="padding: 12px 10px; font-weight: bold; color: var(--color-primary);">${lead.name}</td>
            <td style="padding: 12px 10px; color: var(--text-secondary);">${lead.phone || 'Chưa có'}</td>
            <td style="padding: 12px 10px; color: var(--text-secondary);">${lead.source || 'Trực tiếp'}</td>
            <td style="padding: 12px 10px; color: var(--text-secondary);">${salesName}</td>
            <td style="padding: 12px 10px;">${stageBadge}</td>
            <td style="padding: 12px 10px; color: var(--text-muted); max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${lead.note || ''}">${lead.note || 'Không có ghi chú.'}</td>
            <td style="padding: 12px 10px; color: var(--text-secondary); font-size: 12px;">${lead.updatedTime || lead.createdTime || lead.date || ''}</td>
            <td style="padding: 12px 10px; text-align: center;" onclick="event.stopPropagation();">
              <button class="btn btn-sm btn-outline" onclick="openLeadDetailModal('${lead.id}')" style="padding: 4px 8px; font-size: 11px;"><i class="fa-solid fa-pen-to-square"></i> Chi tiết</button>
            </td>
          `;
          listBody.appendChild(tr);
        });
      }
    }
    
    // Still update column counts in background
    stages.forEach(st => {
      const countSpan = document.getElementById(`count-${st}`);
      if (countSpan) {
        const count = AppState.leads.filter(l => l.stage === st).length;
        countSpan.innerText = count;
      }
    });
    return;
  }

  // Render cards
  filteredLeads.forEach(lead => {
    const container = document.querySelector(`.kanban-cards-container[data-stage="${lead.stage}"]`);
    if (!container) return;

    const card = document.createElement('div');
    const isOverdue = typeof checkLeadOverdue === 'function' ? checkLeadOverdue(lead) : false;
    card.className = `kanban-card ${lead.stage === 'failed' ? 'failed-card' : ''} ${isOverdue ? 'overdue-card' : ''}`;
    card.setAttribute('draggable', (user.role === 'admin' || user.role === 'manager' || user.role === 'staff') ? 'true' : 'false');
    card.setAttribute('data-id', lead.id);

    // Get assigned sales name
    const salesUser = AppState.users.find(u => u.id === lead.salesId);
    const salesName = salesUser ? salesUser.name.split(' ').pop() : 'Chưa giao';

    // Show fail reason badge if failed
    let failReasonHtml = '';
    if (lead.stage === 'failed') {
      const appColor = lead.failApproved ? '#10b981' : '#f59e0b';
      const appIcon = lead.failApproved ? 'fa-circle-check' : 'fa-clock';
      const appText = lead.failApproved ? 'Đã duyệt thất bại' : 'Chờ duyệt thất bại';
      
      failReasonHtml = `
        <div class="card-fail-reason" title="Lý do: ${lead.failReason || 'Chưa rõ'}"><i class="fa-solid fa-circle-xmark"></i> ${lead.failReason || 'Chưa rõ'}</div>
        <div class="card-fail-reason" style="background: rgba(31,41,55,0.2); border: 1px solid ${appColor}; color: ${appColor}; font-weight: bold; margin-top: 4px;" title="Trạng thái duyệt của quản lý">
          <i class="fa-solid ${appIcon}"></i> ${appText}
        </div>
      `;
    }

    // Values formatted
    const valRmbStr = lead.valRmb > 0 ? formatRmb(lead.valRmb) : '';
    const valVndStr = lead.valVnd > 0 ? formatVnd(lead.valVnd) : '';
    const valDisplay = [valRmbStr, valVndStr].filter(Boolean).join(' / ');

    // Highlight if updated today
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
    const isUpdatedToday = (lead.updatedTime && lead.updatedTime.startsWith(todayStr)) || (lead.date && lead.date.startsWith(todayStr));
    const timeClass = isUpdatedToday ? 'time-updated-today' : '';

    const overdueBadge = isOverdue 
      ? `<div class="card-fail-reason" style="background:rgba(239,68,68,0.15); color:#ef4444;" title="Quá hạn chót khâu này!"><i class="fa-solid fa-triangle-exclamation"></i> Quá hạn</div>` 
      : '';

    card.innerHTML = `
      <div class="card-client-name">${lead.name}</div>
      <div class="card-desc">${lead.note || 'Không có ghi chú thêm.'}</div>
      ${failReasonHtml}
      ${overdueBadge}
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
          <div class="${timeClass}" style="color: #38bdf8; font-weight: 600;"><i class="fa-solid fa-rotate"></i> Cập nhật: ${lead.updatedTime || lead.createdTime || lead.date}</div>
        </div>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 6px; padding-top: 6px; border-top: 1px solid rgba(255,255,255,0.05);">
        <div style="display: flex; flex-direction: column; gap: 2px;">
          <span style="font-size: 9.5px; color: var(--text-muted); font-weight: bold;"><i class="fa-solid fa-share-nodes"></i> Nguồn KH:</span>
          <select class="card-source-select" style="font-size: 10px; width: 100%; padding: 2px 4px; background: #1f2937; color: #e5e7eb; border: 1px solid #4b5563; border-radius: 4px; cursor: pointer;" onclick="event.stopPropagation();">
            <option value="Fanpage" ${lead.source === 'Fanpage' ? 'selected' : ''}>Fanpage</option>
            <option value="KH cũ" ${lead.source === 'KH cũ' ? 'selected' : ''}>KH cũ</option>
            <option value="BNI" ${lead.source === 'BNI' ? 'selected' : ''}>BNI</option>
            <option value="GT" ${lead.source === 'GT' ? 'selected' : ''}>GT</option>
            <option value="Cá nhân" ${lead.source === 'Cá nhân' ? 'selected' : ''}>Cá nhân</option>
            <option value="Giới thiệu" ${lead.source === 'Giới thiệu' ? 'selected' : ''}>Giới thiệu</option>
          </select>
        </div>
        <div style="display: flex; flex-direction: column; gap: 2px;">
          <span style="font-size: 9.5px; color: var(--text-muted); font-weight: bold;"><i class="fa-solid fa-right-left"></i> Chuyển bước:</span>
          <select class="card-stage-select" style="font-size: 10px; width: 100%; padding: 2px 4px; background: #1f2937; color: #e5e7eb; border: 1px solid #4b5563; border-radius: 4px; cursor: pointer;" onclick="event.stopPropagation();">
            <option value="" disabled selected>Chọn...</option>
            <option value="receive_info" ${lead.stage === 'receive_info' ? 'disabled' : ''}>1. Nhận thông tin</option>
            <option value="get_phone" ${lead.stage === 'get_phone' ? 'disabled' : ''}>2. Lấy SĐT</option>
            <option value="explore_info" ${lead.stage === 'explore_info' ? 'disabled' : ''}>3. Khai thác TT</option>
            <option value="quotation" ${lead.stage === 'quotation' ? 'disabled' : ''}>4. Báo giá</option>
            <option value="negotiating" ${lead.stage === 'negotiating' ? 'disabled' : ''}>5. Thương lượng</option>
            <option value="success" ${lead.stage === 'success' ? 'disabled' : ''}>6. Thành công</option>
            <option value="failed" ${lead.stage === 'failed' ? 'disabled' : ''}>7. Thất bại</option>
          </select>
        </div>
      </div>
    `;

    // Click card to open detail
    card.addEventListener('click', (e) => {
      if (e.target.closest('.card-stage-select') || e.target.closest('.card-source-select')) return;
      if (card.classList.contains('dragging')) return;
      openLeadDetailModal(lead.id);
    });

    const select = card.querySelector('.card-stage-select');
    if (select) {
      select.addEventListener('change', (e) => {
        const val = e.target.value;
        if (val) {
          handleLeadMove(lead.id, val);
        }
      });
    }

    const sourceSelect = card.querySelector('.card-source-select');
    if (sourceSelect) {
      sourceSelect.addEventListener('change', (e) => {
        const val = e.target.value;
        if (val) {
          lead.source = val;
          lead.updatedTime = formatDateTime(new Date());
          saveState();
          
          if (typeof renderDashboard === 'function') renderDashboard();
          if (typeof renderCRMBoard === 'function') renderCRMBoard();
          
          addNotification('Cập nhật Nguồn', `Đã chuyển nguồn khách hàng ${lead.name} sang: ${val}`, 'info');
        }
      });
    }

    // Drag and Drop events
    if (user.role === 'admin' || user.role === 'manager' || user.role === 'staff') {
      card.addEventListener('dragstart', (e) => {
        draggingLeadId = lead.id;
        e.dataTransfer.setData('text/plain', lead.id);
        card.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        document.getElementById('crm-kanban-board')?.classList.add('board-dragging');
      });

      card.addEventListener('dragend', () => {
        card.classList.remove('dragging');
        draggingLeadId = null;
        document.getElementById('crm-kanban-board')?.classList.remove('board-dragging');
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
      col.ondragover = (e) => {
        e.preventDefault();
        col.classList.add('drag-over');
      };

      col.ondragleave = () => {
        col.classList.remove('drag-over');
      };

      col.ondrop = (e) => {
        e.preventDefault();
        col.classList.remove('drag-over');
        const id = e.dataTransfer.getData('text/plain') || draggingLeadId;
        if (id) {
          handleLeadMove(id, st);
        }
      };
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

  // Validate files when transitioning from explore_info (Step 3) to quotation (Step 4)
  if (currentStepNum === 3 && targetStepNum === 4) {
    const files = lead.files || [];
    if (files.length === 0) {
      showToast("Để chuyển sang bước Báo giá, bạn bắt buộc phải đính kèm Tài liệu thông tin lô hàng vào mục tài liệu đính kèm!", "warning");
      renderCRMBoard(); // Reset visual drag status
      return;
    }
  }

  // Validate files and tasks when transitioning from quotation (Step 4) to negotiating (Step 5) or success (Step 6)
  if (currentStepNum === 4 && (targetStepNum === 5 || targetStepNum === 6)) {
    const files = lead.files || [];
    const hasImage = files.some(f => 
      /\.(jpg|jpeg|png|webp|gif|bmp)$/i.test(f.url) || 
      f.name.toLowerCase().includes('ảnh') || 
      f.name.toLowerCase().includes('hình') ||
      f.name.toLowerCase().includes('image') ||
      f.name.toLowerCase().includes('img') ||
      f.name.toLowerCase().includes('báo giá') ||
      f.name.toLowerCase().includes('bao gia')
    );
    if (!hasImage) {
      showToast("Để chuyển sang bước Thương lượng, bạn bắt buộc phải chèn Hình ảnh báo giá vào mục tài liệu đính kèm!", "warning");
      renderCRMBoard(); // Reset visual drag status
      return;
    }

    const quoteFeedback = (lead.quoteFeedback || '').trim();
    if (quoteFeedback.length < 3) {
      showToast("Bạn bắt buộc phải nhập rõ Tình trạng khách hàng sau báo giá vào ô nhập liệu ở Bước 4!", "warning");
      renderCRMBoard(); // Reset visual drag status
      return;
    }

    saveState();
  }

  // If moving to FAILED, ask for reason
  if (targetStage === 'failed') {
    document.getElementById('fail-prompt-client-name').innerText = lead.name;
    document.getElementById('prompt-fail-reason').value = '';
    document.getElementById('prompt-fail-reason-other').value = '';
    document.getElementById('prompt-fail-reason-other').style.display = 'none';
    document.getElementById('prompt-fail-evidence').value = '';
    
    openModal('modal-fail-reason-prompt');
    
    failPromptCallback = (reason, evidence) => {
      const allowedFailReasons = [
        "Không đủ năng lực xử lý hàng",
        "Hàng khó từ chối",
        "Khách lẻ, hàng khó => chủ động từ chối",
        "Không tìm được hàng cho KH"
      ];
      
      const isNegotiationReason = !allowedFailReasons.includes(reason);
      
      if (isNegotiationReason) {
        showToast("Lý do này thuộc khâu Thương lượng! Hệ thống đã chuyển khách hàng sang cột Thương lượng.", "info");
        
        lead.stage = 'negotiation';
        lead.stageEntryTimes = lead.stageEntryTimes || {};
        lead.stageEntryTimes['negotiation'] = Date.now();
        lead.failReason = null;
        lead.failEvidence = null;
        lead.failApproved = null;
        lead.updatedTime = formatDateTime(new Date());
        
        const currentStepData = lead.steps.find(s => s.stepNum === currentStepNum);
        if (currentStepData) currentStepData.status = 'done';
        const negoStep = lead.steps.find(s => s.stepNum === 5); // Negotiation step
        if (negoStep) negoStep.status = 'doing';

        saveState();
        renderCRMBoard();
        return;
      }

      const oldStage = lead.stage;
      lead.stage = 'failed';
      lead.stageEntryTimes = lead.stageEntryTimes || {};
      lead.stageEntryTimes['failed'] = Date.now();
      lead.failReason = reason;
      lead.failEvidence = evidence;
      lead.failApproved = false; // Initialize to false
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
    lead.stageEntryTimes = lead.stageEntryTimes || {};
    lead.stageEntryTimes['success'] = Date.now();
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
    lead.stageEntryTimes = lead.stageEntryTimes || {};
    lead.stageEntryTimes[targetStage] = Date.now();
    lead.failReason = null;
    lead.updatedTime = formatDateTime(new Date());
    
    // Update step status
    const currentStepData = lead.steps.find(s => s.stepNum === currentStepNum);
    if (currentStepData) currentStepData.status = 'done';
    const nextStep = lead.steps.find(s => s.stepNum === targetStepNum);
    if (nextStep) nextStep.status = 'doing';

    if (targetStage === 'quotation') {
      if (typeof createNegotiatingTaskIfNeeded === 'function') {
        createNegotiatingTaskIfNeeded(lead);
      }
    }

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
      checklist: [],
      comments: [],
      note: lead.stage === "receive_info" ? (lead.note || "") : ""
    },
    {
      stepNum: 2,
      name: "Lấy SĐT",
      assigneeId: lead.salesId || "usr-admin",
      status: lead.stage === "get_phone" ? "doing" : "todo",
      checklist: [],
      comments: [],
      note: lead.stage === "get_phone" ? (lead.note || "") : ""
    },
    {
      stepNum: 3,
      name: "Khai thác thông tin",
      assigneeId: lead.salesId || "usr-admin",
      status: lead.stage === "explore_info" ? "doing" : "todo",
      checklist: [],
      comments: [],
      note: lead.stage === "explore_info" ? (lead.note || "") : ""
    },
    {
      stepNum: 4,
      name: "Báo giá",
      assigneeId: lead.salesId || "usr-admin",
      status: lead.stage === "quotation" ? "doing" : "todo",
      checklist: [],
      comments: [],
      note: lead.stage === "quotation" ? (lead.note || "") : ""
    },
    {
      stepNum: 5,
      name: "Thương lượng",
      assigneeId: lead.salesId || "usr-admin",
      status: lead.stage === "negotiating" ? "doing" : "todo",
      checklist: [],
      comments: [],
      note: lead.stage === "negotiating" ? (lead.note || "") : ""
    },
    {
      stepNum: 6,
      name: "Thành công",
      assigneeId: lead.salesId || "usr-admin",
      status: lead.stage === "success" ? "doing" : "todo",
      checklist: [],
      comments: [],
      note: lead.stage === "success" ? (lead.note || "") : ""
    },
    {
      stepNum: 7,
      name: "Thất bại",
      assigneeId: lead.salesId || "usr-admin",
      status: lead.stage === "failed" ? "doing" : "todo",
      checklist: [],
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
  lead.stageEntryTimes = lead.stageEntryTimes || {};
  if (!lead.stageEntryTimes[lead.stage]) {
    const fallbackTime = lead.createdTime ? new Date(lead.createdTime).getTime() : (lead.date ? new Date(lead.date).getTime() : Date.now());
    lead.stageEntryTimes[lead.stage] = fallbackTime;
  }
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

  const stageSelect = document.getElementById('modal-lead-stage-select');
  if (stageSelect) {
    stageSelect.value = lead.stage;
    stageSelect.onchange = (e) => {
      const val = e.target.value;
      if (val && val !== lead.stage) {
        handleLeadMove(lead.id, val);
        const updatedLead = AppState.leads.find(l => l.id === lead.id);
        if (updatedLead) {
          openLeadDetailModal(updatedLead.id);
        }
      }
    };
  }

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
  
  const chkInput = document.getElementById('lead-step-new-chk');
  document.getElementById('btn-lead-step-add-chk').onclick = handleLeadAddStepChecklistItem;
  chkInput.onkeyup = (e) => {
    if (e.key === 'Enter') handleLeadAddStepChecklistItem();
  };

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
    
    const reasonSelect = document.getElementById('lead-step-fail-reason');
    const reasonOtherGroup = document.getElementById('lead-step-fail-reason-other-group');
    const reasonOtherInput = document.getElementById('lead-step-fail-reason-other');
    const evidenceInput = document.getElementById('lead-step-fail-evidence');
    const approvedCheckbox = document.getElementById('lead-step-fail-approved');
    
    const storedReason = lead.failReason || '';
    const stdReasons = [
      'Giá dịch vụ cao',
      'Thời gian vận chuyển lâu',
      'Không cạnh tranh được với đại lý VN',
      'Trả lời chậm',
      'Hàng khó từ chối',
      'Không đủ năng lực xử lý hàng',
      'Không cạnh tranh được giá dịch vụ với đối thủ',
      'Không tìm được hàng cho KH',
      'Khách lẻ, hàng khó => chủ động từ chối',
      'Khách hàng ko quan tâm',
      'Do AI tư vấn chưa tốt'
    ];
    
    if (storedReason && !stdReasons.includes(storedReason)) {
      reasonSelect.value = 'Khác';
      reasonOtherGroup.style.display = 'block';
      reasonOtherInput.value = storedReason;
    } else {
      reasonSelect.value = storedReason;
      reasonOtherGroup.style.display = 'none';
      reasonOtherInput.value = '';
    }

    reasonSelect.onchange = (e) => {
      if (e.target.value === 'Khác') {
        reasonOtherGroup.style.display = 'block';
      } else {
        reasonOtherGroup.style.display = 'none';
        reasonOtherInput.value = '';
      }
    };

    evidenceInput.value = lead.failEvidence || '';
    approvedCheckbox.checked = !!lead.failApproved;
    
    const currentUser = getCurrentUser();
    const isAdminOrManager = currentUser.role === 'admin' || currentUser.role === 'manager' || currentUser.username === 'minhphuong';
    approvedCheckbox.disabled = !isAdminOrManager;
    if (!isAdminOrManager) {
      approvedCheckbox.parentElement.setAttribute('title', 'Chỉ Quản lý mới có quyền duyệt');
    } else {
      approvedCheckbox.parentElement.removeAttribute('title');
    }
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
  }

  // Inject system task textarea dynamically for Step 4 (Báo giá)
  if (currentActiveLeadStepNum === 4) {
    const row = document.createElement('div');
    row.style.cssText = 'background:#1e1b4b; padding:8px; border-radius:4px; border: 1px dashed #6366f1; margin-bottom: 4px;';
    row.innerHTML = `
      <div style="font-size:12.5px; color:#a5b4fc; margin-bottom: 6px; font-weight: bold;">
        [Hệ thống] Nhập tình trạng khách hàng sau báo giá <span style="color:#ef4444;">*</span>
      </div>
      <textarea id="lead-step-quote-feedback" rows="2" style="background:#111827; color:white; border:1px solid #4b5563; font-size:12px; width:100%; border-radius:4px; padding:6px; box-sizing:border-box;" placeholder="Nhập tình trạng chi tiết tại đây (ví dụ: khách chê giá hơi cao đang thương lượng, khách đồng ý cần lên hợp đồng...)...">${lead.quoteFeedback || ''}</textarea>
    `;
    
    const textarea = row.querySelector('textarea');
    textarea.oninput = (e) => {
      const val = e.target.value;
      lead.quoteFeedback = val;
    };
    textarea.onchange = () => {
      saveState();
    };
    
    chkContainer.appendChild(row);
  }

  // Handle empty state
  if (chkContainer.innerHTML === '') {
    chkContainer.innerHTML = `<span class="text-muted" style="font-size:12px; font-style:italic;">Không có checklist.</span>`;
  }

  const filesContainer = document.getElementById('lead-step-files-list');
  filesContainer.innerHTML = '';
  const stepFiles = lead.files || [];
  if (stepFiles.length > 0) {
    stepFiles.forEach((file, idx) => {
      const row = document.createElement('div');
      row.style.cssText = 'display:flex; flex-direction:column; gap:4px; font-size:12px; background:#111827; padding:6px 8px; border-radius:4px; margin-bottom:4px;';
      
      const nameLower = file.name.toLowerCase();
      const isImage = /\.(png|jpe?g|webp|gif)($|\?)/i.test(file.url) || 
                      file.url.toLowerCase().includes('drive.google.com') || 
                      file.url.toLowerCase().includes('googleusercontent.com') ||
                      nameLower.includes('ảnh') || 
                      nameLower.includes('anh') || 
                      nameLower.includes('image') || 
                      nameLower.includes('png') || 
                      nameLower.includes('jpg') || 
                      nameLower.includes('jpeg');

      // Resolve Google Drive direct preview link if applicable
      let displayUrl = file.url;
      if (file.url.toLowerCase().includes('drive.google.com')) {
        let fileId = '';
        const dMatch = file.url.match(/\/d\/([a-zA-Z0-9_-]+)/);
        if (dMatch && dMatch[1]) {
          fileId = dMatch[1];
        } else {
          const idMatch = file.url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
          if (idMatch && idMatch[1]) {
            fileId = idMatch[1];
          }
        }
        if (fileId) {
          displayUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w600`;
        }
      }

      const imgPreview = isImage ? `<img src="${displayUrl}" onerror="this.style.display='none';" style="max-width:100%; max-height:100px; border-radius:4px; margin-top:4px; display:block; border:1px solid var(--border-color);" alt="ảnh hàng hóa" />` : '';

      const fileInfo = document.createElement('div');
      fileInfo.style.cssText = 'display:flex; justify-content:space-between; align-items:center;';
      fileInfo.innerHTML = `
        <a href="${file.url}" target="_blank" style="color:var(--color-info); text-decoration:underline;"><i class="fa-solid fa-file-arrow-up"></i> ${file.name}</a>
        <button type="button" class="btn btn-sm btn-outline" style="padding:2px 6px; font-size:10px; color:#ef4444;" title="Xóa file"><i class="fa-solid fa-trash"></i></button>
      `;
      
      fileInfo.querySelector('button').onclick = () => {
        lead.files.splice(idx, 1);
        saveState();
        renderActiveLeadStepPanel();
      };
      
      row.appendChild(fileInfo);
      if (imgPreview) {
        const previewDiv = document.createElement('div');
        previewDiv.innerHTML = imgPreview;
        row.appendChild(previewDiv.firstChild);
      }
      filesContainer.appendChild(row);
    });
  } else {
    filesContainer.innerHTML = `<span class="text-muted" style="font-size:12px; font-style:italic;">Chưa có tài liệu nào.</span>`;
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
    const reasonSelect = document.getElementById('lead-step-fail-reason');
    const reasonVal = reasonSelect.value;
    if (!reasonVal) {
      showToast('Vui lòng chọn lý do thất bại!', 'warning');
      return;
    }
    
    let finalReason = reasonVal;
    if (reasonVal === 'Khác') {
      const reasonOtherVal = document.getElementById('lead-step-fail-reason-other').value.trim();
      if (!reasonOtherVal) {
        showToast('Vui lòng nhập chi tiết lý do thất bại khác!', 'warning');
        return;
      }
      finalReason = reasonOtherVal;
    }
    
    const evidenceVal = document.getElementById('lead-step-fail-evidence').value.trim();
    if (!evidenceVal) {
      showToast('Vui lòng nhập link bằng chứng thất bại bắt buộc!', 'warning');
      return;
    }
    
    lead.failReason = finalReason;
    lead.failEvidence = evidenceVal;
    
    // Only verify failApproved if changed by Manager/Admin
    const currentUser = getCurrentUser();
    const isAdminOrManager = currentUser.role === 'admin' || currentUser.role === 'manager' || currentUser.username === 'minhphuong';
    if (isAdminOrManager) {
      lead.failApproved = document.getElementById('lead-step-fail-approved').checked;
    }
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

    // Validate files when transitioning from explore_info (Step 3) to quotation (Step 4)
    if (currentStepNum === 3 && currentActiveLeadStepNum === 4) {
      const files = lead.files || [];
      if (files.length === 0) {
        showToast("Để chuyển sang bước Báo giá, bạn bắt buộc phải đính kèm Tài liệu thông tin lô hàng vào mục tài liệu đính kèm!", "warning");
        return;
      }
    }

    // Validate files and tasks when transitioning from quotation (Step 4) to negotiating (Step 5) or success (Step 6)
    if (currentStepNum === 4 && (currentActiveLeadStepNum === 5 || currentActiveLeadStepNum === 6)) {
      const files = lead.files || [];
      const hasImage = files.some(f => 
        /\.(jpg|jpeg|png|webp|gif|bmp)$/i.test(f.url) || 
        f.name.toLowerCase().includes('ảnh') || 
        f.name.toLowerCase().includes('hình') ||
        f.name.toLowerCase().includes('image') ||
        f.name.toLowerCase().includes('img') ||
        f.name.toLowerCase().includes('báo giá') ||
        f.name.toLowerCase().includes('bao gia')
      );
      if (!hasImage) {
        showToast("Để chuyển sang bước Thương lượng, bạn bắt buộc phải chèn Hình ảnh báo giá vào mục tài liệu đính kèm!", "warning");
        return;
      }

      const quoteFeedback = (lead.quoteFeedback || '').trim();
      if (quoteFeedback.length < 3) {
        showToast("Bạn bắt buộc phải nhập rõ Tình trạng khách hàng sau báo giá vào ô nhập liệu ở Bước 4!", "warning");
        return;
      }

      saveState();
    }

    const currentStepData = lead.steps.find(s => s.stepNum === currentStepNum);
    currentStepData.status = 'done';

    const targetStage = stepNumToStage[currentActiveLeadStepNum];
    lead.stageEntryTimes = lead.stageEntryTimes || {};
    lead.stageEntryTimes[targetStage] = Date.now();
    
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
  saveState();
  renderActiveLeadStepPanel();
}

function handleLeadAddStepFile() {
  const lead = AppState.leads.find(l => l.id === currentActiveLeadId);
  if (!lead) return;

  const nameInput = document.getElementById('lead-step-new-file-name');
  const urlInput = document.getElementById('lead-step-new-file-url');

  const name = nameInput.value.trim();
  const url = urlInput.value.trim();

  if (!url) {
    alert("Vui lòng nhập đường dẫn liên kết URL!");
    return;
  }
  const finalName = name || (lead.stage === 'quotation' ? "Ảnh báo giá" : "Tài liệu đính kèm");

  lead.files = lead.files || [];
  lead.files.push({
    name: finalName,
    url: url,
    date: formatDateTime(new Date()).substring(0, 10)
  });

  nameInput.value = '';
  urlInput.value = '';
  saveState();
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
    stageEntryTimes: { receive_info: Date.now() },
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

function checkLeadOverdue(lead) {
  if (!lead.stageEntryTimes) {
    lead.stageEntryTimes = {};
  }
  const now = Date.now();
  const created = lead.createdTime ? new Date(lead.createdTime).getTime() : now;

  if (lead.stage === 'get_phone') {
    const entered = lead.stageEntryTimes.get_phone || created;
    const elapsed = now - entered;
    return elapsed > 2 * 60 * 60 * 1000; // 2 hours
  }
  if (lead.stage === 'explore_info') {
    const entered = lead.stageEntryTimes.explore_info || created;
    const elapsed = now - entered;
    return elapsed > 12 * 60 * 60 * 1000; // 12 hours
  }
  if (lead.stage === 'quotation') {
    const entered = lead.stageEntryTimes.quotation || created;
    const elapsed = now - entered;
    const hasFeedback = lead.quoteFeedback && lead.quoteFeedback.trim().length >= 3;
    if (!hasFeedback && elapsed > 24 * 60 * 60 * 1000) {
      return true; // Overdue if no feedback after 24h
    }
  }
  return false;
}

function createNegotiatingTaskIfNeeded(lead) {
  if (!AppState.single_tasks) AppState.single_tasks = [];
  const hasTask = AppState.single_tasks.some(t => t.clientId === lead.id && t.title.includes('Tình trạng KH sau báo giá') && t.status !== 'completed');
  if (!hasTask) {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const deadlineStr = tomorrow.toISOString().split('T')[0];
    const newTask = {
      id: `task-ops-${Date.now()}`,
      title: `Tình trạng KH sau báo giá`,
      desc: `Cập nhật tình trạng khách hàng ${lead.name} sau báo giá`,
      assigneeId: lead.salesId || 'usr-admin',
      helperId: null,
      dept: 'sales',
      priority: 'high',
      deadline: deadlineStr,
      status: 'todo',
      projectId: null,
      clientId: lead.id,
      workflowId: null,
      tags: ['CRM', 'Báo giá'],
      checklist: [],
      attachments: [],
      comments: [],
      history: [`${new Date().toISOString().split('T')[0]}: Tự động tạo việc từ CRM`]
    };
    AppState.single_tasks.push(newTask);
  }
}
