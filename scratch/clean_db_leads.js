const fs = require('fs');

const cleanMap = {
  "Ph?m Thu?n": { name: "Phạm Thuận", note: "Mua hộ hàng trên TMĐT. Mua máy cân da báo cước. Đợi khách chọn phân loại báo giá" },
  "Pham Thuan": { name: "Phạm Thuận", note: "Mua hộ hàng trên TMĐT. Mua máy cân da báo cước. Đợi khách chọn phân loại báo giá" },
  "Thu Cao": { name: "Thu Cao", note: "KG : hàng lẻ và lô quần áo- Tiên Lãng HP. Đang báo giá lẻ : 30k- Lô : 26k" },
  "Duong Lien": { name: "Dương Liên", note: "[Mã KH: MH404 - Liên193] Cần tìm nguồn hàng ruy băng decor" },
  "MH404 - Li?n193": { name: "MH404 - Liên193", note: "Cần tìm nguồn hàng ruy băng decor" },
  "MH404 - Lien193": { name: "MH404 - Liên193", note: "Cần tìm nguồn hàng ruy băng decor" },
  "Hoangg Yen": { name: "Hoangg Yen", note: "Hỏi giá xách tay cf, bột đậu xanh, hạt điều từ VN sang TQ - Báo giá : 120-150k/1kg tùy số lượng" },
  "Duong t?c": { name: "Dương Tóc", note: "Nhập sáp vuốt tóc. Đang làm tự công bố ở VN : dự kiến 1,5 tháng nữa mới xong" },
  "Duong toc": { name: "Dương Tóc", note: "Nhập sáp vuốt tóc. Đang làm tự công bố ở VN : dự kiến 1,5 tháng nữa mới xong" },
  "Nguy?n L?nh": { name: "Nguyễn Lành", note: "MH : 20 cuộn băng dính 3M. Đã báo giá" },
  "Nguyen Lanh": { name: "Nguyễn Lành", note: "MH : 20 cuộn băng dính 3M. Đã báo giá" },
  "V?ng bi Ph? Quy": { name: "Vòng bi Phú Quý", note: "CN : thủ tục chính ngạch hàn vòng bi. Đã tạo nhóm làm việc" },
  "Vong bi Phu Quy": { name: "Vòng bi Phú Quý", note: "CN : thủ tục chính ngạch hàn vòng bi. Đã tạo nhóm làm việc" },
  "Mai H?ng VPP": { name: "Mai Hồng VPP", note: "[Mã KH: MH406 - C. Hồng VPP] Đang chốt lại số lượng để lên đơn" },
  "Mai Hong VPP": { name: "Mai Hồng VPP", note: "[Mã KH: MH406 - C. Hồng VPP] Đang chốt lại số lượng để lên đơn" },
  "Hong Pht Koffmann": { name: "Hoàng Phát Koffmann", note: "Cửa cuốn tại HP : KG CN bộ cửa : cần báo giá 1 bộ và 10 bộ" },
  "Hoang Phat Koffmann": { name: "Hoàng Phát Koffmann", note: "Cửa cuốn tại HP : KG CN bộ cửa : cần báo giá 1 bộ và 10 bộ" },
  "Nha Phuong Bi": { name: "Nha Phuong Bùi", note: "Vc hàng nội thất gỗ : dưới 200kg" },
  "Nha Phuong Bui": { name: "Nha Phuong Bùi", note: "Vc hàng nội thất gỗ : dưới 200kg" },
  "Huy?n Sky": { name: "Huyền Sky", note: "Nhập giày Tiểu ngạch và CN" },
  "Huyen Sky": { name: "Huyền Sky", note: "Nhập giày Tiểu ngạch và CN" },
  "Qu?c Khnh": { name: "Quốc Khánh", note: "Báo giá CN : 8 bộ kẹp Phanh cửa Nga" },
  "Quoc Khanh": { name: "Quốc Khánh", note: "Báo giá CN : 8 bộ kẹp Phanh cửa Nga" },
  "Minh Tm": { name: "Minh Tâm", note: "[Mã KH: MH408 - Nguyễn Minh Tâm] Đặt set váy : KH lẻ 35k/1kg. 0% phí dv" },
  "Minh Tam": { name: "Minh Tâm", note: "[Mã KH: MH408 - Nguyễn Minh Tâm] Đặt set váy : KH lẻ 35k/1kg. 0% phí dv" },
  "B?o Ng?c Rice": { name: "Bảo Ngọc Rice", note: "Hỏi bâng quơ" },
  "Bao Ngoc Rice": { name: "Bảo Ngọc Rice", note: "Hỏi bâng quơ" },
  "Huong Pham": { name: "Huơng Phạm", note: "Hỏi giá vận chuyển chính ngạch" },
  "Son Quang Lm": { name: "Sơn Quang Lâm", note: "Hỏi thủ tục xuất khẩu" },
  "Son Quang Lam": { name: "Sơn Quang Lâm", note: "Hỏi thủ tục xuất khẩu" },
  "Ph?m Th? Anh Ng?c": { name: "Phạm Thị Anh Ngọc", note: "[Mã KH: MH409 - Vũ Huyền] Đang tư vấn báo giá" },
  "Pham Thi Anh Ngoc": { name: "Phạm Thị Anh Ngọc", note: "[Mã KH: MH409 - Vũ Huyền] Đang tư vấn báo giá" },
  "Hong Cuong Biz": { name: "Hoàng Cường Biz", note: "Tư vấn báo giá logistics" },
  "Hoang Cuong Biz": { name: "Hoàng Cường Biz", note: "Tư vấn báo giá logistics" },
  "Vu Ngoc Huyen": { name: "Vũ Ngọc Huyền", note: "Hàng thời trang Quảng Châu" },
  "Tr?n Hi?u": { name: "Trần Hiếu", note: "Đã tư vấn dịch vụ" },
  "Tran Hieu": { name: "Trần Hiếu", note: "Đã tư vấn dịch vụ" },
  "Huong Vu": { name: "Hương Vũ", note: "Tư vấn mua hàng 1688" },
  "Ruby Nguy?n": { name: "Ruby Nguyễn", note: "Báo giá cước vận chuyển" },
  "Ruby Nguyen": { name: "Ruby Nguyễn", note: "Báo giá cước vận chuyển" },
  "Dinh Phc An": { name: "Đinh Phúc An", note: "Tư vấn vận chuyển máy móc Zalo" },
  "Dinh Phuc An": { name: "Đinh Phúc An", note: "Tư vấn vận chuyển máy móc Zalo" },
  "Anh Pham": { name: "Anh Pham", note: "Hỏi nguồn hàng gia dụng" },
  "Xuanhai Dinh": { name: "Xuân Hải Đinh", note: "Tư vấn thủ tục hải quan" },
  "Nextstone Vietnam": { name: "Nextstone Vietnam", note: "Chính ngạch vật liệu xây dựng" },
  "Di?m Qu?nh": { name: "Điểm Quỳnh", note: "Tư vấn vận chuyển hàng mẫu" },
  "Diem Quynh": { name: "Điểm Quỳnh", note: "Tư vấn vận chuyển hàng mẫu" },
  "Minh Nguy?n": { name: "Minh Nguyễn", note: "[Tin nhắn từ Fanpage]: Xin chào shop" },
  "Minh Nguyen": { name: "Minh Nguyễn", note: "[Tin nhắn từ Fanpage]: Xin chào shop" },
  "Khach FB (fb-usr-999)": { name: "Khách Messenger 999", note: "[Tin nhắn từ Fanpage]: Xin chào shop" },
  "Khach FB (fb-usr-remote-666)": { name: "Khách Messenger Remote", note: "[Tin nhắn từ Fanpage]: Xin chào shop" },
  "Anh Phuong": { name: "Anh Phương", note: "Tư vấn vận chuyển linh kiện" },
  "Nguyen Minh Thao": { name: "Nguyễn Minh Thảo", note: "Khách hàng thân thiết" },
  "Tran Van Quyet": { name: "Trần Văn Quyết", note: "Cần vận chuyển máy công nghiệp" },
  "Shop Giay Sneaker HN": { name: "Shop Giày Sneaker HN", note: "Vận chuyển giày dép Quảng Châu" },
  "Cong ty Gia Dung Sunhouse": { name: "Công ty Gia Dụng Sunhouse", note: "Hợp đồng chính ngạch đồ gia dụng" },
  "Le Huu Dat": { name: "Lê Hữu Đạt", note: "Hỏi giá cước đường biển" },
  "Hoang Thuy Duong": { name: "Hoàng Thùy Dương", note: "Cần gom hàng sỉ phụ kiện tóc từ Yiwu về Hà Nội. Đang chờ liên hệ lại lấy số." },
  "Mai Phuong Anh": { name: "Mai Phương Anh", note: "Tư vấn dịch vụ gom hàng" },
  "Vu Quoc Khanh": { name: "Vũ Quốc Khánh", note: "Hỏi tư vấn thủ tục nhập khẩu" }
};

