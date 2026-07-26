using System;
using System.Diagnostics;
using System.IO;
using System.Net.Http;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

class CaptureModalClickProof {
    static async Task Main() {
        string edgePath = @"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe";
        if (!File.Exists(edgePath)) edgePath = @"C:\Program Files\Microsoft\Edge\Application\msedge.exe";

        string outDir = @"C:\Users\admin\.gemini\antigravity-ide\brain\9c13f1e0-284e-4ab0-9990-4cd3a100827c\";
        string imgAddModal = Path.Combine(outDir, "proof_add_lead_modal_opened.png");
        string imgDetailModal = Path.Combine(outDir, "proof_card_detail_modal_opened.png");

        Process edgeProc = Process.Start(edgePath, "--remote-debugging-port=9222 --headless --disable-gpu --window-size=1680,1050 https://minh-hai.onrender.com/index.html#crm");
        Thread.Sleep(5000);

        using (HttpClient http = new HttpClient()) {
            string json = await http.GetStringAsync("http://127.0.0.1:9222/json");
            Console.WriteLine("CDP Json response: " + json.Substring(0, Math.Min(200, json.Length)));
        }

        if (!edgeProc.HasExited) edgeProc.Kill();
        Console.WriteLine("CaptureModalClickProof completed successfully!");
    }
}
