using System;
using System.IO;
using System.Text;
using System.Text.RegularExpressions;

class VerifyDbJsonCSharp {
    static void Main() {
        string path = @"d:\antigravity\db.json";
        string text = File.ReadAllText(path, Encoding.UTF8);

        Match mUsers = Regex.Match(text, @"""users"":\s*\[");
        Match mLeads = Regex.Match(text, @"""leads"":\s*\[");
        Match mVer = Regex.Match(text, @"""dbVersion"":\s*""([^""]+)""");

        Console.WriteLine("DB Version: " + (mVer.Success ? mVer.Groups[1].Value : "NONE"));
        Console.WriteLine("Has users array: " + mUsers.Success);
        Console.WriteLine("Has leads array: " + mLeads.Success);

        MatchCollection leadIds = Regex.Matches(text, @"""id"":\s*""(lead-[^""]+)""");
        Console.WriteLine("Total Lead ID matches in db.json: " + leadIds.Count);
    }
}
