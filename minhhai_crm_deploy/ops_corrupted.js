// ==================== MINH HAI LOGISTICS - OPERATION PORTAL ==================== //

document.addEventListener('DOMContentLoaded', () => {
  initOpsEvents();
  setupFounderDashboardTabs();
});

// Global state variables for operations drag and drop
window.showStatsModal = function(type) {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  
  let items = [];

  const getWorkflowStageName = (stage) => {
    const stepNames = [
      "Nháº­n thÃ´ng tin", "BÃ¡o giÃ¡", "ThÆ°Æ¡ng lÆ°á»£ng", "ThÃ nh cÃ´ng", "Mua hÃ ng",
      "Shop gá»­i hÃ ng", "Kho Trung Quá»‘c", "HÃ ng vá» VN", "Giao hÃ ng", "Thu ná»£", "HoÃ n thÃ nh", "Huá»·"
    ];
    return stepNames[stage - 1] || 'N/A';
  };

  if (AppState.shipment_workflows) {
    AppState.shipment_workflows.forEach(w => {
      const createdDate = new Date(w.createdTime || (w.history && w.history[0] ? w.history[0].substring(0, 10) : new Date()));
      const isThisMonth = createdDate.getFullYear() === currentYear && createdDate.getMonth() === currentMonth;
      
      const isChinhNgach = (w.serviceType && w.serviceType.toLowerCase() === 'chÃ­nh ngáº¡ch');

      const item = {
        type: 'workflow',
        id: w.id,
        code: w.trackingCode || w.code || w.id,
        name: w.clientName || 'N/A',
        service: w.serviceType || 'N/A',
        source: 'Váº­n hÃ nh',
        stage: getWorkflowStageName(w.stage),
        date: createdDate.toLocaleDateString('vi-VN'),
        val: (parseFloat(w.profit) || (parseFloat(w.revenue) - parseFloat(w.valTotal)) || 0).toLocaleString() + ' Ä‘'
      };

      if (isThisMonth) {
        if (type === 'ops_added') items.push(item);
        if (isChinhNgach && (type === 'cn_generated' || type === 'cn_profit')) {
          items.push(item);
        }
      }
      if (isChinhNgach && w.stage >= 4 && w.stage !== 12 && isThisMonth && type === 'cn_success') {
        items.push(item);
      }
    });
  }

  if (AppState.leads) {
    AppState.leads.forEach(l => {
      // Bá» qua lead Ä‘Ã£ thÃ nh cÃ´ng vÃ¬ nÃ³ Ä‘Ã£ Ä‘Æ°á»£c chuyá»ƒn sang Váº­n HÃ nh (shipment_workflows), trÃ¡nh Ä‘áº¿m trÃ¹ng
      if (l.stage === 'success') return; 

      if (l.note && (l.note.toLowerCase().includes('chÃ­nh ngáº¡ch') || /\bcn\b/i.test(l.note))) {
        const createdDate = new Date(l.createdTime || l.date);
        
        const item = {
          type: 'lead',
          id: l.id,
          code: l.phone || l.id,
          name: l.name || 'N/A',
          service: 'ChÃ­nh ngáº¡ch',
          source: 'CRM KhÃ¡ch má»›i',
          stage: l.stage === 'success' ? 'ThÃ nh cÃ´ng' : (l.stage === 'failed' ? 'Tháº¥t báº¡i' : 'Tiá»m nÄƒng'),
          date: createdDate.toLocaleDateString('vi-VN'),
          val: l.valTotal ? parseFloat(l.valTotal).toLocaleString() + ' Ä‘' : '-'
        };

        if (createdDate.getFullYear() === currentYear && createdDate.getMonth() === currentMonth) {
          if (type === 'cn_generated' || type === 'cn_profit') {
            items.push(item);
          }
        }
        // KhÃ´ng push vÃ o cn_success vÃ¬ l.stage === 'success' Ä‘Ã£ bá»‹ loáº¡i á»Ÿ trÃªn Ä‘á»ƒ trÃ¡nh Ä‘áº¿m trÃ¹ng
      }
    });
  }

  const tbody = document.getElementById('modal-stats-tbody');
  if (tbody) {
    if (items.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #888;">KhÃ´ng cÃ³ dá»¯ liá»‡u trong thÃ¡ng nÃ y</td></tr>`;
    } else {
      tbody.innerHTML = items.map(i => `
        <tr style="cursor:pointer;" onclick="openStatDetail('\${i.type}', '\${i.id}')">
          <td>\${i.code}</td>
          <td>\${i.name}</td>
          <td><span class="badge \${i.service && i.service.toLowerCase() === 'chÃ­nh ngáº¡ch' ? 'badge-blue' : 'badge-gold'}\">\${i.service}</span><br><span style="font-size: 0.8em; color: #888;">\${i.source}</span></td>
          <td>\${i.stage}</td>
          <td>\${i.date}</td>
          <td>\${i.val}</td>
        </tr>
      `).join('');
    }
  }

  const titles = {
    'cn_generated': 'Danh sÃ¡ch lÃ´ chÃ­nh ngáº¡ch phÃ¡t sinh',
    'cn_success': 'Danh sÃ¡ch lÃ´ chÃ­nh ngáº¡ch chá»‘t Ä‘Æ°á»£c',
    'cn_profit': 'Danh sÃ¡ch lÃ´ hÃ ng tÃ­nh lá»£i nhuáº­n',
    'ops_added': 'Danh sÃ¡ch lÃ´ hÃ ng váº­n hÃ nh má»›i'
  };
  const titleEl = document.getElementById('modal-stats-title');
  if (titleEl) titleEl.innerText = titles[type] || 'Chi tiáº¿t';

  const modal = document.getElementById('modal-stats-details');
  if (modal) {
    modal.classList.add('active');
  }
};

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

  // --- CRM KhÃ¡ch CÅ© & LÃ´ HÃ ng events ---
  const btnAddFlowModal = document.getElementById('btn-add-flow-modal');
  if (btnAddFlowModal) {
    btnAddFlowModal.onclick = () => {
      populateFlowUserDropdowns();
      populateFlowClientDropdown();
      initFlowAddModalTimes();
      openModal('modal-add-ops-flow');
    };
  }

  function initFlowAddModalTimes() {
    const formatDateTimeLocal = (date) => {
      const tzOffset = date.getTimezoneOffset() * 60000;
      return (new Date(date - tzOffset)).toISOString().slice(0, 16);
    };
    const now = new Date();
    const entryInput = document.getElementById('flow-info-entry-time');
    const msgTimeInput = document.getElementById('flow-customer-msg-time');
    if (entryInput) entryInput.value = formatDateTimeLocal(now);
    if (msgTimeInput) msgTimeInput.value = formatDateTimeLocal(new Date(now.getTime() - 30 * 60 * 1000)); // Default 30 mins ago
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
      const val = e.target.value;
      if (val === 'new') {
        newFields.style.display = 'block';
        extraFields.style.display = 'block';
        
        const now = new Date();
        const msgTimeInput = document.getElementById('flow-customer-msg-time');
        if (msgTimeInput) {
          const tzOffset = now.getTimezoneOffset() * 60000;
          msgTimeInput.value = (new Date(now - tzOffset - 30 * 60 * 1000)).toISOString().slice(0, 16);
        }
      } else {
        newFields.style.display = 'none';
        extraFields.style.display = 'none';
        
        if (val.startsWith('lead-')) {
          const leadId = val.replace('lead-', '');
          const lead = AppState.leads && AppState.leads.find(l => l.id === leadId);
          if (lead && lead.createdTime) {
            document.getElementById('flow-customer-msg-time').value = lead.createdTime.replace(' ', 'T');
          } else if (lead && lead.date) {
            document.getElementById('flow-customer-msg-time').value = `${lead.date}T12:00`;
          }
        } else {
          const now = new Date();
          const tzOffset = now.getTimezoneOffset() * 60000;
          document.getElementById('flow-customer-msg-time').value = (new Date(now - tzOffset)).toISOString().slice(0, 16);
        }
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

  // View mode toggling for Ops Workflows
  const btnOpsBoard = document.getElementById('btn-ops-view-board');
  const btnOpsList = document.getElementById('btn-ops-view-list');
  if (btnOpsBoard && btnOpsList) {
    btnOpsBoard.onclick = () => {
      AppState.opsViewMode = 'board';
      saveState();
      renderOpsWorkflows();
    };
    btnOpsList.onclick = () => {
      AppState.opsViewMode = 'list';
      saveState();
      renderOpsWorkflows();
    };
  }

  // Sortable headers in list view
  document.querySelectorAll('.ops-sortable-header').forEach(header => {
    header.addEventListener('click', () => {
      const field = header.getAttribute('data-field');
      if (AppState.opsSortField === field) {
        AppState.opsSortOrder = AppState.opsSortOrder === 'asc' ? 'desc' : 'asc';
      } else {
        AppState.opsSortField = field;
        AppState.opsSortOrder = 'asc';
      }
      saveState();
      renderOpsWorkflows();
    });
  });

  // Filter triggers
  const opsFlowSearch = document.getElementById('ops-flow-search');
  if (opsFlowSearch) {
    opsFlowSearch.oninput = renderOpsWorkflows;
  }
  const opsFlowFilterService = document.getElementById('ops-flow-filter-service');
  if (opsFlowFilterService) {
    opsFlowFilterService.onchange = renderOpsWorkflows;
  }
  const opsFlowFilterAssignee = document.getElementById('ops-flow-filter-assignee');
  if (opsFlowFilterAssignee) {
    opsFlowFilterAssignee.onchange = renderOpsWorkflows;
  }
  const opsFlowFilterOverdue = document.getElementById('ops-flow-filter-overdue');
  if (opsFlowFilterOverdue) {
    opsFlowFilterOverdue.onchange = renderOpsWorkflows;
  }

  // --- Single Tasks events ---
  const btnAddSingleTaskModal = document.getElementById('btn-add-single-task-modal');
  if (btnAddSingleTaskModal) {
    btnAddSingleTaskModal.onclick = () => {
      populateTaskUserDropdowns();
      populateTaskProjectAndClientDropdowns();
      
      const today = new Date();
      today.setDate(today.getDate() + 3);
      today.setHours(9, 0, 0, 0);
      document.getElementById('ops-task-deadline').value = window.formatDateTimeLocal(today);
      
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
      document.getElementById('ops-task-detail-desc-input').value = descText === 'KhÃ´ng cÃ³ mÃ´ táº£ chi tiáº¿t.' ? '' : descText;
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
        
        document.getElementById('ops-task-detail-desc').innerText = newVal || 'KhÃ´ng cÃ³ mÃ´ táº£ chi tiáº¿t.';
        document.getElementById('ops-task-detail-desc').style.display = 'block';
        if (btnEditDesc) btnEditDesc.style.display = 'inline-block';
        document.getElementById('ops-task-detail-edit-desc-group').style.display = 'none';
        
        renderOpsSingleTasks();
        
        // Also update CRM board if the task belongs to a CRM KhÃ¡ch Má»›i lead
        if (task.clientId && task.clientId.startsWith('lead-')) {
          const lead = AppState.leads && AppState.leads.find(l => l.id === task.clientId);
          if (lead) {
            if (task.title.includes('TÃ¬nh tráº¡ng KH sau bÃ¡o giÃ¡')) {
              const cleanFeedback = newVal.replace('TÃ¬nh tráº¡ng khÃ¡ch hÃ ng sau bÃ¡o giÃ¡: ', '').replace('TÃ¬nh tráº¡ng khÃ¡ch hÃ ng: ', '');
              lead.quoteFeedback = cleanFeedback;
              saveState();
              if (typeof renderCRMBoard === 'function') renderCRMBoard();
            }
          }
        }
        
        showToast('ÄÃ£ cáº­p nháº­t mÃ´ táº£ cÃ´ng viá»‡c!', 'success');
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
    today.setHours(9, 0, 0, 0);
    document.getElementById('ops-task-deadline').value = window.formatDateTimeLocal(today);
    
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
    <button class="dashboard-tab-btn active project-tab-btn" data-tab="crm" style="font-size: 15px;">CRM KhÃ¡ch Má»›i</button>
    <button class="dashboard-tab-btn project-tab-btn" data-tab="ops" style="font-size: 15px;">Váº­n HÃ nh & KhÃ¡ch CÅ© (Founder)</button>
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

  const activeSingleTasks = (AppState.single_tasks || []).filter(t => !(t.title && t.title.includes('TÃ¬nh tráº¡ng KH sau bÃ¡o giÃ¡')));
  const totalTasks = activeSingleTasks.length;
  const overdueTasks = activeSingleTasks.filter(t => t.status === 'overdue' || (t.status !== 'completed' && t.deadline && new Date(t.deadline) < new Date())).length;
  const completedTodayTasks = activeSingleTasks.filter(t => t.status === 'completed').length; // Simplification for today

  const billingPending = AppState.shipment_workflows.filter(w => w.stage === 2).length; // Step 2: BÃ¡o giÃ¡
  const waitingShop = AppState.shipment_workflows.filter(w => w.stage === 6).length; // Step 6: Shop gá»­i hÃ ng
  const arrivingCn = AppState.shipment_workflows.filter(w => w.stage === 7).length; // Step 7: Kho Trung Quá»‘c
  const waitingDebt = AppState.shipment_workflows.filter(w => w.stage === 10).length; // Step 10: Thu ná»£

  // ---------------- Compute ChÃ­nh Ngáº¡ch & Ops stats ---------------- //
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  let cnGenerated = 0;
  let cnSuccess = 0;
  let cnProfit = 0;
  let totalOpsAdded = 0;

  if (AppState.shipment_workflows) {
    AppState.shipment_workflows.forEach(w => {
      const createdDate = new Date(w.createdTime || (w.history && w.history[0] ? w.history[0].substring(0, 10) : new Date()));
      const isThisMonth = createdDate.getFullYear() === currentYear && createdDate.getMonth() === currentMonth;
      const isChinhNgach = (w.serviceType && w.serviceType.toLowerCase() === 'chÃ­nh ngáº¡ch');

      if (isThisMonth) {
        if (isChinhNgach) {
          cnGenerated++;
          cnProfit += (parseFloat(w.profit) || (parseFloat(w.revenue) - parseFloat(w.valTotal)) || 0);
        }
        totalOpsAdded++;
      }
      if (isChinhNgach && w.stage >= 4 && w.stage !== 12 && isThisMonth) {
        cnSuccess++;
      }
    });
  }

  if (AppState.leads) {
    AppState.leads.forEach(l => {
      // Bá» qua lead Ä‘Ã£ thÃ nh cÃ´ng vÃ¬ nÃ³ Ä‘Ã£ Ä‘Æ°á»£c chuyá»ƒn sang Váº­n HÃ nh (shipment_workflows)
      if (l.stage === 'success') return;

      if (l.note && (l.note.toLowerCase().includes('chÃ­nh ngáº¡ch') || /\bcn\b/i.test(l.note))) {
        const createdDate = new Date(l.createdTime || l.date);
        if (createdDate.getFullYear() === currentYear && createdDate.getMonth() === currentMonth) {
          cnGenerated++;
        }
      }
    });
  }
  // ----------------------------------------------------------------- //

  // Render KPI grid cards
  let html = `
    <div class="stats-grid" style="margin-top: 15px;">
      <div class="stat-card" style="cursor: pointer;" onclick="navigateToView('tasks-single'); const statusSel = document.getElementById('tasks-single-filter-status'); if (statusSel) { statusSel.value = 'all'; } if (typeof renderOpsSingleTasks === 'function') { renderOpsSingleTasks(); }">
        <div class="stat-icon bg-blue"><i class="fa-solid fa-list-check"></i></div>
        <div class="stat-data">
          <span class="stat-label">Tá»•ng task Ä‘ang má»Ÿ</span>
          <h3>${activeSingleTasks.filter(t => t.status !== 'completed').length}</h3>
          <span class="stat-trend trend-up">Tá»•ng sá»‘: ${totalTasks} viá»‡c</span>
        </div>
      </div>
      <div class="stat-card" style="cursor: pointer;" onclick="navigateToView('tasks-single'); const statusSel = document.getElementById('tasks-single-filter-status'); if (statusSel) { statusSel.value = 'all'; } if (typeof renderOpsSingleTasks === 'function') { renderOpsSingleTasks(); }">
        <div class="stat-icon bg-rose"><i class="fa-solid fa-circle-exclamation"></i></div>
        <div class="stat-data">
          <span class="stat-label">CÃ´ng viá»‡c quÃ¡ háº¡n</span>
          <h3 class="text-rose">${overdueTasks}</h3>
          <span class="stat-trend text-rose"><i class="fa-solid fa-clock"></i> Cáº§n xá»­ lÃ½ gáº¥p!</span>
        </div>
      </div>
      <div class="stat-card" style="cursor: pointer;" onclick="navigateToView('tasks-single'); const statusSel = document.getElementById('tasks-single-filter-status'); if (statusSel) { statusSel.value = 'completed'; } if (typeof renderOpsSingleTasks === 'function') { renderOpsSingleTasks(); }">
        <div class="stat-icon bg-emerald"><i class="fa-solid fa-circle-check"></i></div>
        <div class="stat-data">
          <span class="stat-label">Viá»‡c Ä‘Ã£ hoÃ n thÃ nh</span>
          <h3>${completedTodayTasks}</h3>
          <span class="stat-trend trend-up">Váº­n hÃ nh ná»™i bá»™</span>
        </div>
      </div>
      <div class="stat-card" style="cursor: pointer;" onclick="navigateToView('crm-clients-workflows');">
        <div class="stat-icon bg-gold"><i class="fa-solid fa-sack-dollar"></i></div>
        <div class="stat-data">
          <span class="stat-label">ÄÆ¡n chá» thu ná»£ (BÆ°á»›c 10)</span>
          <h3 class="text-gold">${waitingDebt}</h3>
          <span class="stat-trend text-gold"><i class="fa-solid fa-receipt"></i> Äá»‘i soÃ¡t káº¿ toÃ¡n</span>
        </div>
      </div>
    </div>

    <!-- Second row metrics -->
    <div class="dashboard-grid" style="margin-top: 24px;">
      <div class="dashboard-card">
        <div class="card-header"><h3>Thá»‘ng KÃª Tráº¡ng ThÃ¡i LÃ´ HÃ ng Váº­n HÃ nh</h3></div>
        <div class="card-body" style="display:flex; flex-direction:column; gap:10px;">
          <div style="display:flex; justify-content:space-between;"><span>LÃ´ hÃ ng Ä‘ang bÃ¡o giÃ¡ (BÆ°á»›c 2):</span><strong>${billingPending}</strong></div>
          <div style="display:flex; justify-content:space-between;"><span>Chá» shop Trung Quá»‘c phÃ¡t hÃ ng (BÆ°á»›c 6):</span><strong>${waitingShop}</strong></div>
          <div style="display:flex; justify-content:space-between;"><span>HÃ ng Ä‘ang táº¡i kho Trung Quá»‘c (BÆ°á»›c 7):</span><strong>${arrivingCn}</strong></div>
          <div style="display:flex; justify-content:space-between;"><span>Äang thu ná»£ khÃ¡ch hÃ ng (BÆ°á»›c 10):</span><strong>${waitingDebt}</strong></div>
        </div>
      </div>

      <div class="dashboard-card">
        <div class="card-header"><h3>PhÃ²ng Ban & NhÃ¢n Sá»± Cháº­m Viá»‡c</h3></div>
        <div class="card-body" style="padding:0;">
          <div class="leaderboard-table-wrapper" style="margin:0; border:none; border-radius:0;">
            <table class="leaderboard-table" style="min-width:100%;">
              <thead>
                <tr>
                  <th>NhÃ¢n sá»±</th>
                  <th class="text-center">Sá»‘ task quÃ¡ háº¡n</th>
                  <th>PhÃ²ng ban</th>
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
    html += `<tr><td colspan="3" class="text-center text-muted" style="padding:15px;">Tuyá»‡t vá»i! KhÃ´ng cÃ³ nhÃ¢n sá»± nÃ o bá»‹ trá»… viá»‡c.</td></tr>`;
  } else {
    sortedUsers.slice(0, 5).forEach(u => {
      const deptLabels = { sales: 'Sales/CSKH', sourcing: 'Sourcing', warehouse: 'Kho bÃ£i', admin: 'Káº¿ toÃ¡n/Admin' };
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

// ==================== CRM KHÃCH CÅ¨ & LÃ” HÃ€NG (12 BÆ¯á»šC) ==================== //
function renderOpsWorkflows() {
    if (typeof renderOpsStats === 'function') renderOpsStats();
  // Sanitize checklists: only allow 'cáº­p nháº­t tÃ¬nh tráº¡ng sau bÃ¡o giÃ¡' in Step 2, clear all others
  if (AppState.shipment_workflows) {
    AppState.shipment_workflows.forEach(flow => {
      if (flow.steps) {
        flow.steps.forEach(s => {
          if (s.stepNum === 2) {
            s.checklist = s.checklist ? s.checklist.filter(c => c.text === "cáº­p nháº­t tÃ¬nh tráº¡ng sau bÃ¡o giÃ¡") : [];
            if (s.checklist.length === 0) {
              s.checklist.push({ text: "cáº­p nháº­t tÃ¬nh tráº¡ng sau bÃ¡o giÃ¡", done: false, required: true });
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
    "Nháº­n thÃ´ng tin", "BÃ¡o giÃ¡", "ThÆ°Æ¡ng lÆ°á»£ng", "ThÃ nh cÃ´ng", "Mua hÃ ng",
    "Shop gá»­i hÃ ng", "Vá» kho TQ", "Vá» kho VN", "Giao hÃ ng", "Thu ná»£", "HoÃ n táº¥t", "Tháº¥t báº¡i"
  ];

  // 12 steps arrays
  const stepLists = Array.from({ length: 12 }, () => []);
  const filteredFlows = [];

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
    const isOverdue = flow.deadline && new Date(flow.deadline) < new Date() && flow.stage < 11 && flow.stage !== 12;
    if (overdueVal && !isOverdue) return;

    filteredFlows.push(flow);

    // Place into corresponding step array (flow.stage is 1-indexed)
    const idx = flow.stage - 1;
    if (idx >= 0 && idx < 12) {
      stepLists[idx].push(flow);
    }
  });

  const viewMode = AppState.opsViewMode || 'board';
  const btnBoard = document.getElementById('btn-ops-view-board');
  const btnList = document.getElementById('btn-ops-view-list');
  const kanbanWrapper = document.getElementById('ops-kanban-wrapper');
  const listWrapper = document.getElementById('ops-list-wrapper');

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
    const opsSortField = AppState.opsSortField || 'name';
    const opsSortOrder = AppState.opsSortOrder || 'asc';
    
    filteredFlows.sort((a, b) => {
      let valA = '';
      let valB = '';
      
      if (opsSortField === 'name') {
        valA = a.name || '';
        valB = b.name || '';
      } else if (opsSortField === 'client') {
        const clientA = AppState.clients.find(c => c.id === a.clientId) || {};
        const clientB = AppState.clients.find(c => c.id === b.clientId) || {};
        valA = clientA.name || '';
        valB = clientB.name || '';
      } else if (opsSortField === 'assignee') {
        const uA = AppState.users.find(u => u.id === a.assigneeId);
        const uB = AppState.users.find(u => u.id === b.assigneeId);
        valA = uA ? uA.name : '';
        valB = uB ? uB.name : '';
      } else if (opsSortField === 'stage') {
        valA = a.stage || 0;
        valB = b.stage || 0;
      } else if (opsSortField === 'sla') {
        // Evaluate SLA duration in minutes if it exists
        const getSlaMins = (f) => {
          if (f.customerMsgTime && f.infoEntryTime) {
            const diffMs = new Date(f.infoEntryTime) - new Date(f.customerMsgTime);
            return diffMs >= 0 ? Math.floor(diffMs / 60000) : 999999;
          }
          return 999999;
        };
        valA = getSlaMins(a);
        valB = getSlaMins(b);
      } else if (opsSortField === 'deadline') {
        valA = a.deadline || '9999-12-31';
        valB = b.deadline || '9999-12-31';
      }
      
      if (valA < valB) return opsSortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return opsSortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    // Update header sort icons
    document.querySelectorAll('.ops-sortable-header').forEach(header => {
      const field = header.getAttribute('data-field');
      const iconSpan = header.querySelector('.sort-icon');
      if (iconSpan) {
        if (field === opsSortField) {
          iconSpan.innerHTML = opsSortOrder === 'asc' ? ' â–²' : ' â–¼';
          iconSpan.style.opacity = '1';
        } else {
          iconSpan.innerHTML = ' â‡…';
          iconSpan.style.opacity = '0.3';
        }
      }
    });

    const listBody = document.getElementById('ops-list-table-body');
    if (listBody) {
      listBody.innerHTML = '';
      if (filteredFlows.length === 0) {
        listBody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 20px; color: var(--text-muted);">KhÃ´ng tÃ¬m tháº¥y lÃ´ hÃ ng nÃ o.</td></tr>`;
      } else {
        filteredFlows.forEach(flow => {
          const client = AppState.clients.find(c => c.id === flow.clientId) || {};
          const assigneeUser = AppState.users.find(u => u.id === flow.assigneeId);
          const assigneeName = assigneeUser ? assigneeUser.name : 'ChÆ°a giao';
          
          let slaBadge = '<span class="text-muted" style="font-size:11.5px; font-style:italic;">--</span>';
          if (flow.customerMsgTime && flow.infoEntryTime) {
            const diffMs = new Date(flow.infoEntryTime) - new Date(flow.customerMsgTime);
            if (diffMs >= 0) {
              const diffMins = Math.floor(diffMs / 60000);
              const hours = Math.floor(diffMins / 60);
              const mins = diffMins % 60;
              const timeText = hours > 0 ? `${hours}h${mins}m` : `${mins}m`;
              if (diffMins <= 120) {
                slaBadge = `<span class="badge" style="background:#10b981; color:white; padding:4px 8px; border-radius:4px; font-weight:bold; font-size:11px;"><i class="fa-solid fa-circle-check"></i> Äáº¡t (${timeText})</span>`;
              } else {
                slaBadge = `<span class="badge" style="background:#ef4444; color:white; padding:4px 8px; border-radius:4px; font-weight:bold; font-size:11px;"><i class="fa-solid fa-triangle-exclamation"></i> Muá»™n (${timeText})</span>`;
              }
            } else {
              slaBadge = `<span class="badge" style="background:#ef4444; color:white; padding:4px 8px; border-radius:4px; font-weight:bold; font-size:11px;"><i class="fa-solid fa-circle-xmark"></i> Lá»—i thá»i gian</span>`;
            }
          } else if (flow.stage === 1) {
            slaBadge = `<span class="badge" style="background:#f59e0b; color:white; padding:4px 8px; border-radius:4px; font-weight:bold; font-size:11px;">Chá» nháº­p thá»i gian</span>`;
          }
          
          const currentStepName = stepNames[flow.stage - 1] || 'KhÃ´ng rÃµ';
          const stepBadge = `<span class="badge" style="background:var(--color-primary); color:white; padding:4px 8px; border-radius:4px; font-weight:bold; font-size:11px;">BÆ°á»›c ${flow.stage}: ${currentStepName}</span>`;
          
          const isOverdue = flow.deadline && new Date(flow.deadline) < new Date() && flow.stage < 11;
          const deadlineBadge = isOverdue
            ? `<span class="badge" style="background:rgba(239, 68, 68, 0.15); color:#ef4444; padding:4px 8px; border-radius:4px; font-weight:bold; font-size:11px;"><i class="fa-solid fa-triangle-exclamation"></i> Trá»… háº¡n</span>`
            : `<span style="color:var(--text-secondary);">${flow.deadline || 'ChÆ°a Ä‘áº·t'}</span>`;
            
          const tr = document.createElement('tr');
          tr.style.borderBottom = '1px solid var(--border-color)';
          tr.style.cursor = 'pointer';
          tr.addEventListener('click', () => {
            openFlowDetailModal(flow.id);
          });
          
          tr.innerHTML = `
            <td style="padding: 12px 10px;">
              <div style="font-weight: bold; color: var(--color-primary);">${flow.name}</div>
              <div style="font-size: 11px; color: var(--text-muted); text-transform: uppercase;">Dá»‹ch vá»¥: ${flow.serviceType || 'ChÆ°a rÃµ'}</div>
              ${flow.failReason ? `<div style="font-size: 10px; color: #f87171; margin-top: 2px;"><i class="fa-solid fa-triangle-exclamation"></i> LÃ½ do há»ng: ${flow.failReason}</div>` : ''}
            </td>
            <td style="padding: 12px 10px;">
              <div style="font-weight: 600;">${client.name || 'VÃ´ danh'}</div>
              <div style="font-size: 11px; color: var(--text-muted);">MÃ£ KH: ${client.code || '--'}</div>
            </td>
            <td style="padding: 12px 10px; color: var(--text-secondary);">${assigneeName}</td>
            <td style="padding: 12px 10px;">${stepBadge}</td>
            <td style="padding: 12px 10px;">${slaBadge}</td>
            <td style="padding: 12px 10px;">${deadlineBadge}</td>
            <td style="padding: 12px 10px; text-align: center;" onclick="event.stopPropagation();">
              <button class="btn btn-sm btn-outline" onclick="openFlowDetailModal('${flow.id}')" style="padding: 4px 8px; font-size: 11px;"><i class="fa-solid fa-pen-to-square"></i> Chi tiáº¿t</button>
            </td>
          `;
          listBody.appendChild(tr);
        });
      }
    }
    return;
  }

  // Render 12 columns
  for (let i = 0; i < 12; i++) {
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

    cardsContainer.addEventListener('dragleave', (e) => {
      col.classList.remove('drag-over');
    });

    cardsContainer.addEventListener('drop', (e) => {
      e.preventDefault();
      col.classList.remove('drag-over');
      const flowId = e.dataTransfer.getData('text/plain') || draggingFlowId;
      const targetStage = i + 1;
      
      // Delay the move attempt slightly to allow 'dragend' event to fire properly.
      // Destroying the dragged DOM element synchronously during 'drop' causes browser D&D state to glitch/lag.
      setTimeout(() => {
        handleFlowMoveAttempt(flowId, targetStage);
      }, 50);
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
      const salesName = salesUser ? salesUser.name.split(' ').pop() : 'ChÆ°a giao';
      const assigneeUser = AppState.users.find(u => u.id === flow.assigneeId);
      const assigneeName = assigneeUser ? assigneeUser.name.split(' ').pop() : 'ChÆ°a giao';

      const overdueBadge = isOverdue ? `<div class="card-fail-reason" style="background:rgba(239,68,68,0.2); color:#ef4444;" title="QuÃ¡ háº¡n chÃ³t lÃ´ hÃ ng!"><i class="fa-solid fa-triangle-exclamation"></i> QuÃ¡ háº¡n</div>` : '';

      // Highlight if updated today
      const now = new Date();
      const todayStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
      const lastHistoryTime = flow.history && flow.history.length > 0 ? flow.history[flow.history.length - 1].split(': ')[0] : '';
      const isUpdatedToday = lastHistoryTime.startsWith(todayStr);
      const timeColor = isUpdatedToday ? '#34d399' : '#38bdf8';
      const timeFontWeight = isUpdatedToday ? '700' : '600';

      card.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:10px; font-weight:bold; color:var(--color-primary);">${client.name || 'VÃ´ danh'} - ${flow.name}</span>
          <span class="badge bg-blue" style="font-size:9px; padding:2px 4px; white-space: nowrap; margin-left: 4px;">${flow.serviceType}</span>
        </div>
        <div class="card-client-name" style="margin-top:6px; font-size:13.5px;">${flow.name}</div>
        <div class="card-desc" style="font-size:11.5px; opacity:0.8;">KhÃ¡ch: ${client.name || 'KhÃ´ng rÃµ'}</div>
        ${(() => {
          if (flow.customerMsgTime && flow.infoEntryTime) {
            const diffMs = new Date(flow.infoEntryTime) - new Date(flow.customerMsgTime);
            const diffMin = Math.round(diffMs / (1000 * 60));
            if (diffMin >= 0) {
              const hrs = Math.floor(diffMin / 60);
              const mins = diffMin % 60;
              const timeText = hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
              const isOk = diffMin <= 120;
              
              const currentUser = typeof getCurrentUser === 'function' ? getCurrentUser() : {};
              const isAdminOrManager = currentUser.role === 'admin' || currentUser.role === 'manager' || currentUser.username === 'phuongthao' || currentUser.username === 'nhuquynh';
              
              const color = isOk ? '#34d399' : '#ef4444';
              const icon = isOk ? 'fa-solid fa-circle-check' : 'fa-solid fa-triangle-exclamation';
              const labelText = isOk ? `Pháº£n há»“i Ä‘áº¡t: ${timeText}` : `Pháº£n há»“i trá»…: ${timeText} (>2h)`;
              
              const evidenceLink = flow.evidenceUrl ? `
                <a href="${flow.evidenceUrl}" target="_blank" style="color: #38bdf8; font-size: 9.5px; text-decoration: none; display: inline-flex; align-items: center; gap: 2px;" onclick="event.stopPropagation();">
                  <i class="fa-solid fa-image"></i> Báº±ng chá»©ng
                </a>
              ` : '';
              
              return `
                <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-top: 4px;">
                  <div style="font-size: 10px; color: ${color}; font-weight: bold; display: flex; align-items: center; gap: 4px;">
                    <i class="${icon}"></i> ${labelText}
                  </div>
                  <div style="display: flex; align-items: center; gap: 6px;">
                    ${evidenceLink}
                    <label style="display: inline-flex; align-items: center; gap: 3px; cursor: pointer; margin: 0; user-select: none;" onclick="event.stopPropagation();" ${!isAdminOrManager ? 'title="Chá»‰ Quáº£n lÃ½ má»›i cÃ³ quyá»n duyá»‡t"' : ''}>
                      <input type="checkbox" onchange="window.toggleManagerVerify('${flow.id}', this.checked)" ${flow.managerVerified ? 'checked' : ''} ${!isAdminOrManager ? 'disabled' : ''} style="cursor: pointer; width: 11px; height: 11px; margin: 0;">
                      <span style="font-size: 9.5px; color: ${flow.managerVerified ? '#34d399' : '#9ca3af'}; font-weight: bold;">Duyá»‡t</span>
                    </label>
                  </div>
                </div>
              `;
            }
          }
          return '';
        })() || ''}
        ${overdueBadge}
        <div style="font-size: 10.2px; color: ${isOverdue ? '#ef4444' : 'var(--text-muted)'}; font-weight: 500; display: flex; align-items: center; gap: 4px; margin-top: 4px;">
          <i class="fa-solid fa-calendar-xmark"></i> Háº¡n: ${flow.deadline || 'ChÆ°a thiáº¿t láº­p'}
        </div>
        ${flow.failReason ? `
          <div style="margin-top: 6px; padding: 4px 6px; background: rgba(239, 68, 68, 0.12); border: 1px dashed rgba(239, 68, 68, 0.25); border-radius: 4px; font-size: 10.5px; color: #f87171; line-height: 1.3;">
            <i class="fa-solid fa-triangle-exclamation"></i> <strong>LÃ½ do há»ng:</strong> ${flow.failReason}
          </div>
        ` : ''}
        <div class="card-meta" style="margin-top:8px; border-top:1px solid var(--border-color); padding-top:6px; display:flex; justify-content:space-between; align-items:center;">
          <div style="display:flex; flex-direction:column; gap:2px; font-size:10px; color:var(--text-muted);">
            <span><i class="fa-solid fa-user-gear"></i> Phá»¥ trÃ¡ch: ${assigneeName}</span>
            <span><i class="fa-solid fa-headset"></i> CSKH: ${salesName}</span>
          </div>
          <strong style="font-size:11px; color:#34d399;">${flow.valTotal > 0 ? formatVnd(flow.valTotal) : '0Ä‘'}</strong>
        </div>
        <div style="font-size: 10px; color: ${timeColor}; font-weight: ${timeFontWeight}; display: flex; align-items: center; gap: 4px; margin-top: 6px; padding-top: 4px; border-top: 1px dashed rgba(255,255,255,0.05); justify-content: flex-end;">
          <i class="fa-solid fa-rotate"></i> Cáº­p nháº­t: ${lastHistoryTime}
        </div>
        <div style="display: flex; justify-content: flex-end; align-items: center; margin-top: 6px; padding-top: 6px; border-top: 1px solid rgba(255,255,255,0.05); gap: 6px;">
          <span style="font-size: 10px; color: var(--text-muted);"><i class="fa-solid fa-right-left"></i> Chuyá»ƒn:</span>
          <select class="card-stage-select" style="font-size: 10px; padding: 2px 4px; background: #1f2937; color: #e5e7eb; border: 1px solid #4b5563; border-radius: 4px; cursor: pointer;" onclick="event.stopPropagation();">
            <option value="" disabled selected>Chá»n...</option>
            <option value="1" ${flow.stage === 1 ? 'disabled' : ''}>1. Nháº­n thÃ´ng tin</option>
            <option value="2" ${flow.stage === 2 ? 'disabled' : ''}>2. BÃ¡o giÃ¡</option>
            <option value="3" ${flow.stage === 3 ? 'disabled' : ''}>3. ThÆ°Æ¡ng lÆ°á»£ng</option>
            <option value="4" ${flow.stage === 4 ? 'disabled' : ''}>4. ThÃ nh cÃ´ng</option>
            <option value="5" ${flow.stage === 5 ? 'disabled' : ''}>5. Mua hÃ ng</option>
            <option value="6" ${flow.stage === 6 ? 'disabled' : ''}>6. Shop gá»­i</option>
            <option value="7" ${flow.stage === 7 ? 'disabled' : ''}>7. Vá» TQ</option>
            <option value="8" ${flow.stage === 8 ? 'disabled' : ''}>8. Vá» VN</option>
            <option value="9" ${flow.stage === 9 ? 'disabled' : ''}>9. Giao hÃ ng</option>
            <option value="10" ${flow.stage === 10 ? 'disabled' : ''}>10. Thu ná»£</option>
            <option value="11" ${flow.stage === 11 ? 'disabled' : ''}>11. HoÃ n táº¥t</option>
            <option value="12" ${flow.stage === 12 ? 'disabled' : ''}>12. Tháº¥t báº¡i</option>
          </select>
        </div>
      `;

      card.addEventListener('dragstart', (e) => {
        draggingFlowId = flow.id;
        e.dataTransfer.setData('text/plain', flow.id);
        e.dataTransfer.effectAllowed = 'move';
        card.classList.add('dragging');
        document.getElementById('ops-kanban-board')?.classList.add('board-dragging');
      });

      card.addEventListener('dragend', () => {
        card.classList.remove('dragging');
        draggingFlowId = null;
        document.getElementById('ops-kanban-board')?.classList.remove('board-dragging');
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
            // Revert dropdown visual value IMMEDIATELY so if validation fails, it stays correct
            e.target.value = flow.stage;
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

function ensureTwelveSteps(flow) {
  if (!flow) return;
  if (!flow.steps) flow.steps = [];
  if (flow.steps.length < 12) {
    const defaultStepNames = [
      "Nháº­n thÃ´ng tin", "BÃ¡o giÃ¡", "ThÆ°Æ¡ng lÆ°á»£ng", "ThÃ nh cÃ´ng", "Mua hÃ ng",
      "Shop gá»­i hÃ ng", "Vá» kho TQ", "Vá» kho VN", "Giao hÃ ng", "Thu ná»£", "HoÃ n táº¥t", "Tháº¥t báº¡i"
    ];
    for (let i = flow.steps.length + 1; i <= 12; i++) {
      flow.steps.push({
        stepNum: i,
        name: defaultStepNames[i - 1],
        assigneeId: flow.assigneeId || 'usr-admin',
        deadline: '',
        status: 'todo',
        checklist: [],
        note: '',
        comments: []
      });
    }
  }
}

function handleFlowMoveAttempt(flowId, targetStage) {
  const flow = AppState.shipment_workflows.find(f => f.id === flowId);
  if (!flow) return;
  ensureTwelveSteps(flow);

  const currentStage = flow.stage;
  if (currentStage === targetStage) return;

  // Validate files when transitioning to BÃ¡o giÃ¡ (Step 2)
  if (targetStage === 2) {
    const files = flow.files || [];
    const hasImage = files.some(f => 
      /\.(jpg|jpeg|png|webp|gif|bmp)$/i.test(f.url) || 
      f.name.toLowerCase().includes('áº£nh') || 
      f.name.toLowerCase().includes('hÃ¬nh') ||
      f.name.toLowerCase().includes('image') ||
      f.name.toLowerCase().includes('img')
    );
    if (!hasImage) {
      alert("Äá»ƒ chuyá»ƒn sang bÆ°á»›c BÃ¡o giÃ¡, báº¡n báº¯t buá»™c pháº£i chÃ¨n HÃ¬nh áº£nh bÃ¡o giÃ¡ vÃ o má»¥c tÃ i liá»‡u Ä‘Ã­nh kÃ¨m!");
      return;
    }
  }
  // Validate quote feedback when transitioning from BÃ¡o giÃ¡ (Step 2) to Step 3 (ThÆ°Æ¡ng lÆ°á»£ng) or higher
  if (currentStage === 2 && targetStage >= 3) {
    const feedback = (flow.quoteFeedback || '').trim();
    if (feedback.length < 3) {
      alert("Báº¡n báº¯t buá»™c pháº£i nháº­p rÃµ TÃ¬nh tráº¡ng khÃ¡ch hÃ ng sau bÃ¡o giÃ¡ vÃ o Ã´ nháº­p liá»‡u á»Ÿ BÆ°á»›c 2!");
      return;
    }
  }
  // If moving to Tháº¥t báº¡i (stage 12), require fail reason + evidence
  if (targetStage === 12) {
    const currentUser = typeof getCurrentUser === 'function' ? getCurrentUser() : {};
    const isAdminOrManager = currentUser && (currentUser.role === 'admin' || currentUser.role === 'manager');
    if (!isAdminOrManager) {
      showToast("Chá»‰ tÃ i khoáº£n Admin hoáº·c Quáº£n lÃ½ má»›i cÃ³ quyá»n chuyá»ƒn sang Tháº¥t báº¡i! CSKH chá»‰ Ä‘Æ°á»£c phÃ©p chuyá»ƒn sang cá»™t ThÆ°Æ¡ng lÆ°á»£ng.", "warning");
      
      // Automatically redirect to Step 3: ThÆ°Æ¡ng lÆ°á»£ng instead of Step 12: Tháº¥t báº¡i
      executeFlowMove(flow, 3);
      flow.failReason = null;
      flow.failEvidence = null;
      flow.failApproved = null;
      
      saveState();
      renderOpsWorkflows();
      return;
    }

    document.getElementById('fail-prompt-client-name').innerText = flow.name;
    document.getElementById('prompt-fail-reason').value = '';
    document.getElementById('prompt-fail-reason-other').value = '';
    document.getElementById('prompt-fail-reason-other').style.display = 'none';
    document.getElementById('prompt-fail-evidence').value = '';
    
    openModal('modal-fail-reason-prompt');
    
    failPromptCallback = (reason, evidence) => {
      const allowedFailReasons = [
        "KhÃ´ng Ä‘á»§ nÄƒng lá»±c xá»­ lÃ½ hÃ ng",
        "HÃ ng khÃ³ tá»« chá»‘i",
        "KhÃ¡ch láº», hÃ ng khÃ³ => chá»§ Ä‘á»™ng tá»« chá»‘i",
        "KhÃ´ng tÃ¬m Ä‘Æ°á»£c hÃ ng cho KH"
      ];
      
      const isNegotiationReason = !allowedFailReasons.includes(reason);
      
      if (isNegotiationReason) {
        showToast("LÃ½ do nÃ y thuá»™c khÃ¢u ThÆ°Æ¡ng lÆ°á»£ng! Há»‡ thá»‘ng Ä‘Ã£ chuyá»ƒn lÃ´ hÃ ng sang cá»™t ThÆ°Æ¡ng lÆ°á»£ng.", "info");
        executeFlowMove(flow, 3);
        flow.failReason = null;
        flow.failEvidence = null;
        flow.failApproved = null;
        saveState();
        renderOpsWorkflows();
        return;
      }

      flow.failReason = reason;
      flow.failEvidence = evidence;
      flow.failApproved = false;
      executeFlowMove(flow, 12);
      saveState();
      renderOpsWorkflows();
      addNotification('LÃ´ hÃ ng tháº¥t báº¡i', `LÃ´ hÃ ng ${flow.name} Ä‘Ã£ chuyá»ƒn sang Tháº¥t báº¡i: ${reason}`, 'warning');
    };
    return;
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
          if (item.text === "cáº­p nháº­t tÃ¬nh tráº¡ng sau bÃ¡o giÃ¡" && e.target.checked) {
            const feedback = (flow.quoteFeedback || '').trim();
            if (feedback.length < 3) {
              alert("Báº¡n báº¯t buá»™c pháº£i nháº­p rÃµ TÃ¬nh tráº¡ng khÃ¡ch hÃ ng sau bÃ¡o giÃ¡ vÃ o Ã´ nháº­p liá»‡u á»Ÿ BÆ°á»›c 2!");
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
  ensureTwelveSteps(flow);
  const stepNames = [
    "Nháº­n thÃ´ng tin", "BÃ¡o giÃ¡", "ThÆ°Æ¡ng lÆ°á»£ng", "ThÃ nh cÃ´ng", "Mua hÃ ng",
    "Shop gá»­i hÃ ng", "Vá» kho TQ", "Vá» kho VN", "Giao hÃ ng", "Thu ná»£", "HoÃ n táº¥t", "Tháº¥t báº¡i"
  ];
  const oldStage = flow.stage;
  flow.stage = targetStage;
  
  // Set stage statuses
  flow.steps.forEach(s => {
    if (s.stepNum < targetStage) s.status = 'done';
    else if (s.stepNum === targetStage) s.status = 'doing';
    else s.status = 'todo';
  });

  // When moving to Tháº¥t báº¡i, set failApproved = false
  if (targetStage === 12) {
    flow.failApproved = false;
  }
  // When moving away from Tháº¥t báº¡i, clear fail fields
  if (oldStage === 12 && targetStage !== 12) {
    flow.failReason = null;
    flow.failEvidence = null;
    flow.failApproved = false;
  }

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

  flow.history.push(`${dateStr}: Di chuyá»ƒn tá»« bÆ°á»›c ${oldStage} sang ${targetStage} (${stepNames[targetStage - 1]})`);

  saveState();
  renderOpsWorkflows();
  addNotification('Cáº­p nháº­t LÃ´ HÃ ng ðŸšš', `ÄÃ£ chuyá»ƒn lÃ´ hÃ ng "${flow.name}" sang bÆ°á»›c: ${stepNames[targetStage - 1]}`, 'success');
}

// Open detail modal for 12 steps workflow
let currentActiveFlowId = null;
let currentActiveStepNum = 1;

function openFlowDetailModal(flowId) {
  const flow = AppState.shipment_workflows.find(f => f.id === flowId);
  if (!flow) return;
  ensureTwelveSteps(flow);

  currentActiveFlowId = flowId;
  currentActiveStepNum = flow.stage; // Set default view to current active step

  document.getElementById('flow-detail-title').innerText = flow.name;
  const client = AppState.clients.find(c => c.id === flow.clientId) || {};
  document.getElementById('flow-detail-subtitle').innerText = `${flow.serviceType.toUpperCase()} - KhÃ¡ch: ${client.name || 'KhÃ´ng rÃµ'} (${client.code || 'KH CÅ¨'})`;

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

  // Render 12 steps timeline bubbles
  const timeline = document.querySelector('.flow-steps-timeline');
  timeline.innerHTML = '';
  
  const stepNames = [
    "Nháº­n thÃ´ng tin", "BÃ¡o giÃ¡", "ThÆ°Æ¡ng lÆ°á»£ng", "ThÃ nh cÃ´ng", "Mua hÃ ng",
    "Shop gá»­i hÃ ng", "Vá» kho TQ", "Vá» kho VN", "Giao hÃ ng", "Thu ná»£", "HoÃ n táº¥t", "Tháº¥t báº¡i"
  ];

  for (let i = 1; i <= 12; i++) {
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
    if (confirm(`Báº¡n cháº¯c cháº¯n muá»‘n xÃ³a lÃ´ hÃ ng "${flow.name}"?`)) {
      AppState.shipment_workflows = AppState.shipment_workflows.filter(f => f.id !== flowId);
      saveState();
      closeModal('modal-flow-detail');
      renderOpsWorkflows();
      addNotification('XÃ³a LÃ´ HÃ ng', `ÄÃ£ xÃ³a lÃ´ hÃ ng thÃ nh cÃ´ng.`, 'warning');
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
    "Nháº­n thÃ´ng tin", "BÃ¡o giÃ¡", "ThÆ°Æ¡ng lÆ°á»£ng", "ThÃ nh cÃ´ng", "Mua hÃ ng",
    "Shop gá»­i hÃ ng", "Vá» kho TQ", "Vá» kho VN", "Giao hÃ ng", "Thu ná»£", "HoÃ n táº¥t", "Tháº¥t báº¡i"
  ];

  document.getElementById('flow-step-panel-title').innerText = `BÆ°á»›c ${currentActiveStepNum}: ${stepNames[currentActiveStepNum - 1] || 'Tháº¥t báº¡i'}`;

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
  const noteEl = document.getElementById('flow-step-note');
  noteEl.value = stepData.note || '';
  noteEl.onchange = autoSaveActiveStepData;

  assigneeSelect.onchange = autoSaveActiveStepData;
  const deadlineEl = document.getElementById('flow-step-deadline');
  if (deadlineEl) deadlineEl.onchange = autoSaveActiveStepData;

  // ===== ALWAYS SHOW: Audit time section (Step 1 data) =====
  const auditGroup = document.getElementById('flow-step-time-audit-group');
  if (auditGroup) {
    auditGroup.style.display = 'block';
    const msgTimeInput = document.getElementById('flow-step-customer-msg-time');
    const entryTimeInput = document.getElementById('flow-step-info-entry-time');
    const auditResult = document.getElementById('flow-step-time-audit-result');
    
    msgTimeInput.value = flow.customerMsgTime || '';
    entryTimeInput.value = flow.infoEntryTime || '';
    
    const updateAuditMessage = () => {
      const msgTime = msgTimeInput.value;
      const entryTime = entryTimeInput.value;
      if (msgTime && entryTime) {
        const diffMs = new Date(entryTime) - new Date(msgTime);
        const diffMin = Math.round(diffMs / (1000 * 60));
        if (diffMin >= 0) {
          const hrs = Math.floor(diffMin / 60);
          const mins = diffMin % 60;
          const timeText = hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
          const isOk = diffMin <= 120;
          if (isOk) {
            auditResult.innerHTML = `<span style="font-size:12px; color:#34d399; font-weight:bold;"><i class="fa-solid fa-circle-check"></i> Äáº¡t: pháº£n há»“i trong ${timeText} (dÆ°á»›i 2 tiáº¿ng)</span>`;
          } else {
            auditResult.innerHTML = `<span style="font-size:12px; color:#ef4444; font-weight:bold;"><i class="fa-solid fa-triangle-exclamation"></i> KhÃ´ng Äáº¡t: pháº£n há»“i trong ${timeText} (vÆ°á»£t quÃ¡ 2 tiáº¿ng)</span>`;
          }
        } else {
          auditResult.innerHTML = `<span style="font-size:12px; color:#ef4444; font-weight:bold;"><i class="fa-solid fa-circle-xmark"></i> Lá»—i: Thá»i gian nháº­p nhá» hÆ¡n thá»i gian khÃ¡ch nháº¯n!</span>`;
        }
      } else {
        auditResult.innerHTML = `<span class="text-muted" style="font-size:12px; font-style:italic;">Nháº­p Ä‘áº§y Ä‘á»§ thÃ´ng tin thá»i gian Ä‘á»ƒ kiá»ƒm tra.</span>`;
      }
    };
    
    const currentUser = typeof getCurrentUser === 'function' ? getCurrentUser() : {};
    const isAdminOrManager = currentUser.role === 'admin' || currentUser.role === 'manager' || currentUser.username === 'phuongthao' || currentUser.username === 'nhuquynh';
    const verifyChk = document.getElementById('flow-step-manager-verify');
    if (verifyChk) {
      verifyChk.checked = !!flow.managerVerified;
      verifyChk.disabled = !isAdminOrManager;
      if (!isAdminOrManager) {
        verifyChk.parentElement.setAttribute('title', 'Chá»‰ Quáº£n lÃ½ má»›i cÃ³ quyá»n duyá»‡t');
      } else {
        verifyChk.parentElement.removeAttribute('title');
      }
    }

    const evidenceUrlInput = document.getElementById('flow-step-evidence-url');
    if (evidenceUrlInput) {
      evidenceUrlInput.value = flow.evidenceUrl || '';
    }

    updateAuditMessage();
    msgTimeInput.oninput = updateAuditMessage;
    entryTimeInput.oninput = updateAuditMessage;
    
    msgTimeInput.onchange = autoSaveActiveStepData;
    entryTimeInput.onchange = autoSaveActiveStepData;
    
    if (verifyChk) {
      verifyChk.onchange = autoSaveActiveStepData;
    }
    if (evidenceUrlInput) {
      evidenceUrlInput.onchange = autoSaveActiveStepData;
    }
  }

  // ===== ALWAYS SHOW: Quote feedback section (Step 2 data) =====
  const quoteFeedbackGroup = document.getElementById('flow-step-quote-feedback-group');
  if (quoteFeedbackGroup) {
    quoteFeedbackGroup.style.display = 'block';
    const quoteTextarea = document.getElementById('flow-step-quote-feedback');
    if (quoteTextarea) {
      quoteTextarea.value = flow.quoteFeedback || '';
      quoteTextarea.oninput = (e) => {
        const val = e.target.value;
        flow.quoteFeedback = val;
        const step2 = flow.steps.find(s => s.stepNum === 2);
        if (step2) {
          const item = step2.checklist.find(c => c.text === "cáº­p nháº­t tÃ¬nh tráº¡ng sau bÃ¡o giÃ¡");
          if (item) {
            item.done = val.trim().length >= 3;
          }
        }
      };
      quoteTextarea.onchange = () => {
        saveState();
      };
    }
  }

  // ===== Fail group (only show for step 12) =====
  const flowFailGroup = document.getElementById('flow-step-fail-group');
  if (flowFailGroup) {
    if (flow.stage === 12) {
      flowFailGroup.style.display = 'block';
      const reasonSelect = document.getElementById('flow-step-fail-reason');
      const reasonOtherGroup = document.getElementById('flow-step-fail-reason-other-group');
      const reasonOtherInput = document.getElementById('flow-step-fail-reason-other');
      const evidenceInput = document.getElementById('flow-step-fail-evidence');
      const approvedCheckbox = document.getElementById('flow-step-fail-approved');
      
      const storedReason = flow.failReason || '';
      const stdReasons = [
        'GiÃ¡ dá»‹ch vá»¥ cao',
        'Thá»i gian váº­n chuyá»ƒn lÃ¢u',
        'KhÃ´ng cáº¡nh tranh Ä‘Æ°á»£c vá»›i Ä‘áº¡i lÃ½ VN',
        'Tráº£ lá»i cháº­m',
        'HÃ ng khÃ³ tá»« chá»‘i',
        'KhÃ´ng Ä‘á»§ nÄƒng lá»±c xá»­ lÃ½ hÃ ng',
        'KhÃ´ng cáº¡nh tranh Ä‘Æ°á»£c giÃ¡ dá»‹ch vá»¥ vá»›i Ä‘á»‘i thá»§',
        'KhÃ´ng tÃ¬m Ä‘Æ°á»£c hÃ ng cho KH',
        'KhÃ¡ch láº», hÃ ng khÃ³ => chá»§ Ä‘á»™ng tá»« chá»‘i',
        'KhÃ¡ch hÃ ng ko quan tÃ¢m',
        'Do AI tÆ° váº¥n chÆ°a tá»‘t'
      ];
      
      if (storedReason && !stdReasons.includes(storedReason)) {
        reasonSelect.value = 'KhÃ¡c';
        reasonOtherGroup.style.display = 'block';
        reasonOtherInput.value = storedReason;
      } else {
        reasonSelect.value = storedReason;
        reasonOtherGroup.style.display = 'none';
        reasonOtherInput.value = '';
      }

      reasonSelect.onchange = (e) => {
        if (e.target.value === 'KhÃ¡c') {
          reasonOtherGroup.style.display = 'block';
        } else {
          reasonOtherGroup.style.display = 'none';
          reasonOtherInput.value = '';
        }
      };

      evidenceInput.value = flow.failEvidence || '';
      approvedCheckbox.checked = !!flow.failApproved;
      
      const currentUser2 = typeof getCurrentUser === 'function' ? getCurrentUser() : {};
      const isAdminOrManager2 = currentUser2.role === 'admin' || currentUser2.role === 'manager' || currentUser2.username === 'phuongthao' || currentUser2.username === 'nhuquynh';
      approvedCheckbox.disabled = !isAdminOrManager2;
      
      reasonSelect.addEventListener('change', autoSaveActiveStepData);
      reasonOtherInput.onchange = autoSaveActiveStepData;
      evidenceInput.onchange = autoSaveActiveStepData;
      approvedCheckbox.onchange = autoSaveActiveStepData;
    } else {
      flowFailGroup.style.display = 'none';
    }
  }

  // Checklist render
  const chkContainer = document.getElementById('flow-step-checklist-container');
  chkContainer.innerHTML = '';
  if (stepData.checklist && stepData.checklist.length > 0) {
    stepData.checklist.forEach((item, idx) => {
      if (item.text === "cáº­p nháº­t tÃ¬nh tráº¡ng sau bÃ¡o giÃ¡") return;
      
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

  // Handle empty state
  if (chkContainer.innerHTML === '') {
    chkContainer.innerHTML = `<span class="text-muted" style="font-size:12px; font-style:italic;">KhÃ´ng cÃ³ checklist.</span>`;
  }

  // Render step files
  const filesContainer = document.getElementById('flow-step-files-list');
  filesContainer.innerHTML = '';
  
  const stepFiles = flow.files || [];
  if (stepFiles.length > 0) {
    stepFiles.forEach((file, idx) => {
      const row = document.createElement('div');
      row.style.cssText = 'display:flex; flex-direction:column; gap:4px; font-size:12px; background:#111827; padding:6px 8px; border-radius:4px; margin-bottom:4px;';
      
      const nameLower = file.name.toLowerCase();
      const isImage = /\.(png|jpe?g|webp|gif)($|\?)/i.test(file.url) || 
                      file.url.toLowerCase().includes('drive.google.com') || 
                      file.url.toLowerCase().includes('googleusercontent.com') ||
                      nameLower.includes('áº£nh') || 
                      nameLower.includes('anh') || 
                      nameLower.includes('image') || 
                      nameLower.includes('png') || 
                      nameLower.includes('jpg') || 
                      nameLower.includes('jpeg');

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

      const imgPreview = isImage ? `<img src="${displayUrl}" onerror="this.style.display='none';" style="max-width:100%; max-height:100px; border-radius:4px; margin-top:4px; display:block; border:1px solid var(--border-color);" alt="áº£nh hÃ ng hÃ³a" />` : '';

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
    filesContainer.innerHTML = `<span class="text-muted" style="font-size:12px; font-style:italic;">ChÆ°a cÃ³ tÃ i liá»‡u nÃ o.</span>`;
  }

  // Render comments
  renderActiveStepComments();
}

function autoSaveActiveStepData() {
  const flow = AppState.shipment_workflows.find(f => f.id === currentActiveFlowId);
  if (!flow) return;

  const stepData = flow.steps.find(s => s.stepNum === currentActiveStepNum);
  if (!stepData) return;

  stepData.assigneeId = document.getElementById('flow-step-assignee').value;
  stepData.deadline = document.getElementById('flow-step-deadline').value;
  stepData.note = document.getElementById('flow-step-note').value.trim();

  // Always save audit times (Step 1 data - now always visible)
  flow.customerMsgTime = document.getElementById('flow-step-customer-msg-time').value;
  flow.infoEntryTime = document.getElementById('flow-step-info-entry-time').value;
  const evidenceUrlInput = document.getElementById('flow-step-evidence-url');
  if (evidenceUrlInput) {
    flow.evidenceUrl = evidenceUrlInput.value.trim();
  }
  const verifyChk = document.getElementById('flow-step-manager-verify');
  if (verifyChk) {
    const currentUser = typeof getCurrentUser === 'function' ? getCurrentUser() : {};
    const isAdminOrManager = currentUser.role === 'admin' || currentUser.role === 'manager' || currentUser.username === 'phuongthao' || currentUser.username === 'nhuquynh';
    if (isAdminOrManager) {
      flow.managerVerified = verifyChk.checked;
    }
  }

  // Always save quote feedback (Step 2 data - now always visible)
  const quoteFeedbackEl = document.getElementById('flow-step-quote-feedback');
  if (quoteFeedbackEl) {
    flow.quoteFeedback = quoteFeedbackEl.value;
    const step2 = flow.steps.find(s => s.stepNum === 2);
    if (step2) {
      const item = step2.checklist.find(c => c.text === "cáº­p nháº­t tÃ¬nh tráº¡ng sau bÃ¡o giÃ¡");
      if (item) {
        item.done = quoteFeedbackEl.value.trim().length >= 3;
      }
    }
  }

  // Save fail reason, evidence and manager approval if flow is at step 12 (Tháº¥t báº¡i)
  if (flow.stage === 12) {
    const reasonSelect = document.getElementById('flow-step-fail-reason');
    const reasonVal = reasonSelect.value;
    
    let finalReason = reasonVal;
    if (reasonVal === 'KhÃ¡c') {
      finalReason = document.getElementById('flow-step-fail-reason-other').value.trim();
    }
    
    flow.failReason = finalReason;
    flow.failEvidence = document.getElementById('flow-step-fail-evidence').value.trim();
    flow.evidenceUrl = flow.failEvidence;

    const currentUser2 = typeof getCurrentUser === 'function' ? getCurrentUser() : {};
    const isAdminOrManager2 = currentUser2.role === 'admin' || currentUser2.role === 'manager' || currentUser2.username === 'phuongthao' || currentUser2.username === 'nhuquynh';
    if (isAdminOrManager2) {
      flow.failApproved = document.getElementById('flow-step-fail-approved').checked;
    }
  }

  // If status is not complete, we can keep it as is, or set to completed if all checklists are ticked!
  const hasPending = stepData.checklist.some(c => !c.done);
  if (!hasPending && stepData.status !== 'done') {
    stepData.status = 'done';
  } else if (hasPending && stepData.status === 'done') {
    stepData.status = 'doing';
  }

  saveState();
}

function handleSaveActiveStepData() {
  // Check for pending comment
  const commentInput = document.getElementById('flow-step-new-comment');
  if (commentInput && commentInput.value.trim()) {
    handleFlowAddStepComment();
  }

  // Check for pending checklist item
  const chkInput = document.getElementById('flow-step-new-chk');
  if (chkInput && chkInput.value.trim()) {
    handleFlowAddStepChecklistItem();
  }

  // Check for pending file link
  const fileUrlInput = document.getElementById('flow-step-new-file-url');
  if (fileUrlInput && fileUrlInput.value.trim()) {
    handleFlowAddStepFile();
  }

  autoSaveActiveStepData();
  closeModal('modal-flow-detail');
  renderOpsWorkflows();
  showToast('ÄÃ£ lÆ°u thÃ´ng tin bÆ°á»›c xá»­ lÃ½!', 'success');
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
    saveState();
    renderActiveStepPanel();
  }
}

function handleFlowAddStepFile() {
  const nameInput = document.getElementById('flow-step-new-file-name');
  const urlInput = document.getElementById('flow-step-new-file-url');
  
  let name = nameInput.value.trim();
  const url = urlInput.value.trim();
  
  if (!url) {
    alert("Vui lÃ²ng nháº­p Ä‘Æ°á»ng dáº«n liÃªn káº¿t URL!");
    return;
  }
  if (!name) {
    name = "TÃ i liá»‡u Ä‘Ã­nh kÃ¨m";
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
  saveState();
  renderActiveStepPanel();
}

window.handleDeleteFlowFile = function(idx) {
  const flow = AppState.shipment_workflows.find(f => f.id === currentActiveFlowId);
  if (!flow) return;

  if (flow.files) {
    flow.files.splice(idx, 1);
  }

  saveState();
  renderActiveStepPanel();
};

function handleAddFlowSubmit(e) {
  e.preventDefault();
  
  const name = document.getElementById('flow-name').value.trim();
  const serviceType = document.getElementById('flow-service-type').value;
  const clientSelectVal = document.getElementById('flow-client-select').value;
  
  let clientId = clientSelectVal;
  let customerMsgTime = document.getElementById('flow-customer-msg-time').value;
  let infoEntryTime = document.getElementById('flow-info-entry-time').value;
  let evidenceUrl = document.getElementById('flow-evidence-url') ? document.getElementById('flow-evidence-url').value.trim() : '';

  // Handle lead select conversion
  if (clientSelectVal.startsWith('lead-')) {
    const leadId = clientSelectVal.replace('lead-', '');
    const lead = AppState.leads && AppState.leads.find(l => l.id === leadId);
    if (lead) {
      const newClientId = `client-${Date.now()}`;
      const newClientCode = `MH${400 + AppState.clients.length + 1}`;
      const newClient = {
        id: newClientId,
        code: newClientCode,
        name: lead.name,
        phone: lead.phone || '',
        social: lead.source === 'Fanpage' ? 'Facebook' : '',
        type: serviceType,
        tier: 'VIP 5',
        source: lead.source,
        cskhId: lead.salesId || 'usr-admin',
        managerId: 'usr-admin',
        note: 'KhÃ¡ch hÃ ng táº¡o tá»« Lead qua LÃ´ hÃ ng',
        createdTime: lead.createdTime ? lead.createdTime.split(' ')[0] : (lead.date || new Date().toISOString().split('T')[0])
      };
      AppState.clients.push(newClient);
      clientId = newClientId;
    }
  }
  // Handle create new client if "new" is selected
  else if (clientSelectVal === 'new') {
    const cName = document.getElementById('flow-client-name').value.trim();
    const cPhone = document.getElementById('flow-client-phone').value.trim();
    const cSocial = document.getElementById('flow-client-social').value.trim();

    if (!cName) {
      alert('Vui lÃ²ng nháº­p tÃªn khÃ¡ch hÃ ng má»›i!');
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
      source: 'tá»± sales',
      cskhId: document.getElementById('flow-cskh').value || 'usr-admin',
      managerId: 'usr-admin',
      note: 'KhÃ¡ch hÃ ng má»›i táº¡o qua LÃ´ hÃ ng',
      createdTime: new Date().toISOString().split('T')[0]
    };

    AppState.clients.push(newClient);
    clientId = newClientId;
  }

  // Pre-generate 12 steps templates
  const flowSteps = [];
  const stepNames = [
    "Nháº­n thÃ´ng tin", "BÃ¡o giÃ¡", "ThÆ°Æ¡ng lÆ°á»£ng", "ThÃ nh cÃ´ng", "Mua hÃ ng",
    "Shop Trung Quá»‘c gá»­i hÃ ng", "Vá» Ä‘áº¿n kho Trung Quá»‘c", "Vá» Ä‘áº¿n kho HÃ  Ná»™i/Háº£i PhÃ²ng",
    "Giao hÃ ng cho khÃ¡ch", "Thu ná»£", "HoÃ n táº¥t", "Tháº¥t báº¡i"
  ];
  
  for (let i = 1; i <= 12; i++) {
    const isFirst = (i === 1);
    
    // Add default required checklists for step 1, 5, 10
    let stepChecklist = [];
    if (i === 2) {
      stepChecklist = [
        { text: "cáº­p nháº­t tÃ¬nh tráº¡ng sau bÃ¡o giÃ¡", done: false, required: true }
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
    warehouseCn: document.getElementById('flow-warehouse-cn').value.trim() || 'Báº±ng TÆ°á»ng',
    warehouseVn: document.getElementById('flow-warehouse-vn').value.trim() || 'HÃ  Ná»™i',
    stage: 1,
    valTotal: parseInt(document.getElementById('flow-val-total').value) || 0,
    revenue: parseInt(document.getElementById('flow-revenue').value) || 0,
    profit: parseInt(document.getElementById('flow-profit').value) || 0,
    debt: parseInt(document.getElementById('flow-revenue').value) || 0, // Default debt = revenue
    deadline: flowSteps[0].deadline,
    customerMsgTime: customerMsgTime,
    infoEntryTime: infoEntryTime,
    evidenceUrl: evidenceUrl,
    files: [],
    riskNote: document.getElementById('flow-risk').value.trim(),
    history: [`${new Date().toISOString().split('T')[0]}: Khá»Ÿi táº¡o quy trÃ¬nh lÃ´ hÃ ng`],
    steps: flowSteps
  };

  AppState.shipment_workflows.push(newFlow);
  saveState();
  closeModal('modal-add-ops-flow');
  document.getElementById('form-add-ops-flow').reset();
  renderOpsWorkflows();
  addNotification('LÃ´ HÃ ng Má»›i ðŸšš', `ÄÃ£ khá»Ÿi táº¡o quy trÃ¬nh váº­n chuyá»ƒn "${name}" thÃ nh cÃ´ng!`, 'success');
}

function populateFlowUserDropdowns() {
  const users = AppState.users;
  const currentUser = typeof getCurrentUser === 'function' ? getCurrentUser() : {};
  ['flow-assignee', 'flow-cskh', 'flow-buyer'].forEach(id => {
    const select = document.getElementById(id);
    if (!select) return;
    select.innerHTML = '';
    users.forEach(u => {
      const opt = document.createElement('option');
      opt.value = u.id;
      opt.innerText = u.name;
      if (currentUser && u.id === currentUser.id) opt.selected = true;
      select.appendChild(opt);
    });
  });
}

function populateFlowClientDropdown() {
  const select = document.getElementById('flow-client-select');
  if (!select) return;
  
  select.innerHTML = '<option value="new">-- Táº¡o KhÃ¡ch HÃ ng Má»›i --</option>';
  
  // List Facebook Leads first (prefixed with 'lead-')
  if (AppState.leads) {
    AppState.leads.forEach(l => {
      if (l.stage !== 'failed') {
        const opt = document.createElement('option');
        opt.value = `lead-${l.id}`;
        opt.innerText = `[Lead Fanpage] ${l.name}`;
        select.appendChild(opt);
      }
    });
  }

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
      "Nháº­n thÃ´ng tin", "BÃ¡o giÃ¡", "ThÆ°Æ¡ng lÆ°á»£ng", "ThÃ nh cÃ´ng", "Mua hÃ ng",
      "Shop gá»­i hÃ ng", "Vá» kho TQ", "Vá» kho VN", "Giao hÃ ng", "Thu ná»£", "HoÃ n táº¥t"
    ];
    const currentStepName = stepNames[w.stage - 1] || "KhÃ´ng rÃµ";
    csvContent += `"${client.code || ''}","${client.name || ''}","${w.name}","${w.serviceType}","${currentStepName}",${w.valTotal},${w.revenue},${w.debt},"${w.deadline || ''}"\n`;
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", `quan_ly_lo_hang_minh_hai_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast('ÄÃ£ xuáº¥t bÃ¡o cÃ¡o CSV thÃ nh cÃ´ng!', 'success');
}


// ==================== CÃ”NG VIá»†C ÄÆ N Láºº LOGIC ==================== //
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
    if (t.title && t.title.includes('TÃ¬nh tráº¡ng KH sau bÃ¡o giÃ¡')) return false;

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
        const deptLabels = { sales: 'Sales & CSKH', sourcing: 'Sourcing', warehouse: 'Kho bÃ£i', admin: 'Káº¿ toÃ¡n & Admin' };
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
        valA = userA ? userA.name : 'KhÃ´ng';
        valB = userB ? userB.name : 'KhÃ´ng';
      } else if (currentSortField === 'priority') {
        const priorityOrder = { low: 1, normal: 2, high: 3, urgent: 4 };
        valA = priorityOrder[a.priority] || 0;
        valB = priorityOrder[b.priority] || 0;
      } else if (currentSortField === 'deadline') {
        valA = a.deadline ? new Date(a.deadline).getTime() : 0;
        valB = b.deadline ? new Date(b.deadline).getTime() : 0;
      } else if (currentSortField === 'status') {
        const statusLabels = { todo: 'ChÆ°a lÃ m', doing: 'Äang lÃ m', waiting: 'Chá» pháº£n há»“i', completed: 'HoÃ n thÃ nh', overdue: 'QuÃ¡ háº¡n', canceled: 'ÄÃ£ há»§y' };
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
    tbody.innerHTML = `<tr><td colspan="8"><div class="empty-state"><i class="fa-solid fa-list-check empty-state-icon"></i><span>KhÃ´ng cÃ³ cÃ´ng viá»‡c nÃ o trÃ¹ng khá»›p.</span></div></td></tr>`;
    return;
  }

  const deptLabels = { sales: 'Sales & CSKH', sourcing: 'Sourcing', warehouse: 'Kho bÃ£i', admin: 'Káº¿ toÃ¡n & Admin' };
  const priorityLabels = { low: 'Tháº¥p', normal: 'BÃ¬nh thÆ°á»ng', high: 'Cao', urgent: 'Kháº©n cáº¥p' };
  const priorityBadges = { low: 'bg-blue', normal: 'bg-gray', high: 'bg-orange', urgent: 'bg-rose' };
  const statusLabels = { todo: 'ChÆ°a lÃ m', doing: 'Äang lÃ m', waiting: 'Chá» pháº£n há»“i', completed: 'HoÃ n thÃ nh', overdue: 'QuÃ¡ háº¡n', canceled: 'ÄÃ£ há»§y' };
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
      <td>${assignee ? assignee.name : 'ChÆ°a giao'}</td>
      <td>${helper ? helper.name : 'KhÃ´ng'}</td>
      <td><span class="badge ${priorityBadges[t.priority]}">${priorityLabels[t.priority]}</span></td>
      <td class="${timeHighlight}">${t.deadline || 'ChÆ°a Ä‘áº·t'}</td>
      <td><span class="badge ${statusBadges[t.status]}">${statusLabels[t.status]}</span></td>
      <td class="text-center">
        <button class="btn btn-sm btn-outline" onclick="openOpsTaskDetail('${t.id}')">Chi tiáº¿t</button>
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
      <div class="card-desc" style="margin-top:4px;">${t.desc || 'KhÃ´ng cÃ³ mÃ´ táº£.'}</div>
      <div class="card-meta" style="margin-top:8px; border-top:1px solid var(--border-color); padding-top:6px; display:flex; justify-content:space-between; align-items:center;">
        <span style="font-size:10px; color:var(--text-muted);"><i class="fa-solid fa-circle-user"></i> ${assignee ? assignee.name.split(' ').pop() : 'ChÆ°a giao'}</span>
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
        addNotification('Cáº­p nháº­t CÃ´ng viá»‡c ðŸ“', `ÄÃ£ chuyá»ƒn cÃ´ng viá»‡c "${task.title}" sang cá»™t ${status.toUpperCase()}`, 'info');
      }
    });
  });
}

