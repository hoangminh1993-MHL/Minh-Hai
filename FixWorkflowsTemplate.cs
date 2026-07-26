using System;
using System.IO;
using System.Text;
using System.Text.RegularExpressions;

class FixWorkflowsTemplate {
    static void Main() {
        string path = @"d:\antigravity\db.json";
        string text = File.ReadAllText(path, Encoding.UTF8);

        // Fix all workflow template step text strings
        text = text.Replace("T?o ghi ch ban d?u v? hng hóa", "Tạo ghi chú ban đầu về hàng hóa");
        text = text.Replace("T?o ghi ch\u00A0 ban d?u v? h\u00A0ng hóa", "Tạo ghi chú ban đầu về hàng hóa");
        text = text.Replace("Xc d?nh nhu cầu của khch", "Xác định nhu cầu của khách");
        text = text.Replace("Xin số diện tho?i/Zalo lin hệ", "Xin số điện thoại/Zalo liên hệ");
        text = text.Replace("Xc nhận phương thức lin l?c chnh", "Xác nhận phương thức liên lạc chính");
        text = text.Replace("Tìm hiểu lo?i mặt hng \\u0026 số lượng dự kiến", "Tìm hiểu loại mặt hàng & số lượng dự kiến");
        text = text.Replace("Tìm hiểu lo?i m?tt hng \\u0026 s? lư?ng d? ki?n", "Tìm hiểu loại mặt hàng & số lượng dự kiến");
        text = text.Replace("Tìm hiểu d?a chỉ nhận hng t?i Việt Nam", "Tìm hiểu địa chỉ nhận hàng tại Việt Nam");
        text = text.Replace("Tìm hiểu d?a ch? nh?nn hng t?i Vi?t Nam", "Tìm hiểu địa chỉ nhận hàng tại Việt Nam");
        text = text.Replace("H?i v? tần suất nhập hng (lẻ hay l)", "Hỏi về tần suất nhập hàng (lẻ hay lô)");
        text = text.Replace("Tìm nguồn hng / Lin hệ xưởng", "Tìm nguồn hàng / Liên hệ xưởng");
        text = text.Replace("Tìm ngu?n hng / Lin h? xư?ng", "Tìm nguồn hàng / Liên hệ xưởng");
        text = text.Replace("Tnh ton thuế ph \\u0026 cước vận chuyển", "Tính toán thuế phí & cước vận chuyển");
        text = text.Replace("Gửi bo gi chi tiết cho khch", "Gửi báo giá chi tiết cho khách");
        text = text.Replace("Thảo luận v? gi v chnh sch c?c", "Thảo luận về giá và chính sách cọc");
        text = text.Replace("Giải dp thắc mắc của khch", "Giải đáp thắc mắc của khách");
        text = text.Replace("Xc nhận khch dã dồng y v c?c (hoặc ln dơn)", "Xác nhận khách đã đồng ý và cọc (hoặc lên đơn)");
        text = text.Replace("Xc nh?nn khch dã d?ng y v c?c (ho?tc ln dơn)", "Xác nhận khách đã đồng ý và cọc (hoặc lên đơn)");
        text = text.Replace("Chuyển khch sang danh sch Khch cũ / T?o l hng mới", "Chuyển khách sang danh sách Khách cũ / Tạo lô hàng mới");
        text = text.Replace("Ch?n ly do thất b?i", "Chọn lý do thất bại");
        text = text.Replace("Lưu l?ch sử phản hồi dể chăm sóc l?i sau", "Lưu lịch sử phản hồi để chăm sóc lại sau");
        text = text.Replace("Lưu l?ch s? ph?n h?i d? chăm sóc l?i sau", "Lưu lịch sử phản hồi để chăm sóc lại sau");

        // Clean any remaining CP437 symbols in notes
        text = Regex.Replace(text, @"Cß║ºn t├¼m nguß╗n h.ng ruy b─âng decor[\s\S]*? ko""", @"""[Mã KH: MH404 - Liên193] Cần tìm nguồn hàng ruy băng decor \n15/6 : Làm việc với xưởng ruy băng và lưới Kh gửi. Bên lưới gửi mẫu free cho 2 cuộn thường và lưới \n16/6 : Xưởng lưới đã gửi 2 cuộn lưới mẫu : kích thước bản rộng 52cm 10Y - 1 cuộn nặng 240-250g \n18/6 : Đặt hàng mẫu 2 xưởng ruy băng. Đang đợi hàng về \n25/6 : Hàng mẫu về đợi khách làm dòng sp cần ko""");
        text = Regex.Replace(text, @"Nh├ƒΓò[\s\S]*?hΓö£ng""", @"""Nhập sáp vuốt tóc.\nĐang làm thủ tục công bố ở VN : dự kiến 1,5 tháng nữa mới xong\nSau khi xong mới có thể nhập hàng""");

        File.WriteAllText(path, text, new UTF8Encoding(false));
        Console.WriteLine("FixWorkflowsTemplate executed successfully!");
    }
}
