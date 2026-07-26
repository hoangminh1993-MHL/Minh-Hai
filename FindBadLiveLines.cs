using System;
using System.Net;
using System.Text;
using System.Text.RegularExpressions;

class FindBadLiveLines {
    static void Main() {
        ServicePointManager.SecurityProtocol = (SecurityProtocolType)3072; // TLS 1.2
        WebClient client = new WebClient();
        client.Encoding = Encoding.UTF8;
        string json = client.DownloadString("https://minh-hai.onrender.com/api/state?t=" + DateTime.Now.Ticks);

        string[] lines = json.Split('\n');
        for (int i = 0; i < lines.Length; i++) {
            if (Regex.IsMatch(lines[i], @"├|ß|Γ|╬|┬")) {
                Console.WriteLine("Bad Live Line " + (i+1) + ": " + (lines[i].Length > 120 ? lines[i].Substring(0, 120) : lines[i]));
            }
        }
    }
}