function renderSingleTasksCalendar(tasks) {
  const grid = document.getElementById('calendar-days-grid');
  grid.innerHTML = '';

  const monthYearLabel = document.getElementById('calendar-month-year');
  const monthNames = ["ThÃ¡ng 01", "ThÃ¡ng 02", "ThÃ¡ng 03", "ThÃ¡ng 04", "ThÃ¡ng 05", "ThÃ¡ng 06", "ThÃ¡ng 07", "ThÃ¡ng 08", "ThÃ¡ng 09", "ThÃ¡ng 10", "ThÃ¡ng 11", "ThÃ¡ng 12"];
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
  const projectTextEl = document.getElementById('ops-task-detail-project-text');
  if (projectTextEl) {
    const project = task.projectId ? (AppState.projects || []).find(p => p.id === task.projectId) : null;
    projectTextEl.innerText = project ? ` | Dá»± Ã¡n: ${project.name}` : '';
  }

  // Populate assignee select dropdown
  const assigneeSelect = document.getElementById('ops-task-detail-assignee');
  if (assigneeSelect) {
    assigneeSelect.innerHTML = AppState.users.map(u => `<option value="${u.id}">${u.name}</option>`).join('');
    assigneeSelect.value = task.assigneeId || '';
  }

  // Populate helper select dropdown
  const helperSelect = document.getElementById('ops-task-detail-helper');
  if (helperSelect) {
    helperSelect.innerHTML = `<option value="">KhÃ´ng cÃ³ há»— trá»£</option>` + AppState.users.map(u => `<option value="${u.id}">${u.name}</option>`).join('');
    helperSelect.value = task.helperId || '';
  }
  
  document.getElementById('ops-task-detail-deadline').value = task.deadline ? window.formatDateTimeLocal(task.deadline) : '';
  document.getElementById('ops-task-detail-desc').innerText = task.desc || 'KhÃ´ng cÃ³ mÃ´ táº£ chi tiáº¿t.';

  document.getElementById('ops-task-detail-desc').style.display = 'block';
  const editBtn = document.getElementById('btn-ops-task-detail-edit-desc');
  if (editBtn) editBtn.style.display = 'inline-block';
  const editGroup = document.getElementById('ops-task-detail-edit-desc-group');
  if (editGroup) editGroup.style.display = 'none';

  // Priority badge
  const priorityLabels = { low: 'Tháº¥p', normal: 'BÃ¬nh thÆ°á»ng', high: 'Cao', urgent: 'Kháº©n cáº¥p' };
  const priorityColors = { low: 'bg-blue', normal: 'bg-gray', high: 'bg-orange', urgent: 'bg-rose' };
  const badge = document.getElementById('ops-task-detail-priority-badge');
  badge.className = `badge ${priorityColors[task.priority]}`;
  badge.innerText = priorityLabels[task.priority];

  // Status dropdown populate
  const statusSelect = document.getElementById('ops-task-detail-status');
  statusSelect.innerHTML = `
    <option value="todo" ${task.status === 'todo' ? 'selected' : ''}>ChÆ°a lÃ m</option>
    <option value="doing" ${task.status === 'doing' ? 'selected' : ''}>Äang lÃ m</option>
    <option value="waiting" ${task.status === 'waiting' ? 'selected' : ''}>Chá» pháº£n há»“i</option>
    <option value="completed" ${task.status === 'completed' ? 'selected' : ''}>HoÃ n thÃ nh</option>
    <option value="overdue" ${task.status === 'overdue' ? 'selected' : ''}>QuÃ¡ háº¡n</option>
    <option value="canceled" ${task.status === 'canceled' ? 'selected' : ''}>ÄÃ£ há»§y</option>
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
    container.innerHTML = `<span class="text-muted" style="font-size:12px; font-style:italic;">ChÆ°a táº¡o checklist con.</span>`;
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
    container.innerHTML = `<span class="text-muted" style="font-size:12px; font-style:italic;">ChÆ°a cÃ³ tÃ i liá»‡u Ä‘Ã­nh kÃ¨m.</span>`;
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
  let name = nameInput.value.trim();
  const url = urlInput.value.trim();
  if (!url) {
    showToast("Vui lÃ²ng nháº­p Ä‘Æ°á»ng dáº«n liÃªn káº¿t URL!", "warning");
    return;
  }
  if (!name) {
    name = "TÃ i liá»‡u Ä‘Ã­nh kÃ¨m";
  }

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
    container.innerHTML = `<span class="text-muted" style="font-size:12px; font-style:italic;">ChÆ°a cÃ³ tháº£o luáº­n nÃ o.</span>`;
  }
}

function handleAddTaskComment() {
  const input = document.getElementById('ops-task-detail-new-comment');
  const text = input.value.trim();
  if (!text) return;

  const task = AppState.single_tasks.find(t => t.id === currentActiveTaskId);
  if (task) {
    if (!task.comments) task.comments = [];
    const user = AppState.users.find(u => u.id === AppState.currentUserId) || { name: 'NhÃ¢n viÃªn' };
    
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

  // Save assignee, helper and deadline updates
  const assigneeEl = document.getElementById('ops-task-detail-assignee');
  const helperEl = document.getElementById('ops-task-detail-helper');
  const deadlineEl = document.getElementById('ops-task-detail-deadline');
  if (assigneeEl) {
    task.assigneeId = assigneeEl.value;
  }
  if (helperEl) {
    task.helperId = helperEl.value || null;
  }
  if (deadlineEl && deadlineEl.value) {
    task.deadline = deadlineEl.value.replace('T', ' ');
  }

  saveState();
  closeModal('modal-ops-task-detail');
  renderOpsSingleTasks();
  if (typeof renderMyTasks === 'function') renderMyTasks();
  showToast('ÄÃ£ cáº­p nháº­t thÃ´ng tin cÃ´ng viá»‡c!', 'success');
}

function handleDeleteTask() {
  if (confirm('Báº¡n cÃ³ thá»±c sá»± muá»‘n xÃ³a cÃ´ng viá»‡c nÃ y?')) {
    AppState.single_tasks = AppState.single_tasks.filter(t => t.id !== currentActiveTaskId);
    saveState();
    closeModal('modal-ops-task-detail');
    renderOpsSingleTasks();
    showToast('ÄÃ£ xÃ³a cÃ´ng viá»‡c.', 'info');
  }
}

function handleAddSingleTaskSubmit(e) {
  e.preventDefault();
  
  const user = getCurrentUser();
  const title = document.getElementById('ops-task-title').value.trim();
  const desc = document.getElementById('ops-task-desc').value.trim();
  const dept = document.getElementById('ops-task-dept').value;
  const priority = document.getElementById('ops-task-priority').value;
  const assigneeId = document.getElementById('ops-task-assignee').value;
  const helperId = document.getElementById('ops-task-helper').value;
  const deadline = document.getElementById('ops-task-deadline').value.replace('T', ' ');
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
    creatorId: user.id,
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
    history: [`${new Date().toISOString().split('T')[0]}: Khá»Ÿi táº¡o cÃ´ng viá»‡c Ä‘Æ¡n láº»`]
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

  addNotification('Giao Viá»‡c ðŸ“', `ÄÃ£ giao cÃ´ng viá»‡c má»›i: "${title}" cho nhÃ¢n viÃªn phá»¥ trÃ¡ch.`, 'success');
}

function populateTaskUserDropdowns() {
  const users = AppState.users;
  ['ops-task-assignee', 'ops-task-helper'].forEach(id => {
    const select = document.getElementById(id);
    if (!select) return;
    select.innerHTML = '';
    
    if (id === 'ops-task-helper') {
      select.innerHTML = '<option value="">-- KhÃ´ng cÃ³ --</option>';
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
    projSelect.innerHTML = '<option value="">-- KhÃ´ng ghim dá»± Ã¡n --</option>';
    AppState.projects.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.innerText = p.name;
      projSelect.appendChild(opt);
    });
  }

  const clientSelect = document.getElementById('ops-task-client');
  if (clientSelect) {
    clientSelect.innerHTML = '<option value="">-- KhÃ´ng liÃªn káº¿t --</option>';
    
    // Group Clients
    const groupClients = document.createElement('optgroup');
    groupClients.label = 'KhÃ¡ch HÃ ng CÅ©';
    AppState.clients.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.innerText = `${c.name} (${c.code})`;
      groupClients.appendChild(opt);
    });
    clientSelect.appendChild(groupClients);

    // Group Workflows
    const groupFlows = document.createElement('optgroup');
    groupFlows.label = 'Quy TrÃ¬nh LÃ´ HÃ ng';
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


// ==================== Dá»° ÃN Váº¬N HÃ€NH LOGIC ==================== //
function renderOpsProjects() {
  const listContainer = document.getElementById('projects-list-container');
  if (!listContainer) return;
  listContainer.innerHTML = '';

  if (AppState.projects.length === 0) {
    listContainer.innerHTML = `<span class="text-muted" style="padding:15px; font-style:italic;">ChÆ°a cÃ³ dá»± Ã¡n nÃ o.</span>`;
    return;
  }

  AppState.projects.forEach(p => {
    const card = document.createElement('div');
    card.className = `dashboard-card project-card-item ${currentActiveProjectId === p.id ? 'active' : ''}`;
    card.style.cssText = `cursor:pointer; border: 1px solid ${currentActiveProjectId === p.id ? 'var(--color-primary)' : 'var(--border-color)'}; padding:12px;`;
    
    const manager = AppState.users.find(u => u.id === p.managerId) || { name: 'ChÆ°a giao' };

    card.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <strong>${p.name}</strong>
        <span class="badge bg-blue" style="font-size:9.5px;">${p.type}</span>
      </div>
      <div style="font-size:11px; color:var(--text-secondary); margin-top:6px;">Quáº£n lÃ½: ${manager.name} | ThÃ nh viÃªn: ${p.members ? p.members.length : 0}</div>
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
  document.getElementById('active-project-type').innerText = `Loáº¡i: ${p.type.toUpperCase()}`;
  
  const statusLabels = { preparing: 'Äang chuáº©n bá»‹', doing: 'Äang thá»±c hiá»‡n', paused: 'Táº¡m dá»«ng', completed: 'HoÃ n thÃ nh', canceled: 'ÄÃ£ há»§y' };
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
    document.getElementById('active-project-desc').innerText = proj.desc || 'KhÃ´ng cÃ³ mÃ´ táº£ chi tiáº¿t.';
    const manager = AppState.users.find(u => u.id === proj.managerId);
    document.getElementById('active-project-manager').innerText = manager ? manager.name : 'ChÆ°a giao';
    
    const membersNames = proj.members ? proj.members.map(mid => {
      const u = AppState.users.find(usr => usr.id === mid);
      return u ? u.name : null;
    }).filter(Boolean).join(', ') : '';
    document.getElementById('active-project-members').innerText = membersNames || 'KhÃ´ng cÃ³ thÃ nh viÃªn phá»¥';
    
    document.getElementById('active-project-notes').innerText = proj.notes || 'KhÃ´ng cÃ³ ghi chÃº quan trá»ng.';

    // Populate quick view tasks inside overview tab
    const overviewTasksList = document.getElementById('project-overview-tasks-list');
    if (overviewTasksList) {
      overviewTasksList.innerHTML = '';
      const projTasks = (AppState.single_tasks || []).filter(t => t.projectId === proj.id);
      if (projTasks.length === 0) {
        overviewTasksList.innerHTML = `<span class="text-muted" style="font-size: 11.5px; font-style: italic;">ChÆ°a cÃ³ cÃ´ng viá»‡c nÃ o liÃªn káº¿t vá»›i dá»± Ã¡n nÃ y.</span>`;
      } else {
        projTasks.forEach(task => {
          const div = document.createElement('div');
          div.className = 'mini-task-item';
          div.style.cssText = 'padding: 8px; border-bottom: 1px solid var(--border-color); font-size: 11.5px; display:flex; justify-content:space-between; align-items:center; cursor:pointer;';
          
          const statusLabels = { pending: 'ChÆ°a lÃ m', doing: 'Äang lÃ m', checking: 'Chá» duyá»‡t', completed: 'HoÃ n thÃ nh', canceled: 'ÄÃ£ há»§y' };
          const statusColors = { pending: 'bg-gray', doing: 'bg-blue', checking: 'bg-purple', completed: 'bg-emerald', canceled: 'bg-rose' };
          
          div.innerHTML = `
            <div>
              <strong>${task.title}</strong>
            </div>
            <div style="display:flex; align-items:center; gap:8px;">
              <span class="badge ${statusColors[task.status] || ''}" style="font-size:9px;">${statusLabels[task.status] || task.status}</span>
              <span style="font-size: 9.5px; color: var(--text-muted);">${task.deadline || 'Háº¡n: -'}</span>
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
        overviewDocsList.innerHTML = `<span class="text-muted" style="font-size: 11.5px; font-style: italic;">ChÆ°a ghim tÃ i liá»‡u hoáº·c liÃªn káº¿t nÃ o.</span>`;
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
              <i class="fa-solid fa-square-share-nodes"></i> Má»Ÿ link
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
    tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted" style="padding:15px; font-style:italic;">ChÆ°a ghim tÃ i liá»‡u hoáº·c link Google Drive nÃ o.</td></tr>`;
    return;
  }

  proj.documents.forEach((doc, idx) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${doc.name}</strong></td>
      <td><a href="${doc.url}" target="_blank" style="color:var(--color-primary);"><i class="fa-solid fa-square-share-nodes"></i> Má»Ÿ liÃªn káº¿t</a></td>
      <td>${doc.note || 'KhÃ´ng cÃ³'}</td>
      <td class="text-center">
        <button class="btn btn-sm btn-outline text-rose" onclick="handleDeleteProjectDoc(${idx})"><i class="fa-solid fa-trash-can"></i> XÃ³a</button>
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

    showToast('ÄÃ£ ghim tÃ i liá»‡u thÃ nh cÃ´ng!', 'success');
  }
}

