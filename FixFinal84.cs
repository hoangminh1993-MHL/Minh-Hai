using System;
using System.IO;
using System.Text;
using System.Text.RegularExpressions;

class FixFinal84 {
    static void Main() {
        string path = @"d:\antigravity\db.json";
        string text = File.ReadAllText(path, Encoding.UTF8);

        // Regex patterns to clean up all triple-encoded Mojibake
        // 1. Double/Triple encoded accented vowels:
        text = Regex.Replace(text, @"\u0393\u00F6\u00A3\u0393\u00F6\u00F1|\u00C3\u00B4ng|\u0393\u00F6\u00A3ng", "ông");
        text = Regex.Replace(text, @"\u0393\u00F6\u00A3\u00ED|\u00C3\u00A1", "á");
        text = Regex.Replace(text, @"\u0393\u00F6\u00A3\u00E1|\u00C3\u00A0", "à");
        text = Regex.Replace(text, @"\u0393\u00F6\u00C7\u251C\u00EB|\u00C4\u00C9", "Đ");
        text = Regex.Replace(text, @"\u0393\u00F6\u00C7\u00EAang|\u0393\u00F6\u00C7\u00EA", "đ");
        text = Regex.Replace(text, @"\u251C\u0192\u0393\u00F2\u00E6\u251C\u00E6", "ất");
        text = Regex.Replace(text, @"\u251C\u0192\u0393\u00F2\u00E6\u00ED|\u251C\u0192\u0393\u00F2\u00E6i", "ại");
        text = Regex.Replace(text, @"\u251C\u0192\u0393\u00F2\u00E6\u252C\u00ED|\u251C\u0192\u0393\u00F2\u00E6n", "ận");
        text = Regex.Replace(text, @"\u0393\u00F2\u20A7\u0393\u00FB\u00E6\u0393\u00F2\u20A7\u00ED|\u0393\u00F2\u20A7\u0393\u00FB\u00E6ng", "ương");
        text = Regex.Replace(text, @"\u0393\u00F2\u20A7\u0393\u00FB\u00E6\u251C\u0192\u0393\u00F2\u00F9\u00FA|\u01B0\u1EE3ngng", "ượng");
        text = Regex.Replace(text, @"\u251C\u0192\u0393\u00F2\u00F9\u252C\u00F3i|\u251C\u0192\u0393\u00F2\u00F9i", "ới");
        text = Regex.Replace(text, @"\u251C\u0192\u0393\u00F2\u00F9\u00FA", "ệu");
        text = Regex.Replace(text, @"\u251C\u0192\u0393\u00F2\u00F9\u251C\u255D|\u251C\u0192\u0393\u00F2\u00F9u", "ều");
        text = Regex.Replace(text, @"\u251C\u0192\u0393\u00F2\u00F9\u252C\u00F3ng", "ởng");
        text = Regex.Replace(text, @"\u251C\u0192\u0393\u00F2\u00E6\u00FAnh", "ảnh");
        text = Regex.Replace(text, @"\u251C\u0192\u0393\u00F2\u00F9\u255E\u00C6ng", "ưởng");
        text = Regex.Replace(text, @"\u0393\u00F6\u00A3\u252C\u00BCn", "ên");
        text = Regex.Replace(text, @"\u0393\u00F6\u00A3\u00FAo", "áo");
        text = Regex.Replace(text, @"\u1EADnp|\u1EADnt", "ận");
        text = Regex.Replace(text, @"\u01B0\u1EE3ngc", "ược");
        text = Regex.Replace(text, @"\u251C\u0192\u0393\u00F2\u00F9\u00F4ng", "ồng");
        text = Regex.Replace(text, @"\u251C\u0192\u0393\u00F2\u00F9\u00EAt", "ốt");
        text = Regex.Replace(text, @"\u1EA1ii", "ại");
        text = Regex.Replace(text, @"\u251C\u0192\u0393\u00F2\u00F9\u00EA", "ố");
        text = Regex.Replace(text, @"\u251C\u0192\u0393\u00F2\u00E6\u0393\u00F2\u00F9", "ẻ");
        text = Regex.Replace(text, @"\u251C\u0192\u0393\u00F2\u00F9\u251C\u00F3", "ỉ");
        text = Regex.Replace(text, @"\u0393\u00F6\u00A3\252C\u00BCn", "ên");
        text = Regex.Replace(text, @"\u0393\u00F2\20A7\u00EDn", "ơn");
        text = Regex.Replace(text, @"\u251C\u0192\u0393\u00F2\u00E6\252C\2551n", "ần");
        text = Regex.Replace(text, @"\u251C\u0192\u0393\u00F2\u00E6\u0393\u00F6\u00C9", "ế");
        text = Regex.Replace(text, @"\u251C\u0192\u0393\u00F2\u00F9\u251C\u00BCc", "ọc");
        text = Regex.Replace(text, @"\u0393\u00F2\20A7\u0393\u00FB\u00E6\u251C\u0192\u0393\u00F2\u00F9\u252C\u00F3c", "ước");
        text = Regex.Replace(text, @"\u0393\u00F6\u00A3\u0393\u00F2\u00E6t", "út");
        text = Regex.Replace(text, @"\u251C\u0192\u0393\u00F2\u00E6\u0393\u00F2\u00A3", "ẽ");
        text = Regex.Replace(text, @"\u251C\u0192\u0393\u00F2\u00E6\u0393\u00F2\u00FBt", "ặt");
        text = Regex.Replace(text, @"\u251C\u0192\u0393\u00F2\u00E6\u252C\2551n", "ần");
        text = Regex.Replace(text, @"\u251C\u0192\u0393\u00F2\u00E6\u0393\u00F6\u00C9t", "ết");
        text = Regex.Replace(text, @"\u251C\u0192\u0393\u00F2\u00F9\u251C\u00BB", "ị");
        text = Regex.Replace(text, @"\u251C\u0192\u0393\u00F2\u00F9\u00FAn", "ện");
        text = Regex.Replace(text, @"\u0393\u00F6\u00C7\u00EAi\u251C\u0192\u0393\u00F2\u00F9\u00FAn", "điện");
        text = Regex.Replace(text, @"\u0393\u00F6\u00C7\u00EAi", "đi");
        text = Regex.Replace(text, @"\u0393\u00F6\u00C7\u00EA\u0393\u00F6\u00A3\u252C\2510n", "đèn");
        text = Regex.Replace(text, @"g\u1EA1ich", "gạch");
        text = Regex.Replace(text, @"th\u00F4ngng", "thông");
        text = Regex.Replace(text, @"l\u00F4ng", "lô");

        File.WriteAllText(path, text, new UTF8Encoding(false));
        Console.WriteLine("FixFinal84 executed successfully!");
    }
}
