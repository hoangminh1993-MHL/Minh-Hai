$dbPath = "d:\antigravity\minhhai_crm_deploy\db.json"
if (Test-Path $dbPath) {
    $dbRaw = [System.IO.File]::ReadAllText($dbPath, [System.Text.Encoding]::UTF8)

    $dbRaw = $dbRaw -replace 'ch[^\"]*ng[^\"]*ch', 'chính ngạch'
    $dbRaw = $dbRaw -replace 'h[^\"]*ng l[^\"]*', 'hàng lẻ'

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

    $dbRaw = $dbRaw -replace 'B[^\"]*ng Tu[^\"]*ng', 'Bằng Tường'
    $dbRaw = $dbRaw -replace 'H[^\"]* N[^\"]*i', 'Hà Nội'
    $dbRaw = $dbRaw -replace 'H[^\"]*i Ph[^\"]*ng', 'Hải Phòng'

    $dbRaw = $dbRaw -replace 'Nguy[^\"]*n Ho[^\"]*ng Minh', 'Nguyễn Hoàng Minh'
    $dbRaw = $dbRaw -replace 'Qu[^\"]*n tr[^\"]* vi[^\"]*n Minh H[^\"]*i', 'Quản trị viên Minh Hải'

    [System.IO.File]::WriteAllText($dbPath, $dbRaw, (New-Object System.Text.UTF8Encoding $false))
    Write-Host "db.json cleaned!"
}
