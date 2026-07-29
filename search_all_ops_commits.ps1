$commits = git log --oneline -- db.json
foreach ($line in $commits) {
    $hash = $line.Split(' ')[0]
    $msg = $line.Substring($hash.Length).Trim()
    try {
        $raw = git show "${hash}:db.json" 2>$null
        if ($raw) {
            if ($raw.Length -gt 0 -and [int]$raw[0] -eq 65279) { $raw = $raw.Substring(1) }
            $json = $raw | ConvertFrom-Json
            $c = if ($json.clients) { $json.clients.Count } else { 0 }
            $p = if ($json.projects) { $json.projects.Count } else { 0 }
            $sw = if ($json.shipment_workflows) { $json.shipment_workflows.Count } else { 0 }
            $st = if ($json.single_tasks) { $json.single_tasks.Count } else { 0 }
            if ($c -gt 0 -or $p -gt 0 -or $sw -gt 0 -or $st -gt 0) {
                Write-Output "$hash | C:$c P:$p SW:$sw ST:$st | $msg"
            }
        }
    } catch {}
}
