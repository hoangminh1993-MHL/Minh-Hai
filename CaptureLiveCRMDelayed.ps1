$edge = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
$outImg = "C:\Users\admin\.gemini\antigravity-ide\brain\9c13f1e0-284e-4ab0-9990-4cd3a100827c\live_crm_proof_v21_08.png"

if (Test-Path $outImg) { Remove-Item $outImg -Force }

# Launch Edge headless with screenshot flag and virtual time budget to allow JS async API fetch
$args = @(
    "--headless",
    "--disable-gpu",
    "--window-size=1600,1050",
    "--virtual-time-budget=6000",
    "--screenshot=""$outImg""",
    "https://minh-hai.onrender.com/index.html#crm"
)

$proc = Start-Process -FilePath $edge -ArgumentList $args -Wait -PassThru

if (Test-Path $outImg) {
    $item = Get-Item $outImg
    Write-Output "Delayed screenshot captured successfully! File size: $($item.Length) bytes"
} else {
    Write-Output "Screenshot capture failed."
}
