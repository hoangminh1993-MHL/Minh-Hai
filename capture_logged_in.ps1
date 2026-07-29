$edgePath = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
if (-not (Test-Path $edgePath)) { $edgePath = "C:\Program Files\Microsoft\Edge\Application\msedge.exe" }

$outImg = "C:\Users\admin\.gemini\antigravity-ide\brain\9c13f1e0-284e-4ab0-9990-4cd3a100827c\crm_board_v21_35_verified_master.png"
if (Test-Path $outImg) { Remove-Item $outImg -Force }

$profileDir = "d:\antigravity\edge_profile"
if (-not (Test-Path $profileDir)) { New-Item -ItemType Directory -Path $profileDir -Force }

$proc = Start-Process -FilePath $edgePath -ArgumentList "--headless", "--disable-gpu", "--remote-debugging-port=9222", "--user-data-dir=$profileDir", "--window-size=1680,1050", "about:blank" -PassThru
Start-Sleep -Seconds 2

try {
    $wc = New-Object System.Net.WebClient
    $json = $wc.DownloadString("http://127.0.0.1:9222/json/list")
    if ($json -match '"webSocketDebuggerUrl":\s*"([^"]+)"') {
        $wsUrl = $matches[1]
        $ws = New-Object System.Net.WebSockets.ClientWebSocket
        $cts = New-Object System.Threading.CancellationTokenSource
        $ws.ConnectAsync([Uri]$wsUrl, $cts.Token).Wait()

        # 1. Navigate to login page
        $navMsg = '{"id":1, "method":"Page.navigate", "params":{"url":"https://minh-hai.onrender.com/login.html"}}'
        $bytes = [System.Text.Encoding]::UTF8.GetBytes($navMsg)
        $ws.SendAsync([ArraySegment[byte]]$bytes, [System.Net.WebSockets.WebSocketMessageType]::Text, $true, $cts.Token).Wait()

        Start-Sleep -Seconds 4

        # 2. Fill login form and submit
        $loginJs = @"
            document.getElementById('username').value = 'hoangminh';
            document.getElementById('password').value = 'Hoangminh93!0911';
            const btn = document.querySelector('button[type="submit"]') || document.querySelector('.btn-primary');
            if (btn) btn.click();
"@
        $evalMsg = '{"id":2, "method":"Runtime.evaluate", "params":{"expression":' + ($loginJs | ConvertTo-Json) + '}}'
        $bytes = [System.Text.Encoding]::UTF8.GetBytes($evalMsg)
        $ws.SendAsync([ArraySegment[byte]]$bytes, [System.Net.WebSockets.WebSocketMessageType]::Text, $true, $cts.Token).Wait()

        Start-Sleep -Seconds 6

        # 3. Navigate to CRM, sync state and open card modal popup & test Ghim
        $crdJs = @"
            (async () => {
                if (typeof navigateToView === 'function') navigateToView('crm');
                const res = await fetch('/api/state?t=' + Date.now());
                const data = await res.json();
                if (data && data.leads) {
                    AppState.leads = data.leads;
                }
                if (typeof renderCRMBoard === 'function') renderCRMBoard();
                
                const testLead = (AppState.leads || []).find(l => l.name === 'test') || (AppState.leads || [])[0];
                if (testLead) {
                    openLeadDetailModal(testLead.id);
                    if (typeof handleLeadAddStepFile === 'function') {
                        handleLeadAddStepFile('Tai_Lieu_Bao_Gia_Lo_Hang.pdf', 'https://docs.google.com/document/d/123456');
                    }
                }
                
                if (typeof openModal === 'function') openModal('modal-lead-detail');
                if (typeof renderActiveLeadStepPanel === 'function') renderActiveLeadStepPanel();
                const container = document.getElementById('lead-step-files-list');
                return 'Files container HTML: ' + (container ? container.innerHTML : 'container not found');
            })()
"@
        $evalMsg2 = '{"id":3, "method":"Runtime.evaluate", "params":{"expression":' + ($crdJs | ConvertTo-Json) + ', "awaitPromise": true}}'
        $bytes = [System.Text.Encoding]::UTF8.GetBytes($evalMsg2)
        $ws.SendAsync([ArraySegment[byte]]$bytes, [System.Net.WebSockets.WebSocketMessageType]::Text, $true, $cts.Token).Wait()

        $buf2 = New-Object byte[] 1048576
        $ms2 = New-Object System.IO.MemoryStream
        while ($ws.State -eq [System.Net.WebSockets.WebSocketState]::Open) {
            $res2 = $ws.ReceiveAsync([ArraySegment[byte]]$buf2, $cts.Token).Result
            $ms2.Write($buf2, 0, $res2.Count)
            if ($res2.EndOfMessage) {
                $evalResStr = [System.Text.Encoding]::UTF8.GetString($ms2.ToArray())
                Write-Output "CDP Eval Output: $evalResStr"
                break
            }
        }

        Start-Sleep -Seconds 4

        # 4. Capture screenshot
        $capMsg = '{"id":4, "method":"Page.captureScreenshot", "params":{"format":"png"}}'
        $bytes = [System.Text.Encoding]::UTF8.GetBytes($capMsg)
        $ws.SendAsync([ArraySegment[byte]]$bytes, [System.Net.WebSockets.WebSocketMessageType]::Text, $true, $cts.Token).Wait()

        $buf = New-Object byte[] 10485760
        $ms = New-Object System.IO.MemoryStream
        while ($ws.State -eq [System.Net.WebSockets.WebSocketState]::Open) {
            $res = $ws.ReceiveAsync([ArraySegment[byte]]$buf, $cts.Token).Result
            $ms.Write($buf, 0, $res.Count)
            if ($res.EndOfMessage) {
                $str = [System.Text.Encoding]::UTF8.GetString($ms.ToArray())
                $ms.SetLength(0)
                if ($str -match '"data":\s*"([^"]+)"') {
                    $b64 = $matches[1]
                    [System.IO.File]::WriteAllBytes($outImg, [System.Convert]::FromBase64String($b64))
                    Write-Output "SUCCESS! Actual logged-in feature screenshot saved! Size: $((Get-Item $outImg).Length) bytes"
                    break
                }
            }
        }
        $ws.CloseAsync([System.Net.WebSockets.WebSocketCloseStatus]::NormalClosure, "done", $cts.Token).Wait()
    }
} catch {
    Write-Output "Error: $_"
} finally {
    if (-not $proc.HasExited) { Stop-Process -Id $proc.Id -Force }
}
