$resolvedPath = Get-ChildItem -Path "C:\Users\admin\Downloads" -Filter "*leads fanpage.xlsx" | Select-Object -ExpandProperty FullName
$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
try {
    $workbook = $excel.Workbooks.Open($resolvedPath)
    $sheet = $workbook.Sheets.Item(1)
    for ($col = 1; $col -le 15; $col++) {
        $val = $sheet.Cells.Item(9, $col).Value2
        Write-Output "Col ${col}: $val"
    }
    $workbook.Close($false)
} finally {
    $excel.Quit()
}
