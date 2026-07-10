# PowerShell Script to Sync/Import leads from the Excel File
$resolvedPath = Get-ChildItem -Path "C:\Users\admin\Downloads" -Filter "*leads fanpage.xlsx" | Select-Object -ExpandProperty FullName
if (-not $resolvedPath) {
    Write-Error "Could not find any file matching '*leads fanpage.xlsx' in Downloads!"
    exit 1
}
Write-Output "Syncing Excel File: $resolvedPath"

# Unicode Strings Construction to prevent encoding issues
$sourceKHCu = "KH c" + [char]0x0169
$sourceCaNhan = "C" + [char]0x00E1 + " nh" + [char]0x00E2 + "n"
$sourceGioiThieu = "Gi" + [char]0x1EDB + "i thi" + [char]0x1EC7 + "u"
$failReasonText = "Kh" + [char]0x00E1 + "ch h" + [char]0x00E0 + "ng ko quan t" + [char]0x00E2 + "m"

# Functions for mapping (using accent-insensitive safe regex matching)
function Remove-Diacritics($string) {
    if (-not $string) { return "" }
    $normalized = $string.Normalize([System.Text.NormalizationForm]::FormD)
    $sb = New-Object System.Text.StringBuilder
    foreach ($c in $normalized.ToCharArray()) {
        if ([System.Globalization.CharUnicodeInfo]::GetUnicodeCategory($c) -ne [System.Globalization.UnicodeCategory]::NonSpacingMark) {
            $null = $sb.Append($c)
        }
    }
    return $sb.ToString().Normalize([System.Text.NormalizationForm]::FormC)
}

function Get-SalesId($cskh) {
    if (-not $cskh) { return "usr-admin" }
    $cskhClean = Remove-Diacritics($cskh.ToLower().Trim())
    if ($cskhClean -match "minh" -and $cskhClean -match "phuong") { return "usr-3" }
    if ($cskhClean -match "m.phuong") { return "usr-3" }
    if ($cskhClean -match "bich" -and $cskhClean -match "phuong") { return "usr-7" }
    if ($cskhClean -match "phuong") { return "usr-7" }
    if ($cskhClean -match "trang") { return "usr-6" }
    if ($cskhClean -match "tu" -and $cskhClean -match "anh") { return "usr-2" }
    return "usr-admin"
}

function Get-Source($sourceText) {
    if (-not $sourceText) { return "Fanpage" }
    $src = Remove-Diacritics($sourceText.ToLower().Trim())
    if ($src -match "page" -or $src -match "fanpage") { return "Fanpage" }
    if ($src -match "cu") { return "KH cu" }
    if ($src -match "bni") { return "BNI" }
    if ($src -match "gt") { return "GT" }
    if ($src -match "nhan") { return "Ca nhan" }
    if ($src -match "gioi" -or $src -match "thieu" -or $src -match "dong" -or $src -match "cong") { return "Gioi thieu" }
    return "Fanpage"
}

function Get-Stage($statusText) {
    if (-not $statusText) { return "receive_info" }
    $st = Remove-Diacritics($statusText.ToLower().Trim())
    if ($st -match "cham" -or $st -match "soc") { return "get_phone" }
    if ($st -match "thanh" -or $st -match "cong") { return "success" }
    if ($st -match "khong" -or $st -match "quan" -or $st -match "tam") { return "failed" }
    return "receive_info"
}

function Convert-ExcelDate($val) {
    if (-not $val) { 
        return (Get-Date -Format "yyyy-MM-dd") 
    }
    if ($val -as [double]) {
        try {
            return [datetime]::FromOADate($val).ToString("yyyy-MM-dd")
        } catch {
            return (Get-Date -Format "yyyy-MM-dd")
        }
    }
    return $val
}

# Load current state from the local API server
$stateUrl = "http://localhost:3000/api/state"
try {
    $state = Invoke-RestMethod -Uri $stateUrl -Method Get
    Write-Output "Successfully loaded current database state."
} catch {
    Write-Error "Failed to load current CRM database state."
    exit 1
}

