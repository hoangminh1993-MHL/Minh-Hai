using System;
using System.IO;
using System.Text;

class InspectHex2 {
    static void Main() {
        string[] lines = File.ReadAllLines(@"d:\antigravity\db.json", Encoding.UTF8);
        string line = lines[622]; // 0-indexed line 623
        Console.WriteLine("Line 623: " + line);
        foreach (char c in line) {
            Console.WriteLine("Char: " + c + " -> U+" + ((int)c).ToString("X4"));
        }
    }
}
