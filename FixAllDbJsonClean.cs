using System;
using System.IO;
using System.Text;
using System.Text.RegularExpressions;

class FixAllDbJsonClean {
    static void Main() {
        string path = @"d:\antigravity\db.json";
        string text = File.ReadAllText(path, Encoding.UTF8);

        // Replace all remaining CP437 substrings in db.json text
        text = Regex.Replace(text, @"Cß║ºn t├¼m nguß╗ôn[\s\S]*?ko", "[Mã KH: MH404 - Liên193] Cần tìm nguồn hàng ruy băng decor \\n15/6 : Làm việc với xưởng ruy băng và lưới Kh gửi. Bên lưới gửi mẫu free cho 2 cuộn thường và lưới \\n16/6 : Xưởng lưới đã gửi 2 cuộn lưới mẫu : kích thước bản rộng 52cm 10Y - 1 cuộn nặng 240-250g \\n18/6 : Đặt hàng mẫu 2 xưởng ruy băng. Đang đợi hàng về \\n25/6 : Hàng mẫu về đợi khách làm dòng sp cần ko");
        text = Regex.Replace(text, @"Nh├ƒΓò[\s\S]*?hΓö£ng", "Nhập sáp vuốt tóc.\\nĐang làm thủ tục công bố ở VN : dự kiến 1,5 tháng nữa mới xong\\nSau khi xong mới có thể nhập hàng");
        text = Regex.Replace(text, @"CN : \u0110i[\s\S]*?ttin sp", "CN : Điều hòa cho oto\\n9/7 : Bên xưởng TQ đang ảnh hưởng mưa bão nên chưa cập nhật được ttin sp");
        text = Regex.Replace(text, @"\[M├\u00C2 KH: MH406[\s\S]*?đặt sau", "[Mã KH: MH406 - C. Hồng VPP] 4/7 : Đang chốt lại số lượng thẻ để lên đơn. Sang tuần T2 kế toán ck\\n6/7 : Đã ck cọc hàng - đi hàng thẻ trước. Bút sẽ đặt sau");
        text = Regex.Replace(text, @"10\/7 : Cß║ºn t╞░[\s\S]*?B├║t thß╗¡ ─iß╗n", "10/7 : Cần tư vấn nhập hàng - Zalo Đinh Chí Thiết bị điện : \\n1. Bút thử điện : đi CN\\n2. Đàm phán xưởng nhập hàng : Xưởng sx đèn chiếu sáng\\n11/7 : Báo giá CN sp Bút thử điện");
        text = Regex.Replace(text, @"CN : ─Éß╗i KH[\s\S]*?ttin sp", "CN : Đợi KH xin thông tin NCC về lô hàng gạch \\n10/7 : KH đang đợi NCC cập nhật ttin sp");
        text = Regex.Replace(text, @"MH : 20 cuß╗Ön[\s\S]*?dc", "MH : 20 cuộn băng dính 3M. Đã báo giá\\n26/6 : Liên hệ KH chưa rep\\n27/6: Gđ ko liên lạc được");
        text = Regex.Replace(text, @"Hß╗Åi KG : b[\s\S]*?TQ", "Hỏi KG : bình dầu xanh, ... gửi sang TQ");
        text = Regex.Replace(text, @"KH y├¬u cß║ºu[\s\S]*?cty", "KH yêu cầu : Hướng dẫn tạo tk app cty");
        text = Regex.Replace(text, @"Dang xin sdt[\s\S]*?gß╗¡i", "Đang xin sđt hỗ trợ. Đã gửi");
        text = Regex.Replace(text, @"\[M├\u00C2 KH: MH409[\s\S]*?ph├¡ dv", "[Mã KH: MH409 - Vũ Huyền] KH cũ trước đó giờ mới đặt lại : 4050 , 30k/1kg, 2% phí dv");
        text = Regex.Replace(text, @"\[M├\u00C2 KH: MH408[\s\S]*?ph├¡ dv\.", "[Mã KH: MH408 - Nguyễn Minh Tâm] Đặt set váy : KH lẻ 35k/1kg. 0% phí dv.");
        text = Regex.Replace(text, @"Nhß║⌐n giß║íy Tiß║æu[\s\S]*?trao dß╗òi", "Nhận giấy Tiểu ngạch và CN\\n3/7 : Đã báo giá CN. Hẹn KH sang tuần qua công ty để làm việc.\\n11/7 : Hẹn lịch KH thứ 2 qua công ty trao đổi");
        text = Regex.Replace(text, @"Mua hß╗Ö h[\s\S]*?quan t├óm", "Mua hộ hàng trên TMĐT. Mua máy cân da báo cước. Đợi khách chọn phân loại báo giá\\n4/6 : Gđ và nt KH chưa rep\\n9/6 : Gđ Kh muốn chọn mua máy to hơn. Sẽ liên hệ lại sau\\n13/6: Lhe Kh hỏi thăm\\n23/6: Gđ cho KH để hỗ trợ. KH hẹn vài hôm nữa sẽ nt nhờ hỗ trợ\\n11/7 : Hỏi thăm khai thác thêm nhu cầu của KH. KH ko quan tâm");
        text = Regex.Replace(text, @"KG : h[\s\S]*?b[\s\S]*?o l[\s\S]*?i", "KG : hàng lẻ và lô quần áo- Tiên Lãng HP. Đang báo giá lẻ : 30k- Lô : 26k.\\n. KH phản hồi đang đi hàng Lô về HN là 20k/1kg.\\n9/6 : Báo giá hàng lô 22k/1kg - Hàng lẻ: 30k\\n11/6: Gđ cho KH ko nghe máy\\n12/6: Đang chốt lại với KH\\n13/6 : KH đợi mấy hôm nữa có đơn sẽ báo lại");
        text = Regex.Replace(text, @"Nhß║¡p khß║⌐u CN : Cß║⌐u[\s\S]*?nß╗»a", "Nhập khẩu CN : Cẩu cần trục - đang xin ttin check thủ tục : 83 tấn\\n10/7 : đang check thủ tục line sea\\n12/7 : Hẹn khách sang tuần báo lại. Minh đang liên hệ thêm lần nữa");
        text = Regex.Replace(text, @"Cß╗¡a cu[\s\S]*?hß╗Åi th─âm KH", "Cửa cuốn tại HP : KG CN bộ cửa : cần báo giá 1 bộ và 10 bộ. Đang check thủ tục và thuế phí\\n5/7 : Liên hệ hỏi thăm KH. KH phản hồi giá ok. Hỏi thêm về dv TTH\\n11/7 : Liên hệ lại hỏi thăm KH");
        text = Regex.Replace(text, @"3\/7 :B[\s\S]*?o gi[\s\S]*? CN : 8 bß╗Ö[\s\S]*?d[\s\S]*?n h[\s\S]*?ng", "3/7 : Báo giá CN : 8 bộ kẹp Phanh của Nga\\n4/7 : Đã nt cho KH để hỏi thăm\\n11/7 : Liên hệ Kh hỏi thăm về đơn hàng");
        text = Regex.Replace(text, @"Hß╗Åi b[\s\S]*?ng qu[\s\S]*?i", "Hỏi bóng quái");

        File.WriteAllText(path, text, new UTF8Encoding(false));
        Console.WriteLine("FixAllDbJsonClean executed successfully!");
    }
}
