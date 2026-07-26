using System;
using System.IO;
using System.Text;

class FixRemaining77 {
    static void Main() {
        string path = @"d:\antigravity\db.json";
        string[] lines = File.ReadAllLines(path, Encoding.UTF8);

        lines[903] = "                      \"note\":  \"MH : 20 cuộn băng dính 3M. Đã báo giá\\n26/6 : Liên hệ KH chưa rep\\n27/6: Gđ ko liên lạc được\",";
        lines[994] = "                                        \"note\":  \"MH : 20 cuộn băng dính 3M. Đã báo giá\\n26/6 : Liên hệ KH chưa rep\\n27/6: Gđ ko liên lạc được\"";

        lines[1017] = "                      \"note\":  \"Hỏi KG : bình dầu xanh, ... gửi sang TQ\",";
        lines[1108] = "                                        \"note\":  \"Hỏi KG : bình dầu xanh, ... gửi sang TQ\"";

        for (int i = 0; i < lines.Length; i++) {
            lines[i] = lines[i].Replace("T?o ghi ch ban d?u v? hng hóa", "Tạo ghi chú ban đầu về hàng hóa");
            lines[i] = lines[i].Replace("Tìm hi?u lo?i m?tt hng \\u0026 s? lư?ng d? ki?n", "Tìm hiểu loại mặt hàng & số lượng dự kiến");
            lines[i] = lines[i].Replace("Tìm hi?u d?a ch? nh?nn hng t?i Vi?t Nam", "Tìm hiểu địa chỉ nhận hàng tại Việt Nam");
            lines[i] = lines[i].Replace("Tìm hi?u d?a ch? nh?nn hng t?i Vi?t Nam", "Tìm hiểu địa chỉ nhận hàng tại Việt Nam");
            lines[i] = lines[i].Replace("Tìm ngu?n hng / Lin h? xư?ng", "Tìm nguồn hàng / Liên hệ xưởng");
            lines[i] = lines[i].Replace("Xc nh?nn khch dã d?ng y v c?c (ho?tc ln dơn)", "Xác nhận khách đã đồng ý và cọc (hoặc lên đơn)");
            lines[i] = lines[i].Replace("Lưu l?ch s? ph?n h?i d? chăm sóc l?i sau", "Lưu lịch sử phản hồi để chăm sóc lại sau");
        }

        File.WriteAllLines(path, lines, new UTF8Encoding(false));
        Console.WriteLine("FixRemaining77 executed successfully!");
    }
}
