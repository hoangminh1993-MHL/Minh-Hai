using System;
using System.IO;
using System.Net;
using System.Text;

class ForcePostgresVersionUpdate {
    static void Main() {
        ServicePointManager.SecurityProtocol = (SecurityProtocolType)3072; // TLS 1.2
        string dbPath = @"d:\antigravity\db.json";
        string dbText = File.ReadAllText(dbPath, Encoding.UTF8);

        using (WebClient client = new WebClient()) {
            client.Headers[HttpRequestHeader.ContentType] = "application/json; charset=utf-8";
            Console.WriteLine("Posting clean db.json v21.24 to https://minh-hai.onrender.com/api/state...");
            string res = client.UploadString("https://minh-hai.onrender.com/api/state", "POST", dbText);
            Console.WriteLine("Server Response: " + res);

            string liveState = client.DownloadString("https://minh-hai.onrender.com/api/state?t=" + DateTime.Now.Ticks);
            Console.WriteLine("Updated Live State Length: " + liveState.Length);
            bool contains2124 = liveState.Contains("21.24");
            Console.WriteLine("Live API contains 21.24: " + contains2124);
        }
    }
}
