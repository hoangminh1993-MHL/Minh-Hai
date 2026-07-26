using System;
using System.IO;
using System.Text;

class InspectRemaining {
    static void Main() {
        string[] lines = File.ReadAllLines(@"d:\antigravity\db.json", Encoding.UTF8);
        for (int i = 0; i < lines.Length; i++) {
            if (System.Text.RegularExpressions.Regex.IsMatch(lines[i], @"├|ß|Γ|╬|┬")) {
                Console.WriteLine("Line " + (i+1) + ": " + lines[i]);
                foreach (char c in lines[i]) {
                    if (c > 127) {
                        Console.Write(@"\u" + ((int)c).ToString("X4"));
                    } else {
                        Console.Write(c);
                    }
                }
                Console.WriteLine();
                Console.WriteLine("-----------------------------------------");
            }
        }
    }
}
