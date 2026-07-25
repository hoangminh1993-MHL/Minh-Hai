$ops = Get-Content -Raw 'ops.js' -Encoding UTF8

# Call renderOpsStats() in renderMyTasks()
$ops = $ops -replace 'function renderMyTasks\(\) \{', "function renderMyTasks() {
  renderOpsStats();"

# Remove the old stats block from renderFounderDashboard
# We will just remove from "<!-- Hàng thống kê Chính Ngạch & Khách cũ -->" to its closing </div>
$ops = $ops -replace '(?s)    <!-- Hàng thống kê Chính Ngạch & Khách cũ -->.*?    </div>\r?\n\r?\n    <!-- Second row metrics -->', "    <!-- Second row metrics -->"

Set-Content 'ops.js' $ops -Encoding UTF8
