using System;
using System.IO;
using System.Text;
using System.Text.RegularExpressions;

class FixRemainingLeads69 {
    static void Main() {
        string path = @"d:\antigravity\db.json";
        string[] lines = File.ReadAllLines(path, Encoding.UTF8);

        lines[1746] = "                                        \"note\":  \"Nhu cầu KG hàng lẻ\"";
        lines[2399] = "                      \"note\":  \"[Mã KH: MH409 - Vũ Huyền] KH cũ trước đó giờ mới đặt lại : 4050 , 30k/1kg, 2% phí dv\",";
        lines[2477] = "                                        \"note\":  \"[Mã KH: MH409 - Vũ Huyền] KH cũ trước đó giờ mới đặt lại : 4050 , 30k/1kg, 2% phí dv\"";

        for (int i = 0; i < lines.Length; i++) {
            lines[i] = Regex.Replace(lines[i], @"Nhu cß║ºu", "Nhu cầu");
            lines[i] = Regex.Replace(lines[i], @"hng l\?", "hàng lẻ");
            lines[i] = Regex.Replace(lines[i], @"\[M├ KH: MH409 - V┼⌐ Huy\?un\] KH c┼⌐ tr╞░ß╗¢c d├│ giß╗¥ m\?i d\?t l\?i : 4050 , 30k/1kg, 2% ph├¡ dv", "[Mã KH: MH409 - Vũ Huyền] KH cũ trước đó giờ mới đặt lại : 4050 , 30k/1kg, 2% phí dv");
            lines[i] = Regex.Replace(lines[i], @"MH409 - V┼⌐ Huy\?un", "MH409 - Vũ Huyền");
            lines[i] = Regex.Replace(lines[i], @"KH c┼⌐ tr╞░ß╗¢c d├│ giß╗¥ m\?i d\?t l\?i", "KH cũ trước đó giờ mới đặt lại");
            lines[i] = Regex.Replace(lines[i], @"ph├¡ dv", "phí dv");
        }

        File.WriteAllLines(path, lines, new UTF8Encoding(false));
        Console.WriteLine("FixRemainingLeads69 executed successfully!");
    }
}