function renderProjectTasksTab(projId) {
  const tbody = document.getElementById('project-tasks-list');
  tbody.innerHTML = '';

  const projectTasks = AppState.single_tasks.filter(t => t.projectId === projId);

  if (projectTasks.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted" style="padding:15px; font-style:italic;">ChÆ°a cÃ³ cÃ´ng viá»‡c nÃ o liÃªn káº¿t vá»›i dá»± Ã¡n nÃ y.</td></tr>`;
    return;
  }

  const priorityLabels = { low: 'Tháº¥p', normal: 'BÃ¬nh thÆ°á»ng', high: 'Cao', urgent: 'Kháº©n cáº¥p' };
  const priorityColors = { low: 'bg-blue', normal: 'bg-gray', high: 'bg-orange', urgent: 'bg-rose' };
  const statusLabels = { todo: 'ChÆ°a lÃ m', doing: 'Äang lÃ m', waiting: 'Chá» pháº£n há»“i', completed: 'HoÃ n thÃ nh', overdue: 'QuÃ¡ háº¡n', canceled: 'ÄÃ£ há»§y' };
  const statusColors = { todo: 'bg-blue', doing: 'bg-orange', waiting: 'bg-purple', completed: 'bg-emerald', overdue: 'bg-rose', canceled: 'bg-gray' };

  projectTasks.forEach(t => {
    const assignee = AppState.users.find(u => u.id === t.assigneeId);
    const tr = document.createElement('tr');
    tr.style.cursor = 'pointer';
    tr.innerHTML = `
      <td><strong>${t.title}</strong></td>
      <td>${assignee ? assignee.name : 'ChÆ°a giao'}</td>
      <td><span class="badge ${priorityColors[t.priority]}">${priorityLabels[t.priority]}</span></td>
      <td>${t.deadline || 'ChÆ°a Ä‘áº·t'}</td>
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
    container.innerHTML = `<span class="text-muted" style="padding:15px; font-style:italic;">Báº¯t Ä‘áº§u cuá»™c tháº£o luáº­n chung cho nhÃ³m dá»± Ã¡n...</span>`;
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
    const user = AppState.users.find(u => u.id === AppState.currentUserId) || { name: 'NhÃ¢n viÃªn' };
    
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
    notes: notes || 'KhÃ´ng cÃ³',
    documents: [],
    discussions: [],
    history: []
  };

  AppState.projects.push(newProject);
  saveState();
  closeModal('modal-add-ops-project');
  document.getElementById('form-add-ops-project').reset();
  
  renderOpsProjects();
  addNotification('Dá»± Ãn Má»›i ðŸ“‚', `ÄÃ£ táº¡o dá»± Ã¡n/phÃ²ng ban má»›i: "${name}" thÃ nh cÃ´ng.`, 'success');
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
    container.innerHTML = `<span class="text-muted" style="font-size:12px; font-style:italic;">ChÆ°a cÃ³ tháº£o luáº­n nÃ o á»Ÿ bÆ°á»›c nÃ y.</span>`;
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
    const user = AppState.users.find(u => u.id === AppState.currentUserId) || { name: 'NhÃ¢n sá»±' };
    
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
  const myHelperTasksList = document.getElementById('my-helper-tasks-list');

  myFlowsList.innerHTML = '';
  mySingleTasksList.innerHTML = '';
  myProjectTasksList.innerHTML = '';
  if (myHelperTasksList) myHelperTasksList.innerHTML = '';

  // Step names translation mapping
  const stepNames = [
    "Nháº­n thÃ´ng tin", "BÃ¡o giÃ¡", "ThÆ°Æ¡ng lÆ°á»£ng", "ThÃ nh cÃ´ng", "Mua hÃ ng",
    "Shop gá»­i hÃ ng", "Vá» kho TQ", "Vá» kho VN", "Giao hÃ ng", "Thu ná»£", "HoÃ n táº¥t"
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
        card.className = `kanban-card ${isOverdue ? 'overdue-card' : ''}`;
        card.style.cssText = 'cursor: pointer; border-left: 4px solid #3b82f6; transition: transform 0.2s; margin-bottom: 8px;';
        card.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:10px; font-weight:bold; color:#3b82f6;">${client.code || 'KH CÅ¨'}</span>
            <span class="badge bg-blue" style="font-size:9px; padding:2px 4px;">BÆ°á»›c ${flow.stage}</span>
          </div>
          <div class="card-client-name" style="margin-top:6px; font-size:13px; font-weight:bold;">${flow.name}</div>
          <div style="font-size:11px; opacity:0.8; margin-top:4px;">KhÃ¢u: <strong>${stepNames[flow.stage - 1]}</strong></div>
          <div style="font-size:11px; margin-top:4px;"><i class="fa-solid fa-list-check"></i> Checklist: ${chkDone}/${chkTotal} viá»‡c</div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px; border-top:1px solid var(--border-color); padding-top:6px;">
            <span style="font-size:10px; color:${isOverdue ? '#ef4444' : 'var(--text-muted)'};"><i class="fa-solid fa-calendar-xmark"></i> Háº¡n: ${flow.deadline || 'KhÃ´ng cÃ³'}</span>
          </div>
        `;
        card.onclick = () => {
          openFlowDetailModal(flow.id);
        };
        myFlowsList.appendChild(card);
      }
    });
  }

  // 2. CRM Leads (KhÃ¡ch HÃ ng Má»›i) assigned to user
  if (AppState.leads) {
    AppState.leads.forEach(lead => {
      if (lead.salesId === userId && lead.stage !== 'success' && lead.stage !== 'failed') {
        flowsCount++;
        
        const stageLabels = {
          receive_info: "Nháº­n thÃ´ng tin",
          get_phone: "Láº¥y SÄT/Wechat",
          explore_info: "Khai thÃ¡c thÃ´ng tin",
          quotation: "BÃ¡o giÃ¡",
          negotiating: "ThÆ°Æ¡ng lÆ°á»£ng"
        };

        const isOverdue = typeof checkLeadOverdue === 'function' ? checkLeadOverdue(lead) : false;
        const card = document.createElement('div');
        card.className = `kanban-card ${isOverdue ? 'overdue-card' : ''}`;
        card.style.cssText = 'cursor: pointer; border-left: 4px solid #8b5cf6; transition: transform 0.2s; margin-bottom: 8px;';
        card.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:10px; font-weight:bold; color:#8b5cf6;">CRM KHÃCH Má»šI</span>
            <span class="badge" style="font-size:9px; padding:2px 4px; background:#8b5cf6; color:white;">${stageLabels[lead.stage] || lead.stage}</span>
          </div>
          <div class="card-client-name" style="margin-top:6px; font-size:13px; font-weight:bold;">${lead.name}</div>
          <div class="card-desc" style="font-size:11px; opacity:0.8; margin-top:4px;">SÄT: ${lead.phone || 'ChÆ°a cÃ³'}</div>
          <div style="font-size:11px; margin-top:4px; max-height:36px; overflow:hidden; text-overflow:ellipsis; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical;">Nhu cáº§u: ${lead.note || 'KhÃ´ng cÃ³'}</div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px; border-top:1px solid var(--border-color); padding-top:6px;">
            <span style="font-size:10px; color:var(--text-muted);"><i class="fa-solid fa-clock"></i> NgÃ y táº¡o: ${lead.date || ''}</span>
            <strong style="font-size:11px; color:#34d399;">${lead.valVnd > 0 ? formatVnd(lead.valVnd) : '0Ä‘'}</strong>
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
    myFlowsList.innerHTML = `<span class="text-muted" style="font-size:12px; font-style:italic; padding: 15px; text-align:center;">Tuyá»‡t vá»i! KhÃ´ng cÃ³ lÃ´ hÃ ng hay Lead khÃ¡ch má»›i nÃ o chá» báº¡n xá»­ lÃ½.</span>`;
  }

  // 3. Single Tasks & Project Tasks
  let singleCount = 0;
  let projectCount = 0;

  if (AppState.single_tasks) {
    AppState.single_tasks.forEach(task => {
      if (task.title && task.title.includes('TÃ¬nh tráº¡ng KH sau bÃ¡o giÃ¡')) return;

      if (task.assigneeId === userId && task.status !== 'completed' && task.status !== 'canceled' && task.status !== 'archived') {
        const chkDone = task.checklist ? task.checklist.filter(c => c.done).length : 0;
        const chkTotal = task.checklist ? task.checklist.length : 0;
        
        const pLabels = { low: 'Tháº¥p', normal: 'ThÆ°á»ng', high: 'Cao', urgent: 'Kháº©n cáº¥p' };
        const pColors = { low: '#10b981', normal: '#3b82f6', high: '#f59e0b', urgent: '#ef4444' };

        const isOverdue = task.deadline && new Date(task.deadline) < new Date();

        const card = document.createElement('div');
        card.className = `kanban-card ${isOverdue ? 'overdue-card' : ''}`;
        card.style.cssText = `cursor: pointer; border-left: 4px solid ${task.projectId ? '#10b981' : '#f59e0b'}; transition: transform 0.2s; margin-bottom: 8px;`;

        let projectInfoHtml = '';
        if (task.projectId) {
          const proj = (AppState.projects || []).find(p => p.id === task.projectId);
          if (proj) {
            projectInfoHtml = `<div style="font-size:11px; margin-top:4px; color:#10b981; font-weight:bold;"><i class="fa-solid fa-folder-open"></i> Dá»± Ã¡n: ${proj.name}</div>`;
          }
        }

        card.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span class="badge" style="font-size:9px; padding:2px 4px; background:${pColors[task.priority] || '#fff'}; color:white;">Æ¯u tiÃªn: ${pLabels[task.priority] || 'BÃ¬nh thÆ°á»ng'}</span>
            <div style="display:flex; align-items:center; gap:6px;">
              <span style="font-size:9.5px; color:var(--text-muted);">${task.dept.toUpperCase()}</span>
              <button class="btn btn-xs btn-success" style="padding: 1px 4px; font-size: 9px; line-height: 1; border: none; border-radius: 4px; color: white; background: #10b981; cursor: pointer;" onclick="event.stopPropagation(); window.quickCompleteTask('${task.id}')">
                <i class="fa-solid fa-check"></i> Xong
              </button>
            </div>
          </div>
          <div class="card-client-name" style="margin-top:6px; font-size:13px; font-weight:bold;">${task.title}</div>
          ${projectInfoHtml}
          <div style="font-size:11px; margin-top:4px;"><i class="fa-solid fa-list-check"></i> Checklist: ${chkDone}/${chkTotal} viá»‡c</div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px; border-top:1px solid var(--border-color); padding-top:6px;">
            <span style="font-size:10px; color:${isOverdue ? '#ef4444' : 'var(--text-muted)'};"><i class="fa-solid fa-calendar-xmark"></i> Háº¡n: ${task.deadline || 'KhÃ´ng cÃ³'}</span>
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

  // 4. CRM Tasks (CÃ´ng viá»‡c CRM khÃ¡ch hÃ ng má»›i)
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
              <label style="font-size: 10px; color: var(--text-muted); font-weight: bold;">KhÃ¢u xá»­ lÃ½:</label>
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
            actionBtnHtml = `<button class="btn btn-xs btn-primary" style="margin-top:8px; width:100%;" onclick="event.stopPropagation(); handleMyCrmTaskApprove('${task.id}')"><i class="fa-solid fa-circle-check"></i> Duyá»‡t thÆ°á»Ÿng</button>`;
          } else {
            actionBtnHtml = `<div style="font-size:10px; color:var(--text-muted); margin-top:6px; font-style:italic;"><i class="fa-solid fa-hourglass-start"></i> Äang chá» duyá»‡t...</div>`;
          }
        } else {
          actionBtnHtml = `<button class="btn btn-xs btn-secondary" style="margin-top:8px; width:100%;" onclick="event.stopPropagation(); handleMyCrmTaskSubmit('${task.id}')"><i class="fa-solid fa-share-from-square"></i> Ná»™p káº¿t quáº£</button>`;
        }

        const card = document.createElement('div');
        card.className = `kanban-card ${isOverdue ? 'overdue-card' : ''}`;
        card.style.cssText = 'cursor: pointer; border-left: 4px solid #a855f7; transition: transform 0.2s; margin-bottom: 8px;';
        card.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:10px; font-weight:bold; color:#a855f7;">CRM KHÃCH Má»šI (TASK)</span>
            <span class="badge" style="font-size:9px; padding:2px 4px; background:#a855f7; color:white;">${task.status === 'checking' ? 'Chá» duyá»‡t' : 'ChÆ°a xong'}</span>
          </div>
          <div class="card-client-name" style="margin-top:6px; font-size:13px; font-weight:bold;">${task.title}</div>
          <div style="font-size:11px; opacity:0.8; margin-top:4px;">Chi tiáº¿t: ${task.desc || 'KhÃ´ng cÃ³'}</div>
          ${stepSelectHtml}
          ${actionBtnHtml}
          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px; border-top:1px solid var(--border-color); padding-top:6px;">
            <span style="font-size:10px; color:${isOverdue ? '#ef4444' : 'var(--text-muted)'};"><i class="fa-solid fa-calendar-xmark"></i> Háº¡n: ${task.deadline || 'KhÃ´ng giá»›i háº¡n'}</span>
            <span style="font-size:10px; color:#f59e0b;"><i class="fa-solid fa-cookie"></i> +${task.points} XÃºc xÃ­ch</span>
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
    mySingleTasksList.innerHTML = `<span class="text-muted" style="font-size:12px; font-style:italic; padding: 15px; text-align:center;">Tuyá»‡t vá»i! KhÃ´ng cÃ³ nhiá»‡m vá»¥ Ä‘Æ¡n láº» nÃ o cáº§n lÃ m.</span>`;
  }

  document.getElementById('my-project-tasks-count').innerText = projectCount;
  if (projectCount === 0) {
    myProjectTasksList.innerHTML = `<span class="text-muted" style="font-size:12px; font-style:italic; padding: 15px; text-align:center;">Tuyá»‡t vá»i! KhÃ´ng cÃ³ viá»‡c dá»± Ã¡n VIP nÃ o cáº§n lÃ m.</span>`;
  }

  // 5. Tasks I assist (Viá»‡c TÃ´i Há»— Trá»£)
  let helperCount = 0;
  if (myHelperTasksList) {
    myHelperTasksList.innerHTML = '';
    if (AppState.single_tasks) {
      AppState.single_tasks.forEach(task => {
        if (task.title && task.title.includes('TÃ¬nh tráº¡ng KH sau bÃ¡o giÃ¡')) return;

        // Show tasks where current user is the helper, and not completed/canceled/archived
        if (task.helperId === userId && task.status !== 'completed' && task.status !== 'canceled' && task.status !== 'archived') {
          helperCount++;
          const chkDone = task.checklist ? task.checklist.filter(c => c.done).length : 0;
          const chkTotal = task.checklist ? task.checklist.length : 0;
          
          const pLabels = { low: 'Tháº¥p', normal: 'ThÆ°á»ng', high: 'Cao', urgent: 'Kháº©n cáº¥p' };
          const pColors = { low: '#10b981', normal: '#3b82f6', high: '#f59e0b', urgent: '#ef4444' };

          const isOverdue = task.deadline && new Date(task.deadline) < new Date();

          const card = document.createElement('div');
          card.className = `kanban-card ${isOverdue ? 'overdue-card' : ''}`;
          card.style.cssText = `cursor: pointer; border-left: 4px solid #06b6d4; transition: transform 0.2s; margin-bottom: 8px;`;

          let projectInfoHtml = '';
          if (task.projectId) {
            const proj = (AppState.projects || []).find(p => p.id === task.projectId);
            if (proj) {
              projectInfoHtml = `<div style="font-size:11px; margin-top:4px; color:#10b981; font-weight:bold;"><i class="fa-solid fa-folder-open"></i> Dá»± Ã¡n: ${proj.name}</div>`;
            }
          }

          const assignee = AppState.users.find(u => u.id === task.assigneeId);
          const assigneeName = assignee ? assignee.name : (task.dept ? `PhÃ²ng ${task.dept.toUpperCase()}` : 'ChÆ°a giao');

          card.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span class="badge" style="font-size:9px; padding:2px 4px; background:${pColors[task.priority] || '#fff'}; color:white;">Æ¯u tiÃªn: ${pLabels[task.priority] || 'BÃ¬nh thÆ°á»ng'}</span>
              <div style="display:flex; align-items:center; gap:6px;">
                <span style="font-size:9.5px; color:var(--text-muted); font-weight:bold;">${task.dept.toUpperCase()}</span>
              </div>
            </div>
            <div class="card-client-name" style="margin-top:6px; font-size:13px; font-weight:bold;">${task.title}</div>
            ${projectInfoHtml}
            <div style="font-size:11px; margin-top:4px; color: var(--text-secondary);"><i class="fa-solid fa-user-gear"></i> Phá»¥ trÃ¡ch: <strong>${assigneeName}</strong></div>
            <div style="font-size:11px; margin-top:4px;"><i class="fa-solid fa-list-check"></i> Checklist: ${chkDone}/${chkTotal} viá»‡c</div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px; border-top:1px solid var(--border-color); padding-top:6px;">
              <span style="font-size:10px; color:${isOverdue ? '#ef4444' : 'var(--text-muted)'};"><i class="fa-solid fa-calendar-xmark"></i> Háº¡n: ${task.deadline || 'KhÃ´ng cÃ³'}</span>
            </div>
          `;
          
          card.onclick = () => {
            if (typeof openOpsTaskDetail === 'function') {
              openOpsTaskDetail(task.id);
            }
          };
          myHelperTasksList.appendChild(card);
        }
      });
    }
    const helperCountLabel = document.getElementById('my-helper-tasks-count');
    if (helperCountLabel) {
      helperCountLabel.innerText = helperCount;
    }
    if (helperCount === 0) {
      myHelperTasksList.innerHTML = `<span class="text-muted" style="font-size:12px; font-style:italic; padding: 15px; text-align:center;">Tuyá»‡t vá»i! KhÃ´ng cÃ³ cÃ´ng viá»‡c nÃ o báº¡n há»— trá»£ Ä‘ang chá».</span>`;
    }
  }

  // 6. Tasks I assigned to others (Viá»‡c TÃ´i ÄÃ£ Giao)
  const myAssignedTasksList = document.getElementById('my-assigned-tasks-list');
  let assignedCount = 0;
  if (myAssignedTasksList) {
    myAssignedTasksList.innerHTML = '';
    
    if (AppState.single_tasks) {
      AppState.single_tasks.forEach(task => {
        if (task.title && task.title.includes('TÃ¬nh tráº¡ng KH sau bÃ¡o giÃ¡')) return;

        // Show tasks where current user is the creator but NOT the assignee, and not archived
        if (task.creatorId === userId && task.assigneeId !== userId && task.status !== 'archived') {
          assignedCount++;
          const assignee = AppState.users.find(u => u.id === task.assigneeId);
          const assigneeName = assignee ? assignee.name : (task.dept ? `PhÃ²ng ${task.dept.toUpperCase()}` : 'ChÆ°a giao');

          const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status !== 'completed';

          const card = document.createElement('div');
          card.className = `kanban-card ${isOverdue ? 'overdue-card' : ''}`;
          
          const isCompleted = task.status === 'completed';
          const borderLeftColor = isCompleted ? '#10b981' : '#a855f7';
          // Completed cards have a soft green glow background and normal opacity for high readability
          card.style.cssText = `cursor: pointer; border-left: 4px solid ${borderLeftColor}; transition: transform 0.2s; margin-bottom: 8px; ${isCompleted ? 'background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.2); border-left: 4px solid #10b981;' : ''}`;

          let projectInfoHtml = '';
          if (task.projectId) {
            const proj = (AppState.projects || []).find(p => p.id === task.projectId);
            if (proj) {
              projectInfoHtml = `<div style="font-size:11px; margin-top:4px; color:#10b981; font-weight:bold;"><i class="fa-solid fa-folder-open"></i> Dá»± Ã¡n: ${proj.name}</div>`;
            }
          }

          const statusLabel = isCompleted ? '<span class="badge bg-emerald" style="font-size:9px; padding:2px 4px; font-weight:bold;">ÄÃ£ hoÃ n thÃ nh</span>' : '<span class="badge bg-purple" style="font-size:9px; padding:2px 4px; background:#a855f7; color:white; font-weight:bold;">Äang lÃ m</span>';

          // Completed tasks show a green check icon next to title and have a button to "Acknowledge & Close" (ÄÃ£ xem & ÄÃ³ng)
          let titleHtml = '';
          let archiveBtnHtml = '';
          if (isCompleted) {
            titleHtml = `<div class="card-client-name" style="margin-top:6px; font-size:13px; font-weight:bold; color:#10b981; display:flex; align-items:center; gap:6px;"><i class="fa-solid fa-circle-check text-success"></i> ${task.title}</div>`;
            archiveBtnHtml = `
              <button class="btn btn-xs btn-outline" style="margin-top: 10px; width: 100%; border-color: #10b981; color: #10b981; background: rgba(16, 185, 129, 0.1); font-weight: bold; height: 28px; font-size:11px;" onclick="event.stopPropagation(); window.archiveAssignedTask('${task.id}')">
                <i class="fa-solid fa-eye"></i> ÄÃ£ xem & ÄÃ³ng viá»‡c
              </button>
            `;
          } else {
            titleHtml = `<div class="card-client-name" style="margin-top:6px; font-size:13px; font-weight:bold; color:#fff;">${task.title}</div>`;
          }

          card.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center;">
              ${statusLabel}
              <div style="display:flex; align-items:center; gap:6px;">
                <span style="font-size:9.5px; color:var(--text-muted); font-weight:bold;">${task.dept.toUpperCase()}</span>
              </div>
            </div>
            ${titleHtml}
            ${projectInfoHtml}
            <div style="font-size:11px; margin-top:6px; color: var(--text-secondary);"><i class="fa-solid fa-user-gear"></i> Phá»¥ trÃ¡ch: <strong>${assigneeName}</strong></div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px; border-top:1px solid var(--border-color); padding-top:6px;">
              <span style="font-size:10px; color:${isOverdue ? '#ef4444' : 'var(--text-muted)'};"><i class="fa-solid fa-calendar-xmark"></i> Háº¡n: ${task.deadline || 'KhÃ´ng cÃ³'}</span>
            </div>
            ${archiveBtnHtml}
          `;
          
          card.onclick = () => {
            if (typeof openOpsTaskDetail === 'function') {
              openOpsTaskDetail(task.id);
            }
          };
          myAssignedTasksList.appendChild(card);
        }
      });
    }

    const assignedCountLabel = document.getElementById('my-assigned-tasks-count');
    if (assignedCountLabel) {
      assignedCountLabel.innerText = assignedCount;
    }
    if (assignedCount === 0) {
      myAssignedTasksList.innerHTML = `<span class="text-muted" style="font-size:12px; font-style:italic; padding: 15px; text-align:center;">Báº¡n chÆ°a giao cÃ´ng viá»‡c nÃ o cho ngÆ°á»i khÃ¡c.</span>`;
    }
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
    if (confirm(`Báº¡n Ä‘Ã£ chá»n bÆ°á»›c cuá»‘i cÃ¹ng: "${steps[stepIdx]}". Báº¡n cÃ³ muá»‘n Ná»˜P Káº¾T QUáº¢ cÃ´ng viá»‡c nÃ y lÃªn Quáº£n lÃ½ Ä‘á»ƒ duyá»‡t nháº­n ${task.points} XÃºc xÃ­ch khÃ´ng?`)) {
      task.status = 'checking';
      const user = AppState.users.find(u => u.id === AppState.currentUserId) || { name: 'NhÃ¢n sá»±' };
      addNotification('Chá» duyá»‡t cÃ´ng viá»‡c', `${user.name} Ä‘Ã£ hoÃ n thÃ nh vÃ  ná»™p cÃ´ng viá»‡c: ${task.title}`, 'info');
    }
  }

  saveState();
  if (typeof renderTasksList === 'function') renderTasksList();
  renderMyTasks();
  showToast(`ÄÃ£ cáº­p nháº­t tiáº¿n Ä‘á»™ cÃ´ng viá»‡c Ä‘áº¿n bÆ°á»›c: ${steps[stepIdx]}`, 'success');
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
  today.setHours(9, 0, 0, 0);
  const deadlineInput = document.getElementById('ops-task-deadline');
  if (deadlineInput) {
    deadlineInput.value = window.formatDateTimeLocal(today);
  }

  const titleHeader = document.querySelector('#modal-add-ops-task h3');
  const projectSelect = document.getElementById('ops-task-project');

  if (isProjectTask) {
    if (titleHeader) titleHeader.innerText = 'Táº¡o CÃ´ng Viá»‡c Trong Dá»± Ãn';
    if (projectSelect) {
      projectSelect.required = true;
      projectSelect.style.border = '2px solid #f59e0b';
      if (projectSelect.options.length > 1) {
        projectSelect.selectedIndex = 1;
      }
    }
  } else {
    if (titleHeader) titleHeader.innerText = 'Giao Viá»‡c ÄÆ¡n Láº» Má»›i';
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
  const managerName = manager ? manager.name : 'ChÆ°a giao';
  
  const membersNames = p.members ? p.members.map(mid => {
    const u = AppState.users.find(usr => usr.id === mid);
    return u ? u.name : null;
  }).filter(Boolean).join(', ') : '';
  
  document.getElementById('dedicated-project-meta').innerText = `Quáº£n lÃ½: ${managerName} | ThÃ nh viÃªn: ${membersNames || 'KhÃ´ng cÃ³'}`;
  
  // Reset description editing mode views
  const viewMode = document.getElementById('project-desc-view-mode');
  const editMode = document.getElementById('project-desc-edit-mode');
  const btnEditDesc = document.getElementById('btn-edit-project-desc');
  if (viewMode) viewMode.style.display = 'block';
  if (editMode) editMode.style.display = 'none';
  if (btnEditDesc) btnEditDesc.style.display = '';

  document.getElementById('dedicated-project-desc').innerText = (p.desc || 'KhÃ´ng cÃ³ mÃ´ táº£ chi tiáº¿t.') + '\n' + (p.notes ? `LÆ°u Ã½: ${p.notes}` : '');

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
    tasksContainer.innerHTML = `<span class="text-muted" style="font-size: 12.5px; font-style: italic; text-align: center; padding: 20px 0; width: 100%;">ChÆ°a cÃ³ cÃ´ng viá»‡c nÃ o liÃªn káº¿t vá»›i dá»± Ã¡n nÃ y.</span>`;
  } else {
    projTasks.forEach(task => {
      const div = document.createElement('div');
      div.className = 'mini-task-item';
      div.style.cssText = 'padding: 10px; border-bottom: 1px solid var(--border-color); font-size: 12.5px; display:flex; justify-content:space-between; align-items:center; cursor:pointer; background: rgba(255,255,255,0.02); border-radius: 4px; margin-bottom: 6px;';
      
      const statusLabels = { 
        todo: 'ChÆ°a lÃ m', 
        pending: 'ChÆ°a lÃ m',
        doing: 'Äang lÃ m', 
        waiting: 'Chá» pháº£n há»“i',
        checking: 'Chá» duyá»‡t',
        completed: 'HoÃ n thÃ nh', 
        overdue: 'QuÃ¡ háº¡n', 
        canceled: 'ÄÃ£ há»§y' 
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
      const assigneeName = assigneeUser ? assigneeUser.name : 'ChÆ°a giao';

      div.innerHTML = `
        <div>
          <strong>${task.title}</strong>
          <div style="font-size: 11px; opacity:0.8; margin-top:3px;">${task.desc || 'KhÃ´ng cÃ³ mÃ´ táº£'}</div>
          <div style="font-size: 11px; color: var(--color-primary); margin-top:3px;"><i class="fa-solid fa-user-gear"></i> Phá»¥ trÃ¡ch: <strong>${assigneeName}</strong></div>
        </div>
        <div style="display:flex; align-items:center; gap:8px;">
          ${completeButton}
          <span class="badge ${statusColors[task.status] || ''}" style="font-size:9.5px;">${statusLabels[task.status] || task.status}</span>
          <span style="font-size: 10.5px; color: var(--text-muted);"><i class="fa-solid fa-calendar-day"></i> ${task.deadline || 'Háº¡n: -'}</span>
        </div>
      `;
      div.onclick = (e) => {
        // Prevent event bubbling so it doesn't try to open the task details while modal switching
        e.stopPropagation();
        if (typeof navigateToView === 'function') { navigateToView('tasks-projects'); } else { document.getElementById('view-project-dedicated').style.display = 'none'; }
        if (typeof openOpsTaskDetail === 'function') openOpsTaskDetail(task.id);
      };
      tasksContainer.appendChild(div);
    });
  }

  // Render docs
  const docsContainer = document.getElementById('dedicated-project-docs-list');
  docsContainer.innerHTML = '';
  if (!p.documents || p.documents.length === 0) {
    docsContainer.innerHTML = `<span class="text-muted" style="font-size: 12px; font-style: italic; text-align: center; padding: 15px 0; width: 100%;">ChÆ°a ghim tÃ i liá»‡u hoáº·c liÃªn káº¿t nÃ o.</span>`;
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
            <i class="fa-solid fa-square-share-nodes"></i> Má»Ÿ link
          </a>
          <button class="btn btn-xs btn-link text-rose" onclick="handleDeleteDedicatedProjectDoc(${idx})" style="padding:0; border:none; background:none; font-size: 11px;"><i class="fa-solid fa-trash-can"></i> XÃ³a</button>
        </div>
      `;
      docsContainer.appendChild(div);
    });
  }

  // Render discussion
  renderDedicatedProjectDiscussion(p);

  if (typeof navigateToView === 'function') { navigateToView('project-dedicated'); } else { document.getElementById('view-project-dedicated').style.display = 'flex'; }
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
    showToast('ÄÃ£ Ä‘Ã¡nh dáº¥u hoÃ n thÃ nh cÃ´ng viá»‡c!', 'success');
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
    container.innerHTML = `<span class="text-muted" style="font-size: 11px; font-style: italic;">ChÆ°a cÃ³ trao Ä‘á»•i nÃ o. HÃ£y báº¯t Ä‘áº§u cuá»™c há»™i thoáº¡i!</span>`;
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
      if (typeof navigateToView === 'function') { navigateToView('tasks-projects'); } else { document.getElementById('view-project-dedicated').style.display = 'none'; }
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
        const user = AppState.users.find(u => u.id === AppState.currentUserId) || { name: 'NhÃ¢n sá»±' };
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
        showToast('ÄÃ£ lÆ°u thÃ´ng tin dá»± Ã¡n!', 'success');
        
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
  
  showToast('ÄÃ£ hoÃ n thÃ nh cÃ´ng viá»‡c!', 'success');
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

window.archiveAssignedTask = function(taskId) {
  const task = AppState.single_tasks && AppState.single_tasks.find(t => t.id === taskId);
  if (task) {
    task.status = 'archived';
    saveState();
    if (typeof renderMyTasks === 'function') renderMyTasks();
    showToast('ÄÃ£ Ä‘Ã³ng cÃ´ng viá»‡c vÃ  lÆ°u trá»¯ thÃ nh cÃ´ng.', 'success');
  }
};

window.toggleManagerVerify = function(flowId, checked) {
  const flow = AppState.shipment_workflows && AppState.shipment_workflows.find(f => f.id === flowId);
  if (!flow) return;

  const currentUser = typeof getCurrentUser === 'function' ? getCurrentUser() : {};
  const isAdminOrManager = currentUser.role === 'admin' || currentUser.role === 'manager' || currentUser.username === 'phuongthao' || currentUser.username === 'nhuquynh';

  if (!isAdminOrManager) {
    showToast('Chá»‰ Quáº£n lÃ½ má»›i cÃ³ quyá»n duyá»‡t thá»i gian!', 'warning');
    renderOpsWorkflows();
    return;
  }

  flow.managerVerified = !!checked;
  saveState();
  renderOpsWorkflows();
  showToast(flow.managerVerified ? 'ÄÃ£ duyá»‡t thá»i gian pháº£n há»“i!' : 'ÄÃ£ há»§y duyá»‡t thá»i gian pháº£n há»“i!', 'success');
};














function renderOpsStats() {
  const container = document.getElementById('ops-stats-container-real');
  if (!container) return;

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  let cnGenerated = 0;
  let cnSuccess = 0;
  let cnProfit = 0;
  let totalOpsAdded = 0;

  if (AppState.shipment_workflows) {
    AppState.shipment_workflows.forEach(w => {
      const createdDate = new Date(w.createdTime || (w.history && w.history[0] ? w.history[0].substring(0, 10) : new Date()));
      const isThisMonth = createdDate.getFullYear() === currentYear && createdDate.getMonth() === currentMonth;
      const isChinhNgach = (w.serviceType && w.serviceType.toLowerCase() === 'chÃ­nh ngáº¡ch');

      if (isThisMonth) {
        if (isChinhNgach) {
          cnGenerated++;
          cnProfit += (parseFloat(w.profit) || (parseFloat(w.revenue) - parseFloat(w.valTotal)) || 0);
        }
        totalOpsAdded++;
      }
      if (isChinhNgach && w.stage >= 4 && w.stage !== 12 && isThisMonth) {
        cnSuccess++;
      }
    });
  }

  container.innerHTML = `
    <div class="dashboard-grid grid-1-4">
      <div class="stat-card" style="cursor: pointer;" onclick="if(window.showStatsModal) window.showStatsModal('cn_generated')">
        <div class="stat-icon bg-blue"><i class="fa-solid fa-file-invoice"></i></div>
        <div class="stat-data">
          <span class="stat-label">LÃ´ chÃ­nh ngáº¡ch phÃ¡t sinh</span>
          <h3>${cnGenerated}</h3>
          <span class="stat-trend trend-up">ThÃ¡ng ${currentMonth + 1}/${currentYear}</span>
        </div>
      </div>
      <div class="stat-card" style="cursor: pointer;" onclick="if(window.showStatsModal) window.showStatsModal('cn_success')">
        <div class="stat-icon bg-green"><i class="fa-solid fa-check-double"></i></div>
        <div class="stat-data">
          <span class="stat-label">LÃ´ chÃ­nh ngáº¡ch chá»‘t Ä‘Æ°á»£c</span>
          <h3>${cnSuccess}</h3>
          <span class="stat-trend trend-up">Tá»· lá»‡: ${cnGenerated > 0 ? Math.round((cnSuccess/cnGenerated)*100) : 0}%</span>
        </div>
      </div>
      <div class="stat-card" style="cursor: pointer;" onclick="if(window.showStatsModal) window.showStatsModal('cn_generated')">
        <div class="stat-icon bg-gold"><i class="fa-solid fa-sack-dollar"></i></div>
        <div class="stat-data">
          <span class="stat-label">Lá»£i nhuáº­n chÃ­nh ngáº¡ch</span>
          <h3>${cnProfit.toLocaleString()} Ä‘</h3>
          <span class="stat-trend trend-up">ÄÆ¡n hÃ ng CN (ThÃ¡ng)</span>
        </div>
      </div>
      <div class="stat-card" style="cursor: pointer;" onclick="if(window.showStatsModal) window.showStatsModal('ops_added')">
        <div class="stat-icon" style="background: #a855f7; color: white;"><i class="fa-solid fa-boxes-stacked"></i></div>
        <div class="stat-data">
          <span class="stat-label">LÃ´ hÃ ng add vÃ o CRM KhÃ¡ch cÅ©</span>
          <h3>${totalOpsAdded}</h3>
          <span class="stat-trend trend-up">Váº­n hÃ nh (ThÃ¡ng)</span>
        </div>
      </div>
    </div>
  `;
}

window.openStatDetail = function(type, id) {
  closeModal('modal-stats-details'); // Close the stats list popup
  if (type === 'workflow') {
    const flow = AppState.shipment_workflows.find(f => f.id === id);
    if (flow) {
      if (typeof openFlowDetailModal === 'function') openFlowDetailModal(id);
    }
  } else if (type === 'lead') {
    const lead = AppState.leads.find(l => l.id === id);
    if (lead) {
      if (typeof openLeadDetailModal === 'function') openLeadDetailModal(id);
    }
  }
};


// Sync Top Scrollbar in Ops Workflows
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    const topWrapper = document.getElementById('ops-top-scrollbar-wrapper');
    const topContent = document.getElementById('ops-top-scrollbar-content');
    const bottomWrapper = document.getElementById('ops-kanban-wrapper');
    const bottomBoard = document.getElementById('ops-workflows-kanban');
    
    if (topWrapper && topContent && bottomWrapper && bottomBoard) {
      const updateScrollbar = () => {
        topContent.style.width = bottomBoard.scrollWidth + 'px';
      };
      
      // We need to update whenever the ops workflows is rendered
      // We can override renderOpsWorkflows or just use MutationObserver
      const observer = new MutationObserver(updateScrollbar);
      observer.observe(bottomBoard, { childList: true, subtree: true, characterData: true });
      window.addEventListener('resize', updateScrollbar);
      setTimeout(updateScrollbar, 500);
      
      topWrapper.addEventListener('scroll', () => { bottomWrapper.scrollLeft = topWrapper.scrollLeft; });
      bottomWrapper.addEventListener('scroll', () => { topWrapper.scrollLeft = bottomWrapper.scrollLeft; });
    }
  }, 1000);
});

