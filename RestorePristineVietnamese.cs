using System;
using System.IO;
using System.Net;
using System.Text;
using System.Text.RegularExpressions;
using System.Web.Script.Serialization;
using System.Collections.Generic;

class RestorePristineVietnamese {
    static void Main() {
        Console.OutputEncoding = Encoding.UTF8;
        JavaScriptSerializer serializer = new JavaScriptSerializer();
        serializer.MaxJsonLength = int.MaxValue;

        string text9f = File.ReadAllText(@"d:\antigravity\clean_9f81073.json", Encoding.UTF8);
        Dictionary<string, object> db9f = serializer.Deserialize<Dictionary<string, object>>(text9f);
        System.Collections.ArrayList origLeads = (System.Collections.ArrayList)db9f["leads"];

        List<Dictionary<string, object>> cleanLeads = new List<Dictionary<string, object>>();

        foreach (object item in origLeads) {
            Dictionary<string, object> lead = (Dictionary<string, object>)item;
            string name = Convert.ToString(lead["name"]).Trim();
            string phone = Convert.ToString(lead["phone"]).Trim();
            string note = Convert.ToString(lead["note"]).Trim();
            string stage = Convert.ToString(lead["stage"]).Trim();

            // Clean specific lead names
            if (name.Contains("Messenger Remote")) name = "Khách Messenger Remote";
            if (name.Contains("Thuận") || name.Contains("Thuần")) name = "Phạm Thuận";
            if (name.Contains("Liên193")) name = "MH404 - Liên193";
            if (name.Contains("Dương Tóc") || name.Contains("Dương tóc") || name.Contains("Dương óc")) name = "Dương Tóc";
            if (name.Contains("Lánh")) name = "Nguyễn Lánh";
            if (name.Contains("Anh Ngọc")) name = "Phạm Thị Ánh Ngọc";
            if (name.Contains("Hương Phạm") || name.Contains("Huơng Phạm") || name.Contains("Hung hm")) name = "Hương Phạm";
            if (name.Contains("Xuân Hải")) name = "Xuân Hải Đinh";
            if (name.Contains("Hoàng Yến") || name.Contains("Hoangg Yen") || name.Contains("Hong Yến")) name = "Hoàng Yến";
            if (name.Contains("Anh Phương") || name.Contains("Anh hương")) name = "Anh Phương";
            if (name.Contains("Nhã Phương") || name.Contains("Nhã hương")) name = "Nhã Phương Bùi";
            if (name.Contains("Huyền Sky") || name.Contains("Huyun Sky")) name = "Huyền Sky";
            if (name.Contains("Nextstone")) name = "Nextstone Việt Nam";
            if (name.Contains("Koffmann")) name = "Hoàng Phát Koffmann";
            if (name.Contains("Phú Quý")) name = "Vòng bi Phú Quý";
            if (name.Contains("Quốc Khánh")) name = "Quốc Khánh";
            if (name.Contains("Minh Tâm")) name = "Minh Tâm";
            if (name.Contains("Bảo Ngọc")) name = "Bảo Ngọc Rice";
            if (name.Contains("Quang Lâm")) name = "Sơn Quang Lâm";
            if (name.Contains("Cường Biz")) name = "Hoàng Cường Biz";
            if (name.Contains("Ngọc Huyền")) name = "Vũ Ngọc Huyền";
            if (name.Contains("Trần Hiếu")) name = "Trần Hiếu";
            if (name.Contains("Hương Vũ")) name = "Hương Vũ";
            if (name.Contains("Ruby Nguyễn")) name = "Ruby Nguyễn";
            if (name.Contains("Điểm Quỳnh")) name = "Điểm Quỳnh";
            if (name.Contains("Đinh Phúc An")) name = "Đinh Phúc An";
            if (name.Contains("Thùy Dương")) name = "Hoàng Thùy Dương";
            if (name.Contains("Hồng VPP")) name = "Mai Hồng VPP";
            if (name.Contains("Minh Nguyễn")) name = "Minh Nguyễn";

            // Clean specific notes
            if (note.Contains("200kg of wood")) note = "[Tin nhan tu Fanpage]: Can I ship 200kg of wood to Saigon?";
            if (note.Contains("Mua máy") || note.Contains("TMĐT")) note = "Mua hộ hàng trên TMĐT. Mua máy cán đã báo cước. Đợi khách chọn phân loại báo giá";
            if (note.Contains("ruy băng") || note.Contains("decor")) note = "Cần tìm nguồn hàng ruy băng decor. 15/6: Lv với xưởng ruy băng và lưới Kh gửi";
            if (note.Contains("vuốt tóc") || note.Contains("công bố")) note = "Nhập sáp vuốt tóc. Đang làm tự công bố ở VN : dự kiến 1,5 tháng nữa mới xong. Sau khi xong mới có thể nhập hàng";
            if (note.Contains("băng dính 3M") || note.Contains("MH : 20")) note = "MH : 20 cuộn băng dính 3M. Đã báo giá. 26/6 : Liên hệ KH chưa rep";
            if (note.Contains("bánh đậu xanh")) note = "Hỏi KG : bánh đậu xanh, ... gửi sang TQ";
            if (note.Contains("app cty") || note.Contains("hướng dẫn")) note = "KH yêu cầu : Hướng dẫn tạo tài khoản app công ty";
            if (note.Contains("hỗ trợ") || note.Contains("Xin SĐT")) note = "Đang xin số điện thoại hỗ trợ. Đã gửi báo giá.";
            if (note.Contains("xách tay cf") || note.Contains("bột đậu xanh")) note = "Hỏi giá xách tay cf, bột đậu xanh, hạt điều từ VN sang TQ - Báo giá : 120-150k/1kg tùy số lượng";
            if (note.Contains("linh kiện") || note.Contains("Tư vấn vận")) note = "Tư vấn vận chuyển linh kiện";
            if (note.Contains("nội thất gỗ")) note = "Vc hàng nội thất gỗ : dưới 200kg. 2/7 : Đã báo giá 16k về tận nhà ở HP với hàng lô";
            if (note.Contains("Tiểu ngạch") || note.Contains("giày")) note = "Nhập giày Tiểu ngạch và CN 3/7 : Đã báo giá CN. Hẹn KH sang tuần làm việc";
            if (note.Contains("gạch") || note.Contains("thông tin NCC")) note = "CN : đợi KH xin thông tin NCC về lô hàng gạch 10/7 : KH đang đợi NCC cập nhật ttin sp";
            if (note.Contains("Xin chào shop")) note = "[Tin nhắn từ Fanpage]: Xin chào shop";

            if (stage == "quote") stage = "quotation";
            if (stage == "consulting") stage = "explore_info";
            if (stage == "khach_moi" || stage == "Khách mới" || string.IsNullOrEmpty(stage)) stage = "receive_info";

            lead["name"] = name;
            lead["phone"] = phone;
            lead["note"] = note;
            lead["stage"] = stage;

            cleanLeads.Add(lead);
        }

        db9f["leads"] = cleanLeads;
        db9f["dbVersion"] = "21.38";

        string cleanJson = serializer.Serialize(db9f);
        File.WriteAllText(@"d:\antigravity\db.json", cleanJson, new UTF8Encoding(false));
        File.WriteAllText(@"d:\antigravity\minhhai_crm_deploy\db.json", cleanJson, new UTF8Encoding(false));

        Console.WriteLine("Restored pristine clean leads count: " + cleanLeads.Count);

        // POST clean state directly to live API endpoint https://minh-hai.onrender.com/api/state
        try {
            ServicePointManager.SecurityProtocol = (SecurityProtocolType)3072;
            HttpWebRequest req = (HttpWebRequest)WebRequest.Create("https://minh-hai.onrender.com/api/state");
            req.Method = "POST";
            req.ContentType = "application/json; charset=utf-8";

            byte[] jsonBytes = Encoding.UTF8.GetBytes(cleanJson);
            req.ContentLength = jsonBytes.Length;

            using (Stream reqStream = req.GetRequestStream()) {
                reqStream.Write(jsonBytes, 0, jsonBytes.Length);
            }

            using (HttpWebResponse resp = (HttpWebResponse)req.GetResponse())
            using (StreamReader sr = new StreamReader(resp.GetResponseStream())) {
                string respText = sr.ReadToEnd();
                Console.WriteLine("Pristine API POST Response: " + respText);
            }
        } catch (Exception ex) {
            Console.WriteLine("Error posting state to API: " + ex.Message);
        }
    }
}
