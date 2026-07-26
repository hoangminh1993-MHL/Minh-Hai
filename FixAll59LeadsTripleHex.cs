using System;
using System.IO;
using System.Text;
using System.Text.RegularExpressions;

class FixAll59LeadsTripleHex {
    static void Main() {
        string path = @"d:\antigravity\db.json";
        string text = File.ReadAllText(path, Encoding.UTF8);

        // MH404 - Liên193
        text = Regex.Replace(text, @"""note"":\s*""C[\s\S]*?ruy[\s\S]*?ko""", @"""note"": ""[Mã KH: MH404 - Liên193] Cần tìm nguồn hàng ruy băng decor \n15/6 : Làm việc với xưởng ruy băng và lưới Kh gửi. Bên lưới gửi mẫu free cho 2 cuộn thường và lưới \n16/6 : Xưởng lưới đã gửi 2 cuộn lưới mẫu : kích thước bản rộng 52cm 10Y - 1 cuộn nặng 240-250g \n18/6 : Đặt hàng mẫu 2 xưởng ruy băng. Đang đợi hàng về \n25/6 : Hàng mẫu về đợi khách làm dòng sp cần ko""");

        // Đinh Phúc An
        text = Regex.Replace(text, @"""note"":\s*""10\/7[\s\S]*?Bút thử điện""", @"""note"": ""10/7 : Cần tư vấn nhập hàng - Zalo Đinh Chí Thiết bị điện : \n1. Bút thử điện : đi CN\n2. Đàm phán xưởng nhập hàng : Xưởng sx đèn chiếu sáng\n11/7 : Báo giá CN sp Bút thử điện""");

        // Dương Tóc
        text = Regex.Replace(text, @"""note"":\s*""Nhập sáp[\s\S]*?nhập hàng""", @"""note"": ""Nhập sáp vuốt tóc.\nĐang làm thủ tục công bố ở VN : dự kiến 1,5 tháng nữa mới xong\nSau khi xong mới có thể nhập hàng""");
        text = Regex.Replace(text, @"""note"":\s*""Nh[\s\S]*?sáp[\s\S]*?hàng""", @"""note"": ""Nhập sáp vuốt tóc.\nĐang làm thủ tục công bố ở VN : dự kiến 1,5 tháng nữa mới xong\nSau khi xong mới có thể nhập hàng""");

        // Huơng Phạm
        text = Regex.Replace(text, @"""note"":\s*""KH y[\s\S]*?app cty""", @"""note"": ""KH yêu cầu : Hướng dẫn tạo tk app cty""");

        // Xuân Hải Đinh
        text = Regex.Replace(text, @"""note"":\s*""Đang xin[\s\S]*?Đã gửi""", @"""note"": ""Đang xin sđt hỗ trợ. Đã gửi""");
        text = Regex.Replace(text, @"""note"":\s*""[\s\S]*?ang xin s[\s\S]*?gửi""", @"""note"": ""Đang xin sđt hỗ trợ. Đã gửi""");

        // C. Hồng VPP
        text = Regex.Replace(text, @"""note"":\s*""4\/7[\s\S]*?đặt sau""", @"""note"": ""[Mã KH: MH406 - C. Hồng VPP] 4/7 : Đang chốt lại số lượng thẻ để lên đơn. Sang tuần T2 kế toán ck\n6/7 : Đã ck cọc hàng - đi hàng thẻ trước. Bút sẽ đặt sau""");
        text = Regex.Replace(text, @"""note"":\s*""\[M[\s\S]*?MH406[\s\S]*?đặt sau""", @"""note"": ""[Mã KH: MH406 - C. Hồng VPP] 4/7 : Đang chốt lại số lượng thẻ để lên đơn. Sang tuần T2 kế toán ck\n6/7 : Đã ck cọc hàng - đi hàng thẻ trước. Bút sẽ đặt sau""");

        // Gạch
        text = Regex.Replace(text, @"""note"":\s*""CN : Đợi[\s\S]*?ttin sp""", @"""note"": ""CN : Đợi KH xin thông tin NCC về lô hàng gạch \n10/7 : KH đang đợi NCC cập nhật ttin sp""");
        text = Regex.Replace(text, @"""note"":\s*""CN : [\s\S]*?oi KH[\s\S]*?ttin sp""", @"""note"": ""CN : Đợi KH xin thông tin NCC về lô hàng gạch \n10/7 : KH đang đợi NCC cập nhật ttin sp""");

        // Vũ Huyền
        text = Regex.Replace(text, @"""note"":\s*""\[M[\s\S]*?MH409[\s\S]*?phí dv""", @"""note"": ""[Mã KH: MH409 - Vũ Huyền] KH cũ trước đó giờ mới đặt lại : 4050 , 30k/1kg, 2% phí dv""");

        // Nguyễn Minh Tâm
        text = Regex.Replace(text, @"""note"":\s*""\[M[\s\S]*?MH408[\s\S]*?phí dv\.""", @"""note"": ""[Mã KH: MH408 - Nguyễn Minh Tâm] Đặt set váy : KH lẻ 35k/1kg. 0% phí dv.""");

        // Tiêu ngạch
        text = Regex.Replace(text, @"""note"":\s*""Nhận giấy[\s\S]*?trao đổi""", @"""note"": ""Nhận giấy Tiểu ngạch và CN\n3/7 : Đã báo giá CN. Hẹn KH sang tuần qua công ty để làm việc.\n11/7 : Hẹn lịch KH thứ 2 qua công ty trao đổi""");

        // Mua hộ
        text = Regex.Replace(text, @"""note"":\s*""Mua hộ[\s\S]*?quan tâm""", @"""note"": ""Mua hộ hàng trên TMĐT. Mua máy cân da báo cước. Đợi khách chọn phân loại báo giá\n4/6 : Gđ và nt KH chưa rep\n9/6 : Gđ Kh muốn chọn mua máy to hơn. Sẽ liên hệ lại sau\n13/6: Lhe Kh hỏi thăm\n23/6: Gđ cho KH để hỗ trợ. KH hẹn vài hôm nữa sẽ nt nhờ hỗ trợ\n11/7 : Hỏi thăm khai thác thêm nhu cầu của KH. KH ko quan tâm""");

        // Hàng lẻ Tiên Lãng
        text = Regex.Replace(text, @"""note"":\s*""KG : hàng lẻ[\s\S]*?báo lại""", @"""note"": ""KG : hàng lẻ và lô quần áo- Tiên Lãng HP. Đang báo giá lẻ : 30k- Lô : 26k.\n. KH phản hồi đang đi hàng Lô về HN là 20k/1kg.\n9/6 : Báo giá hàng lô 22k/1kg - Hàng lẻ: 30k\n11/6: Gđ cho KH ko nghe máy\n12/6: Đang chốt lại với KH\n13/6 : KH đợi mấy hôm nữa có đơn sẽ báo lại""");

        // Cẩu cần trục
        text = Regex.Replace(text, @"""note"":\s*""Nhập khẩu CN[\s\S]*?lần nữa""", @"""note"": ""Nhập khẩu CN : Cẩu cần trục - đang xin ttin check thủ tục : 83 tấn\n10/7 : đang check thủ tục line sea\n12/7 : Hẹn khách sang tuần báo lại. Minh đang liên hệ thêm lần nữa""");

        // Cửa cuốn
        text = Regex.Replace(text, @"""note"":\s*""Cửa cuốn[\s\S]*?hỏi thăm KH""", @"""note"": ""Cửa cuốn tại HP : KG CN bộ cửa : cần báo giá 1 bộ và 10 bộ. Đang check thủ tục và thuế phí\n5/7 : Liên hệ hỏi thăm KH. KH phản hồi giá ok. Hỏi thêm về dv TTH\n11/7 : Liên hệ lại hỏi thăm KH""");

        // Phanh Nga
        text = Regex.Replace(text, @"""note"":\s*""3\/7 : Báo giá[\s\S]*?đơn hàng""", @"""note"": ""3/7 : Báo giá CN : 8 bộ kẹp Phanh của Nga\n4/7 : Đã nt cho KH để hỏi thăm\n11/7 : Liên hệ Kh hỏi thăm về đơn hàng""");

        File.WriteAllText(path, text, new UTF8Encoding(false));
        Console.WriteLine("FixAll59LeadsTripleHex executed successfully!");
    }
}
