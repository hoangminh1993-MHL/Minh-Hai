using System;
using System.IO;
using System.Net;
using System.Text;
using System.Web.Script.Serialization;
using System.Collections.Generic;

class AttachTestDocToAllLeads {
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
            
            System.Collections.ArrayList filesList = lead.ContainsKey("files") ? lead["files"] as System.Collections.ArrayList : null;
            if (filesList == null) {
                filesList = new System.Collections.ArrayList();
            }

            // Ensure test document exists in files list
            bool hasTestDoc = false;
            foreach (object fObj in filesList) {
                Dictionary<string, object> fDict = fObj as Dictionary<string, object>;
                if (fDict != null && fDict.ContainsKey("name")) {
                    string fName = Convert.ToString(fDict["name"]);
                    if (fName.Contains("Báo Giá") || fName.Contains("Hợp Đồng")) {
                        hasTestDoc = true;
                        break;
                    }
                }
            }

            if (!hasTestDoc) {
                Dictionary<string, object> testDoc = new Dictionary<string, object>();
                testDoc["name"] = "Báo Giá & Hợp Đồng Vận Chuyển.pdf";
                testDoc["url"] = "https://drive.google.com/file/d/123_Bao_Gia_Hop_Dong_Minh_Hai/view";
                testDoc["date"] = "2026-07-28 16:30";
                filesList.Add(testDoc);
            }

            lead["files"] = filesList;
            cleanLeads.Add(lead);
        }

        db["leads"] = cleanLeads;
        db["dbVersion"] = "21.52";

        string cleanJson = serializer.Serialize(db);
        File.WriteAllText(@"d:\antigravity\db.json", cleanJson, new UTF8Encoding(false));
        File.WriteAllText(@"d:\antigravity\minhhai_crm_deploy\db.json", cleanJson, new UTF8Encoding(false));

        Console.WriteLine("Pre-attached sample test document to all leads successfully!");

        // POST state to API endpoint https://minh-hai.onrender.com/api/state
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
                Console.WriteLine("Attach Test Doc API POST Response: " + respText);
            }
        } catch (Exception ex) {
            Console.WriteLine("Error posting state to API: " + ex.Message);
        }
    }
}
