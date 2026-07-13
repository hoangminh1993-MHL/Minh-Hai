// ==================== MINH HAI LOGISTICS - OPERATION PORTAL ==================== //

document.addEventListener('DOMContentLoaded', () => {
  initOpsEvents();
  setupFounderDashboardTabs();
});

// Global state variables for operations drag and drop
let draggingFlowId = null;
let targetFlowStage = null;
let confirmingMoveFlowId = null;
let confirmingMoveTargetStage = null;
let currentActiveProjectId = null;
let currentSingleTaskLayout = 'list'; // 'list' | 'board' | 'calendar'
let currentCalendarMonth = new Date().getMonth();
let currentCalendarYear = new Date().getFullYear();

function initOpsEvents() {
  // Listen to hash/view navigation changes
  window.addEventListener('hashchange', handleOpsViewRouting);
  // Initial check on load
  handleOpsViewRouting();

  // Global Quick Create Task button in top header
  const btnGlobalQuickTask = document.getElementById('btn-global-quick-task');
  if (btnGlobalQuickTask) {
    btnGlobalQuickTask.onclick = () => {
      openModal('modal-global-quick-chooser');
    };
  }

  // --- CRM Khách Cũ & Lô Hàng events ---
  const btnAddFlowModal = document.getElementById('btn-add-flow-modal');
  if (btnAddFlowModal) {
    btnAddFlowModal.onclick = () => {
      populateFlowUserDropdowns();
      populateFlowClientDropdown();
      openModal('modal-add-ops-flow');
    };
  }

  const formAddOpsFlow = document.getElementById('form-add-ops-flow');
  if (formAddOpsFlow) {
    formAddOpsFlow.onsubmit = handleAddFlowSubmit;
  }

  const clientSelect = document.getElementById('flow-client-select');
  if (clientSelect) {
    clientSelect.onchange = (e) => {
      const newFields = document.getElementById('flow-new-client-fields');
      const extraFields = document.getElementById('flow-new-client-extra');
      if (e.target.value === 'new') {
        newFields.style.display = 'block';
        extraFields.style.display = 'block';
      } else {
        newFields.style.display = 'none';
        extraFields.style.display = 'none';
      }
    };
  }

  // Confirm transition checklist
  const btnOpsConfirmMove = document.getElementById('btn-ops-confirm-move');
  if (btnOpsConfirmMove) {
    btnOpsConfirmMove.onclick = handleConfirmedFlowMove;
  }

  // Export flows CSV
  const btnExportCSV = document.getElementById('btn-export-flows-excel');
  if (btnExportCSV) {
    btnExportCSV.onclick = exportWorkflowsToCSV;
  }

  // Filter triggers
  document.getElementById('ops-flow-search').oninput = renderOpsWorkflows;
  document.getElementById('ops-flow-filter-service').onchange = renderOpsWorkflows;
  document.getElementById('ops-flow-filter-assignee').onchange = renderOpsWorkflows;
  document.getElementById('ops-flow-filter-overdue').onchange = renderOpsWorkflows;

  // --- Single Tasks events ---
  const btnAddSingleTaskModal = document.getElementById('btn-add-single-task-modal');
  if (btnAddSingleTaskModal) {
    btnAddSingleTaskModal.onclick = () => {
      populateTaskUserDropdowns();
      populateTaskProjectAndClientDropdowns();
      
      const today = new Date();
      today.setDate(today.getDate() + 3);
      document.getElementById('ops-task-deadline').value = today.toISOString().split('T')[0];
      
      openModal('modal-add-ops-task');
    };
  }

  const formAddOpsTask = document.getElementById('form-add-ops-task');
  if (formAddOpsTask) {
    formAddOpsTask.onsubmit = handleAddSingleTaskSubmit;
  }

  // Layout toggles
  document.getElementById('btn-layout-list').onclick = () => switchSingleTaskLayout('list');
  document.getElementById('btn-layout-board').onclick = () => switchSingleTaskLayout('board');
  document.getElementById('btn-layout-calendar').onclick = () => switchSingleTaskLayout('calendar');

  // Calendar navigations
  document.getElementById('btn-calendar-prev').onclick = () => navigateCalendar(-1);
  document.getElementById('btn-calendar-next').onclick = () => navigateCalendar(1);

  // Single tasks filters
  document.getElementById('tasks-single-search').oninput = renderOpsSingleTasks;
  document.getElementById('tasks-single-filter-dept').onchange = renderOpsSingleTasks;
  document.getElementById('tasks-single-filter-assignee').onchange = renderOpsSingleTasks;
  document.getElementById('tasks-single-filter-priority').onchange = renderOpsSingleTasks;
  const statusFilterEl = document.getElementById('tasks-single-filter-status');
  if (statusFilterEl) statusFilterEl.onchange = renderOpsSingleTasks;

  // Save/Delete Task Detail Handlers
  document.getElementById('btn-ops-task-save').onclick = handleSaveTaskDetails;
  document.getElementById('btn-ops-task-delete').onclick = handleDeleteTask;
  document.getElementById('btn-ops-task-detail-add-chk').onclick = handleAddTaskChecklistItem;
  document.getElementById('btn-ops-task-add-file').onclick = handleAddTaskFile;
  document.getElementById('btn-ops-task-add-comment').onclick = handleAddTaskComment;

  // Task description edit handlers
  const btnEditDesc = document.getElementById('btn-ops-task-detail-edit-desc');
  if (btnEditDesc) {
    btnEditDesc.onclick = () => {
      const descText = document.getElementById('ops-task-detail-desc').innerText;
      document.getElementById('ops-task-detail-desc').style.display = 'none';
      btnEditDesc.style.display = 'none';
      document.getElementById('ops-task-detail-edit-desc-group').style.display = 'flex';
      document.getElementById('ops-task-detail-desc-input').value = descText === 'Không có mô tả chi tiết.' ? '' : descText;
    };
  }

  const btnCancelDesc = document.getElementById('btn-ops-task-detail-cancel-desc');
  if (btnCancelDesc) {
    btnCancelDesc.onclick = () => {
      document.getElementById('ops-task-detail-desc').style.display = 'block';
      if (btnEditDesc) btnEditDesc.style.display = 'inline-block';
      document.getElementById('ops-task-detail-edit-desc-group').style.display = 'none';
    };
  }

  const btnSaveDesc = document.getElementById('btn-ops-task-detail-save-desc');
  if (btnSaveDesc) {
    btnSaveDesc.onclick = () => {
      const newVal = document.getElementById('ops-task-detail-desc-input').value.trim();
      const task = AppState.single_tasks.find(t => t.id === currentActiveTaskId);
      if (task) {
        task.desc = newVal;
        saveState();
        
        document.getElementById('ops-task-detail-desc').innerText = newVal || 'Không có mô tả chi tiết.';
        document.getElementById('ops-task-detail-desc').style.display = 'block';
        if (btnEditDesc) btnEditDesc.style.display = 'inline-block';
        document.getElementById('ops-task-detail-edit-desc-group').style.display = 'none';
        
        renderOpsSingleTasks();
        
        // Also update CRM board if the task belongs to a CRM Khách Mới lead
        if (task.clientId && task.clientId.startsWith('lead-')) {
          const lead = AppState.leads && AppState.leads.find(l => l.id === task.clientId);
          if (lead) {
            if (task.title.includes('Tình trạng KH sau báo giá')) {
              const cleanFeedback = newVal.replace('Tình trạng khách hàng sau báo giá: ', '').replace('Tình trạng khách hàng: ', '');
              lead.quoteFeedback = cleanFeedback;
              saveState();
              if (typeof renderCRMBoard === 'function') renderCRMBoard();
            }
          }
        }
        
        showToast('Đã cập nhật mô tả công việc!', 'success');
      }
    };
  }

  // --- Projects events ---
  const btnAddProjectModal = document.getElementById('btn-add-project-modal');
  if (btnAddProjectModal) {
    btnAddProjectModal.onclick = () => {
      populateProjectManagerDropdown();
      populateProjectMembersChecklist();
      openModal('modal-add-ops-project');
    };
  }

  const formAddOpsProject = document.getElementById('form-add-ops-project');
  if (formAddOpsProject) {
    formAddOpsProject.onsubmit = handleAddProjectSubmit;
  }

  // Tabs buttons inside project detail card
  const projectTabs = document.querySelectorAll('.project-tab-btn');
  projectTabs.forEach(btn => {
    btn.onclick = (e) => {
      projectTabs.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      switchProjectTab(e.target.getAttribute('data-tab'));
    };
  });

  // Project details sub-modals
  document.getElementById('btn-project-add-doc').onclick = () => {
    openModal('modal-project-add-doc');
  };
  document.getElementById('form-project-add-doc').onsubmit = handleProjectAddDocSubmit;

  document.getElementById('btn-project-add-task').onclick = () => {
    populateTaskUserDropdowns();
    populateTaskProjectAndClientDropdowns();
    document.getElementById('ops-task-project').value = currentActiveProjectId;
    
    const today = new Date();
    today.setDate(today.getDate() + 3);
    document.getElementById('ops-task-deadline').value = today.toISOString().split('T')[0];
    
    openModal('modal-add-ops-task');
  };

  document.getElementById('project-chat-form').onsubmit = handleProjectChatSubmit;
}

// Router hook to trigger rendering
function handleOpsViewRouting() {
  const hash = window.location.hash.substring(1) || 'dashboard';
  if (hash === 'crm-clients-workflows') {
    renderOpsWorkflows();
  } else if (hash === 'tasks-single') {
    renderOpsSingleTasks();
  } else if (hash === 'tasks-projects') {
    renderOpsProjects();
  } else if (hash === 'my-tasks') {
    renderMyTasks();
  } else if (hash === 'dashboard') {
    // If the active dashboard tab is "ops", render the operations dashboard
    const activeTab = document.querySelector('.dashboard-tab-btn.active');
    if (activeTab && activeTab.getAttribute('data-tab') === 'ops') {
      renderFounderDashboard();
    }
  }
}

// ==================== FOUNDER DASHBOARD LOGIC ==================== //
function setupFounderDashboardTabs() {
  const dashContainer = document.getElementById('view-dashboard');
  if (!dashContainer) return;

  // Insert Tab buttons at the very top of dashboard
  const tabWrapper = document.createElement('div');
  tabWrapper.className = 'dashboard-tabs';
  tabWrapper.style.cssText = 'display:flex; gap:12px; margin-bottom:20px; border-bottom:1px solid var(--border-color); padding-bottom:8px;';
  tabWrapper.innerHTML = `
    <button class="dashboard-tab-btn active project-tab-btn" data-tab="crm" style="font-size: 15px;">CRM Khách Mới</button>
    <button class="dashboard-tab-btn project-tab-btn" data-tab="ops" style="font-size: 15px;">Vận Hành & Khách Cũ (Founder)</button>
  `;

  const topHeader = dashContainer.firstElementChild;
  dashContainer.insertBefore(tabWrapper, topHeader);

  // Add container for operations dashboard metrics (default hidden)
  const opsDashboardContent = document.createElement('div');
  opsDashboardContent.id = 'ops-dashboard-content';
  opsDashboardContent.style.display = 'none';
  dashContainer.appendChild(opsDashboardContent);

  // Tab switching
  const tabs = tabWrapper.querySelectorAll('.dashboard-tab-btn');
  tabs.forEach(tab => {
    tab.onclick = (e) => {
      tabs.forEach(t => t.classList.remove('active'));
      e.target.classList.add('active');
      
      const mode = e.target.getAttribute('data-tab');
      const crmCards = dashContainer.querySelector('.stats-grid');
      const crmCharts = dashContainer.querySelector('.dashboard-grid');
      const crmTable = dashContainer.querySelector('.grid-1-3');
      
      if (mode === 'crm') {
        crmCards.style.display = 'grid';
        crmCharts.style.display = 'grid';
        crmTable.style.display = 'grid';
        opsDashboardContent.style.display = 'none';
      } else {
        crmCards.style.display = 'none';
        crmCharts.style.display = 'none';
        crmTable.style.display = 'none';
        opsDashboardContent.style.display = 'block';
        renderFounderDashboard();
      }
    };
  });
}

function renderFounderDashboard() {
  const container = document.getElementById('ops-dashboard-content');
  if (!container) return;

  const totalTasks = AppState.single_tasks.length;
  const overdueTasks = AppState.single_tasks.filter(t => t.status === 'overdue' || (t.status !== 'completed' && t.deadline && new Date(t.deadline) < new Date())).length;
  const completedTodayTasks = AppState.single_tasks.filter(t => t.status === 'completed').length; // Simplification for today

  const billingPending = AppState.shipment_workflows.filter(w => w.stage === 2).length; // Step 2: Báo giá
  const waitingShop = AppState.shipment_workflows.filter(w => w.stage === 6).length; // Step 6: Shop gửi hàng
  const arrivingCn = AppState.shipment_workflows.filter(w => w.stage === 7).length; // Step 7: Kho Trung Quốc
  const waitingDebt = AppState.shipment_workflows.filter(w => w.stage === 10).length; // Step 10: Thu nợ

  // Render KPI grid cards
  let html = `
    <div class="stats-grid" style="margin-top: 15px;">
      <div class="stat-card">
        <div class="stat-icon bg-blue"><i class="fa-solid fa-list-check"></i></div>
        <div class="stat-data">
          <span class="stat-label">Tổng task đang mở</span>
          <h3>${AppState.single_tasks.filter(t => t.status !== 'completed').length}</h3>
          <span class="stat-trend trend-up">Tổng số: ${totalTasks} việc</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon bg-rose"><i class="fa-solid fa-circle-exclamation"></i></div>
        <div class="stat-data">
          <span class="stat-label">Công việc quá hạn</span>
          <h3 class="text-rose">${overdueTasks}</h3>
          <span class="stat-trend text-rose"><i class="fa-solid fa-clock"></i> Cần xử lý gấp!</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon bg-emerald"><i class="fa-solid fa-circle-check"></i></div>
        <div class="stat-data">
          <span class="stat-label">Việc đã hoàn thành</span>
          <h3>${completedTodayTasks}</h3>
          <span class="stat-trend trend-up">Vận hành nội bộ</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon bg-gold"><i class="fa-solid fa-sack-dollar"></i></div>
        <div class="stat-data">
          <span class="stat-label">Đơn chờ thu nợ (Bước 10)</span>
          <h3 class="text-gold">${waitingDebt}</h3>
          <span class="stat-trend text-gold"><i class="fa-solid fa-receipt"></i> Đối soát kế toán</span>
        </div>
      </div>
    </div>

    <!-- Second row metrics -->
    <div class="dashboard-grid" style="margin-top: 24px;">
      <div class="dashboard-card">
        <div class="card-header"><h3>Thống Kê Trạng Thái Lô Hàng Vận Hành</h3></div>
        <div class="card-body" style="display:flex; flex-direction:column; gap:10px;">
          <div style="display:flex; justify-content:space-between;"><span>Lô hàng đang báo giá (Bước 2):</span><strong>${billingPending}</strong></div>
          <div style="display:flex; justify-content:space-between;"><span>Chờ shop Trung Quốc phát hàng (Bước 6):</span><strong>${waitingShop}</strong></div>
          <div style="display:flex; justify-content:space-between;"><span>Hàng đang tại kho Trung Quốc (Bước 7):</span><strong>${arrivingCn}</strong></div>
          <div style="display:flex; justify-content:space-between;"><span>Đang thu nợ khách hàng (Bước 10):</span><strong>${waitingDebt}</strong></div>
        </div>
      </div>

      <div class="dashboard-card">
        <div class="card-header"><h3>Phòng Ban & Nhân Sự Chậm Việc</h3></div>
        <div class="card-body" style="padding:0;">
          <div class="leaderboard-table-wrapper" style="margin:0; border:none; border-radius:0;">
            <table class="leaderboard-table" style="min-width:100%;">
              <thead>
                <tr>
                  <th>Nhân sự</th>
                  <th class="text-center">Số task quá hạn</th>
                  <th>Phòng ban</th>
                </tr>
              </thead>
              <tbody>
  `;

  // Calculate top overdue users
  const userOverdueCounts = {};
  AppState.users.forEach(u => { userOverdueCounts[u.id] = 0; });
  AppState.single_tasks.forEach(t => {
    const isOverdue = t.status === 'overdue' || (t.status !== 'completed' && t.deadline && new Date(t.deadline) < new Date());
    if (isOverdue && t.assigneeId) {
      userOverdueCounts[t.assigneeId] = (userOverdueCounts[t.assigneeId] || 0) + 1;
    }
  });

  const sortedUsers = AppState.users
    .map(u => ({ name: u.name, count: userOverdueCounts[u.id] || 0, dept: u.dept }))
    .filter(u => u.count > 0)
    .sort((a,b) => b.count - a.count);

  if (sortedUsers.length === 0) {
    html += `<tr><td colspan="3" class="text-center text-muted" style="padding:15px;">Tuyệt vời! Không có nhân sự nào bị trễ việc.</td></tr>`;
  } else {
    sortedUsers.slice(0, 5).forEach(u => {
      const deptLabels = { sales: 'Sales/CSKH', sourcing: 'Sourcing', warehouse: 'Kho bãi', admin: 'Kế toán/Admin' };
      html += `
        <tr>
          <td><strong>${u.name}</strong></td>
          <td class="text-center text-rose"><strong>${u.count}</strong></td>
          <td>${deptLabels[u.dept] || u.dept}</td>
        </tr>
      `;
    });
  }

  html += `
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `;

  container.innerHTML = html;
}

