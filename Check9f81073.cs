using System;
using System.IO;
using System.Text;
using System.Web.Script.Serialization;
using System.Collections.Generic;

class Check9f81073 {
    static void Main() {
        Console.OutputEncoding = Encoding.UTF8;
        JavaScriptSerializer serializer = new JavaScriptSerializer();
        serializer.MaxJsonLength = int.MaxValue;

        string text = File.ReadAllText(@"d:\antigravity\clean_9f81073.json", Encoding.UTF8);
        Dictionary<string, object> db = serializer.Deserialize<Dictionary<string, object>>(text);

        System.Collections.ArrayList leads = (System.Collections.ArrayList)db["leads"];
        Console.WriteLine("Commit 9f81073 Leads count: " + (leads != null ? leads.Count : 0));

        if (leads != null) {
            for (int i = 0; i < Math.Min(15, leads.Count); i++) {
                Dictionary<string, object> lead = (Dictionary<string, object>)leads[i];
                Console.WriteLine("[" + i + "] Name: " + lead["name"] + " | Phone: " + lead["phone"] + " | Note: " + lead["note"]);
            }
        }
    }
}
