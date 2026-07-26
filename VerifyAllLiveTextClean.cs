using System;
using System.IO;
using System.Net;
using System.Text;
using System.Text.RegularExpressions;

class VerifyAllLiveTextClean {
    static void Main() {
        ServicePointManager.SecurityProtocol = (SecurityProtocolType)3072; // TLS 1.2
        WebClient client = new WebClient();
        client.Encoding = Encoding.UTF8;

        string json = client.DownloadString("https://minh-hai.onrender.com/api/state?t=" + DateTime.Now.Ticks);

        Console.WriteLine("=== LIVE API TEXT ANALYSIS (v21.08) ===");

        // Check for CP437 symbols: ├, ß, Γ, ╬, ┬, etc.
        MatchCollection matches = Regex.Matches(json, @"[├ßΓ╬┬\u0393\u00F6\u00F2\u251C\u0192\u00FB\u00EA\u00E6\u252C\u00A3\u00ED\u00E1\u20A7\u255D\u255E\u00C7\u00C9\u00F4\u00F1\u00FA\u00F9\u00FA\u00FB\u00FC\u00FD\u00FE\u00FF\uFFFD\u251C\u0192\u252C\u2510\u2551\u255D\u255E\u20A7]+");

        Console.WriteLine("Total CP437 / Mojibake matches in live API: " + matches.Count);
        int i = 0;
        foreach (Match m in matches) {
            i++;
            if (i <= 10) {
                int start = Math.Max(0, m.Index - 20);
                int len = Math.Min(json.Length - start, 50);
                Console.WriteLine("  Match " + i + ": " + json.Substring(start, len).Replace("\n", " ").Replace("\r", " "));
            }
        }
    }
}
