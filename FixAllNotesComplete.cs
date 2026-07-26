using System;
using System.IO;
using System.Text;
using System.Text.RegularExpressions;

class FixAllNotesComplete {
    static void Main() {
        string path = @"d:\antigravity\db.json";
        string[] lines = File.ReadAllLines(path, Encoding.UTF8);

        lines[1131] = "                      \"note\":  \"KH yêu cầu : Hướng dẫn tạo tk app cty\",";
        lines[1157] = "                                        \"note\":  \"KH yêu cầu : Hướng dẫn tạo tk app cty\"";

        lines[1435] = "                      \"note\":  \"Đang xin sđt hỗ trợ. Đã gửi\",";
        lines[1461] = "                                        \"note\":  \"Đang xin sđt hỗ trợ. Đã gửi\"";

        for (int i = 0; i < lines.Length; i++) {
            // General Mojibake decoders for remaining notes
            lines[i] = Regex.Replace(lines[i], @"y├¬u cß║ºu", "yêu cầu");
            lines[i] = Regex.Replace(lines[i], @"H╞░\?ng dß║½n", "Hướng dẫn");
            lines[i] = Regex.Replace(lines[i], @"t\?io tk", "tạo tk");
            lines[i] = Regex.Replace(lines[i], @"Dang xin sdt", "Đang xin sđt");
            lines[i] = Regex.Replace(lines[i], @"hß╗ tr\?u", "hỗ trợ");
            lines[i] = Regex.Replace(lines[i], @"D├ gß╗¡i", "Đã gửi");
            lines[i] = Regex.Replace(lines[i], @"D├ bo gi", "Đã báo giá");
            lines[i] = Regex.Replace(lines[i], @"D├", "Đã");
            lines[i] = Regex.Replace(lines[i], @"gß╗¡i", "gửi");
            lines[i] = Regex.Replace(lines[i], @"hß╗Åi", "hỏi");
            lines[i] = Regex.Replace(lines[i], @"Hß╗Åi", "Hỏi");
            lines[i] = Regex.Replace(lines[i], @"b─âng d├¡nh", "băng dính");
            lines[i] = Regex.Replace(lines[i], @"Li├¬n hß╗ç", "Liên hệ");
            lines[i] = Regex.Replace(lines[i], @"ch╞░a", "chưa");
            lines[i] = Regex.Replace(lines[i], @"li├¬n lß║c", "liên lạc");
            lines[i] = Regex.Replace(lines[i], @"─æc", "được");
        }

        File.WriteAllLines(path, lines, new UTF8Encoding(false));
        Console.WriteLine("FixAllNotesComplete executed successfully!");
    }
}
