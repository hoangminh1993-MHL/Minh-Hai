using System;
using System.IO;
using System.Text;
using System.Text.RegularExpressions;

class FindLeadNotes {
    static void Main() {
        string text = File.ReadAllText(@"d:\antigravity\db.json", Encoding.UTF8);
        MatchCollection matches = Regex.Matches(text, @"""id"":\s*""(lead-\d+)""[\s\S]*?""name"":\s*""(.*?)""[\s\S]*?""note"":\s*""(.*?)""", RegexOptions.Singleline);
        foreach (Match m in matches) {
            string id = m.Groups[1].Value;
            string name = m.Groups[2].Value;
            string note = m.Groups[3].Value;
            if (Regex.IsMatch(note, @"├|ß|Γ|╬|┬|\?|─")) {
                Console.WriteLine("ID: " + id + " | Name: " + name);
                Console.WriteLine("Note snippet: " + (note.Length > 100 ? note.Substring(0, 100) : note));
                Console.WriteLine("-----------------------------------------");
            }
        }
    }
}
