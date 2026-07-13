// ==================== MINI GAMES & giải TRÍ CONTROLLER ==================== //
document.addEventListener('DOMContentLoaded', () => {
  initMiniGames();
});

// AppState references & initializations
function initMiniGames() {
  // Ensure AppState arrays exist
  if (!AppState.lottery_bets) AppState.lottery_bets = [];
  if (!AppState.custom_bets) AppState.custom_bets = [];

  // Register hash navigation handler or menu items
  const miniGamesNav = document.querySelector('.nav-item[data-view="mini-games"]');
  if (miniGamesNav) {
    miniGamesNav.addEventListener('click', () => {
      // Force refresh of the view state
      renderMiniGames();
    });
  }

  // Bind tab buttons switching
  document.querySelectorAll('.game-tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const tabId = e.currentTarget.getAttribute('data-game-tab');
      switchGameTab(tabId);
    });
  });

  // Init games
  initCaroGame();
  initLotteryGame();
  initBetPoolGame();
}

function switchGameTab(tabId) {
  document.querySelectorAll('.game-tab-btn').forEach(btn => {
    if (btn.getAttribute('data-game-tab') === tabId) {
      btn.classList.add('active');
      btn.style.color = 'var(--color-primary)';
      btn.style.borderBottom = '3px solid var(--color-primary)';
    } else {
      btn.classList.remove('active');
      btn.style.color = 'var(--text-muted)';
      btn.style.borderBottom = 'none';
    }
  });

  document.querySelectorAll('.game-tab-content').forEach(content => {
    if (content.id === `game-tab-content-${tabId}`) {
      content.style.display = 'block';
    } else {
      content.style.display = 'none';
    }
  });

  // Render contents
  renderMiniGames();
}

function renderMiniGames() {
  const user = getCurrentUser();
  if (!user) return;

  // Render User Point Banner
  const usernameLabel = document.getElementById('game-username-label');
  const pointsVal = document.getElementById('game-points-val');
  if (usernameLabel) usernameLabel.innerText = `Tài khoản: ${user.name} (${user.role === 'admin' ? 'Admin' : 'Nhân viên'})`;
  if (pointsVal) pointsVal.innerText = user.points;

  // Trigger sub-renderers
  renderCaroSetup();
  renderLotteryMyTickets();
  renderLotteryResults();
  renderBetPools();
}


// ==========================================
// GAME 1: CỜ CARO
// ==========================================
let caroBoard = Array(10).fill(null).map(() => Array(10).fill(null));
let caroGameActive = false;
let caroTurn = 'X'; // Player always X (AI is O), PvP Player 1 is X, Player 2 is O
let caroMode = 'vs-ai'; // 'vs-ai' or 'vs-pvp'
let caroBet = 10;
let caroOpponentId = null;

let onlineCaroGameId = null;

function initCaroGame() {
  const modeSelect = document.getElementById('caro-mode-select');
  if (modeSelect) {
    modeSelect.addEventListener('change', (e) => {
      caroMode = e.target.value;
      const opponentGroup = document.getElementById('caro-opponent-group');
      const aiDiffGroup = document.getElementById('caro-ai-diff-group');
      const onlineGroup = document.getElementById('caro-online-lobbies-group');
      const startBtn = document.getElementById('btn-start-caro-game');

      if (caroMode === 'vs-pvp') {
        opponentGroup.style.display = 'block';
        aiDiffGroup.style.display = 'none';
        onlineGroup.style.display = 'none';
        startBtn.style.display = 'block';
        populateCaroOpponents();
      } else if (caroMode === 'vs-online') {
        opponentGroup.style.display = 'none';
        aiDiffGroup.style.display = 'none';
        onlineGroup.style.display = 'block';
        startBtn.style.display = 'none';
        renderOnlineCaroLobbies();
      } else {
        opponentGroup.style.display = 'none';
        aiDiffGroup.style.display = 'block';
        onlineGroup.style.display = 'none';
        startBtn.style.display = 'block';
      }
    });
  }

  const createLobbyBtn = document.getElementById('btn-create-caro-online-lobby');
  if (createLobbyBtn) {
    createLobbyBtn.addEventListener('click', createCaroOnlineLobby);
  }

  const startBtn = document.getElementById('btn-start-caro-game');
  if (startBtn) {
    startBtn.addEventListener('click', startCaroGame);
  }

  const resetBtn = document.getElementById('btn-reset-caro-game');
  if (resetBtn) {
    resetBtn.addEventListener('click', resetCaroGame);
  }

  // Draw initial blank board
  drawCaroBoard();
}

function populateCaroOpponents() {
  const select = document.getElementById('caro-opponent-select');
  if (!select) return;
  select.innerHTML = '';
  
  const currentUser = getCurrentUser();
  AppState.users.forEach(u => {
    if (u.id !== currentUser.id) {
      const opt = document.createElement('option');
      opt.value = u.id;
      opt.innerText = `${u.name} (${u.points} xúc xích)`;
      select.appendChild(opt);
    }
  });
}

function renderCaroSetup() {
  if (caroMode === 'vs-pvp') {
    populateCaroOpponents();
  } else if (caroMode === 'vs-online') {
    renderOnlineCaroLobbies();
  }
}

function startCaroGame() {
  const user = getCurrentUser();
  caroBet = parseInt(document.getElementById('caro-bet-amount').value) || 10;

  if (caroBet <= 0) {
    showToast("Số tiền cược phải lớn hơn 0!", "warning");
    return;
  }

  if (user.role !== 'admin' && user.points < caroBet) {
    showToast("Bạn không đủ điểm Xúc xích để cược!", "warning");
    return;
  }

  if (caroMode === 'vs-pvp') {
    const oppSelect = document.getElementById('caro-opponent-select');
    caroOpponentId = oppSelect.value;
    const opponent = AppState.users.find(u => u.id === caroOpponentId);

    if (!opponent) {
      showToast("Vui lòng chọn đối thủ để đấu PvP!", "warning");
      return;
    }

    if (opponent.points < caroBet) {
      showToast(`Đối thủ ${opponent.name} không đủ điểm Xúc xích để cược!`, "warning");
      return;
    }
  }

  // Deduct points
  if (user.role !== 'admin') {
    user.points -= caroBet;
    pushSausageLog(user.id, -caroBet, `Bắt đầu cược đấu Caro (${caroMode === 'vs-ai' ? 'đấu với Máy' : 'đấu PvP'})`);
  } else {
    pushSausageLog(user.id, 0, `Bắt đầu cược đấu Caro (Admin miễn phí)`);
  }
  
  if (caroMode === 'vs-pvp') {
    const opponent = AppState.users.find(u => u.id === caroOpponentId);
    opponent.points -= caroBet;
    pushSausageLog(opponent.id, -caroBet, `Chấp nhận cược đấu Caro PvP với ${user.name}`);
  }

  saveState();

  // Reset board
  caroBoard = Array(10).fill(null).map(() => Array(10).fill(null));
  caroGameActive = true;
  caroTurn = 'X';

  const gridContainer = document.getElementById('caro-grid-container');
  gridContainer.style.pointerEvents = 'auto';
  gridContainer.style.opacity = '1';

  document.getElementById('btn-start-caro-game').style.display = 'none';
  document.getElementById('btn-reset-caro-game').style.display = 'block';

  updateCaroStatusText();
  drawCaroBoard();
  renderMiniGames(); // Refresh points banner
}