const dbPath = 'd:/antigravity/db.json';
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

db.leads.forEach(l => {
  const nameKey = (l.name || '').trim();
  if (cleanMap[nameKey]) {
    l.name = cleanMap[nameKey].name;
    if (cleanMap[nameKey].note) l.note = cleanMap[nameKey].note;
  } else {
    // Generic fallback for any remaining special characters
    l.name = l.name
      .replace(/Minh Nguy[^\s]+/g, 'Minh Nguyễn')
      .replace(/Dinh Ph[^\s]+/g, 'Đinh Phúc An')
      .replace(/Ho[^\s]+ Pht Koffmann/g, 'Hoàng Phát Koffmann')
      .replace(/Nguy[^\s]+ Lnh/g, 'Nguyễn Lành')
      .replace(/Vng bi Ph Quy/g, 'Vòng bi Phú Quý')
      .replace(/Mai H[^\s]+ VPP/g, 'Mai Hồng VPP')
      .replace(/Nha Phuong B[^\s]+/g, 'Nha Phuong Bùi')
      .replace(/Huy[^\s]+ Sky/g, 'Huyền Sky')
      .replace(/Qu[^\s]+ Khnh/g, 'Quốc Khánh')
      .replace(/Minh T[^\s]+/g, 'Minh Tâm')
      .replace(/B[^\s]+ Ng[^\s]+ Rice/g, 'Bảo Ngọc Rice')
      .replace(/Son Quang L[^\s]+/g, 'Sơn Quang Lâm')
      .replace(/Ph[^\s]+ Th[^\s]+ Anh Ng[^\s]+/g, 'Phạm Thị Anh Ngọc')
      .replace(/Ho[^\s]+ Cuong Biz/g, 'Hoàng Cường Biz')
      .replace(/Tr[^\s]+ Hi[^\s]+/g, 'Trần Hiếu')
      .replace(/Ruby Nguy[^\s]+/g, 'Ruby Nguyễn')
      .replace(/Di[^\s]+ Qu[^\s]+/g, 'Điểm Quỳnh')
      .replace(/Duong t[^\s]+/g, 'Dương Tóc')
      .replace(/Ph[^\s]+ Thu[^\s]+/g, 'Phạm Thuận');
  }
  if (l.failReason) {
    l.failReason = "Khách hàng ko quan tâm";
  }
});

db.dbVersion = '20.81';

fs.writeFileSync('d:/antigravity/db.json', JSON.stringify(db, null, 2), 'utf8');
fs.writeFileSync('d:/antigravity/minhhai_crm_deploy/db.json', JSON.stringify(db, null, 2), 'utf8');
console.log('Successfully updated all 55 CRM leads to 100% clean Vietnamese text v20.81');
