using System;
using System.Diagnostics;
using System.IO;
using System.Net;
using System.Net.WebSockets;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;

class CaptureExactCrmPageCdp {
    static void Main() {
        Task.Run(async () => {
            string edgePath = @"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe";
            if (!File.Exists(edgePath)) edgePath = @"C:\Program Files\Microsoft\Edge\Application\msedge.exe";

            string outImg = @"C:\Users\admin\.gemini\antigravity-ide\brain\9c13f1e0-284e-4ab0-9990-4cd3a100827c\crm_khach_moi_cards_rendered.png";
            if (File.Exists(outImg)) File.Delete(outImg);

            // Start Edge with remote debugging port 9222
            ProcessStartInfo psi = new ProcessStartInfo();
            psi.FileName = edgePath;
            psi.Arguments = "--headless --disable-gpu --remote-debugging-port=9222 --window-size=1680,1050 https://minh-hai.onrender.com/index.html#crm";
            psi.UseShellExecute = false;

            Process proc = Process.Start(psi);
            Console.WriteLine("Launched Edge with CDP...");

            // Wait 10 seconds for page to load & fetch API & render cards
            await Task.Delay(10000);

            try {
                WebClient client = new WebClient();
                string jsonTargets = client.DownloadString("http://127.0.0.1:9222/json/list");
                Console.WriteLine("Targets JSON: " + jsonTargets);

                MatchCollection matches = Regex.Matches(jsonTargets, @"\{[^{}]*""url"":\s*""[^""]*index\.html#crm[^""]*""[^{}]*\}");
                string wsUrl = "";
                foreach (Match m in matches) {
                    Match mWs = Regex.Match(m.Value, @"""webSocketDebuggerUrl"":\s*""([^""]+)""");
                    if (mWs.Success) {
                        wsUrl = mWs.Groups[1].Value;
                        break;
                    }
                }

                if (string.IsNullOrEmpty(wsUrl)) {
                    Match mAny = Regex.Match(jsonTargets, @"""webSocketDebuggerUrl"":\s*""([^""]+index\.html[^""]*)""");
                    if (mAny.Success) wsUrl = mAny.Groups[1].Value;
                }

                if (!string.IsNullOrEmpty(wsUrl)) {
                    Console.WriteLine("Connecting to CDP WS: " + wsUrl);
                    ClientWebSocket ws = new ClientWebSocket();
                    await ws.ConnectAsync(new Uri(wsUrl), CancellationToken.None);

                    // 1. Enable Page domain
                    string enableCmd = "{\"id\": 1, \"method\": \"Page.enable\"}";
                    byte[] enableBytes = Encoding.UTF8.GetBytes(enableCmd);
                    await ws.SendAsync(new ArraySegment<byte>(enableBytes), WebSocketMessageType.Text, true, CancellationToken.None);

                    byte[] buf1 = new byte[65536];
                    await ws.ReceiveAsync(new ArraySegment<byte>(buf1), CancellationToken.None);

                    // 2. Send Page.captureScreenshot command
                    string captureCmd = "{\"id\": 2, \"method\": \"Page.captureScreenshot\", \"params\": {\"format\": \"png\"}}";
                    byte[] captureBytes = Encoding.UTF8.GetBytes(captureCmd);
                    await ws.SendAsync(new ArraySegment<byte>(captureBytes), WebSocketMessageType.Text, true, CancellationToken.None);

                    // Read frames until result with data is found
                    byte[] buffer = new byte[20 * 1024 * 1024]; // 20MB buffer
                    MemoryStream ms = new MemoryStream();

                    while (ws.State == WebSocketState.Open) {
                        WebSocketReceiveResult result = await ws.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);
                        ms.Write(buffer, 0, result.Count);
                        if (result.EndOfMessage) {
                            string msg = Encoding.UTF8.GetString(ms.ToArray());
                            ms.SetLength(0);

                            if (msg.Contains("\"id\":2") || msg.Contains("\"data\":")) {
                                Match mData = Regex.Match(msg, @"""data"":\s*""([^""]+)""");
                                if (mData.Success) {
                                    byte[] imageBytes = Convert.FromBase64String(mData.Groups[1].Value);
                                    File.WriteAllBytes(outImg, imageBytes);
                                    Console.WriteLine("SUCCESS! Captured CRM cards screenshot via CDP! Size: " + imageBytes.Length + " bytes");
                                    break;
                                }
                            }
                        }
                    }

                    await ws.CloseAsync(WebSocketCloseStatus.NormalClosure, "done", CancellationToken.None);
                } else {
                    Console.WriteLine("Could not find WebSocket URL for index.html#crm target.");
                }
            } catch (Exception ex) {
                Console.WriteLine("CDP WebSocket Exception: " + ex.ToString());
            } finally {
                try { proc.Kill(); } catch {}
            }
        }).GetAwaiter().GetResult();
    }
}