function resetCaroGame() {
  // Cancel active game and refund (if not finished)
  if (caroGameActive) {
    const user = getCurrentUser();
    if (user.role !== 'admin') {
      user.points += caroBet;
      pushSausageLog(user.id, caroBet, `Hoàn trả cược Caro (Huỷ trận đấu)`);
    }

    if (caroMode === 'vs-pvp') {
      const opponent = AppState.users.find(u => u.id === caroOpponentId);
      if (opponent) {
        opponent.points += caroBet;
        pushSausageLog(opponent.id, caroBet, `Hoàn trả cược Caro (Huỷ trận đấu)`);
      }
    }
    saveState();
  }

  caroGameActive = false;
  caroBoard = Array(10).fill(null).map(() => Array(10).fill(null));
  
  const gridContainer = document.getElementById('caro-grid-container');
  gridContainer.style.pointerEvents = 'none';
  gridContainer.style.opacity = '0.5';

  document.getElementById('btn-start-caro-game').style.display = 'block';
  document.getElementById('btn-reset-caro-game').style.display = 'none';
  document.getElementById('caro-game-status').innerText = 'Nhấn "BẮT ĐẦU VÁN ĐẤU" để khai cuộc';

  drawCaroBoard();
  renderMiniGames();
}

function drawCaroBoard() {
  const container = document.getElementById('caro-grid-container');
  if (!container) return;
  container.innerHTML = '';

  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 10; c++) {
      const cell = document.createElement('div');
      cell.style.cssText = 'width:36px; height:36px; background:#1f2937; display:flex; align-items:center; justify-content:center; font-size:18px; font-weight:bold; cursor:pointer; user-select:none; border:1px solid #374151;';
      
      const val = caroBoard[r][c];
      if (val === 'X') {
        cell.innerHTML = '<span style="color:#ef4444;">X</span>';
      } else if (val === 'O') {
        cell.innerHTML = '<span style="color:#3b82f6;">O</span>';
      }

      cell.onclick = () => handleCaroCellClick(r, c);
      container.appendChild(cell);
    }
  }
}

function handleCaroCellClick(r, c) {
  if (!caroGameActive || caroBoard[r][c] !== null) return;

  if (caroMode === 'vs-online') {
    const user = getCurrentUser();
    if (!AppState.active_caro_games) AppState.active_caro_games = [];
    const game = AppState.active_caro_games.find(g => g.id === onlineCaroGameId);
    if (!game) return;

    const isPlayer1 = game.player1Id === user.id;
    const isPlayer2 = game.player2Id === user.id;

    if (isPlayer1 && caroTurn !== 'X') {
      showToast("Chờ đối thủ đi nước tiếp theo!", "warning");
      return;
    }
    if (isPlayer2 && caroTurn !== 'O') {
      showToast("Chờ đối thủ đi nước tiếp theo!", "warning");
      return;
    }
    if (!isPlayer1 && !isPlayer2) {
      showToast("Bạn chỉ là người xem!", "warning");
      return;
    }

    // Place move
    game.board[r][c] = caroTurn;

    if (checkCaroWin(r, c, caroTurn)) {
      game.status = 'completed';
      game.winner = caroTurn;

      if (game.winner === 'X') {
        const p1 = AppState.users.find(u => u.id === game.player1Id);
        if (p1 && p1.role !== 'admin') {
          p1.points += game.bet * 2;
          pushSausageLog(p1.id, game.bet * 2, `Thắng đấu Caro Online với ${game.player2Name}: +${game.bet * 2}đ`);
        }
      } else {
        const p2 = AppState.users.find(u => u.id === game.player2Id);
        if (p2 && p2.role !== 'admin') {
          p2.points += game.bet * 2;
          pushSausageLog(p2.id, game.bet * 2, `Thắng đấu Caro Online với ${game.player1Name}: +${game.bet * 2}đ`);
        }
      }

      saveState();

      caroBoard = game.board;
      drawCaroBoard();
      endOnlineGameLocal(game);
      onlineCaroGameId = null;
      if (onlineCaroInterval) clearInterval(onlineCaroInterval);
      return;
    }

    if (isCaroBoardFull()) {
      game.status = 'completed';
      game.winner = 'draw';

      const p1 = AppState.users.find(u => u.id === game.player1Id);
      if (p1 && p1.role !== 'admin') p1.points += game.bet;
      const p2 = AppState.users.find(u => u.id === game.player2Id);
      if (p2 && p2.role !== 'admin') p2.points += game.bet;

      saveState();

      caroBoard = game.board;
      drawCaroBoard();
      endOnlineGameLocal(game);
      onlineCaroGameId = null;
      if (onlineCaroInterval) clearInterval(onlineCaroInterval);
      return;
    }

    game.turn = game.turn === 'X' ? 'O' : 'X';
    saveState();

    caroBoard = game.board;
    caroTurn = game.turn;
    drawCaroBoard();
    updateCaroStatusText();
    return;
  }

  // Make move
  caroBoard[r][c] = caroTurn;
  drawCaroBoard();

  if (checkCaroWin(r, c, caroTurn)) {
    endCaroGame(caroTurn);
    return;
  }

  if (isCaroBoardFull()) {
    endCaroGame('draw');
    return;
  }

  if (caroMode === 'vs-ai') {
    caroTurn = 'O';
    updateCaroStatusText();
    // Prevent clicking while AI plays
    document.getElementById('caro-grid-container').style.pointerEvents = 'none';
    setTimeout(makeAIMove, 500);
  } else {
    // PvP switch turn
    caroTurn = caroTurn === 'X' ? 'O' : 'X';
    updateCaroStatusText();
  }
}

function updateCaroStatusText() {
  const status = document.getElementById('caro-game-status');
  if (!status) return;

  if (caroMode === 'vs-ai') {
    status.innerText = caroTurn === 'X' ? 'Đến lượt bạn (X)' : 'Máy đang suy nghĩ... (O)';
  } else if (caroMode === 'vs-online') {
    if (!AppState.active_caro_games) AppState.active_caro_games = [];
    const game = AppState.active_caro_games.find(g => g.id === onlineCaroGameId);
    if (!game) {
      status.innerText = 'Nhấn "TẠO BÀN ĐẤU MỚI" hoặc vào chơi bàn đấu đang chờ';
      return;
    }

    if (game.status === 'waiting') {
      status.innerHTML = `<span style="color:#f59e0b;"><i class="fa-solid fa-spinner fa-spin"></i> Đang chờ đối thủ vào bàn...</span>`;
    } else {
      const turnName = game.turn === 'X' ? game.player1Name : game.player2Name;
      status.innerText = `Đang chơi: ${game.player1Name} (X) vs ${game.player2Name} (O) | Lượt: ${turnName} (${game.turn})`;
    }
  } else {
    const p1 = getCurrentUser().name;
    const oppName = AppState.users.find(u => u.id === caroOpponentId)?.name || 'Đối thủ';
    status.innerText = caroTurn === 'X' ? `Đến lượt ${p1} (X)` : `Đến lượt ${oppName} (O)`;
  }
}

