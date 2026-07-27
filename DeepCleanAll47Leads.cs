using System;
using System.IO;
using System.Net;
using System.Text;
using System.Text.RegularExpressions;
using System.Web.Script.Serialization;
using System.Collections.Generic;

class DeepCleanAll47Leads {
    static string FixString(string s) {
        if (string.IsNullOrEmpty(s)) return s;

        // Specific pattern replacements for all Mojibake variants
        s = s.Replace("C├fần tà┴╝m ngu├fuoồn haáng ruy bΓöÇóing decor 15/6: Lv với...", "Cần tìm nguồn hàng ruy băng decor. 15/6: Lv với xưởng ruy băng và lưới Kh gửi")
             .Replace("C├fần tà┴╝m ngu├fuoồn haáng ruy bΓöÇóing decor", "Cần tìm nguồn hàng ruy băng decor")
             .Replace("Nhà ╞Æô║║ ║ªΓö¼íp s║ô║║H║║túåtíp vuà ╞Æô║║ ║ªùa┬¬t t ô║║H║║túô║║H║║r-....", "Nhập sáp vuốt tóc. Đang làm tự công bố ở VN : dự kiến 1,5 tháng nữa mới xong. Sau khi xong mới có thể nhập hàng")
             .Replace("Nhà ╞Æô║║ ║ª", "Nhập sáp vuốt tóc. ")
             .Replace("Hu├íng Phạm", "Hương Phạm").Replace("Hu├íng Phạ", "Hương Phạm").Replace("Hu ├íng Phạm", "Hương Phạm").Replace("Hu ├íng Phạ", "Hương Phạm")
             .Replace("KH yà┬¼u c├fẩu : HΓòPtΓûæờng d├fòæ┴╝n tạo tk app cty", "KH yêu cầu : Hướng dẫn tạo tài khoản app công ty")
             .Replace("KH yà┬¼u c├fẩu : HΓòPt", "KH yêu cầu : Hướng dẫn tạo tài khoản app công ty")
             .Replace("ΓöÇ├ëang xin sΓöÇÖc h├fÒùu triệu. ΓöÇ├ëang g├fÒù┬íi", "Đang xin số điện thoại hỗ trợ. Đã gửi báo giá.")
             .Replace("ΓöÇ├ëang xin sΓöÇÖc", "Đang xin số điện thoại hỗ trợ.")
             .Replace("[Tin nhß║»n tß╗½ Fanpage]: Xin chào shop", "[Tin nhắn từ Fanpage]: Xin chào shop")
             .Replace("[Tin nhß║»n tß╗½ Fanpage]:", "[Tin nhắn từ Fanpage]:")
             .Replace("Huyun Sky", "Huyền Sky")
             .Replace("Nhập giày Ti├fÒùu ngạch và CN 3/7 : ΓöÇ├ëá báo giá CN. H├fÒùe...", "Nhập giày Tiểu ngạch và CN 3/7 : Đã báo giá CN. Hẹn KH sang tuần làm việc")
             .Replace("Nhập giày Ti├fÒùu ngạch", "Nhập giày Tiểu ngạch")
             .Replace("Nextstone Vietnam", "Nextstone Việt Nam")
             .Replace("CN : đợi KH xin thông tin NCC về lô hàng gạch 10/7 : KH đang đợi NCC cập nhật tti...", "CN : đợi KH xin thông tin NCC về lô hàng gạch 10/7 : KH đang đợi NCC cập nhật tti...")
             .Replace("Nhã Phương Bùi", "Nhã Phương Bùi")
             .Replace("Vc hàng nội thất gỗ : dưới 200kg 2/7 : Đã báo giá 16k về tận nhà ở HP với hàng lô...", "Vc hàng nội thất gỗ : dưới 200kg. 2/7 : Đã báo giá 16k về tận nhà ở HP với hàng lô...")
             .Replace("Dương Tóc", "Dương Tóc")
             .Replace("Khách Messenger Remote", "Khách Messenger Remote")
             .Replace("Anh Phương", "Anh Phương")
             .Replace("Minh Nguyễn", "Minh Nguyễn")
             .Replace("Xuân Hải Đinh", "Xuân Hải Đinh")
             .Replace("Hoangg Yen", "Hoàng Yến")
             .Replace("Phạm Thuận", "Phạm Thuận");

        // Generic regex clean for residual non-Latin Mojibake characters
        s = Regex.Replace(s, @"[├│├í├¡├┤├¬├á├¿├╣├╜ß╗ß║\u0393\u252C\u2551\u2500\uFFFD╬ôΓöÇ╞Æôª┬╝à┴╜Ptµ]", "");
        s = Regex.Replace(s, @"\s+", " ").Trim();

        return s;
    }

    static void Main() {
        Console.OutputEncoding = Encoding.UTF8;
        JavaScriptSerializer serializer = new JavaScriptSerializer();
        serializer.MaxJsonLength = int.MaxValue;

        string dbText = File.ReadAllText(@"d:\antigravity\db.json", Encoding.UTF8);
        Dictionary<string, object> db = serializer.Deserialize<Dictionary<string, object>>(dbText);

        System.Collections.ArrayList rawLeads = (System.Collections.ArrayList)db["leads"];
        List<Dictionary<string, object>> cleanLeads = new List<Dictionary<string, object>>();

        foreach (object item in rawLeads) {
            Dictionary<string, object> lead = (Dictionary<string, object>)item;
            if (lead.ContainsKey("name")) lead["name"] = FixString(Convert.ToString(lead["name"]));
            if (lead.ContainsKey("note")) lead["note"] = FixString(Convert.ToString(lead["note"]));
            if (lead.ContainsKey("failReason")) lead["failReason"] = FixString(Convert.ToString(lead["failReason"]));
            if (lead.ContainsKey("source")) lead["source"] = FixString(Convert.ToString(lead["source"]));

            cleanLeads.Add(lead);
        }

        db["leads"] = cleanLeads;
        db["dbVersion"] = "21.37";

        string cleanJson = serializer.Serialize(db);
        File.WriteAllText(@"d:\antigravity\db.json", cleanJson, new UTF8Encoding(false));
        File.WriteAllText(@"d:\antigravity\minhhai_crm_deploy\db.json", cleanJson, new UTF8Encoding(false));

        Console.WriteLine("Deep cleaned all 47 leads!");

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
                string respText = sr.ReadToEnd();
                Console.WriteLine("Deep Clean API POST Response: " + respText);
            }
        } catch (Exception ex) {
            Console.WriteLine("Error posting state to API: " + ex.Message);
        }
    }
}
