using System;
using System.Diagnostics;
using System.IO;
using System.Net;
using System.Net.WebSockets;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;

class CaptureCleanCrmBoardV2125 {
    static void Main() {
        Task.Run(async () => {
            string edgePath = @"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe";
            if (!File.Exists(edgePath)) edgePath = @"C:\Program Files\Microsoft\Edge\Application\msedge.exe";

            string outImg = @"C:\Users\admin\.gemini\antigravity-ide\brain\9c13f1e0-284e-4ab0-9990-4cd3a100827c\crm_board_v21_25_live_proof.png";
            if (File.Exists(outImg)) File.Delete(outImg);

            // Start Edge with remote debugging port 9222
            ProcessStartInfo psi = new ProcessStartInfo {
                FileName = edgePath,
                Arguments = "--headless --disable-gpu --remote-debugging-port=9222 --window-size=1680,1050 \"https://minh-hai.onrender.com/index.html?v=21.25#crm\"",
                UseShellExecute = false,
                CreateNoWindow = true
            };

            Process proc = Process.Start(psi);
            Console.WriteLine("Launched Edge with CDP for v21.25...");

            // Wait 5 seconds for page load
            await Task.Delay(5000);

            try {
                WebClient client = new WebClient();
                string jsonTargets = client.DownloadString("http://127.0.0.1:9222/json/list");

                Match mWs = Regex.Match(jsonTargets, @"""webSocketDebuggerUrl"":\s*""([^""]+)""");
                if (mWs.Success) {
                    string wsUrl = mWs.Groups[1].Value;
                    Console.WriteLine("Connecting to CDP WS: " + wsUrl);

                    ClientWebSocket ws = new ClientWebSocket();
                    await ws.ConnectAsync(new Uri(wsUrl), CancellationToken.None);

                    // 1. Inject localStorage user
                    string evalCmd = "{\"id\": 1, \"method\": \"Runtime.evaluate\", \"params\": {\"expression\": \"localStorage.setItem('minhhai_user', JSON.stringify({id:'usr-admin', name:'Nguyễn Hoàng Minh', role:'admin'})); if (!window.AppState || !window.AppState.currentUser) { window.location.reload(); }\"}}";
                    byte[] evalBytes = Encoding.UTF8.GetBytes(evalCmd);
                    await ws.SendAsync(new ArraySegment<byte>(evalBytes), WebSocketMessageType.Text, true, CancellationToken.None);

                    byte[] tempBuf = new byte[65536];
                    await ws.ReceiveAsync(new ArraySegment<byte>(tempBuf), CancellationToken.None);

                    // Wait 8 seconds for page reload & API fetch & Kanban cards render
                    await Task.Delay(8000);

                    // 2. Enable Page domain
                    string enableCmd = "{\"id\": 2, \"method\": \"Page.enable\"}";
                    byte[] enableBytes = Encoding.UTF8.GetBytes(enableCmd);
                    await ws.SendAsync(new ArraySegment<byte>(enableBytes), WebSocketMessageType.Text, true, CancellationToken.None);
                    await ws.ReceiveAsync(new ArraySegment<byte>(tempBuf), CancellationToken.None);

                    // 3. Send Page.captureScreenshot command
                    string captureCmd = "{\"id\": 3, \"method\": \"Page.captureScreenshot\", \"params\": {\"format\": \"png\"}}";
                    byte[] captureBytes = Encoding.UTF8.GetBytes(captureCmd);
                    await ws.SendAsync(new ArraySegment<byte>(captureBytes), WebSocketMessageType.Text, true, CancellationToken.None);

                    byte[] buffer = new byte[20 * 1024 * 1024];
                    MemoryStream ms = new MemoryStream();

                    while (ws.State == WebSocketState.Open) {
                        WebSocketReceiveResult result = await ws.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);
                        ms.Write(buffer, 0, result.Count);
                        if (result.EndOfMessage) {
                            string msg = Encoding.UTF8.GetString(ms.ToArray());
                            ms.SetLength(0);

                            if (msg.Contains("\"id\":3") || msg.Contains("\"data\":")) {
                                Match mData = Regex.Match(msg, @"""data"":\s*""([^""]+)""");
                                if (mData.Success) {
                                    byte[] imageBytes = Convert.FromBase64String(mData.Groups[1].Value);
                                    File.WriteAllBytes(outImg, imageBytes);
                                    Console.WriteLine("SUCCESS! Saved logged-in CRM board screenshot for v21.25! Size: " + imageBytes.Length + " bytes");
                                    break;
                                }
                            }
                        }
                    }

                    await ws.CloseAsync(WebSocketCloseStatus.NormalClosure, "done", CancellationToken.None);
                } else {
                    Console.WriteLine("Could not find WebSocket URL.");
                }
            } catch (Exception ex) {
                Console.WriteLine("CDP Exception: " + ex.ToString());
            } finally {
                try { proc.Kill(); } catch {}
            }
        }).GetAwaiter().GetResult();
    }
}
