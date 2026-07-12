param(
    [switch]$HttpServer
)

if ($HttpServer) {
    # internal HTTP web server listening on port 3001
    $port = 3001
    $listener = New-Object System.Net.HttpListener
    $listener.Prefixes.Add("http://localhost:$port/")
    $listener.Prefixes.Add("http://127.0.0.1:$port/")

    function Initialize-Database {
        $dbPath = Join-Path $PSScriptRoot "db.json"
        if (Test-Path $dbPath) { return }
        
        $initialJson = @'
{
  "users": [
    {
      "id": "usr-admin",
      "name": "Quản trị viên Minh Hải",
      "username": "admin",
      "password": "minhhai_admin_2026",
      "role": "admin",
      "points": 0,
      "avatar": "fa-user-tie"
    }
  ],
  "leads": [],
  "tasks": [],
  "workflows": {
    "sales": ["Nhận thông tin", "Lấy SĐT", "Báo giá", "Thương lượng", "Thành công", "Thất bại"],
    "sourcing": ["Nhận yêu cầu đặt hàng", "Tìm nguồn & Đàm phán giá", "Yêu cầu khách cọc", "Mua hàng & Thanh toan tệ (RMB)", "Hàng về kho Quảng Châu"],
    "warehouse": ["Nhận hàng tại Quảng Châu", "Kiểm đếm & Đóng bao gỗ", "Xuất kho Trung Quốc", "Thông quan biên giới", "Nhập kho đích (HN/SG)", "Giao hàng thành công"],
    "admin": ["Nhận phiếu yêu cầu chi", "Kế toán phê duyệt thanh toán", "Đối soát công nợ cuối tháng"]
  },
  "sausageLogs": [],
  "notifications": [],
  "currentUserId": "usr-admin",
  "fbConfig": {
    "accessToken": "",
    "pageUrl": ""
  }
}
'@
        Set-Content -Path $dbPath -Value $initialJson -Encoding UTF8
        Write-Host "Database db.json initialized successfully." -ForegroundColor Green
    }

    function Add-LeadFromWebhook($senderId, $messageText) {
        $dbPath = Join-Path $PSScriptRoot "db.json"
        if (Test-Path $dbPath) {
            $json = Get-Content $dbPath -Raw -Encoding UTF8
            $state = ConvertFrom-Json $json
        } else {
            $state = @{
                leads = @()
                users = @()
                tasks = @()
                workflows = @{}
                sausageLogs = @()
                notifications = @()
            }
        }

        # Generate a unique ID and current date
        $leadId = "lead-fb-" + [Guid]::NewGuid().ToString().Substring(0,8)
        $now = Get-Date -Format "yyyy-MM-dd"
        $timeStr = Get-Date -Format "yyyy-MM-dd HH:mm"

        # Default to a placeholder name
        $clientName = "Khach FB ($senderId)"

        # Try to resolve sender name via Facebook Graph API using the Access Token
        if ($state.fbConfig -and $state.fbConfig.accessToken) {
            $accessToken = $state.fbConfig.accessToken
            try {
                $uri = "https://graph.facebook.com/v20.0/$senderId`?fields=first_name,last_name&access_token=$accessToken"
                Write-Output "Querying FB Graph API: $uri"
                $profile = Invoke-RestMethod -Uri $uri -Method Get -TimeoutSec 3 -ErrorAction Stop
                if ($profile -and $profile.first_name) {
                    $clientName = ($profile.first_name + " " + $profile.last_name).Trim()
                    Write-Output "Resolved sender profile name: $clientName"
                }
            }
            catch {
                Write-Output "Failed to resolve FB profile: $_"
            }
        }
        
        # Randomly assign a staff or manager user
        $salesUsers = @()
        if ($state.users) {
            foreach ($u in $state.users) {
                if ($u.role -eq "staff" -or $u.role -eq "manager") {
                    $salesUsers += $u
                }
            }
        }
        
        $assignedSalesId = "usr-admin"
        $assignedSalesName = "Quan tri vien"
        if ($salesUsers.Length -gt 0) {
            $randIndex = Get-Random -Minimum 0 -Maximum $salesUsers.Length
            $assignedSalesId = $salesUsers[$randIndex].id
            $assignedSalesName = $salesUsers[$randIndex].name
        }

        $newLead = @{
            id = $leadId
            name = $clientName
            phone = ""
            source = "Fanpage"
            valRmb = 0
            valVnd = 0
            note = "[Tin nhan tu Fanpage]: $messageText"
            salesId = $assignedSalesId
            stage = "receive_info"
            failReason = $null
            date = $now
            createdTime = $timeStr
            updatedTime = $timeStr
        }

        # Push to leads list
        $state.leads += $newLead

        # Push a system notification
        $newNotif = @{
            id = "notif-" + [Guid]::NewGuid().ToString().Substring(0,8)
            title = "Tin nhan tu Fanpage"
            text = "Khach hang $clientName vua nhan tin. Da them vao CRM va giao cho Sales $assignedSalesName."
            read = $false
            time = $timeStr
        }
        $state.notifications += $newNotif

        # Save to db.json
        $newJson = ConvertTo-Json -InputObject $state -Depth 10
        Set-Content -Path $dbPath -Value $newJson -Encoding UTF8
        Write-Output "Automatically created Lead: $clientName and assigned to $assignedSalesName"
    }

    try {
        $listener.Start()
        Write-Host "Internal HTTP Server running at http://localhost:$port/"
        
        # Initialize database
        Initialize-Database

        while ($listener.IsListening) {
            $context = $listener.GetContext()
            $request = $context.Request
            $response = $context.Response
            $response.KeepAlive = $false
            
            $urlPath = $request.Url.LocalPath
            $method = $request.HttpMethod
            
            # Enable CORS for local cross-origin requests
            $response.AddHeader("Access-Control-Allow-Origin", "*")
            $response.AddHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
            $response.AddHeader("Access-Control-Allow-Headers", "Content-Type")
            
            if ($method -eq "OPTIONS") {
                $response.StatusCode = 200
                $response.OutputStream.Close()
                continue
            }
            
            # 0.9 API Endpoint: GET /api/customer-health/sync
            if ($urlPath -eq "/api/customer-health/sync" -and $method -eq "GET") {
                function Get-CustomerHealthData {
                    $url = "https://docs.google.com/spreadsheets/d/1CRbubTwnm4zSrX17d7pmZIUZshvXnKjnnX6dg9fC2sg/export?format=xlsx"
                    $scratchDir = Join-Path $PSScriptRoot "scratch"
                    if (-not (Test-Path $scratchDir)) { New-Item -ItemType Directory -Path $scratchDir | Out-Null }
                    
                    $xlsxPath = Join-Path $scratchDir "temp_sheet.xlsx"
                    $extractPath = Join-Path $scratchDir "temp_sheet_extracted"
                    
                    # Download
                    Invoke-WebRequest -Uri $url -OutFile $xlsxPath
                    
                    # Extract
                    $zipPath = Join-Path $scratchDir "temp_sheet.zip"
                    if (Test-Path $zipPath) { Remove-Item -Force $zipPath }
                    Copy-Item $xlsxPath $zipPath
                    if (Test-Path $extractPath) { Remove-Item -Recurse -Force $extractPath }
                    Expand-Archive -Path $zipPath -DestinationPath $extractPath -Force
                    Remove-Item -Force $zipPath
                    
                    # Load shared strings
                    $sharedStrings = @()
                    $sharedStringsPath = Join-Path $extractPath "xl/sharedStrings.xml"
                    if (Test-Path $sharedStringsPath) {
                        $ssXml = [xml](Get-Content $sharedStringsPath)
                        if ($ssXml.sst -and $ssXml.sst.si) {
                            foreach ($si in $ssXml.sst.si) {
                                $sharedStrings += $si.t
                            }
                        }
                    }
                    
                    # Map sheets
                    $relsMap = @{}
                    $relsXmlPath = Join-Path $extractPath "xl/_rels/workbook.xml.rels"
                    if (Test-Path $relsXmlPath) {
                        $relsXml = [xml](Get-Content $relsXmlPath)
                        foreach ($rel in $relsXml.Relationships.Relationship) {
                            $relsMap[$rel.Id] = $rel.Target
                        }
                    }
                    
                    $sheets = @()
                    $workbookXmlPath = Join-Path $extractPath "xl/workbook.xml"
                    if (Test-Path $workbookXmlPath) {
                        $wbXml = [xml](Get-Content $workbookXmlPath)
                        foreach ($sheet in $wbXml.workbook.sheets.sheet) {
                            $relId = $sheet.id
                            $target = $relsMap[$relId]
                            $xmlPath = Join-Path (Join-Path $extractPath "xl") $target
                            $sheets += [PSCustomObject]@{
                                Name = $sheet.name
                                XmlPath = $xmlPath
                            }
                        }
                    }
                    
                    # Helper to get cell value
                    function Get-XmlCellValue($cellNode, $ssList) {
                        if (-not $cellNode) { return "" }
                        $v = $cellNode.v
                        if ($cellNode.t -eq "s") {
                            return $ssList[[int]$v]
                        }
                        return $v
                    }
                    
                    # Helper to parse sheet
                    function Parse-XmlSheet($sXmlPath, $ssList) {
                        if (-not (Test-Path $sXmlPath)) { return @() }
                        $sheetXml = [xml](Get-Content $sXmlPath)
                        $rows = $sheetXml.worksheet.sheetData.row
                        if (-not $rows) { return @() }
                        
                        $headerRowIdx = -1
                        $khCol = -1
                        $cskhCol = -1
                        $brandCol = -1
                        $amountCol = -1
                        $dateCol = -1
                        
                        for ($r = 0; $r -lt [Math]::Min($rows.Count, 10); $r++) {
                            $cells = $rows[$r].c
                            $hasKH = $false
                            $hasAmount = $false
                            
                            foreach ($cell in $cells) {
                                $cellVal = Get-XmlCellValue $cell $ssList
                                $valLower = "$cellVal".ToLower().Trim()
                                if ($valLower -eq "kh" -or $valLower -eq "khách hàng" -or $valLower -eq "khách") { $hasKH = $true }
                                if ($valLower -match "thu tiền" -or $valLower -eq "doanh thu") { $hasAmount = $true }
                            }
                            
                            if ($hasKH) {
                                $headerRowIdx = $r
                                foreach ($cell in $cells) {
                                    $cellVal = Get-XmlCellValue $cell $ssList
                                    $valLower = "$cellVal".ToLower().Trim()
                                    $ref = $cell.r
                                    
                                    # Safe column index computation
                                    $colIdx = [int]([char]$ref[0]) - [int][char]'A'
                                    if ($ref.Length -gt 2 -and $ref[1] -match '[A-Z]') {
                                        $colIdx = ([int]([char]$ref[0]) - [int][char]'A' + 1) * 26 + ([int]([char]$ref[1]) - [int][char]'A')
                                    }
                                    
                                    if ($valLower -eq "kh" -or $valLower -eq "khách hàng" -or $valLower -eq "khách") { $khCol = $colIdx }
                                    elseif ($valLower -eq "t" -or $valLower -eq "cskh" -or $valLower -eq "ctv" -or $valLower -eq "nhân viên") { $cskhCol = $colIdx }
                                    elseif ($valLower -eq "brand" -or $valLower -eq "hệ thống") { $brandCol = $colIdx }
                                    elseif ($valLower -match "thu tiền" -or $valLower -eq "doanh thu") { $amountCol = $colIdx }
                                    elseif ($valLower -eq "ngày" -or $valLower -eq "ngay") { $dateCol = $colIdx }
                                }
                                break
                            }
                        }
                        
                        if ($headerRowIdx -eq -1 -or $khCol -eq -1) { return @() }
                        
                        $parsed = @()
                        for ($r = $headerRowIdx + 1; $r -lt $rows.Count; $r++) {
                            $cells = $rows[$r].c
                            $khVal = ""
                            $cskhVal = ""
                            $brandVal = ""
                            $amountVal = 0.0
                            $dateVal = ""
                            
                            foreach ($cell in $cells) {
                                $ref = $cell.r
                                $colIdx = [int]([char]$ref[0]) - [int][char]'A'
                                if ($ref.Length -gt 2 -and $ref[1] -match '[A-Z]') {
                                    $colIdx = ([int]([char]$ref[0]) - [int][char]'A' + 1) * 26 + ([int]([char]$ref[1]) - [int][char]'A')
                                }
                                
                                $val = Get-XmlCellValue $cell $ssList
                                if ($colIdx -eq $khCol) { $khVal = "$val" }
                                elseif ($colIdx -eq $cskhCol) { $cskhVal = "$val" }
                                elseif ($colIdx -eq $brandCol) { $brandVal = "$val" }
                                elseif ($colIdx -eq $amountCol) {
                                    $cleanAmt = "$val" -replace '[^\d.-]', ''
                                    if ($cleanAmt) { $amountVal = [double]$cleanAmt }
                                }
                                elseif ($colIdx -eq $dateCol) {
                                    if ($val -as [double]) {
                                        $dateVal = [datetime]::FromOADate($val).ToString("yyyy-MM-dd")
                                    } else {
                                        $dateVal = "$val"
                                    }
                                }
                            }
                            
                            if ($khVal -and $khVal -ne "0" -and $khVal.ToLower() -ne "chuyển từ" -and $khVal -notmatch "tổng cộng") {
                                $parsed += @{
                                    kh = $khVal.Trim()
                                    cskh = $cskhVal.Trim()
                                    brand = $brandVal.Trim()
                                    amount = $amountVal
                                    date = $dateVal
                                }
                            }
                        }
                        return $parsed
                    }
                    
                    $customers = @{}
                    $totalT4 = 0.0; $totalT5 = 0.0; $totalT6 = 0.0; $totalT7 = 0.0;
                    
                    $targetSheets = @(
                        @{ name = "T42026"; key = "T4" }
                        @{ name = "T52026"; key = "T5" }
                        @{ name = "T62026"; key = "T6" }
                        @{ name = "T72026"; key = "T7" }
                    )
                    
                    foreach ($ts in $targetSheets) {
                        $sheetObj = $sheets | Where-Object { $_.Name -eq $ts.name }
                        if (-not $sheetObj) { continue }
                        
                        $rows = Parse-XmlSheet $sheetObj.XmlPath $sharedStrings
                        foreach ($row in $rows) {
                            $name = $row.kh
                            if (-not $customers.Contains($name)) {
                                $customers[$name] = @{
                                    name = $name
                                    cskh = if ($row.cskh) { $row.cskh } else { "Chưa giao" }
                                    brand = if ($row.brand) { $row.brand } else { "Khác" }
                                    volumeT4 = 0.0
                                    volumeT5 = 0.0
                                    volumeT6 = 0.0
                                    volumeT7 = 0.0
                                    lastShipmentDate = ""
                                    status = "healthy"
                                }
                            }
                            
                            $c = $customers[$name]
                            if ($ts.key -eq "T4") { $c.volumeT4 += $row.amount; $totalT4 += $row.amount }
                            elseif ($ts.key -eq "T5") { $c.volumeT5 += $row.amount; $totalT5 += $row.amount }
                            elseif ($ts.key -eq "T6") { $c.volumeT6 += $row.amount; $totalT6 += $row.amount }
                            elseif ($ts.key -eq "T7") { $c.volumeT7 += $row.amount; $totalT7 += $row.amount }
                            
                            if ($row.date -and ($c.lastShipmentDate -eq "" -or $row.date -gt $c.lastShipmentDate)) {
                                $c.lastShipmentDate = $row.date
                            }
                            if ($row.cskh) { $c.cskh = $row.cskh }
                            if ($row.brand) { $c.brand = $row.brand }
                        }
                    }
                    
                    $customerList = @()
                    foreach ($k in $customers.Keys) {
                        $c = $customers[$k]
                        $volT7 = $c.volumeT7
                        $volT6 = $c.volumeT6
                        $volT5 = $c.volumeT5
                        $avgPrev = ($volT6 + $volT5) / 2
                        
                        if ($volT7 -gt 0) {
                            if ($avgPrev -gt 0 -and $volT7 -lt $avgPrev * 0.7) {
                                $c.status = "warning"
                            } else {
                                $c.status = "healthy"
                            }
                        } elseif ($volT6 -gt 0) {
                            $c.status = "warning"
                        } elseif ($volT5 -gt 0) {
                            $c.status = "danger"
                        } else {
                            $c.status = "lost"
                        }
                        $customerList += $c
                    }
                    
                    return @{
                        lastSyncTime = (Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ")
                        monthlyTotals = @{
                            T4 = [Math]::Round($totalT4)
                            T5 = [Math]::Round($totalT5)
                            T6 = [Math]::Round($totalT6)
                            T7 = [Math]::Round($totalT7)
                        }
                        customers = $customerList
                    }
                }
                
                $dbPath = Join-Path $PSScriptRoot "db.json"
                if (-not (Test-Path $dbPath)) { Initialize-Database }
                $state = Get-Content $dbPath -Raw -Encoding UTF8 | ConvertFrom-Json
                
                try {
                    $healthData = Get-CustomerHealthData
                    if ($state.PSObject.Properties['customerHealthData']) {
                        $state.customerHealthData = $healthData
                    } else {
                        $state | Add-Member -MemberType NoteProperty -Name "customerHealthData" -Value $healthData -Force
                    }
                    Set-Content -Path $dbPath -Value (ConvertTo-Json -InputObject $state -Depth 10) -Encoding UTF8
                    
                    $jsonOut = ConvertTo-Json -InputObject $healthData -Depth 10
                    $bytes = [System.Text.Encoding]::UTF8.GetBytes($jsonOut)
                    $response.ContentType = "application/json; charset=utf-8"
                    $response.ContentLength64 = $bytes.Length
                    $response.OutputStream.Write($bytes, 0, $bytes.Length)
                } catch {
                    $response.StatusCode = 500
                    $errBytes = [System.Text.Encoding]::UTF8.GetBytes($_.Exception.Message)
                    $response.ContentLength64 = $errBytes.Length
                    $response.OutputStream.Write($errBytes, 0, $errBytes.Length)
                }
                
                $response.OutputStream.Close()
                continue
            }

            # 1. API Endpoint: GET /api/state
            if ($urlPath -eq "/api/state" -and $method -eq "GET") {
                $dbPath = Join-Path $PSScriptRoot "db.json"
                if (-not (Test-Path $dbPath)) {
                    Initialize-Database
                }
                $json = Get-Content $dbPath -Raw -Encoding UTF8
                $bytes = [System.Text.Encoding]::UTF8.GetBytes($json)
                
                $response.ContentType = "application/json; charset=utf-8"
                $response.ContentLength64 = $bytes.Length
                $response.OutputStream.Write($bytes, 0, $bytes.Length)
                $response.OutputStream.Close()
                continue
            }
            
            # 2. API Endpoint: POST /api/state
            if ($urlPath -eq "/api/state" -and $method -eq "POST") {
                $reader = New-Object System.IO.StreamReader($request.InputStream, [System.Text.Encoding]::UTF8)
                $json = $reader.ReadToEnd()
                $reader.Close()
                
                $dbPath = Join-Path $PSScriptRoot "db.json"
                Set-Content -Path $dbPath -Value $json -Encoding UTF8
                
                $response.StatusCode = 200
                $resBytes = [System.Text.Encoding]::UTF8.GetBytes("OK")
                $response.ContentLength64 = $resBytes.Length
                $response.OutputStream.Write($resBytes, 0, $resBytes.Length)
                $response.OutputStream.Close()
                continue
            }
            
            # 2.1 API Endpoint: POST /api/login
            if ($urlPath -eq "/api/login" -and $method -eq "POST") {
                $reader = New-Object System.IO.StreamReader($request.InputStream, [System.Text.Encoding]::UTF8)
                $body = $reader.ReadToEnd()
                $reader.Close()
                
                $data = ConvertFrom-Json -InputObject $body
                $dbPath = Join-Path $PSScriptRoot "db.json"
                $state = Get-Content $dbPath -Raw -Encoding UTF8 | ConvertFrom-Json
                
                $user = $null
                foreach ($u in $state.users) {
                    if ($u.username -and $u.username.ToLower() -eq $data.username.ToLower() -and $u.password -eq $data.password) {
                        $user = $u
                        break
                    }
                }
                
                if ($user) {
                    $resObj = @{ success = $true; user = @{ id = $user.id; name = $user.name; username = $user.username; role = $user.role } }
                    $resJson = ConvertTo-Json -InputObject $resObj
                    $response.StatusCode = 200
                } else {
                    $resObj = @{ success = $false; message = "Tai khoan hoac mat khau khong chinh xac!" }
                    $resJson = ConvertTo-Json -InputObject $resObj
                    $response.StatusCode = 401
                }
                $resBytes = [System.Text.Encoding]::UTF8.GetBytes($resJson)
                $response.ContentType = "application/json; charset=utf-8"
                $response.ContentLength64 = $resBytes.Length
                $response.OutputStream.Write($resBytes, 0, $resBytes.Length)
                $response.OutputStream.Close()
                continue
            }

            # 2.2 API Endpoint: POST /api/users
            if ($urlPath -eq "/api/users" -and $method -eq "POST") {
                $reader = New-Object System.IO.StreamReader($request.InputStream, [System.Text.Encoding]::UTF8)
                $body = $reader.ReadToEnd()
                $reader.Close()
                
                $data = ConvertFrom-Json -InputObject $body
                $dbPath = Join-Path $PSScriptRoot "db.json"
                $state = Get-Content $dbPath -Raw -Encoding UTF8 | ConvertFrom-Json
                
                $exists = $false
                foreach ($u in $state.users) {
                    if ($u.username -and $u.username.ToLower() -eq $data.username.ToLower()) {
                        $exists = $true
                        break
                    }
                }
                
                if ($exists) {
                    $resObj = @{ success = $false; message = "Ten dang nhap da ton tai!" }
                    $resJson = ConvertTo-Json -InputObject $resObj
                    $response.StatusCode = 400
                } else {
                    $newId = "usr-" + [Guid]::NewGuid().ToString().Substring(0,8)
                    $newUser = @{
                        id = $newId
                        name = $data.name
                        username = $data.username
                        password = $data.password
                        role = $data.role
                        points = 0
                        avatar = if ($data.role -eq "admin") { "fa-user-tie" } elseif ($data.role -eq "manager") { "fa-user-nurse" } else { "fa-user-ninja" }
                    }
                    $state.users += $newUser
                    Set-Content -Path $dbPath -Value (ConvertTo-Json -InputObject $state -Depth 10) -Encoding UTF8
                    $resObj = @{ success = $true; user = @{ id = $newId; name = $data.name; role = $data.role } }
                    $resJson = ConvertTo-Json -InputObject $resObj
                    $response.StatusCode = 200
                }
                $resBytes = [System.Text.Encoding]::UTF8.GetBytes($resJson)
                $response.ContentType = "application/json; charset=utf-8"
                $response.ContentLength64 = $resBytes.Length
                $response.OutputStream.Write($resBytes, 0, $resBytes.Length)
                $response.OutputStream.Close()
                continue
            }

            # 2.3 API Endpoint: DELETE /api/users
            if ($urlPath.StartsWith("/api/users/") -and $method -eq "DELETE") {
                $userId = $urlPath.Substring(11)
                $dbPath = Join-Path $PSScriptRoot "db.json"
                $state = Get-Content $dbPath -Raw -Encoding UTF8 | ConvertFrom-Json
                
                if ($userId -eq "usr-admin") {
                    $resObj = @{ success = $false; message = "Khong the xoa tai khoan Admin toi cao!" }
                    $resJson = ConvertTo-Json -InputObject $resObj
                    $response.StatusCode = 400
                } else {
                    $newUsers = @()
                    $found = $false
                    foreach ($u in $state.users) {
                        if ($u.id -eq $userId) {
                            $found = $true
                        } else {
                            $newUsers += $u
                        }
                    }
                    if ($found) {
                        $state.users = $newUsers
                        Set-Content -Path $dbPath -Value (ConvertTo-Json -InputObject $state -Depth 10) -Encoding UTF8
                        $resObj = @{ success = $true; message = "Da xoa nhan vien thanh cong!" }
                        $response.StatusCode = 200
                    } else {
                        $resObj = @{ success = $false; message = "Khong tim thay nhan vien!" }
                        $response.StatusCode = 404
                    }
                    $resJson = ConvertTo-Json -InputObject $resObj
                }
                $resBytes = [System.Text.Encoding]::UTF8.GetBytes($resJson)
                $response.ContentType = "application/json; charset=utf-8"
                $response.ContentLength64 = $resBytes.Length
                $response.OutputStream.Write($resBytes, 0, $resBytes.Length)
                $response.OutputStream.Close()
                continue
            }

            # 2.4 API Endpoint: POST /api/reset
            if ($urlPath -eq "/api/reset" -and $method -eq "POST") {
                $dbPath = Join-Path $PSScriptRoot "db.json"
                $state = Get-Content $dbPath -Raw -Encoding UTF8 | ConvertFrom-Json
                
                $state.leads = @()
                $state.tasks = @()
                $state.sausageLogs = @()
                $state.notifications = @()
                
                if ($state.users) {
                    foreach ($u in $state.users) {
                        $u.points = 0
                    }
                }
                
                Set-Content -Path $dbPath -Value (ConvertTo-Json -InputObject $state -Depth 10) -Encoding UTF8
                $resObj = @{ success = $true; message = "Database reset successfully!" }
                $resJson = ConvertTo-Json -InputObject $resObj
                $resBytes = [System.Text.Encoding]::UTF8.GetBytes($resJson)
                $response.ContentType = "application/json; charset=utf-8"
                $response.ContentLength64 = $resBytes.Length
                $response.OutputStream.Write($resBytes, 0, $resBytes.Length)
                $response.OutputStream.Close()
                continue
            }
            
            # 3. Webhook Endpoint: GET /webhook (Facebook Webhook Validation)
            if ($urlPath -eq "/webhook" -and $method -eq "GET") {
                $queryString = $request.QueryString
                $mode = $queryString["hub.mode"]
                $token = $queryString["hub.verify_token"]
                $challenge = $queryString["hub.challenge"]
                
                if ($mode -eq "subscribe" -and ($token -eq "minh_hai_verify_token_123" -or $token -eq "minhhai_verify_token_2026")) {
                    Write-Output "Webhook verified successfully!"
                    $bytes = [System.Text.Encoding]::UTF8.GetBytes($challenge)
                    $response.ContentType = "text/plain; charset=utf-8"
                    $response.ContentLength64 = $bytes.Length
                    $response.OutputStream.Write($bytes, 0, $bytes.Length)
                } else {
                    $response.StatusCode = 403
                    $errBytes = [System.Text.Encoding]::UTF8.GetBytes("Forbidden")
                    $response.ContentLength64 = $errBytes.Length
                    $response.OutputStream.Write($errBytes, 0, $errBytes.Length)
                }
                $response.OutputStream.Close()
                continue
            }
            
             # 4. Webhook Endpoint: POST /webhook (Facebook Messenger Events)
             if ($urlPath -eq "/webhook" -and $method -eq "POST") {
                 $reader = New-Object System.IO.StreamReader($request.InputStream, [System.Text.Encoding]::UTF8)
                 $bodyText = $reader.ReadToEnd()
                 $reader.Close()
                 
                 Write-Output "POST /webhook body: $bodyText"
                 try {
                     $body = ConvertFrom-Json $bodyText -ErrorAction Stop
                     Write-Output "Parsed body object: $($body.object)"
                     if ($body.object -eq "page") {
                         Write-Output "Has entry property: $($body.entry -ne $null)"
                         foreach ($entry in $body.entry) {
                             if ($entry.messaging) {
                                 foreach ($event in $entry.messaging) {
                                     $isMessage = $event.message -and !$event.message.is_echo
                                     $isPostback = $event.postback -ne $null
                                     if ($isMessage -or $isPostback) {
                                         $senderId = $event.sender.id
                                         $messageText = ""
                                         if ($isPostback) {
                                             $messageText = $event.postback.title
                                             if (!$messageText) { $messageText = $event.postback.payload }
                                             if (!$messageText) { $messageText = "[Click nút/Get Started]" }
                                         } else {
                                             $messageText = $event.message.text
                                             if (!$messageText) {
                                                 if ($event.message.attachments) { $messageText = "[Đính kèm: Ảnh/File/Audio]" }
                                                 else { $messageText = "[Tin nhắn]" }
                                             }
                                         }
                                         Write-Output "Received FB Messenger event from $senderId - $messageText"
                                         Add-LeadFromWebhook $senderId $messageText
                                     }
                                 }
                             }
                         }
                         $response.StatusCode = 200
                         $resBytes = [System.Text.Encoding]::UTF8.GetBytes("EVENT_RECEIVED")
                         $response.ContentLength64 = $resBytes.Length
                         $response.OutputStream.Write($resBytes, 0, $resBytes.Length)
                     } else {
                         $response.StatusCode = 404
                     }
                 }
                 catch {
                     Write-Output "Error parsing/processing webhook body: $_"
                     $response.StatusCode = 400
                     $errBytes = [System.Text.Encoding]::UTF8.GetBytes("Bad Request")
                     $response.ContentLength64 = $errBytes.Length
                     $response.OutputStream.Write($errBytes, 0, $errBytes.Length)
                 }
                 $response.OutputStream.Close()
                 continue
             }
            
            # 5. Serve Static Files (HTML, CSS, JS, etc.)
            if ($urlPath -eq "/") {
                $urlPath = "/index.html"
            }
            
            $cleanPath = $urlPath.Replace("..", "").TrimStart('/')
            $filePath = Join-Path $PSScriptRoot $cleanPath
            
            if (Test-Path $filePath -PathType Leaf) {
                $bytes = [System.IO.File]::ReadAllBytes($filePath)
                
                $ext = [System.IO.Path]::GetExtension($filePath)
                $contentType = "text/html; charset=utf-8"
                if ($ext -eq ".css") { $contentType = "text/css; charset=utf-8" }
                elseif ($ext -eq ".js") { $contentType = "application/javascript; charset=utf-8" }
                elseif ($ext -eq ".png") { $contentType = "image/png" }
                elseif ($ext -eq ".jpg" -or $ext -eq ".jpeg") { $contentType = "image/jpeg" }
                elseif ($ext -eq ".svg") { $contentType = "image/svg+xml" }
                elseif ($ext -eq ".ico") { $contentType = "image/x-icon" }
                
                $response.ContentType = $contentType
                $response.AddHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
                $response.AddHeader("Pragma", "no-cache")
                $response.AddHeader("Expires", "0")
                $response.ContentLength64 = $bytes.Length
                $response.OutputStream.Write($bytes, 0, $bytes.Length)
            } else {
                $response.StatusCode = 404
                $response.ContentType = "text/plain; charset=utf-8"
                $errMsg = "File Not Found: $urlPath"
                $errBytes = [System.Text.Encoding]::UTF8.GetBytes($errMsg)
                $response.ContentLength64 = $errBytes.Length
                $response.OutputStream.Write($errBytes, 0, $errBytes.Length)
            }
            
            $response.OutputStream.Close()
        }
    }
    catch {
        Write-Error $_.Exception.Message
    }
    finally {
        if ($listener.IsListening) {
            $listener.Stop()
        }
    }
} else {
    # Foreground process: Starts internal http server on 3001, and runs a TCP proxy on port 3000 to bypass http.sys host validation
    $ScriptPath = if ($PSCommandPath) { $PSCommandPath } else { Join-Path $PSScriptRoot "server.ps1" }
    $outLog = Join-Path $PSScriptRoot "server_http_out.log"
    $errLog = Join-Path $PSScriptRoot "server_http_err.log"
    Remove-Item $outLog -ErrorAction SilentlyContinue
    Remove-Item $errLog -ErrorAction SilentlyContinue

    $runningServerTask = Start-Process -FilePath "powershell.exe" -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$ScriptPath`" -HttpServer" -RedirectStandardOutput $outLog -RedirectStandardError $errLog -WindowStyle Hidden -PassThru
    Write-Host "Started internal HTTP server (PID: $($runningServerTask.Id)) on port 3001." -ForegroundColor Green
    
    $csharpSource = @'
using System;
using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Threading.Tasks;

public class TcpProxy {
    private static TcpListener listener;
    private static int targetPort;
    private static bool running = false;

    public static void Start(int listenPort, int webPort) {
        if (running) return;
        targetPort = webPort;
        listener = new TcpListener(IPAddress.Any, listenPort);
        listener.Start();
        running = true;
        
        Task.Run(async () => {
            while (running) {
                try {
                    TcpClient client = await listener.AcceptTcpClientAsync();
                    Task t = HandleClientAsync(client);
                } catch (Exception ex) { Console.WriteLine("Proxy accept error: " + ex.ToString()); }
            }
        });
    }

    public static void Stop() {
        running = false;
        if (listener != null) {
            listener.Stop();
        }
    }

    private static async Task HandleClientAsync(TcpClient client) {
        try {
            Console.WriteLine("Proxy received connection from " + client.Client.RemoteEndPoint);
            client.ReceiveTimeout = 60000;
            client.SendTimeout = 60000;
            using (client)
            using (NetworkStream clientStream = client.GetStream()) {
                byte[] buffer = new byte[16384];
                int bytesRead = await clientStream.ReadAsync(buffer, 0, buffer.Length);
                if (bytesRead <= 0) {
                    Console.WriteLine("Proxy read 0 bytes, closing connection.");
                    return;
                }

                string requestText = Encoding.UTF8.GetString(buffer, 0, bytesRead);
                Console.WriteLine("Proxy read " + bytesRead + " bytes. Request headers:\n" + requestText.Substring(0, Math.Min(500, requestText.Length)));
                string rewritten = requestText;
                
                int hostIndex = rewritten.IndexOf("Host:", StringComparison.OrdinalIgnoreCase);
                if (hostIndex >= 0) {
                    int lineEnd = rewritten.IndexOf("\r\n", hostIndex);
                    if (lineEnd >= 0) {
                        rewritten = rewritten.Substring(0, hostIndex) + "Host: localhost:" + targetPort + rewritten.Substring(lineEnd);
                    }
                }

                using (TcpClient server = new TcpClient("127.0.0.1", targetPort)) {
                    server.ReceiveTimeout = 60000;
                    server.SendTimeout = 60000;
                    using (NetworkStream serverStream = server.GetStream()) {
                        byte[] reqBytes = Encoding.UTF8.GetBytes(rewritten);
                        await serverStream.WriteAsync(reqBytes, 0, reqBytes.Length);
                        await serverStream.FlushAsync();

                        // Run parallel bi-directional copy tasks
                        Task clientToServer = CopyStreamAsync(clientStream, serverStream);
                        Task serverToClient = CopyStreamAsync(serverStream, clientStream);

                        await Task.WhenAny(clientToServer, serverToClient);
                    }
                }
            }
        } catch (Exception ex) { Console.WriteLine("Proxy handler error: " + ex.ToString()); }
    }

    private static async Task CopyStreamAsync(NetworkStream input, NetworkStream output) {
        try {
            byte[] buffer = new byte[16384];
            int read;
            while ((read = await input.ReadAsync(buffer, 0, buffer.Length)) > 0) {
                await output.WriteAsync(buffer, 0, read);
                await output.FlushAsync();
            }
        } catch {}
    }
}
'@

    Add-Type -TypeDefinition $csharpSource
    
    try {
        [TcpProxy]::Start(3000, 3001)
        Write-Host "TCP Proxy listening on port 3000 (redirecting to 3001 with Host rewrite)..." -ForegroundColor Green
        Write-Host "Press Ctrl+C to exit."
        while ($true) {
            Start-Sleep -Seconds 1
        }
    }
    catch {
        Write-Host "Proxy server error: $_" -ForegroundColor Red
    }
    finally {
        [TcpProxy]::Stop()
        if ($runningServerTask) {
            Stop-Process -Id $runningServerTask.Id -Force -ErrorAction SilentlyContinue
            Write-Host "Stopped internal HTTP server."
        }
    }
}
