# Script to scan ALL git commits for db.json and extract every unique operational record (clients, projects, shipment_workflows, single_tasks)

$clientMap = @{}
$projectMap = @{}
$flowMap = @{}
$taskMap = @{}

$commitHashes = git log --format="%H" -- db.json
Write-Output "Scanning $($commitHashes.Count) commits for db.json..."

foreach ($hash in $commitHashes) {
    try {
        $raw = git show "${hash}:db.json" 2>$null
        if ($raw) {
            if ($raw.Length -gt 0 -and [int]$raw[0] -eq 65279) { $raw = $raw.Substring(1) }
            $json = $raw | ConvertFrom-Json

            if ($json.clients) {
                foreach ($c in $json.clients) {
                    if ($c.id -and -not $clientMap.ContainsKey($c.id)) {
                        $clientMap[$c.id] = $c
                    }
                }
            }
            if ($json.projects) {
                foreach ($p in $json.projects) {
                    if ($p.id -and -not $projectMap.ContainsKey($p.id)) {
                        $projectMap[$p.id] = $p
                    }
                }
            }
            if ($json.shipment_workflows) {
                foreach ($sw in $json.shipment_workflows) {
                    if ($sw.id -and -not $flowMap.ContainsKey($sw.id)) {
                        $flowMap[$sw.id] = $sw
                    }
                }
            }
            if ($json.single_tasks) {
                foreach ($st in $json.single_tasks) {
                    if ($st.id -and -not $taskMap.ContainsKey($st.id)) {
                        $taskMap[$st.id] = $st
                    }
                }
            }
        }
    } catch {}
}

Write-Output "`n=== RECOVERED ALL UNIQUE OPERATIONAL CRM RECORDS ==="
Write-Output "Total Unique Clients: $($clientMap.Count)"
Write-Output "Total Unique Projects: $($projectMap.Count)"
Write-Output "Total Unique Shipment Workflows: $($flowMap.Count)"
Write-Output "Total Unique Single Tasks: $($taskMap.Count)"

# Output list
Write-Output "`n--- Clients ---"
$clientMap.Values | ForEach-Object { Write-Output "Client ID: $($_.id) | Name: $($_.name) | Phone: $($_.phone)" }

Write-Output "`n--- Projects ---"
$projectMap.Values | ForEach-Object { Write-Output "Project ID: $($_.id) | Name: $($_.name) | Code: $($_.code)" }

Write-Output "`n--- Shipment Workflows ---"
$flowMap.Values | ForEach-Object { Write-Output "Workflow ID: $($_.id) | Code: $($_.code) | Title: $($_.title) | Customer: $($_.customer_name)" }

Write-Output "`n--- Single Tasks ---"
$taskMap.Values | ForEach-Object { Write-Output "Task ID: $($_.id) | Title: $($_.title) | Assignee: $($_.assignee_id)" }
