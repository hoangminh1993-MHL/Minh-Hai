$clientMap = @{}
$projectMap = @{}
$flowMap = @{}
$taskMap = @{}

$commitHashes = git log --format="%H" -- db.json

foreach ($hash in $commitHashes) {
    try {
        $raw = git show "${hash}:db.json" 2>$null
        if ($raw) {
            if ($raw.Length -gt 0 -and [int]$raw[0] -eq 65279) { $raw = $raw.Substring(1) }
            $json = $raw | ConvertFrom-Json

            if ($json.clients) {
                foreach ($c in $json.clients) {
                    if ($c.id) {
                        if (-not $clientMap.ContainsKey($c.id)) { $clientMap[$c.id] = $c }
                        else {
                            # Merge properties
                            $existing = $clientMap[$c.id]
                            foreach ($p in $c.PSObject.Properties) {
                                if ($p.Value -and -not $existing.$($p.Name)) {
                                    $existing.$($p.Name) = $p.Value
                                }
                            }
                        }
                    }
                }
            }
            if ($json.projects) {
                foreach ($p in $json.projects) {
                    if ($p.id) {
                        if (-not $projectMap.ContainsKey($p.id)) { $projectMap[$p.id] = $p }
                        else {
                            $existing = $projectMap[$p.id]
                            foreach ($prop in $p.PSObject.Properties) {
                                if ($prop.Value -and -not $existing.$($prop.Name)) {
                                    $existing.$($prop.Name) = $prop.Value
                                }
                            }
                        }
                    }
                }
            }
            if ($json.shipment_workflows) {
                foreach ($sw in $json.shipment_workflows) {
                    if ($sw.id) {
                        if (-not $flowMap.ContainsKey($sw.id)) { $flowMap[$sw.id] = $sw }
                        else {
                            $existing = $flowMap[$sw.id]
                            foreach ($prop in $sw.PSObject.Properties) {
                                if ($prop.Value -and -not $existing.$($prop.Name)) {
                                    $existing.$($prop.Name) = $prop.Value
                                }
                            }
                        }
                    }
                }
            }
            if ($json.single_tasks) {
                foreach ($st in $json.single_tasks) {
                    if ($st.id) {
                        if (-not $taskMap.ContainsKey($st.id)) { $taskMap[$st.id] = $st }
                        else {
                            $existing = $taskMap[$st.id]
                            foreach ($prop in $st.PSObject.Properties) {
                                if ($prop.Value -and -not $existing.$($prop.Name)) {
                                    $existing.$($prop.Name) = $prop.Value
                                }
                            }
                        }
                    }
                }
            }
        }
    } catch {}
}

# Update current db.json with merged collections
$dbPath = "d:\antigravity\db.json"
$dbRaw = [System.IO.File]::ReadAllText($dbPath, [System.Text.Encoding]::UTF8)
if ($dbRaw.Length -gt 0 -and [int]$dbRaw[0] -eq 65279) { $dbRaw = $dbRaw.Substring(1) }
$dbJson = $dbRaw | ConvertFrom-Json

$dbJson.clients = [System.Collections.ArrayList]@($clientMap.Values)
$dbJson.projects = [System.Collections.ArrayList]@($projectMap.Values)
$dbJson.shipment_workflows = [System.Collections.ArrayList]@($flowMap.Values)
$dbJson.single_tasks = [System.Collections.ArrayList]@($taskMap.Values)

$outStr = $dbJson | ConvertTo-Json -Depth 20
$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText($dbPath, $outStr, $utf8NoBom)

Write-Output "Merged Operational Data into db.json successfully!"
Write-Output "Clients count: $($dbJson.clients.Count)"
Write-Output "Projects count: $($dbJson.projects.Count)"
Write-Output "Shipment Workflows count: $($dbJson.shipment_workflows.Count)"
Write-Output "Single Tasks count: $($dbJson.single_tasks.Count)"
