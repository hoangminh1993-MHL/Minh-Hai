using System;
using System.IO;
using System.Net;
using System.Text;
using System.Text.RegularExpressions;
using System.Web.Script.Serialization;
using System.Collections.Generic;

class FixAllLeadsMojibake {
    static string CleanText(string s) {
        if (string.IsNullOrEmpty(s)) return s;

        // Specific Lead Name Fixes
        s = Regex.Replace(s, @"Kh.*ích Messenger Remote", "Khách Messenger Remote");
        s = Regex.Replace(s, @"Kh.*ích Messenger 999", "Khách Messenger 999");
        s = Regex.Replace(s, @"Kh.*ích Messenger", "Khách Messenger");
        s = Regex.Replace(s, @"D.*ng T.*c", "Dương Tóc", RegexOptions.IgnoreCase);
        s = Regex.Replace(s, @"D.*ng t.*c", "Dương Tóc");
        s = Regex.Replace(s, @"Anh Ph.*ng", "Anh Phương");
        s = Regex.Replace(s, @"Nguy.*n L.*nh", "Nguyễn Lánh");
        s = Regex.Replace(s, @"Minh Nguy.*n", "Minh Nguyễn");
        s = Regex.Replace(s, @"Ph.*m Thu.*n", "Phạm Thuận");
        s = Regex.Replace(s, @"Ph.*m Th.* Anh Ng.*c", "Phạm Thị Anh Ngọc");
        s = Regex.Replace(s, @"Hu.*ng Ph.*m", "Hương Phạm");
        s = Regex.Replace(s, @"Xu.*n H.*i.*inh", "Xuân Hải Đinh");
        s = Regex.Replace(s, @".*inh Ph.*c An", "Đinh Phúc An");
        s = Regex.Replace(s, @"Ho.*ng Th.*y Du.*ng", "Hoàng Thùy Dương");
        s = Regex.Replace(s, @"Mai H.*ng VPP", "Mai Hồng VPP");
        s = Regex.Replace(s, @"Ho.*ng Ph.*t Koffmann", "Hoàng Phát Koffmann");
        s = Regex.Replace(s, @"V.*ng bi Ph.* Qu.*", "Vòng bi Phú Quý");
        s = Regex.Replace(s, @"Nha Phuong B.*i", "Nha Phuong Bùi");
        s = Regex.Replace(s, @"Qu.*c Kh.*nh", "Quốc Khánh");
        s = Regex.Replace(s, @"Minh T.*m", "Minh Tâm");
        s = Regex.Replace(s, @"B.*o Ng.*c Rice", "Bảo Ngọc Rice");
        s = Regex.Replace(s, @"S.*n Quang L.*m", "Sơn Quang Lâm");
        s = Regex.Replace(s, @"Ho.*ng C.*ng Biz", "Hoàng Cường Biz");
        s = Regex.Replace(s, @"V.* Ng.*c Huy.*n", "Vũ Ngọc Huyền");
        s = Regex.Replace(s, @"Tr.*n Hi.*u", "Trần Hiếu");
        s = Regex.Replace(s, @"H.*ng V.*", "Hương Vũ");
        s = Regex.Replace(s, @"Ruby Nguy.*n", "Ruby Nguyễn");
        s = Regex.Replace(s, @"D.*m Qu.*nh", "Điểm Quỳnh");

        // Character level cleanups
        s = s.Replace("─É", "Đ").Replace("─æ", "đ")
             .Replace("├║", "ú").Replace("├í", "á").Replace("├¡", "í").Replace("├┤", "ô")
             .Replace("├¬", "ê").Replace("├á", "à").Replace("├¿", "è").Replace("├╣", "ù").Replace("├╜", "ý")
             .Replace("ß╗a", "ẩ").Replace("ß╗å", "ổ").Replace("ß╗à", "ề").Replace("ß╗ï", "ị")
             .Replace("ß╗ì", "ỉ").Replace("ß╗Å", "ỏ").Replace("ß╗ü", "ụ").Replace("ß╗ñ", "ủ")
             .Replace("ß╗ª", "ữ").Replace("ß╗¿", "ừ").Replace("ß╗«", "ứ").Replace("ß╗░", "ử").Replace("ß╗▓", "ữ")
             .Replace("ß║ím", "ạm").Replace("ß║í", "ạ");

        return s.Trim();
    }

    static void Main() {
        Console.OutputEncoding = Encoding.UTF8;
        JavaScriptSerializer serializer = new JavaScriptSerializer();
        serializer.MaxJsonLength = int.MaxValue;

        string gitDbText = File.ReadAllText(@"d:\antigravity\git_db.json", Encoding.UTF8);
        Dictionary<string, object> gitDb = serializer.Deserialize<Dictionary<string, object>>(gitDbText);

        System.Collections.ArrayList rawLeads = (System.Collections.ArrayList)gitDb["leads"];
        List<Dictionary<string, object>> cleanLeads = new List<Dictionary<string, object>>();

        foreach (object item in rawLeads) {
            Dictionary<string, object> lead = (Dictionary<string, object>)item;
            if (lead.ContainsKey("name")) lead["name"] = CleanText(Convert.ToString(lead["name"]));
            if (lead.ContainsKey("note")) lead["note"] = CleanText(Convert.ToString(lead["note"]));
            if (lead.ContainsKey("failReason")) lead["failReason"] = CleanText(Convert.ToString(lead["failReason"]));

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

        Console.WriteLine("Cleaned all 59 leads!");

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
