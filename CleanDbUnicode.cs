using System;
using System.IO;
using System.Text;
using System.Text.RegularExpressions;

class CleanDbUnicode {
    static void Main() {
        string path = @"d:\antigravity\db.json";
        string text = File.ReadAllText(path, Encoding.UTF8);

        // Stage names via exact unicode escapes
        text = text.Replace("Nh\u00DF\u00BA\u00A1n th\u00C3\u00B4ng tin", "Nhận thông tin");
        text = text.Replace("L\u00DF\u00BA\u00D1y S\u00C4\u00E6T", "Lấy SĐT");
        text = text.Replace("Khai th\u00C3\u00A1c th\u00C3\u00B4ng tin", "Khai thác thông tin");
        text = text.Replace("B\u00C3\u00A1o gi\u00C3\u00A1", "Báo giá");
        text = text.Replace("Th\u00C6\u00B0\u00C6\u00BDng l\u00C6\u00B0\u00DF\u00BA\u00ABng", "Thương lượng");
        text = text.Replace("Th\u00C3\u00A1nh c\u00C3\u00B4ng", "Thành công");
        text = text.Replace("Th\u00DF\u00BA\u00D1t b\u00DF\u00BA\u00A1i", "Thất bại");

        // Specific multi-line notes & names with unicode escapes
        text = Regex.Replace(text, @"Kh\u00C3\u00A1ch Messenger Remote", "Khách Messenger Remote");
        text = Regex.Replace(text, @"Kh\u00C3\u00A1ch Messenger 999", "Khách Messenger 999");
        text = Regex.Replace(text, @"Kh\u00C3\u00A1ch Messenger", "Khách Messenger");
        text = Regex.Replace(text, @"D\u00C3\u00BAng T\u00C3\u00BAc|D\u00C3\u00BAng t\u00C3\u00BAc|D\u00C6\u00B0\u00C6\u00BDng T\u00C3\u00B3c", "Dương Tóc");
        text = Regex.Replace(text, @"Anh Ph\u00C6\u00B0\u00C6\u00BDng", "Anh Phương");
        text = Regex.Replace(text, @"Minh Nguy\u00DF\u00BA\u00A0n", "Minh Nguyễn");
        text = Regex.Replace(text, @"Hu\u00C6\u00B0\u00C6\u00BDng Ph\u00DF\u00BA\u00A1m|Hu\u00C6\u00B0\u00C6\u00BDng Ph\u00E1", "Huơng Phạm");
        text = Regex.Replace(text, @"Xu\u00C3\u00B3n H\u00C3\u00A1i \u00C4\u00C9\u00C3\u00A1nh|Xu\u00C3\u00B3n H\u00DF\u00BA\u00FAi Đinh|Xuân Hải Dinh", "Xuân Hải Đinh");
        text = Regex.Replace(text, @"\u00C4\u00C9\u00C3\u00A1nh Ph\u00C3\u00BAc An|Dinh Phúc An", "Đinh Phúc An");
        text = Regex.Replace(text, @"Ho\u00C3\u00B1ng Th\u00C3\u00B9y Du\u00C6\u00B0\u00C6\u00BDng", "Hoàng Thùy Dương");
        text = Regex.Replace(text, @"Ph\u00DF\u00BA\u00A1m Thu\u00DF\u00BA\u00A1n", "Phạm Thuận");
        text = Regex.Replace(text, @"Mai H\u00DF\u00BA\u00D6ng VPP", "Mai Hồng VPP");
        text = Regex.Replace(text, @"Ho\u00C3\u00B1ng Ph\u00C3\u00A1t Koffmann", "Hoàng Phát Koffmann");
        text = Regex.Replace(text, @"V\u00C3\u00B2ng bi Ph\u00C3\u00BA Qu\u00C3\u00BD", "Vòng bi Phú Quý");
        text = Regex.Replace(text, @"Nha Phuong B\u00C3\u00B9i", "Nha Phuong Bùi");
        text = Regex.Replace(text, @"Qu\u00DF\u00BA\u00E6c Kh\u00C3\u00A1nh", "Quốc Khánh");
        text = Regex.Replace(text, @"Minh T\u00C3\u00ADm", "Minh Tâm");
        text = Regex.Replace(text, @"B\u00DF\u00BA\u00FAo Ng\u00DF\u00BA\u00ECc Rice", "Bảo Ngọc Rice");
        text = Regex.Replace(text, @"S\u00C6\u00AD n Quang L\u00C3\u00ADm", "Sơn Quang Lâm");
        text = Regex.Replace(text, @"Ph\u00DF\u00BA\u00A1m Th\u00DF\u00BA\u00EF Anh Ng\u00DF\u00BA\u00ECc", "Phạm Thị Anh Ngọc");
        text = Regex.Replace(text, @"Ho\u00C3\u00B1ng C\u00C6\u00B0\u00C6\u00BDng Biz", "Hoàng Cường Biz");
        text = Regex.Replace(text, @"V\u00C5\u00B6 Ng\u00DF\u00BA\u00ECc Huy\u00DF\u00BA\u00FCn", "Vũ Ngọc Huyền");
        text = Regex.Replace(text, @"Tr\u00DF\u00BA\u00BAn Hi\u00DF\u00BA\u00BDu", "Trần Hiếu");
        text = Regex.Replace(text, @"H\u00C6\u00B0\u00C6\u00BDng V\u00C5\u00B6", "Hương Vũ");
        text = Regex.Replace(text, @"Ruby Nguy\u00DF\u00BA\u00A0n", "Ruby Nguyễn");
        text = Regex.Replace(text, @"Di\u00DF\u00BA\u00E5m Qu\u00DF\u00BA\u00B3nh|\u00C4\u00C9i\u00DF\u00BA\u00A2m Qu\u00DF\u00BA\u00B3nh", "Điểm Quỳnh");

        // Generic character mapping
        text = text.Replace("\u00C4\u00C9", "Đ").Replace("\u00C4\u00E6", "đ");
        text = text.Replace("\u00C3\u00BA", "ú").Replace("\u00C3\u00A1", "á").Replace("\u00C3\u00AD", "í").Replace("\u00C3\u00B4", "ô");
        text = text.Replace("\u00C3\u00AA", "ê").Replace("\u00C3\u00A0", "à").Replace("\u00C3\u00BF", "è").Replace("\u00C3\u00B9", "ù").Replace("\u00C3\u00BD", "ý");
        text = text.Replace("\u00DF\u00BAa", "ẩ").Replace("\u00DF\u00BA\u00E5", "ổ").Replace("\u00DF\u00BA\u00E0", "ề").Replace("\u00DF\u00BA\u00EF", "ị");
        text = text.Replace("\u00DF\u00BA\u00EC", "ỉ").Replace("\u00DF\u00BA\u00C5", "ỏ").Replace("\u00DF\u00BA\u00FC", "ụ").Replace("\u00DF\u00BA\u00F1", "ủ");
        text = text.Replace("\u00DF\u00BA\u00AA", "ữ").Replace("\u00DF\u00BA\u00BF", "ừ").Replace("\u00DF\u00BA\u00AB", "ứ").Replace("\u00DF\u00BA\u00B0", "ử").Replace("\u00DF\u00BA\u00B2", "ữ");
        text = text.Replace("\u00DF\u00BA\u00ADm", "ạm").Replace("\u00DF\u00BA\u00A1", "ạ").Replace("\u00DF\u00BA\u00BA", "ầ").Replace("\u00DF\u00BA\u00BD", "ế");
        text = text.Replace("\u00DF\u00BA\u00BD", "ẽ").Replace("\u00DF\u00BA\u00B7", "ặt").Replace("\u00DF\u00BA\u00F6", "ố");
        text = text.Replace("\u00DF\u00BA\u00B6", "ắ").Replace("\u00DF\u00BA\u00A1n", "ận").Replace("\u00DF\u00BA\u00C7", "ẵ").Replace("\u00DF\u00BA\u00AB", "ẳ");
        text = text.Replace("\u00DF\u00BA\u00B1", "ằ").Replace("\u00DF\u00BA\u00AF", "ắ").Replace("\u00DF\u00BA\u00A3", "ả");
        text = text.Replace("\u00DF\u00BA\u00FD", "ấ").Replace("\u00DF\u00BA\u00A7", "ẩ").Replace("\u00DF\u00BA\u00A8", "ẫ");
        text = text.Replace("\u00DF\u00BA\u00A9", "ậ").Replace("\u00DF\u00BA\u00AA", "ẽ").Replace("\u00DF\u00BA\u00AE", "ẽ");
        text = text.Replace("\u00DF\u00BA\u00B0", "ề").Replace("\u00DF\u00BA\u00B1", "ể").Replace("\u00DF\u00BA\u00B2", "ễ");
        text = text.Replace("\u00DF\u00BA\u00B3", "ệ").Replace("\u00DF\u00BA\u00B4", "ỉ").Replace("\u00DF\u00BA\u00B6", "ọ");
        text = text.Replace("\u00DF\u00BA\u00B7", "ỏ").Replace("\u00DF\u00BA\u00B8", "ố").Replace("\u00DF\u00BA\u00BA", "ổ");
        text = text.Replace("\u00DF\u00BA\u00BB", "ỗ").Replace("\u00DF\u00BA\u00BC", "ộ").Replace("\u00DF\u00BA\u00BD", "ớ").Replace("\u00DF\u00BA\u00BE", "ờ");
        text = text.Replace("\u00DF\u00BA\u00BF", "ở").Replace("b\u00C4\u00E6ng", "băng").Replace("l\u00C6\u00B0\u00DF\u00BA\u00A2i", "lưới");
        text = text.Replace("th\u00C6\u00B0\u00DF\u00BA\u00A5ng", "thường").Replace("k\u00C3\u00ADch", "kích").Replace("th\u00C6\u00B0\u00DF\u00BA\u00A2c", "thước");
        text = text.Replace("b\u00DF\u00BAn", "bản").Replace("r\u00DF\u00BA\u00D6ng", "rộng").Replace("n\u00DF\u00BA\u00B7ng", "nặng");

        File.WriteAllText(path, text, new UTF8Encoding(false));
        Console.WriteLine("CleanDbUnicode executed successfully!");
    }
}
