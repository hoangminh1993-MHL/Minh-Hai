$utf8NoBom = New-Object System.Text.UTF8Encoding $false
$dbPath = "d:\antigravity\db.json"
$text = [System.IO.File]::ReadAllText($dbPath, $utf8NoBom)

# Specific lead name fixes
$names = @{
    'Kh├ích Messenger Remote' = 'Khách Messenger Remote'
    'Kh├ích Messenger 999' = 'Khách Messenger 999'
    'D├║ng T├║c' = 'Dương Tóc'
    'D├║ng t├║c' = 'Dương Tóc'
    'D╞░╞íng T├│c' = 'Dương Tóc'
    'Anh Ph╞░╞íng' = 'Anh Phương'
    'Minh Nguyß╗àn' = 'Minh Nguyễn'
    'Hu╞░╞íng Phß║ím' = 'Huơng Phạm'
    'Xu├ón H├ái ─É├¡nh' = 'Xuân Hải Đinh'
    'Xu├ón Hß║úi Đinh' = 'Xuân Hải Đinh'
    '─É├¡nh Ph├║c An' = 'Đinh Phúc An'
    'Dinh Phúc An' = 'Đinh Phúc An'
    'Ho├óng Th├╣y Du╞░╞íng' = 'Hoàng Thùy Dương'
    'Phß║ím Thuß║¡n' = 'Phạm Thuận'
    'Mai Hß╗Öng VPP' = 'Mai Hồng VPP'
    'Ho├óng Ph├ít Koffmann' = 'Hoàng Phát Koffmann'
    'V├▓ng bi Ph├║ Qu├╜' = 'Vòng bi Phú Quý'
    'Nha Phuong B├╣i' = 'Nha Phuong Bùi'
    'Quß╗æc Kh├ính' = 'Quốc Khánh'
    'Minh T├ím' = 'Minh Tâm'
    'Bß║úo Ngß╗ìc Rice' = 'Bảo Ngọc Rice'
    'S╞í n Quang L├ím' = 'Sơn Quang Lâm'
    'Phß║ím Thß╗ï Anh Ngß╗ìc' = 'Phạm Thị Anh Ngọc'
    'Ho├óng C╞░╞íng Biz' = 'Hoàng Cường Biz'
    'V┼⌐ Ngß╗ìc Huyß╗ün' = 'Vũ Ngọc Huyền'
    'Trß║ºn Hiß║┐u' = 'Trần Hiếu'
    'H╞░╞íng V┼⌐' = 'Hương Vũ'
    'Ruby Nguyß╗ün' = 'Ruby Nguyễn'
    'Diß╗åm Quß╗│nh' = 'Điểm Quỳnh'
    'Điß╗âm Quß╗│nh' = 'Điểm Quỳnh'
    'Nhß║¡n th├┤ng tin' = 'Nhận thông tin'
    'Lß║Ñy S─ÉT' = 'Lấy SĐT'
    'Khai th├c th├┤ng tin' = 'Khai thác thông tin'
    'B├o gi├' = 'Báo giá'
    'Th╞░╞ng l╞░ß╗ng' = 'Thương lượng'
    'Th├nh c├┤ng' = 'Thành công'
    'Thß║Ñt bß║i' = 'Thất bại'
}

foreach ($k in $names.Keys) {
    $text = $text.Replace($k, $names[$k])
}

# Perform general Mojibake character cleanups
$text = $text.Replace('─É', 'Đ').Replace('─æ', 'đ')
$text = $text.Replace('├║', 'ú').Replace('├í', 'á').Replace('├¡', 'í').Replace('├┤', 'ô')
$text = $text.Replace('├¬', 'ê').Replace('├á', 'à').Replace('├¿', 'è').Replace('├╣', 'ù').Replace('├╜', 'ý')
$text = $text.Replace('ß╗a', 'ẩ').Replace('ß╗å', 'ổ').Replace('ß╗à', 'ề').Replace('ß╗ï', 'ị')
$text = $text.Replace('ß╗ì', 'ỉ').Replace('ß╗Å', 'ỏ').Replace('ß╗ü', 'ụ').Replace('ß╗ñ', 'ủ')
$text = $text.Replace('ß╗ª', 'ữ').Replace('ß╗¿', 'ừ').Replace('ß╗«', 'ứ').Replace('ß╗░', 'ử').Replace('ß╗▓', 'ữ')
$text = $text.Replace('ß║ím', 'ạm').Replace('ß║í', 'ạ').Replace('ß║º', 'ầ').Replace('ß║┐', 'ế')
$text = $text.Replace('ß║╜', 'ẽ').Replace('ß║╖', 'ặt').Replace('ß╗ö', 'ố')
$text = $text.Replace('ß║╢', 'ắ').Replace('ß║¡', 'ận').Replace('ß║╟', 'ẵ').Replace('ß║«', 'ẳ')
$text = $text.Replace('ß║▒', 'ằ').Replace('ß║¯', 'ắ').Replace('ß║£', 'ả')
$text = $text.Replace('ß║¥', 'ấ').Replace('ß║§', 'ẩ').Replace('ß║¨', 'ẫ')
$text = $text.Replace('ß║©', 'ậ').Replace('ß║ª', 'ẽ').Replace('ß║®', 'ẽ')
$text = $text.Replace('ß║°', 'ề').Replace('ß║±', 'ể').Replace('ß║²', 'ễ')
$text = $text.Replace('ß║³', 'ệ').Replace('ß║´', 'ỉ').Replace('ß║¶', 'ọ')
$text = $text.Replace('ß║·', 'ỏ').Replace('ß║¸', 'ố').Replace('ß║º', 'ổ')
$text = $text.Replace('ß║»', 'ỗ').Replace('ß║¼', 'ộ').Replace('ß║½', 'ớ').Replace('ß║¾', 'ờ')
$text = $text.Replace('ß║¿', 'ở').Replace('b─âng', 'băng').Replace('l╞░ß╗¢i', 'lưới')
$text = $text.Replace('th╞░ß╗¥ng', 'thường').Replace('k├¡ch', 'kích').Replace('th╞░ß╗¢c', 'thước')
$text = $text.Replace('bß║n', 'bản').Replace('rß╗Öng', 'rộng').Replace('nß║╖ng', 'nặng')

[System.IO.File]::WriteAllText($dbPath, $text, $utf8NoBom)
Write-Output "PowerShell db.json clean completed!"
