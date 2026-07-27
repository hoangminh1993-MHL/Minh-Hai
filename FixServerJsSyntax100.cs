using System;
using System.IO;
using System.Text;
using System.Text.RegularExpressions;

class FixServerJsSyntax100 {
    static void Main() {
        string serverPath = @"d:\antigravity\server.js";
        string dbPath = @"d:\antigravity\db.json";

        string dbJson = File.ReadAllText(dbPath, Encoding.UTF8);

        // Read server.js code after EMBEDDED_DEFAULT_STATE definition
        string serverCode = File.ReadAllText(serverPath, Encoding.UTF8);
        int expressIndex = serverCode.IndexOf("const express = require('express');");

        if (expressIndex == -1) {
            Console.WriteLine("ERROR: Could not find 'const express = require' in server.js!");
            return;
        }

        string restOfServerCode = serverCode.Substring(expressIndex);

        // Build clean server.js
        StringBuilder sb = new StringBuilder();
        sb.AppendLine("// Cleaned server.js v21.25");
        sb.Append("const EMBEDDED_DEFAULT_STATE = ");
        sb.Append(dbJson.Trim());
        sb.AppendLine(";");
        sb.AppendLine();
        sb.Append(restOfServerCode);

        string cleanServerJs = sb.ToString();

        File.WriteAllText(serverPath, cleanServerJs, new UTF8Encoding(false));
        File.WriteAllText(@"d:\antigravity\minhhai_crm_deploy\server.js", cleanServerJs, new UTF8Encoding(false));

        Console.WriteLine("FixServerJsSyntax100 completed successfully!");
    }
}
