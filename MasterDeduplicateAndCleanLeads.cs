using System;
using System.IO;
using System.Net;
using System.Text;
using System.Text.RegularExpressions;
using System.Web.Script.Serialization;
using System.Collections.Generic;

class MasterDeduplicateAndCleanLeads {
    static string FixText(string text) {
        if (string.IsNullOrEmpty(text)) return "";
        string s = text.Trim();

        // 1. Direct Mojibake String Map
        s = s.Replace("KhÃ¡ch", "Khách").Replace("Kh├ích", "Khách")
             .Replace("Dâ•žâ–‘â•žÃ­ng Tâ”œâ”‚c", "Dương Tóc").Replace("D├║ng T├║c", "Dương Tóc").Replace("D╞░╞íng T├│c", "Dương Tóc").Replace("Dương tóc", "Dương Tóc")
             .Replace("Anh Phâ•žâ–‘â•žÃ­ng", "Anh Phương").Replace("Anh Ph├░├¡ng", "Anh Phương").Replace("Anh hương", "Anh Phương")
             .Replace("Minh NguyÃŸâ•—Ã n", "Minh Nguyễn").Replace("Minh Nguyß╗àn", "Minh Nguyễn")
             .Replace("Hu├íng Phß║ím", "Hương Phạm").Replace("Hu ├íng Phạ", "Hương Phạm").Replace("Huơng Phạm", "Hương Phạm").Replace("Hu├íng Phạm", "Hương Phạm")
             .Replace("Xuón Hßúi Éinh", "Xuân Hải Đinh").Replace("Xu├ón H├ái ─É├¡nh", "Xuân Hải Đinh").Replace("Xu├ón Hß║úi Đinh", "Xuân Hải Đinh")
             .Replace("Phß║ím Thuß║¡n", "Phạm Thuận").Replace("Phạm Thuần", "Phạm Thuận")
             .Replace("Hoangg Yen", "Hoàng Yến").Replace("Hong Yến", "Hoàng Yến")
             .Replace("Phß║ím Thß╗ï Ánh Ngọc", "Phạm Thị Ánh Ngọc")
             .Replace("Nha Phuong BÃ¹i", "Nhã Phương Bùi").Replace("Nha Phuong Bùi", "Nhã Phương Bùi")
             .Replace("Huyun Sky", "Huyền Sky")
             .Replace("Nextstone Vietnam", "Nextstone Việt Nam")
             .Replace("HoÃ ng PhÃ¡t Koffmann", "Hoàng Phát Koffmann").Replace("Ho├óng Ph├ít Koffmann", "Hoàng Phát Koffmann")
             .Replace("V├▓ng bi Ph├║ Qu├╜", "Vòng bi Phú Quý")
             .Replace("Quß╗æc Kh├ính", "Quốc Khánh")
             .Replace("Minh T├ím", "Minh Tâm")
             .Replace("Bß║úo Ngß╗ìc Rice", "Bảo Ngọc Rice")
             .Replace("S╞í n Quang L├ím", "Sơn Quang Lâm")
             .Replace("Ho├óng C╞░╞íng Biz", "Hoàng Cường Biz")
             .Replace("V┼⌐ Ngß╗ìc Huyß╗ün", "Vũ Ngọc Huyền")
             .Replace("Trß║ºn Hiß║┐u", "Trần Hiếu")
             .Replace("H╞░╞íng V┼⌐", "Hương Vũ")
             .Replace("Ruby Nguyß╗ün", "Ruby Nguyễn")
             .Replace("Diß╗åm Quß╗│nh", "Điểm Quỳnh").Replace("Điß╗âm Quß╗│nh", "Điểm Quỳnh")
             .Replace("─É├¡nh Ph├║c An", "Đinh Phúc An").Replace("Éinh Phc An", "Đinh Phúc An")
             .Replace("Ho├óng Th├╣y Du╞░╞íng", "Hoàng Thùy Dương")
             .Replace("Mai Hß╗Öng VPP", "Mai Hồng VPP").Replace("Mai HŸÕng VPP", "Mai Hồng VPP");

        // 2. Specific Note Cleanups
        if (s.Contains("200kg of wood")) s = "[Tin nhắn từ Fanpage]: Can I ship 200kg of wood to Saigon?";
        if (s.Contains("vuốt tóc") || s.Contains("công bố")) s = "Nhập sáp vuốt tóc. Đang làm tự công bố ở VN : dự kiến 1,5 tháng nữa mới xong. Sau khi xong mới có thể nhập hàng";
        if (s.Contains("ruy băng") || s.Contains("decor")) s = "Cần tìm nguồn hàng ruy băng decor. 15/6: Lv với xưởng ruy băng và lưới Kh gửi";
        if (s.Contains("TMĐT") || s.Contains("máy cán")) s = "Mua hộ hàng trên TMĐT. Mua máy cán đã báo cước. Đợi khách chọn phân loại báo giá";
        if (s.Contains("app cty") || s.Contains("hướng dẫn")) s = "KH yêu cầu : Hướng dẫn tạo tài khoản app công ty";
        if (s.Contains("hỗ trợ") || s.Contains("Xin SĐT")) s = "Đang xin số điện thoại hỗ trợ. Đã gửi báo giá.";
        if (s.Contains("xách tay cf") || s.Contains("bột đậu xanh")) s = "Hỏi giá xách tay cf, bột đậu xanh, hạt điều từ VN sang TQ - Báo giá : 120-150k/1kg tùy số lượng";
        if (s.Contains("nội thất gỗ")) s = "Vc hàng nội thất gỗ : dưới 200kg. 2/7 : Đã báo giá 16k về tận nhà ở HP với hàng lô";
        if (s.Contains("Tiểu ngạch") || s.Contains("giày")) s = "Nhập giày Tiểu ngạch và CN 3/7 : Đã báo giá CN. Hẹn KH sang tuần làm việc";
        if (s.Contains("gạch") || s.Contains("thông tin NCC")) s = "CN : đợi KH xin thông tin NCC về lô hàng gạch 10/7 : KH đang đợi NCC cập nhật ttin sp";
        if (s.Contains("Xin chào shop")) s = "[Tin nhắn từ Fanpage]: Xin chào shop";

        // 3. Generic character cleanup for residual non-Vietnamese encoding artifacts
        s = s.Replace("Â", "").Replace("Ã", "á").Replace("â•žâ–‘â•žÃ­ng", "ương").Replace("Tâ”œâ”‚c", "Tóc")
             .Replace("vÃŸâ•‘Ã‘n", "vấn").Replace("vÃŸâ•‘Â¡n", "vận").Replace("chuyÃŸâ•—Ã¢n", "chuyển").Replace("kiÃŸâ•—Ã§n", "kiện")
             .Replace("tÃŸâ•—Â½", "từ").Replace("châ”œÃ¡o", "chào").Replace("nhÃŸâ•‘Â»n", "nhắn");

        return Regex.Replace(s, @"\s+", " ").Trim();
    }

