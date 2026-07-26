using System;
using System.IO;
using System.Text;
using System.Text.RegularExpressions;

class FixRemaining66 {
    static void Main() {
        string path = @"d:\antigravity\db.json";
        string[] lines = File.ReadAllLines(path, Encoding.UTF8);

        lines[2513] = "                      \"note\":  \"[Mã KH: MH408 - Nguyễn Minh Tâm] Đặt set váy : KH lẻ 35k/1kg. 0% phí dv.\",";
        lines[2591] = "                                        \"note\":  \"[Mã KH: MH408 - Nguyễn Minh Tâm] Đặt set váy : KH lẻ 35k/1kg. 0% phí dv.\"";

        lines[3363] = "                      \"note\":  \"Nhận giấy Tiểu ngạch và CN\\n3/7 : Đã báo giá CN. Hẹn KH sang tuần qua công ty để làm việc.\\n11/7 : Hẹn lịch KH thứ 2 qua công ty trao đổi\",";
        lines[3441] = "                                        \"note\":  \"Nhận giấy Tiểu ngạch và CN\\n3/7 : Đã báo giá CN. Hẹn KH sang tuần qua công ty để làm việc.\\n11/7 : Hẹn lịch KH thứ 2 qua công ty trao đổi\"";

        for (int i = 0; i < lines.Length; i++) {
            lines[i] = Regex.Replace(lines[i], @"\[M├ KH: MH408 - Nguyß╗n Minh T├óm\] D\?t set vy : KH l\? 35k/1kg\. 0% ph├¡ dv\.", "[Mã KH: MH408 - Nguyễn Minh Tâm] Đặt set váy : KH lẻ 35k/1kg. 0% phí dv.");
            lines[i] = Regex.Replace(lines[i], @"Nguyß╗n Minh T├óm", "Nguyễn Minh Tâm");
            lines[i] = Regex.Replace(lines[i], @"D\?t set vy", "Đặt set váy");
            lines[i] = Regex.Replace(lines[i], @"KH l\?", "KH lẻ");
            lines[i] = Regex.Replace(lines[i], @"Nh\?n giy Ti\?u ng?ch v CN", "Nhận giấy Tiểu ngạch và CN");
            lines[i] = Regex.Replace(lines[i], @"D├ bo gi CN", "Đã báo giá CN");
            lines[i] = Regex.Replace(lines[i], @"Hß║╣n KH sang tuß║ºn qua cngng ty d\? lm vi\?uc", "Hẹn KH sang tuần qua công ty để làm việc");
            lines[i] = Regex.Replace(lines[i], @"Hß║╣n l\?ch KH thß╗⌐ 2 qua cngng ty trao dß╗òi", "Hẹn lịch KH thứ 2 qua công ty trao đổi");
        }

        File.WriteAllLines(path, lines, new UTF8Encoding(false));
        Console.WriteLine("FixRemaining66 executed successfully!");
    }
}
