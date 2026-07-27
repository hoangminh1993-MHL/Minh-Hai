using System;
using System.IO;
using System.Net;
using System.Text;
using System.Text.RegularExpressions;
using System.Web.Script.Serialization;
using System.Collections.Generic;

class FixLastResidual {
    static string FixText(string s) {
        if (string.IsNullOrEmpty(s)) return s;
        s = s.Replace("Nhà ╞Æô║║ ║ªΓö¼íp s║ô║║H║║túåtíp vuà ╞Æô║║ ║ªùa┬¬t t ô║║H║║túô║║H║║r-....", "Nhập sáp vuốt tóc. Đang làm tự công bố ở VN : dự kiến 1,5 tháng nữa mới xong. Sau khi xong mới có thể nhập hàng");
        s = s.Replace("C├óan tm nguôn hàng ruy b├ôcíong decor 15/6: Lv với...", "Cần tìm nguồn hàng ruy băng decor. 15/6: Lv với xưởng ruy băng và lưới Kh gửi");
        s = s.Replace("Hu├íng Phạ", "Hương Phạm");
        s = s.Replace("G├öÇing xin s├öÇåt h├ƒôùn triệu.", "Đang xin số điện thoại hỗ trợ.");

        return s.Trim();
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
            if (lead.ContainsKey("name")) lead["name"] = FixText(Convert.ToString(lead["name"]));
            if (lead.ContainsKey("note")) lead["note"] = FixText(Convert.ToString(lead["note"]));
            cleanLeads.Add(lead);
        }

        db["leads"] = cleanLeads;
        db["dbVersion"] = "21.36";

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
                Console.WriteLine("Fix Last Residual API POST Response: " + respText);
            }
        } catch (Exception ex) {
            Console.WriteLine("Error posting state to API: " + ex.Message);
        }
    }
}