# Open Excel workbook
$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
try {
    $workbook = $excel.Workbooks.Open($resolvedPath)
    $sheet = $workbook.Sheets.Item(1)
    $lastRow = $sheet.UsedRange.Rows.Count
    Write-Output "Found sheet '$($sheet.Name)' with $lastRow rows of data."
    
    $importedCount = 0
    $updatedCount = 0
    
    # Initialize leads array if null or clear old Excel leads if needed, but standard merge is better
    if ($null -eq $state.leads) {
        $state.leads = @()
    }
    
    for ($row = 2; $row -le $lastRow; $row++) {
        $contactDateVal = $sheet.Cells.Item($row, 1).Value2
        $name = $sheet.Cells.Item($row, 2).Value2
        $statusVal = $sheet.Cells.Item($row, 3).Value2
        $clientCode = $sheet.Cells.Item($row, 4).Value2
        $cskh = $sheet.Cells.Item($row, 5).Value2
        $phoneVal = $sheet.Cells.Item($row, 6).Value2
        $sourceVal = $sheet.Cells.Item($row, 7).Value2
        $noteVal = $sheet.Cells.Item($row, 9).Value2
        $failReasonVal = $sheet.Cells.Item($row, 12).Value2
        
        # Skip if name is empty
        if (-not $name) { continue }
        
        $name = "$name".Trim()
        $phone = if ($phoneVal) { "$phoneVal".Trim() } else { "" }
        
        # Source Mapping (normalized mapping to final display values)
        $mappedSourceCode = Get-Source "$sourceVal"
        $source = "Fanpage"
        if ($mappedSourceCode -eq "KH cu") { $source = $sourceKHCu }
        elseif ($mappedSourceCode -eq "BNI") { $source = "BNI" }
        elseif ($mappedSourceCode -eq "GT") { $source = "GT" }
        elseif ($mappedSourceCode -eq "Ca nhan") { $source = $sourceCaNhan }
        elseif ($mappedSourceCode -eq "Gioi thieu") { $source = $sourceGioiThieu }
        
        $salesId = Get-SalesId "$cskh"
        
        # Resolve stage
        $stage = Get-Stage "$statusVal"
        
        # Rule: các khách có sdt thì chuyển sang cột Lấy sdt (if not success or failed)
        if ($phone -and $phone -match "\d" -and $stage -ne "success" -and $stage -ne "failed") {
            $stage = "get_phone"
        }
        
        $dateStr = Convert-ExcelDate $contactDateVal
        
        # Determine fail reason
        $failReason = $null
        if ($stage -eq "failed") {
            $failReason = $failReasonText
            if ($failReasonVal) {
                $failReason = "$failReasonVal".Trim()
            }
        }
        
        # Build note
        $note = ""
        $tagText = "M" + [char]0x00E3 + " KH: "
        if ($clientCode) { $note += "[$tagText$clientCode] " }
        if ($noteVal) { $note += "$noteVal" }
        
        # Format times
        $nowStr = (Get-Date -Format "yyyy-MM-dd HH:mm")
        
        # Search for existing lead to merge/update
        $existingLead = $null
        foreach ($l in $state.leads) {
            # Match by phone (if not empty) or name
            if (($phone -and $l.phone -eq $phone) -or ($l.name.ToLower().Trim() -eq $name.ToLower().Trim())) {
                $existingLead = $l
                break
            }
        }
        
        if ($null -ne $existingLead) {
            # Update fields
            $existingLead.stage = $stage
            if ($phone) { $existingLead.phone = $phone }
            $existingLead.source = $source
            $existingLead.salesId = $salesId
            $existingLead.note = $note
            $existingLead.failReason = $failReason
            $existingLead.updatedTime = $nowStr
            $updatedCount++
        } else {
            # Create new lead
            $newLead = @{
                id = "lead-excel-$row-$(Get-Random -Minimum 100 -Maximum 999)"
                name = $name
                phone = $phone
                source = $source
                valRmb = 0
                valVnd = 0
                note = $note
                salesId = $salesId
                stage = $stage
                failReason = $failReason
                date = $dateStr
                createdTime = "$dateStr 09:00"
                updatedTime = $nowStr
            }
            $state.leads += $newLead
            $importedCount++
        }
    }
    
    $workbook.Close($false)
    Write-Output "Finished parsing Excel data. New: $importedCount, Updated: $updatedCount."
    
    # Save the updated state to the local API server
    $jsonBody = ConvertTo-Json $state -Depth 10 -Compress
    $postResponse = Invoke-RestMethod -Uri $stateUrl -Method Post -Body $jsonBody -ContentType "application/json; charset=utf-8"
    Write-Output "Successfully synchronized state with the server database!"
    
} catch {
    Write-Error $_.Exception.Message
} finally {
    $excel.Quit()
    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($excel) | Out-Null
}