// ==================== CRM KHÁCH CŨ & LÔ HÀNG (11 BƯỚC) ==================== //
function renderOpsWorkflows() {
  // Sanitize checklists: only allow 'cập nhật tình trạng sau báo giá' in Step 2, clear all others
  if (AppState.shipment_workflows) {
    AppState.shipment_workflows.forEach(flow => {
      if (flow.steps) {
        flow.steps.forEach(s => {
          if (s.stepNum === 2) {
            s.checklist = s.checklist ? s.checklist.filter(c => c.text === "cập nhật tình trạng sau báo giá") : [];
            if (s.checklist.length === 0) {
              s.checklist.push({ text: "cập nhật tình trạng sau báo giá", done: false, required: true });
            }
          } else {
            s.checklist = [];
          }
        });
      }
    });
  }

  const container = document.getElementById('ops-workflows-kanban');
  if (!container) return;
  container.innerHTML = '';

  const searchVal = document.getElementById('ops-flow-search').value.toLowerCase().trim();
  const serviceVal = document.getElementById('ops-flow-filter-service').value;
  const assigneeVal = document.getElementById('ops-flow-filter-assignee').value;
  const overdueVal = document.getElementById('ops-flow-filter-overdue').checked;

  const stepNames = [
    "Nhận thông tin", "Báo giá", "Thương lượng", "Thành công", "Mua hàng",
    "Shop gửi hàng", "Về kho TQ", "Về kho VN", "Giao hàng", "Thu nợ", "Hoàn tất"
  ];

  // 11 steps arrays
  const stepLists = Array.from({ length: 11 }, () => []);

  // Filter shipment workflows
  const currentUser = typeof getCurrentUser === 'function' ? getCurrentUser() : {};
  AppState.shipment_workflows.forEach(flow => {
    const client = AppState.clients.find(c => c.id === flow.clientId) || {};
    
    // Role-based permission filter: Non-admin only sees flows they are assigned to
    const isSpecialAccess = currentUser.role === 'admin' || 
                            currentUser.username === 'phuongthao' || 
                            currentUser.username === 'nhuquynh';
    if (currentUser && !isSpecialAccess) {
      const isAssigned = flow.assigneeId === currentUser.id || 
                         flow.cskhId === currentUser.id ||
                         (flow.steps && flow.steps.some(s => s.assigneeId === currentUser.id));
      if (!isAssigned) return;
    }

    // Search filter
    const matchesSearch = flow.name.toLowerCase().includes(searchVal) ||
                          (client.code && client.code.toLowerCase().includes(searchVal)) ||
                          (client.name && client.name.toLowerCase().includes(searchVal));
    if (!matchesSearch) return;

    // Service type filter
    if (serviceVal !== 'all' && flow.serviceType !== serviceVal) return;

    // Assignee filter
    if (assigneeVal !== 'all' && flow.assigneeId !== assigneeVal) return;

    // Overdue filter
    const isOverdue = flow.deadline && new Date(flow.deadline) < new Date() && flow.stage < 11;
    if (overdueVal && !isOverdue) return;

    // Place into corresponding step array (flow.stage is 1-indexed)
    const idx = flow.stage - 1;
    if (idx >= 0 && idx < 11) {
      stepLists[idx].push(flow);
    }
  });

  // Render 11 columns
  for (let i = 0; i < 11; i++) {
    const col = document.createElement('div');
    col.className = 'kanban-column';
    col.setAttribute('data-stage', i + 1);
    col.id = `ops-col-stage-${i + 1}`;

    const colHeader = document.createElement('div');
    colHeader.className = 'column-header';
    colHeader.innerHTML = `
      <div class="col-title">
        <span class="col-dot" style="background: var(--color-primary);"></span>
        <h3>${i + 1}. ${stepNames[i]}</h3>
      </div>
      <span class="col-count">${stepLists[i].length}</span>
    `;
    col.appendChild(colHeader);

    const cardsContainer = document.createElement('div');
    cardsContainer.className = 'kanban-cards-container';
    cardsContainer.setAttribute('data-stage', i + 1);
    cardsContainer.style.minHeight = '350px';

    // Dragover / Drop event listeners for columns
    cardsContainer.addEventListener('dragover', (e) => {
      e.preventDefault();
      col.classList.add('drag-over');
    });

    cardsContainer.addEventListener('dragleave', () => {
      col.classList.remove('drag-over');
    });

    cardsContainer.addEventListener('drop', (e) => {
      e.preventDefault();
      col.classList.remove('drag-over');
      const flowId = e.dataTransfer.getData('text/plain') || draggingFlowId;
      const targetStage = i + 1;
      handleFlowMoveAttempt(flowId, targetStage);
    });

    // Populate columns cards
    stepLists[i].forEach(flow => {
      const client = AppState.clients.find(c => c.id === flow.clientId) || {};
      const isOverdue = flow.deadline && new Date(flow.deadline) < new Date() && flow.stage < 11;
      const card = document.createElement('div');
      card.className = `kanban-card ${isOverdue ? 'overdue-card' : ''}`;
      card.setAttribute('draggable', 'true');
      card.setAttribute('data-id', flow.id);
      
      const salesUser = AppState.users.find(u => u.id === flow.cskhId);
      const salesName = salesUser ? salesUser.name.split(' ').pop() : 'Chưa giao';
      const assigneeUser = AppState.users.find(u => u.id === flow.assigneeId);
      const assigneeName = assigneeUser ? assigneeUser.name.split(' ').pop() : 'Chưa giao';

      const overdueBadge = isOverdue ? `<div class="card-fail-reason" style="background:rgba(239,68,68,0.2); color:#ef4444;" title="Quá hạn chót lô hàng!"><i class="fa-solid fa-triangle-exclamation"></i> Quá hạn</div>` : '';

      // Highlight if updated today
      const now = new Date();
      const todayStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
      const lastHistoryTime = flow.history && flow.history.length > 0 ? flow.history[flow.history.length - 1].split(': ')[0] : '';
      const isUpdatedToday = lastHistoryTime.startsWith(todayStr);
      const timeColor = isUpdatedToday ? '#34d399' : '#38bdf8';
      const timeFontWeight = isUpdatedToday ? '700' : '600';

      card.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:10px; font-weight:bold; color:var(--color-primary);">${client.code || 'KH CŨ'}</span>
          <span class="badge bg-blue" style="font-size:9px; padding:2px 4px;">${flow.serviceType}</span>
        </div>
        <div class="card-client-name" style="margin-top:6px; font-size:13.5px;">${flow.name}</div>
        <div class="card-desc" style="font-size:11.5px; opacity:0.8;">Khách: ${client.name || 'Không rõ'}</div>
        ${overdueBadge}
        <div style="font-size: 10.2px; color: ${isOverdue ? '#ef4444' : 'var(--text-muted)'}; font-weight: 500; display: flex; align-items: center; gap: 4px; margin-top: 4px;">
          <i class="fa-solid fa-calendar-xmark"></i> Hạn: ${flow.deadline || 'Chưa thiết lập'}
        </div>
        <div class="card-meta" style="margin-top:8px; border-top:1px solid var(--border-color); padding-top:6px; display:flex; justify-content:space-between; align-items:center;">
          <div style="display:flex; flex-direction:column; gap:2px; font-size:10px; color:var(--text-muted);">
            <span><i class="fa-solid fa-user-gear"></i> Phụ trách: ${assigneeName}</span>
            <span><i class="fa-solid fa-headset"></i> CSKH: ${salesName}</span>
          </div>
          <strong style="font-size:11px; color:#34d399;">${flow.valTotal > 0 ? formatVnd(flow.valTotal) : '0đ'}</strong>
        </div>
        <div style="font-size: 10px; color: ${timeColor}; font-weight: ${timeFontWeight}; display: flex; align-items: center; gap: 4px; margin-top: 6px; padding-top: 4px; border-top: 1px dashed rgba(255,255,255,0.05); justify-content: flex-end;">
          <i class="fa-solid fa-rotate"></i> Cập nhật: ${lastHistoryTime}
        </div>
        <div style="display: flex; justify-content: flex-end; align-items: center; margin-top: 6px; padding-top: 6px; border-top: 1px solid rgba(255,255,255,0.05); gap: 6px;">
          <span style="font-size: 10px; color: var(--text-muted);"><i class="fa-solid fa-right-left"></i> Chuyển:</span>
          <select class="card-stage-select" style="font-size: 10px; padding: 2px 4px; background: #1f2937; color: #e5e7eb; border: 1px solid #4b5563; border-radius: 4px; cursor: pointer;" onclick="event.stopPropagation();">
            <option value="" disabled selected>Chọn...</option>
            <option value="1" ${flow.stage === 1 ? 'disabled' : ''}>1. Nhận thông tin</option>
            <option value="2" ${flow.stage === 2 ? 'disabled' : ''}>2. Báo giá</option>
            <option value="3" ${flow.stage === 3 ? 'disabled' : ''}>3. Thương lượng</option>
            <option value="4" ${flow.stage === 4 ? 'disabled' : ''}>4. Thành công</option>
            <option value="5" ${flow.stage === 5 ? 'disabled' : ''}>5. Mua hàng</option>
            <option value="6" ${flow.stage === 6 ? 'disabled' : ''}>6. Shop gửi</option>
            <option value="7" ${flow.stage === 7 ? 'disabled' : ''}>7. Về TQ</option>
            <option value="8" ${flow.stage === 8 ? 'disabled' : ''}>8. Về VN</option>
            <option value="9" ${flow.stage === 9 ? 'disabled' : ''}>9. Giao hàng</option>
            <option value="10" ${flow.stage === 10 ? 'disabled' : ''}>10. Thu nợ</option>
            <option value="11" ${flow.stage === 11 ? 'disabled' : ''}>11. Hoàn tất</option>
          </select>
        </div>
      `;

      card.addEventListener('dragstart', (e) => {
        draggingFlowId = flow.id;
        e.dataTransfer.setData('text/plain', flow.id);
        card.classList.add('dragging');
      });

      card.addEventListener('dragend', () => {
        card.classList.remove('dragging');
        draggingFlowId = null;
      });

      card.addEventListener('click', (e) => {
        if (e.target.closest('.card-stage-select')) return;
        openFlowDetailModal(flow.id);
      });

      const select = card.querySelector('.card-stage-select');
      if (select) {
        select.addEventListener('change', (e) => {
          const val = parseInt(e.target.value);
          if (val) {
            handleFlowMoveAttempt(flow.id, val);
          }
        });
      }

      cardsContainer.appendChild(card);
    });

    col.appendChild(cardsContainer);
    container.appendChild(col);
  }

  // Also populate flow filters users list once
  populateFlowFilterUsers();
}

function handleFlowMoveAttempt(flowId, targetStage) {
  const flow = AppState.shipment_workflows.find(f => f.id === flowId);
  if (!flow) return;

  const currentStage = flow.stage;
  if (currentStage === targetStage) return;

  // Validate files when transitioning to Báo giá (Step 2)
  if (targetStage === 2) {
    const files = flow.files || [];
    const hasImage = files.some(f => 
      /\.(jpg|jpeg|png|webp|gif|bmp)$/i.test(f.url) || 
      f.name.toLowerCase().includes('ảnh') || 
      f.name.toLowerCase().includes('hình') ||
      f.name.toLowerCase().includes('image') ||
      f.name.toLowerCase().includes('img')
    );
    if (!hasImage) {
      alert("Để chuyển sang bước Báo giá, bạn bắt buộc phải chèn Hình ảnh báo giá vào mục tài liệu đính kèm!");
      return;
    }
  }
  // Validate quote feedback when transitioning from Báo giá (Step 2) to Step 3 (Thương lượng) or higher
  if (currentStage === 2 && targetStage >= 3) {
    const feedback = (flow.quoteFeedback || '').trim();
    if (feedback.length < 3) {
      alert("Bạn bắt buộc phải nhập rõ Tình trạng khách hàng sau báo giá vào ô nhập liệu ở Bước 2!");
      return;
    }
  }
  // Verify transition checklists of the current step
  const currentStepData = flow.steps.find(s => s.stepNum === currentStage);
  if (currentStepData && currentStepData.checklist && currentStepData.checklist.length > 0) {
    const requiredPending = currentStepData.checklist.filter(c => c.required && !c.done);
    
    if (requiredPending.length > 0) {
      // Must prompt checklist modal
      confirmingMoveFlowId = flowId;
      confirmingMoveTargetStage = targetStage;
      
      const checklistContainer = document.getElementById('ops-mandatory-checklist-list');
      checklistContainer.innerHTML = '';
      
      currentStepData.checklist.forEach((item, chkIdx) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = `mandatory-item ${item.done ? 'checked' : 'unchecked'}`;
        itemDiv.innerHTML = `
          <label style="display:flex; align-items:center; gap:8px; cursor:pointer; width:100%;">
            <input type="checkbox" data-idx="${chkIdx}" ${item.done ? 'checked' : ''} ${item.required ? 'data-required="true"' : ''}>
            <span>${item.text} ${item.required ? '<span style="color:#ef4444; font-weight:bold;">*</span>' : ''}</span>
          </label>
        `;
        
        // Listen to change
        itemDiv.querySelector('input').onchange = (e) => {
          if (item.text === "cập nhật tình trạng sau báo giá" && e.target.checked) {
            const feedback = (flow.quoteFeedback || '').trim();
            if (feedback.length < 3) {
              alert("Bạn bắt buộc phải nhập rõ Tình trạng khách hàng sau báo giá vào ô nhập liệu ở Bước 2!");
              e.target.checked = false;
              return;
            }
          }
          item.done = e.target.checked;
          itemDiv.className = `mandatory-item ${item.done ? 'checked' : 'unchecked'}`;
          document.getElementById('ops-checklist-warning-text').style.display = 'none';
        };
        
        checklistContainer.appendChild(itemDiv);
      });
      
      openModal('modal-step-checklist-confirm');
      return;
    }
  }

  // Standard safe transition
  executeFlowMove(flow, targetStage);
}

function handleConfirmedFlowMove() {
  if (!confirmingMoveFlowId || !confirmingMoveTargetStage) return;
  const flow = AppState.shipment_workflows.find(f => f.id === confirmingMoveFlowId);
  if (!flow) return;

  const currentStage = flow.stage;
  const currentStepData = flow.steps.find(s => s.stepNum === currentStage);
  
  if (currentStepData) {
    const requiredPending = currentStepData.checklist.filter(c => c.required && !c.done);
    if (requiredPending.length > 0) {
      document.getElementById('ops-checklist-warning-text').style.display = 'block';
      return;
    }
  }

  closeModal('modal-step-checklist-confirm');
  executeFlowMove(flow, confirmingMoveTargetStage);
  confirmingMoveFlowId = null;
  confirmingMoveTargetStage = null;
}

function executeFlowMove(flow, targetStage) {
  const stepNames = [
    "Nhận thông tin", "Báo giá", "Thương lượng", "Thành công", "Mua hàng",
    "Shop gửi hàng", "Về kho TQ", "Về kho VN", "Giao hàng", "Thu nợ", "Hoàn tất"
  ];
  const oldStage = flow.stage;
  flow.stage = targetStage;
  
  // Set stage statuses
  flow.steps.forEach(s => {
    if (s.stepNum < targetStage) s.status = 'done';
    else if (s.stepNum === targetStage) s.status = 'doing';
    else s.status = 'todo';
  });

  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
  
  if (targetStage === 2) {
    const step2 = flow.steps.find(s => s.stepNum === 2);
    if (step2) {
      const deadlineDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const step2Deadline = `${deadlineDate.getFullYear()}-${String(deadlineDate.getMonth()+1).padStart(2,'0')}-${String(deadlineDate.getDate()).padStart(2,'0')} ${String(deadlineDate.getHours()).padStart(2,'0')}:${String(deadlineDate.getMinutes()).padStart(2,'0')}`;
      step2.deadline = step2Deadline;
      flow.deadline = step2Deadline;
    }
  } else {
    const activeStep = flow.steps.find(s => s.stepNum === targetStage);
    if (activeStep && activeStep.deadline) {
      flow.deadline = activeStep.deadline;
    }
  }

  flow.history.push(`${dateStr}: Di chuyển từ bước ${oldStage} sang ${targetStage} (${stepNames[targetStage - 1]})`);

  saveState();
  renderOpsWorkflows();
  addNotification('Cập nhật Lô Hàng 🚚', `Đã chuyển lô hàng "${flow.name}" sang bước: ${stepNames[targetStage - 1]}`, 'success');
}

// Open detail modal for 11 steps workflow
let currentActiveFlowId = null;
let currentActiveStepNum = 1;

function openFlowDetailModal(flowId) {
  const flow = AppState.shipment_workflows.find(f => f.id === flowId);
  if (!flow) return;

  currentActiveFlowId = flowId;
  currentActiveStepNum = flow.stage; // Set default view to current active step

  document.getElementById('flow-detail-title').innerText = flow.name;
  const client = AppState.clients.find(c => c.id === flow.clientId) || {};
  document.getElementById('flow-detail-subtitle').innerText = `${flow.serviceType.toUpperCase()} - Khách: ${client.name || 'Không rõ'} (${client.code || 'KH CŨ'})`;

  const stageSelect = document.getElementById('modal-flow-stage-select');
  if (stageSelect) {
    stageSelect.value = flow.stage;
    stageSelect.onchange = (e) => {
      const val = parseInt(e.target.value);
      if (val && val !== flow.stage) {
        handleFlowMoveAttempt(flow.id, val);
        const updatedFlow = AppState.shipment_workflows.find(f => f.id === flow.id);
        if (updatedFlow) {
          openFlowDetailModal(updatedFlow.id);
        }
      }
    };
  }

  // Render 11 steps timeline bubbles
  const timeline = document.querySelector('.flow-steps-timeline');
  timeline.innerHTML = '';
  
  const stepNames = [
    "Nhận thông tin", "Báo giá", "Thương lượng", "Thành công", "Mua hàng",
    "Shop gửi hàng", "Về kho TQ", "Về kho VN", "Giao hàng", "Thu nợ", "Hoàn tất"
  ];

  for (let i = 1; i <= 11; i++) {
    const bubble = document.createElement('div');
    const stepData = flow.steps.find(s => s.stepNum === i) || {};
    
    bubble.className = `flow-step-bubble ${stepData.status} ${i === currentActiveStepNum ? 'active' : ''}`;
    bubble.innerHTML = `
      <div class="flow-step-circle">${i}</div>
      <span class="flow-step-lbl">${stepNames[i - 1]}</span>
    `;

    bubble.onclick = () => {
      document.querySelectorAll('.flow-step-bubble').forEach(b => b.classList.remove('active'));
      bubble.classList.add('active');
      currentActiveStepNum = i;
      renderActiveStepPanel();
    };

    timeline.appendChild(bubble);
  }

  renderActiveStepPanel();

  // Handle Delete flow button
  document.getElementById('btn-flow-delete').onclick = () => {
    if (confirm(`Bạn chắc chắn muốn xóa lô hàng "${flow.name}"?`)) {
      AppState.shipment_workflows = AppState.shipment_workflows.filter(f => f.id !== flowId);
      saveState();
      closeModal('modal-flow-detail');
      renderOpsWorkflows();
      addNotification('Xóa Lô Hàng', `Đã xóa lô hàng thành công.`, 'warning');
    }
  };

  // Handle Save active step information
  document.getElementById('btn-flow-step-save').onclick = handleSaveActiveStepData;

  // Handle Add files / checklist inline
  document.getElementById('btn-flow-step-add-chk').onclick = handleFlowAddStepChecklistItem;
  document.getElementById('btn-flow-step-add-file').onclick = handleFlowAddStepFile;
  document.getElementById('btn-flow-step-add-comment').onclick = handleFlowAddStepComment;

  // Pre-fill file name inputs
  const fileNameInput = document.getElementById('flow-step-new-file-name');
  if (fileNameInput) fileNameInput.value = '';

  openModal('modal-flow-detail');
}

function renderActiveStepPanel() {
  const flow = AppState.shipment_workflows.find(f => f.id === currentActiveFlowId);
  if (!flow) return;

  const stepData = flow.steps.find(s => s.stepNum === currentActiveStepNum);
  if (!stepData) return;

  const stepNames = [
    "Nhận thông tin", "Báo giá", "Thương lượng", "Thành công", "Mua hàng",
    "Shop gửi hàng", "Về kho TQ", "Về kho VN", "Giao hàng", "Thu nợ", "Hoàn tất"
  ];

  document.getElementById('flow-step-panel-title').innerText = `Bước ${currentActiveStepNum}: ${stepNames[currentActiveStepNum - 1]}`;

  // Populate users
  const assigneeSelect = document.getElementById('flow-step-assignee');
  assigneeSelect.innerHTML = '';
  AppState.users.forEach(u => {
    const opt = document.createElement('option');
    opt.value = u.id;
    opt.innerText = u.name;
    if (u.id === stepData.assigneeId) opt.selected = true;
    assigneeSelect.appendChild(opt);
  });

  // Set deadline
  document.getElementById('flow-step-deadline').value = stepData.deadline || '';

  // Set notes
  document.getElementById('flow-step-note').value = stepData.note || '';

  // Checklist render
  const chkContainer = document.getElementById('flow-step-checklist-container');
  chkContainer.innerHTML = '';
  if (stepData.checklist && stepData.checklist.length > 0) {
    stepData.checklist.forEach((item, idx) => {
      // Hide the checkbox if it's the system-linked quote feedback text
      if (item.text === "cập nhật tình trạng sau báo giá") return;
      
      const row = document.createElement('div');
      row.style.cssText = 'display:flex; justify-content:space-between; align-items:center; background:#111827; padding:4px 8px; border-radius:4px;';
      
      const label = document.createElement('label');
      label.style.cssText = 'display:flex; align-items:center; gap:8px; font-size:12.5px; cursor:pointer;';
      label.innerHTML = `
        <input type="checkbox" ${item.done ? 'checked' : ''}>
        <span style="${item.done ? 'text-decoration:line-through; opacity:0.6;' : ''}">${item.text} ${item.required ? '<span style="color:#ef4444;">*</span>' : ''}</span>
      `;
      
      label.querySelector('input').onchange = (e) => {
        item.done = e.target.checked;
        renderActiveStepPanel();
      };

      const btnDel = document.createElement('button');
      btnDel.type = 'button';
      btnDel.className = 'btn btn-sm btn-outline';
      btnDel.style.cssText = 'padding: 2px 6px; font-size:10px; color:#ef4444; border-color:rgba(239,68,68,0.2);';
      btnDel.innerHTML = '<i class="fa-solid fa-trash"></i>';
      btnDel.onclick = () => {
        stepData.checklist.splice(idx, 1);
        renderActiveStepPanel();
      };

      row.appendChild(label);
      row.appendChild(btnDel);
      chkContainer.appendChild(row);
    });
  }

  // Inject system task textarea dynamically for Step 2 (Báo giá)
  if (currentActiveStepNum === 2) {
    const row = document.createElement('div');
    row.style.cssText = 'background:#1e1b4b; padding:8px; border-radius:4px; border: 1px dashed #6366f1; margin-bottom: 4px; width: 100%; box-sizing: border-box;';
    row.innerHTML = `
      <div style="font-size:12.5px; color:#a5b4fc; margin-bottom: 6px; font-weight: bold;">
        [Hệ thống] Nhập tình trạng khách hàng sau báo giá <span style="color:#ef4444;">*</span>
      </div>
      <textarea id="flow-step-quote-feedback" rows="2" style="background:#111827; color:white; border:1px solid #4b5563; font-size:12px; width:100%; border-radius:4px; padding:6px; box-sizing:border-box;" placeholder="Nhập tình trạng chi tiết tại đây (ví dụ: khách chê giá hơi cao đang thương lượng, khách đồng ý cần lên hợp đồng...)...">${flow.quoteFeedback || ''}</textarea>
    `;
    
    const textarea = row.querySelector('textarea');
    textarea.oninput = (e) => {
      const val = e.target.value;
      flow.quoteFeedback = val;
      
      const step2 = flow.steps.find(s => s.stepNum === 2);
      if (step2) {
        const item = step2.checklist.find(c => c.text === "cập nhật tình trạng sau báo giá");
        if (item) {
          item.done = val.trim().length >= 3;
        }
      }
      saveState();
    };
    
    chkContainer.appendChild(row);
  }

  // Handle empty state
  if (chkContainer.innerHTML === '') {
    chkContainer.innerHTML = `<span class="text-muted" style="font-size:12px; font-style:italic;">Không có checklist.</span>`;
  }

  // Render step files (with image previews support)
  const filesContainer = document.getElementById('flow-step-files-list');
  filesContainer.innerHTML = '';
  
  // Collect files associated with this shipment (global)
  const stepFiles = flow.files || [];
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

      row.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; width:100%;">
          <a href="${file.url}" target="_blank" style="color:var(--color-primary);"><i class="fa-solid fa-paperclip"></i> ${file.name}</a>
          <button class="btn btn-sm btn-outline text-rose" style="padding:2px 6px; font-size:10px;" onclick="handleDeleteFlowFile(${idx})"><i class="fa-solid fa-trash-can"></i></button>
        </div>
        ${imgPreview}
      `;
      filesContainer.appendChild(row);
    });
  } else {
    filesContainer.innerHTML = `<span class="text-muted" style="font-size:12px; font-style:italic;">Chưa có tài liệu nào.</span>`;
  }

  // Render comments for this step (v18)
  renderActiveStepComments();
}

