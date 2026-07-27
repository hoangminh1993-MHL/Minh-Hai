using System;
using System.IO;
using System.Text;
using System.Web.Script.Serialization;

class FixDbJsonAndServerJs {
    static void Main() {
        string dbPath = @"d:\antigravity\db.json";
        string dbText = File.ReadAllText(dbPath, Encoding.UTF8);

        try {
            JavaScriptSerializer serializer = new JavaScriptSerializer();
            serializer.MaxJsonLength = int.MaxValue;
            object obj = serializer.DeserializeObject(dbText);
            Console.WriteLine("db.json is 100% VALID JSON!");
        } catch (Exception ex) {
            Console.WriteLine("db.json JSON PARSE ERROR: " + ex.Message);
        }
    }
}
