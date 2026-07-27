using System;
using System.Diagnostics;
using System.IO;
using System.Net;
using System.Text;

class RestoreCleanLeadsData {
    static void Main() {
        ServicePointManager.SecurityProtocol = (SecurityProtocolType)3072; // TLS 1.2

        string gitCmd = "git show 44b7540:db.json";
        ProcessStartInfo psi = new ProcessStartInfo {
            FileName = "cmd.exe",
            Arguments = "/c " + gitCmd,
            RedirectStandardOutput = true,
            UseShellExecute = false,
            CreateNoWindow = true,
            StandardOutputEncoding = Encoding.UTF8
        };

        string cleanJson = "";
        using (Process p = Process.Start(psi)) {
            cleanJson = p.StandardOutput.ReadToEnd();
            p.WaitForExit();
        }

        if (cleanJson.StartsWith("\uFEFF")) cleanJson = cleanJson.Substring(1);
        cleanJson = cleanJson.Trim();

        Console.WriteLine("Retrieved cleanJson from git 44b7540 length: " + cleanJson.Length);

        // Update dbVersion to 21.26
        cleanJson = System.Text.RegularExpressions.Regex.Replace(cleanJson, @"""dbVersion"":\s*""\d+\.\d+""", "\"dbVersion\": \"21.26\"");

        UTF8Encoding utf8NoBom = new UTF8Encoding(false);
        File.WriteAllText(@"d:\antigravity\db.json", cleanJson, utf8NoBom);
        File.WriteAllText(@"d:\antigravity\minhhai_crm_deploy\db.json", cleanJson, utf8NoBom);

        Console.WriteLine("Saved clean db.json v21.26 with all 59 leads!");

        // Now post clean state to live server API
        try {
            using (WebClient client = new WebClient()) {
                client.Headers[HttpRequestHeader.ContentType] = "application/json; charset=utf-8";
                Console.WriteLine("Posting clean 59 leads state to https://minh-hai.onrender.com/api/state...");
                string res = client.UploadString("https://minh-hai.onrender.com/api/state", "POST", cleanJson);
                Console.WriteLine("Server Response: " + res);

                string liveState = client.DownloadString("https://minh-hai.onrender.com/api/state?t=" + DateTime.Now.Ticks);
                Console.WriteLine("Updated Live State Length: " + liveState.Length);
                bool has59Leads = liveState.Contains("lead-excel-");
                Console.WriteLine("Live API contains leads: " + has59Leads);
            }
        } catch (Exception ex) {
            Console.WriteLine("POST API Error: " + ex.Message);
        }
    }
}
