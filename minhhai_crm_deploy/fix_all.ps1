# PowerShell script to fix all Mojibake in ops.js, crm.js, app.js, index.html, and db.json
$deployDir = "d:\antigravity\minhhai_crm_deploy"

# 1. Fix db.json
$dbPath = "$deployDir\db.json"
if (Test-Path $dbPath) {
    $dbRaw = [System.IO.File]::ReadAllText($dbPath, [System.Text.Encoding]::UTF8)

    # Service Types
    $dbRaw = $dbRaw -replace 'ch[^\"]*ng[^\"]*ch', 'chính ngạch'
    $dbRaw = $dbRaw -replace 'h[^\"]*ng l[^\"]*', 'hàng lẻ'

    # Step names
    $dbRaw = $dbRaw -replace 'Nh[^\"]*n th[^\"]*ng tin', 'Nhận thông tin'
    $dbRaw = $dbRaw -replace 'B[^\"]*o gi[^\"]*', 'Báo giá'
    $dbRaw = $dbRaw -replace 'Thuong lu[^\"]*ng', 'Thương lượng'
    $dbRaw = $dbRaw -replace 'Th[^\"]*nh c[^\"]*ng', 'Thành công'
    $dbRaw = $dbRaw -replace 'Mua h[^\"]*ng', 'Mua hàng'
    $dbRaw = $dbRaw -replace 'Shop Trung Qu[^\"]*c g[^\"]*i h[^\"]*ng', 'Shop Trung Quốc gửi hàng'
    $dbRaw = $dbRaw -replace 'V[^\"]* d[^\"]*n kho Trung Qu[^\"]*c', 'Về đến kho Trung Quốc'
    $dbRaw = $dbRaw -replace 'V[^\"]* d[^\"]*n kho H[^\"]* N[^\"]*i/H[^\"]*i Ph[^\"]*ng', 'Về đến kho Hà Nội/Hải Phòng'
    $dbRaw = $dbRaw -replace 'Giao h[^\"]*ng cho kh[^\"]*ch', 'Giao hàng cho khách'
    $dbRaw = $dbRaw -replace 'Thu n[^\"]*', 'Thu nợ'
    $dbRaw = $dbRaw -replace 'Ho[^\"]*n t[^\"]*t', 'Hoàn tất'
    $dbRaw = $dbRaw -replace 'Th[^\"]*t b[^\"]*i', 'Thất bại'

    # Warehouses
    $dbRaw = $dbRaw -replace 'B[^\"]*ng Tu[^\"]*ng', 'Bằng Tường'
    $dbRaw = $dbRaw -replace 'H[^\"]* N[^\"]*i', 'Hà Nội'
    $dbRaw = $dbRaw -replace 'H[^\"]*i Ph[^\"]*ng', 'Hải Phòng'

    # Users
    $dbRaw = $dbRaw -replace 'Nguy[^\"]*n Ho[^\"]*ng Minh', 'Nguyễn Hoàng Minh'
    $dbRaw = $dbRaw -replace 'Qu[^\"]*n tr[^\"]* vi[^\"]*n Minh H[^\"]*i', 'Quản trị viên Minh Hải'

    [System.IO.File]::WriteAllText($dbPath, $dbRaw, (New-Object System.Text.UTF8Encoding $false))
    Write-Host "db.json updated successfully!"
}

# 2. Fix ops.js logic & strings
$opsPath = "$deployDir\ops.js"
if (Test-Path $opsPath) {
    $opsRaw = [System.IO.File]::ReadAllText($opsPath, [System.Text.Encoding]::UTF8)

    # Helper function at top of ops.js
    if ($opsRaw -notlike "*function isChinhNgachService*") {
        $helperCode = @"
function isChinhNgachService(st) {
  if (!st) return false;
  const s = String(st).toLowerCase();
  return (s.indexOf('ch') !== -1 && s.indexOf('ng') !== -1) || s.indexOf('chính') !== -1 || s.indexOf('ngạch') !== -1;
}
"@
        $opsRaw = $helperCode + "`n" + $opsRaw
    }

    # Replace hardcoded checks
    $opsRaw = $opsRaw -replace "w\.serviceType && w\.serviceType\.toLowerCase\(\) === '[^']+'", "isChinhNgachService(w.serviceType)"
    $opsRaw = $opsRaw -replace "l\.note\.toLowerCase\(\)\.includes\('[^']+'\)", "isChinhNgachService(l.note)"
    $opsRaw = $opsRaw -replace "i\.service && i\.service\.toLowerCase\(\) === '[^']+'", "isChinhNgachService(i.service)"

    # Service filter fix
    $opsRaw = $opsRaw -replace "if \(serviceVal !== 'all' && flow\.serviceType !== serviceVal\) return;", @"
if (serviceVal !== 'all') {
  if (serviceVal === 'chính ngạch' && !isChinhNgachService(flow.serviceType)) return;
  if (serviceVal === 'hàng lẻ' && isChinhNgachService(flow.serviceType)) return;
}
"@

    [System.IO.File]::WriteAllText($opsPath, $opsRaw, (New-Object System.Text.UTF8Encoding $false))
    Write-Host "ops.js logic updated successfully!"
}
