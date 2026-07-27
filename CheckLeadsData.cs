using System;
using System.IO;
using System.Text;
using System.Web.Script.Serialization;
using System.Collections;
using System.Collections.Generic;

class CheckLeadsData {
    static void Main() {
        string dbPath = @"d:\antigravity\db.json";
        string dbJson = File.ReadAllText(dbPath, Encoding.UTF8);
        if (dbJson.Length > 0 && dbJson[0] == '\uFEFF') dbJson = dbJson.Substring(1);

        JavaScriptSerializer serializer = new JavaScriptSerializer();
        serializer.MaxJsonLength = int.MaxValue;
        Dictionary<string, object> dict = (Dictionary<string, object>)serializer.DeserializeObject(dbJson);

        ArrayList leads = (ArrayList)dict["leads"];
        Console.WriteLine("Total leads in db.json: " + leads.Count);

        int khachMoiCount = 0;
        foreach (Dictionary<string, object> lead in leads) {
            string stage = lead.ContainsKey("stage") ? (string)lead["stage"] : "";
            string name = lead.ContainsKey("name") ? (string)lead["name"] : "";
            string id = lead.ContainsKey("id") ? (string)lead["id"] : "";

            if (stage == "Khách mới" || stage == "khach_moi" || stage == "new" || stage == "Chưa tiếp cận") {
                khachMoiCount++;
                Console.WriteLine("ID: " + id + " | Name: " + name + " | Stage: " + stage);
            }
        }

        Console.WriteLine("Total 'Khách mới' leads count: " + khachMoiCount);
    }
}