function handleSaveActiveStepData() {
  const flow = AppState.shipment_workflows.find(f => f.id === currentActiveFlowId);
  if (!flow) return;

  const stepData = flow.steps.find(s => s.stepNum === currentActiveStepNum);
  if (!stepData) return;

  stepData.assigneeId = document.getElementById('flow-step-assignee').value;
  stepData.deadline = document.getElementById('flow-step-deadline').value;
  stepData.note = document.getElementById('flow-step-note').value.trim();

  // If status is not complete, we can keep it as is, or set to completed if all checklists are ticked!
  const hasPending = stepData.checklist.some(c => !c.done);
  if (!hasPending && stepData.status !== 'done') {
    stepData.status = 'done';
  } else if (hasPending && stepData.status === 'done') {
    stepData.status = 'doing';
  }

  saveState();
  closeModal('modal-flow-detail');
  renderOpsWorkflows();
  showToast('Đã lưu thông tin bước xử lý!', 'success');
}

function handleFlowAddStepChecklistItem() {
  const textInput = document.getElementById('flow-step-new-chk');
  const text = textInput.value.trim();
  if (!text) return;

  const flow = AppState.shipment_workflows.find(f => f.id === currentActiveFlowId);
  if (!flow) return;

  const stepData = flow.steps.find(s => s.stepNum === currentActiveStepNum);
  if (stepData) {
    if (!stepData.checklist) stepData.checklist = [];
    stepData.checklist.push({ text: text, done: false, required: false });
    textInput.value = '';
    renderActiveStepPanel();
  }
}

function handleFlowAddStepFile() {
  const nameInput = document.getElementById('flow-step-new-file-name');
  const urlInput = document.getElementById('flow-step-new-file-url');
  
  let name = nameInput.value.trim();
  const url = urlInput.value.trim();
  
  if (!url) {
    alert("Vui lòng nhập đường dẫn liên kết URL!");
    return;
  }
  if (!name) {
    name = "Tài liệu đính kèm";
  }

  const flow = AppState.shipment_workflows.find(f => f.id === currentActiveFlowId);
  if (!flow) return;

  if (!flow.files) flow.files = [];
  flow.files.push({
    name: name,
    url: url,
    date: new Date().toISOString().split('T')[0]
  });

  nameInput.value = '';
  urlInput.value = '';
  renderActiveStepPanel();
}

window.handleDeleteFlowFile = function(idx) {
  const flow = AppState.shipment_workflows.find(f => f.id === currentActiveFlowId);
  if (!flow) return;

  if (flow.files) {
    flow.files.splice(idx, 1);
  }

  renderActiveStepPanel();
};

