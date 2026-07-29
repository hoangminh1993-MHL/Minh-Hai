$raw = git show "f0376ab:db.json"
$json = $raw | ConvertFrom-Json

Write-Output "=== CLIENTS in f0376ab ==="
foreach ($c in $json.clients) {
    Write-Output "ID: $($c.id) | Name: $($c.name) | Phone: $($c.phone) | Company: $($c.company)"
}

Write-Output "`n=== PROJECTS in f0376ab ==="
foreach ($p in $json.projects) {
    Write-Output "ID: $($p.id) | Name: $($p.name) | Code: $($p.code) | Status: $($p.status)"
}

Write-Output "`n=== SHIPMENT WORKFLOWS in f0376ab ==="
foreach ($sw in $json.shipment_workflows) {
    Write-Output "ID: $($sw.id) | Code: $($sw.code) | Title: $($sw.title) | Customer: $($sw.customer_name) | Stage: $($sw.current_stage_id)"
}

Write-Output "`n=== SINGLE TASKS in f0376ab ==="
foreach ($st in $json.single_tasks) {
    Write-Output "ID: $($st.id) | Title: $($st.title) | Assignee: $($st.assignee_id) | Status: $($st.status)"
}
