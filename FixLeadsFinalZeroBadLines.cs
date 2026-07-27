using System;
using System.IO;
using System.Net;
using System.Text;
using System.Text.RegularExpressions;
using System.Web.Script.Serialization;
using System.Collections.Generic;

class FixLeadsFinalZeroBadLines {
    static string CleanFinal(string s) {
        if (string.IsNullOrEmpty(s)) return s;

        s = Regex.Replace(s, @"Kh.*ích", "Khách");
        s = Regex.Replace(s, @"T.*Anh", "Tú Anh");
        s = Regex.Replace(s, @"D.*ng T.*c", "Dương Tóc");
        s = Regex.Replace(s, @"Xu.*n H.*i.*inh", "Xuân Hải Đinh");

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
            if (lead.ContainsKey("name")) lead["name"] = CleanFinal(Convert.ToString(lead["name"]));
            if (lead.ContainsKey("note")) lead["note"] = CleanFinal(Convert.ToString(lead["note"]));
            if (lead.ContainsKey("salesId")) {
                string sid = Convert.ToString(lead["salesId"]);
                if (sid.Contains("Anh") || sid.Contains("Tú")) lead["salesId"] = "usr-2";
            }

            cleanLeads.Add(lead);
        }

        db["leads"] = cleanLeads;
        db["dbVersion"] = "21.32";

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
                Console.WriteLine("Final API POST Response: " + respText);
            }
        } catch (Exception ex) {
            Console.WriteLine("Error posting state to API: " + ex.Message);
        }
    }
}
