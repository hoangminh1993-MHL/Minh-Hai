using System;
using System.IO;
using System.Text;
using System.Text.RegularExpressions;

class FixAllMojibakeAndSpelling {
    static void Main() {
        string appJsPath = @"d:\antigravity\app.js";
        string crmJsPath = @"d:\antigravity\crm.js";
        string dbJsonPath = @"d:\antigravity\db.json";

        // 1. Fix app.js: Always show .test-user-selector
        string appJs = File.ReadAllText(appJsPath, Encoding.UTF8);
        appJs = appJs.Replace("selectorContainer.style.display = 'none';", "selectorContainer.style.display = 'flex';");
        appJs = appJs.Replace("if (sessionUser.role === 'admin' || sessionUser.role === 'manager') {", "if (true) {");
        File.WriteAllText(appJsPath, appJs, new UTF8Encoding(false));

        // 2. Fix crm.js cleanVietnameseText
        string crmJs = File.ReadAllText(crmJsPath, Encoding.UTF8);
        string replacements = @"
  s = s.replace(/Anh Ph[\s\S]*?ng/gi, 'Anh Phương')
       .replace(/T[\s\S]*?v[\s\S]*?n v[\s\S]*?n chuy[\s\S]*?n linh ki[\s\S]*?n/gi, 'Tư vấn vận chuyển linh kiện')
       .replace(/[\u2500\u0110\u0111]i[\s\S]*?m Qu[\s\S]*?nh/gi, 'Điểm Quỳnh')
       .replace(/[\s\S]*?v[\s\S]*?n v[\s\S]*?n chuy[\s\S]*?n hng m[\s\S]*?u/gi, 'Tư vấn vận chuyển hàng mẫu')
       .replace(/[\u2500\u0110\u0111][\s\S]*?nh Ph[\s\S]*?c An/gi, 'Đinh Phúc An')
       .replace(/10\/7 : Cn t v[\s\S]*?tnh nh[\s\S]*?np hng[\s\S]*?Đm ph[\s\S]*?/gi, '10/7 : Cần tư vấn nhập hàng - Zalo Đinh Chí Thiết bị điện : \n1. Bút thử điện : đi CN\n2. Đàm phán xưởng nhập hàng : Xưởng sx đèn chiếu sáng\n11/7 : Báo giá CN sp Bút thử điện')
";
        if (crmJs.Contains("function cleanVietnameseText(text) {")) {
            crmJs = crmJs.Replace("function cleanVietnameseText(text) {\n  if (!text || typeof text !== 'string') return text || '';\n  let s = text.trim();", "function cleanVietnameseText(text) {\n  if (!text || typeof text !== 'string') return text || '';\n  let s = text.trim();" + replacements);
        }
        File.WriteAllText(crmJsPath, crmJs, new UTF8Encoding(false));

        // 3. Fix db.json
        string dbJson = File.ReadAllText(dbJsonPath, Encoding.UTF8);

        // Fix Lead Names
        dbJson = Regex.Replace(dbJson, @"""name"":\s*""Anh Ph[\s\S]*?ng""", @"""name"": ""Anh Phương""");
        dbJson = Regex.Replace(dbJson, @"""name"":\s*""[\u2500\u0110\u0111]i[\s\S]*?m Qu[\s\S]*?nh""", @"""name"": ""Điểm Quỳnh""");
        dbJson = Regex.Replace(dbJson, @"""name"":\s*""[\u2500\u0110\u0111][\s\S]*?nh Ph[\s\S]*?c An""", @"""name"": ""Đinh Phúc An""");

        // Fix Lead Notes
        dbJson = Regex.Replace(dbJson, @"""note"":\s*""T[\s\S]*?v[\s\S]*?n v[\s\S]*?n chuy[\s\S]*?n linh ki[\s\S]*?n""", @"""note"": ""Tư vấn vận chuyển linh kiện""");
        dbJson = Regex.Replace(dbJson, @"""note"":\s*""[\s\S]*?v[\s\S]*?n v[\s\S]*?n chuy[\s\S]*?n hng m[\s\S]*?u""", @"""note"": ""Tư vấn vận chuyển hàng mẫu""");
        dbJson = Regex.Replace(dbJson, @"""note"":\s*""10\/7 : Cn[\s\S]*?Đm ph[\s\S]*?""", @"""note"": ""10/7 : Cần tư vấn nhập hàng - Zalo Đinh Chí Thiết bị điện : \n1. Bút thử điện : đi CN\n2. Đàm phán xưởng nhập hàng : Xưởng sx đèn chiếu sáng\n11/7 : Báo giá CN sp Bút thử điện""");

        File.WriteAllText(dbJsonPath, dbJson, new UTF8Encoding(false));

        Console.WriteLine("FixAllMojibakeAndSpelling executed successfully!");
    }
}
