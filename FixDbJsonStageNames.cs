using System;
using System.IO;
using System.Text;

class FixDbJsonStageNames {
    static void Main() {
        string path = @"d:\antigravity\db.json";
        string text = File.ReadAllText(path, Encoding.UTF8);

        text = text.Replace("Nhß║¡n th├┤ng tin", "Nhận thông tin");
        text = text.Replace("Lß║Ñy S─ÉT", "Lấy SĐT");
        text = text.Replace("Khai th├íc th├┤ng tin", "Khai thác thông tin");
        text = text.Replace("B├ío gi├í", "Báo giá");
        text = text.Replace("Th╞░╞íng l╞░ß╗úng", "Thương lượng");
        text = text.Replace("Th├ánh c├┤ng", "Thành công");
        text = text.Replace("Thß║Ñt bß║íi", "Thất bại");

        text = text.Replace("Nh\u00DF\u00BA\u00A1n th\u00C3\u00B4ng tin", "Nhận thông tin");
        text = text.Replace("L\u00DF\u00BA\u00D1y S\u00E2\u00C4T", "Lấy SĐT");
        text = text.Replace("Khai th\u00C3\u00ADc th\u00C3\u00B4ng tin", "Khai thác thông tin");
        text = text.Replace("B\u00C3\u00ADo gi\u00C3\u00AD", "Báo giá");
        text = text.Replace("Th\u00C6\u00B0\u00C6\u00ADng l\u00C6\u00B0\u00DF\u00BB\u00FAng", "Thương lượng");
        text = text.Replace("Th\u00C3\u00A1nh c\u00C3\u00B4ng", "Thành công");
        text = text.Replace("Th\u00DF\u00BA\u00D1t b\u00DF\u00BA\u00ADi", "Thất bại");

        File.WriteAllText(path, text, new UTF8Encoding(false));
        Console.WriteLine("FixDbJsonStageNames executed successfully!");
    }
}
