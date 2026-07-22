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
      const isChinhNgach = (w.serviceType && w.serviceType.toLowerCase() === 'chính ngạch');

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
          <span class="stat-label">Lô chính ngạch phát sinh</span>
          <h3>${cnGenerated}</h3>
          <span class="stat-trend trend-up">Tháng ${currentMonth + 1}/${currentYear}</span>
        </div>
      </div>
      <div class="stat-card" style="cursor: pointer;" onclick="if(window.showStatsModal) window.showStatsModal('cn_success')">
        <div class="stat-icon bg-green"><i class="fa-solid fa-check-double"></i></div>
        <div class="stat-data">
          <span class="stat-label">Lô chính ngạch chốt được</span>
          <h3>${cnSuccess}</h3>
          <span class="stat-trend trend-up">Tỷ lệ: ${cnGenerated > 0 ? Math.round((cnSuccess/cnGenerated)*100) : 0}%</span>
        </div>
      </div>
      <div class="stat-card" style="cursor: pointer;" onclick="if(window.showStatsModal) window.showStatsModal('cn_generated')">
        <div class="stat-icon bg-gold"><i class="fa-solid fa-sack-dollar"></i></div>
        <div class="stat-data">
          <span class="stat-label">Lợi nhuận chính ngạch</span>
          <h3>${cnProfit.toLocaleString()} đ</h3>
          <span class="stat-trend trend-up">Đơn hàng CN (Tháng)</span>
        </div>
      </div>
      <div class="stat-card" style="cursor: pointer;" onclick="if(window.showStatsModal) window.showStatsModal('ops_added')">
        <div class="stat-icon" style="background: #a855f7; color: white;"><i class="fa-solid fa-boxes-stacked"></i></div>
        <div class="stat-data">
          <span class="stat-label">Lô hàng add vào CRM Khách cũ</span>
          <h3>${totalOpsAdded}</h3>
          <span class="stat-trend trend-up">Vận hành (Tháng)</span>
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
