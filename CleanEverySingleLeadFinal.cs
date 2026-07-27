using System;
using System.IO;
using System.Net;
using System.Text;
using System.Text.RegularExpressions;
using System.Web.Script.Serialization;
using System.Collections.Generic;

class CleanEverySingleLeadFinal {
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
            string name = Convert.ToString(lead["name"]).Trim();
            string note = Convert.ToString(lead["note"]).Trim();

            if (name.Contains("Xu") && name.Contains("Hải")) name = "Xuân Hải Đinh";
            if (name.Contains("Dương") || name.Contains("D┬│ng")) name = "Dương Tóc";
            if (name.Contains("Hương") || name.Contains("Hu├íng")) name = "Hương Phạm";

            if (note.Contains("Nhà ╞Æô") || note.Contains("vuå")) {
                note = "Nhập sáp vuốt tóc. Đang làm tự công bố ở VN : dự kiến 1,5 tháng nữa mới xong.";
            }
            if (note.Contains("ΓöÇ├ëang xin s") || note.Contains("xin sΓöÇÖc")) {
                note = "Đang xin số điện thoại hỗ trợ. Đã gửi báo giá.";
            }

            lead["name"] = name;
            lead["note"] = note;
            cleanLeads.Add(lead);
        }

        db["leads"] = cleanLeads;
        db["dbVersion"] = "21.40";

        string cleanJson = serializer.Serialize(db);
        File.WriteAllText(@"d:\antigravity\db.json", cleanJson, new UTF8Encoding(false));
        File.WriteAllText(@"d:\antigravity\minhhai_crm_deploy\db.json", cleanJson, new UTF8Encoding(false));

        Console.WriteLine("Cleaned all remaining lead texts!");

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
                Console.WriteLine("Final Clean API POST Response: " + respText);
            }
        } catch (Exception ex) {
            Console.WriteLine("Error posting state to API: " + ex.Message);
        }
    }
}
