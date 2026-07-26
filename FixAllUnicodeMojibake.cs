using System;
using System.IO;
using System.Text;
using System.Text.RegularExpressions;

class FixAllUnicodeMojibake {
    static void Main() {
        string path = @"d:\antigravity\db.json";
        string text = File.ReadAllText(path, Encoding.UTF8);

        // Stage names exact replacements using hex escapes
        text = text.Replace("Nh\u251C\u0192\u0393\u00F2\u00E6\u252C\u00EDn th\u0393\u00F6\u00A3\u0393\u00F6\u00F1ng tin", "Nhận thông tin");
        text = text.Replace("Nh\u251C\u0192\u0393\u00F2\u00E6\u252C\u00EDn th\u251C\u00F4ng tin", "Nhận thông tin");
        text = text.Replace("L\u00DF\u00BA\u00D1y S\u00C4\u00E6T", "Lấy SĐT");
        text = text.Replace("L\u251C\u00A3y S\u00C4\u00E6T", "Lấy SĐT");
        text = text.Replace("Khai th\u251C\u00A1c th\u0393\u00F6\u00A3\u0393\u00F6\u00F1ng tin", "Khai thác thông tin");
        text = text.Replace("Khai th\u251C\u00A1c th\u251C\u00F4ng tin", "Khai thác thông tin");
        text = text.Replace("B\u251C\u00A1o gi\u251C\u00A1", "Báo giá");
        text = text.Replace("Th\u0192\u0393\u00F2\u00A2\u0192\u0393\u00F2\u00ABng l\u0192\u0393\u00F2\u00A2\u252C\u00ABng", "Thương lượng");
        text = text.Replace("Th\u0192\u0393\u00F2\u00A2\u0192\u0393\u00F2\u00ABng l\u00C6\u00B0\u00DF\u00BA\u00ABng", "Thương lượng");
        text = text.Replace("Th\u251C\u00A1nh c\u0393\u00F6\u00A3\u0393\u00F6\u00F1ng", "Thành công");
        text = text.Replace("Th\u251C\u00A1nh c\u251C\u00F4ng", "Thành công");
        text = text.Replace("Th\u251C\u00A3t b\u251C\u00A1i", "Thất bại");
        text = text.Replace("Th\u00DF\u00BA\u00D1t b\u00DF\u00BA\u00A1i", "Thất bại");

        // Specific lead names & notes decoders
        text = text.Replace("Kh\u251C\u00A1ch Messenger Remote", "Khách Messenger Remote");
        text = text.Replace("Kh\u251C\u00A1ch Messenger 999", "Khách Messenger 999");
        text = text.Replace("Kh\u251C\u00A1ch Messenger", "Khách Messenger");
        text = text.Replace("D\u00C6\u00B0\u00C6\u00BDng T\u00C3\u00B3c", "Dương Tóc");
        text = text.Replace("D\u0192\u0393\u00F2\u00A2\u0192\u0393\u00F2\u00ADng T\u251C\u00B3c", "Dương Tóc");
        text = text.Replace("D\u251C\u00BAng T\u251C\u00BAc", "Dương Tóc");
        text = text.Replace("Anh Ph\u0192\u0393\u00F2\u00A2\u0192\u0393\u00F2\u00ADng", "Anh Phương");
        text = text.Replace("Minh Nguy\u252C\u00A0n", "Minh Nguyễn");
        text = text.Replace("Hu\u0192\u0393\u00F2\u00A2\u0192\u0393\u00F2\u00ADng Ph\u251C\u00A1m", "Huơng Phạm");
        text = text.Replace("Xu\u251C\u00B3n H\u251C\u00A1i \u2500\u00C3\u251C\u00ADnh", "Xuân Hải Đinh");
        text = text.Replace("Xu\u251C\u00B3n H\u251C\u00FAi \u00C4\u00C9inh", "Xuân Hải Đinh");
        text = text.Replace("\u2500\u00C3\u251C\u00ADnh Ph\u251C\u00BAc An", "Đinh Phúc An");
        text = text.Replace("Ho\u251C\u00B1ng Th\u251C\u00B9y Du\u0192\u0393\u00F2\u00A2\u0192\u0393\u00F2\u00ADng", "Hoàng Thùy Dương");
        text = text.Replace("Ph\u251C\u00A1m Thu\u251C\u00A1n", "Phạm Thuận");
        text = text.Replace("Mai H\u252C\u00D6ng VPP", "Mai Hồng VPP");
        text = text.Replace("Ho\u251C\u00B1ng Ph\u251C\u00A1t Koffmann", "Hoàng Phát Koffmann");
        text = text.Replace("V\u251C\u00B2ng bi Ph\u251C\u00BA Qu\u251C\u00BD", "Vòng bi Phú Quý");
        text = text.Replace("Nha Phuong B\u251C\u00B9i", "Nha Phuong Bùi");
        text = text.Replace("Qu\u252C\u00E6c Kh\u251C\u00A1nh", "Quốc Khánh");
        text = text.Replace("Minh T\u251C\u00ADm", "Minh Tâm");
        text = text.Replace("B\u251C\u00FAo Ng\u251C\u00ECc Rice", "Bảo Ngọc Rice");
        text = text.Replace("S\u0192\u0393\u00F2\u00AD n Quang L\u251C\u00ADm", "Sơn Quang Lâm");
        text = text.Replace("Ph\u251C\u00A1m Th\u251C\u00EF Anh Ng\u251C\u00ECc", "Phạm Thị Anh Ngọc");
        text = text.Replace("Ho\u251C\u00B1ng C\u0192\u0393\u00F2\u00A2\u0192\u0393\u00F2\u00ADng Biz", "Hoàng Cường Biz");
        text = text.Replace("V\u00C5\u00B6 Ng\u251C\u00ECc Huy\u251C\u00FCn", "Vũ Ngọc Huyền");
        text = text.Replace("Tr\u251C\u00BAn Hi\u251C\u00BDu", "Trần Hiếu");
        text = text.Replace("H\u0192\u0393\u00F2\u00A2\u0192\u0393\u00F2\u00ADng V\u00C5\u00B6", "Hương Vũ");
        text = text.Replace("Ruby Nguy\u252C\u00A0n", "Ruby Nguyễn");
        text = text.Replace("Di\u252C\u00E5m Qu\u252C\u00B3nh", "Điểm Quỳnh");

        // Generic Triple-Mojibake replacements
        text = text.Replace("\u2500\u00C3", "Đ").Replace("\u2500\u00E6", "đ");
        text = text.Replace("\u251C\u00BA", "ú").Replace("\u251C\u00A1", "á").Replace("\u251C\u00AD", "í").Replace("\u251C\u00F4", "ô");
        text = text.Replace("\u251C\u00AA", "ê").Replace("\u251C\u00A0", "à").Replace("\u251C\u00BF", "è").Replace("\u251C\u00B9", "ù").Replace("\u251C\u00BD", "ý");
        text = text.Replace("\u252C\u00A0", "ề").Replace("\u252C\u00D6", "ồ").Replace("\u252C\u00E6", "ố").Replace("\u252C\u00E5", "ể");
        text = text.Replace("\u0192\u0393\u00F2\u00A2", "ơ").Replace("\u0192\u0393\u00F2\u00AD", "ương").Replace("\u0192\u0393\u00F2\u00AB", "ượ");

        File.WriteAllText(path, text, new UTF8Encoding(false));
        Console.WriteLine("FixAllUnicodeMojibake executed successfully!");
    }
}
