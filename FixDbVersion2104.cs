using System;
using System.IO;
using System.Text;
using System.Text.RegularExpressions;

class FixDbVersion2104 {
    static void Main() {
        string path = @"d:\antigravity\db.json";
        string text = File.ReadAllText(path, Encoding.UTF8);

        // Sanitize stage names
        text = text.Replace("Nhß║¡n th├┤ng tin", "Nhận thông tin");
        text = text.Replace("Lß║Ñy S─ÉT", "Lấy SĐT");
        text = text.Replace("Khai th├íc th├┤ng tin", "Khai thác thông tin");
        text = text.Replace("B├ío gi├í", "Báo giá");
        text = text.Replace("Th╞░╞íng l╞░ß╗úng", "Thương lượng");
        text = text.Replace("Th├ánh c├┤ng", "Thành công");
        text = text.Replace("Thß║Ñt bß║íi", "Thất bại");

        // Bump version to 21.04
        text = Regex.Replace(text, @"""dbVersion"":\s*""\d+\.\d+""", @"""dbVersion"": ""21.04""");

        File.WriteAllText(path, text, new UTF8Encoding(false));
        Console.WriteLine("FixDbVersion2104 executed successfully!");
    }
}
