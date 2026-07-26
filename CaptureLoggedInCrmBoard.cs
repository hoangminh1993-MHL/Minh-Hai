using System;
using System.Diagnostics;
using System.IO;
using System.Net;
using System.Net.WebSockets;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;

class CaptureLoggedInCrmBoard {
    static void Main() {
        Task.Run(async () => {
            string edgePath = @"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe";
            if (!File.Exists(edgePath)) edgePath = @"C:\Program Files\Microsoft\Edge\Application\msedge.exe";

            string outImg = @"C:\Users\admin\.gemini\antigravity-ide\brain\9c13f1e0-284e-4ab0-9990-4cd3a100827c\crm_logged_in_board_proof.png";
            if (File.Exists(outImg)) File.Delete(outImg);

            string userDataDir = @"d:\antigravity\scratch\edge_user_data";
            if (!Directory.Exists(userDataDir)) Directory.CreateDirectory(userDataDir);

            // Start Edge with remote debugging port 9222
            ProcessStartInfo psi = new ProcessStartInfo();
            psi.FileName = edgePath;
            psi.Arguments = "--headless --disable-gpu --remote-debugging-port=9222 --window-size=1680,1050 --user-data-dir=\"" + userDataDir + "\" https://minh-hai.onrender.com/index.html#crm";
            psi.UseShellExecute = false;

            Process proc = Process.Start(psi);
            Console.WriteLine("Launched Edge with CDP...");

            await Task.Delay(4000);

            try {
                WebClient client = new WebClient();
                string jsonTargets = client.DownloadString("http://127.0.0.1:9222/json/list");
                Match mWs = Regex.Match(jsonTargets, @"""webSocketDebuggerUrl"":\s*""([^""]+)""");
                if (mWs.Success) {
                    string wsUrl = mWs.Groups[1].Value;
                    Console.WriteLine("Connecting WS: " + wsUrl);

                    ClientWebSocket ws = new ClientWebSocket();
                    await ws.ConnectAsync(new Uri(wsUrl), CancellationToken.None);

                    // Enable Page and Runtime
                    await SendWsCmd(ws, 1, "Page.enable", null);
                    await SendWsCmd(ws, 2, "Runtime.enable", null);

                    // Inject localStorage session & reload
                    string js = @"
                        localStorage.setItem('minhhai_user', JSON.stringify({id:'usr-1',username:'hoangminh',name:'Nguyễn Hoàng Minh',role:'admin'}));
                        localStorage.setItem('votr_current_user_id', 'usr-1');
                        location.reload();
                    ";
                    await SendWsCmd(ws, 3, "Runtime.evaluate", "{\"expression\": " + NewtonsoftJsonEscape(js) + "}");

                    // Wait 6 seconds for reloaded page to fetch /api/state and render cards
                    await Task.Delay(6000);

                    // Trigger Page.captureScreenshot
                    string captureCmd = "{\"id\": 4, \"method\": \"Page.captureScreenshot\", \"params\": {\"format\": \"png\"}}";
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
                            Match mData = Regex.Match(msg, @"""data"":\s*""([^""]+)""");
                            if (mData.Success) {
                                byte[] imageBytes = Convert.FromBase64String(mData.Groups[1].Value);
                                File.WriteAllBytes(outImg, imageBytes);
                                Console.WriteLine("SUCCESS! Captured logged-in CRM board proof! Size: " + imageBytes.Length + " bytes");
                                break;
                            }
                        }
                    }

                    await ws.CloseAsync(WebSocketCloseStatus.NormalClosure, "done", CancellationToken.None);
                }
            } catch (Exception ex) {
                Console.WriteLine("CDP Exception: " + ex.ToString());
            } finally {
                try { proc.Kill(); } catch {}
            }
        }).GetAwaiter().GetResult();
    }

    static async Task SendWsCmd(ClientWebSocket ws, int id, string method, string extraParams) {
        string json = "{\"id\": " + id + ", \"method\": \"" + method + "\"" + (extraParams != null ? ", " + extraParams : "") + "}";
        byte[] bytes = Encoding.UTF8.GetBytes(json);
        await ws.SendAsync(new ArraySegment<byte>(bytes), WebSocketMessageType.Text, true, CancellationToken.None);
        byte[] buf = new byte[65536];
        await ws.ReceiveAsync(new ArraySegment<byte>(buf), CancellationToken.None);
    }

    static string NewtonsoftJsonEscape(string s) {
        return "\"" + s.Replace("\\", "\\\\").Replace("\"", "\\\"").Replace("\n", "\\n").Replace("\r", "\\r") + "\"";
    }
}
