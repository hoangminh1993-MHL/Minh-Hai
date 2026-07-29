$edgePath = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
if (-not (Test-Path $edgePath)) { $edgePath = "C:\Program Files\Microsoft\Edge\Application\msedge.exe" }

$outImg = "C:\Users\admin\.gemini\antigravity-ide\brain\9c13f1e0-284e-4ab0-9990-4cd3a100827c\crm_board_v21_35_verified_master.png"
if (Test-Path $outImg) { Remove-Item $outImg -Force }

$profileDir = "d:\antigravity\edge_profile"
if (-not (Test-Path $profileDir)) { New-Item -ItemType Directory -Path $profileDir -Force }

$proc = Start-Process -FilePath $edgePath -ArgumentList "--headless", "--disable-gpu", "--remote-debugging-port=9222", "--user-data-dir=$profileDir", "--window-size=1680,1050", "about:blank" -PassThru
Start-Sleep -Seconds 2

function Send-CdpMsg($ws, $id, $method, $params) {
    $msg = @{ id = $id; method = $method }
    if ($params) { $msg['params'] = $params }
    $json = $msg | ConvertTo-Json -Compress -Depth 10
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($json)
    $ws.SendAsync([ArraySegment[byte]]$bytes, [System.Net.WebSockets.WebSocketMessageType]::Text, $true, [System.Threading.CancellationToken]::None).Wait()

    $buf = New-Object byte[] 2097152
    $ms = New-Object System.IO.MemoryStream
    while ($ws.State -eq [System.Net.WebSockets.WebSocketState]::Open) {
        $res = $ws.ReceiveAsync([ArraySegment[byte]]$buf, [System.Threading.CancellationToken]::None).Result
        $ms.Write($buf, 0, $res.Count)
        if ($res.EndOfMessage) {
            $str = [System.Text.Encoding]::UTF8.GetString($ms.ToArray())
            $ms.SetLength(0)
            if ($str -match "`"id`":\s*$id\b") {
                return ($str | ConvertFrom-Json)
            }
        }
    }
    return $null
}

try {
    $wc = New-Object System.Net.WebClient
    $json = $wc.DownloadString("http://127.0.0.1:9222/json/list")
    if ($json -match '"webSocketDebuggerUrl":\s*"([^"]+)"') {
        $wsUrl = $matches[1]
        $ws = New-Object System.Net.WebSockets.ClientWebSocket
        $ws.ConnectAsync([Uri]$wsUrl, [System.Threading.CancellationToken]::None).Wait()

        # 1. Navigate to login page
        Write-Output "Navigating to login.html..."
        Send-CdpMsg $ws 1 "Page.navigate" @{ url = "https://minh-hai.onrender.com/login.html" } | Out-Null
        Start-Sleep -Seconds 3

        # 2. Inject session into localStorage
        Write-Output "Injecting admin session..."
        $loginJs = @"
            (() => {
                const userObj = { id: 'usr-1', username: 'hoangminh', role: 'admin', name: 'Nguyễn Hoàng Minh' };
                localStorage.setItem('minhhai_user', JSON.stringify(userObj));
                localStorage.setItem('votr_current_user_id', 'usr-1');
                localStorage.setItem('votr_crm_view_mode', 'board');
                return 'SESSION_SET';
            })()
"@
        $res2 = Send-CdpMsg $ws 2 "Runtime.evaluate" @{ expression = $loginJs }
        Write-Output "Session Injection Result: $($res2.result.result.value)"

        # 3. Navigate to CRM page
        Write-Output "Navigating to index.html#crm..."
        Send-CdpMsg $ws 3 "Page.navigate" @{ url = "https://minh-hai.onrender.com/index.html#crm" } | Out-Null
        
        Write-Output "Waiting 8 seconds for page load & initial sync..."
        Start-Sleep -Seconds 8

        # 4. Parse crm.js with new Function(code) to catch exact syntax error
        Write-Output "Checking crm.js parse syntax in browser..."
        $crdJs = @"
            (async () => {
                let parseErr = null;
                try {
                    const res = await fetch('crm.js?t=' + Date.now());
                    const code = await res.text();
                    try {
                        new Function(code);
                    } catch(e) {
                        parseErr = e.stack || e.message;
                    }
                } catch(e) {
                    parseErr = 'fetch error: ' + e.message;
                }

                return JSON.stringify({
                    parseErr: parseErr
                });
            })()
"@
        $res4 = Send-CdpMsg $ws 4 "Runtime.evaluate" @{ expression = $crdJs; awaitPromise = $true }
        Write-Output "Parse Syntax Eval Response: $($res4.result.result.value)"

        Start-Sleep -Seconds 2

        # 5. Capture screenshot
        Write-Output "Capturing screenshot..."
        $res5 = Send-CdpMsg $ws 5 "Page.captureScreenshot" @{ format = "png" }
        $b64 = $res5.result.data
        if ($b64) {
            [System.IO.File]::WriteAllBytes($outImg, [System.Convert]::FromBase64String($b64))
            Write-Output "SUCCESS! Verified screenshot saved! Size: $((Get-Item $outImg).Length) bytes"
        } else {
            Write-Error "Screenshot data was empty!"
        }

        $ws.CloseAsync([System.Net.WebSockets.WebSocketCloseStatus]::NormalClosure, "Done", [System.Threading.CancellationToken]::None).Wait()
    }
} catch {
    Write-Error "CDP Error: $_"
} finally {
    if (-not $proc.HasExited) { Stop-Process -Id $proc.Id -Force }
}
