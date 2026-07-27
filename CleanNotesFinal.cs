using System;
using System.IO;
using System.Net;
using System.Text;
using System.Text.RegularExpressions;
using System.Web.Script.Serialization;
using System.Collections.Generic;

class CleanNotesFinal {
    static string FixNote(string s) {
        if (string.IsNullOrEmpty(s)) return s;

        s = s.Replace("Nh├║ô", "Nhập").Replace("vua├║æ", "vừa").Replace("a├ö£t", "đạt").Replace("t├║ùô", "tuần").Replace("c├║Pt", "cước")
             .Replace("b├ö£o", "báo").Replace("g├ö£", "giá").Replace("ki┼║║", "ký").Replace("g├║║", "gửi").Replace("nh├║║", "nhận")
             .Replace("┬╜", " ").Replace("├║æ", "á").Replace("├ö£", "á").Replace("├║ù", "uố").Replace("├║Pt", "ước")
             .Replace("├öÇ", "Đ").Replace("├Öt", "ót").Replace("├¡i", "ái").Replace("├║", "u").Replace("├ö", "o")
             .Replace("║", "á").Replace("├", "").Replace("│", "á").Replace("┤", "ó").Replace("¬", "ê")
             .Replace("áá", "á").Replace("  ", " ");

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
            if (lead.ContainsKey("note")) lead["note"] = FixNote(Convert.ToString(lead["note"]));
            cleanLeads.Add(lead);
        }

        db["leads"] = cleanLeads;
        db["dbVersion"] = "21.34";

        string cleanJson = serializer.Serialize(db);
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
                Console.WriteLine("Clean Notes API POST Response: " + respText);
            }
        } catch (Exception ex) {
            Console.WriteLine("Error posting state to API: " + ex.Message);
        }
    }
}
