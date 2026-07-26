using System;
using System.Net;
using System.Text;
using System.Text.RegularExpressions;

class VerifyLiveState {
    static void Main() {
        ServicePointManager.SecurityProtocol = (SecurityProtocolType)3072; // TLS 1.2
        WebClient client = new WebClient();
        client.Encoding = Encoding.UTF8;
        string json = client.DownloadString("https://minh-hai.onrender.com/api/state?t=" + DateTime.Now.Ticks);

        Match versionMatch = Regex.Match(json, @"""dbVersion"":\s*""(.*?)""");
        Console.WriteLine("Live Version: " + (versionMatch.Success ? versionMatch.Groups[1].Value : "Unknown"));

        MatchCollection leadMatches = Regex.Matches(json, @"""id"":\s*""lead-\d+""[\s\S]*?""name"":\s*""(.*?)""");
        Console.WriteLine("Total Lead Matches: " + leadMatches.Count);

        int count = 0;
        foreach (Match m in leadMatches) {
            count++;
            if (count <= 15) {
                Console.WriteLine("Lead " + count + ": Name='" + m.Groups[1].Value + "'");
            }
        }

        bool hasBadChars = Regex.IsMatch(json, @"├|ß|Γ|╬|┬");
        Console.WriteLine("Has Mojibake CP437 symbols in live API: " + hasBadChars);
    }
}
