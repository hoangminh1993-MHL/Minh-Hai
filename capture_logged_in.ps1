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

        # 1. Navigate to index page
        $navMsg = '{"id":1, "method":"Page.navigate", "params":{"url":"https://minh-hai.onrender.com/index.html#crm"}}'
        $bytes = [System.Text.Encoding]::UTF8.GetBytes($navMsg)
        $ws.SendAsync([ArraySegment[byte]]$bytes, [System.Net.WebSockets.WebSocketMessageType]::Text, $true, $cts.Token).Wait()

        Start-Sleep -Seconds 4

        # 2. Inject logged-in user session into localStorage & reload
        $loginJs = @"
            (() => {
                const userObj = { id: 'usr-1', username: 'hoangminh', role: 'admin', name: 'Nguyễn Hoàng Minh' };
                localStorage.setItem('minhhai_user', JSON.stringify(userObj));
                localStorage.setItem('votr_current_user', 'usr-1');
                location.href = 'https://minh-hai.onrender.com/index.html#crm';
                return 'SESSION_SET';
            })()
"@
        $evalMsg = '{"id":2, "method":"Runtime.evaluate", "params":{"expression":' + ($loginJs | ConvertTo-Json) + '}}'
        $bytes = [System.Text.Encoding]::UTF8.GetBytes($evalMsg)
        $ws.SendAsync([ArraySegment[byte]]$bytes, [System.Net.WebSockets.WebSocketMessageType]::Text, $true, $cts.Token).Wait()

        Write-Output "Waiting 8 seconds for page reload and CRM board loadState to settle..."
        Start-Sleep -Seconds 8

        # 3. Force navigate to CRM view and render board
        $crdJs = @"
            (() => {
                if (typeof navigateToView === 'function') navigateToView('crm');
                if (typeof renderCRMBoard === 'function') renderCRMBoard();
                else if (typeof window.renderCRMBoard === 'function') window.renderCRMBoard();
                
                const containers = document.querySelectorAll('.kanban-cards-container');
                let totalCardsInDom = 0;
                containers.forEach(c => { totalCardsInDom += c.children.length; });

                return JSON.stringify({
                    totalLeads: (typeof AppState !== 'undefined' && AppState.leads) ? AppState.leads.length : 0,
                    totalCardsInDom: totalCardsInDom,
                    viewMode: (typeof AppState !== 'undefined') ? AppState.crmViewMode : 'board'
                });
            })()
"@
        $evalMsg2 = '{"id":3, "method":"Runtime.evaluate", "params":{"expression":' + ($crdJs | ConvertTo-Json) + '}}'
        $bytes = [System.Text.Encoding]::UTF8.GetBytes($evalMsg2)
        $ws.SendAsync([ArraySegment[byte]]$bytes, [System.Net.WebSockets.WebSocketMessageType]::Text, $true, $cts.Token).Wait()

        Write-Output "Waiting 3 seconds for DOM rendering..."
        Start-Sleep -Seconds 3

        $buf2 = New-Object byte[] 1048576
        $ms2 = New-Object System.IO.MemoryStream
        while ($ws.State -eq [System.Net.WebSockets.WebSocketState]::Open) {
            $res2 = $ws.ReceiveAsync([ArraySegment[byte]]$buf2, $cts.Token).Result
            $ms2.Write($buf2, 0, $res2.Count)
            if ($res2.EndOfMessage) {
                $evalResStr = [System.Text.Encoding]::UTF8.GetString($ms2.ToArray())
                Write-Output "CDP Eval Result: $evalResStr"
                if ($evalResStr -match '"id":3') { break }
            }
        }

        Start-Sleep -Milliseconds 800

        # 4. Capture screenshot
        $capMsg = '{"id":4, "method":"Page.captureScreenshot", "params":{"format":"png"}}'
        $bytes = [System.Text.Encoding]::UTF8.GetBytes($capMsg)
        $ws.SendAsync([ArraySegment[byte]]$bytes, [System.Net.WebSockets.WebSocketMessageType]::Text, $true, $cts.Token).Wait()
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

        Start-Sleep -Seconds 2

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

        $ws.CloseAsync([System.Net.WebSockets.WebSocketCloseStatus]::NormalClosure, "Done", $cts.Token).Wait()
    } else {
        Write-Error "Could not connect to WebSocket debugger."
    }
} catch {
    Write-Error "CDP Automation Error: $_"
} finally {
    if (-not $proc.HasExited) { Stop-Process -Id $proc.Id -Force }
}
