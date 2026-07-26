using System;
using System.IO;
using System.Text;

class FixAllNotesFinal {
    static void Main() {
        string path = @"d:\antigravity\db.json";
        string text = File.ReadAllText(path, Encoding.UTF8);

        // Exact Clean Vietnamese Substitutions for the remaining 5 leads
        text = text.Replace("Gi\u251C\u0192\u0393\u00F2\u00F9\u252C\u00F3i thi\u251C\u0192\u0393\u00F2\u00F9\u00FAu", "Giới thiệu");
        text = text.Replace("Giß╗¢i thiß╗u", "Giới thiệu");

        text = text.Replace("CN : \u0110i\u251C\u0192\u0393\u00F2\u00F9\u251C\u255Du h\u0393\u00F6\u00A3\u0393\u00FB\u00F4a cho oto\n9/7 : B\u0393\u00F6\u00A3\u252C\u00BCn x\u0393\u00F2\u20A7\u0393\u00FB\u00E6\u251C\u0192\u0393\u00F2\u00F9\u252C\u00F3ng TQ \u0393\u00F6\u00C7\u00EAang \u251C\u0192\u0393\u00F2\u00E6\u00FAnh h\u0393\u00F2\u20A7\u0393\u00FB\u00E6\u251C\u0192\u0393\u00F2\u00F9\u255E\u00C6ng m\u0393\u00F2\u20A7\u0393\u00FB\u00E6a b\u0393\u00F6\u00A3\u00FAo n\u0393\u00F6\u00A3\u252C\u00BCn ch\u0393\u00F2\u20A7\u0393\u00FB\u00E6a c\u1EADnp nh\u1EADnt \u0393\u00F6\u00C7\u00EA\u01B0\u1EE3ngc ttin sp", "CN : Điều hòa cho oto\n9/7 : Bên xưởng TQ đang ảnh hưởng mưa bão nên chưa cập nhật được ttin sp");
        text = text.Replace("CN : Diß╗üu h├▓a cho oto\n9/7 : B├¬n x╞░ß╗¢ng TQ ─ang ß║nh h╞░ß╗ƒng m╞░a b├o n├¬n ch╞░a c?np nh?nt ─u?ngc ttin sp", "CN : Điều hòa cho oto\n9/7 : Bên xưởng TQ đang ảnh hưởng mưa bão nên chưa cập nhật được ttin sp");

        text = text.Replace("[M\u0393\u00F6\u00A3\u00FA KH: MH406 - C. H\u251C\u0192\u0393\u00F2\u00F9\u00F4ng VPP] 4/7 : \u0110ang ch\u251C\u0192\u0393\u00F2\u00F9\u00EAt l\u1EA1ii s\u251C\u0192\u0393\u00F2\u00F9\u00EA l\u01B0\u1EE3ngng th\u251C\u0192\u0393\u00F2\u00E6\u0393\u00F2\u00F9 \u0393\u00F6\u00C7\u00EA\u251C\u0192\u0393\u00F2\u00F9\u251C\u00F3 l\u0393\u00F6\u00A3\u252C\u00BCn \u0393\u00F6\u00C7\u00EA\u0393\u00F2\u20A7\u00EDn. Sang tu\u251C\u0192\u0393\u00F2\u00E6\u252C\u2551n T2 k\u251C\u0192\u0393\u00F2\u00E6\u0393\u00F6\u00C9 to\u00E1n ck\n6/7 : \u0110\u0393\u00F6\u00A3\u00FA ck c\u251C\u0192\u0393\u00F2\u00F9\u251C\u00BCc h\u00E0ng - di h\u00E0ng th\u251C\u0192\u0393\u00F2\u00E6\u0393\u00F2\u00F9 tr\u0393\u00F2\u20A7\u0393\u00FB\u00E6\u251C\u0192\u0393\u00F2\u00F9\u252C\u00F3c. B\u0393\u00F6\u00A3\u0393\u00F2\u00E6t s\u251C\u0192\u0393\u00F2\u00E6\u0393\u00F2\u00A3 \u0393\u00F6\u00C7\u00EA\u251C\u0192\u0393\u00F2\u00E6\u0393\u00F2\u00FBt sau", "[Mã KH: MH406 - C. Hồng VPP] 4/7 : Đang chốt lại số lượng thẻ để lên đơn. Sang tuần T2 kế toán ck\n6/7 : Đã ck cọc hàng - đi hàng thẻ trước. Bút sẽ đặt sau");
        text = text.Replace("[M├ KH: MH406 - C. Hß╗ng VPP] 4/7 : Dang chß╗t l?ii sß╗ lu?ngng thß║╗ ─ß╗â l├¬n ─╞n. Sang tuß║ºn T2 kß║┐ ton ck\n6/7 : D├ ck cß╗ìc hng - di hng thß║╗ tr╞░ß╗¢c. B├║t sß║╜ ─ß║╖t sau", "[Mã KH: MH406 - C. Hồng VPP] 4/7 : Đang chốt lại số lượng thẻ để lên đơn. Sang tuần T2 kế toán ck\n6/7 : Đã ck cọc hàng - đi hàng thẻ trước. Bút sẽ đặt sau");

        text = text.Replace("10/7 : C\u251C\u0192\u0393\u00F2\u00E6\u252C\u2551n t\u0393\u00F2\u20A7\u0393\u00FB\u00E6 v\u1EA5tn nh\u1EADnp h\u00E0ng - Zalo \u0110inh Ch\u0393\u00F6\u00A3\u252C\u00ED Thi\u251C\u0192\u0393\u00F2\u00E6\u0393\u00F6\u00C9t b\u251C\u0192\u0393\u00F2\u00F9\u251C\u00BB \u0393\u00F6\u00C7\u00EAi\u251C\u0192\u0393\u00F2\u00F9\u00FAn : \n1. B\u0393\u00F6\u00A3\u0393\u00F2\u00E6t th\u251C\u0192\u0393\u00F2\u00F9\u252C\u00ED \u0393\u00F6\u00C7\u00EAi\u251C\u0192\u0393\u00F2\u00F9\u00FAn : \u0393\u00F6\u00C7\u00EAi CN\n2. \u0110\u00E0m ph\u00E1n x\u0393\u00F2\u20A7\u0393\u00FB\u00E6\u251C\u0192\u0393\u00F2\u00F9\u255E\u00C6ng nh\u1EADnp h\u00E0ng : X\u0393\u00F2\u20A7\u0393\u00FB\u00E6\u251C\u0192\u0393\u00F2\u00F9\u255E\u00C6ng sx \u0393\u00F6\u00C7\u00EA\u0393\u00F6\u00A3\u252C\u2510n chi\u251C\u0192\u0393\u00F2\u00E6\u0393\u00F6\u00C9u s\u00E1ng\n11/7 : B\u00E1o gi\u00E1 CN sp B\u0393\u00F6\u00A3\u0393\u00F2\u00E6t th\u251C\u0192\u0393\u00F2\u00F9\u252C\u00ED \u0393\u00F6\u00C7\u00EAi\u251C\u0192\u0393\u00F2\u00F9\u00FAn", "10/7 : Cần tư vấn nhập hàng - Zalo Đinh Chí Thiết bị điện : \n1. Bút thử điện : đi CN\n2. Đàm phán xưởng nhập hàng : Xưởng sx đèn chiếu sáng\n11/7 : Báo giá CN sp Bút thử điện");
        text = text.Replace("10/7 : Cß║ºn t╞░ v?tn nh?np hng - Zalo Dinh Ch├¡ Thiß║┐t bß╗ï ─iß╗n : \n1. B├║t thß╗¡ ─iß╗n : ─i CN\n2. Dm phn x╞░ß╗ƒng nh?np hng : X╞░ß╗ƒng sx ─├¿n chiß║┐u sng\n11/7 : Bo gi CN sp B├║t thß╗¡ ─iß╗n", "10/7 : Cần tư vấn nhập hàng - Zalo Đinh Chí Thiết bị điện : \n1. Bút thử điện : đi CN\n2. Đàm phán xưởng nhập hàng : Xưởng sx đèn chiếu sáng\n11/7 : Báo giá CN sp Bút thử điện");

        text = text.Replace("CN : \u0393\u00F6\u00C7\u00EA\u251C\u0192\u0393\u00F2\u00F9\u00FAi KH xin th\u00F4ngng tin NCC v\u251C\u0192\u0393\u00F2\u00F9\u251C\u255D l\u00F4ng h\u00E0ng g\u1EA1ich \n10/7 : KH \u0393\u00F6\u00C7\u00EAang \u0393\u00F6\u00C7\u00EA\u251C\u0192\u0393\u00F2\u00F9\u00FAi NCC c\u1EADnp nh\u1EADnt ttin sp", "CN : Đợi KH xin thông tin NCC về lô hàng gạch \n10/7 : KH đang đợi NCC cập nhật ttin sp");
        text = text.Replace("CN : ─ß╗i KH xin thngng tin NCC vß╗ü lng hng g?ich \n10/7 : KH ─ang ─ß╗i NCC c?np nh?nt ttin sp", "CN : Đợi KH xin thông tin NCC về lô hàng gạch \n10/7 : KH đang đợi NCC cập nhật ttin sp");

        text = text.Replace("Cß║ºn t├¼m nguß╗n hng ruy b─âng decor\n15/6: Lv vß╗¢i x╞░ß╗ƒng ruy b─âng v l╞░ß╗¢i Kh gß╗¡i. B├¬n l╞░ß╗¢i gß╗¡i mß║½u free cho 2 cuß╗Ön th╞░ß╗¥ng v l╞░ß╗¢i\n16/6 : X╞░ß╗ƒng l╞░ß╗¢i ─├ gß╗¡i 2 cuß╗Ön l╞░ß╗¢i mß║½u : k├¡ch th╞░ß╗¢c bß║n rß╗Öng 52cm 10Y - 1 cuß╗Ön nß║╖ng 240-250g\n18/6 : Dß║╖t hng mß║½u 2 x╞░ß╗ƒng ruy b─âng. Dang ─ß╗i hng vß╗ü\n25/6: Hng mß║½u vß╗ü ─ß╗i kh├ch l├m ─├║ng sp cß║ºn ko", "[Mã KH: MH404 - Liên193] Cần tìm nguồn hàng ruy băng decor \n15/6 : Làm việc với xưởng ruy băng và lưới Kh gửi. Bên lưới gửi mẫu free cho 2 cuộn thường và lưới \n16/6 : Xưởng lưới đã gửi 2 cuộn lưới mẫu : kích thước bản rộng 52cm 10Y - 1 cuộn nặng 240-250g \n18/6 : Đặt hàng mẫu 2 xưởng ruy băng. Đang đợi hàng về \n25/6 : Hàng mẫu về đợi khách làm dòng sp cần ko");

        text = text.Replace("Nh├ƒΓò┬p sΓö£├¡p vu├ƒΓò├ªt tΓö£Γöéc. \nΓöÇ├yang lΓö£m t├ƒΓòΓûÆ cΓö£Γöñng b├ƒΓò├ª ├ƒΓò╞Æ VN : d├ƒΓòΓûÆ ki├ƒΓòΓöÉn 1,5 thΓö£├¡ng n├ƒΓò┬╗a m├ƒΓò┬ói xong \nSau khi xong m├ƒΓò┬ói cΓö£Γöé th├ƒΓò├ó nh├ƒΓò┬p hΓö£ng", "Nhập sáp vuốt tóc.\nĐang làm thủ tục công bố ở VN : dự kiến 1,5 tháng nữa mới xong\nSau khi xong mới có thể nhập hàng");

        File.WriteAllText(path, text, new UTF8Encoding(false));
        Console.WriteLine("FixAllNotesFinal executed successfully!");
    }
}