function handleAddFlowSubmit(e) {
  e.preventDefault();
  
  const name = document.getElementById('flow-name').value.trim();
  const serviceType = document.getElementById('flow-service-type').value;
  const clientSelectVal = document.getElementById('flow-client-select').value;
  
  let clientId = clientSelectVal;

  // Handle create new client if "new" is selected
  if (clientSelectVal === 'new') {
    const cName = document.getElementById('flow-client-name').value.trim();
    const cPhone = document.getElementById('flow-client-phone').value.trim();
    const cSocial = document.getElementById('flow-client-social').value.trim();

    if (!cName) {
      alert('Vui lòng nhập tên khách hàng mới!');
      return;
    }

    const newClientId = `client-${Date.now()}`;
    const newClientCode = `MH${400 + AppState.clients.length + 1}`;
    
    const newClient = {
      id: newClientId,
      code: newClientCode,
      name: cName,
      phone: cPhone,
      social: cSocial,
      type: serviceType,
      tier: 'VIP 5', // default lowest VIP
      source: 'tự sales',
      cskhId: document.getElementById('flow-cskh').value || 'usr-admin',
      managerId: 'usr-admin',
      note: 'Khách hàng mới tạo qua Lô hàng',
      createdTime: new Date().toISOString().split('T')[0]
    };

    AppState.clients.push(newClient);
    clientId = newClientId;
  }

  // Pre-generate 11 steps templates
  const flowSteps = [];
  const stepNames = [
    "Nhận thông tin", "Báo giá", "Thương lượng", "Thành công", "Mua hàng",
    "Shop Trung Quốc gửi hàng", "Về đến kho Trung Quốc", "Về đến kho Hà Nội/Hải Phòng",
    "Giao hàng cho khách", "Thu nợ", "Hoàn tất"
  ];
  
  for (let i = 1; i <= 11; i++) {
    const isFirst = (i === 1);
    
    // Add default required checklists for step 1, 5, 10
    let stepChecklist = [];
    if (i === 2) {
      stepChecklist = [
        { text: "cập nhật tình trạng sau báo giá", done: false, required: true }
      ];
    }

    let stepDeadline = '';
    if (isFirst) {
      const now = new Date();
      const deadlineDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      stepDeadline = `${deadlineDate.getFullYear()}-${String(deadlineDate.getMonth()+1).padStart(2,'0')}-${String(deadlineDate.getDate()).padStart(2,'0')} ${String(deadlineDate.getHours()).padStart(2,'0')}:${String(deadlineDate.getMinutes()).padStart(2,'0')}`;
    }

    flowSteps.push({
      stepNum: i,
      name: stepNames[i - 1],
      assigneeId: document.getElementById('flow-assignee').value,
      deadline: stepDeadline || (document.getElementById('ops-task-deadline') ? document.getElementById('ops-task-deadline').value : ''),
      status: isFirst ? 'doing' : 'todo',
      checklist: stepChecklist,
      note: '',
      comments: []
    });
  }

  const newFlow = {
    id: `flow-${Date.now()}`,
    name: name,
    clientId: clientId,
    serviceType: serviceType,
    assigneeId: document.getElementById('flow-assignee').value,
    cskhId: document.getElementById('flow-cskh').value,
    quoterId: document.getElementById('flow-cskh').value,
    buyerId: document.getElementById('flow-buyer').value,
    warehouseCn: document.getElementById('flow-warehouse-cn').value.trim() || 'Bằng Tường',
    warehouseVn: document.getElementById('flow-warehouse-vn').value.trim() || 'Hà Nội',
    stage: 1,
    valTotal: parseInt(document.getElementById('flow-val-total').value) || 0,
    revenue: parseInt(document.getElementById('flow-revenue').value) || 0,
    profit: parseInt(document.getElementById('flow-profit').value) || 0,
    debt: parseInt(document.getElementById('flow-revenue').value) || 0, // Default debt = revenue
    deadline: flowSteps[0].deadline,
    files: [],
    riskNote: document.getElementById('flow-risk').value.trim(),
    history: [`${new Date().toISOString().split('T')[0]}: Khởi tạo quy trình lô hàng`],
    steps: flowSteps
  };

  AppState.shipment_workflows.push(newFlow);
  saveState();
  closeModal('modal-add-ops-flow');
  document.getElementById('form-add-ops-flow').reset();
  renderOpsWorkflows();
  addNotification('Lô Hàng Mới 🚚', `Đã khởi tạo quy trình vận chuyển "${name}" thành công!`, 'success');
}

function populateFlowUserDropdowns() {
  const users = AppState.users;
  ['flow-assignee', 'flow-cskh', 'flow-buyer'].forEach(id => {
    const select = document.getElementById(id);
    if (!select) return;
    select.innerHTML = '';
    users.forEach(u => {
      const opt = document.createElement('option');
      opt.value = u.id;
      opt.innerText = u.name;
      select.appendChild(opt);
    });
  });
}

function populateFlowClientDropdown() {
  const select = document.getElementById('flow-client-select');
  if (!select) return;
  
  // Keep the first "new" option
  select.innerHTML = '<option value="new">-- Tạo Khách Hàng Mới --</option>';
  AppState.clients.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.id;
    opt.innerText = `${c.name} (${c.code})`;
    select.appendChild(opt);
  });
}

function populateFlowFilterUsers() {
  const select = document.getElementById('ops-flow-filter-assignee');
  if (!select || select.children.length > 1) return;
  AppState.users.forEach(u => {
    const opt = document.createElement('option');
    opt.value = u.id;
    opt.innerText = u.name;
    select.appendChild(opt);
  });
}

// Export workflows to CSV
function exportWorkflowsToCSV() {
  let csvContent = "\uFEFF"; // UTF-8 BOM
  csvContent += "Ma Khach Hang,Ten Khach Hang,Ten Lo Hang,Loai Dich Vu,Buoc Hien Tai,Gia Tri Don Hang,Doanh Thu,Cong No,Han Luu Kho\n";
  
  AppState.shipment_workflows.forEach(w => {
    const client = AppState.clients.find(c => c.id === w.clientId) || {};
    const stepNames = [
      "Nhận thông tin", "Báo giá", "Thương lượng", "Thành công", "Mua hàng",
      "Shop gửi hàng", "Về kho TQ", "Về kho VN", "Giao hàng", "Thu nợ", "Hoàn tất"
    ];
    const currentStepName = stepNames[w.stage - 1] || "Không rõ";
    csvContent += `"${client.code || ''}","${client.name || ''}","${w.name}","${w.serviceType}","${currentStepName}",${w.valTotal},${w.revenue},${w.debt},"${w.deadline || ''}"\n`;
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", `quan_ly_lo_hang_minh_hai_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast('Đã xuất báo cáo CSV thành công!', 'success');
}


// ==================== CÔNG VIỆC ĐƠN LẺ LOGIC ==================== //
function switchSingleTaskLayout(layout) {
  currentSingleTaskLayout = layout;
  
  // Toggle button active state
  ['list', 'board', 'calendar'].forEach(mode => {
    const btn = document.getElementById(`btn-layout-${mode}`);
    if (mode === layout) btn.classList.add('active');
    else btn.classList.remove('active');
  });

  // Toggle containers
  document.getElementById('tasks-single-list-container').style.display = (layout === 'list') ? 'block' : 'none';
  document.getElementById('tasks-single-board-container').style.display = (layout === 'board') ? 'block' : 'none';
  document.getElementById('tasks-single-calendar-container').style.display = (layout === 'calendar') ? 'block' : 'none';

  renderOpsSingleTasks();
}

function renderOpsSingleTasks() {
  const searchVal = document.getElementById('tasks-single-search').value.toLowerCase().trim();
  const deptVal = document.getElementById('tasks-single-filter-dept').value;
  const assigneeVal = document.getElementById('tasks-single-filter-assignee').value;
  const priorityVal = document.getElementById('tasks-single-filter-priority').value;
  const statusEl = document.getElementById('tasks-single-filter-status');
  const statusVal = statusEl ? statusEl.value : 'all';

  let filtered = AppState.single_tasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchVal) || (t.desc && t.desc.toLowerCase().includes(searchVal));
    if (!matchesSearch) return false;

    if (deptVal !== 'all' && t.dept !== deptVal) return false;
    if (assigneeVal !== 'all' && t.assigneeId !== assigneeVal) return false;
    if (priorityVal !== 'all' && t.priority !== priorityVal) return false;
    if (statusVal !== 'all' && t.status !== statusVal) return false;

    return true;
  });

  // Dynamic column sorting
  if (currentSortField) {
    filtered.sort((a, b) => {
      let valA, valB;
      if (currentSortField === 'title') {
        valA = a.title || '';
        valB = b.title || '';
      } else if (currentSortField === 'dept') {
        const deptLabels = { sales: 'Sales & CSKH', sourcing: 'Sourcing', warehouse: 'Kho bãi', admin: 'Kế toán & Admin' };
        valA = deptLabels[a.dept] || '';
        valB = deptLabels[b.dept] || '';
      } else if (currentSortField === 'assignee') {
        const userA = AppState.users.find(u => u.id === a.assigneeId);
        const userB = AppState.users.find(u => u.id === b.assigneeId);
        valA = userA ? userA.name : '';
        valB = userB ? userB.name : '';
      } else if (currentSortField === 'helper') {
        const userA = AppState.users.find(u => u.id === a.helperId);
        const userB = AppState.users.find(u => u.id === b.helperId);
        valA = userA ? userA.name : 'Không';
        valB = userB ? userB.name : 'Không';
      } else if (currentSortField === 'priority') {
        const priorityOrder = { low: 1, normal: 2, high: 3, urgent: 4 };
        valA = priorityOrder[a.priority] || 0;
        valB = priorityOrder[b.priority] || 0;
      } else if (currentSortField === 'deadline') {
        valA = a.deadline ? new Date(a.deadline).getTime() : 0;
        valB = b.deadline ? new Date(b.deadline).getTime() : 0;
      } else if (currentSortField === 'status') {
        const statusLabels = { todo: 'Chưa làm', doing: 'Đang làm', waiting: 'Chờ phản hồi', completed: 'Hoàn thành', overdue: 'Quá hạn', canceled: 'Đã hủy' };
        valA = statusLabels[a.status] || '';
        valB = statusLabels[b.status] || '';
      }
      
      if (typeof valA === 'string') {
        return currentSortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      } else {
        return currentSortAsc ? valA - valB : valB - valA;
      }
    });
  } else {
    // Sort tasks: doing/checking first, then todo, then waiting, then completed/canceled
    const statusOrder = { doing: 1, checking: 1, todo: 2, waiting: 3, completed: 4, canceled: 5 };
    filtered.sort((a, b) => {
      const orderA = statusOrder[a.status] || 99;
      const orderB = statusOrder[b.status] || 99;
      return orderA - orderB;
    });
  }

  // Render based on current layout
  if (currentSingleTaskLayout === 'list') {
    renderSingleTasksList(filtered);
  } else if (currentSingleTaskLayout === 'board') {
    renderSingleTasksBoard(filtered);
  } else if (currentSingleTaskLayout === 'calendar') {
    renderSingleTasksCalendar(filtered);
  }

  populateTasksFiltersOnce();
}

