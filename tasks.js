// ==================== TASKS & WORKFLOW MANAGEMENT ==================== //
document.addEventListener('DOMContentLoaded', () => {
  initTasksEvents();
});

let currentWorkflowDept = 'sourcing'; // Default active tab in workflow editor
let activeDeptFilter = 'all';

function initTasksEvents() {
  // Giao việc mới button click
  const btnAddTask = document.getElementById('btn-add-task-modal');
  if (btnAddTask) {
    btnAddTask.addEventListener('click', () => {
      const user = getCurrentUser();
      if (user.role !== 'admin') {
        showToast('Chỉ Quản lý/Admin mới có quyền giao việc!', 'danger');
        return;
      }
      
      // Reset deadline to today + 3 days
      const today = new Date();
      today.setDate(today.getDate() + 3);
      document.getElementById('task-deadline').value = today.toISOString().split('T')[0];

      // Populate assignees dropdown based on default selected department
      const deptSelect = document.getElementById('task-dept');
      populateAssigneeDropdown(deptSelect.value);

      openModal('modal-add-task');
    });
  }

  // Dept select in add task modal change
  const modalDeptSelect = document.getElementById('task-dept');
  if (modalDeptSelect) {
    modalDeptSelect.addEventListener('change', (e) => {
      populateAssigneeDropdown(e.target.value);
    });
  }

  // Submit new task
  const formAddTask = document.getElementById('form-add-task');
  if (formAddTask) {
    formAddTask.addEventListener('submit', handleAddTaskSubmit);
  }

  // Department filters in tasks page
  const deptFilters = document.querySelectorAll('.btn-filter');
  deptFilters.forEach(btn => {
    btn.addEventListener('click', (e) => {
      deptFilters.forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
      activeDeptFilter = e.currentTarget.getAttribute('data-dept');
      renderTasksList();
    });
  });

  // Status filters in tasks page
  const statusFilter = document.getElementById('task-status-filter');
  if (statusFilter) {
    statusFilter.addEventListener('change', renderTasksList);
  }

  // Workflow Editor Tab switching
  const deptSelectors = document.querySelectorAll('.dept-select-item');
  deptSelectors.forEach(btn => {
    btn.addEventListener('click', (e) => {
      deptSelectors.forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
      currentWorkflowDept = e.currentTarget.getAttribute('data-dept');
      renderWorkflowSettings();
    });
  });

  // Add workflow step button
  const btnAddStep = document.getElementById('btn-add-workflow-step');
  if (btnAddStep) {
    btnAddStep.addEventListener('click', handleAddWorkflowStep);
  }

  // Reset workflow steps
  const btnResetWorkflow = document.getElementById('btn-reset-workflow');
  if (btnResetWorkflow) {
    btnResetWorkflow.addEventListener('click', handleResetWorkflow);
  }

  // Save workflow steps
  const btnSaveWorkflow = document.getElementById('btn-save-workflow');
  if (btnSaveWorkflow) {
    btnSaveWorkflow.addEventListener('click', handleSaveWorkflow);
  }
}

// Populate assignees dropdown inside task modal based on department
function populateAssigneeDropdown(dept) {
  const select = document.getElementById('task-assignee');
  if (!select) return;
  select.innerHTML = '';

  // Filter users by department
  const filteredUsers = AppState.users.filter(u => u.dept === dept);
  
  if (filteredUsers.length === 0) {
    // If no users in that department, show all
    AppState.users.forEach(u => {
      const opt = document.createElement('option');
      opt.value = u.id;
      opt.innerText = `${u.name} (${u.role.toUpperCase()})`;
      select.appendChild(opt);
    });
  } else {
    filteredUsers.forEach(u => {
      const opt = document.createElement('option');
      opt.value = u.id;
      opt.innerText = u.name;
      select.appendChild(opt);
    });
  }
}

