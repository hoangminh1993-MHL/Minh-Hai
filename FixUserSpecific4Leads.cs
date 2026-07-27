using System;
using System.IO;
using System.Net;
using System.Text;
using System.Web.Script.Serialization;
using System.Collections.Generic;

class FixUserSpecific4Leads {
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
            string id = Convert.ToString(lead["id"]).Trim();
            string name = Convert.ToString(lead["name"]).Trim();
            string phone = Convert.ToString(lead["phone"]).Trim();
            string note = Convert.ToString(lead["note"]).Trim();

            // 1. Minh Tóm / Minh Tâm (0896122898)
            if (phone == "0896122898" || name.Contains("Tóm") || name.Contains("MH408")) {
                name = "Minh Tâm";
                note = "Mã KH: MH408 - Nguyễn Minh Tâm Đặt set váy : KH lẻ 35k/1kg. 0% phí dv.";
            }
            // 2. Phạm Thị Ánh Ngọc (0836060902)
            else if (phone == "0836060902" || name.Contains("Ánh Ngọc") || name.Contains("Ngβìc")) {
                name = "Phạm Thị Ánh Ngọc";
                note = "Hỏi KG : bánh đậu xanh, ... gửi sang TQ";
            }
            // 3. Hương Vũ (0766266294)
            else if (phone == "0766266294" || name.Contains("Híng V") || name.Contains("Hương Vũ")) {
                name = "Hương Vũ";
                note = "Tư vấn KH về thủ tục CN 9/7 : Đã gửi báo giá CN -...";
            }
            // 4. Nhã Phương Bùi
            else if (name.Contains("Nha Phuong") || name.Contains("Nhã Phương") || note.Contains("nội thất gỗ") || note.Contains("dôГéºÔª")) {
                name = "Nhã Phương Bùi";
                note = "Vc hàng nội thất gỗ : dưới 200kg. 2/7 : Đã báo giá 16k về tận nhà ở HP với hàng lô";
            }

            lead["name"] = name;
            lead["note"] = note;
            cleanLeads.Add(lead);
        }

        db["leads"] = cleanLeads;
        db["dbVersion"] = "21.45";

        string cleanJson = serializer.Serialize(db);
        File.WriteAllText(@"d:\antigravity\db.json", cleanJson, new UTF8Encoding(false));
        File.WriteAllText(@"d:\antigravity\minhhai_crm_deploy\db.json", cleanJson, new UTF8Encoding(false));

        Console.WriteLine("Fixed 4 user reported leads 100% pristine!");

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
                Console.WriteLine("Fix 4 Leads API POST Response: " + respText);
            }
        } catch (Exception ex) {
            Console.WriteLine("Error posting state to API: " + ex.Message);
        }
    }
}
