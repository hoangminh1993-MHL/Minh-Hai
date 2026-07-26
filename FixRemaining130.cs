using System;
using System.IO;
using System.Text;
using System.Text.RegularExpressions;

class FixRemaining130 {
    static void Main() {
        string path = @"d:\antigravity\db.json";
        string[] lines = File.ReadAllLines(path, Encoding.UTF8);

        lines[605] = "                      \"note\":  \"[Mã KH: MH404 - Liên193] Cần tìm nguồn hàng ruy băng decor\\n15/6 : Làm việc với xưởng ruy băng và lưới Kh gửi. Bên lưới gửi mẫu free cho 2 cuộn thường và lưới\\n16/6 : Xưởng lưới đã gửi 2 cuộn lưới mẫu : kích thước bản rộng 52cm 10Y - 1 cuộn nặng 240-250g\\n18/6 : Đặt hàng mẫu 2 xưởng ruy băng. Đang đợi hàng về\\n25/6 : Hàng mẫu về đợi khách làm dòng sp cần ko\",";
        lines[631] = "                                        \"note\":  \"[Mã KH: MH404 - Liên193] Cần tìm nguồn hàng ruy băng decor\\n15/6 : Làm việc với xưởng ruy băng và lưới Kh gửi. Bên lưới gửi mẫu free cho 2 cuộn thường và lưới\\n16/6 : Xưởng lưới đã gửi 2 cuộn lưới mẫu : kích thước bản rộng 52cm 10Y - 1 cuộn nặng 240-250g\\n18/6 : Đặt hàng mẫu 2 xưởng ruy băng. Đang đợi hàng về\\n25/6 : Hàng mẫu về đợi khách làm dòng sp cần ko\"";

        lines[719] = "                      \"note\":  \"Nhập sáp vuốt tóc.\\nĐang làm thủ tục công bố ở VN : dự kiến 1,5 tháng nữa mới xong\\nSau khi xong mới có thể nhập hàng\",";
        lines[741] = "                                        \"note\":  \"Nhập sáp vuốt tóc.\\nĐang làm thủ tục công bố ở VN : dự kiến 1,5 tháng nữa mới xong\\nSau khi xong mới có thể nhập hàng\"";

        for (int i = 0; i < lines.Length; i++) {
            if (Regex.IsMatch(lines[i], @"├|ß|Γ|╬|┬")) {
                lines[i] = Regex.Replace(lines[i], @""".*?Cß║ºn t├¼m.*?""", @"""[Mã KH: MH404 - Liên193] Cần tìm nguồn hàng ruy băng decor \n15/6 : Làm việc với xưởng ruy băng và lưới Kh gửi. Bên lưới gửi mẫu free cho 2 cuộn thường và lưới \n16/6 : Xưởng lưới đã gửi 2 cuộn lưới mẫu : kích thước bản rộng 52cm 10Y - 1 cuộn nặng 240-250g \n18/6 : Đặt hàng mẫu 2 xưởng ruy băng. Đang đợi hàng về \n25/6 : Hàng mẫu về đợi khách làm dòng sp cần ko""");
                lines[i] = Regex.Replace(lines[i], @""".*?Nh├ƒΓò.*?""", @"""Nhập sáp vuốt tóc.\nĐang làm thủ tục công bố ở VN : dự kiến 1,5 tháng nữa mới xong\nSau khi xong mới có thể nhập hàng""");
                lines[i] = Regex.Replace(lines[i], @""".*?CN : \u0110i.*?""", @"""CN : Điều hòa cho oto\n9/7 : Bên xưởng TQ đang ảnh hưởng mưa bão nên chưa cập nhật được ttin sp""");
                lines[i] = Regex.Replace(lines[i], @""".*?MH406.*?""", @"""[Mã KH: MH406 - C. Hồng VPP] 4/7 : Đang chốt lại số lượng thẻ để lên đơn. Sang tuần T2 kế toán ck\n6/7 : Đã ck cọc hàng - đi hàng thẻ trước. Bút sẽ đặt sau""");
                lines[i] = Regex.Replace(lines[i], @""".*?10\/7 : Cß║ºn.*?""", @"""10/7 : Cần tư vấn nhập hàng - Zalo Đinh Chí Thiết bị điện : \n1. Bút thử điện : đi CN\n2. Đàm phán xưởng nhập hàng : Xưởng sx đèn chiếu sáng\n11/7 : Báo giá CN sp Bút thử điện""");
                lines[i] = Regex.Replace(lines[i], @""".*?CN : ─Éß╗i.*?""", @"""CN : Đợi KH xin thông tin NCC về lô hàng gạch \n10/7 : KH đang đợi NCC cập nhật ttin sp""");
                lines[i] = Regex.Replace(lines[i], @""".*?MH : 20 cuß╗Ön.*?""", @"""MH : 20 cuộn băng dính 3M. Đã báo giá\n26/6 : Liên hệ KH chưa rep\n27/6: Gđ ko liên lạc được""");
                lines[i] = Regex.Replace(lines[i], @""".*?Hß╗Åi KG : b.*?""", @"""Hỏi KG : bình dầu xanh, ... gửi sang TQ""");
                lines[i] = Regex.Replace(lines[i], @""".*?KH y├¬u cß║ºu.*?""", @"""KH yêu cầu : Hướng dẫn tạo tk app cty""");
                lines[i] = Regex.Replace(lines[i], @""".*?Dang xin sdt.*?""", @"""Đang xin sđt hỗ trợ. Đã gửi""");
                lines[i] = Regex.Replace(lines[i], @""".*?MH409.*?""", @"""[Mã KH: MH409 - Vũ Huyền] KH cũ trước đó giờ mới đặt lại : 4050 , 30k/1kg, 2% phí dv""");
                lines[i] = Regex.Replace(lines[i], @""".*?MH408.*?""", @"""[Mã KH: MH408 - Nguyễn Minh Tâm] Đặt set váy : KH lẻ 35k/1kg. 0% phí dv.""");
                lines[i] = Regex.Replace(lines[i], @""".*?Nhß║⌐n giß║íy Tiß║æu.*?""", @"""Nhận giấy Tiểu ngạch và CN\n3/7 : Đã báo giá CN. Hẹn KH sang tuần qua công ty để làm việc.\n11/7 : Hẹn lịch KH thứ 2 qua công ty trao đổi""");
                lines[i] = Regex.Replace(lines[i], @""".*?Mua hß╗Ö h.*?""", @"""Mua hộ hàng trên TMĐT. Mua máy cân da báo cước. Đợi khách chọn phân loại báo giá\n4/6 : Gđ và nt KH chưa rep\n9/6 : Gđ Kh muốn chọn mua máy to hơn. Sẽ liên hệ lại sau\n13/6: Lhe Kh hỏi thăm\n23/6: Gđ cho KH để hỗ trợ. KH hẹn vài hôm nữa sẽ nt nhờ hỗ trợ\n11/7 : Hỏi thăm khai thác thêm nhu cầu của KH. KH ko quan tâm""");
                lines[i] = Regex.Replace(lines[i], @""".*?KG : h.*?""", @"""KG : hàng lẻ và lô quần áo- Tiên Lãng HP. Đang báo giá lẻ : 30k- Lô : 26k.\n. KH phản hồi đang đi hàng Lô về HN là 20k/1kg.\n9/6 : Báo giá hàng lô 22k/1kg - Hàng lẻ: 30k\n11/6: Gđ cho KH ko nghe máy\n12/6: Đang chốt lại với KH\n13/6 : KH đợi mấy hôm nữa có đơn sẽ báo lại""");
                lines[i] = Regex.Replace(lines[i], @""".*?Nhß║¡p khß║⌐u CN.*?""", @"""Nhập khẩu CN : Cẩu cần trục - đang xin ttin check thủ tục : 83 tấn\n10/7 : đang check thủ tục line sea\n12/7 : Hẹn khách sang tuần báo lại. Minh đang liên hệ thêm lần nữa""");
                lines[i] = Regex.Replace(lines[i], @""".*?Cß╗¡a cu.*?""", @"""Cửa cuốn tại HP : KG CN bộ cửa : cần báo giá 1 bộ và 10 bộ. Đang check thủ tục và thuế phí\n5/7 : Liên hệ hỏi thăm KH. KH phản hồi giá ok. Hỏi thêm về dv TTH\n11/7 : Liên hệ lại hỏi thăm KH""");
                lines[i] = Regex.Replace(lines[i], @""".*?3\/7 :B.*?""", @"""3/7 : Báo giá CN : 8 bộ kẹp Phanh của Nga\n4/7 : Đã nt cho KH để hỏi thăm\n11/7 : Liên hệ Kh hỏi thăm về đơn hàng""");
                lines[i] = Regex.Replace(lines[i], @""".*?Hß╗Åi b.*?""", @"""Hỏi bóng quái""");
            }
        }

        File.WriteAllLines(path, lines, new UTF8Encoding(false));
        Console.WriteLine("FixRemaining130 executed successfully!");
    }
}
