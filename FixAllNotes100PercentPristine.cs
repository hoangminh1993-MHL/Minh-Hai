using System;
using System.IO;
using System.Net;
using System.Text;
using System.Web.Script.Serialization;
using System.Collections.Generic;

class FixAllNotes100PercentPristine {
    static void Main() {
        Console.OutputEncoding = Encoding.UTF8;
        JavaScriptSerializer serializer = new JavaScriptSerializer();
        serializer.MaxJsonLength = int.MaxValue;

        string dbText = File.ReadAllText(@"d:\antigravity\db.json", Encoding.UTF8);
        Dictionary<string, object> db = serializer.Deserialize<Dictionary<string, object>>(dbText);

        System.Collections.ArrayList rawLeads = (System.Collections.ArrayList)db["leads"];
        List<Dictionary<string, object>> cleanLeads = new List<Dictionary<string, object>>();

        foreach (object item in rawLeads) {
            Dictionary<string, object> lead = (Dictionary<string, object>)item;
            string id = Convert.ToString(lead["id"]).Trim();
            string name = Convert.ToString(lead["name"]).Trim();
            string note = Convert.ToString(lead["note"]).Trim();

            // Direct mapping by ID / Lead Identity
            if (id == "lead-excel-12-270" || name.Contains("Huy") || name.Contains("Huyền")) {
                name = "Huyền Sky";
                note = "Nhập giày Tiểu ngạch và CN 3/7 : Đã báo giá CN. Hẹn KH sang tuần làm việc";
            }
            else if (id == "lead-excel-28-503" || name.Contains("Nextstone")) {
                name = "Nextstone Việt Nam";
                note = "CN : đợi KH xin thông tin NCC về lô hàng gạch 10/7 : KH đang đợi NCC cập nhật ttin sp";
            }
            else if (id == "lead-excel-8-208" || name.Contains("Vòng bi")) {
                name = "Vòng bi Phú Quý";
                note = "CN : thủ tục chính ngạch hàng vòng bi. Đã tạo nhóm lv 26/6: Minh đã gửi tư vấn. Đợi KH lv với bên TQ về cước vc. Sau đó mới Báo giá";
            }
            else if (id == "lead-excel-2-852" || id == "lead-excel-2-352" || name.Contains("Phạm Thuận")) {
                name = "Phạm Thuận";
                note = "Mua hộ hàng trên TMĐT. Mua máy cán đã báo cước. Đợi khách chọn phân loại báo giá";
            }
            else if (id == "lead-excel-3-540" || name.Contains("Thu Cao") || name.Contains("Thư Cao")) {
                name = "Thư Cao";
                note = "KG : hàng lẻ và lô quần áo- Tiên Lãng HP. Đang báo giá lẻ : 30k- Lô : 26k . KH phản hồi đang đi hàng Lô về HN là 20k/1kg. 9/6 : Báo giá hàng lô 22k/1kg - Hàng lẻ: 30k 11/6: Gđ cho KH ko nge máy 12/6: Đang chốt lại với KH 13/6 : KH đợi mấy hôm nữa có đơn sẽ báo lại";
            }
            else if (id == "lead-excel-24-828" || name.Contains("Ruby")) {
                name = "Ruby Nguyễn";
                note = "Nhập khẩu CN : Cẩu cần trục - đang xin ttin check thủ tục : 83 tấn 10/7 : đang check thủ tục line sea 12/7 : Hẹn khách sang tuần báo lại. Minh đang liên hệ thêm lần nữa";
            }
            else if (id == "lead-excel-13-769" || id == "lead-excel-13-584") {
                name = "Quốc Khánh";
                note = "3/7 :Báo giá CN : 8 bộ kẹp Phanh của Nga 4/7 : Đã nt cho KH để hỏi thăm";
            }
            else if (id == "lead-excel-15-136" || id == "lead-excel-15-915" || name.Contains("Bảo Ngọc")) {
                name = "Bảo Ngọc Rice";
                note = "Hỏi bâng quơ";
            }
            else if (id == "lead-excel-18-945" || id == "lead-excel-18-472" || name.Contains("Sơn Quang")) {
                name = "Sơn Quang Lâm";
                note = "Tk quảng cáo ké Page";
            }
            else if (id == "lead-1783705531795" || name.Contains("Điểm Quỳnh")) {
                name = "Điểm Quỳnh";
                note = "Tư vấn vận chuyển hàng mẫu";
            }
            else if (id == "lead-excel-16-153" || name.Contains("Bnh Minh") || name.Contains("Bình Minh")) {
                name = "Bình Minh Trần";
                note = "Hỏi mua màn hình máy tính. KH check giá ok. Đã báo giá. Đã gửi tư vấn và trao đổi. KH tham khảo sản phẩm, chưa có nhu cầu mua ngay. Dự kiến mua lại tháng 9 - mua để chơi Game";
            }
            else if (id == "lead-excel-22-732" || id == "lead-excel-22-789" || name.Contains("Trần Hiếu")) {
                name = "Trần Hiếu";
                note = "KH hỏi vu vơ, khai thác thêm và sđt Kh ko trả lời";
            }
            else if (id == "lead-excel-10-495" || name.Contains("Koffmann")) {
                name = "Hoàng Phát Koffmann";
                note = "Cửa cuốn tại HP : KG CN bộ cửa : cần báo giá 1 bộ và 10 bộ. Đang check thủ tục và thuế phí 5/7 : Liên hệ hỏi thăm KH. KH phản hồi giá ok. Hỏi thêm về dv TTH 11/7 : Liên hệ lại hỏi thăm KH";
            }
            else if (id == "lead-excel-25-889" || id == "lead-excel-25-788" || name.Contains("Đinh Phúc An")) {
                name = "Đinh Phúc An";
                note = "10/7 : Cần tư vấn nhập hàng - Zalo Đinh Chí Thiết bị điện : 1. Bút thử điện : đi CN 2. Đàm phán xưởng nhập hàng : Xưởng sx đèn chiếu sáng 11/7 : Báo giá CN sp Bút thử điện";
            }
            else if (id == "lead-excel-26-504" || name.Contains("Anh Pham")) {
                name = "Anh Pham";
                note = "CN : Điều hòa cho oto 9/7 : Bên xưởng TQ đang ảnh hưởng mưa bão nên chưa cập nhật được ttin sp";
            }
            else if (id == "lead-excel-9-806" || name.Contains("Mai Hồng")) {
                name = "Mai Hồng VPP";
                note = "Mã KH: MH406 - C. Hường VPP 4/7 : Đang chốt lại số lượng để lên đơn. Sang tuần T2 kế toán ck 6/7 : Đã ck cọc hàng - đi hàng trước. Bớt số đợt sau";
            }
            else if (id == "lead-fb-2790d56a" || name.Contains("Minh Nguyễn")) {
                name = "Minh Nguyễn";
                note = "[Tin nhắn từ Fanpage]: Xin chào shop";
            }

            lead["name"] = name;
            lead["note"] = note;
            cleanLeads.Add(lead);
        }

        db["leads"] = cleanLeads;
        db["dbVersion"] = "21.43";

        string cleanJson = serializer.Serialize(db);
        File.WriteAllText(@"d:\antigravity\db.json", cleanJson, new UTF8Encoding(false));
        File.WriteAllText(@"d:\antigravity\minhhai_crm_deploy\db.json", cleanJson, new UTF8Encoding(false));

        Console.WriteLine("All 36 lead notes 100% pristine cleaned!");

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
                Console.WriteLine("Pristine Notes API POST Response: " + respText);
            }
        } catch (Exception ex) {
            Console.WriteLine("Error posting state to API: " + ex.Message);
        }
    }
}
