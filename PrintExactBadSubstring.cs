using System;
using System.Net;
using System.Text;
using System.Text.RegularExpressions;

class PrintExactBadSubstring {
    static void Main() {
        ServicePointManager.SecurityProtocol = (SecurityProtocolType)3072; // TLS 1.2
        WebClient client = new WebClient();
        client.Encoding = Encoding.UTF8;
        string json = client.DownloadString("https://minh-hai.onrender.com/api/state?t=" + DateTime.Now.Ticks);

        MatchCollection matches = Regex.Matches(json, @".{0,30}(?:├|ß|Γ|╬|┬).{0,30}");
        Console.WriteLine("Total CP437 matches found in live API: " + matches.Count);
        int i = 0;
        foreach (Match m in matches) {
            i++;
            if (i <= 10) {
                Console.WriteLine("Match " + i + ": " + m.Value);
            }
        }
    }
}