function renderSingleTasksList(tasks) {
  const tbody = document.getElementById('tasks-single-list-body');
  tbody.innerHTML = '';

  if (tasks.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8"><div class="empty-state"><i class="fa-solid fa-list-check empty-state-icon"></i><span>Không có công việc nào trùng khớp.</span></div></td></tr>`;
    return;
  }

  const deptLabels = { sales: 'Sales & CSKH', sourcing: 'Sourcing', warehouse: 'Kho bãi', admin: 'Kế toán & Admin' };
  const priorityLabels = { low: 'Thấp', normal: 'Bình thường', high: 'Cao', urgent: 'Khẩn cấp' };
  const priorityBadges = { low: 'bg-blue', normal: 'bg-gray', high: 'bg-orange', urgent: 'bg-rose' };
  const statusLabels = { todo: 'Chưa làm', doing: 'Đang làm', waiting: 'Chờ phản hồi', completed: 'Hoàn thành', overdue: 'Quá hạn', canceled: 'Đã hủy' };
  const statusBadges = { todo: 'bg-blue', doing: 'bg-orange', waiting: 'bg-purple', completed: 'bg-emerald', overdue: 'bg-rose', canceled: 'bg-gray' };

  tasks.forEach(t => {
    const assignee = AppState.users.find(u => u.id === t.assigneeId);
    const helper = AppState.users.find(u => u.id === t.helperId);
    
    // Highlight if updated today
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
    const isToday = t.deadline === todayStr; // simplification
    const timeHighlight = isToday ? 'time-updated-today' : '';

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${t.title}</strong></td>
      <td><span class="badge bg-gray">${deptLabels[t.dept] || t.dept}</span></td>
      <td>${assignee ? assignee.name : 'Chưa giao'}</td>
      <td>${helper ? helper.name : 'Không'}</td>
      <td><span class="badge ${priorityBadges[t.priority]}">${priorityLabels[t.priority]}</span></td>
      <td class="${timeHighlight}">${t.deadline || 'Chưa đặt'}</td>
      <td><span class="badge ${statusBadges[t.status]}">${statusLabels[t.status]}</span></td>
      <td class="text-center">
        <button class="btn btn-sm btn-outline" onclick="openOpsTaskDetail('${t.id}')">Chi tiết</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function renderSingleTasksBoard(tasks) {
  // Clear all board cards containers
  ['todo', 'doing', 'waiting', 'completed', 'overdue', 'canceled'].forEach(status => {
    const container = document.querySelector(`.kanban-cards-container[data-status="${status}"]`);
    if (container) container.innerHTML = '';
  });

  tasks.forEach(t => {
    const container = document.querySelector(`.kanban-cards-container[data-status="${t.status}"]`);
    if (!container) return;

    const assignee = AppState.users.find(u => u.id === t.assigneeId);
    const card = document.createElement('div');
    card.className = 'kanban-card';
    card.setAttribute('draggable', 'true');
    card.setAttribute('data-id', t.id);

    card.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:flex-start;">
        <div class="card-client-name" style="font-weight:bold; flex-grow:1; margin-right:8px;">${t.title}</div>
        ${t.status !== 'completed' ? `
          <button class="btn btn-xs btn-success" style="padding:1px 4px; font-size:9px; flex-shrink:0; border: none; border-radius: 4px; color: white; background: #10b981; cursor: pointer;" onclick="event.stopPropagation(); window.quickCompleteTask('${t.id}')">
            <i class="fa-solid fa-check"></i> Xong
          </button>
        ` : ''}
      </div>
      <div class="card-desc" style="margin-top:4px;">${t.desc || 'Không có mô tả.'}</div>
      <div class="card-meta" style="margin-top:8px; border-top:1px solid var(--border-color); padding-top:6px; display:flex; justify-content:space-between; align-items:center;">
        <span style="font-size:10px; color:var(--text-muted);"><i class="fa-solid fa-circle-user"></i> ${assignee ? assignee.name.split(' ').pop() : 'Chưa giao'}</span>
        <span style="font-size:10px; color:var(--text-muted);"><i class="fa-solid fa-clock"></i> ${t.deadline}</span>
      </div>
    `;

    card.addEventListener('dragstart', (e) => {
      draggingFlowId = t.id; // reuse the global dragging variable
      e.dataTransfer.setData('text/plain', t.id);
      card.classList.add('dragging');
    });

    card.addEventListener('dragend', () => {
      card.classList.remove('dragging');
      draggingFlowId = null;
    });

    card.addEventListener('click', () => {
      openOpsTaskDetail(t.id);
    });

    container.appendChild(card);
  });

  // Setup dragover / drop on single task board status columns
  document.querySelectorAll('#tasks-single-board-container .kanban-column').forEach(col => {
    const cardsContainer = col.querySelector('.kanban-cards-container');
    const status = col.getAttribute('data-status');

    cardsContainer.addEventListener('dragover', (e) => {
      e.preventDefault();
      col.classList.add('drag-over');
    });

    cardsContainer.addEventListener('dragleave', () => {
      col.classList.remove('drag-over');
    });

    cardsContainer.addEventListener('drop', (e) => {
      e.preventDefault();
      col.classList.remove('drag-over');
      const taskId = e.dataTransfer.getData('text/plain') || draggingFlowId;
      const task = AppState.single_tasks.find(tk => tk.id === taskId);
      if (task && task.status !== status) {
        task.status = status;
        
        if (task.assigneeId === AppState.currentUserId) {
          if (typeof window.updateStreakOnActivity === 'function') {
            window.updateStreakOnActivity(AppState.currentUserId);
          }
        }
        if (status === 'completed') {
          if (typeof window.awardPointsForCompletedTask === 'function') {
            window.awardPointsForCompletedTask(task);
          }
        }
        
        saveState();
        renderOpsSingleTasks();
        addNotification('Cập nhật Công việc 📝', `Đã chuyển công việc "${task.title}" sang cột ${status.toUpperCase()}`, 'info');
      }
    });
  });
}

function renderSingleTasksCalendar(tasks) {
  const grid = document.getElementById('calendar-days-grid');
  grid.innerHTML = '';

  const monthYearLabel = document.getElementById('calendar-month-year');
  const monthNames = ["Tháng 01", "Tháng 02", "Tháng 03", "Tháng 04", "Tháng 05", "Tháng 06", "Tháng 07", "Tháng 08", "Tháng 09", "Tháng 10", "Tháng 11", "Tháng 12"];
  monthYearLabel.innerText = `${monthNames[currentCalendarMonth]} / ${currentCalendarYear}`;

  // First day of currentCalendarMonth
  const firstDay = new Date(currentCalendarYear, currentCalendarMonth, 1).getDay();
  // Total days in month
  const totalDays = new Date(currentCalendarYear, currentCalendarMonth + 1, 0).getDate();

  const prevMonthTotalDays = new Date(currentCalendarYear, currentCalendarMonth, 0).getDate();

  // Render empty cells for previous month padding
  for (let i = firstDay - 1; i >= 0; i--) {
    const day = prevMonthTotalDays - i;
    const cell = document.createElement('div');
    cell.className = 'calendar-cell';
    cell.style.opacity = '0.3';
    cell.innerHTML = `<div class="calendar-cell-header">${day}</div>`;
    grid.appendChild(cell);
  }

  // Render days of the month
  const today = new Date();
  for (let d = 1; d <= totalDays; d++) {
    const cell = document.createElement('div');
    const isToday = today.getDate() === d && today.getMonth() === currentCalendarMonth && today.getFullYear() === currentCalendarYear;
    
    cell.className = `calendar-cell ${isToday ? 'today' : ''}`;
    
    let html = `<div class="calendar-cell-header">${d}</div><div class="calendar-cell-tasks">`;

    // Filter tasks for this specific date
    const dateStr = `${currentCalendarYear}-${String(currentCalendarMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dayTasks = tasks.filter(t => t.deadline === dateStr);

    dayTasks.forEach(task => {
      const priorityColors = { low: '#3b82f6', normal: '#6b7280', high: '#f59e0b', urgent: '#ef4444' };
      html += `
        <div class="calendar-task-tag" style="background:${priorityColors[task.priority]};" onclick="event.stopPropagation(); openOpsTaskDetail('${task.id}')" title="${task.title}">
          ${task.title}
        </div>
      `;
    });

    html += `</div>`;
    cell.innerHTML = html;
    
    cell.onclick = () => {
      // open add task modal with preset date
      populateTaskUserDropdowns();
      populateTaskProjectAndClientDropdowns();
      document.getElementById('ops-task-deadline').value = dateStr;
      openModal('modal-add-ops-task');
    };

    grid.appendChild(cell);
  }

  // Next month padding
  const totalCells = grid.children.length;
  const remaining = 35 - totalCells;
  const nextPadding = remaining >= 0 ? remaining : (42 - totalCells);
  for (let i = 1; i <= nextPadding; i++) {
    const cell = document.createElement('div');
    cell.className = 'calendar-cell';
    cell.style.opacity = '0.3';
    cell.innerHTML = `<div class="calendar-cell-header">${i}</div>`;
    grid.appendChild(cell);
  }
}

function navigateCalendar(direction) {
  currentCalendarMonth += direction;
  if (currentCalendarMonth < 0) {
    currentCalendarMonth = 11;
    currentCalendarYear--;
  } else if (currentCalendarMonth > 11) {
    currentCalendarMonth = 0;
    currentCalendarYear++;
  }
  renderOpsSingleTasks();
}

let currentActiveTaskId = null;

window.openOpsTaskDetail = function(taskId) {
  const task = AppState.single_tasks.find(t => t.id === taskId);
  if (!task) return;

  currentActiveTaskId = taskId;

  document.getElementById('ops-task-detail-title').innerText = task.title;
  const assignee = AppState.users.find(u => u.id === task.assigneeId);
  const helper = AppState.users.find(u => u.id === task.helperId);
  const project = task.projectId ? (AppState.projects || []).find(p => p.id === task.projectId) : null;
  const projectText = project ? ` | Dự án: ${project.name}` : '';
  document.getElementById('ops-task-detail-subtitle').innerText = `Phụ trách: ${assignee ? assignee.name : 'Chưa giao'} | Hỗ trợ: ${helper ? helper.name : 'Không'}${projectText}`;

  // Populate assignee select dropdown
  const assigneeSelect = document.getElementById('ops-task-detail-assignee');
  if (assigneeSelect) {
    assigneeSelect.innerHTML = AppState.users.map(u => `<option value="${u.id}">${u.name}</option>`).join('');
    assigneeSelect.value = task.assigneeId || '';
  }

  // Populate helper select dropdown
  const helperSelect = document.getElementById('ops-task-detail-helper');
  if (helperSelect) {
    helperSelect.innerHTML = `<option value="">Không có hỗ trợ</option>` + AppState.users.map(u => `<option value="${u.id}">${u.name}</option>`).join('');
    helperSelect.value = task.helperId || '';
  }
  
  document.getElementById('ops-task-detail-deadline').innerText = task.deadline || 'Chưa đặt';
  document.getElementById('ops-task-detail-desc').innerText = task.desc || 'Không có mô tả chi tiết.';

  document.getElementById('ops-task-detail-desc').style.display = 'block';
  const editBtn = document.getElementById('btn-ops-task-detail-edit-desc');
  if (editBtn) editBtn.style.display = 'inline-block';
  const editGroup = document.getElementById('ops-task-detail-edit-desc-group');
  if (editGroup) editGroup.style.display = 'none';

  // Priority badge
  const priorityLabels = { low: 'Thấp', normal: 'Bình thường', high: 'Cao', urgent: 'Khẩn cấp' };
  const priorityColors = { low: 'bg-blue', normal: 'bg-gray', high: 'bg-orange', urgent: 'bg-rose' };
  const badge = document.getElementById('ops-task-detail-priority-badge');
  badge.className = `badge ${priorityColors[task.priority]}`;
  badge.innerText = priorityLabels[task.priority];

  // Status dropdown populate
  const statusSelect = document.getElementById('ops-task-detail-status');
  statusSelect.innerHTML = `
    <option value="todo" ${task.status === 'todo' ? 'selected' : ''}>Chưa làm</option>
    <option value="doing" ${task.status === 'doing' ? 'selected' : ''}>Đang làm</option>
    <option value="waiting" ${task.status === 'waiting' ? 'selected' : ''}>Chờ phản hồi</option>
    <option value="completed" ${task.status === 'completed' ? 'selected' : ''}>Hoàn thành</option>
    <option value="overdue" ${task.status === 'overdue' ? 'selected' : ''}>Quá hạn</option>
    <option value="canceled" ${task.status === 'canceled' ? 'selected' : ''}>Đã hủy</option>
  `;

  renderOpsTaskSubchecklist();
  renderOpsTaskFiles();
  renderOpsTaskComments();

  openModal('modal-ops-task-detail');
};

function renderOpsTaskSubchecklist() {
  const task = AppState.single_tasks.find(t => t.id === currentActiveTaskId);
  if (!task) return;

  const container = document.getElementById('ops-task-detail-checklist');
  container.innerHTML = '';

  if (task.checklist && task.checklist.length > 0) {
    task.checklist.forEach((item, idx) => {
      const row = document.createElement('div');
      row.style.cssText = 'display:flex; justify-content:space-between; align-items:center; background:#111827; padding:4px 8px; border-radius:4px;';
      
      const label = document.createElement('label');
      label.style.cssText = 'display:flex; align-items:center; gap:8px; font-size:12px; cursor:pointer;';
      label.innerHTML = `
        <input type="checkbox" ${item.done ? 'checked' : ''}>
        <span style="${item.done ? 'text-decoration:line-through; opacity:0.6;' : ''}">${item.text}</span>
      `;
      label.querySelector('input').onchange = (e) => {
        item.done = e.target.checked;
        saveState();
        renderOpsTaskSubchecklist();
      };

      const btnDel = document.createElement('button');
      btnDel.className = 'btn btn-sm btn-outline text-rose';
      btnDel.style.cssText = 'padding:2px 6px; font-size:10px;';
      btnDel.innerHTML = '<i class="fa-solid fa-trash"></i>';
      btnDel.onclick = () => {
        task.checklist.splice(idx, 1);
        saveState();
        renderOpsTaskSubchecklist();
      };

      row.appendChild(label);
      row.appendChild(btnDel);
      container.appendChild(row);
    });
  } else {
    container.innerHTML = `<span class="text-muted" style="font-size:12px; font-style:italic;">Chưa tạo checklist con.</span>`;
  }
}

function handleAddTaskChecklistItem() {
  const input = document.getElementById('ops-task-detail-new-chk');
  const val = input.value.trim();
  if (!val) return;

  const task = AppState.single_tasks.find(t => t.id === currentActiveTaskId);
  if (task) {
    if (!task.checklist) task.checklist = [];
    task.checklist.push({ text: val, done: false });
    input.value = '';
    saveState();
    renderOpsTaskSubchecklist();
  }
}

function renderOpsTaskFiles() {
  const task = AppState.single_tasks.find(t => t.id === currentActiveTaskId);
  if (!task) return;

  const container = document.getElementById('ops-task-detail-files');
  container.innerHTML = '';

  if (task.attachments && task.attachments.length > 0) {
    task.attachments.forEach((file, idx) => {
      const row = document.createElement('div');
      row.style.cssText = 'display:flex; justify-content:space-between; align-items:center; font-size:11px; background:#111827; padding:4px 8px; border-radius:4px;';
      row.innerHTML = `
        <a href="${file.url}" target="_blank" style="color:var(--color-primary);"><i class="fa-solid fa-paperclip"></i> ${file.name}</a>
        <button class="btn btn-sm btn-outline text-rose" style="padding:2px 6px; font-size:9px;" onclick="handleDeleteTaskFile(${idx})"><i class="fa-solid fa-trash-can"></i></button>
      `;
      container.appendChild(row);
    });
  } else {
    container.innerHTML = `<span class="text-muted" style="font-size:12px; font-style:italic;">Chưa có tài liệu đính kèm.</span>`;
  }
}

window.handleDeleteTaskFile = function(idx) {
  const task = AppState.single_tasks.find(t => t.id === currentActiveTaskId);
  if (task && task.attachments) {
    task.attachments.splice(idx, 1);
    saveState();
    renderOpsTaskFiles();
  }
};

function handleAddTaskFile() {
  const nameInput = document.getElementById('ops-task-detail-new-file-name');
  const urlInput = document.getElementById('ops-task-detail-new-file-url');
  const name = nameInput.value.trim();
  const url = urlInput.value.trim();
  if (!name || !url) return;

  const task = AppState.single_tasks.find(t => t.id === currentActiveTaskId);
  if (task) {
    if (!task.attachments) task.attachments = [];
    task.attachments.push({
      name: name,
      url: url,
      uploader: AppState.currentUserId,
      date: new Date().toISOString().split('T')[0]
    });
    nameInput.value = '';
    urlInput.value = '';
    saveState();
    renderOpsTaskFiles();
  }
}

function renderOpsTaskComments() {
  const task = AppState.single_tasks.find(t => t.id === currentActiveTaskId);
  if (!task) return;

  const container = document.getElementById('ops-task-detail-comments');
  container.innerHTML = '';

  if (task.comments && task.comments.length > 0) {
    task.comments.forEach(c => {
      const row = document.createElement('div');
      row.className = 'chat-msg-row';
      row.innerHTML = `
        <div class="chat-msg-header">
          <strong>${c.user}</strong>
          <span>${c.date}</span>
        </div>
        <div class="chat-msg-body">${c.text}</div>
      `;
      container.appendChild(row);
    });
    // Scroll to bottom
    container.scrollTop = container.scrollHeight;
  } else {
    container.innerHTML = `<span class="text-muted" style="font-size:12px; font-style:italic;">Chưa có thảo luận nào.</span>`;
  }
}

function handleAddTaskComment() {
  const input = document.getElementById('ops-task-detail-new-comment');
  const text = input.value.trim();
  if (!text) return;

  const task = AppState.single_tasks.find(t => t.id === currentActiveTaskId);
  if (task) {
    if (!task.comments) task.comments = [];
    const user = AppState.users.find(u => u.id === AppState.currentUserId) || { name: 'Nhân viên' };
    
    const now = new Date();
    const dateStr = `${now.getHours()}:${now.getMinutes()} ${now.getDate()}/${now.getMonth() + 1}`;
    
    task.comments.push({
      user: user.name,
      text: text,
      date: dateStr
    });

    input.value = '';
    saveState();
    renderOpsTaskComments();
  }
}

function handleSaveTaskDetails() {
  const task = AppState.single_tasks.find(t => t.id === currentActiveTaskId);
  if (!task) return;

  const oldStatus = task.status;
  const newStatus = document.getElementById('ops-task-detail-status').value;
  
  if (oldStatus !== newStatus) {
    task.status = newStatus;
    
    // Update streak if current user is assignee
    if (task.assigneeId === AppState.currentUserId) {
      if (typeof window.updateStreakOnActivity === 'function') {
        window.updateStreakOnActivity(AppState.currentUserId);
      }
    }
    
    // Award points if status is changed to completed
    if (newStatus === 'completed') {
      if (typeof window.awardPointsForCompletedTask === 'function') {
        window.awardPointsForCompletedTask(task);
      }
    }
  }

  // Save assignee and helper updates
  const assigneeEl = document.getElementById('ops-task-detail-assignee');
  const helperEl = document.getElementById('ops-task-detail-helper');
  if (assigneeEl) {
    task.assigneeId = assigneeEl.value;
  }
  if (helperEl) {
    task.helperId = helperEl.value || null;
  }

  saveState();
  closeModal('modal-ops-task-detail');
  renderOpsSingleTasks();
  if (typeof renderMyTasks === 'function') renderMyTasks();
  showToast('Đã cập nhật thông tin công việc!', 'success');
}

function handleDeleteTask() {
  if (confirm('Bạn có thực sự muốn xóa công việc này?')) {
    AppState.single_tasks = AppState.single_tasks.filter(t => t.id !== currentActiveTaskId);
    saveState();
    closeModal('modal-ops-task-detail');
    renderOpsSingleTasks();
    showToast('Đã xóa công việc.', 'info');
  }
}

function handleAddSingleTaskSubmit(e) {
  e.preventDefault();
  
  const title = document.getElementById('ops-task-title').value.trim();
  const desc = document.getElementById('ops-task-desc').value.trim();
  const dept = document.getElementById('ops-task-dept').value;
  const priority = document.getElementById('ops-task-priority').value;
  const assigneeId = document.getElementById('ops-task-assignee').value;
  const helperId = document.getElementById('ops-task-helper').value;
  const deadline = document.getElementById('ops-task-deadline').value;
  const projectId = document.getElementById('ops-task-project').value;
  const clientSelectVal = document.getElementById('ops-task-client').value;
  
  let clientId = null;
  let workflowId = null;
  if (clientSelectVal.startsWith('client-')) clientId = clientSelectVal;
  else if (clientSelectVal.startsWith('flow-')) {
    workflowId = clientSelectVal;
    const flow = AppState.shipment_workflows.find(f => f.id === workflowId);
    if (flow) clientId = flow.clientId;
  }

  const tags = document.getElementById('ops-task-tags').value.split(',').map(s => s.trim()).filter(Boolean);

  const newTask = {
    id: `task-ops-${Date.now()}`,
    title: title,
    desc: desc,
    assigneeId: assigneeId,
    helperId: helperId || null,
    dept: dept,
    priority: priority,
    deadline: deadline,
    status: 'todo',
    projectId: projectId || null,
    clientId: clientId,
    workflowId: workflowId,
    tags: tags,
    checklist: [],
    attachments: [],
    comments: [],
    history: [`${new Date().toISOString().split('T')[0]}: Khởi tạo công việc đơn lẻ`]
  };

  AppState.single_tasks.push(newTask);
  saveState();
  closeModal('modal-add-ops-task');
  document.getElementById('form-add-ops-task').reset();
  renderOpsSingleTasks();

  // If in project views, refresh project tasks & overview lists
  if (currentActiveProjectId) {
    renderProjectTasksTab(currentActiveProjectId);
    if (typeof openProjectDedicatedView === 'function') {
      openProjectDedicatedView(currentActiveProjectId);
    } else {
      openProjectDetails(currentActiveProjectId);
    }
  }

  addNotification('Giao Việc 📝', `Đã giao công việc mới: "${title}" cho nhân viên phụ trách.`, 'success');
}

function populateTaskUserDropdowns() {
  const users = AppState.users;
  ['ops-task-assignee', 'ops-task-helper'].forEach(id => {
    const select = document.getElementById(id);
    if (!select) return;
    select.innerHTML = '';
    
    if (id === 'ops-task-helper') {
      select.innerHTML = '<option value="">-- Không có --</option>';
    }

    users.forEach(u => {
      const opt = document.createElement('option');
      opt.value = u.id;
      opt.innerText = u.name;
      select.appendChild(opt);
    });
  });
}

function populateTaskProjectAndClientDropdowns() {
  const projSelect = document.getElementById('ops-task-project');
  if (projSelect) {
    projSelect.innerHTML = '<option value="">-- Không ghim dự án --</option>';
    AppState.projects.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.innerText = p.name;
      projSelect.appendChild(opt);
    });
  }

  const clientSelect = document.getElementById('ops-task-client');
  if (clientSelect) {
    clientSelect.innerHTML = '<option value="">-- Không liên kết --</option>';
    
    // Group Clients
    const groupClients = document.createElement('optgroup');
    groupClients.label = 'Khách Hàng Cũ';
    AppState.clients.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.innerText = `${c.name} (${c.code})`;
      groupClients.appendChild(opt);
    });
    clientSelect.appendChild(groupClients);

    // Group Workflows
    const groupFlows = document.createElement('optgroup');
    groupFlows.label = 'Quy Trình Lô Hàng';
    AppState.shipment_workflows.forEach(w => {
      const opt = document.createElement('option');
      opt.value = w.id;
      opt.innerText = w.name;
      groupFlows.appendChild(opt);
    });
    clientSelect.appendChild(groupFlows);
  }
}

function populateTasksFiltersOnce() {
  const select = document.getElementById('tasks-single-filter-assignee');
  if (!select || select.children.length > 1) return;
  AppState.users.forEach(u => {
    const opt = document.createElement('option');
    opt.value = u.id;
    opt.innerText = u.name;
    select.appendChild(opt);
  });
}


// ==================== DỰ ÁN VẬN HÀNH LOGIC ==================== //
function renderOpsProjects() {
  const listContainer = document.getElementById('projects-list-container');
  if (!listContainer) return;
  listContainer.innerHTML = '';

  if (AppState.projects.length === 0) {
    listContainer.innerHTML = `<span class="text-muted" style="padding:15px; font-style:italic;">Chưa có dự án nào.</span>`;
    return;
  }

  AppState.projects.forEach(p => {
    const card = document.createElement('div');
    card.className = `dashboard-card project-card-item ${currentActiveProjectId === p.id ? 'active' : ''}`;
    card.style.cssText = `cursor:pointer; border: 1px solid ${currentActiveProjectId === p.id ? 'var(--color-primary)' : 'var(--border-color)'}; padding:12px;`;
    
    const manager = AppState.users.find(u => u.id === p.managerId) || { name: 'Chưa giao' };

    card.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <strong>${p.name}</strong>
        <span class="badge bg-blue" style="font-size:9.5px;">${p.type}</span>
      </div>
      <div style="font-size:11px; color:var(--text-secondary); margin-top:6px;">Quản lý: ${manager.name} | Thành viên: ${p.members ? p.members.length : 0}</div>
    `;

    card.onclick = () => {
      currentActiveProjectId = p.id;
      document.querySelectorAll('.project-card-item').forEach(c => c.style.borderColor = 'var(--border-color)');
      card.style.borderColor = 'var(--color-primary)';
      openProjectDetails(p.id);
      openProjectDedicatedView(p.id);
    };

    listContainer.appendChild(card);
  });
}

function openProjectDetails(projId) {
  const p = AppState.projects.find(proj => proj.id === projId);
  if (!p) return;

  document.getElementById('project-details-placeholder').style.display = 'none';
  const container = document.getElementById('project-details-container');
  container.style.display = 'block';

  document.getElementById('active-project-name').innerText = p.name;
  document.getElementById('active-project-type').innerText = `Loại: ${p.type.toUpperCase()}`;
  
  const statusLabels = { preparing: 'Đang chuẩn bị', doing: 'Đang thực hiện', paused: 'Tạm dừng', completed: 'Hoàn thành', canceled: 'Đã hủy' };
  const statusColors = { preparing: 'bg-gray', doing: 'bg-blue', paused: 'bg-purple', completed: 'bg-emerald', canceled: 'bg-rose' };
  const statusBadge = document.getElementById('active-project-status');
  statusBadge.className = `badge ${statusColors[p.status]}`;
  statusBadge.innerText = statusLabels[p.status] || p.status;

  // Active default tab Overview
  document.querySelectorAll('.project-tab-btn').forEach(b => {
    if (b.getAttribute('data-tab') === 'overview') b.classList.add('active');
    else b.classList.remove('active');
  });

  switchProjectTab('overview');
}

function switchProjectTab(tab) {
  // Hide all tab contents
  document.querySelectorAll('.project-tab-content').forEach(el => el.style.display = 'none');
  
  // Show active tab
  const activeContent = document.getElementById(`project-tab-${tab}`);
  if (activeContent) activeContent.style.display = 'block';

  const proj = AppState.projects.find(p => p.id === currentActiveProjectId);
  if (!proj) return;

  if (tab === 'overview') {
    document.getElementById('active-project-desc').innerText = proj.desc || 'Không có mô tả chi tiết.';
    const manager = AppState.users.find(u => u.id === proj.managerId);
    document.getElementById('active-project-manager').innerText = manager ? manager.name : 'Chưa giao';
    
    const membersNames = proj.members ? proj.members.map(mid => {
      const u = AppState.users.find(usr => usr.id === mid);
      return u ? u.name : null;
    }).filter(Boolean).join(', ') : '';
    document.getElementById('active-project-members').innerText = membersNames || 'Không có thành viên phụ';
    
    document.getElementById('active-project-notes').innerText = proj.notes || 'Không có ghi chú quan trọng.';

    // Populate quick view tasks inside overview tab
    const overviewTasksList = document.getElementById('project-overview-tasks-list');
    if (overviewTasksList) {
      overviewTasksList.innerHTML = '';
      const projTasks = (AppState.single_tasks || []).filter(t => t.projectId === proj.id);
      if (projTasks.length === 0) {
        overviewTasksList.innerHTML = `<span class="text-muted" style="font-size: 11.5px; font-style: italic;">Chưa có công việc nào liên kết với dự án này.</span>`;
      } else {
        projTasks.forEach(task => {
          const div = document.createElement('div');
          div.className = 'mini-task-item';
          div.style.cssText = 'padding: 8px; border-bottom: 1px solid var(--border-color); font-size: 11.5px; display:flex; justify-content:space-between; align-items:center; cursor:pointer;';
          
          const statusLabels = { pending: 'Chưa làm', doing: 'Đang làm', checking: 'Chờ duyệt', completed: 'Hoàn thành', canceled: 'Đã hủy' };
          const statusColors = { pending: 'bg-gray', doing: 'bg-blue', checking: 'bg-purple', completed: 'bg-emerald', canceled: 'bg-rose' };
          
          div.innerHTML = `
            <div>
              <strong>${task.title}</strong>
            </div>
            <div style="display:flex; align-items:center; gap:8px;">
              <span class="badge ${statusColors[task.status] || ''}" style="font-size:9px;">${statusLabels[task.status] || task.status}</span>
              <span style="font-size: 9.5px; color: var(--text-muted);">${task.deadline || 'Hạn: -'}</span>
            </div>
          `;
          div.onclick = () => {
            if (typeof openOpsTaskDetail === 'function') openOpsTaskDetail(task.id);
          };
          overviewTasksList.appendChild(div);
        });
      }
    }

    // Populate quick view docs inside overview tab
    const overviewDocsList = document.getElementById('project-overview-docs-list');
    if (overviewDocsList) {
      overviewDocsList.innerHTML = '';
      if (!proj.documents || proj.documents.length === 0) {
        overviewDocsList.innerHTML = `<span class="text-muted" style="font-size: 11.5px; font-style: italic;">Chưa ghim tài liệu hoặc liên kết nào.</span>`;
      } else {
        proj.documents.forEach(doc => {
          const div = document.createElement('div');
          div.className = 'mini-task-item';
          div.style.cssText = 'padding: 8px; border-bottom: 1px solid var(--border-color); font-size: 11.5px; display:flex; justify-content:space-between; align-items:center;';
          div.innerHTML = `
            <div>
              <i class="fa-solid fa-file-lines text-emerald" style="margin-right:6px;"></i><strong>${doc.name}</strong>
              ${doc.note ? `<span style="font-size:10.5px; opacity:0.8; margin-left:6px;">(${doc.note})</span>` : ''}
            </div>
            <a href="${doc.url}" target="_blank" style="font-size:11px; color:var(--color-primary); font-weight:bold; display:inline-flex; align-items:center; gap:4px; text-decoration:none;">
              <i class="fa-solid fa-square-share-nodes"></i> Mở link
            </a>
          `;
          overviewDocsList.appendChild(div);
        });
      }
    }
  } else if (tab === 'docs') {
    renderProjectDocsTab(proj);
  } else if (tab === 'tasks') {
    renderProjectTasksTab(proj.id);
  } else if (tab === 'discussion') {
    renderProjectDiscussionTab(proj);
  }
}

function renderProjectDocsTab(proj) {
  const tbody = document.getElementById('project-docs-list');
  tbody.innerHTML = '';

  if (!proj.documents || proj.documents.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted" style="padding:15px; font-style:italic;">Chưa ghim tài liệu hoặc link Google Drive nào.</td></tr>`;
    return;
  }

  proj.documents.forEach((doc, idx) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${doc.name}</strong></td>
      <td><a href="${doc.url}" target="_blank" style="color:var(--color-primary);"><i class="fa-solid fa-square-share-nodes"></i> Mở liên kết</a></td>
      <td>${doc.note || 'Không có'}</td>
      <td class="text-center">
        <button class="btn btn-sm btn-outline text-rose" onclick="handleDeleteProjectDoc(${idx})"><i class="fa-solid fa-trash-can"></i> Xóa</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

window.handleDeleteProjectDoc = function(idx) {
  const proj = AppState.projects.find(p => p.id === currentActiveProjectId);
  if (proj && proj.documents) {
    proj.documents.splice(idx, 1);
    saveState();
    renderProjectDocsTab(proj);
  }
};

function handleProjectAddDocSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('proj-doc-name').value.trim();
  const url = document.getElementById('proj-doc-url').value.trim();
  const note = document.getElementById('proj-doc-note').value.trim();

  const proj = AppState.projects.find(p => p.id === currentActiveProjectId);
  if (proj) {
    if (!proj.documents) proj.documents = [];
    proj.documents.push({ name: name, url: url, type: 'link', note: note });
    saveState();
    closeModal('modal-project-add-doc');
    document.getElementById('form-project-add-doc').reset();
    renderProjectDocsTab(proj);
    
    // If dedicated project view is open, refresh it too
    const dedModal = document.getElementById('modal-project-dedicated-view');
    if (dedModal && dedModal.classList.contains('active')) {
      openProjectDedicatedView(proj.id);
    }

    showToast('Đã ghim tài liệu thành công!', 'success');
  }
}

function renderProjectTasksTab(projId) {
  const tbody = document.getElementById('project-tasks-list');
  tbody.innerHTML = '';

  const projectTasks = AppState.single_tasks.filter(t => t.projectId === projId);

  if (projectTasks.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted" style="padding:15px; font-style:italic;">Chưa có công việc nào liên kết với dự án này.</td></tr>`;
    return;
  }

  const priorityLabels = { low: 'Thấp', normal: 'Bình thường', high: 'Cao', urgent: 'Khẩn cấp' };
  const priorityColors = { low: 'bg-blue', normal: 'bg-gray', high: 'bg-orange', urgent: 'bg-rose' };
  const statusLabels = { todo: 'Chưa làm', doing: 'Đang làm', waiting: 'Chờ phản hồi', completed: 'Hoàn thành', overdue: 'Quá hạn', canceled: 'Đã hủy' };
  const statusColors = { todo: 'bg-blue', doing: 'bg-orange', waiting: 'bg-purple', completed: 'bg-emerald', overdue: 'bg-rose', canceled: 'bg-gray' };

  projectTasks.forEach(t => {
    const assignee = AppState.users.find(u => u.id === t.assigneeId);
    const tr = document.createElement('tr');
    tr.style.cursor = 'pointer';
    tr.innerHTML = `
      <td><strong>${t.title}</strong></td>
      <td>${assignee ? assignee.name : 'Chưa giao'}</td>
      <td><span class="badge ${priorityColors[t.priority]}">${priorityLabels[t.priority]}</span></td>
      <td>${t.deadline || 'Chưa đặt'}</td>
      <td><span class="badge ${statusColors[t.status]}">${statusLabels[t.status]}</span></td>
    `;
    tr.onclick = () => openOpsTaskDetail(t.id);
    tbody.appendChild(tr);
  });
}

function renderProjectDiscussionTab(proj) {
  const container = document.getElementById('project-chat-messages');
  container.innerHTML = '';

  if (proj.discussions && proj.discussions.length > 0) {
    proj.discussions.forEach(msg => {
      const div = document.createElement('div');
      div.className = 'chat-msg-row';
      div.innerHTML = `
        <div class="chat-msg-header">
          <strong>${msg.user}</strong>
          <span>${msg.date}</span>
        </div>
        <div class="chat-msg-body">${msg.text}</div>
      `;
      container.appendChild(div);
    });
    container.scrollTop = container.scrollHeight;
  } else {
    container.innerHTML = `<span class="text-muted" style="padding:15px; font-style:italic;">Bắt đầu cuộc thảo luận chung cho nhóm dự án...</span>`;
  }
}

function handleProjectChatSubmit(e) {
  e.preventDefault();
  const input = document.getElementById('project-chat-input');
  const text = input.value.trim();
  if (!text) return;

  const proj = AppState.projects.find(p => p.id === currentActiveProjectId);
  if (proj) {
    if (!proj.discussions) proj.discussions = [];
    const user = AppState.users.find(u => u.id === AppState.currentUserId) || { name: 'Nhân viên' };
    
    const now = new Date();
    const dateStr = `${now.getHours()}:${now.getMinutes()} ${now.getDate()}/${now.getMonth() + 1}`;
    
    proj.discussions.push({
      user: user.name,
      text: text,
      date: dateStr
    });

    input.value = '';
    saveState();
    renderProjectDiscussionTab(proj);
  }
}

function handleAddProjectSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('project-name').value.trim();
  const type = document.getElementById('project-type').value;
  const managerId = document.getElementById('project-manager').value;
  const desc = document.getElementById('project-desc').value.trim();
  const notes = document.getElementById('project-notes').value.trim();

  // Get selected members
  const members = [];
  document.querySelectorAll('.project-member-chk:checked').forEach(chk => {
    members.push(chk.value);
  });

  const newProject = {
    id: `project-${Date.now()}`,
    name: name,
    type: type,
    desc: desc,
    managerId: managerId,
    members: members,
    status: 'preparing',
    notes: notes || 'Không có',
    documents: [],
    discussions: [],
    history: []
  };

  AppState.projects.push(newProject);
  saveState();
  closeModal('modal-add-ops-project');
  document.getElementById('form-add-ops-project').reset();
  
  renderOpsProjects();
  addNotification('Dự Án Mới 📂', `Đã tạo dự án/phòng ban mới: "${name}" thành công.`, 'success');
}

function populateProjectManagerDropdown() {
  const select = document.getElementById('project-manager');
  if (!select) return;
  select.innerHTML = '';
  AppState.users.forEach(u => {
    const opt = document.createElement('option');
    opt.value = u.id;
    opt.innerText = u.name;
    select.appendChild(opt);
  });
}

function populateProjectMembersChecklist() {
  const container = document.getElementById('project-members-checklist');
  if (!container) return;
  container.innerHTML = '';
  AppState.users.forEach(u => {
    const div = document.createElement('div');
    div.innerHTML = `
      <label style="display:flex; align-items:center; gap:6px; cursor:pointer; font-size:12.5px;">
        <input type="checkbox" class="project-member-chk" value="${u.id}">
        <span>${u.name}</span>
      </label>
    `;
    container.appendChild(div);
  });
}

function renderActiveStepComments() {
  const flow = AppState.shipment_workflows.find(f => f.id === currentActiveFlowId);
  if (!flow) return;
  const stepData = flow.steps.find(s => s.stepNum === currentActiveStepNum);
  if (!stepData) return;

  const container = document.getElementById('flow-step-comments');
  if (!container) return;
  container.innerHTML = '';

  if (stepData.comments && stepData.comments.length > 0) {
    stepData.comments.forEach(c => {
      const row = document.createElement('div');
      row.className = 'chat-msg-row';
      row.innerHTML = `
        <div class="chat-msg-header">
          <strong>${c.user}</strong>
          <span>${c.date}</span>
        </div>
        <div class="chat-msg-body">${c.text}</div>
      `;
      container.appendChild(row);
    });
    container.scrollTop = container.scrollHeight;
  } else {
    container.innerHTML = `<span class="text-muted" style="font-size:12px; font-style:italic;">Chưa có thảo luận nào ở bước này.</span>`;
  }
}

function handleFlowAddStepComment() {
  const input = document.getElementById('flow-step-new-comment');
  if (!input) return;
  const text = input.value.trim();
  if (!text) return;

  const flow = AppState.shipment_workflows.find(f => f.id === currentActiveFlowId);
  if (!flow) return;
  const stepData = flow.steps.find(s => s.stepNum === currentActiveStepNum);
  if (stepData) {
    if (!stepData.comments) stepData.comments = [];
    const user = AppState.users.find(u => u.id === AppState.currentUserId) || { name: 'Nhân sự' };
    
    const now = new Date();
    const dateStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2,'0')} ${now.getDate()}/${now.getMonth() + 1}`;
    
    stepData.comments.push({
      user: user.name,
      text: text,
      date: dateStr
    });

    input.value = '';
    saveState();
    renderActiveStepComments();
  }
}

function renderMyTasks() {
  const container = document.getElementById('view-my-tasks');
  if (!container) return;

  const loggedUser = JSON.parse(localStorage.getItem('minhhai_user') || '{}');
  const userId = AppState.currentUserId || loggedUser.id || 'usr-admin';

  // Containers
  const myFlowsList = document.getElementById('my-flows-list');
  const mySingleTasksList = document.getElementById('my-single-tasks-list');
  const myProjectTasksList = document.getElementById('my-project-tasks-list');

  myFlowsList.innerHTML = '';
  mySingleTasksList.innerHTML = '';
  myProjectTasksList.innerHTML = '';

  // Step names translation mapping
  const stepNames = [
    "Nhận thông tin", "Báo giá", "Thương lượng", "Thành công", "Mua hàng",
    "Shop gửi hàng", "Về kho TQ", "Về kho VN", "Giao hàng", "Thu nợ", "Hoàn tất"
  ];

  let flowsCount = 0;

  // 1. Shipment workflows - steps assigned to user
  if (AppState.shipment_workflows) {
    AppState.shipment_workflows.forEach(flow => {
      const stepData = flow.steps.find(s => s.stepNum === flow.stage);
      if (stepData && stepData.assigneeId === userId && stepData.status !== 'done') {
        flowsCount++;
        const client = AppState.clients.find(c => c.id === flow.clientId) || {};
        
        // Checklist progress count
        const chkDone = stepData.checklist ? stepData.checklist.filter(c => c.done).length : 0;
        const chkTotal = stepData.checklist ? stepData.checklist.length : 0;

        const isOverdue = flow.deadline && new Date(flow.deadline) < new Date() && flow.stage < 11;

        const card = document.createElement('div');
        card.className = 'kanban-card';
        card.style.cssText = 'cursor: pointer; border-left: 4px solid #3b82f6; transition: transform 0.2s; margin-bottom: 8px;';
        card.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:10px; font-weight:bold; color:#3b82f6;">${client.code || 'KH CŨ'}</span>
            <span class="badge bg-blue" style="font-size:9px; padding:2px 4px;">Bước ${flow.stage}</span>
          </div>
          <div class="card-client-name" style="margin-top:6px; font-size:13px; font-weight:bold;">${flow.name}</div>
          <div style="font-size:11px; opacity:0.8; margin-top:4px;">Khâu: <strong>${stepNames[flow.stage - 1]}</strong></div>
          <div style="font-size:11px; margin-top:4px;"><i class="fa-solid fa-list-check"></i> Checklist: ${chkDone}/${chkTotal} việc</div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px; border-top:1px solid var(--border-color); padding-top:6px;">
            <span style="font-size:10px; color:${isOverdue ? '#ef4444' : 'var(--text-muted)'};"><i class="fa-solid fa-calendar-xmark"></i> Hạn: ${flow.deadline || 'Không có'}</span>
          </div>
        `;
        card.onclick = () => {
          openFlowDetailModal(flow.id);
        };
        myFlowsList.appendChild(card);
      }
    });
  }

  // 2. CRM Leads (Khách Hàng Mới) assigned to user
  if (AppState.leads) {
    AppState.leads.forEach(lead => {
      if (lead.salesId === userId && lead.stage !== 'success' && lead.stage !== 'failed') {
        flowsCount++;
        
        const stageLabels = {
          receive_info: "Nhận thông tin",
          get_phone: "Lấy SĐT/Wechat",
          explore_info: "Khai thác thông tin",
          quotation: "Báo giá",
          negotiating: "Thương lượng"
        };

        const card = document.createElement('div');
        card.className = 'kanban-card';
        card.style.cssText = 'cursor: pointer; border-left: 4px solid #8b5cf6; transition: transform 0.2s; margin-bottom: 8px;';
        card.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:10px; font-weight:bold; color:#8b5cf6;">CRM KHÁCH MỚI</span>
            <span class="badge" style="font-size:9px; padding:2px 4px; background:#8b5cf6; color:white;">${stageLabels[lead.stage] || lead.stage}</span>
          </div>
          <div class="card-client-name" style="margin-top:6px; font-size:13px; font-weight:bold;">${lead.name}</div>
          <div class="card-desc" style="font-size:11px; opacity:0.8; margin-top:4px;">SĐT: ${lead.phone || 'Chưa có'}</div>
          <div style="font-size:11px; margin-top:4px; max-height:36px; overflow:hidden; text-overflow:ellipsis; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical;">Nhu cầu: ${lead.note || 'Không có'}</div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px; border-top:1px solid var(--border-color); padding-top:6px;">
            <span style="font-size:10px; color:var(--text-muted);"><i class="fa-solid fa-clock"></i> Ngày tạo: ${lead.date || ''}</span>
            <strong style="font-size:11px; color:#34d399;">${lead.valVnd > 0 ? formatVnd(lead.valVnd) : '0đ'}</strong>
          </div>
        `;
        card.onclick = () => {
          if (typeof openLeadDetailModal === 'function') {
            openLeadDetailModal(lead.id);
          }
        };
        myFlowsList.appendChild(card);
      }
    });
  }

  document.getElementById('my-flows-count').innerText = flowsCount;
  if (flowsCount === 0) {
    myFlowsList.innerHTML = `<span class="text-muted" style="font-size:12px; font-style:italic; padding: 15px; text-align:center;">Tuyệt vời! Không có lô hàng hay Lead khách mới nào chờ bạn xử lý.</span>`;
  }

  // 3. Single Tasks & Project Tasks
  let singleCount = 0;
  let projectCount = 0;

  if (AppState.single_tasks) {
    AppState.single_tasks.forEach(task => {
      if (task.assigneeId === userId && task.status !== 'completed' && task.status !== 'canceled') {
        const chkDone = task.checklist ? task.checklist.filter(c => c.done).length : 0;
        const chkTotal = task.checklist ? task.checklist.length : 0;
        
        const pLabels = { low: 'Thấp', normal: 'Thường', high: 'Cao', urgent: 'Khẩn cấp' };
        const pColors = { low: '#10b981', normal: '#3b82f6', high: '#f59e0b', urgent: '#ef4444' };

        const isOverdue = task.deadline && new Date(task.deadline) < new Date();

        const card = document.createElement('div');
        card.className = 'kanban-card';
        card.style.cssText = `cursor: pointer; border-left: 4px solid ${task.projectId ? '#10b981' : '#f59e0b'}; transition: transform 0.2s; margin-bottom: 8px;`;

        let projectInfoHtml = '';
        if (task.projectId) {
          const proj = (AppState.projects || []).find(p => p.id === task.projectId);
          if (proj) {
            projectInfoHtml = `<div style="font-size:11px; margin-top:4px; color:#10b981; font-weight:bold;"><i class="fa-solid fa-folder-open"></i> Dự án: ${proj.name}</div>`;
          }
        }

        card.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span class="badge" style="font-size:9px; padding:2px 4px; background:${pColors[task.priority] || '#fff'}; color:white;">Ưu tiên: ${pLabels[task.priority] || 'Bình thường'}</span>
            <div style="display:flex; align-items:center; gap:6px;">
              <span style="font-size:9.5px; color:var(--text-muted);">${task.dept.toUpperCase()}</span>
              <button class="btn btn-xs btn-success" style="padding: 1px 4px; font-size: 9px; line-height: 1; border: none; border-radius: 4px; color: white; background: #10b981; cursor: pointer;" onclick="event.stopPropagation(); window.quickCompleteTask('${task.id}')">
                <i class="fa-solid fa-check"></i> Xong
              </button>
            </div>
          </div>
          <div class="card-client-name" style="margin-top:6px; font-size:13px; font-weight:bold;">${task.title}</div>
          ${projectInfoHtml}
          <div style="font-size:11px; margin-top:4px;"><i class="fa-solid fa-list-check"></i> Checklist: ${chkDone}/${chkTotal} việc</div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px; border-top:1px solid var(--border-color); padding-top:6px;">
            <span style="font-size:10px; color:${isOverdue ? '#ef4444' : 'var(--text-muted)'};"><i class="fa-solid fa-calendar-xmark"></i> Hạn: ${task.deadline || 'Không có'}</span>
          </div>
        `;
        
        card.onclick = () => {
          if (typeof openOpsTaskDetail === 'function') {
            openOpsTaskDetail(task.id);
          }
        };

        if (task.projectId) {
          projectCount++;
          myProjectTasksList.appendChild(card);
        } else {
          singleCount++;
          mySingleTasksList.appendChild(card);
        }
      }
    });
  }

  // 4. CRM Tasks (Công việc CRM khách hàng mới)
  if (AppState.tasks) {
    AppState.tasks.forEach(task => {
      if (task.assigneeId === userId && task.status !== 'completed' && task.status !== 'canceled') {
        singleCount++;

        const steps = AppState.workflows[task.dept] || [];
        let currentStepIdx = task.stepsStatus ? task.stepsStatus.lastIndexOf(true) : 0;
        if (currentStepIdx === -1) currentStepIdx = 0;

        const isOverdue = task.deadline && new Date(task.deadline) < new Date();

        let stepSelectHtml = '';
        if (steps.length > 0) {
          stepSelectHtml = `
            <div style="margin-top: 8px;" onclick="event.stopPropagation();">
              <label style="font-size: 10px; color: var(--text-muted); font-weight: bold;">Khâu xử lý:</label>
              <select class="form-control" style="font-size: 11px; height: 26px; padding: 2px 6px; margin-top: 2px;" onchange="handleMyCrmTaskStepChange('${task.id}', this.value)">
                ${steps.map((st, idx) => `
                  <option value="${idx}" ${idx === currentStepIdx ? 'selected' : ''}>${idx + 1}. ${st}</option>
                `).join('')}
              </select>
            </div>
          `;
        }

        let actionBtnHtml = '';
        if (task.status === 'checking') {
          const user = AppState.users.find(u => u.id === userId) || {};
          if (user.role === 'admin') {
            actionBtnHtml = `<button class="btn btn-xs btn-primary" style="margin-top:8px; width:100%;" onclick="event.stopPropagation(); handleMyCrmTaskApprove('${task.id}')"><i class="fa-solid fa-circle-check"></i> Duyệt thưởng</button>`;
          } else {
            actionBtnHtml = `<div style="font-size:10px; color:var(--text-muted); margin-top:6px; font-style:italic;"><i class="fa-solid fa-hourglass-start"></i> Đang chờ duyệt...</div>`;
          }
        } else {
          actionBtnHtml = `<button class="btn btn-xs btn-secondary" style="margin-top:8px; width:100%;" onclick="event.stopPropagation(); handleMyCrmTaskSubmit('${task.id}')"><i class="fa-solid fa-share-from-square"></i> Nộp kết quả</button>`;
        }

        const card = document.createElement('div');
        card.className = 'kanban-card';
        card.style.cssText = 'cursor: pointer; border-left: 4px solid #a855f7; transition: transform 0.2s; margin-bottom: 8px;';
        card.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:10px; font-weight:bold; color:#a855f7;">CRM KHÁCH MỚI (TASK)</span>
            <span class="badge" style="font-size:9px; padding:2px 4px; background:#a855f7; color:white;">${task.status === 'checking' ? 'Chờ duyệt' : 'Chưa xong'}</span>
          </div>
          <div class="card-client-name" style="margin-top:6px; font-size:13px; font-weight:bold;">${task.title}</div>
          <div style="font-size:11px; opacity:0.8; margin-top:4px;">Chi tiết: ${task.desc || 'Không có'}</div>
          ${stepSelectHtml}
          ${actionBtnHtml}
          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px; border-top:1px solid var(--border-color); padding-top:6px;">
            <span style="font-size:10px; color:${isOverdue ? '#ef4444' : 'var(--text-muted)'};"><i class="fa-solid fa-calendar-xmark"></i> Hạn: ${task.deadline || 'Không giới hạn'}</span>
            <span style="font-size:10px; color:#f59e0b;"><i class="fa-solid fa-cookie"></i> +${task.points} Xúc xích</span>
          </div>
        `;
        
        card.onclick = () => {
          window.location.hash = 'tasks';
        };

        mySingleTasksList.appendChild(card);
      }
    });
  }

  document.getElementById('my-single-tasks-count').innerText = singleCount;
  if (singleCount === 0) {
    mySingleTasksList.innerHTML = `<span class="text-muted" style="font-size:12px; font-style:italic; padding: 15px; text-align:center;">Tuyệt vời! Không có nhiệm vụ đơn lẻ nào cần làm.</span>`;
  }

  document.getElementById('my-project-tasks-count').innerText = projectCount;
  if (projectCount === 0) {
    myProjectTasksList.innerHTML = `<span class="text-muted" style="font-size:12px; font-style:italic; padding: 15px; text-align:center;">Tuyệt vời! Không có việc dự án VIP nào cần làm.</span>`;
  }
}

// Global window-scoped functions to bridge CRM Tasks functionality directly in My Tasks view cards
window.handleMyCrmTaskStepChange = function(taskId, stepIdxVal) {
  const stepIdx = parseInt(stepIdxVal);
  const task = AppState.tasks.find(t => t.id === taskId);
  if (!task) return;

  const steps = AppState.workflows[task.dept] || [];
  task.stepsStatus = steps.map((_, idx) => idx <= stepIdx);
  task.status = 'doing';

  if (stepIdx === steps.length - 1) {
    if (confirm(`Bạn đã chọn bước cuối cùng: "${steps[stepIdx]}". Bạn có muốn NỘP KẾT QUẢ công việc này lên Quản lý để duyệt nhận ${task.points} Xúc xích không?`)) {
      task.status = 'checking';
      const user = AppState.users.find(u => u.id === AppState.currentUserId) || { name: 'Nhân sự' };
      addNotification('Chờ duyệt công việc', `${user.name} đã hoàn thành và nộp công việc: ${task.title}`, 'info');
    }
  }

  saveState();
  if (typeof renderTasksList === 'function') renderTasksList();
  renderMyTasks();
  showToast(`Đã cập nhật tiến độ công việc đến bước: ${steps[stepIdx]}`, 'success');
};

window.handleMyCrmTaskSubmit = function(taskId) {
  if (typeof submitTaskForApproval === 'function') {
    submitTaskForApproval(taskId);
    setTimeout(() => {
      renderMyTasks();
    }, 200);
  }
};

window.handleMyCrmTaskApprove = function(taskId) {
  if (typeof approveTask === 'function') {
    approveTask(taskId);
    setTimeout(() => {
      renderMyTasks();
    }, 200);
  }
};

window.openGlobalAddOpsFlowModal = function() {
  if (typeof populateFlowUserDropdowns === 'function') populateFlowUserDropdowns();
  if (typeof populateFlowClientDropdown === 'function') populateFlowClientDropdown();
  openModal('modal-add-ops-flow');
};

window.openGlobalAddOpsTaskModal = function(isProjectTask = false) {
  if (typeof populateTaskUserDropdowns === 'function') populateTaskUserDropdowns();
  if (typeof populateTaskProjectAndClientDropdowns === 'function') populateTaskProjectAndClientDropdowns();
  
  // Default deadline to 3 days from now
  const today = new Date();
  today.setDate(today.getDate() + 3);
  const deadlineInput = document.getElementById('ops-task-deadline');
  if (deadlineInput) {
    deadlineInput.value = today.toISOString().split('T')[0];
  }

  const titleHeader = document.querySelector('#modal-add-ops-task h3');
  const projectSelect = document.getElementById('ops-task-project');

  if (isProjectTask) {
    if (titleHeader) titleHeader.innerText = 'Tạo Công Việc Trong Dự Án';
    if (projectSelect) {
      projectSelect.required = true;
      projectSelect.style.border = '2px solid #f59e0b';
      if (projectSelect.options.length > 1) {
        projectSelect.selectedIndex = 1;
      }
    }
  } else {
    if (titleHeader) titleHeader.innerText = 'Giao Việc Đơn Lẻ Mới';
    if (projectSelect) {
      projectSelect.required = false;
      projectSelect.style.border = '';
      projectSelect.selectedIndex = 0;
    }
  }
  
  openModal('modal-add-ops-task');
};

window.openProjectDedicatedView = function(projId) {
  const p = (AppState.projects || []).find(proj => proj.id === projId);
  if (!p) return;

  currentActiveProjectId = projId;

  // Set titles
  document.getElementById('dedicated-project-name').innerText = p.name;
  
  const manager = AppState.users.find(u => u.id === p.managerId);
  const managerName = manager ? manager.name : 'Chưa giao';
  
  const membersNames = p.members ? p.members.map(mid => {
    const u = AppState.users.find(usr => usr.id === mid);
    return u ? u.name : null;
  }).filter(Boolean).join(', ') : '';
  
  document.getElementById('dedicated-project-meta').innerText = `Quản lý: ${managerName} | Thành viên: ${membersNames || 'Không có'}`;
  
  // Reset description editing mode views
  const viewMode = document.getElementById('project-desc-view-mode');
  const editMode = document.getElementById('project-desc-edit-mode');
  const btnEditDesc = document.getElementById('btn-edit-project-desc');
  if (viewMode) viewMode.style.display = 'block';
  if (editMode) editMode.style.display = 'none';
  if (btnEditDesc) btnEditDesc.style.display = '';

  document.getElementById('dedicated-project-desc').innerText = (p.desc || 'Không có mô tả chi tiết.') + '\n' + (p.notes ? `Lưu ý: ${p.notes}` : '');

  // Calculate and update progress bar
  const projTasks = (AppState.single_tasks || []).filter(t => t.projectId === projId);
  const totalTasks = projTasks.length;
  const completedTasks = projTasks.filter(t => t.status === 'completed').length;
  const percent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  const percentEl = document.getElementById('dedicated-project-progress-percent');
  if (percentEl) percentEl.innerText = `${percent}%`;
  
  const barEl = document.getElementById('dedicated-project-progress-bar');
  if (barEl) barEl.style.width = `${percent}%`;

  // Render tasks
  const tasksContainer = document.getElementById('dedicated-project-tasks-list');
  tasksContainer.innerHTML = '';
  if (projTasks.length === 0) {
    tasksContainer.innerHTML = `<span class="text-muted" style="font-size: 12.5px; font-style: italic; text-align: center; padding: 20px 0; width: 100%;">Chưa có công việc nào liên kết với dự án này.</span>`;
  } else {
    projTasks.forEach(task => {
      const div = document.createElement('div');
      div.className = 'mini-task-item';
      div.style.cssText = 'padding: 10px; border-bottom: 1px solid var(--border-color); font-size: 12.5px; display:flex; justify-content:space-between; align-items:center; cursor:pointer; background: rgba(255,255,255,0.02); border-radius: 4px; margin-bottom: 6px;';
      
      const statusLabels = { 
        todo: 'Chưa làm', 
        pending: 'Chưa làm',
        doing: 'Đang làm', 
        waiting: 'Chờ phản hồi',
        checking: 'Chờ duyệt',
        completed: 'Hoàn thành', 
        overdue: 'Quá hạn', 
        canceled: 'Đã hủy' 
      };
      const statusColors = { 
        todo: 'bg-blue',
        pending: 'bg-gray', 
        doing: 'bg-orange', 
        waiting: 'bg-purple',
        checking: 'bg-purple', 
        completed: 'bg-emerald', 
        overdue: 'bg-rose',
        canceled: 'bg-gray' 
      };
      
      const isCompleted = task.status === 'completed';
      const completeButton = isCompleted ? '' : `
        <button class="btn btn-xs btn-primary" onclick="handleQuickCompleteTask(event, '${task.id}')" style="padding: 2px 6px; font-size: 10px; display: inline-flex; align-items: center; gap: 2px; border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 4px; background: #059669; cursor: pointer; color: white;">
          <i class="fa-solid fa-check"></i> Xong
        </button>
      `;

      const assigneeUser = AppState.users.find(u => u.id === task.assigneeId);
      const assigneeName = assigneeUser ? assigneeUser.name : 'Chưa giao';

      div.innerHTML = `
        <div>
          <strong>${task.title}</strong>
          <div style="font-size: 11px; opacity:0.8; margin-top:3px;">${task.desc || 'Không có mô tả'}</div>
          <div style="font-size: 11px; color: var(--color-primary); margin-top:3px;"><i class="fa-solid fa-user-gear"></i> Phụ trách: <strong>${assigneeName}</strong></div>
        </div>
        <div style="display:flex; align-items:center; gap:8px;">
          ${completeButton}
          <span class="badge ${statusColors[task.status] || ''}" style="font-size:9.5px;">${statusLabels[task.status] || task.status}</span>
          <span style="font-size: 10.5px; color: var(--text-muted);"><i class="fa-solid fa-calendar-day"></i> ${task.deadline || 'Hạn: -'}</span>
        </div>
      `;
      div.onclick = (e) => {
        // Prevent event bubbling so it doesn't try to open the task details while modal switching
        e.stopPropagation();
        closeModal('modal-project-dedicated-view');
        if (typeof openOpsTaskDetail === 'function') openOpsTaskDetail(task.id);
      };
      tasksContainer.appendChild(div);
    });
  }

  // Render docs
  const docsContainer = document.getElementById('dedicated-project-docs-list');
  docsContainer.innerHTML = '';
  if (!p.documents || p.documents.length === 0) {
    docsContainer.innerHTML = `<span class="text-muted" style="font-size: 12px; font-style: italic; text-align: center; padding: 15px 0; width: 100%;">Chưa ghim tài liệu hoặc liên kết nào.</span>`;
  } else {
    p.documents.forEach((doc, idx) => {
      const div = document.createElement('div');
      div.className = 'mini-task-item';
      div.style.cssText = 'padding: 8px; border-bottom: 1px solid var(--border-color); font-size: 12px; display:flex; justify-content:space-between; align-items:center; background: rgba(255,255,255,0.02); border-radius: 4px; margin-bottom: 4px;';
      div.innerHTML = `
        <div>
          <i class="fa-solid fa-file-lines text-emerald" style="margin-right:6px;"></i><strong>${doc.name}</strong>
          ${doc.note ? `<span style="font-size:10.5px; opacity:0.8; margin-left:6px;">(${doc.note})</span>` : ''}
        </div>
        <div style="display:flex; gap:10px; align-items:center;">
          <a href="${doc.url}" target="_blank" style="font-size:11.5px; color:var(--color-primary); font-weight:bold; display:inline-flex; align-items:center; gap:4px; text-decoration:none;">
            <i class="fa-solid fa-square-share-nodes"></i> Mở link
          </a>
          <button class="btn btn-xs btn-link text-rose" onclick="handleDeleteDedicatedProjectDoc(${idx})" style="padding:0; border:none; background:none; font-size: 11px;"><i class="fa-solid fa-trash-can"></i> Xóa</button>
        </div>
      `;
      docsContainer.appendChild(div);
    });
  }

  // Render discussion
  renderDedicatedProjectDiscussion(p);

  openModal('modal-project-dedicated-view');
};

window.handleQuickCompleteTask = function(event, taskId) {
  event.stopPropagation();
  const task = AppState.single_tasks.find(t => t.id === taskId);
  if (task) {
    task.status = 'completed';
    if (task.assigneeId === AppState.currentUserId) {
      if (typeof window.updateStreakOnActivity === 'function') {
        window.updateStreakOnActivity(AppState.currentUserId);
      }
    }
    if (typeof window.awardPointsForCompletedTask === 'function') {
      window.awardPointsForCompletedTask(task);
    }
    saveState();
    showToast('Đã đánh dấu hoàn thành công việc!', 'success');
    openProjectDedicatedView(currentActiveProjectId);
  }
};

window.handleDeleteDedicatedProjectDoc = function(idx) {
  const p = AppState.projects.find(proj => proj.id === currentActiveProjectId);
  if (p && p.documents) {
    p.documents.splice(idx, 1);
    saveState();
    openProjectDedicatedView(currentActiveProjectId);
  }
};

function renderDedicatedProjectDiscussion(p) {
  const container = document.getElementById('dedicated-project-discussion');
  if (!container) return;
  container.innerHTML = '';
  
  if (!p.comments || p.comments.length === 0) {
    container.innerHTML = `<span class="text-muted" style="font-size: 11px; font-style: italic;">Chưa có trao đổi nào. Hãy bắt đầu cuộc hội thoại!</span>`;
  } else {
    p.comments.forEach(c => {
      const div = document.createElement('div');
      div.className = 'chat-msg-row';
      div.style.cssText = 'padding: 8px 12px; margin-bottom: 8px; font-size:11.5px;';
      div.innerHTML = `
        <div style="display:flex; justify-content:space-between; margin-bottom:2px;">
          <strong style="color:var(--color-primary);">${c.author}</strong>
          <span style="font-size:10px; color:var(--text-muted);">${c.time}</span>
        </div>
        <p style="margin:0; color:var(--text-secondary);">${c.text}</p>
      `;
      container.appendChild(div);
    });
    container.scrollTop = container.scrollHeight;
  }
}

// Bind dedicated project action buttons
document.addEventListener('DOMContentLoaded', () => {
  const btnAddTask = document.getElementById('btn-dedicated-project-add-task');
  if (btnAddTask) {
    btnAddTask.onclick = () => {
      closeModal('modal-project-dedicated-view');
      openGlobalAddOpsTaskModal(true);
      setTimeout(() => {
        const select = document.getElementById('ops-task-project');
        if (select) {
          select.value = currentActiveProjectId;
        }
      }, 150);
    };
  }

  const btnAddDoc = document.getElementById('btn-dedicated-project-add-doc');
  if (btnAddDoc) {
    btnAddDoc.onclick = () => {
      openModal('modal-project-add-doc');
    };
  }

  const formAddComment = document.getElementById('form-dedicated-project-add-comment');
  if (formAddComment) {
    formAddComment.onsubmit = (e) => {
      e.preventDefault();
      const input = document.getElementById('dedicated-project-comment-input');
      const text = input.value.trim();
      if (!text) return;
      
      const p = AppState.projects.find(proj => proj.id === currentActiveProjectId);
      if (p) {
        if (!p.comments) p.comments = [];
        const user = AppState.users.find(u => u.id === AppState.currentUserId) || { name: 'Nhân sự' };
        p.comments.push({
          author: user.name,
          text: text,
          time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
        });
        saveState();
        input.value = '';
        renderDedicatedProjectDiscussion(p);
      }
    };
  }

  // Edit project description event listeners binding
  const btnEditDesc = document.getElementById('btn-edit-project-desc');
  const btnSaveDesc = document.getElementById('btn-save-project-desc');
  const btnCancelDesc = document.getElementById('btn-cancel-project-desc');
  
  if (btnEditDesc) {
    btnEditDesc.onclick = () => {
      const p = AppState.projects.find(proj => proj.id === currentActiveProjectId);
      if (p) {
        document.getElementById('edit-project-desc-input').value = p.desc || '';
        document.getElementById('edit-project-notes-input').value = p.notes || '';
        document.getElementById('project-desc-view-mode').style.display = 'none';
        document.getElementById('project-desc-edit-mode').style.display = 'flex';
        btnEditDesc.style.display = 'none';
      }
    };
  }
  
  if (btnCancelDesc) {
    btnCancelDesc.onclick = () => {
      document.getElementById('project-desc-view-mode').style.display = 'block';
      document.getElementById('project-desc-edit-mode').style.display = 'none';
      if (btnEditDesc) btnEditDesc.style.display = '';
    };
  }
  
  if (btnSaveDesc) {
    btnSaveDesc.onclick = () => {
      const p = AppState.projects.find(proj => proj.id === currentActiveProjectId);
      if (p) {
        p.desc = document.getElementById('edit-project-desc-input').value.trim();
        p.notes = document.getElementById('edit-project-notes-input').value.trim();
        saveState();
        showToast('Đã lưu thông tin dự án!', 'success');
        
        // Refresh view
        openProjectDedicatedView(p.id);
      }
    };
  }
});

window.quickCompleteTask = function(taskId) {
  let task = AppState.single_tasks && AppState.single_tasks.find(t => t.id === taskId);
  if (!task && AppState.tasks) {
    task = AppState.tasks.find(t => t.id === taskId);
  }
  if (!task) return;
  
  task.status = 'completed';
  if (task.checklist) {
    task.checklist.forEach(item => item.done = true);
  }
  
  if (typeof window.awardPointsForCompletedTask === 'function') {
    window.awardPointsForCompletedTask(task);
  }
  
  saveState();
  
  if (typeof renderMyTasks === 'function') renderMyTasks();
  if (typeof renderOpsBoard === 'function') renderOpsBoard();
  
  showToast('Đã hoàn thành công việc!', 'success');
};

let currentSortField = null;
let currentSortAsc = true;

window.toggleTaskSort = function(field) {
  if (currentSortField === field) {
    currentSortAsc = !currentSortAsc;
  } else {
    currentSortField = field;
    currentSortAsc = true;
  }
  renderOpsSingleTasks();
  updateSortHeadersUI();
};

function updateSortHeadersUI() {
  const headers = document.querySelectorAll('.leaderboard-table th');
  if (headers.length < 7) return;
  const fields = ['title', 'dept', 'assignee', 'helper', 'priority', 'deadline', 'status'];
  fields.forEach((field, index) => {
    const icon = headers[index].querySelector('i');
    if (!icon) return;
    if (currentSortField === field) {
      icon.className = currentSortAsc ? 'fa-solid fa-sort-up' : 'fa-solid fa-sort-down';
      icon.style.opacity = '1';
      icon.style.color = '#fbbf24';
    } else {
      icon.className = 'fa-solid fa-sort';
      icon.style.opacity = '0.4';
      icon.style.color = '';
    }
  });
}