function makeAIMove() {
  if (!caroGameActive) return;

  const diff = document.getElementById('caro-ai-diff').value;
  let move = null;

  if (diff === 'medium') {
    move = getSmartAIMove();
  } else {
    move = getRandomAIMove();
  }

  if (move) {
    caroBoard[move.r][move.c] = 'O';
    drawCaroBoard();

    if (checkCaroWin(move.r, move.c, 'O')) {
      endCaroGame('O');
      return;
    }

    if (isCaroBoardFull()) {
      endCaroGame('draw');
      return;
    }
  }

  caroTurn = 'X';
  document.getElementById('caro-grid-container').style.pointerEvents = 'auto';
  updateCaroStatusText();
}

function getRandomAIMove() {
  const empties = [];
  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 10; c++) {
      if (caroBoard[r][c] === null) empties.push({ r, c });
    }
  }
  if (empties.length === 0) return null;
  return empties[Math.floor(Math.random() * empties.length)];
}

function getSmartAIMove() {
  // Simple heuristic Caro AI:
  // Find cell that gives O the max score or blocks X's max score
  let bestScore = -1;
  let bestMove = null;

  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 10; c++) {
      if (caroBoard[r][c] === null) {
        // Evaluate O (attack score)
        const attack = evaluateCellScore(r, c, 'O');
        // Evaluate X (defense score / block)
        const defense = evaluateCellScore(r, c, 'X');
        
        // Weight defense slightly less than attack
        const total = Math.max(attack * 1.1, defense);
        
        if (total > bestScore) {
          bestScore = total;
          bestMove = { r, c };
        }
      }
    }
  }
  return bestMove || getRandomAIMove();
}

function evaluateCellScore(r, c, player) {
  // Temporarily place cờ
  caroBoard[r][c] = player;
  
  // Directions: Horizontal, Vertical, Diag1, Diag2
  const directions = [
    { dr: 0, dc: 1 },
    { dr: 1, dc: 0 },
    { dr: 1, dc: 1 },
    { dr: 1, dc: -1 }
  ];

  let maxStreak = 0;
  directions.forEach(({ dr, dc }) => {
    let count = 1;
    // Positive dir
    let nr = r + dr, nc = c + dc;
    while (nr >= 0 && nr < 10 && nc >= 0 && nc < 10 && caroBoard[nr][nc] === player) {
      count++;
      nr += dr;
      nc += dc;
    }
    // Negative dir
    nr = r - dr, nc = c - dc;
    while (nr >= 0 && nr < 10 && nc >= 0 && nc < 10 && caroBoard[nr][nc] === player) {
      count++;
      nr -= dr;
      nc -= dc;
    }
    maxStreak = Math.max(maxStreak, count);
  });

  // Undo
  caroBoard[r][c] = null;
  return maxStreak; // simple score based on streak length
}

function checkCaroWin(r, c, player) {
  const directions = [
    { dr: 0, dc: 1 },
    { dr: 1, dc: 0 },
    { dr: 1, dc: 1 },
    { dr: 1, dc: -1 }
  ];

  for (let i = 0; i < directions.length; i++) {
    const { dr, dc } = directions[i];
    let count = 1;
    
    // Positive dir
    let nr = r + dr, nc = c + dc;
    while (nr >= 0 && nr < 10 && nc >= 0 && nc < 10 && caroBoard[nr][nc] === player) {
      count++;
      nr += dr;
      nc += dc;
    }
    // Negative dir
    nr = r - dr, nc = c - dc;
    while (nr >= 0 && nr < 10 && nc >= 0 && nc < 10 && caroBoard[nr][nc] === player) {
      count++;
      nr -= dr;
      nc -= dc;
    }

    if (count >= 5) return true;
  }
  return false;
}

function isCaroBoardFull() {
  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 10; c++) {
      if (caroBoard[r][c] === null) return false;
    }
  }
  return true;
}

function endCaroGame(winner) {
  caroGameActive = false;
  document.getElementById('caro-grid-container').style.pointerEvents = 'none';
  
  const status = document.getElementById('caro-game-status');
  document.getElementById('btn-start-caro-game').style.display = 'block';
  document.getElementById('btn-reset-caro-game').style.display = 'none';

  const user = getCurrentUser();

  if (winner === 'draw') {
    status.innerHTML = '<span style="color:#eab308;">Hoà ván! Đã hoàn trả cược.</span>';
    // Refund
    if (user.role !== 'admin') {
      user.points += caroBet;
      pushSausageLog(user.id, caroBet, `Hoà cờ Caro: Hoàn trả cược`);
    } else {
      pushSausageLog(user.id, 0, `Hoà cờ Caro (Admin)`);
    }

    if (caroMode === 'vs-pvp') {
      const opponent = AppState.users.find(u => u.id === caroOpponentId);
      if (opponent) {
        opponent.points += caroBet;
        pushSausageLog(opponent.id, caroBet, `Hoà cờ Caro PvP: Hoàn trả cược`);
      }
    }
  } else if (caroMode === 'vs-ai') {
    if (winner === 'X') {
      status.innerHTML = `<span style="color:#22c55e;">CHIẾN THẮNG! Nhận +${caroBet * 2} xúc xích</span>`;
      if (user.role !== 'admin') {
        user.points += caroBet * 2;
        pushSausageLog(user.id, caroBet * 2, `Thắng máy Caro: +${caroBet * 2} xúc xích`);
      } else {
        pushSausageLog(user.id, 0, `Thắng máy Caro (Admin)`);
      }
    } else {
      status.innerHTML = `<span style="color:#ef4444;">THẤT BẠI! Mất cược -${caroBet} xúc xích</span>`;
    }
  } else {
    // PvP Mode
    const p1 = user;
    const p2 = AppState.users.find(u => u.id === caroOpponentId);

    if (winner === 'X') {
      status.innerHTML = `<span style="color:#22c55e;">${p1.name} CHIẾN THẮNG! Nhận +${caroBet * 2} xúc xích</span>`;
      if (p1.role !== 'admin') {
        p1.points += caroBet * 2;
        pushSausageLog(p1.id, caroBet * 2, `Thắng đấu Caro PvP với ${p2.name}: +${caroBet * 2} xúc xích`);
      } else {
        pushSausageLog(p1.id, 0, `Thắng đấu Caro PvP với ${p2.name} (Admin)`);
      }
    } else {
      status.innerHTML = `<span style="color:#22c55e;">${p2.name} CHIẾN THẮNG! Nhận +${caroBet * 2} xúc xích</span>`;
      if (p2.role !== 'admin') {
        p2.points += caroBet * 2;
        pushSausageLog(p2.id, caroBet * 2, `Thắng đấu Caro PvP với ${p1.name}: +${caroBet * 2} xúc xích`);
      } else {
        pushSausageLog(p2.id, 0, `Thắng đấu Caro PvP với ${p1.name} (Admin)`);
      }
    }
  }

  saveState();
  renderMiniGames();
}