// ==================== RENDERING TASKS LIST ==================== //
function renderTasksList() {
  const tbody = document.getElementById('tasks-list-body');
  tbody.innerHTML = '';

  const user = getCurrentUser();
  const statusFilterVal = document.getElementById('task-status-filter').value;

  // Filter tasks
  const filteredTasks = AppState.tasks.filter(t => {
    // Dept filter
    const matchesDept = activeDeptFilter === 'all' || t.dept === activeDeptFilter;
    
    // Status filter
    const matchesStatus = statusFilterVal === 'all' || t.status === statusFilterVal;
    
    return matchesDept && matchesStatus;
  });

  // Task Action controls wrapper
  const actionWrapper = document.getElementById('task-actions-wrapper');
  if (user.role === 'admin') {
    actionWrapper.style.display = 'block';
  } else {
    actionWrapper.style.display = 'none';
  }

  if (filteredTasks.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8"><div class="empty-state"><i class="fa-solid fa-list-check empty-state-icon"></i><span>Không có công việc nào trùng khớp bộ lọc.</span></div></td></tr>`;
    return;
  }

  filteredTasks.forEach(task => {
    const tr = document.createElement('tr');
    
    // Dept badge
    const deptLabels = { sales: 'Sales & CSKH', sourcing: 'Sourcing', warehouse: 'Kho bãi', admin: 'Admin & Kế toán' };
    const deptClasses = { sales: 'badge-sales', sourcing: 'badge-sourcing', warehouse: 'badge-warehouse', admin: 'badge-admin' };
    const deptBadge = `<span class="role-badge ${deptClasses[task.dept]}">${deptLabels[task.dept]}</span>`;

    // Assignee name
    const assignee = AppState.users.find(u => u.id === task.assigneeId);
    const assigneeName = assignee ? assignee.name : 'Chưa giao';

    // Creator name
    const creator = AppState.users.find(u => u.id === task.creatorId);
    const creatorName = creator ? creator.name : 'Hệ thống';

    // Workflow Select rendering
    const steps = AppState.workflows[task.dept] || [];
    const isAssignee = (user.id === task.assigneeId);
    const isManager = (user.role === 'admin');
    const isCompleted = (task.status === 'completed');
    const canEditProgress = (isAssignee || isManager) && !isCompleted;

    // Calculate current step index (last true index in stepsStatus)
    let currentStepIdx = 0;
    if (task.stepsStatus && task.stepsStatus.length > 0) {
      currentStepIdx = task.stepsStatus.lastIndexOf(true);
      if (currentStepIdx === -1) currentStepIdx = 0;
    }

    let progressSelectorHtml = '';
    if (steps.length === 0) {
      progressSelectorHtml = `<span class="text-muted">Không cấu hình quy trình</span>`;
    } else {
      progressSelectorHtml = `
        <div class="task-workflow-badge">
          <select class="task-step-updater" data-id="${task.id}" ${canEditProgress ? '' : 'disabled'}>
            ${steps.map((st, idx) => `
              <option value="${idx}" ${idx === currentStepIdx ? 'selected' : ''}>
                ${idx + 1}/${steps.length}: ${st}
              </option>
            `).join('')}
          </select>
        </div>
      `;
    }

    // Status badge
    let statusBadge = '';
    if (task.status === 'pending') statusBadge = '<span class="badge bg-blue">Chưa làm</span>';
    else if (task.status === 'doing') statusBadge = '<span class="badge bg-orange">Đang làm</span>';
    else if (task.status === 'checking') statusBadge = '<span class="badge bg-purple">Chờ duyệt</span>';
    else if (task.status === 'completed') statusBadge = '<span class="badge bg-emerald"><i class="fa-solid fa-circle-check"></i> Đã duyệt</span>';

    // Deadline formatted
    const dateStr = task.deadline ? task.deadline : 'Không giới hạn';

    // Action buttons
    let actionButtons = '';
    if (isCompleted) {
      actionButtons = `<span class="text-muted"><i class="fa-solid fa-check-double text-emerald"></i> Xong</span>`;
    } else {
      if (task.status === 'checking') {
        if (user.role === 'admin') {
          actionButtons = `
            <button class="btn btn-xs btn-primary btn-approve-task" data-id="${task.id}">
              <i class="fa-solid fa-circle-check"></i> Duyệt thưởng
            </button>
          `;
        } else {
          actionButtons = `<span class="text-muted"><i class="fa-solid fa-hourglass-start"></i> Đang chờ duyệt</span>`;
        }
      } else {
        // Pending or Doing
        if (isAssignee) {
          actionButtons = `
            <button class="btn btn-xs btn-secondary btn-submit-task" data-id="${task.id}">
              <i class="fa-solid fa-share-from-square"></i> Nộp kết quả
            </button>
          `;
        } else if (user.role === 'admin') {
          actionButtons = `
            <button class="btn btn-xs btn-secondary btn-complete-direct" data-id="${task.id}">
              <i class="fa-solid fa-check"></i> Xong ngay
            </button>
          `;
        } else {
          actionButtons = `<span class="text-muted">Chỉ người nhận việc</span>`;
        }
      }
    }

    // Admin can delete any active task
    if (user.role === 'admin') {
      actionButtons += `
        <button class="btn btn-xs btn-outline btn-delete-task" data-id="${task.id}" style="margin-left: 6px;" title="Xóa công việc">
          <i class="fa-solid fa-trash"></i>
        </button>
      `;
    }

    tr.innerHTML = `
      <td>
        <div class="task-cell-title">
          <h4>${task.title}</h4>
          <p>${task.desc || 'Không có mô tả chi tiết.'} • Giao bởi: ${creatorName}</p>
        </div>
      </td>
      <td>${deptBadge}</td>
      <td>
        <div style="display:flex; align-items:center; gap:6px;">
          <i class="fa-solid ${assignee ? assignee.avatar : 'fa-user'}" style="color:var(--color-primary); font-size:12px;"></i>
          <span>${assigneeName}</span>
        </div>
      </td>
      <td>${progressSelectorHtml}</td>
      <td><span style="font-size:12px; font-weight:500;">${dateStr}</span></td>
      <td class="text-gold" style="font-weight:700;">+${task.points} <i class="fa-solid fa-hotdog"></i></td>
      <td>${statusBadge}</td>
      <td><div style="display:flex; align-items:center;">${actionButtons}</div></td>
    `;

    tbody.appendChild(tr);
  });

  // Wire Events on Dynamically Rendered Controls
  tbody.querySelectorAll('.task-step-updater').forEach(select => {
    select.addEventListener('change', handleStepUpdate);
  });

  tbody.querySelectorAll('.btn-submit-task').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      submitTaskForApproval(id);
    });
  });

  tbody.querySelectorAll('.btn-approve-task').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      approveTask(id);
    });
  });

  tbody.querySelectorAll('.btn-complete-direct').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      approveTask(id, true); // direct approve
    });
  });

  tbody.querySelectorAll('.btn-delete-task').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      deleteTask(id);
    });
  });
}

