using System;
using System.IO;
using System.Net;
using System.Text;

class ForceSyncPostgresLive {
    static void Main() {
        ServicePointManager.SecurityProtocol = (SecurityProtocolType)3072; // TLS 1.2
        string dbPath = @"d:\antigravity\db.json";
        string json = File.ReadAllText(dbPath, Encoding.UTF8);

        WebClient client = new WebClient();
        client.Encoding = Encoding.UTF8;
        client.Headers[HttpRequestHeader.ContentType] = "application/json; charset=utf-8";

        Console.WriteLine("Posting 59 leads and 17 users to https://minh-hai.onrender.com/api/state...");
        string response = client.UploadString("https://minh-hai.onrender.com/api/state", "POST", json);
        Console.WriteLine("Server POST Response: " + response);

        // Fetch back state
        string getResponse = client.DownloadString("https://minh-hai.onrender.com/api/state?t=" + DateTime.Now.Ticks);
        Console.WriteLine("Fresh GET API state length: " + getResponse.Length);
    }
}
