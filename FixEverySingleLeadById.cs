using System;
using System.IO;
using System.Net;
using System.Text;
using System.Text.RegularExpressions;
using System.Web.Script.Serialization;
using System.Collections.Generic;

class FixEverySingleLeadById {
    static string CleanString(string s) {
        if (string.IsNullOrEmpty(s)) return s;
        if (!Regex.IsMatch(s, @"[^\w\s\d\.\,\:\-\/\(\)\+\@\%\&\!\?\=\*\#\$\;\'\""àáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵĐđ]")) return s.Trim();

        // Standard string replacements
        s = s.Replace("KhÃ¡ch", "Khách").Replace("Kh├ích", "Khách")
             .Replace("Messenger Remote", "Messenger Remote")
             .Replace("Dâ•žâ–‘â•žÃ­ng Tâ”œâ”‚c", "Dương Tóc").Replace("D├║ng T├║c", "Dương Tóc").Replace("D╞░╞íng T├│c", "Dương Tóc")
             .Replace("Anh Phâ•žâ–‘â•žÃ­ng", "Anh Phương").Replace("Anh Ph├░├¡ng", "Anh Phương")
             .Replace("Minh NguyÃŸâ•—Ã n", "Minh Nguyễn").Replace("Minh Nguyß╗àn", "Minh Nguyễn")
             .Replace("Hu├íng Phạm", "Hương Phạm").Replace("Hu├íng Phạ", "Hương Phạm").Replace("Hu ├íng Phạm", "Hương Phạm").Replace("Hu ├íng Phạ", "Hương Phạm")
             .Replace("Xuân Hải Đinh", "Xuân Hải Đinh").Replace("Xu├ón H├ái", "Xuân Hải Đinh")
             .Replace("Phạm Thuận", "Phạm Thuận").Replace("Phß║ím Thuß║¡n", "Phạm Thuận")
             .Replace("Hoàng Yến", "Hoàng Yến").Replace("Hoangg Yen", "Hoàng Yến")
             .Replace("Phạm Thị Ánh Ngọc", "Phạm Thị Ánh Ngọc").Replace("Phß║ím Thß╗ï", "Phạm Thị Ánh Ngọc")
             .Replace("Nhã Phương Bùi", "Nhã Phương Bùi")
             .Replace("Huyền Sky", "Huyền Sky").Replace("Huyun Sky", "Huyền Sky")
             .Replace("Nextstone Việt Nam", "Nextstone Việt Nam").Replace("Nextstone Vietnam", "Nextstone Việt Nam");

        // Character level replacements for residual unicode corruption
        s = s.Replace("Â", "").Replace("Ã", "á").Replace("â•žâ–‘â•žÃ­ng", "ương").Replace("Tâ”œâ”‚c", "Tóc")
             .Replace("vÃŸâ•‘Ã‘n", "vấn").Replace("vÃŸâ•‘Â¡n", "vận").Replace("chuyÃŸâ•—Ã¢n", "chuyển").Replace("kiÃŸâ•—Ã§n", "kiện")
             .Replace("tÃŸâ•—Â½", "từ").Replace("châ”œÃ¡o", "chào").Replace("nhÃŸâ•‘Â»n", "nhắn");

        return Regex.Replace(s, @"[^\w\s\d\.\,\:\-\/\(\)\+\@\%\&\!\?\=\*\#\$\;\'\""àáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵĐđ]", "").Trim();
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
            string id = Convert.ToString(lead["id"]);
            string name = Convert.ToString(lead["name"]);
            string note = Convert.ToString(lead["note"]);

            if (id == "lead-fb-37d916ff") {
                name = "Khách Messenger Remote";
                note = "[Tin nhắn từ Fanpage]: Can I ship 200kg of wood to Saigon?";
            } else if (id == "lead-excel-6-494") {
                name = "Dương Tóc";
                note = "Nhập sáp vuốt tóc. Đang làm tự công bố ở VN : dự kiến 1,5 tháng nữa mới xong. Sau khi xong mới có thể nhập hàng";
            } else if (id == "lead-1783756473912") {
                name = "Anh Phương";
                note = "Tư vấn vận chuyển linh kiện";
            } else if (id == "lead-fb-2790d56a") {
                name = "Minh Nguyễn";
                note = "[Tin nhắn từ Fanpage]: Xin chào shop";
            } else {
                name = CleanString(name);
                note = CleanString(note);
            }

            lead["name"] = name;
            lead["note"] = note;
            if (lead.ContainsKey("failReason")) lead["failReason"] = CleanString(Convert.ToString(lead["failReason"]));

            cleanLeads.Add(lead);
        }

        db["leads"] = cleanLeads;
        db["dbVersion"] = "21.41";

        string cleanJson = serializer.Serialize(db);
        File.WriteAllText(@"d:\antigravity\db.json", cleanJson, new UTF8Encoding(false));
        File.WriteAllText(@"d:\antigravity\minhhai_crm_deploy\db.json", cleanJson, new UTF8Encoding(false));

        Console.WriteLine("Fixed every single lead by ID!");

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
                Console.WriteLine("Fix by ID API POST Response: " + respText);
            }
        } catch (Exception ex) {
            Console.WriteLine("Error posting state to API: " + ex.Message);
        }
    }
}
