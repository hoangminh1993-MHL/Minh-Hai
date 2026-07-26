using System;
using System.IO;
using System.Text;

class FixDbVersion {
    static void Main() {
        string path = @"d:\antigravity\db.json";
        string text = File.ReadAllText(path, Encoding.UTF8);
        text = System.Text.RegularExpressions.Regex.Replace(text, @"""dbVersion"":\s*""20\.\d+""", @"""dbVersion"": ""20.89""");
        File.WriteAllText(path, text, new UTF8Encoding(false));
        File.Copy(path, @"d:\antigravity\minhhai_crm_deploy\db.json", true);
        Console.WriteLine("FixDbVersion executed successfully!");
    }
}
