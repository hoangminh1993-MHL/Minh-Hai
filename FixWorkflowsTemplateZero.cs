using System;
using System.IO;
using System.Text;

class FixWorkflowsTemplateZero {
    static void Main() {
        string path = @"d:\antigravity\db.json";
        string text = File.ReadAllText(path, Encoding.UTF8);

        // Replace all remaining CP437 symbols in workflow steps
        text = System.Text.RegularExpressions.Regex.Replace(text, @"[├ßΓ╬┬\u0393\u00F6\u00F2\u251C\u0192\u00FB\u00EA\u00E6\u252C\u00A3\u00ED\u00E1\u20A7\u255D\u255E\u00C7\u00C9\u00F4\u00F1\u00FA\u00F9\u00FA\u00FB\u00FC\u00FD\u00FE\u00FF\uFFFD\u251C\u0192\u252C\u2510\u2551\u255D\u255E\u20A7]+", "");

        File.WriteAllText(path, text, new UTF8Encoding(false));
        Console.WriteLine("FixWorkflowsTemplateZero executed successfully!");
    }
}
