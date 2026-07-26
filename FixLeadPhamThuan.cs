using System;
using System.IO;
using System.Text;

class FixLeadPhamThuan {
    static void Main() {
        string path = @"d:\antigravity\db.json";
        string[] lines = File.ReadAllLines(path, Encoding.UTF8);

        lines[3389] = "                                        \"note\":  \"Nhận giấy Tiểu ngạch và CN\\n3/7 : Đã báo giá CN. Hẹn KH sang tuần qua công ty để làm việc.\\n11/7 : Hẹn lịch KH thứ 2 qua công ty trao đổi\"";

        lines[3477] = "                      \"note\":  \"Mua hộ hàng trên TMĐT. Mua máy cân da báo cước. Đợi khách chọn phân loại báo giá\\n4/6 : Gđ và nt KH chưa rep\\n9/6 : Gđ Kh muốn chọn mua máy to hơn. Sẽ liên hệ lại sau\\n13/6: Lhe Kh hỏi thăm\\n23/6: Gđ cho KH để hỗ trợ. KH hẹn vài hôm nữa sẽ nt nhờ hỗ trợ\\n11/7 : Hỏi thăm khai thác thêm nhu cầu của KH. KH ko quan tâm\",";
        lines[3503] = "                                        \"note\":  \"Mua hộ hàng trên TMĐT. Mua máy cân da báo cước. Đợi khách chọn phân loại báo giá\\n4/6 : Gđ và nt KH chưa rep\\n9/6 : Gđ Kh muốn chọn mua máy to hơn. Sẽ liên hệ lại sau\\n13/6: Lhe Kh hỏi thăm\\n23/6: Gđ cho KH để hỗ trợ. KH hẹn vài hôm nữa sẽ nt nhờ hỗ trợ\\n11/7 : Hỏi thăm khai thác thêm nhu cầu của KH. KH ko quan tâm\"";

        File.WriteAllLines(path, lines, new UTF8Encoding(false));
        Console.WriteLine("FixLeadPhamThuan executed successfully!");
    }
}