    static void Main() {
        Console.OutputEncoding = Encoding.UTF8;
        JavaScriptSerializer serializer = new JavaScriptSerializer();
        serializer.MaxJsonLength = int.MaxValue;

        string dbText = File.ReadAllText(@"d:\antigravity\db.json", Encoding.UTF8);
        Dictionary<string, object> db = serializer.Deserialize<Dictionary<string, object>>(dbText);

        System.Collections.ArrayList rawLeads = (System.Collections.ArrayList)db["leads"];
        
        Dictionary<string, Dictionary<string, object>> uniqueLeads = new Dictionary<string, Dictionary<string, object>>();

        int dummyCount = 0;
        int duplicateCount = 0;

        foreach (object item in rawLeads) {
            Dictionary<string, object> lead = (Dictionary<string, object>)item;
            string id = Convert.ToString(lead["id"]).Trim();
            string name = FixText(Convert.ToString(lead["name"]));
            string phone = Convert.ToString(lead["phone"]).Trim();
            string note = FixText(Convert.ToString(lead["note"]));

            // 1. Filter out fake / dummy cards ("Loại bỏ thẻ khách ảo")
            if (name.Contains("999") || note.Contains("Locally sent message to port 3000") || name.ToLower().Contains("test") || note.ToLower().Contains("dummy")) {
                dummyCount++;
                Console.WriteLine("Removed dummy lead: " + id + " - " + name);
                continue;
            }

            lead["name"] = name;
            lead["note"] = note;

            // 2. Deduplicate cards by customer identity ("Loại bỏ thẻ trùng lặp")
            string key = "";
            if (!string.IsNullOrEmpty(phone) && phone.Length >= 8) {
                key = "phone:" + phone;
            } else {
                key = "name:" + name.ToLower().Replace(" ", "");
            }

            if (uniqueLeads.ContainsKey(key)) {
                duplicateCount++;
                Console.WriteLine("Removed duplicate lead: " + id + " - " + name + " (Duplicate of " + uniqueLeads[key]["id"] + ")");
                // Keep the record with longer/more complete note
                string existingNote = Convert.ToString(uniqueLeads[key]["note"]);
                if (note.Length > existingNote.Length) {
                    uniqueLeads[key] = lead;
                }
            } else {
                uniqueLeads[key] = lead;
            }
        }

        List<Dictionary<string, object>> finalLeads = new List<Dictionary<string, object>>(uniqueLeads.Values);
        db["leads"] = finalLeads;
        db["dbVersion"] = "21.43";

        string cleanJson = serializer.Serialize(db);
        File.WriteAllText(@"d:\antigravity\db.json", cleanJson, new UTF8Encoding(false));
        File.WriteAllText(@"d:\antigravity\minhhai_crm_deploy\db.json", cleanJson, new UTF8Encoding(false));

        Console.WriteLine("========================================");
        Console.WriteLine("Dummy leads removed: " + dummyCount);
        Console.WriteLine("Duplicate leads removed: " + duplicateCount);
        Console.WriteLine("Total clean unique leads remaining: " + finalLeads.Count);
        Console.WriteLine("========================================");

        // POST clean state directly to live API endpoint https://minh-hai.onrender.com/api/state
        try {
            ServicePointManager.SecurityProtocol = (SecurityProtocolType)3072;
            HttpWebRequest req = (HttpWebRequest)WebRequest.Create("https://minh-hai.onrender.com/api/state");
            req.Method = "POST";
            req.ContentType = "application/json; charset=utf-8";

            byte[] jsonBytes = Encoding.UTF8.GetBytes(cleanJson);
            req.ContentLength = jsonBytes.Length;

            using (Stream reqStream = req.GetRequestStream()) {
                reqStream.Write(jsonBytes, 0, jsonBytes.Length);
            }

            using (HttpWebResponse resp = (HttpWebResponse)req.GetResponse())
            using (StreamReader sr = new StreamReader(resp.GetResponseStream())) {
                string respText = respText = sr.ReadToEnd();
                Console.WriteLine("Master Clean API POST Response: " + respText);
            }
        } catch (Exception ex) {
            Console.WriteLine("Error posting state to API: " + ex.Message);
        }
    }
}
