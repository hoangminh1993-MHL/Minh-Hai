using System;
using System.IO;
using System.Text;
using System.Text.RegularExpressions;

class InspectAndCleanAllLeads {
    static void Main() {
        string dbPath = @"d:\antigravity\db.json";
        string dbText = File.ReadAllText(dbPath, Encoding.UTF8);

        // Fix all known Mojibake sequences in db.json
        dbText = dbText.Replace("Minh Nguy╗àn", "Minh Nguyễn")
                       .Replace("Minh Nguyß╗àn", "Minh Nguyễn")
                       .Replace("Mai H╗ng VPP", "Mai Hồng VPP")
                       .Replace("Mai Hß╗Öng VPP", "Mai Hồng VPP")
                       .Replace("C. H┤ng VPP", "C. Hường VPP")
                       .Replace("[Tin nh»n t╗½ Fanpage]", "[Tin nhắn từ Fanpage]")
                       .Replace("[Tin nh»n t½ Fanpage]", "[Tin nhắn từ Fanpage]")
                       .Replace("chat ḷi sª lng th aó l¼n aịn", "chat lại số lượng hàng đặt lần này")
                       .Replace("Sang tun T2", "Sang tuần T2")
                       .Replace("Anh Ph░▒ng", "Anh Phương")
                       .Replace("T░ vÑn vịn chuy╗ân linh ki╗çn", "Tư vấn vận chuyển linh kiện")
                       .Replace("─i╗âm Qu╗│nh", "Điểm Quỳnh")
                       .Replace("░ vÑn vịn chuy╗ân hng m½u", "Tư vấn vận chuyển hàng mẫu")
                       .Replace("─Éính Phúc An", "Đinh Phúc An")
                       .Replace("Cn t vấtn nhậnp hng", "Cần tư vấn nhập hàng");

        // Clean CP437 / Mojibake unicode characters
        dbText = Regex.Replace(dbText, @"[\u2500-\u257F\u00A0-\u00BF\u0370-\u03FF]", m => {
            string val = m.Value;
            if (val == "╗" || val == "à") return "ầ";
            if (val == "»") return "ắn";
            if (val == "½") return "ừ";
            if (val == "░" || val == "▒") return "";
            if (val == "─") return "Đ";
            if (val == "┤") return "ườ";
            return "";
        });

        File.WriteAllText(dbPath, dbText, new UTF8Encoding(false));
        Console.WriteLine("InspectAndCleanAllLeads executed successfully!");
    }
}
