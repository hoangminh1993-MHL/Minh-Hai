using System;
using System.Diagnostics;
using System.IO;
using System.Text;
using System.Web.Script.Serialization;
using System.Collections.Generic;

class ExtractPristineLeads {
    static void Main() {
        Console.OutputEncoding = Encoding.UTF8;

        ProcessStartInfo psi = new ProcessStartInfo {
            FileName = "git",
            Arguments = "show 504926a:db.json",
            StandardOutputEncoding = Encoding.UTF8,
            UseShellExecute = false,
            RedirectStandardOutput = true
        };

        Process proc = Process.Start(psi);
        string text = proc.StandardOutput.ReadToEnd();
        proc.WaitForExit();

        JavaScriptSerializer serializer = new JavaScriptSerializer();
        serializer.MaxJsonLength = int.MaxValue;

        Dictionary<string, object> db = serializer.Deserialize<Dictionary<string, object>>(text);
        System.Collections.ArrayList leads = (System.Collections.ArrayList)db["leads"];
        Console.WriteLine("Commit 504926a Leads count: " + leads.Count);

        for (int i = 0; i < Math.Min(15, leads.Count); i++) {
            Dictionary<string, object> lead = (Dictionary<string, object>)leads[i];
            Console.WriteLine("[" + i + "] Name: " + lead["name"] + " | Phone: " + lead["phone"] + " | Note: " + lead["note"]);
        }
    }
}
