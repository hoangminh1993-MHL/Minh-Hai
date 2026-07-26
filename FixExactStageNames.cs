using System;
using System.IO;
using System.Text;

class FixExactStageNames {
    static void Main() {
        string path = @"d:\antigravity\db.json";
        string text = File.ReadAllText(path, Encoding.UTF8);

        // 7 Stage Names
        text = text.Replace("Nh\u251C\u0192\u0393\u00F2\u00E6\u252C\u00EDn th\u0393\u00F6\u00A3\u0393\u00F6\u00F1ng tin", "Nhận thông tin");
        text = text.Replace("L\u251C\u0192\u0393\u00F2\u00E6\u251C\u00E6y S\u0393\u00F6\u00C7\u251C\u00EBT", "Lấy SĐT");
        text = text.Replace("Khai th\u0393\u00F6\u00A3\u00EDc th\u0393\u00F6\u00A3\u0393\u00F6\u00F1ng tin", "Khai thác thông tin");
        text = text.Replace("B\u0393\u00F6\u00A3\u00EDo gi\u0393\u00F6\u00A3\u00ED", "Báo giá");
        text = text.Replace("Th\u0393\u00F2\u20A7\u0393\u00FB\u00E6\u0393\u00F2\u20A7\u00EDng l\u0393\u00F2\u20A7\u0393\u00FB\u00E6\u251C\u0192\u0393\u00F2\u00F9\u00FAng", "Thương lượng");
        text = text.Replace("Th\u0393\u00F6\u00A3\u00E1nh c\u0393\u00F6\u00A3\u0393\u00F6\u00F1ng", "Thành công");
        text = text.Replace("Th\u251C\u0192\u0393\u00F2\u00E6\u251C\u00E6t b\u251C\u0192\u0393\u00F2\u00E6\u00EDi", "Thất bại");

        // Generic Character Decoders
        text = text.Replace("\u0393\u00F6\u00A3\u0393\u00F6\u00F1", "ông");
        text = text.Replace("\u0393\u00F6\u00A3\u00ED", "á");
        text = text.Replace("\u0393\u00F6\u00A3\u00E1", "à");
        text = text.Replace("\u0393\u00F6\u00C7\u251C\u00EB", "Đ");
        text = text.Replace("\u251C\u0192\u0393\u00F2\u00E6\u251C\u00E6", "ất");
        text = text.Replace("\u251C\u0192\u0393\u00F2\u00E6\u00ED", "ại");
        text = text.Replace("\u251C\u0192\u0393\u00F2\u00E6\u252C\u00ED", "ận");
        text = text.Replace("\u0393\u00F2\u20A7\u0393\u00FB\u00E6\u0393\u00F2\u20A7\u00ED", "ương");
        text = text.Replace("\u0393\u00F2\u20A7\u0393\u00FB\u00E6\u251C\u0192\u0393\u00F2\u00F9\u00FA", "ượng");

        File.WriteAllText(path, text, new UTF8Encoding(false));
        Console.WriteLine("FixExactStageNames executed successfully!");
    }
}