// ==========================================
// GAME 2: XỔ SỐ KIẾN THIẾT 18H
// ==========================================
function initLotteryGame() {
  const typeSelect = document.getElementById('lottery-type-select');
  if (typeSelect) {
    typeSelect.addEventListener('change', updateLotteryCostText);
  }

  const submitBtn = document.getElementById('btn-submit-lottery-ticket');
  if (submitBtn) {
    submitBtn.addEventListener('click', submitLotteryTicket);
  }

  const quickDrawBtn = document.getElementById('btn-quick-draw-lottery');
  if (quickDrawBtn) {
    quickDrawBtn.addEventListener('click', testDrawLottery);
  }

  const dateSelect = document.getElementById('lottery-result-date-select');
  if (dateSelect) {
    dateSelect.addEventListener('change', renderLotteryResults);
  }

  updateLotteryCostText();
  initLotteryDatesDropdown();
}

function updateLotteryCostText() {
  const type = document.getElementById('lottery-type-select').value;
  const pointsInput = document.getElementById('lottery-points-input');
  const warning = document.getElementById('lottery-cost-warning');
  if (!pointsInput || !warning) return;

  const pts = parseInt(pointsInput.value) || 10;
  if (type === 'de') {
    warning.innerText = `Chi phí: ${pts} xúc xích. Thắng đề: nhận ${pts * 70} xúc xích (tỷ lệ 1 ăn 70).`;
  } else {
    // Bao Lô: Cost is 23 points per point bet.
    const totalCost = pts * 23;
    warning.innerText = `Chi phí bao lô: ${totalCost} xúc xích (23đ cược/1 điểm đề). Thắng bao lô nhận 80 xúc xích mỗi lần trùng.`;
  }
}

document.getElementById('lottery-points-input')?.addEventListener('input', updateLotteryCostText);

function initLotteryDatesDropdown() {
  const select = document.getElementById('lottery-result-date-select');
  if (!select) return;
  select.innerHTML = '';

  // Last 5 days
  const now = new Date();
  for (let i = 0; i < 5; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const opt = document.createElement('option');
    opt.value = dateStr;
    opt.innerText = i === 0 ? `Hôm nay (${dateStr})` : dateStr;
    select.appendChild(opt);
  }
}

function submitLotteryTicket() {
  const user = getCurrentUser();
  const numInput = document.getElementById('lottery-num-input');
  const pointsInput = document.getElementById('lottery-points-input');
  const typeSelect = document.getElementById('lottery-type-select');

  const numberVal = parseInt(numInput.value);
  const points = parseInt(pointsInput.value) || 10;
  const type = typeSelect.value;

  if (isNaN(numberVal) || numberVal < 0 || numberVal > 99) {
    showToast("Vui lòng chọn 2 chữ số từ 00 đến 99!", "warning");
    return;
  }

  if (points <= 0) {
    showToast("Điểm cược phải lớn hơn 0!", "warning");
    return;
  }

  const cost = type === 'de' ? points : points * 23;

  if (user.role !== 'admin' && user.points < cost) {
    showToast("Bạn không đủ điểm Xúc xích để ghi số!", "warning");
    return;
  }

  // Deduct points
  if (user.role !== 'admin') {
    user.points -= cost;
    pushSausageLog(user.id, -cost, `Ghi vé số ${type === 'de' ? 'Đề' : 'Bao Lô'} con [${String(numberVal).padStart(2,'0')}]: cược ${points}đ (cost -${cost})`);
  } else {
    pushSausageLog(user.id, 0, `Ghi vé số ${type === 'de' ? 'Đề' : 'Bao Lô'} con [${String(numberVal).padStart(2,'0')}]: cược ${points}đ (Admin miễn phí)`);
  }

  // Today's date string
  const todayStr = new Date().toISOString().split('T')[0];

  const ticket = {
    id: `ticket-${Date.now()}`,
    userId: user.id,
    username: user.name,
    date: todayStr,
    number: numberVal,
    type: type,
    points: points,
    status: 'pending',
    winAmount: 0
  };

  AppState.lottery_bets.push(ticket);
  saveState();

  showToast("Ghi số thành công! Hãy đợi quay thưởng lúc 18h tối.", "success");
  numInput.value = '';
  renderMiniGames();
}

function renderLotteryMyTickets() {
  const container = document.getElementById('lottery-my-tickets-container');
  if (!container) return;
  container.innerHTML = '';

  const user = getCurrentUser();
  const todayStr = new Date().toISOString().split('T')[0];

  // Resolve pending bets automatically if after 18:00
  resolveDailyLottery();

  const myTickets = (AppState.lottery_bets || []).filter(t => t.userId === user.id && t.date === todayStr);

  if (myTickets.length === 0) {
    container.innerHTML = `<span class="text-muted" style="font-size:12.5px; font-style:italic;">Hôm nay bạn chưa mua vé số nào.</span>`;
    return;
  }

  myTickets.forEach(t => {
    const row = document.createElement('div');
    row.style.cssText = 'background:#1f2937; border:1px solid var(--border-color); border-radius:6px; padding:8px 12px; display:flex; justify-content:space-between; align-items:center; font-size:13px;';
    
    let badge = '<span class="badge bg-muted">Đang chờ 18:00</span>';
    if (t.status === 'win') {
      badge = `<span class="badge bg-green">Trúng thưởng (+${t.winAmount})</span>`;
    } else if (t.status === 'lose') {
      badge = '<span class="badge bg-rose">Không trúng</span>';
    }

    row.innerHTML = `
      <div>
        <strong style="color:var(--color-primary); font-size:14px;">[${String(t.number).padStart(2,'0')}]</strong>
        <span style="margin-left:8px; opacity:0.8;">${t.type === 'de' ? 'Đề' : 'Bao lô'} (${t.points}đ)</span>
      </div>
      <div>${badge}</div>
    `;
    container.appendChild(row);
  });
}

function renderLotteryResults() {
  const container = document.getElementById('lottery-results-display');
  if (!container) return;
  container.innerHTML = '';

  const select = document.getElementById('lottery-result-date-select');
  if (!select) return;
  const dateStr = select.value;

  // Check if draw results are available: must be after 18h for today, or past days
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const hours = now.getHours();

  if (dateStr === todayStr && hours < 18) {
    container.innerHTML = `
      <div style="text-align:center; padding:30px 10px; background:rgba(0,0,0,0.1); border-radius:8px; border:1px dashed var(--border-color);">
        <i class="fa-solid fa-hourglass-half" style="font-size:32px; color:#eab308; margin-bottom:12px;"></i>
        <h4 style="margin:0; font-weight:bold;">Chờ quay thưởng lúc 18h00 tối nay</h4>
        <p style="font-size:12px; color:var(--text-muted); margin-top:4px;">Kết quả chính thức của ngày ${dateStr} sẽ tự động hiển thị sau 18h.</p>
      </div>
    `;
    return;
  }

  // Generate results seeded by dateStr
  const res = generateLotteryResultsForDate(dateStr);

  const table = document.createElement('div');
  table.style.cssText = 'background:#1f2937; border:1px solid var(--border-color); border-radius:8px; overflow:hidden; font-size:13px;';
  
  const createPrizeRow = (label, value) => {
    return `
      <div style="display:grid; grid-template-columns: 80px 1fr; border-bottom:1px solid var(--border-color); align-items:center;">
        <div style="background:rgba(0,0,0,0.2); padding:10px; font-weight:bold; text-align:center; border-right:1px solid var(--border-color);">${label}</div>
        <div style="padding:10px; font-weight:bold; letter-spacing:1px; color:#fff; text-align:center; font-size:14px;">${value}</div>
      </div>
    `;
  };

  table.innerHTML = `
    ${createPrizeRow('Đặc Biệt', `<span style="color:#ef4444; font-size:16px;">${res.db}</span>`)}
    ${createPrizeRow('Giải Nhất', res.g1)}
    ${createPrizeRow('Giải Nhì', res.g2.join(' - '))}
    ${createPrizeRow('Giải Ba', res.g3.slice(0, 3).join(' - ') + '<br>' + res.g3.slice(3).join(' - '))}
    ${createPrizeRow('Giải Tư', res.g4.join(' - '))}
    ${createPrizeRow('Giải Năm', res.g5.slice(0, 3).join(' - ') + '<br>' + res.g5.slice(3).join(' - '))}
    ${createPrizeRow('Giải Sáu', res.g6.join(' - '))}
    ${createPrizeRow('Giải Bảy', `<span style="color:#f59e0b;">${res.g7.join(' - ')}</span>`)}
  `;

  container.appendChild(table);
}

