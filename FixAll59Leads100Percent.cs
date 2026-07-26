using System;
using System.IO;
using System.Text;

class FixAll59Leads100Percent {
    static void Main() {
        string path = @"d:\antigravity\db.json";
        string[] lines = File.ReadAllLines(path, Encoding.UTF8);

        lines[4328] = "                      \"note\":  \"KG : hàng lẻ và lô quần áo- Tiên Lãng HP. Đang báo giá lẻ : 30k- Lô : 26k.\\n. KH phản hồi đang đi hàng Lô về HN là 20k/1kg.\\n9/6 : Báo giá hàng lô 22k/1kg - Hàng lẻ: 30k\\n11/6: Gđ cho KH ko nghe máy\\n12/6: Đang chốt lại với KH \\n13/6 : KH đợi mấy hôm nữa có đơn sẽ báo lại\",";
        lines[4354] = "                                        \"note\":  \"KG : hàng lẻ và lô quần áo- Tiên Lãng HP. Đang báo giá lẻ : 30k- Lô : 26k.\\n. KH phản hồi đang đi hàng Lô về HN là 20k/1kg.\\n9/6 : Báo giá hàng lô 22k/1kg - Hàng lẻ: 30k\\n11/6: Gđ cho KH ko nghe máy\\n12/6: Đang chốt lại với KH \\n13/6 : KH đợi mấy hôm nữa có đơn sẽ báo lại\"";

        lines[4442] = "                      \"note\":  \"Nhập khẩu CN : Cẩu cần trục - đang xin ttin check thủ tục : 83 tấn\\n10/7 : đang check thủ tục line sea\\n12/7 : Hẹn khách sang tuần báo lại. Minh đang liên hệ thêm lần nữa\",";
        lines[4468] = "                                        \"note\":  \"Nhập khẩu CN : Cẩu cần trục - đang xin ttin check thủ tục : 83 tấn\\n10/7 : đang check thủ tục line sea\\n12/7 : Hẹn khách sang tuần báo lại. Minh đang liên hệ thêm lần nữa\"";

        lines[4494] = "                      \"note\":  \"Cửa cuốn tại HP : KG CN bộ cửa : cần báo giá 1 bộ và 10 bộ. Đang check thủ tục và thuế phí\\n5/7 : Liên hệ hỏi thăm KH. KH phản hồi giá ok. Hỏi thêm về dv TTH\\n11/7 : Liên hệ lại hỏi thăm KH\",";
        lines[4520] = "                                        \"note\":  \"Cửa cuốn tại HP : KG CN bộ cửa : cần báo giá 1 bộ và 10 bộ. Đang check thủ tục và thuế phí\\n5/7 : Liên hệ hỏi thăm KH. KH phản hồi giá ok. Hỏi thêm về dv TTH\\n11/7 : Liên hệ lại hỏi thăm KH\"";

        File.WriteAllLines(path, lines, new UTF8Encoding(false));
        Console.WriteLine("FixAll59Leads100Percent executed successfully!");
    }
}
