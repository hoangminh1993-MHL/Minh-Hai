using System;
using System.IO;
using System.Text;

class RebuildServerJsClean {
    static void Main() {
        string serverPath = @"d:\antigravity\server.js";
        string serverCode = File.ReadAllText(serverPath, Encoding.UTF8);

        int expressIdx = serverCode.IndexOf("const express = require('express');");
        if (expressIdx == -1) {
            Console.WriteLine("ERROR: Could not find 'const express' in server.js!");
            return;
        }

        string serverLogic = serverCode.Substring(expressIdx);

        // Remove duplicate requires from serverLogic
        serverLogic = serverLogic.Replace("const fs = require('fs');\r\n", "");
        serverLogic = serverLogic.Replace("const fs = require('fs');\n", "");
        serverLogic = serverLogic.Replace("const path = require('path');\r\n", "");
        serverLogic = serverLogic.Replace("const path = require('path');\n", "");

        StringBuilder sb = new StringBuilder();
        sb.AppendLine("// Cleaned server.js v21.25");
        sb.AppendLine("const fs = require('fs');");
        sb.AppendLine("const path = require('path');");
        sb.AppendLine("let EMBEDDED_DEFAULT_STATE = {};");
        sb.AppendLine("try {");
        sb.AppendLine("  const defaultStatePath = path.join(__dirname, 'db.json');");
        sb.AppendLine("  if (fs.existsSync(defaultStatePath)) {");
        sb.AppendLine("    let raw = fs.readFileSync(defaultStatePath, 'utf8');");
        sb.AppendLine("    if (raw && raw.charCodeAt(0) === 0xFEFF) raw = raw.slice(1);");
        sb.AppendLine("    EMBEDDED_DEFAULT_STATE = JSON.parse(raw);");
        sb.AppendLine("  }");
        sb.AppendLine("} catch (e) {");
        sb.AppendLine("  console.error('Error loading fallback EMBEDDED_DEFAULT_STATE:', e.message);");
        sb.AppendLine("}");
        sb.AppendLine();
        sb.Append(serverLogic);

        string cleanServerJs = sb.ToString();

        File.WriteAllText(serverPath, cleanServerJs, new UTF8Encoding(false));
        File.WriteAllText(@"d:\antigravity\minhhai_crm_deploy\server.js", cleanServerJs, new UTF8Encoding(false));

        Console.WriteLine("RebuildServerJsClean completed successfully!");
    }
}
