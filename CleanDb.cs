using System;
using System.IO;
using System.Text;
using System.Text.RegularExpressions;

class CleanDb {
    static void Main() {
        string path = @"d:\antigravity\db.json";
        string text = File.ReadAllText(path, Encoding.UTF8);

        // Stage Names
        text = text.Replace("Nhß║¡n th├┤ng tin", "Nhận thông tin");
        text = text.Replace("Lß║Ñy S─ÉT", "Lấy SĐT");
        text = text.Replace("Khai th├c th├┤ng tin", "Khai thác thông tin");
        text = text.Replace("B├o gi├", "Báo giá");
        text = text.Replace("Th╞░╞ng l╞░ß╗ng", "Thương lượng");
        text = text.Replace("Th├nh c├┤ng", "Thành công");
        text = text.Replace("Thß║Ñt bß║i", "Thất bại");

        // Specific lead names & notes
        text = Regex.Replace(text, @"Kh├ích Messenger Remote", "Khách Messenger Remote");
        text = Regex.Replace(text, @"Kh├ích Messenger 999", "Khách Messenger 999");
        text = Regex.Replace(text, @"Kh├ích Messenger", "Khách Messenger");
        text = Regex.Replace(text, @"D├║ng T├║c|D├║ng t├║c|D╞░╞íng T├│c", "Dương Tóc");
        text = Regex.Replace(text, @"Anh Ph╞░╞íng", "Anh Phương");
        text = Regex.Replace(text, @"Minh Nguyß╗àn", "Minh Nguyễn");
        text = Regex.Replace(text, @"Hu╞░╞íng Phß║ím|Hu╞░╞íng Phạ", "Huơng Phạm");
        text = Regex.Replace(text, @"Xu├ón H├ái ─É├¡nh|Xu├ón Hß║úi Đinh|Xuân Hải Dinh", "Xuân Hải Đinh");
        text = Regex.Replace(text, @"─É├¡nh Ph├║c An|Dinh Phúc An", "Đinh Phúc An");
        text = Regex.Replace(text, @"Ho├óng Th├╣y Du╞░╞íng", "Hoàng Thùy Dương");
        text = Regex.Replace(text, @"Phß║ím Thuß║¡n", "Phạm Thuận");
        text = Regex.Replace(text, @"Mai Hß╗Öng VPP", "Mai Hồng VPP");
        text = Regex.Replace(text, @"Ho├óng Ph├ít Koffmann", "Hoàng Phát Koffmann");
        text = Regex.Replace(text, @"V├▓ng bi Ph├║ Qu├╜", "Vòng bi Phú Quý");
        text = Regex.Replace(text, @"Nha Phuong B├╣i", "Nha Phuong Bùi");
        text = Regex.Replace(text, @"Quß╗æc Kh├ính", "Quốc Khánh");
        text = Regex.Replace(text, @"Minh T├ím", "Minh Tâm");
        text = Regex.Replace(text, @"Bß║úo Ngß╗ìc Rice", "Bảo Ngọc Rice");
        text = Regex.Replace(text, @"S╞í n Quang L├ím", "Sơn Quang Lâm");
        text = Regex.Replace(text, @"Phß║ím Thß╗ï Anh Ngß╗ìc", "Phạm Thị Anh Ngọc");
        text = Regex.Replace(text, @"Ho├óng C╞░╞íng Biz", "Hoàng Cường Biz");
        text = Regex.Replace(text, @"V┼⌐ Ngß╗ìc Huyß╗ün", "Vũ Ngọc Huyền");
        text = Regex.Replace(text, @"Trß║ºn Hiß║┐u", "Trần Hiếu");
        text = Regex.Replace(text, @"H╞░╞íng V┼⌐", "Hương Vũ");
        text = Regex.Replace(text, @"Ruby Nguyß╗ün", "Ruby Nguyễn");
        text = Regex.Replace(text, @"Diß╗åm Quß╗│nh|Điß╗âm Quß╗│nh", "Điểm Quỳnh");

        // Generic character mapping
        text = text.Replace("─É", "Đ").Replace("─æ", "đ");
        text = text.Replace("├║", "ú").Replace("├í", "á").Replace("├¡", "í").Replace("├┤", "ô");
        text = text.Replace("├¬", "ê").Replace("├á", "à").Replace("├¿", "è").Replace("├╣", "ù").Replace("├╜", "ý");
        text = text.Replace("ß╗a", "ẩ").Replace("ß╗å", "ổ").Replace("ß╗à", "ề").Replace("ß╗ï", "ị");
        text = text.Replace("ß╗ì", "ỉ").Replace("ß╗Å", "ỏ").Replace("ß╗ü", "ụ").Replace("ß╗ñ", "ủ");
        text = text.Replace("ß╗ª", "ữ").Replace("ß╗¿", "ừ").Replace("ß╗«", "ứ").Replace("ß╗░", "ử").Replace("ß╗▓", "ữ");
        text = text.Replace("ß║ím", "ạm").Replace("ß║í", "ạ").Replace("ß║º", "ầ").Replace("ß║┐", "ế");
        text = text.Replace("ß║╜", "ẽ").Replace("ß║╖", "ặt").Replace("ß╗ö", "ố");
        text = text.Replace("ß║╢", "ắ").Replace("ß║¡", "ận").Replace("ß║╟", "ẵ").Replace("ß║«", "ẳ");
        text = text.Replace("ß║▒", "ằ").Replace("ß║¯", "ắ").Replace("ß║£", "ả");
        text = text.Replace("ß║¥", "ấ").Replace("ß║§", "ẩ").Replace("ß║¨", "ẫ");
        text = text.Replace("ß║©", "ậ").Replace("ß║ª", "ẽ").Replace("ß║®", "ẽ");
        text = text.Replace("ß║°", "ề").Replace("ß║±", "ể").Replace("ß║²", "ễ");
        text = text.Replace("ß║³", "ệ").Replace("ß║´", "ỉ").Replace("ß║¶", "ọ");
        text = text.Replace("ß║·", "ỏ").Replace("ß║¸", "ố").Replace("ß║º", "ổ");
        text = text.Replace("ß║»", "ỗ").Replace("ß║¼", "ộ").Replace("ß║½", "ớ").Replace("ß║¾", "ờ");
        text = text.Replace("ß║¿", "ở").Replace("b─âng", "băng").Replace("l╞░ß╗¢i", "lưới");
        text = text.Replace("th╞░ß╗¥ng", "thường").Replace("k├¡ch", "kích").Replace("th╞░ß╗¢c", "thước");
        text = text.Replace("bß║n", "bản").Replace("rß╗Öng", "rộng").Replace("nß║╖ng", "nặng");

        File.WriteAllText(path, text, new UTF8Encoding(false));
        Console.WriteLine("CleanDb executed successfully!");
    }
}
