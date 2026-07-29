# Automatic Backup Script for Drive D: (Minh Hải CRM)
# Target Folder: D:\MinhHai_CRM_Backups

$backupDir = "D:\MinhHai_CRM_Backups"
if (-not (Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
}

$now = [DateTime]::Now
$timestamp = $now.ToString("yyyy-MM-dd_HH-mm-ss")
$filename = "auto_backup_DriveD_$timestamp.json"
$targetPath = Join-Path $backupDir $filename

Write-Output "[Drive D: Backup] Starting auto-backup to $targetPath..."

try {
    # 1. Fetch live state from live server
    $res = Invoke-WebRequest -Uri "https://minh-hai.onrender.com/api/state" -UseBasicParsing -ErrorAction Stop
    $content = $res.Content

    if ($content -and $content.Length -gt 100) {
        $utf8NoBom = New-Object System.Text.UTF8Encoding $false
        [System.IO.File]::WriteAllText($targetPath, $content, $utf8NoBom)
        Write-Output "SUCCESS: Backup saved to Drive D: ($targetPath) - Size: $($content.Length) bytes"
    } else {
        Write-Error "Error: Received empty state from server."
    }
} catch {
    Write-Output "Server request failed ($($_.Exception.Message)). Attempting local db.json copy..."
    $localDb = "d:\antigravity\db.json"
    if (Test-Path $localDb) {
        Copy-Item -Path $localDb -Destination $targetPath -Force
        Write-Output "SUCCESS: Saved local db.json to Drive D: ($targetPath)"
    } else {
        Write-Error "Failed to locate local db.json!"
    }
}

# Clean old backups in Drive D: older than 60 days
try {
    $cutoff = (Get-Date).AddDays(-60)
    Get-ChildItem -Path $backupDir -Filter "*.json" | Where-Object { $_.LastWriteTime -lt $cutoff } | Remove-Item -Force
} catch {}
