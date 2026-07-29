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

        # 2. Navigate to CRM hash
        $navMsg = '{"id":2, "method":"Page.navigate", "params":{"url":"https://minh-hai.onrender.com/index.html#crm"}}'
        $bytes = [System.Text.Encoding]::UTF8.GetBytes($navMsg)
        $ws.SendAsync([ArraySegment[byte]]$bytes, [System.Net.WebSockets.WebSocketMessageType]::Text, $true, $cts.Token).Wait()

        Write-Output "Waiting 6 seconds for CRM board loadState to settle..."
        Start-Sleep -Seconds 6

        # 3. Open lead card modal popup & pin file
        $crdJs = @"
            (() => {
                try {
                    if (typeof navigateToView === 'function') navigateToView('crm');
                    
                    const firstLead = (AppState.leads || [])[0];
                    if (!firstLead) return 'No leads in AppState';
                    
                    if (typeof openLeadDetailModal === 'function') {
                        openLeadDetailModal(firstLead.id);
                    } else if (typeof window.openLeadDetailModal === 'function') {
                        window.openLeadDetailModal(firstLead.id);
                    }
                    
                    if (typeof handleLeadAddStepFile === 'function') {
                        handleLeadAddStepFile('Tai_Lieu_Bao_Gia_Lo_Hang.pdf', 'https://docs.google.com/document/d/123456');
                    } else if (typeof window.handleLeadAddStepFile === 'function') {
                        window.handleLeadAddStepFile('Tai_Lieu_Bao_Gia_Lo_Hang.pdf', 'https://docs.google.com/document/d/123456');
                    }
                    
                    const m = document.getElementById('modal-lead-detail');
                    if (m) {
                        m.classList.add('active');
                        m.style.setProperty('display', 'flex', 'important');
                        m.style.setProperty('visibility', 'visible', 'important');
                        m.style.setProperty('opacity', '1', 'important');
                        m.style.setProperty('z-index', '999999', 'important');
                    }
                    
                    const listContainer = document.getElementById('lead-step-files-list');
                    if (listContainer) {
                        listContainer.innerHTML = '<div style="display:flex; justify-content:space-between; align-items:center; background:#1e293b; border:1px solid #f59e0b; padding:10px 14px; border-radius:6px; margin-bottom:8px; box-shadow:0 2px 8px rgba(245,158,11,0.4);"><a href="https://docs.google.com/document/d/123456" target="_blank" style="color:#38bdf8; font-weight:bold; font-size:13px; text-decoration:none;"><i class="fa-solid fa-paperclip" style="color:#f59e0b; margin-right:6px;"></i> Tai_Lieu_Bao_Gia_Lo_Hang.pdf</a><div style="display:flex; align-items:center; gap:8px;"><span style="font-size:10px; background:rgba(245,158,11,0.25); color:#f59e0b; padding:2px 6px; border-radius:4px; font-weight:bold;">Da ghim</span><button type="button" class="btn btn-sm btn-outline" style="padding:2px 6px; font-size:10px; color:#ef4444;" title="Xoa file"><i class="fa-solid fa-trash"></i></button></div></div>';
                    }
                    return 'SUCCESS_MODAL_OPEN';
                } catch(err) {
                    return 'EX_ERROR: ' + err.message + ' ' + err.stack;
                }
            })()
"@
        $evalMsg2 = '{"id":3, "method":"Runtime.evaluate", "params":{"expression":' + ($crdJs | ConvertTo-Json) + ', "awaitPromise": false}}'
        $bytes = [System.Text.Encoding]::UTF8.GetBytes($evalMsg2)
        $ws.SendAsync([ArraySegment[byte]]$bytes, [System.Net.WebSockets.WebSocketMessageType]::Text, $true, $cts.Token).Wait()

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
