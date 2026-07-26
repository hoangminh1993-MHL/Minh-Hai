using System;
using System.IO;
using System.Text;

class AddNoCacheToServerJs {
    static void Main() {
        string serverPath = @"d:\antigravity\server.js";
        string code = File.ReadAllText(serverPath, Encoding.UTF8);

        string noCacheCode = @"
app.use((req, res, next) => {
  if (req.url.endsWith('.html') || req.url.endsWith('.js') || req.url.endsWith('.css') || req.url === '/') {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  next();
});

app.get('*', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.sendFile(path.join(__dirname, 'index.html'));
});
";

        if (code.Contains("app.get('*'")) {
            code = System.Text.RegularExpressions.Regex.Replace(code, @"app\.get\('\*[\s\S]*?\}\);", noCacheCode);
        }

        File.WriteAllText(serverPath, code, new UTF8Encoding(false));
        Console.WriteLine("AddNoCacheToServerJs executed successfully!");
    }
}
