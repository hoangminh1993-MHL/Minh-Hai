// ==================== FB INBOX SIMULATOR CONTROLLER ==================== //
document.addEventListener('DOMContentLoaded', () => {
  initInboxSimEvents();
});

function initInboxSimEvents() {
  const nameInput = document.getElementById('sim-client-name');
  const chatHeaderName = document.getElementById('chat-header-name');
  const chatInput = document.getElementById('chat-input');
  const btnSend = document.getElementById('btn-send-sim-msg');
  const messagesBox = document.getElementById('chat-messages-box');

  // Sync simulated name to chat header
  if (nameInput && chatHeaderName) {
    nameInput.addEventListener('input', (e) => {
      chatHeaderName.innerText = e.target.value.trim() || 'Nguyễn Văn Đại';
    });
  }

  // Sync avatar to chat header
  const avatarRadios = document.querySelectorAll('input[name="sim-avatar"]');
  avatarRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      // Remove active class from all options
      document.querySelectorAll('.avatar-option').forEach(opt => opt.classList.remove('active'));
      // Add active to parent label
      e.target.parentElement.classList.add('active');
      
      const icon = document.getElementById('chat-header-avatar-icon');
      icon.className = `fa-solid ${e.target.value}`;
    });
  });

  // Suggestion buttons click handler
  const btnQuickMsgs = document.querySelectorAll('.btn-quick-msg');
  btnQuickMsgs.forEach(btn => {
    btn.addEventListener('click', (e) => {
      chatInput.value = e.currentTarget.innerText;
      chatInput.focus();
    });
  });

  // Send message on click
  if (btnSend) {
    btnSend.addEventListener('click', handleSendSimMsg);
  }

  // Send message on Enter key (without Shift)
  if (chatInput) {
    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendSimMsg();
      }
    });
  }
}

function handleSendSimMsg() {
  const nameInput = document.getElementById('sim-client-name');
  const phoneInput = document.getElementById('sim-client-phone');
  const chatInput = document.getElementById('chat-input');
  const messagesBox = document.getElementById('chat-messages-box');
  
  const clientName = nameInput.value.trim() || 'Nguyễn Văn Đại';
  const clientPhone = phoneInput.value.trim() || '';
  const messageText = chatInput.value.trim();

  if (!messageText) {
    showToast('Vui lòng nhập tin nhắn giả lập!', 'warning');
    return;
  }

  // 1. Render Client message (Bubble received)
  appendChatBubble(messagesBox, messageText, 'received');
  
  // Clear input
  chatInput.value = '';

  // Scroll to bottom
  messagesBox.scrollTop = messagesBox.scrollHeight;

  // 2. Automate Lead creation in CRM first stage (Nhận thông tin)
  // Randomly assign to one of the active Staff or Manager reps
  const salesUsers = AppState.users.filter(u => u.role === 'staff' || u.role === 'manager');
  const randomSales = salesUsers[Math.floor(Math.random() * salesUsers.length)] || AppState.users[0];

  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;

  const newLead = {
    id: `lead-${Date.now()}`,
    name: clientName,
    phone: clientPhone,
    source: 'Fanpage',
    valRmb: 0,
    valVnd: 0,
    note: `[Nhắn tin từ Fanpage]: ${messageText}`,
    salesId: randomSales.id,
    stage: 'receive_info',
    failReason: null,
    date: dateStr
  };

  AppState.leads.push(newLead);
  saveState();

  // If CRM view is open, refresh it immediately
  const activeTab = document.querySelector('.nav-item.active').getAttribute('data-view');
  if (activeTab === 'crm') {
    renderCRMBoard();
  }

  // 3. Render System Response after 1.2s delay
  setTimeout(() => {
    const autoReplyText = `[Minh Hải Logistics] Dạ chào anh/chị ${clientName}! Hệ thống đã nhận được nhu cầu của mình: "${messageText.substring(0, 40)}${messageText.length > 40 ? '...' : ''}". Yêu cầu đã được chuyển cho nhân viên ${randomSales.name} phụ trách. Anh/chị đợi chút chúng em sẽ liên hệ tư vấn qua SĐT/Zalo ngay ạ!`;
    
    appendChatBubble(messagesBox, autoReplyText, 'sent');
    messagesBox.scrollTop = messagesBox.scrollHeight;

    // Trigger visual notification & badge
    addNotification('Khách hàng mới tự động 📩', `Khách hàng ${clientName} nhắn tin lên fanpage. Tự động thêm vào phễu CRM (Nhận thông tin). Giao cho: ${randomSales.name}.`, 'success');
    
    // Toggle pulse badge in sidebar if not on simulator tab
    if (activeTab !== 'inbox-simulator') {
      const simBadge = document.getElementById('sim-badge');
      if (simBadge) simBadge.style.display = 'inline-block';
    }
  }, 1200);
}

function appendChatBubble(container, text, type) {
  const bubble = document.createElement('div');
  bubble.className = `chat-bubble bubble-${type === 'received' ? 'received' : 'sent'}`;
  bubble.innerText = text;
  container.appendChild(bubble);
}

// When routing away from inbox simulator, hide the "New" badge
window.addEventListener('hashchange', () => {
  const view = window.location.hash.substring(1) || 'dashboard';
  if (view === 'inbox-simulator') {
    const simBadge = document.getElementById('sim-badge');
    if (simBadge) simBadge.style.display = 'none';
  }
});
