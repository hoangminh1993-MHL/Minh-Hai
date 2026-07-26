using System;
using System.IO;
using System.Text;

class InspectHex {
    static void Main() {
        string[] lines = File.ReadAllLines(@"d:\antigravity\db.json", Encoding.UTF8);
        string line = lines[609]; // 0-indexed line 610
        Console.WriteLine("Line: " + line);
        foreach (char c in line) {
            Console.WriteLine("Char: " + c + " -> U+" + ((int)c).ToString("X4"));
        }
    }
}