function testDrawLottery() {
  // Test/Quick draw today's lottery instantly for fun
  const todayStr = new Date().toISOString().split('T')[0];
  const res = generateLotteryResultsForDate(todayStr);

  // Force resolve today's tickets instantly
  let countWon = 0;
  let totalWinPoints = 0;
  
  AppState.lottery_bets.forEach(t => {
    if (t.date === todayStr && t.status === 'pending') {
      const outcome = checkTicketWin(t, res);
      if (outcome.win) {
        t.status = 'win';
        t.winAmount = outcome.amount;
        // Credit user points
        const user = AppState.users.find(u => u.id === t.userId);
        if (user) {
          user.points += outcome.amount;
          pushSausageLog(user.id, outcome.amount, `Trúng thưởng Xổ Số (${t.type === 'de' ? 'Đề' : 'Bao Lô'} con [${String(t.number).padStart(2,'0')}]): +${outcome.amount}đ`);
        }
        countWon++;
        totalWinPoints += outcome.amount;
      } else {
        t.status = 'lose';
      }
    }
  });

  saveState();
  renderMiniGames();

  // Show alert dialog with results
  alert(`KẾT QUẢ QUAY THỬ HÔM NAY:\n- Giải Đặc Biệt: ${res.db} (Đề về: ${res.db.slice(-2)})\n- Đã duyệt các vé số của hôm nay.\n- Có ${countWon} vé trúng thưởng, tổng cộng trả thưởng ${totalWinPoints} xúc xích!`);
}

function resolveDailyLottery() {
  // Resolve bets if after 18h
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const hours = now.getHours();

  let modified = false;

  AppState.lottery_bets.forEach(t => {
    // If ticket is pending, and the date has passed or it's today after 18:00
    if (t.status === 'pending') {
      const isPast = t.date < todayStr;
      const isTodayAfter18 = (t.date === todayStr && hours >= 18);

      if (isPast || isTodayAfter18) {
        const res = generateLotteryResultsForDate(t.date);
        const outcome = checkTicketWin(t, res);
        
        if (outcome.win) {
          t.status = 'win';
          t.winAmount = outcome.amount;
          // Credit user points
          const user = AppState.users.find(u => u.id === t.userId);
          if (user) {
            user.points += outcome.amount;
            pushSausageLog(user.id, outcome.amount, `Trúng thưởng Xổ Số ngày ${t.date} (${t.type === 'de' ? 'Đề' : 'Bao Lô'} con [${String(t.number).padStart(2,'0')}]): +${outcome.amount}đ`);
          }
        } else {
          t.status = 'lose';
        }
        modified = true;
      }
    }
  });

  if (modified) {
    saveState();
  }
}

// Seeded Random Generator Algorithm
function sfc32(a, b, c, d) {
  return function() {
    a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0;
    var t = (a + b) | 0;
    a = b ^ (b >>> 9);
    b = (c + (c << 3)) | 0;
    c = (c << 21) | (c >>> 11);
    d = (d + 1) | 0;
    t = (t + d) | 0;
    c = (c + t) | 0;
    return (t >>> 0) / 4294967296;
  }
}

