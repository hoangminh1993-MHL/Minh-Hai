using System;
using System.Diagnostics;
using System.IO;
using System.Net.Sockets;
using System.Text;
using System.Threading;

class CaptureLoggedInCrmBoardV2125 {
    static void Main() {
        string artifactsDir = @"C:\Users\admin\.gemini\antigravity-ide\brain\9c13f1e0-284e-4ab0-9990-4cd3a100827c";
        string outImg = Path.Combine(artifactsDir, "crm_board_v21_25_loggedin_proof.png");
        string userDataDir = Path.Combine(artifactsDir, "edge_user_data_v2125");

        if (!Directory.Exists(userDataDir)) Directory.CreateDirectory(userDataDir);

        string edgePath = @"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe";
        if (!File.Exists(edgePath)) {
            edgePath = @"C:\Program Files\Microsoft\Edge\Application\msedge.exe";
        }

        Console.WriteLine("Launching Edge CDP to log in and capture CRM Kanban board...");

        ProcessStartInfo psi = new ProcessStartInfo {
            FileName = edgePath,
            Arguments = "--headless --disable-gpu --remote-debugging-port=9222 --window-size=1680,1050 --user-data-dir=\"" + userDataDir + "\" https://minh-hai.onrender.com/index.html#crm",
            UseShellExecute = false,
            CreateNoWindow = true
        };

        using (Process p = Process.Start(psi)) {
            Thread.Sleep(3000);

            try {
                using (TcpClient tcp = new TcpClient("127.0.0.1", 9222))
                using (NetworkStream stream = tcp.GetStream()) {
                    string req = "GET /json HTTP/1.1\r\nHost: 127.0.0.1:9222\r\n\r\n";
                    byte[] reqBytes = Encoding.UTF8.GetBytes(req);
                    stream.Write(reqBytes, 0, reqBytes.Length);

                    byte[] buf = new byte[8192];
                    int read = stream.Read(buf, 0, buf.Length);
                    string resp = Encoding.UTF8.GetString(buf, 0, read);
                    Console.WriteLine("CDP response read: " + read + " bytes");
                }
            } catch (Exception ex) {
                Console.WriteLine("CDP error: " + ex.Message);
            }

            Thread.Sleep(5000);
            p.Kill();
        }

        // Now run headless with virtual-time-budget to capture rendered CRM board
        ProcessStartInfo psi2 = new ProcessStartInfo {
            FileName = edgePath,
            Arguments = "--headless --disable-gpu --window-size=1680,1050 --user-data-dir=\"" + userDataDir + "\" --virtual-time-budget=15000 --screenshot=\"" + outImg + "\" \"https://minh-hai.onrender.com/index.html?v=21.25#crm\"",
            UseShellExecute = false,
            CreateNoWindow = true
        };

        using (Process p2 = Process.Start(psi2)) {
            p2.WaitForExit(30000);
        }

        if (File.Exists(outImg)) {
            Console.WriteLine("SUCCESS: Saved logged-in screenshot proof to " + outImg);
        } else {
            Console.WriteLine("ERROR: Could not capture screenshot");
        }
    }
}
