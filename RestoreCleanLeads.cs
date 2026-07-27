using System;
using System.IO;
using System.Net;
using System.Text;
using System.Text.RegularExpressions;
using System.Web.Script.Serialization;
using System.Collections.Generic;

class RestoreCleanLeads {
    static string CleanString(string s) {
        if (string.IsNullOrEmpty(s)) return s;
        s = s.Replace("Kh├ích Messenger Remote", "Khách Messenger Remote")
             .Replace("Kh├ích Messenger 999", "Khách Messenger 999")
             .Replace("Kh├ích Messenger", "Khách Messenger")
             .Replace("D├║ng T├║c", "Dương Tóc").Replace("D├║ng t├║c", "Dương Tóc").Replace("D╞░╞íng T├│c", "Dương Tóc")
             .Replace("Anh Ph╞░╞íng", "Anh Phương")
             .Replace("Minh Nguyß╗àn", "Minh Nguyễn")
             .Replace("Hu╞░╞íng Phß║ím", "Huơng Phạm").Replace("Hu╞░╞íng Phạ", "Huơng Phạm")
             .Replace("Xu├ón H├ái ─É├¡nh", "Xuân Hải Đinh").Replace("Xu├ón Hß║úi Đinh", "Xuân Hải Đinh").Replace("Xuân Hải Dinh", "Xuân Hải Đinh")
             .Replace("─É├¡nh Ph├║c An", "Đinh Phúc An").Replace("Dinh Phúc An", "Đinh Phúc An")
             .Replace("Ho├óng Th├╣y Du╞░╞íng", "Hoàng Thùy Dương")
             .Replace("Phß║ím Thuß║¡n", "Phạm Thuận").Replace("Phạm Thuần", "Phạm Thuận")
             .Replace("Mai Hß╗Öng VPP", "Mai Hồng VPP")
             .Replace("Ho├óng Ph├ít Koffmann", "Hoàng Phát Koffmann")
             .Replace("V├▓ng bi Ph├║ Qu├╜", "Vòng bi Phú Quý")
             .Replace("Nha Phuong B├╣i", "Nha Phuong Bùi")
             .Replace("Quß╗æc Kh├ính", "Quốc Khánh")
             .Replace("Minh T├ím", "Minh Tâm")
             .Replace("Bß║úo Ngß╗ìc Rice", "Bảo Ngọc Rice")
             .Replace("S╞í n Quang L├ím", "Sơn Quang Lâm")
             .Replace("Phß║ím Thß╗ï Anh Ngß╗ìc", "Phạm Thị Anh Ngọc")
             .Replace("Ho├óng C╞░╞íng Biz", "Hoàng Cường Biz")
             .Replace("V┼⌐ Ngß╗ìc Huyß╗ün", "Vũ Ngọc Huyền")
             .Replace("Trß║ºn Hiß║┐u", "Trần Hiếu")
             .Replace("H╞░╞íng V┼⌐", "Hương Vũ")
             .Replace("Ruby Nguyß╗ün", "Ruby Nguyễn")
             .Replace("Diß╗åm Quß╗│nh", "Điểm Quỳnh").Replace("Điß╗âm Quß╗│nh", "Điểm Quỳnh")
             .Replace("─É", "Đ").Replace("─æ", "đ")
             .Replace("├║", "ú").Replace("├í", "á").Replace("├¡", "í").Replace("├┤", "ô")
             .Replace("├¬", "ê").Replace("├á", "à").Replace("├¿", "è").Replace("├╣", "ù").Replace("├╜", "ý")
             .Replace("ß╗a", "ẩ").Replace("ß╗å", "ổ").Replace("ß╗à", "ề").Replace("ß╗ï", "ị")
             .Replace("ß╗ì", "ỉ").Replace("ß╗Å", "ỏ").Replace("ß╗ü", "ụ").Replace("ß╗ñ", "ủ")
             .Replace("ß╗ª", "ữ").Replace("ß╗¿", "ừ").Replace("ß╗«", "ứ").Replace("ß╗░", "ử").Replace("ß╗▓", "ữ")
             .Replace("ß║ím", "ạm").Replace("ß║í", "ạ");
        return s.Trim();
    }

    static void Main() {
        JavaScriptSerializer serializer = new JavaScriptSerializer();
        serializer.MaxJsonLength = int.MaxValue;

        string gitDbText = File.ReadAllText(@"d:\antigravity\git_db.json", Encoding.UTF8);
        Dictionary<string, object> gitDb = serializer.Deserialize<Dictionary<string, object>>(gitDbText);

        System.Collections.ArrayList rawLeads = (System.Collections.ArrayList)gitDb["leads"];
        Console.WriteLine("Raw leads count: " + rawLeads.Count);

        List<Dictionary<string, object>> cleanLeads = new List<Dictionary<string, object>>();

        foreach (object item in rawLeads) {
            Dictionary<string, object> lead = (Dictionary<string, object>)item;
            if (lead.ContainsKey("name")) lead["name"] = CleanString(Convert.ToString(lead["name"]));
            if (lead.ContainsKey("note")) lead["note"] = CleanString(Convert.ToString(lead["note"]));
            if (lead.ContainsKey("failReason")) lead["failReason"] = CleanString(Convert.ToString(lead["failReason"]));

            string st = Convert.ToString(lead["stage"]);
            if (st == "quote") lead["stage"] = "quotation";
            if (st == "consulting") lead["stage"] = "explore_info";
            if (st == "khach_moi" || st == "Khách mới" || string.IsNullOrEmpty(st)) lead["stage"] = "receive_info";

            cleanLeads.Add(lead);
        }

        gitDb["leads"] = cleanLeads;
        gitDb["dbVersion"] = "21.32";

        string cleanJson = serializer.Serialize(gitDb);
        File.WriteAllText(@"d:\antigravity\db.json", cleanJson, new UTF8Encoding(false));
        File.WriteAllText(@"d:\antigravity\minhhai_crm_deploy\db.json", cleanJson, new UTF8Encoding(false));

        Console.WriteLine("Wrote clean db.json to disk!");

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
                Console.WriteLine("API /api/state POST Response: " + respText);
            }
        } catch (Exception ex) {
            Console.WriteLine("Error posting state to API: " + ex.Message);
        }
    }
}
