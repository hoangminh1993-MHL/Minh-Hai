using System;
using System.IO;
using System.Net;
using System.Text;
using System.Text.RegularExpressions;
using System.Web.Script.Serialization;
using System.Collections.Generic;

class FixLast2Names {
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
            string phone = Convert.ToString(lead["phone"]).Trim();

            if (name.Contains("Hu") && name.Contains("Ph")) {
                name = "Hương Phạm";
            }
            if ((name.Contains("Xu") && name.Contains("Hải")) || (name.Contains("Xu") && name.Contains("Éinh")) || (name.Contains("Xu") && name.Contains("Đinh"))) {
                name = "Xuân Hải Đinh";
            }
            if (name.Contains("Dương") || name.Contains("D├║ng") || name.Contains("Dâ•žâ–‘")) {
                name = "Dương Tóc";
            }
            if (name.Contains("Anh") && name.Contains("Phương")) {
                name = "Anh Phương";
            }

            lead["name"] = name;
            cleanLeads.Add(lead);
        }

        db["leads"] = cleanLeads;
        db["dbVersion"] = "21.42";

        string cleanJson = serializer.Serialize(db);
        File.WriteAllText(@"d:\antigravity\db.json", cleanJson, new UTF8Encoding(false));
        File.WriteAllText(@"d:\antigravity\minhhai_crm_deploy\db.json", cleanJson, new UTF8Encoding(false));

        Console.WriteLine("Fixed last 2 lead names perfectly!");

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
                Console.WriteLine("Fix Last 2 Names API POST Response: " + respText);
            }
        } catch (Exception ex) {
            Console.WriteLine("Error posting state to API: " + ex.Message);
        }
    }
}
