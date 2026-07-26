using System;
using System.IO;
using System.Text;
using System.Text.RegularExpressions;

class FixAllMojibakeFinal {
    static void Main() {
        string path = @"d:\antigravity\db.json";
        string text = File.ReadAllText(path, Encoding.UTF8);

        // Standard stage names
        text = text.Replace("Nhß║¡n th├┤ng tin", "Nhận thông tin");
        text = text.Replace("Nhß║¡n th\u00C3\u00B4ngng tin", "Nhận thông tin");
        text = text.Replace("Lß║Ñy S─ÉT", "Lấy SĐT");
        text = text.Replace("Khai th├íc th├┤ng tin", "Khai thác thông tin");
        text = text.Replace("Khai th├íc th\u00C3\u00B4ngng tin", "Khai thác thông tin");
        text = text.Replace("B├ío gi├í", "Báo giá");
        text = text.Replace("Th╞░╞íng l╞░ß╗úng", "Thương lượng");
        text = text.Replace("Th├ánh c├┤ng", "Thành công");
        text = text.Replace("Th├ánh c\u00C3\u00B4ngng", "Thành công");
        text = text.Replace("Thß║Ñt bß║íi", "Thất bại");
        text = text.Replace("Th?tt bß║íi", "Thất bại");

        // Specific lead notes
        text = text.Replace("T\u0393\u00F6\u00A3\u00E1 v\u0393\u00F6\u00A3\\u252C\u00BCn v\u0393\u00F6\u00A3\\u252C\u00BCn chuy\u0393\u00F6\u00A3\\u252C\u00BCn linh ki\u0393\u00F6\u00A3\\u252C\u00BCn", "Tư vấn vận chuyển linh kiện");
        text = text.Replace("Tß║í vß║ún vß║ún chuyß║ún linh kiß║ún", "Tư vấn vận chuyển linh kiện");
        text = text.Replace("KH y\u0393\u00F6\u00A3\\u252C\u00F3u c\\u251C\u0192\u0393\u00F2\u00E6\\u252C\\u2551n", "KH yêu cầu cần");

        // Clean any remaining non-UTF8 CP437 symbols in notes
        text = Regex.Replace(text, @"Cß║ºn t├¼m[\s\S]*?ko""", "[Mã KH: MH404 - Liên193] Cần tìm nguồn hàng ruy băng decor \\n15/6 : Làm việc với xưởng ruy băng và lưới Kh gửi. Bên lưới gửi mẫu free cho 2 cuộn thường và lưới \\n16/6 : Xưởng lưới đã gửi 2 cuộn lưới mẫu : kích thước bản rộng 52cm 10Y - 1 cuộn nặng 240-250g \\n18/6 : Đặt hàng mẫu 2 xưởng ruy băng. Đang đợi hàng về \\n25/6 : Hàng mẫu về đợi khách làm dòng sp cần ko\"");
        text = Regex.Replace(text, @"KH y├¬u cß║ºu u : H╞░[\s\S]*?n\.\.\.""", "KH yêu cầu : Hướng dẫn tạo tk app cty\"");

        File.WriteAllText(path, text, new UTF8Encoding(false));
        Console.WriteLine("FixAllMojibakeFinal executed successfully!");
    }
}
