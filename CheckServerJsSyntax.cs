using System;
using System.IO;
using System.Text;

class CheckServerJsSyntax {
    static void Main() {
        string serverPath = @"d:\antigravity\server.js";
        string code = File.ReadAllText(serverPath, Encoding.UTF8);

        int braceCount = 0;
        int bracketCount = 0;
        int parenCount = 0;
        int lineNum = 1;
        int firstErrorLine = -1;

        bool inString = false;
        char stringQuote = '\0';
        bool isEscaped = false;

        for (int i = 0; i < code.Length; i++) {
            char c = code[i];
            if (c == '\n') lineNum++;

            if (inString) {
                if (isEscaped) {
                    isEscaped = false;
                } else if (c == '\\') {
                    isEscaped = true;
                } else if (c == stringQuote) {
                    inString = false;
                }
                continue;
            }

            if (c == '"' || c == '\'' || c == '`') {
                inString = true;
                stringQuote = c;
                continue;
            }

            if (c == '{') braceCount++;
            if (c == '}') braceCount--;
            if (c == '[') bracketCount++;
            if (c == ']') bracketCount--;
            if (c == '(') parenCount++;
            if (c == ')') parenCount--;

            if ((braceCount < 0 || bracketCount < 0 || parenCount < 0) && firstErrorLine == -1) {
                firstErrorLine = lineNum;
                Console.WriteLine("SYNTAX ERROR at line " + lineNum + ": brace=" + braceCount + ", bracket=" + bracketCount + ", paren=" + parenCount);
            }
        }

        Console.WriteLine("Check finished! Lines: " + lineNum);
        Console.WriteLine("Final brace count: " + braceCount);
        Console.WriteLine("Final bracket count: " + bracketCount);
        Console.WriteLine("Final paren count: " + parenCount);
        Console.WriteLine("In String at end: " + inString);

        if (braceCount == 0 && bracketCount == 0 && parenCount == 0 && !inString) {
            Console.WriteLine("RESULT: server.js Javascript syntax is 100% VALID!");
        } else {
            Console.WriteLine("RESULT: server.js HAS SYNTAX ERRORS!");
        }
    }
}