// ==================== TASK LOGICS ==================== //
function handleAddTaskSubmit(e) {
  e.preventDefault();

  const user = getCurrentUser();
  if (user.role !== 'admin') {
    showToast('Chỉ Admin mới có quyền giao việc!', 'danger');
    return;
  }

  const title = document.getElementById('task-title').value.trim();
  const dept = document.getElementById('task-dept').value;
  const assigneeId = document.getElementById('task-assignee').value;
  const points = parseInt(document.getElementById('task-sausage').value) || 20;
  const deadline = document.getElementById('task-deadline').value;
  const desc = document.getElementById('task-desc').value.trim();

  // Create initial steps status (all false except the first one is true by default)
  const steps = AppState.workflows[dept] || [];
  const stepsStatus = new Array(steps.length).fill(false);
  if (stepsStatus.length > 0) stepsStatus[0] = true;

  const newTask = {
    id: `task-${Date.now()}`,
    title,
    dept,
    assigneeId,
    stepsStatus,
    deadline,
    points,
    status: 'pending',
    desc,
    creatorId: user.id
  };

  AppState.tasks.push(newTask);
  saveState();
  closeModal('modal-add-task');
  document.getElementById('form-add-task').reset();

  renderTasksList();
  
  const assignee = AppState.users.find(u => u.id === assigneeId);
  addNotification('Giao việc mới 📋', `Bạn đã giao việc "${title}" cho ${assignee ? assignee.name : 'nhân viên'}.`, 'success');
}

