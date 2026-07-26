using System;
using System.IO;
using System.Text;

class FixLeadsFinalZeroBadLines {
    static void Main() {
        string path = @"d:\antigravity\db.json";
        string[] lines = File.ReadAllLines(path, Encoding.UTF8);

        lines[4556] = "                      \"note\":  \"3/7 : Báo giá CN : 8 bộ kẹp Phanh của Nga\\n4/7 : Đã nt cho KH để hỏi thăm\\n11/7 : Liên hệ Kh hỏi thăm về đơn hàng\",";
        lines[4582] = "                                        \"note\":  \"3/7 : Báo giá CN : 8 bộ kẹp Phanh của Nga\\n4/7 : Đã nt cho KH để hỏi thăm\\n11/7 : Liên hệ Kh hỏi thăm về đơn hàng\"";

        lines[4670] = "                      \"note\":  \"Hỏi bóng quái\",";
        lines[4696] = "                                        \"note\":  \"Hỏi bóng quái\"";

        for (int i = 0; i < lines.Length; i++) {
            lines[i] = lines[i].Replace("T?o ghi ch ban d?u v? hng hóa", "Tạo ghi chú ban đầu về hàng hóa");
            lines[i] = lines[i].Replace("Tìm hi?u lo?i m?tt hng \\u0026 s? lư?ng d? ki?n", "Tìm hiểu loại mặt hàng & số lượng dự kiến");
            lines[i] = lines[i].Replace("Tìm hi?u d?a ch? nh?nn hng t?i Vi?t Nam", "Tìm hiểu địa chỉ nhận hàng tại Việt Nam");
            lines[i] = lines[i].Replace("Tìm ngu?n hng / Lin h? xư?ng", "Tìm nguồn hàng / Liên hệ xưởng");
            lines[i] = lines[i].Replace("Xc nh?nn khch dã d?ng y v c?c (ho?tc ln dơn)", "Xác nhận khách đã đồng ý và cọc (hoặc lên đơn)");
            lines[i] = lines[i].Replace("Lưu l?ch s? ph?n h?i d? chăm sóc l?i sau", "Lưu lịch sử phản hồi để chăm sóc lại sau");
        }

        File.WriteAllLines(path, lines, new UTF8Encoding(false));
        Console.WriteLine("FixLeadsFinalZeroBadLines executed successfully!");
    }
}
