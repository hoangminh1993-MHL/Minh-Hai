using System;
using System.Diagnostics;
using System.IO;
using System.Threading;

class CaptureFinalVersionProof {
    static void Main() {
        string artifactsDir = @"C:\Users\admin\.gemini\antigravity-ide\brain\9c13f1e0-284e-4ab0-9990-4cd3a100827c";
        string outImg = Path.Combine(artifactsDir, "crm_board_v21_25_success_proof.png");

        string edgePath = @"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe";
        if (!File.Exists(edgePath)) {
            edgePath = @"C:\Program Files\Microsoft\Edge\Application\msedge.exe";
        }

        Console.WriteLine("Capturing live logged-in screenshot for v21.25...");

        ProcessStartInfo psi = new ProcessStartInfo {
            FileName = edgePath,
            Arguments = "--headless --disable-gpu --window-size=1680,1050 --virtual-time-budget=12000 --screenshot=\"" + outImg + "\" \"https://minh-hai.onrender.com/index.html?v=21.25#crm\"",
            UseShellExecute = false,
            CreateNoWindow = true
        };

        using (Process p = Process.Start(psi)) {
            p.WaitForExit(30000);
        }

        if (File.Exists(outImg)) {
            Console.WriteLine("SUCCESS: Saved screenshot proof to " + outImg);
        } else {
            Console.WriteLine("ERROR: Could not capture screenshot");
        }
    }
}
