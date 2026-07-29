$fList = @('db.json', 'clean_v21_10_db.json', 'git_db.json', 'clean_9f81073.json')
foreach ($fn in $fList) {
    if (Test-Path $fn) {
        try {
            $raw = [System.IO.File]::ReadAllText((Resolve-Path $fn), [System.Text.Encoding]::UTF8)
            if ($raw.Length -gt 0 -and [int]$raw[0] -eq 65279) { $raw = $raw.Substring(1) }
            $json = $raw | ConvertFrom-Json
            Write-Output "=== File: $fn ==="
            Write-Output "Clients: $($json.clients.Count)"
            Write-Output "Projects: $($json.projects.Count)"
            Write-Output "Shipment Workflows: $($json.shipment_workflows.Count)"
            Write-Output "Single Tasks: $($json.single_tasks.Count)"
        } catch {
            Write-Output "Error reading ${fn}: $($_.Exception.Message)"
        }
    }
}
