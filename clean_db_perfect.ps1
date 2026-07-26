$utf8NoBom = New-Object System.Text.UTF8Encoding $false
$dbPath = "d:\antigravity\db.json"
$raw = [System.IO.File]::ReadAllText($dbPath, $utf8NoBom)
if ($raw.StartsWith([char]0xFEFF)) { $raw = $raw.Substring(1) }
$db = ConvertFrom-Json $raw

function Clean-String($str) {
    if (-not $str -or $str -isnot [string]) { return $str }
    $s = $str
    $s = $s -replace 'Kh├ích Messenger Remote', 'Khách Messenger Remote'
    $s = $s -replace 'Kh├ích Messenger 999', 'Khách Messenger 999'
    $s = $s -replace 'Kh├ích Messenger', 'Khách Messenger'
    $s = $s -replace 'D├║ng T├║c', 'Dương Tóc'
    $s = $s -replace 'D├║ng t├║c', 'Dương Tóc'
    $s = $s -replace 'D╞░╞íng T├│c', 'Dương Tóc'
    $s = $s -replace 'Anh Ph╞░╞íng', 'Anh Phương'
    $s = $s -replace 'Minh Nguyß╗àn', 'Minh Nguyễn'
    $s = $s -replace 'Hu╞░╞íng Phß║ím', 'Huơng Phạm'
    $s = $s -replace 'Hu╞░╞íng Phạ', 'Huơng Phạm'
    $s = $s -replace 'Xu├ón H├ái ─É├¡nh', 'Xuân Hải Đinh'
    $s = $s -replace 'Xu├ón Hß║úi Đinh', 'Xuân Hải Đinh'
    $s = $s -replace 'Xuân Hải Dinh', 'Xuân Hải Đinh'
    $s = $s -replace '─É├¡nh Ph├║c An', 'Đinh Phúc An'
    $s = $s -replace 'Dinh Phúc An', 'Đinh Phúc An'
    $s = $s -replace 'Ho├óng Th├╣y Du╞░╞íng', 'Hoàng Thùy Dương'
    $s = $s -replace 'Phß║ím Thuß║¡n', 'Phạm Thuận'
    $s = $s -replace 'Mai Hß╗Öng VPP', 'Mai Hồng VPP'
    $s = $s -replace 'Ho├óng Ph├ít Koffmann', 'Hoàng Phát Koffmann'
    $s = $s -replace 'V├▓ng bi Ph├║ Qu├╜', 'Vòng bi Phú Quý'
    $s = $s -replace 'Nha Phuong B├╣i', 'Nha Phuong Bùi'
    $s = $s -replace 'Quß╗æc Kh├ính', 'Quốc Khánh'
    $s = $s -replace 'Minh T├ím', 'Minh Tâm'
    $s = $s -replace 'Bß║úo Ngß╗ìc Rice', 'Bảo Ngọc Rice'
    $s = $s -replace 'S╞í n Quang L├ím', 'Sơn Quang Lâm'
    $s = $s -replace 'Phß║ím Thß╗ï Anh Ngß╗ìc', 'Phạm Thị Anh Ngọc'
    $s = $s -replace 'Ho├óng C╞░╞íng Biz', 'Hoàng Cường Biz'
    $s = $s -replace 'V┼⌐ Ngß╗ìc Huyß╗ün', 'Vũ Ngọc Huyền'
    $s = $s -replace 'Trß║ºn Hiß║┐u', 'Trần Hiếu'
    $s = $s -replace 'H╞░╞íng V┼⌐', 'Hương Vũ'
    $s = $s -replace 'Ruby Nguyß╗ün', 'Ruby Nguyễn'
    $s = $s -replace 'Diß╗åm Quß╗│nh', 'Điểm Quỳnh'
    $s = $s -replace 'Điß╗âm Quß╗│nh', 'Điểm Quỳnh'
            
    $s = $s.Replace('Nhß║¡n th├┤ng tin', 'Nhận thông tin')
    $s = $s.Replace('Lß║Ñy S─ÉT', 'Lấy SĐT')
    $s = $s.Replace('Khai th├c th├┤ng tin', 'Khai thác thông tin')
    $s = $s.Replace('B├o gi├', 'Báo giá')
    $s = $s.Replace('Th╞░╞ng l╞░ß╗ng', 'Thương lượng')
    $s = $s.Replace('Th├nh c├┤ng', 'Thành công')
    $s = $s.Replace('Thß║Ñt bß║i', 'Thất bại')
    $s = $s.Replace('─É', 'Đ').Replace('─æ', 'đ')
    $s = $s.Replace('├║', 'ú').Replace('├í', 'á').Replace('├¡', 'í').Replace('├┤', 'ô')
    $s = $s.Replace('├¬', 'ê').Replace('├á', 'à').Replace('├¿', 'è').Replace('├╣', 'ù').Replace('├╜', 'ý')
    $s = $s.Replace('ß╗a', 'ẩ').Replace('ß╗å', 'ổ').Replace('ß╗à', 'ề').Replace('ß╗ï', 'ị')
    $s = $s.Replace('ß╗ì', 'ỉ').Replace('ß╗Å', 'ỏ').Replace('ß╗ü', 'ụ').Replace('ß╗ñ', 'ủ')
    $s = $s.Replace('ß╗ª', 'ữ').Replace('ß╗¿', 'ừ').Replace('ß╗«', 'ứ').Replace('ß╗░', 'ử').Replace('ß╗▓', 'ữ')
    $s = $s.Replace('ß║ím', 'ạm').Replace('ß║í', 'ạ').Replace('ß║º', 'ầ').Replace('ß║┐', 'ế')
    $s = $s.Replace('ß║╜', 'ẽ').Replace('ß║╖', 'ặt').Replace('ß╗ì', 'ỉ').Replace('ß╗ö', 'ố')
    $s = $s.Replace('ß║╢', 'ắ').Replace('ß║¡', 'ận').Replace('ß║╟', 'ẵ').Replace('ß║«', 'ẳ')
    $s = $s.Replace('ß║▒', 'ằ').Replace('ß║¯', 'ắ').Replace('ß║£', 'ả')
    $s = $s.Replace('ß║¥', 'ấ').Replace('ß║§', 'ẩ').Replace('ß║¨', 'ẫ')
    $s = $s.Replace('ß║©', 'ậ').Replace('ß║ª', 'ẽ').Replace('ß║®', 'ẽ')
    $s = $s.Replace('ß║°', 'ề').Replace('ß║±', 'ể').Replace('ß║²', 'ễ')
    $s = $s.Replace('ß║³', 'ệ').Replace('ß║´', 'ỉ').Replace('ß║¶', 'ọ')
    $s = $s.Replace('ß║·', 'ỏ').Replace('ß║¸', 'ố').Replace('ß║º', 'ổ')
    $s = $s.Replace('ß║»', 'ỗ').Replace('ß║¼', 'ộ').Replace('ß║½', 'ớ').Replace('ß║¾', 'ờ')
    $s = $s.Replace('ß║¿', 'ở').Replace('b─âng', 'băng').Replace('l╞░ß╗¢i', 'lưới')
    $s = $s.Replace('th╞░ß╗¥ng', 'thường').Replace('k├¡ch', 'kích').Replace('th╞░ß╗¢c', 'thước')
    $s = $s.Replace('bß║n', 'bản').Replace('rß╗Öng', 'rộng').Replace('nß║╖ng', 'nặng')
    return $s
}

if ($db.leads) {
    foreach ($lead in $db.leads) {
        $lead.name = Clean-String $lead.name
        $lead.note = Clean-String $lead.note
        $lead.failReason = Clean-String $lead.failReason
        $lead.source = Clean-String $lead.source
        if ($lead.steps) {
            foreach ($st in $lead.steps) {
                $st.name = Clean-String $st.name
                $st.note = Clean-String $st.note
            }
        }
    }
}

$cleanJson = ConvertTo-Json $db -Depth 100
[System.IO.File]::WriteAllText($dbPath, $cleanJson, $utf8NoBom)
Write-Output "Cleaned all leads in db.json successfully!"
