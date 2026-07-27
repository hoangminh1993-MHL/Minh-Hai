using System;
using System.Diagnostics;
using System.IO;

class CaptureFinalVersionProof {
    static void Main() {
        string edgePath = @"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe";
        if (!File.Exists(edgePath)) edgePath = @"C:\Program Files\Microsoft\Edge\Application\msedge.exe";

        string outImg = @"C:\Users\admin\.gemini\antigravity-ide\brain\9c13f1e0-284e-4ab0-9990-4cd3a100827c\final_v21_23_proof.png";
        if (File.Exists(outImg)) File.Delete(outImg);

        ProcessStartInfo psi = new ProcessStartInfo {
            FileName = edgePath,
            Arguments = "--headless --disable-gpu --window-size=1680,1050 --virtual-time-budget=12000 --screenshot=\"" + outImg + "\" \"https://minh-hai.onrender.com/index.html?v=21.23#crm\"",
            UseShellExecute = false
        };

        Process p = Process.Start(psi);
        p.WaitForExit();

        if (File.Exists(outImg)) {
            FileInfo fi = new FileInfo(outImg);
            Console.WriteLine("SUCCESS! Captured final_v21_23_proof.png! File size: " + fi.Length + " bytes");
        } else {
            Console.WriteLine("Capture failed.");
        }
    }
}
