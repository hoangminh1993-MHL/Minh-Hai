using System;
using System.IO;
using System.Text;

class FixLineByLine {
    static void Main() {
        string path = @"d:\antigravity\db.json";
        string[] lines = File.ReadAllLines(path, Encoding.UTF8);

        lines[605] = "                      \"note\":  \"[Mã KH: MH404 - Liên193] Cần tìm nguồn hàng ruy băng decor\\n15/6 : Làm việc với xưởng ruy băng và lưới Kh gửi. Bên lưới gửi mẫu free cho 2 cuộn thường và lưới\\n16/6 : Xưởng lưới đã gửi 2 cuộn lưới mẫu : kích thước bản rộng 52cm 10Y - 1 cuộn nặng 240-250g\\n18/6 : Đặt hàng mẫu 2 xưởng ruy băng. Đang đợi hàng về\\n25/6 : Hàng mẫu về đợi khách làm dòng sp cần ko\",";
        lines[631] = "                                        \"note\":  \"[Mã KH: MH404 - Liên193] Cần tìm nguồn hàng ruy băng decor\\n15/6 : Làm việc với xưởng ruy băng và lưới Kh gửi. Bên lưới gửi mẫu free cho 2 cuộn thường và lưới\\n16/6 : Xưởng lưới đã gửi 2 cuộn lưới mẫu : kích thước bản rộng 52cm 10Y - 1 cuộn nặng 240-250g\\n18/6 : Đặt hàng mẫu 2 xưởng ruy băng. Đang đợi hàng về\\n25/6 : Hàng mẫu về đợi khách làm dòng sp cần ko\"";

        lines[719] = "                      \"note\":  \"Nhập sáp vuốt tóc.\\nĐang làm thủ tục công bố ở VN : dự kiến 1,5 tháng nữa mới xong\\nSau khi xong mới có thể nhập hàng\",";
        lines[741] = "                                        \"note\":  \"Nhập sáp vuốt tóc.\\nĐang làm thủ tục công bố ở VN : dự kiến 1,5 tháng nữa mới xong\\nSau khi xong mới có thể nhập hàng\"";

        for (int i = 0; i < lines.Length; i++) {
            lines[i] = lines[i].Replace("T?o ghi ch ban d?u v? hng hóa", "Tạo ghi chú ban đầu về hàng hóa");
            lines[i] = lines[i].Replace("Xc d?nh nhu cầu của khch", "Xác định nhu cầu của khách");
            lines[i] = lines[i].Replace("Xin số diện tho?i/Zalo lin hệ", "Xin số điện thoại/Zalo liên hệ");
            lines[i] = lines[i].Replace("Xc nhận phương thức lin l?c chnh", "Xác nhận phương thức liên lạc chính");
            lines[i] = lines[i].Replace("Tìm hi?u lo?i m?tt hng \\u0026 s? lư?ng d? ki?n", "Tìm hiểu loại mặt hàng & số lượng dự kiến");
            lines[i] = lines[i].Replace("Tìm hi?u d?a ch? nh?nn hng t?i Vi?t Nam", "Tìm hiểu địa chỉ nhận hàng tại Việt Nam");
            lines[i] = lines[i].Replace("H?i v? tần suất nhập hng (lẻ hay l)", "Hỏi về tần suất nhập hàng (lẻ hay lô)");
            lines[i] = lines[i].Replace("Tìm ngu?n hng / Lin h? xư?ng", "Tìm nguồn hàng / Liên hệ xưởng");
            lines[i] = lines[i].Replace("Tnh ton thuế ph \\u0026 cước vận chuyển", "Tính toán thuế phí & cước vận chuyển");
            lines[i] = lines[i].Replace("Gửi bo gi chi tiết cho khch", "Gửi báo giá chi tiết cho khách");
            lines[i] = lines[i].Replace("Thảo luận v? gi v chnh sch c?c", "Thảo luận về giá và chính sách cọc");
            lines[i] = lines[i].Replace("Giải dp thắc mắc của khch", "Giải đáp thắc mắc của khách");
            lines[i] = lines[i].Replace("Xc nh?nn khch dã d?ng y v c?c (ho?tc ln dơn)", "Xác nhận khách đã đồng ý và cọc (hoặc lên đơn)");
            lines[i] = lines[i].Replace("Chuyển khch sang danh sch Khch cũ / T?o l hng mới", "Chuyển khách sang danh sách Khách cũ / Tạo lô hàng mới");
            lines[i] = lines[i].Replace("Ch?n ly do thất b?i", "Chọn lý do thất bại");
            lines[i] = lines[i].Replace("Lưu l?ch s? ph?n h?i d? chăm sóc l?i sau", "Lưu lịch sử phản hồi để chăm sóc lại sau");
        }

        File.WriteAllLines(path, lines, new UTF8Encoding(false));
        Console.WriteLine("FixLineByLine executed successfully!");
    }
}
