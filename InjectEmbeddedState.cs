using System;
using System.IO;
using System.Text;

class InjectEmbeddedState {
    static void Main() {
        string dbPath = @"d:\antigravity\db.json";
        string dbJson = File.ReadAllText(dbPath, Encoding.UTF8);

        string serverPath = @"d:\antigravity\server.js";
        string serverCode = File.ReadAllText(serverPath, Encoding.UTF8);

        string embeddedJs = "const EMBEDDED_DEFAULT_STATE = " + dbJson + ";\n";

        if (serverCode.Contains("const EMBEDDED_DEFAULT_STATE =")) {
            serverCode = System.Text.RegularExpressions.Regex.Replace(serverCode, @"const EMBEDDED_DEFAULT_STATE = [\s\S]*?;\n\n// Helper", embeddedJs + "\n// Helper");
        } else {
            serverCode = embeddedJs + "\n" + serverCode;
        }

        File.WriteAllText(serverPath, serverCode, new UTF8Encoding(false));
        Console.WriteLine("InjectEmbeddedState updated EMBEDDED_DEFAULT_STATE successfully!");
    }
}