function handleStepUpdate(e) {
  const taskId = e.target.getAttribute('data-id');
  const stepIdx = parseInt(e.target.value);
  const task = AppState.tasks.find(t => t.id === taskId);
  if (!task) return;

  const steps = AppState.workflows[task.dept] || [];
  
  // Update task step booleans
  task.stepsStatus = steps.map((_, idx) => idx <= stepIdx);
  task.status = 'doing'; // Set status to doing since they are working on it

  // If moved to the last step, suggest submitting
  if (stepIdx === steps.length - 1) {
    if (confirm(`Bạn đã chọn bước cuối cùng: "${steps[stepIdx]}". Bạn có muốn NỘP KẾT QUẢ công việc này lên Quản lý để duyệt nhận ${task.points} Xúc xích không?`)) {
      task.status = 'checking';
      addNotification('Chờ duyệt công việc', `${getCurrentUser().name} đã hoàn thành và nộp công việc: ${task.title}`, 'info');
    }
  }

  saveState();
  renderTasksList();
  showToast(`Đã cập nhật tiến độ công việc đến bước: ${steps[stepIdx]}`, 'success');
}

function submitTaskForApproval(taskId) {
  const task = AppState.tasks.find(t => t.id === taskId);
  if (!task) return;

  const steps = AppState.workflows[task.dept] || [];
  
  // Set all steps to true
  task.stepsStatus = new Array(steps.length).fill(true);
  task.status = 'checking';
  
  saveState();
  renderTasksList();
  
  addNotification('Đăng ký kiểm duyệt', `${getCurrentUser().name} đã nộp kết quả công việc "${task.title}".`, 'info');
}

function approveTask(taskId, direct = false) {
  const task = AppState.tasks.find(t => t.id === taskId);
  if (!task) return;

  const user = getCurrentUser();
  if (user.role !== 'admin') {
    showToast('Chỉ Quản lý/Admin mới có quyền phê duyệt công việc!', 'danger');
    return;
  }

  task.status = 'completed';
  
  // Set all steps to true if direct completion
  const steps = AppState.workflows[task.dept] || [];
  task.stepsStatus = new Array(steps.length).fill(true);

  // Reward points to assignee
  const assignee = AppState.users.find(u => u.id === task.assigneeId);
  if (assignee) {
    assignee.points += task.points;
    
    // Add sausage log
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    
    AppState.sausageLogs.push({
      id: `log-${Date.now()}`,
      userId: assignee.id,
      points: task.points,
      type: 'task',
      text: `Hoàn thành công việc: ${task.title} (+${task.points} Xúc xích)`,
      date: dateStr
    });
  }

  saveState();
  renderTasksList();
  renderCurrentUser(); // Refresh points display in header if admin's points changed (e.g. if task was self-assigned)
  
  addNotification('Phê duyệt công việc', `Đã duyệt hoàn thành công việc "${task.title}". ${assignee ? assignee.name : ''} nhận được +${task.points} Xúc xích thưởng.`, 'success');
}

function deleteTask(taskId) {
  const task = AppState.tasks.find(t => t.id === taskId);
  if (!task) return;

  if (confirm(`Bạn có chắc muốn xóa công việc: "${task.title}"?`)) {
    AppState.tasks = AppState.tasks.filter(t => t.id !== taskId);
    saveState();
    renderTasksList();
    showToast('Đã xóa công việc.', 'warning');
  }
}

