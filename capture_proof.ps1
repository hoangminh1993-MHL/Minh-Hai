$edgePath = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
if (-not (Test-Path $edgePath)) { $edgePath = "C:\Program Files\Microsoft\Edge\Application\msedge.exe" }

$outImg = "C:\Users\admin\.gemini\antigravity-ide\brain\9c13f1e0-284e-4ab0-9990-4cd3a100827c\crm_board_v21_32_verified_cards_proof.png"

$proc = Start-Process -FilePath $edgePath -ArgumentList "--headless", "--disable-gpu", "--screenshot=$outImg", "--window-size=1680,1050", "https://minh-hai.onrender.com/index.html?v=21.32#crm" -PassThru
Start-Sleep -Seconds 8
if (-not $proc.HasExited) { Stop-Process -Id $proc.Id -Force }

if (Test-Path $outImg) {
    $len = (Get-Item $outImg).Length
    Write-Output "SUCCESS! Native Edge headless screenshot saved! Size: $len bytes"
} else {
    Write-Output "FAILED to save screenshot"
}