function getSeededRandom(seedStr) {
  let h = 1779033703 ^ seedStr.length;
  for (let i = 0; i < seedStr.length; i++) {
    h = Math.imul(h ^ seedStr.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return sfc32(h, h ^ 12345, h ^ 67890, h ^ 99999);
}

function generateLotteryResultsForDate(dateStr) {
  const rand = getSeededRandom(dateStr);
  const pad = (num, len) => String(num).padStart(len, '0');
  const genNum = (len) => pad(Math.floor(rand() * Math.pow(10, len)), len);

  return {
    date: dateStr,
    db: genNum(5), 
    g1: genNum(5), 
    g2: [genNum(5), genNum(5)], 
    g3: [genNum(5), genNum(5), genNum(5), genNum(5), genNum(5), genNum(5)], 
    g4: [genNum(4), genNum(4), genNum(4), genNum(4)], 
    g5: [genNum(4), genNum(4), genNum(4), genNum(4), genNum(4), genNum(4)], 
    g6: [genNum(3), genNum(3), genNum(3)], 
    g7: [genNum(2), genNum(2), genNum(2), genNum(2)] 
  };
}

function checkTicketWin(ticket, results) {
  const dbLast2 = results.db.slice(-2);
  const allPrizesLast2 = [];
  allPrizesLast2.push(results.db.slice(-2));
  allPrizesLast2.push(results.g1.slice(-2));
  results.g2.forEach(p => allPrizesLast2.push(p.slice(-2)));
  results.g3.forEach(p => allPrizesLast2.push(p.slice(-2)));
  results.g4.forEach(p => allPrizesLast2.push(p.slice(-2)));
  results.g5.forEach(p => allPrizesLast2.push(p.slice(-2)));
  results.g6.forEach(p => allPrizesLast2.push(p.slice(-2)));
  results.g7.forEach(p => allPrizesLast2.push(p.slice(-2)));

  const target = String(ticket.number).padStart(2, '0');
  if (ticket.type === 'de') {
    if (target === dbLast2) {
      return { win: true, amount: ticket.points * 70 };
    }
  } else if (ticket.type === 'bao') {
    let matchCount = 0;
    allPrizesLast2.forEach(p => {
      if (p === target) matchCount++;
    });
    if (matchCount > 0) {
      const winAmount = Math.floor((ticket.points / 23) * 80 * matchCount);
      return { win: true, amount: winAmount };
    }
  }
  return { win: false, amount: 0 };
}


// ==========================================
// GAME 3: BET KÈO NỘI BỘ
// ==========================================
function initBetPoolGame() {
  const createBtn = document.getElementById('btn-create-bet-lobby');
  if (createBtn) {
    createBtn.addEventListener('click', createBetLobby);
  }

  // Pre-fill deadline with tomorrow
  const deadlineInput = document.getElementById('bet-deadline-input');
  if (deadlineInput) {
    const tom = new Date();
    tom.setDate(tom.getDate() + 1);
    tom.setHours(17, 0, 0, 0);
    // format as YYYY-MM-DDThh:mm
    const pad = (n) => String(n).padStart(2,'0');
    deadlineInput.value = `${tom.getFullYear()}-${pad(tom.getMonth()+1)}-${pad(tom.getDate())}T17:00`;
  }
}

function createBetLobby() {
  const user = getCurrentUser();
  const titleInput = document.getElementById('bet-title-input');
  const optAInput = document.getElementById('bet-optA-input');
  const optBInput = document.getElementById('bet-optB-input');
  const deadlineInput = document.getElementById('bet-deadline-input');

  const title = titleInput.value.trim();
  const optA = optAInput.value.trim();
  const optB = optBInput.value.trim();
  const deadline = deadlineInput.value;

  if (!title || !optA || !optB || !deadline) {
    showToast("Vui lòng nhập đầy đủ thông tin kèo!", "warning");
    return;
  }

  const lobby = {
    id: `bet-${Date.now()}`,
    title: title,
    optionA: optA,
    optionB: optB,
    creatorId: user.id,
    creatorName: user.name,
    deadline: deadline,
    status: 'active', // 'active' | 'resolved'
    winningOption: null,
    bets: [] // Array of { userId, username, option ('A'|'B'), points }
  };

  AppState.custom_bets.push(lobby);
  saveState();

  showToast("Phát động kèo thành công!", "success");
  titleInput.value = '';
  renderMiniGames();
}

function renderBetPools() {
  const activeContainer = document.getElementById('bet-active-lobbies-container');
  const historyContainer = document.getElementById('bet-history-container');
  if (!activeContainer || !historyContainer) return;

  activeContainer.innerHTML = '';
  historyContainer.innerHTML = '';

  const currentUser = getCurrentUser();
  const nowStr = new Date().toISOString();

  const activeBets = (AppState.custom_bets || []).filter(b => b.status === 'active');
  const resolvedBets = (AppState.custom_bets || []).filter(b => b.status === 'resolved');

  // 1. Render Active Lobbies
  if (activeBets.length === 0) {
    activeContainer.innerHTML = `<span class="text-muted" style="font-size:12.5px; font-style:italic;">Hiện không có kèo cá cược nào đang mở.</span>`;
  } else {
    activeBets.forEach(b => {
      const lobbyCard = document.createElement('div');
      lobbyCard.style.cssText = 'background:#1f2937; border:1px solid var(--border-color); border-radius:10px; padding:15px; display:flex; flex-direction:column; gap:12px;';
      
      const isExpired = new Date(b.deadline) < new Date();
      const timeText = isExpired ? '<span style="color:#ef4444; font-weight:bold;">Đã hết hạn đặt cược</span>' : `Hạn cược: ${b.deadline.replace('T', ' ')}`;

      // Calculate totals
      const poolA = b.bets.filter(bt => bt.option === 'A').reduce((acc, bt) => acc + bt.points, 0);
      const poolB = b.bets.filter(bt => bt.option === 'B').reduce((acc, bt) => acc + bt.points, 0);
      const totalPool = poolA + poolB;

      // Check if current user has bet
      const myBet = b.bets.find(bt => bt.userId === currentUser.id);
      const myBetHtml = myBet ? `
        <div style="background:rgba(16,185,129,0.1); border:1px solid rgba(16,185,129,0.3); padding:8px; border-radius:6px; font-size:12px; color:#10b981; font-weight:bold;">
          Bạn đã cược ${myBet.points} xúc xích vào cửa [${myBet.option === 'A' ? b.optionA : b.optionB}]
        </div>
      ` : '';

      // Resolution buttons for creator or admin
      const isCreatorOrAdmin = (b.creatorId === currentUser.id || currentUser.role === 'admin');
      let adminResolveHtml = '';
      if (isCreatorOrAdmin) {
        adminResolveHtml = `
          <div style="margin-top:10px; padding-top:10px; border-top:1px solid var(--border-color); display:flex; gap:8px; align-items:center;">
            <span style="font-size:12px; font-weight:bold; color:#eab308;"><i class="fa-solid fa-shield"></i> Đóng kèo:</span>
            <button class="btn btn-sm btn-primary" onclick="resolveCustomBetLobby('${b.id}', 'A')">Cửa A thắng</button>
            <button class="btn btn-sm btn-primary" onclick="resolveCustomBetLobby('${b.id}', 'B')">Cửa B thắng</button>
            <button class="btn btn-sm btn-outline text-rose" onclick="cancelCustomBetLobby('${b.id}')">Hủy kèo</button>
          </div>
        `;
      }

      // Bet form (if not expired and not placed)
      let betFormHtml = '';
      if (!isExpired && !myBet) {
        betFormHtml = `
          <div style="display:flex; gap:8px; align-items:center;">
            <select id="bet-opt-select-${b.id}" style="font-size:12px; background:#111827; border:1px solid var(--border-color); color:#fff; padding:6px; border-radius:4px; flex:1.2;">
              <option value="A">${b.optionA}</option>
              <option value="B">${b.optionB}</option>
            </select>
            <input type="number" id="bet-amount-val-${b.id}" style="font-size:12px; background:#111827; border:1px solid var(--border-color); color:#fff; padding:6px; border-radius:4px; width:80px;" value="10" min="1">
            <button class="btn btn-sm btn-primary" style="padding:6px 12px;" onclick="placeCustomBet('${b.id}')">Đặt cược</button>
          </div>
        `;
      }

      lobbyCard.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
          <div>
            <h4 style="margin:0; font-size:14px; font-weight:bold; color:#fff;">${b.title}</h4>
            <span style="font-size:11px; color:var(--text-muted);">Tạo bởi: ${b.creatorName}</span>
          </div>
          <span style="font-size:11.5px; opacity:0.8;">${timeText}</span>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; background:rgba(0,0,0,0.15); padding:10px; border-radius:6px; border:1px solid var(--border-color); font-size:12px; text-align:center;">
          <div>
            <strong style="color:var(--color-primary); font-size:13px;">[${b.optionA}]</strong>
            <div style="margin-top:4px;">Tổng cược: ${poolA}đ</div>
          </div>
          <div style="border-left:1px solid var(--border-color);">
            <strong style="color:var(--color-info); font-size:13px;">[${b.optionB}]</strong>
            <div style="margin-top:4px;">Tổng cược: ${poolB}đ</div>
          </div>
        </div>

        ${myBetHtml}
        ${betFormHtml}
        ${adminResolveHtml}
      `;
      activeContainer.appendChild(lobbyCard);
    });
  }

  // 2. Render History Lobbies
  if (resolvedBets.length === 0) {
    historyContainer.innerHTML = `<span class="text-muted" style="font-size:12.5px; font-style:italic;">Chưa có kèo nào kết thúc.</span>`;
  } else {
    // Sort newest closed first
    const sortedHistory = [...resolvedBets].reverse().slice(0, 8);
    sortedHistory.forEach(b => {
      const card = document.createElement('div');
      card.style.cssText = 'background:#1f2937; border:1px solid var(--border-color); border-radius:6px; padding:10px 12px; font-size:12.5px; display:flex; flex-direction:column; gap:4px;';
      
      const winnerText = b.winningOption === 'A' ? b.optionA : b.optionB;
      const myBet = b.bets.find(bt => bt.userId === currentUser.id);
      let myOutcome = '';
      if (myBet) {
        if (myBet.option === b.winningOption) {
          myOutcome = ` <span style="color:#22c55e; font-weight:bold;">(Bạn thắng)</span>`;
        } else {
          myOutcome = ` <span style="color:#ef4444; font-weight:bold;">(Bạn thua)</span>`;
        }
      }

      card.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <strong style="color:#fff;">${b.title}</strong>
          <span style="font-size:10px; color:var(--text-muted);">Đóng kèo bởi: ${b.creatorName}</span>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:2px;">
          <span>Kết quả: <span class="badge bg-green">${winnerText}</span></span>
          <span style="font-size:11.5px;">Tổng giải: ${b.bets.reduce((acc,bt)=>acc+bt.points,0)}đ ${myOutcome}</span>
        </div>
      `;
      historyContainer.appendChild(card);
    });
  }
}

function placeCustomBet(lobbyId) {
  const user = getCurrentUser();
  const b = AppState.custom_bets.find(x => x.id === lobbyId);
  if (!b) return;

  const select = document.getElementById(`bet-opt-select-${lobbyId}`);
  const amountInput = document.getElementById(`bet-amount-val-${lobbyId}`);
  const opt = select.value;
  const amount = parseInt(amountInput.value) || 10;

  if (amount <= 0) {
    showToast("Số cược phải lớn hơn 0!", "warning");
    return;
  }

  if (user.role !== 'admin' && user.points < amount) {
    showToast("Bạn không đủ điểm Xúc xích để cược!", "warning");
    return;
  }

  // Deduct points
  if (user.role !== 'admin') {
    user.points -= amount;
    pushSausageLog(user.id, -amount, `Cược kèo: "${b.title}" vào cửa [${opt === 'A' ? b.optionA : b.optionB}]`);
  } else {
    pushSausageLog(user.id, 0, `Cược kèo: "${b.title}" vào cửa [${opt === 'A' ? b.optionA : b.optionB}] (Admin miễn phí)`);
  }

  b.bets.push({
    userId: user.id,
    username: user.name,
    option: opt,
    points: amount
  });

  saveState();
  showToast("Đặt cược thành công!", "success");
  renderMiniGames();
}

function resolveCustomBetLobby(lobbyId, winnerOption) {
  const b = AppState.custom_bets.find(x => x.id === lobbyId);
  if (!b) return;

  if (!confirm(`Bạn chắc chắn muốn đóng kèo "${b.title}" và công bố kết quả cửa [${winnerOption === 'A' ? b.optionA : b.optionB}] thắng?`)) {
    return;
  }

  const poolA = b.bets.filter(bt => bt.option === 'A').reduce((acc, bt) => acc + bt.points, 0);
  const poolB = b.bets.filter(bt => bt.option === 'B').reduce((acc, bt) => acc + bt.points, 0);
  const totalPool = poolA + poolB;

  const winningPool = winnerOption === 'A' ? poolA : poolB;
  const losingPool = winnerOption === 'A' ? poolB : poolA;

  // Process payouts
  b.bets.forEach(bt => {
    const betUser = AppState.users.find(u => u.id === bt.userId);
    if (!betUser) return;

    if (bt.option === winnerOption) {
      // Win: proportional share of losing pool + get original bet back
      let payout = bt.points;
      if (winningPool > 0) {
        const share = Math.floor((bt.points / winningPool) * losingPool);
        payout += share;
      }
      betUser.points += payout;
      pushSausageLog(betUser.id, payout, `Thắng kèo: "${b.title}" nhận lại cược + thưởng chia sẻ: +${payout}đ`);
    } else {
      // Lose: nothing returned
      pushSausageLog(betUser.id, 0, `Thua kèo: "${b.title}" mất điểm cược`);
    }
  });

  b.status = 'resolved';
  b.winningOption = winnerOption;

  saveState();
  showToast("Đã đóng kèo và thanh toán cược thành công!", "success");
  renderMiniGames();
}

function cancelCustomBetLobby(lobbyId) {
  const b = AppState.custom_bets.find(x => x.id === lobbyId);
  if (!b) return;

  if (!confirm(`Bạn có chắc muốn HỦY kèo này và hoàn trả điểm cược cho mọi người?`)) {
    return;
  }

  // Refund everyone
  b.bets.forEach(bt => {
    const betUser = AppState.users.find(u => u.id === bt.userId);
    if (betUser) {
      betUser.points += bt.points;
      pushSausageLog(betUser.id, bt.points, `Hủy kèo cược: "${b.title}" hoàn trả điểm cược: +${bt.points}đ`);
    }
  });

  // Remove lobby from AppState
  AppState.custom_bets = AppState.custom_bets.filter(x => x.id !== lobbyId);
  saveState();

  showToast("Đã hủy kèo và hoàn trả điểm thành công!", "success");
  renderMiniGames();
}


// ==================== ONLINE CARO FUNCTIONS ==================== //
function renderOnlineCaroLobbies() {
  const container = document.getElementById('caro-online-lobbies-list');
  if (!container) return;
  container.innerHTML = '';

  if (!AppState.active_caro_games) AppState.active_caro_games = [];
  const waitingGames = AppState.active_caro_games.filter(g => g.status === 'waiting');

  const currentUser = getCurrentUser();

  if (waitingGames.length === 0) {
    container.innerHTML = `<span style="font-size: 12px; color: var(--text-muted); font-style: italic;">Chưa có bàn đấu nào đang chờ...</span>`;
  } else {
    waitingGames.forEach(g => {
      const isMyLobby = g.player1Id === currentUser.id;
      const card = document.createElement('div');
      card.style.cssText = 'background: rgba(0,0,0,0.15); border: 1px solid var(--border-color); border-radius: 6px; padding: 8px 10px; display: flex; justify-content: space-between; align-items: center; font-size: 12.5px; margin-bottom: 6px;';
      
      const hostName = isMyLobby ? 'Bạn' : g.player1Name;
      
      let actionBtn = '';
      if (isMyLobby) {
        actionBtn = `<button type="button" class="btn btn-sm btn-outline text-rose" style="padding: 4px 8px; font-size: 11px;" onclick="cancelOnlineCaroGame('${g.id}')">Hủy bàn</button>`;
      } else {
        actionBtn = `<button type="button" class="btn btn-sm btn-primary" style="padding: 4px 8px; font-size: 11px;" onclick="joinOnlineCaroGame('${g.id}')">Vào chơi</button>`;
      }

      card.innerHTML = `
        <div>
          <strong>Chủ bàn: ${hostName}</strong>
          <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">Cược: ${g.bet} xúc xích</div>
        </div>
        ${actionBtn}
      `;
      container.appendChild(card);
    });
  }
}

window.createCaroOnlineLobby = function() {
  const user = getCurrentUser();
  caroBet = parseInt(document.getElementById('caro-bet-amount').value) || 10;

  if (caroBet <= 0) {
    showToast("Số tiền cược phải lớn hơn 0!", "warning");
    return;
  }

  if (user.role !== 'admin' && user.points < caroBet) {
    showToast("Bạn không đủ điểm Xúc xích để cược!", "warning");
    return;
  }

  // Deduct points
  if (user.role !== 'admin') {
    user.points -= caroBet;
    pushSausageLog(user.id, -caroBet, `Tạo bàn đấu Caro Online: cược ${caroBet}đ`);
  } else {
    pushSausageLog(user.id, 0, `Tạo bàn đấu Caro Online (Admin miễn phí)`);
  }

  if (!AppState.active_caro_games) AppState.active_caro_games = [];
  
  const newGame = {
    id: `caro-online-${Date.now()}`,
    player1Id: user.id,
    player1Name: user.name,
    player2Id: null,
    player2Name: null,
    board: Array(10).fill(null).map(() => Array(10).fill(null)),
    turn: 'X',
    bet: caroBet,
    status: 'waiting',
    winner: null
  };

  AppState.active_caro_games.push(newGame);
  saveState();

  onlineCaroGameId = newGame.id;
  caroBoard = newGame.board;
  caroTurn = newGame.turn;
  caroGameActive = true;

  const gridContainer = document.getElementById('caro-grid-container');
  if (gridContainer) {
    gridContainer.style.pointerEvents = 'auto';
    gridContainer.style.opacity = '1';
  }
  document.getElementById('btn-start-caro-game').style.display = 'none';
  document.getElementById('btn-reset-caro-game').style.display = 'block';

  drawCaroBoard();
  updateCaroStatusText();
  renderMiniGames();

  // Start fast polling
  startOnlineCaroPolling();
};

window.joinOnlineCaroGame = function(gameId) {
  const user = getCurrentUser();
  if (!AppState.active_caro_games) AppState.active_caro_games = [];
  const g = AppState.active_caro_games.find(x => x.id === gameId);
  if (!g) {
    showToast("Không tìm thấy bàn đấu này!", "warning");
    return;
  }

  if (user.role !== 'admin' && user.points < g.bet) {
    showToast("Bạn không đủ điểm Xúc xích để cược vào bàn này!", "warning");
    return;
  }

  // Deduct points
  if (user.role !== 'admin') {
    user.points -= g.bet;
    pushSausageLog(user.id, -g.bet, `Vào bàn đấu Caro Online của ${g.player1Name}: cược ${g.bet}đ`);
  } else {
    pushSausageLog(user.id, 0, `Vào bàn đấu Caro Online của ${g.player1Name} (Admin miễn phí)`);
  }

  g.player2Id = user.id;
  g.player2Name = user.name;
  g.status = 'playing';

  saveState();

  onlineCaroGameId = g.id;
  caroBoard = g.board;
  caroTurn = g.turn;
  caroGameActive = true;

  const gridContainer = document.getElementById('caro-grid-container');
  if (gridContainer) {
    gridContainer.style.pointerEvents = 'auto';
    gridContainer.style.opacity = '1';
  }
  document.getElementById('btn-start-caro-game').style.display = 'none';
  document.getElementById('btn-reset-caro-game').style.display = 'block';

  drawCaroBoard();
  updateCaroStatusText();
  renderMiniGames();

  // Start fast polling
  startOnlineCaroPolling();
};

window.cancelOnlineCaroGame = function(gameId) {
  if (!AppState.active_caro_games) AppState.active_caro_games = [];
  const g = AppState.active_caro_games.find(x => x.id === gameId);
  if (!g) return;

  // Refund Player 1
  const user = AppState.users.find(u => u.id === g.player1Id);
  if (user && user.role !== 'admin') {
    user.points += g.bet;
    pushSausageLog(user.id, g.bet, `Hủy bàn đấu Caro Online: hoàn lại cược`);
  }

  // Remove lobby
  AppState.active_caro_games = AppState.active_caro_games.filter(x => x.id !== gameId);
  saveState();

  onlineCaroGameId = null;
  caroGameActive = false;
  
  const gridContainer = document.getElementById('caro-grid-container');
  if (gridContainer) {
    gridContainer.style.pointerEvents = 'none';
    gridContainer.style.opacity = '0.5';
  }
  document.getElementById('btn-start-caro-game').style.display = 'none';
  document.getElementById('btn-reset-caro-game').style.display = 'none';
  document.getElementById('caro-game-status').innerText = 'Đã hủy bàn đấu.';

  drawCaroBoard();
  renderMiniGames();
};

let onlineCaroInterval = null;
function startOnlineCaroPolling() {
  if (onlineCaroInterval) clearInterval(onlineCaroInterval);
  onlineCaroInterval = setInterval(async () => {
    if (!onlineCaroGameId || caroMode !== 'vs-online') {
      clearInterval(onlineCaroInterval);
      return;
    }

    try {
      const res = await fetch(getApiUrl('/api/state'));
      if (res.ok) {
        const data = await res.json();
        AppState.active_caro_games = data.active_caro_games || [];
        
        const activeGame = AppState.active_caro_games.find(g => g.id === onlineCaroGameId);
        if (activeGame) {
          // Update local state
          caroBoard = activeGame.board;
          caroTurn = activeGame.turn;
          
          drawCaroBoard();
          updateCaroStatusText();

          if (activeGame.status === 'completed') {
            endOnlineGameLocal(activeGame);
            onlineCaroGameId = null;
            clearInterval(onlineCaroInterval);
          }
        }
      }
    } catch(e) {}
  }, 1500);
}

function endOnlineGameLocal(game) {
  caroGameActive = false;
  const gridContainer = document.getElementById('caro-grid-container');
  if (gridContainer) gridContainer.style.pointerEvents = 'none';

  const status = document.getElementById('caro-game-status');
  document.getElementById('btn-start-caro-game').style.display = 'none';
  document.getElementById('btn-reset-caro-game').style.display = 'none';

  const user = getCurrentUser();

  if (game.winner === 'draw') {
    status.innerHTML = `<span style="color:#eab308;">Hoà ván! Đã hoàn trả cược cho cả 2 bên.</span>`;
  } else {
    const winnerName = game.winner === 'X' ? game.player1Name : game.player2Name;
    const isIWon = (game.winner === 'X' && game.player1Id === user.id) || (game.winner === 'O' && game.player2Id === user.id);
    
    if (isIWon) {
      status.innerHTML = `<span style="color:#22c55e; font-weight:bold;">CHIẾN THẮNG! Nhận +${game.bet * 2} xúc xích</span>`;
    } else {
      status.innerHTML = `<span style="color:#ef4444; font-weight:bold;">THẤT BẠI! ${winnerName} chiến thắng.</span>`;
    }
  }

  // Clear list entry locally
  AppState.active_caro_games = (AppState.active_caro_games || []).filter(x => x.id !== game.id);
  saveState();
  renderMiniGames();
}


// ==========================================
// HELPERS
// ==========================================
function pushSausageLog(userId, points, text) {
  if (!AppState.sausageLogs) AppState.sausageLogs = [];
  AppState.sausageLogs.push({
    id: `log-${Date.now()}-${Math.floor(Math.random()*1000)}`,
    userId: userId,
    points: points,
    type: points >= 0 ? 'success' : 'warning',
    text: text,
    date: new Date().toISOString().split('T')[0]
  });
}
