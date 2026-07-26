using System;
using System.IO;
using System.Text;
using System.Text.RegularExpressions;

class RestoreRealUsersInAppJs {
    static void Main() {
        string appJsPath = @"d:\antigravity\app.js";
        string dbJsonPath = @"d:\antigravity\db.json";

        string realUsersJs = @"const INITIAL_USERS = [
  { id: 'usr-1', name: 'Nguyễn Hoàng Minh', username: 'hoangminh', password: 'Hoangminh93!0911', role: 'admin', dept: 'admin', points: 350, avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80' },
  { id: 'usr-2', name: 'Trần Tú Anh', username: 'tuanh', password: 'a123', role: 'admin', dept: 'admin', points: 280, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80' },
  { id: 'usr-3', name: 'Phượng Thị Minh Phương', username: 'minhphuong', password: 'a123', role: 'manager', dept: 'cskh', points: 150, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80' },
  { id: 'usr-4', name: 'Đoàn Thị Hải Linh', username: 'hailinh', password: 'a123', role: 'cskh', dept: 'cskh', points: 420, avatar: 'fa-user-ninja' },
  { id: 'usr-5', name: 'Đặng Thị Phương Thảo', username: 'phuongthao', password: 'a123', role: 'manager', dept: 'sales', points: 310, avatar: 'fa-user-nurse' },
  { id: 'usr-6', name: 'Lê Thị Thùy Trang', username: 'thuytrang', password: 'a123', role: 'sales', dept: 'sales', points: 290, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80' },
  { id: 'usr-7', name: 'Bùi Thị Bích Phượng', username: 'bichphuong', password: 'a123', role: 'sales', dept: 'sales', points: 210, avatar: 'fa-user-nurse' },
  { id: 'usr-8', name: 'Nguyễn Phương Anh', username: 'phuonganh', password: 'a123', role: 'sales', dept: 'sales', points: 180, avatar: 'fa-user-ninja' },
  { id: 'usr-9', name: 'Phạm Duy Hưng', username: 'duyhung', password: 'a123', role: 'sourcing', dept: 'sourcing', points: 320, avatar: 'fa-user-astronaut' },
  { id: 'usr-10', name: 'Đặng Khánh Linh', username: 'khanhlinh', password: 'a123', role: 'sourcing', dept: 'sourcing', points: 250, avatar: 'fa-user-nurse' },
  { id: 'usr-11', name: 'Ngô Gia Bảo', username: 'giabao', password: 'a123', role: 'sourcing', dept: 'sourcing', points: 230, avatar: 'fa-user-astronaut' },
  { id: 'usr-12', name: 'Phùng Tiến Dũng', username: 'tiendung', password: 'a123', role: 'sourcing', dept: 'sourcing', points: 190, avatar: 'fa-user-ninja' },
  { id: 'usr-13', name: 'Trịnh Hoài Nam', username: 'hoainam', password: 'a123', role: 'sourcing', dept: 'sourcing', points: 140, avatar: 'fa-user-ninja' },
  { id: 'usr-14', name: 'Lý Hải Nam', username: 'hainam_kc', password: 'a123', role: 'warehouse', dept: 'warehouse', points: 240, avatar: 'fa-user-ninja', loc: 'Kho Quảng Châu' },
  { id: 'usr-15', name: 'Vương Hồng Quân', username: 'hongquan_tq', password: 'a123', role: 'warehouse', dept: 'warehouse', points: 260, avatar: 'fa-user-ninja', loc: 'Kho Thâm Quyến' },
  { id: 'usr-16', name: 'Nguyễn Văn Hùng', username: 'vanhung_hn', password: 'a123', role: 'warehouse', dept: 'warehouse', points: 180, avatar: 'fa-user-ninja', loc: 'Kho Hà Nội' },
  { id: 'usr-17', name: 'Lê Văn Nam', username: 'vannam_hn', password: 'a123', role: 'warehouse', dept: 'warehouse', points: 190, avatar: 'fa-user-ninja', loc: 'Kho Hà Nội' }
];";

        string appJs = File.ReadAllText(appJsPath, Encoding.UTF8);
        appJs = Regex.Replace(appJs, @"const INITIAL_USERS = \[[\s\S]*?\];", realUsersJs);
        File.WriteAllText(appJsPath, appJs, new UTF8Encoding(false));

        // Update db.json users array as well
        string dbJson = File.ReadAllText(dbJsonPath, Encoding.UTF8);
        dbJson = dbJson.Replace("Tr\u1ea7n T\u00ad Anh", "Trần Tú Anh");
        dbJson = dbJson.Replace("Tr?n T Anh", "Trần Tú Anh");
        dbJson = dbJson.Replace("Phng Thị Minh Phương", "Phượng Thị Minh Phương");
        dbJson = dbJson.Replace("Ph?ng Th? Minh Ph\u01b0\u01a1ng", "Phượng Thị Minh Phương");
        dbJson = dbJson.Replace("L Thị Thy Trang", "Lê Thị Thùy Trang");
        dbJson = dbJson.Replace("L? Th? Th\u00f9y Trang", "Lê Thị Thùy Trang");
        dbJson = dbJson.Replace("Bi Thị Bch Phượng", "Bùi Thị Bích Phượng");
        dbJson = dbJson.Replace("B\u00f9i Th? B\u00edch Ph\u01b0\u01a1ng", "Bùi Thị Bích Phượng");
        
        File.WriteAllText(dbJsonPath, dbJson, new UTF8Encoding(false));

        Console.WriteLine("RestoreRealUsersInAppJs executed successfully!");
    }
}
