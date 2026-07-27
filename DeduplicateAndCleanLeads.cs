using System;
using System.IO;
using System.Net;
using System.Text;
using System.Text.RegularExpressions;
using System.Web.Script.Serialization;
using System.Collections.Generic;

class DeduplicateAndCleanLeads {
    static string CleanText(string s) {
        if (string.IsNullOrEmpty(s)) return s;
        if (!Regex.IsMatch(s, @"[├│├í├¡├┤├¬├á├¿├╣├╜ß╗ß║\u0393\u252C\u2551\u2500\uFFFD╬ô]")) return s.Trim();

        s = s.Replace("Kh├ích Messenger Remote", "Khách Messenger Remote")
             .Replace("Kh├ích Messenger 999", "Khách Messenger 999")
             .Replace("Kh├ích Messenger", "Khách Messenger")
             .Replace("D├║ng T├║c", "Dương Tóc").Replace("D├║ng t├║c", "Dương Tóc").Replace("D╞░╞íng T├│c", "Dương Tóc").Replace("Dương tóc", "Dương Tóc")
             .Replace("Anh Ph╞░╞íng", "Anh Phương")
             .Replace("Minh Nguyß╗àn", "Minh Nguyễn")
             .Replace("Hu╞░╞íng Phß║ím", "Hương Phạm").Replace("Hu╞░╞íng Phạ", "Hương Phạm")
             .Replace("Xu├ón H├ái ─É├¡nh", "Xuân Hải Đinh").Replace("Xu├ón Hß║úi Đinh", "Xuân Hải Đinh").Replace("Xuân Hải Dinh", "Xuân Hải Đinh")
             .Replace("─É├¡nh Ph├║c An", "Đinh Phúc An").Replace("Dinh Phúc An", "Đinh Phúc An")
             .Replace("Ho├óng Th├╣y Du╞░╞íng", "Hoàng Thùy Dương")
             .Replace("Phß║ím Thuß║¡n", "Phạm Thuận").Replace("Phạm Thuần", "Phạm Thuận")
             .Replace("Mai Hß╗Öng VPP", "Mai Hồng VPP")
             .Replace("Ho├óng Ph├ít Koffmann", "Hoàng Phát Koffmann")
             .Replace("V├▓ng bi Ph├║ Qu├╜", "Vòng bi Phú Quý")
             .Replace("Nha Phuong B├╣i", "Nhã Phương Bùi")
             .Replace("Quß╗æc Kh├ính", "Quốc Khánh")
             .Replace("Minh T├ím", "Minh Tâm")
             .Replace("Bß║úo Ngß╗ìc Rice", "Bảo Ngọc Rice")
             .Replace("S╞í n Quang L├ím", "Sơn Quang Lâm")
             .Replace("Phß║ím Thß╗ï Anh Ngß╗ìc", "Phạm Thị Ánh Ngọc").Replace("Phạm Thị |ùnh Ngic", "Phạm Thị Ánh Ngọc")
             .Replace("Ho├óng C╞░╞íng Biz", "Hoàng Cường Biz")
             .Replace("V┼⌐ Ngß╗ìc Huyß╗ün", "Vũ Ngọc Huyền")
             .Replace("Trß║ºn Hiß║┐u", "Trần Hiếu")
             .Replace("H╞░╞íng V┼⌐", "Hương Vũ")
             .Replace("Ruby Nguyß╗ün", "Ruby Nguyễn")
             .Replace("Diß╗åm Quß╗│nh", "Điểm Quỳnh").Replace("Điß╗âm Quß╗│nh", "Điểm Quỳnh")
             .Replace("─É", "Đ").Replace("─æ", "đ");

        return s.Trim();
    }

    static void Main() {
        Console.OutputEncoding = Encoding.UTF8;
        JavaScriptSerializer serializer = new JavaScriptSerializer();
        serializer.MaxJsonLength = int.MaxValue;

        string text9f = File.ReadAllText(@"d:\antigravity\clean_9f81073.json", Encoding.UTF8);
        Dictionary<string, object> db9f = serializer.Deserialize<Dictionary<string, object>>(text9f);
        System.Collections.ArrayList rawLeads = (System.Collections.ArrayList)db9f["leads"];

        Dictionary<string, Dictionary<string, object>> cleanMap = new Dictionary<string, Dictionary<string, object>>();

        foreach (object item in rawLeads) {
            Dictionary<string, object> lead = (Dictionary<string, object>)item;
            string name = CleanText(Convert.ToString(lead["name"]));
            string phone = Convert.ToString(lead["phone"]).Trim();
            string note = CleanText(Convert.ToString(lead["note"]));
            string stage = Convert.ToString(lead["stage"]);

            if (stage == "quote") stage = "quotation";
            if (stage == "consulting") stage = "explore_info";
            if (stage == "khach_moi" || stage == "Khách mới" || string.IsNullOrEmpty(stage)) stage = "receive_info";

            lead["name"] = name;
            lead["phone"] = phone;
            lead["note"] = note;
            lead["stage"] = stage;

            // Unique key by normalized name + phone (or name if phone is empty)
            string key = (name + "_" + phone).ToLower().Trim();

            if (!cleanMap.ContainsKey(key)) {
                cleanMap[key] = lead;
            } else {
                // If existing record has Mojibake note and current has clean note, replace!
                string existingNote = Convert.ToString(cleanMap[key]["note"]);
                if (Regex.IsMatch(existingNote, @"[├│├í├¡├┤├¬├á├¿├╣├╜ß╗ß║\u0393\u252C\u2551\u2500\uFFFD╬ô]") && !Regex.IsMatch(note, @"[├│├í├¡├┤├¬├á├¿├╣├╜ß╗ß║\u0393\u252C\u2551\u2500\uFFFD╬ô]")) {
                    cleanMap[key] = lead;
                }
            }
        }

        List<Dictionary<string, object>> uniqueLeads = new List<Dictionary<string, object>>(cleanMap.Values);
        Console.WriteLine("Deduplicated clean leads count: " + uniqueLeads.Count);

        db9f["leads"] = uniqueLeads;
        db9f["dbVersion"] = "21.35";

        string cleanJson = serializer.Serialize(db9f);
        File.WriteAllText(@"d:\antigravity\db.json", cleanJson, new UTF8Encoding(false));
        File.WriteAllText(@"d:\antigravity\minhhai_crm_deploy\db.json", cleanJson, new UTF8Encoding(false));

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
                Console.WriteLine("Deduplicated API POST Response: " + respText);
            }
        } catch (Exception ex) {
            Console.WriteLine("Error posting state to API: " + ex.Message);
        }
    }
}
