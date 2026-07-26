using System;
using System.Diagnostics;
using System.IO;
using System.Net;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading;

class CaptureLiveCrmCardsCdp {
    static void Main() {
        string edgePath = @"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe";
        if (!File.Exists(edgePath)) edgePath = @"C:\Program Files\Microsoft\Edge\Application\msedge.exe";

        string outImg = @"C:\Users\admin\.gemini\antigravity-ide\brain\9c13f1e0-284e-4ab0-9990-4cd3a100827c\crm_khach_moi_live_cards_proof.png";
        if (File.Exists(outImg)) File.Delete(outImg);

        // Run Edge in headless mode with remote debugging port 9222
        ProcessStartInfo psi = new ProcessStartInfo();
        psi.FileName = edgePath;
        psi.Arguments = "--headless --disable-gpu --remote-debugging-port=9222 --window-size=1680,1050 https://minh-hai.onrender.com/index.html#crm";
        psi.UseShellExecute = false;

        Process proc = Process.Start(psi);
        Console.WriteLine("Launched Edge with CDP on port 9222...");

        // Wait 8 seconds for Edge to load, fetch API, and render cards
        Thread.Sleep(8000);

        // Use CDP HTTP endpoint to trigger Page.captureScreenshot
        try {
            WebClient client = new WebClient();
            string jsonTarget = client.DownloadString("http://127.0.0.1:9222/json/list");
            Console.WriteLine("CDP Targets: " + jsonTarget);

            Match mWs = Regex.Match(jsonTarget, @"""webSocketDebuggerUrl"":\s*""([^""]+)""");
            if (mWs.Success) {
                Console.WriteLine("Found WebSocket Debugger URL: " + mWs.Groups[1].Value);
            }
        } catch (Exception ex) {
            Console.WriteLine("CDP HTTP Error: " + ex.Message);
        }

        // Kill process
        try { proc.Kill(); } catch {}

        // Fallback: Use virtual-time-budget=15000 if CDP capture needs simpler command
        psi.Arguments = "--headless --disable-gpu --window-size=1680,1050 --virtual-time-budget=15000 --screenshot=\"" + outImg + "\" https://minh-hai.onrender.com/index.html#crm";
        Process proc2 = Process.Start(psi);
        proc2.WaitForExit();

        if (File.Exists(outImg)) {
            FileInfo fi = new FileInfo(outImg);
            Console.WriteLine("Captured Screenshot! File size: " + fi.Length + " bytes");
        } else {
            Console.WriteLine("Failed to capture screenshot");
        }
    }
}