// ==================== WORKFLOWS CONFIG LOGIC ==================== //
function renderWorkflowSettings() {
  const deptLabels = { sales: 'Sales & CSKH', sourcing: 'Sourcing (Đặt hàng)', warehouse: 'Kho hàng', admin: 'Admin & Kế toán' };
  
  // Highlight tab
  document.querySelectorAll('.dept-select-item').forEach(btn => {
    if (btn.getAttribute('data-dept') === currentWorkflowDept) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Update counts in list labels
  Object.keys(deptLabels).forEach(d => {
    const span = document.getElementById(`steps-count-${d}`);
    if (span) {
      if (d === 'sales') {
        span.innerText = 'Bản mặc định CRM (7 bước)';
      } else {
        const steps = AppState.workflows[d] || [];
        span.innerText = `${steps.length} bước`;
      }
    }
  });

  // Title name
  document.getElementById('current-workflow-dept-name').innerText = `Quy trình: ${deptLabels[currentWorkflowDept]}`;

  // Permission lock indicator
  const user = getCurrentUser();
  const notice = document.getElementById('workflow-restricted-notice');
  const addArea = document.getElementById('workflow-add-step-area');
  const saveArea = document.getElementById('workflow-save-area');

  const isEditable = (user.role === 'admin' && currentWorkflowDept !== 'sales'); // Sales (CRM) is hardcoded to 7 columns

  if (user.role !== 'admin') {
    notice.style.display = 'block';
    notice.innerHTML = `<i class="fa-solid fa-lock"></i> Chỉ Admin mới có quyền sửa quy trình này`;
    addArea.style.display = 'none';
    saveArea.style.display = 'none';
  } else if (currentWorkflowDept === 'sales') {
    notice.style.display = 'block';
    notice.innerHTML = `<i class="fa-solid fa-lock"></i> Mặc định 7 cột của bảng CRM khách hàng`;
    addArea.style.display = 'none';
    saveArea.style.display = 'none';
  } else {
    notice.style.display = 'none';
    addArea.style.display = 'flex';
    saveArea.style.display = 'flex';
  }

  // Render steps list builder
  const list = document.getElementById('workflow-steps-list');
  list.innerHTML = '';

  const steps = AppState.workflows[currentWorkflowDept] || [];

  if (steps.length === 0) {
    list.innerHTML = `<div class="empty-state" style="padding: 20px; text-align:center; color: var(--text-muted);">Không có quy trình nào được thiết lập. Công việc sẽ không có tiến độ từng bước.</div>`;
    return;
  }

  steps.forEach((st, idx) => {
    const div = document.createElement('div');
    div.className = 'step-edit-item';
    
    // Enable dragging for sorting if admin
    if (isEditable) {
      div.setAttribute('draggable', 'true');
      div.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', idx);
        div.style.opacity = '0.5';
      });
      div.addEventListener('dragend', () => {
        div.style.opacity = '1';
      });
      div.addEventListener('dragover', (e) => {
        e.preventDefault();
      });
      div.addEventListener('drop', (e) => {
        e.preventDefault();
        const fromIdx = parseInt(e.dataTransfer.getData('text/plain'));
        if (isNaN(fromIdx) || fromIdx === idx) return;
        
        // Reorder
        const reordered = [...steps];
        const [removed] = reordered.splice(fromIdx, 1);
        reordered.splice(idx, 0, removed);
        
        AppState.workflows[currentWorkflowDept] = reordered;
        renderWorkflowSettings();
      });
    }

    const deleteBtn = isEditable 
      ? `<button class="btn-delete-step" data-index="${idx}" title="Xóa bước này"><i class="fa-solid fa-trash-can"></i></button>`
      : '';

    div.innerHTML = `
      <span class="step-num">${idx + 1}</span>
      <input type="text" class="step-name-input" value="${st}" ${isEditable ? '' : 'disabled'}>
      ${deleteBtn}
    `;

    // Input changes
    div.querySelector('.step-name-input').addEventListener('change', (e) => {
      AppState.workflows[currentWorkflowDept][idx] = e.target.value.trim();
    });

    // Delete handler
    if (isEditable) {
      div.querySelector('.btn-delete-step').addEventListener('click', () => {
        AppState.workflows[currentWorkflowDept].splice(idx, 1);
        renderWorkflowSettings();
      });
    }

    list.appendChild(div);
  });
}

function handleAddWorkflowStep() {
  const input = document.getElementById('new-step-name');
  const name = input.value.trim();
  if (!name) return;

  if (!AppState.workflows[currentWorkflowDept]) {
    AppState.workflows[currentWorkflowDept] = [];
  }

  AppState.workflows[currentWorkflowDept].push(name);
  input.value = '';
  renderWorkflowSettings();
  showToast(`Đã thêm bước quy trình: ${name}`, 'info');
}

function handleResetWorkflow() {
  if (confirm('Bạn có muốn khôi phục quy trình của phòng ban này về trạng thái mặc định ban đầu không?')) {
    AppState.workflows[currentWorkflowDept] = [...DEFAULT_WORKFLOWS[currentWorkflowDept]];
    saveState();
    renderWorkflowSettings();
    showToast('Đã khôi phục quy trình mặc định.', 'info');
    addNotification('Cấu hình Quy trình', `Đã khôi phục quy trình làm việc mặc định cho bộ phận: ${currentWorkflowDept.toUpperCase()}`, 'info');
  }
}

function handleSaveWorkflow() {
  saveState();
  renderWorkflowSettings();
  showToast('Đã lưu cấu hình quy trình phòng ban thành công!', 'success');
  addNotification('Cấu hình Quy trình', `Đã lưu thay đổi quy trình làm việc của bộ phận: ${currentWorkflowDept.toUpperCase()}`, 'success');
}
