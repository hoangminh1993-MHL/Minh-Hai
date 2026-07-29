$fList = Get-ChildItem -Path "d:\antigravity" -Filter "db_*.json"
foreach ($fObj in $fList) {
    $fn = $fObj.FullName
    try {
        $raw = [System.IO.File]::ReadAllText($fn, [System.Text.Encoding]::UTF8)
        if ($raw.Length -gt 0 -and [int]$raw[0] -eq 65279) { $raw = $raw.Substring(1) }
        $json = $raw | ConvertFrom-Json
        Write-Output "=== File: $($fObj.Name) ==="
        Write-Output "Clients: $($json.clients.Count)"
        Write-Output "Projects: $($json.projects.Count)"
        Write-Output "Shipment Workflows: $($json.shipment_workflows.Count)"
        Write-Output "Single Tasks: $($json.single_tasks.Count)"
    } catch {
        Write-Output "Error reading $($fObj.Name): $($_.Exception.Message)"
    }
}
