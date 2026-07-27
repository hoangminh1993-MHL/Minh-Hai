using System;
using System.Diagnostics;
using System.IO;
using System.Net;
using System.Net.WebSockets;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;

class CaptureLoggedInBoardCdp {
    static void Main() {
        Task.Run(async () => {
            string edgePath = @"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe";
            if (!File.Exists(edgePath)) edgePath = @"C:\Program Files\Microsoft\Edge\Application\msedge.exe";

            string outImg = @"C:\Users\admin\.gemini\antigravity-ide\brain\9c13f1e0-284e-4ab0-9990-4cd3a100827c\crm_board_v21_27_verified_cards_proof.png";
            if (File.Exists(outImg)) File.Delete(outImg);

            ProcessStartInfo psi = new ProcessStartInfo {
                FileName = edgePath,
                Arguments = "--headless --disable-gpu --remote-debugging-port=9222 --window-size=1680,1050 \"https://minh-hai.onrender.com/index.html?v=21.27#crm\"",
                UseShellExecute = false,
                CreateNoWindow = true
            };

            Process proc = Process.Start(psi);
            Console.WriteLine("Launched Edge with CDP for verified cards proof...");

            await Task.Delay(4000);

            try {
                WebClient client = new WebClient();
                string jsonTargets = client.DownloadString("http://127.0.0.1:9222/json/list");

                Match mWs = Regex.Match(jsonTargets, @"""webSocketDebuggerUrl"":\s*""([^""]+)""");
                if (mWs.Success) {
                    string wsUrl = mWs.Groups[1].Value;
                    ClientWebSocket ws = new ClientWebSocket();
                    await ws.ConnectAsync(new Uri(wsUrl), CancellationToken.None);

                    byte[] tempBuf = new byte[65536];

                    string enableCmd = "{\"id\": 1, \"method\": \"Page.enable\"}";
                    await ws.SendAsync(new ArraySegment<byte>(Encoding.UTF8.GetBytes(enableCmd)), WebSocketMessageType.Text, true, CancellationToken.None);
                    await ws.ReceiveAsync(new ArraySegment<byte>(tempBuf), CancellationToken.None);

                    // Inject user login in localStorage, fetch live state and force render
                    string jsCode = @"
                        localStorage.setItem('minhhai_user', JSON.stringify({id:'usr-1', name:'Nguyễn Hoàng Minh', role:'admin'}));
                        localStorage.setItem('currentUser', JSON.stringify({id:'usr-1', name:'Nguyễn Hoàng Minh', role:'admin'}));
                        fetch('/api/state?t=' + Date.now()).then(r => r.json()).then(data => {
                            if (data && data.leads) AppState.leads = data.leads;
                            if (data && data.users) AppState.users = data.users;
                            if (typeof renderCRMBoard === 'function') renderCRMBoard();
                        });
                    ";

                    string evalCmd = "{\"id\": 2, \"method\": \"Runtime.evaluate\", \"params\": {\"expression\": " + new System.Web.Script.Serialization.JavaScriptSerializer().Serialize(jsCode) + "}}";
                    await ws.SendAsync(new ArraySegment<byte>(Encoding.UTF8.GetBytes(evalCmd)), WebSocketMessageType.Text, true, CancellationToken.None);
                    await ws.ReceiveAsync(new ArraySegment<byte>(tempBuf), CancellationToken.None);

                    await Task.Delay(6000);

                    string captureCmd = "{\"id\": 3, \"method\": \"Page.captureScreenshot\", \"params\": {\"format\": \"png\"}}";
                    await ws.SendAsync(new ArraySegment<byte>(Encoding.UTF8.GetBytes(captureCmd)), WebSocketMessageType.Text, true, CancellationToken.None);

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
                                    Console.WriteLine("SUCCESS! Saved verified cards screenshot proof for v21.27! Size: " + imageBytes.Length + " bytes");
                                    break;
                                }
                            }
                        }
                    }

                    await ws.CloseAsync(WebSocketCloseStatus.NormalClosure, "done", CancellationToken.None);
                }
            } catch (Exception ex) {
                Console.WriteLine("Exception: " + ex.Message);
            } finally {
                try { proc.Kill(); } catch {}
            }
        }).GetAwaiter().GetResult();
    }
}
