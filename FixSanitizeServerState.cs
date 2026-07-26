using System;
using System.IO;
using System.Text;

class FixSanitizeServerState {
    static void Main() {
        string serverPath = @"d:\antigravity\server.js";
        string code = File.ReadAllText(serverPath, Encoding.UTF8);

        string newSanitizeFunc = @"function sanitizeServerState(state) {
  if (!state) return state;
  state.dbVersion = '21.23';

  if (Array.isArray(state.users)) {
    const authenticNames = {
      'usr-1': 'Nguyễn Hoàng Minh',
      'usr-2': 'Trần Tú Anh',
      'usr-3': 'Phượng Thị Minh Phương',
      'usr-4': 'Đoàn Thị Hải Linh',
      'usr-5': 'Đặng Thị Phương Thảo',
      'usr-6': 'Lê Thị Thùy Trang',
      'usr-7': 'Bùi Thị Bích Phượng',
      'usr-8': 'Nguyễn Phương Anh',
      'usr-9': 'Phạm Duy Hưng',
      'usr-10': 'Đặng Khánh Linh',
      'usr-11': 'Ngô Gia Bảo',
      'usr-12': 'Phùng Tiến Dũng',
      'usr-13': 'Trịnh Hoài Nam',
      'usr-14': 'Lý Hải Nam',
      'usr-15': 'Vương Hồng Quân',
      'usr-16': 'Nguyễn Văn Hùng',
      'usr-17': 'Lê Văn Nam'
    };

    state.users.forEach(u => {
      if (authenticNames[u.id]) {
        u.name = authenticNames[u.id];
      }
    });
  }

  if (Array.isArray(state.leads)) {
    state.leads.forEach(l => {
      if (l.name) l.name = sanitizeVietnameseString(l.name);
      if (l.stage) l.stage = sanitizeVietnameseString(l.stage);
      if (l.note) l.note = sanitizeVietnameseString(l.note);
      if (l.failReason) l.failReason = sanitizeVietnameseString(l.failReason);
    });
  }
  return state;
}";

        code = System.Text.RegularExpressions.Regex.Replace(code, @"function sanitizeServerState\(state\)[\s\S]*?return state;\s*\}", newSanitizeFunc);

        File.WriteAllText(serverPath, code, new UTF8Encoding(false));
        Console.WriteLine("FixSanitizeServerState executed successfully!");
    }
}
