// ==================== CRM CONTROLLERS & RENDERERS ==================== //
document.addEventListener('DOMContentLoaded', () => {
  initCRMEvents();
});

let draggingLeadId = null; // Backup reference for touch devices or simple drag tracking
let failPromptCallback = null; // Callback for confirm button on fail modal

function getCurrentUser() {
  try {
    const sessionUser = JSON.parse(localStorage.getItem('minhhai_user') || '{}');
    if (sessionUser && sessionUser.id) return sessionUser;
  } catch (e) {}
  if (typeof AppState !== 'undefined' && AppState.users) {
    const u = AppState.users.find(x => x.id === AppState.currentUserId);
    if (u) return u;
  }
  return { id: 'usr-1', name: 'Nguyễn Hoàng Minh', role: 'admin', username: 'hoangminh' };
}

function cleanVietnameseText(text) {
  if (!text || typeof text !== 'string') return text || '';
  let s = text.trim();
  s = s.replace(/C├fần tà┴╝m ngu├fuoồn haáng ruy bΓöÇóing decor 15\/6: Lv với\.\.\./g, 'Cần tìm nguồn hàng ruy băng decor. 15/6: Lv với xưởng ruy băng và lưới Kh gửi')
       .replace(/C├fần tà┴╝m ngu├fuoồn haáng ruy bΓöÇóing decor/g, 'Cần tìm nguồn hàng ruy băng decor')
       .replace(/Nhà ╞Æô║║ ║ªΓö¼íp s║ô║║H║║túåtíp vuà ╞Æô║║ ║ªùa┬¬t t ô║║H║║túô║║H║║r-\.\.\.\./g, 'Nhập sáp vuốt tóc. Đang làm tự công bố ở VN : dự kiến 1,5 tháng nữa mới xong. Sau khi xong mới có thể nhập hàng')
       .replace(/Nhà ╞Æô║║ ║ª[\s\S]*?/g, 'Nhập sáp vuốt tóc. Đang làm tự công bố ở VN')
       .replace(/Hu├íng Phạm/g, 'Hương Phạm').replace(/Hu├íng Phạ/g, 'Hương Phạm').replace(/Hu ├íng Phạm/g, 'Hương Phạm').replace(/Hu ├íng Phạ/g, 'Hương Phạm')
       .replace(/KH yà┬¼u c├fẩu : HΓòPtΓûæờng d├fòæ┴╝n tạo tk app cty/g, 'KH yêu cầu : Hướng dẫn tạo tài khoản app công ty')
       .replace(/KH yà┬¼u c├fẩu : HΓòPt[\s\S]*?/g, 'KH yêu cầu : Hướng dẫn tạo tài khoản app công ty')
       .replace(/ΓöÇ├ëang xin sΓöÇÖc h├fÒùu triệu\. ΓöÇ├ëang g├fÒù┬íi/g, 'Đang xin số điện thoại hỗ trợ. Đã gửi báo giá.')
       .replace(/ΓöÇ├ëang xin sΓöÇÖc[\s\S]*?/g, 'Đang xin số điện thoại hỗ trợ.')
       .replace(/\[Tin nhß║»n tß╗½ Fanpage\]:/g, '[Tin nhắn từ Fanpage]:')
       .replace(/Huyun Sky/g, 'Huyền Sky')
       .replace(/Nhập giày Ti├fÒùu ngạch và CN 3\/7 : ΓöÇ├ëá báo giá CN\. H├fÒùe\.\.\./g, 'Nhập giày Tiểu ngạch và CN 3/7 : Đã báo giá CN. Hẹn KH sang tuần làm việc')
       .replace(/Nhập giày Ti├fÒùu ngạch/g, 'Nhập giày Tiểu ngạch')
       .replace(/Nextstone Vietnam/g, 'Nextstone Việt Nam')
       .replace(/CN : đợi KH xin thông tin NCC về lô hàng gạch 10\/7 : KH đang đợi NCC cập nhật tti\.\.\./g, 'CN : đợi KH xin thông tin NCC về lô hàng gạch 10/7 : KH đang đợi NCC cập nhật tti...')
       .replace(/\u0393\u00F2\u00E6\u252C\u2551/g, 'ầ')
       .replace(/\u0393\u00F6\u00A3\u252C\u00B1/g, 'ầ')
       .replace(/\u0393\u00F6\u00A3\u252C\u00B1/g, 'ầ')
       .replace(/\u0393\u00F2\u00F9\u00F4/g, 'uồ')
       .replace(/\u0393\u00F6\u00A3/g, 'à')
       .replace(/\u0393\u00F6\u00C7\u00EA/g, 'Đ')
       .replace(/\u0393\u00F2Pt\u0393\u00FB\u00E6/g, ' tư')
       .replace(/\u0393\u00F2\u00E6\u00E6/g, ' vấ')
       .replace(/\u0393\u00F2\u00E6\u252C\u00AD/g, 'n nhậ')
  s = s.replace(/Anh Ph[\s\S]*?ng/gi, 'Anh Phương')
       .replace(/T[\s\S]*?v[\s\S]*?n v[\s\S]*?n chuy[\s\S]*?n linh ki[\s\S]*?n/gi, 'Tư vấn vận chuyển linh kiện')
       .replace(/[\u2500\u0110\u0111]i[\s\S]*?m Qu[\s\S]*?nh/gi, 'Điểm Quỳnh')
       .replace(/[\s\S]*?v[\s\S]*?n v[\s\S]*?n chuy[\s\S]*?n hng m[\s\S]*?u/gi, 'Tư vấn vận chuyển hàng mẫu')
       .replace(/[\u2500\u0110\u0111][\s\S]*?nh Ph[\s\S]*?c An/gi, 'Đinh Phúc An')
       .replace(/10\/7 : Cn t[\s\S]*?Đm ph[\s\S]*?/gi, '10/7 : Cần tư vấn nhập hàng - Zalo Đinh Chí Thiết bị điện : \n1. Bút thử điện : đi CN\n2. Đàm phán xưởng nhập hàng : Xưởng sx đèn chiếu sáng\n11/7 : Báo giá CN sp Bút thử điện')
       .replace(/Hu[├╞][\s\S]*?Ph[ß║][\s\S]*?/g, 'Hương Phạm')
       .replace(/Huơng Phạm/g, 'Hương Phạm')
       .replace(/Xuón Hßúi Éinh/g, 'Xuân Hải Đinh')
       .replace(/Xu├ón H├ái ─É├¡nh/g, 'Xuân Hải Đinh')
       .replace(/Xu├ón Hß║úi Đinh/g, 'Xuân Hải Đinh')
       .replace(/Kh├ích Messenger Remote/g, 'Khách Messenger Remote')
       .replace(/Kh├ích Messenger/g, 'Khách Messenger')
       .replace(/D├║ng T├║c/g, 'Dương Tóc')
       .replace(/D├║ng t├║c/g, 'Dương Tóc')
       .replace(/D╞░╞íng T├│c/g, 'Dương Tóc')
       .replace(/Anh Ph╞░╞íng/g, 'Anh Phương')
       .replace(/Minh Nguyß╗àn/g, 'Minh Nguyễn')
       .replace(/Hu╞░╞íng Phß║ím/g, 'Huơng Phạm')
       .replace(/Hu╞░╞íng Phạ/g, 'Huơng Phạm')
       .replace(/Xu├ón H├ái ─É├¡nh/g, 'Xuân Hải Đinh')
       .replace(/Xu├ón Hß║úi Đinh/g, 'Xuân Hải Đinh')
       .replace(/─É├¡nh Ph├║c An/g, 'Đinh Phúc An')
       .replace(/Ho├óng Th├╣y Du╞░╞íng/g, 'Hoàng Thùy Dương')
       .replace(/Phß║ím Thuß║¡n/g, 'Phạm Thuận')
       .replace(/Mai Hß╗Öng VPP/g, 'Mai Hồng VPP')
       .replace(/Ho├óng Ph├ít Koffmann/g, 'Hoàng Phát Koffmann')
       .replace(/V├▓ng bi Ph├║ Qu├╜/g, 'Vòng bi Phú Quý')
       .replace(/Nha Phuong B├╣i/g, 'Nha Phuong Bùi')
       .replace(/Quß╗æc Kh├ính/g, 'Quốc Khánh')
       .replace(/Minh T├ím/g, 'Minh Tâm')
       .replace(/Bß║úo Ngß╗ìc Rice/g, 'Bảo Ngọc Rice')
       .replace(/S╞í n Quang L├ím/g, 'Sơn Quang Lâm')
       .replace(/Phß║ím Thß╗ï Anh Ngß╗ìc/g, 'Phạm Thị Anh Ngọc')
       .replace(/Ho├óng C╞░╞íng Biz/g, 'Hoàng Cường Biz')
       .replace(/V┼⌐ Ngß╗ìc Huyß╗ün/g, 'Vũ Ngọc Huyền')
       .replace(/Trß║ºn Hiß║┐u/g, 'Trần Hiếu')
       .replace(/H╞░╞íng V┼⌐/g, 'Hương Vũ')
       .replace(/Ruby Nguyß╗ün/g, 'Ruby Nguyễn')
       .replace(/Diß╗åm Quß╗│nh/g, 'Điểm Quỳnh')
       .replace(/Điß╗âm Quß╗│nh/g, 'Điểm Quỳnh')
       .replace(/Nhß║¡p khß║⌐u CN : Cß║⌐u cß║ºn trß╗Ñc/g, 'Nhập khẩu CN : Cẩu cần trục')
       .replace(/─æang xin ttin check thß╗º tß╗Ñc/g, 'đang xin ttin check thủ tục')
       .replace(/─æang check thß╗º tß╗Ñc line sea/g, 'đang check thủ tục line sea')
       .replace(/Hß║╣n kh├ích sang tuß║ºn b├áo lß║ãi/g, 'Hẹn khách sang tuần báo lại')
       .replace(/Minh ─æang li├¬n hß╗ç th├¬m lß║ºn nß╗»a/g, 'Minh đang liên hệ thêm lần nữa')
       .replace(/B├áo gi├í CN : 8 bß╗ö kß║╣p Phanh c╞░ß╗¢a Nga/g, 'Báo giá CN : 8 bộ kẹp Phanh cửa Nga')
       .replace(/─É├í nt cho KH ─æß╗â hß╗Åi th─âm/g, 'Đã nhắn tin cho KH để hỏi thăm')
       .replace(/H├Åi b├óng qu╞í/g, 'Hỏi bâng quơ')
       .replace(/KH h├Åi vu v╞í, khai th├íc th├¬m v├í s─æt Kh ko tr├ís├║ l├is║ãi/g, 'KH hỏi vu vơ, khai thác thêm và SĐT KH không trả lời')
       .replace(/Tk qu├ís├║ng c├ío k├¡ Page/g, 'Tài khoản quảng cáo kéo Page')
       .replace(/T╞░ vß║Ñn KH vß╗ü thß╗º tß╗Ñc CN/g, 'Tư vấn KH về thủ tục CN')
       .replace(/─É├í gß╗¡i b├áo gi├í CN - ─æß╗ôi kh├ích lv vß╗¢i sß║┐p TQ/g, 'Đã gửi báo giá CN - đợi khách làm việc với sếp TQ')
       .replace(/Hß╗Åi mua m├ín h├¼nh m├íy t├¡nh/g, 'Hỏi mua màn hình máy tính')
       .replace(/CN : thß╗º tß╗Ñc ch├¡nh ngß║ím h├ín v├▓ng bi/g, 'CN : thủ tục chính ngạch hàn vòng bi')
       .replace(/─É├í tß║ío nh├│m lv/g, 'Đã tạo nhóm làm việc')
       .replace(/Minh ─æ├í gß╗ìi t╞░ vß║Ñn/g, 'Minh đã gọi tư vấn')
       .replace(/─Éß╗ôi KH lv vß╗¢i b├¬n TQ vß╗ü c╞░ß╗¢c vc/g, 'Đợi KH làm việc với bên TQ về cước vc')
       .replace(/Sau ─æ├│ sß║╜  B├áo gi├í/g, 'Sau đó sẽ báo giá')
       .replace(/─Éang xin sdt hß╗æ trß╗ú. ─É├í gß╗¡i/g, 'Đang xin SĐT hỗ trợ. Đã gửi')
       .replace(/Nhß║¡p gi├óy Thiß║æu ngß║ím v├í CN/g, 'Nhập giày Tiểu ngạch và CN')
       .replace(/─É├í b├áo gi├í CN/g, 'Đã báo giá CN')
       .replace(/Hß║╣n KH sang tuß║ºn qua c├┤ng ty ─æß╗â l├ím viß╗çc/g, 'Hẹn KH sang tuần qua công ty để làm việc.')
       .replace(/KG : h├íng lß║À v├í l├┤ quß║ºn ├ío/g, 'KG : hàng lẻ và lô quần áo')
       .replace(/─Éang b├áo gi├í lß║À : 30k- L├┤ : 26k/g, 'Đang báo giá lẻ : 30k- Lô : 26k')
       .replace(/KH phß║ím hß╗ôi ─æang ─æi h├íng L├┤ vß╗ü HN l├í 20k\/1kg/g, 'KH phản hồi đang đi hàng Lô về HN là 20k/1kg')
       .replace(/B├áo gi├í h├íng l├┤ 22k\/1kg - H├íng lß║À: 30k/g, 'Báo giá hàng lô 22k/1kg - Hàng lẻ: 30k')
       .replace(/G─æ cho KH ko nge m├íy/g, 'Gđ cho KH ko nghe máy')
       .replace(/─Éang chß╗æt lß║ãi vß╗¢i KH/g, 'Đang chốt lại với KH')
       .replace(/KH ─æß╗ôi mß║Ñy h├┤m nß╗»a c├│ ─æ╞ín sß║╜ b├áo lß║ãi/g, 'KH đợi mấy hôm nữa có đơn sẽ báo lại')
       .replace(/KH y├¬u cß║ºu : H╞░ß╗¢ng dß║øn tß║ío tk app cty/g, 'KH yêu cầu : Hướng dẫn tạo tài khoản app công ty')
       .replace(/Hß╗Åi gi├í x├ích tay cf, bß╗Öt ─æß║ít xanh, hß║ít ─æiß╗üu tß╗½ VN sang TQ/g, 'Hỏi giá xách tay cf, bột đậu xanh, hạt điều từ VN sang TQ')
       .replace(/B├áo gi├í : 120-150k\/1kg t├╣y sß╗æ lg/g, 'Báo giá : 120-150k/1kg tùy số lượng')
       .replace(/─É├í b├áo gi├í 140k\/1kg cho ─æoqn 7kg/g, 'Đã báo giá 140k/1kg cho đoạn 7kg')
       .replace(/B├áo gi├í x├ích tay :  quß║ºn ├ío , ─æß╗æ c├í nh├ón... vß╗ü VN : 50k\/1kg/g, 'Báo giá xách tay : quần áo , đồ cá nhân... về VN : 50k/1kg')
       .replace(/Cß╗¡a cuß╗æn tß║ít HP : KG CN bß╗Ö cß╗¡a : cß║ºn b├áo gi├í 1 bß╗Ö v├í 10 bß╗Ö/g, 'Cửa cuốn tại HP : KG CN bộ cửa : cần báo giá 1 bộ và 10 bộ')
       .replace(/─Éang check thß╗º tß╗Ñc v├í thuß║┐ ph├¡/g, 'Đang check thủ tục và thuế phí')
       .replace(/Li├¬n hß╗ç hß╗Åi th─âm KH/g, 'Liên hệ hỏi thăm KH')
       .replace(/KH phß║ím hß╗ôi gi├í ok/g, 'KH phản hồi giá ok')
       .replace(/Hß╗Åi th├¬m vß╗ü dv TTH/g, 'Hỏi thêm về dv TTH')
       .replace(/Li├¬n hß╗ç lß║ãi hß╗Åi th─âm KH/g, 'Liên hệ lại hỏi thăm KH')
       .replace(/Vc h├íng nß╗Öi thß║Ñt gß╗ù : d╞░ß╗¢i 200kg/g, 'Vc hàng nội thất gỗ : dưới 200kg')
       .replace(/─É├í b├áo gi├í 16k vß╗ü tß║¡n nh├í ß╗ƒ HP/g, 'Đã báo giá 16k về tận nhà ở HP')
       .replace(/10\/7 : Cß║ºn t╞░ vß║Ñn nhß║¡p h├íng - Zalo ─Éinh Ch├¡ Thiß║┐t bß╗ï ─æiß╗çn/g, '10/7 : Cần tư vấn nhập hàng - Zalo Đinh Chí Thiết bị điện')
       .replace(/B├║t thß╗¡ ─æiß╗çn : ─æi CN/g, 'Bút thử điện : đi CN')
       .replace(/─É├ím ph├ín x╞░ß╗ƒng nhß║¡p h├íng/g, 'Đàm phán xưởng nhập hàng')
       .replace(/B├áo gi├í CN sp B├║t thß╗¡ ─æiß╗çn/g, 'Báo giá CN sp Bút thử điện')
       .replace(/CN : ─Éiß╗üu h├▓a cho oto/g, 'CN : Điều hòa cho oto')
       .replace(/B├¬n x╞░ß╗¢ng TQ ─æang ß║ím h╞░ß╗ƒng m╞░a b├ío/g, 'Bên xưởng TQ đang ảnh hưởng mưa bão')
       .replace(/ch╞░a cß║¡p nhß║¡t ─æ╞░ß╗¢c ttin sp/g, 'chưa cập nhật được ttin sp')
       .replace(/4\/7 : ─Éang chß╗æt lß║ãi sß╗æ l╞░ß╗¢ng thß║╗ ─æß╗â l├¬n ─æ╞n/g, '4/7 : Đang chốt lại số lượng thẻ để lên đơn')
       .replace(/Sang tuß║ºn T2 kß║┐ to├ín ck/g, 'Sang tuần T2 kế toán ck')
       .replace(/─É├í ck cß╗ìc h├íng - di h├íng thß║╗ tr╞░ß╗¢c/g, 'Đã ck cọc hàng - đi hàng thẻ trước')
       .replace(/B├║t sß║╜ ─æß║╖t sau/g, 'Bút sẽ đặt sau')
       .replace(/KH c├╣ tr╞░ß╗¢c ─æ├│ gi╞í mß╗¢i ─æß║╖t lß║ãi/g, 'KH cũ trước đó giờ mới đặt lại')
       .replace(/CN : ─æß╗ôi KH xin th├┤ng tin NCC vß╗ü l├┤ h├íng gß║ím/g, 'CN : đợi KH xin thông tin NCC về lô hàng gạch')
       .replace(/KH ─æang ─æß╗ôi NCC cß║¡p nhß║¡t ttin sp/g, 'KH đang đợi NCC cập nhật ttin sp')
       .replace(/Cß║ºn t├¼m nguß╗n h├íng ruy b─âng decor/g, 'Cần tìm nguồn hàng ruy băng decor')
       .replace(/L├ím viß╗çc vß╗¢i x╞░ß╗ƒng ruy b─âng/g, 'Làm việc với xưởng ruy băng')
       .replace(/B├¬n l╞░ß╗¢i gß╗¡i mß║ñu free/g, 'Bên lưới gửi mẫu free')
       .replace(/k├¡ch th╞░ß╗¢c bß║ún rß╗Öng/g, 'kích thước bản rộng')
       .replace(/─Éß║╖t h├íng mß║ñu 2 x╞░ß╗ƒng/g, 'Đặt hàng mẫu 2 xưởng')
       .replace(/─Éang ─æß╗ôi h├íng vß╗ü/g, 'Đang đợi hàng về')
       .replace(/H├íng mß║ñu vß╗ü ─æß╗ôi kh├ích l├ím d├▓ng sp cß║ºn ko/g, 'Hàng mẫu về đợi khách làm dòng sp cần ko')
       .replace(/Nhß║¡p s├íp vuß╗æt t├│c/g, 'Nhập sáp vuốt tóc')
       .replace(/─Éang l├ím tß╗▒ c├┤ng bß║ím ß╗ƒ VN/g, 'Đang làm tự công bố ở VN')
       .replace(/dß╗▒ kiß║┐n 1,5 th├íng nß╗»a mß╗¢i xong/g, 'dự kiến 1,5 tháng nữa mới xong')
       .replace(/Sau khi xong mß╗¢i c├│ thß╗â nhß║¡p h├íng/g, 'Sau khi xong mới có thể nhập hàng')
       .replace(/Mua hß╗Ö h├íng tr├¬n TM─Éß║¼/g, 'Mua hộ hàng trên TMĐT')
       .replace(/Mua m├íy c├ón da b├ío c╞░ß╗¢c/g, 'Mua máy cân da báo cước')
       .replace(/G─æ Kh muß╗æn chß╗ìn mua m├íy to h╞í n/g, 'Gđ Kh muốn chọn mua máy to hơn')
       .replace(/Sß║╜ li├¬n hß╗ç lß║ãi sau/g, 'Sẽ liên hệ lại sau')
       .replace(/Lhe Kh hß╗Åi th─âm/g, 'Lhe Kh hỏi thăm')
       .replace(/G─æ cho KH ─æß╗â hß╗ù trß╗ú/g, 'Gđ cho KH để hỗ trợ')
       .replace(/KH hß║╣n v├íi h├┤m nß╗»a sß║╜ nt nhß╗¥ hß╗ù trß╗ú/g, 'KH hẹn vài hôm nữa sẽ nt nhờ hỗ trợ')
       .replace(/Hß╗Åi th─âm khai th├íc th├¬m nhu cß║ºu cß╗ºa KH/g, 'Hỏi thăm khai thác thêm nhu cầu của KH')
       .replace(/Hß╗Åi KG : b├ính ─æß║¡u xanh/g, 'Hỏi KG : bánh đậu xanh')
       .replace(/─Éang t╞░ vß║Ñn b├áo gi├í/g, 'Đang tư vấn báo giá')
       .replace(/MH : 20 cuß╗ûn b─âng d├¡nh 3M/g, 'MH : 20 cuộn băng dính 3M')
       .replace(/─É├í b├áo gi├í/g, 'Đã báo giá')
       .replace(/Li├¬n hß╗ç KH ch╞░a rep/g, 'Liên hệ KH chưa rep')
       .replace(/G─æ ko li├¬n lß║íc ─æ╞░ß╗¢c/g, 'Gđ ko liên lạc được')
       .replace(/─É/g, 'Đ').replace(/─æ/g, 'đ')
       .replace(/├║/g, 'ú').replace(/├í/g, 'á').replace(/├¡/g, 'í').replace(/├┤/g, 'ô')
       .replace(/├¬/g, 'ê').replace(/├á/g, 'à').replace(/├¿/g, 'è').replace(/├╣/g, 'ù').replace(/├╜/g, 'ý')
       .replace(/ß╗a/g, 'ẩ').replace(/ß╗å/g, 'ổ').replace(/ß╗à/g, 'ề').replace(/ß╗ï/g, 'ị')
       .replace(/ß╗ì/g, 'ỉ').replace(/ß╗Å/g, 'ỏ').replace(/ß╗ü/g, 'ụ').replace(/ß╗ñ/g, 'ủ')
       .replace(/ß╗ª/g, 'ữ').replace(/ß╗¿/g, 'ừ').replace(/ß╗«/g, 'ứ').replace(/ß╗░/g, 'ử').replace(/ß╗▓/g, 'ữ')
       .replace(/ß║ím/g, 'ạ').replace(/ß║í/g, 'ạ')
       .replace(/\u0393\u00F6\u00A3\u00E1/g, 'á')
       .replace(/\u0393\u00F6\u00A3\u00ED/g, 'áo')
       .replace(/\u0393\u00F6\u00A3\u252C\u00BC/g, 'ên')
       .replace(/\u0393\u00F6\u00A3\u0393\u00F6\u00F1/g, 'ông')
       .replace(/\u0393\u00F6\u00A3ng/g, 'ông')
       .replace(/\u0393\u00F6\u00C7\u00EA/g, 'đ')
       .replace(/\u251C\u0192\u0393\u00F2\u00E6\u252C\u2551/g, 'ần')
       .replace(/\u251C\u0192\u0393\u00F2\u00E6\u0393\u00F6\u00C9/g, 'ế')
       .replace(/\u251C\u0192\u0393\u00F2\u00E6\u00ED/g, 'ại')
       .replace(/\u251C\u0192\u0393\u00F2\u00E6i/g, 'ại')
       .replace(/\u251C\u0192\u0393\u00F2\u00E6\u252C\u00ED/g, 'ận')
       .replace(/\u0393\u00F2\u20A7\u0393\u00FB\u00E6\u0393\u00F2\20A7\u00ED/g, 'ương')
       .replace(/\u0393\u00F2\20A7\u0393\u00FB\u00E6ng/g, 'ương')
       .replace(/\u0393\u00F2\20A7\u0393\u00FB\u00E6\u251C\u0192\u0393\u00F2\u00F9\u00FA/g, 'ượng')
       .replace(/\u251C\u0192\u0393\u00F2\u00F9\u252C\u00F3i/g, 'ới')
       .replace(/\u251C\u0192\u0393\u00F2\u00F9\u00FA/g, 'ệu')
       .replace(/\u251C\u0192\u0393\u00F2\u00F9\u251C\u255D/g, 'ều')
       .replace(/\u251C\u0192\u0393\u00F2\u00F9u/g, 'ều')
       .replace(/\u251C\u0192\u0393\u00F2\u00F9\u252C\u00F3ng/g, 'ởng')
       .replace(/\u251C\u0192\u0393\u00F2\u00E6\u00FAnh/g, 'ảnh')
       .replace(/\u251C\u0192\u0393\u00F2\u00F9\u255E\u00C6ng/g, 'ưởng');
  
  return s;
}

function formatDateTime(date) {
  if (!date) return '';
  if (typeof date === 'string' || typeof date === 'number') {
    date = new Date(date);
  }
  if (isNaN(date.getTime())) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${d} ${h}:${min}`;
}

function initCRMEvents() {
  // View mode toggling
  const btnBoard = document.getElementById('btn-crm-view-board');
  const btnList = document.getElementById('btn-crm-view-list');
  if (btnBoard && btnList) {
    btnBoard.onclick = () => {
      AppState.crmViewMode = 'board';
      saveState();
      renderCRMBoard();
    };
    btnList.onclick = () => {
      AppState.crmViewMode = 'list';
      saveState();
      renderCRMBoard();
    };
  }

  // Sortable headers in list view
  document.querySelectorAll('.crm-sortable-header').forEach(header => {
    header.addEventListener('click', () => {
      const field = header.getAttribute('data-field');
      if (AppState.crmSortField === field) {
        AppState.crmSortOrder = AppState.crmSortOrder === 'asc' ? 'desc' : 'asc';
      } else {
        AppState.crmSortField = field;
        AppState.crmSortOrder = 'asc';
      }
      saveState();
      renderCRMBoard();
    });
  });

  // Search input
  const searchInput = document.getElementById('crm-search');
  if (searchInput) {
    searchInput.addEventListener('input', renderCRMBoard);
  }

  // Open add lead modal
  const btnAddLead = document.getElementById('btn-add-lead-modal');
  if (btnAddLead) {
    btnAddLead.addEventListener('click', () => {
      populateSalesDropdown('lead-sales', getCurrentUser().id);
      openModal('modal-add-lead');
    });
  }

  // Form add lead submit
  const formAddLead = document.getElementById('form-add-lead');
  if (formAddLead) {
    formAddLead.addEventListener('submit', handleAddLeadSubmit);
  }

  // Form edit lead submit
  const formEditLead = document.getElementById('form-edit-lead');
  if (formEditLead) {
    formEditLead.addEventListener('submit', handleEditLeadSubmit);
  }

  // Edit lead stage select change (to toggle fail reason group visibility)
  const editStageSelect = document.getElementById('edit-lead-stage');
  if (editStageSelect) {
    editStageSelect.addEventListener('change', (e) => {
      const failGroup = document.getElementById('edit-lead-fail-reason-group');
      if (e.target.value === 'failed') {
        failGroup.style.display = 'block';
        document.getElementById('edit-lead-fail-reason').required = true;
      } else {
        failGroup.style.display = 'none';
        document.getElementById('edit-lead-fail-reason').required = false;
        document.getElementById('edit-lead-fail-reason').value = '';
      }
    });
  }

  // Fail reason other input toggle in edit modal
  const editFailReasonSelect = document.getElementById('edit-lead-fail-reason');
  if (editFailReasonSelect) {
    editFailReasonSelect.addEventListener('change', (e) => {
      const otherInput = document.getElementById('edit-lead-fail-reason-other');
      if (e.target.value === 'Khác') {
        otherInput.style.display = 'block';
        otherInput.required = true;
      } else {
        otherInput.style.display = 'none';
        otherInput.required = false;
      }
    });
  }

  // Prompt Fail Reason Modal - confirm button
  const btnConfirmFail = document.getElementById('btn-confirm-fail');
  if (btnConfirmFail) {
    btnConfirmFail.addEventListener('click', () => {
      const select = document.getElementById('prompt-fail-reason');
      const otherInput = document.getElementById('prompt-fail-reason-other');
      const evidenceInput = document.getElementById('prompt-fail-evidence');
      let reason = select.value;

      if (!reason) {
        showToast('Vui lòng chọn lý do thất bại!', 'warning');
        return;
      }

      if (reason === 'Khác') {
        reason = otherInput.value.trim();
        if (!reason) {
          showToast('Vui lòng nhập lý do cụ thể!', 'warning');
          return;
        }
      }

      const evidence = evidenceInput.value.trim();
      if (!evidence) {
        showToast('Vui lòng nhập link bằng chứng thất bại bắt buộc!', 'warning');
        return;
      }

      closeModal('modal-fail-reason-prompt');
      if (failPromptCallback) {
        failPromptCallback(reason, evidence);
        failPromptCallback = null;
      }
    });
  }

  // Prompt Fail Reason select change (toggle other input)
  const promptFailSelect = document.getElementById('prompt-fail-reason');
  if (promptFailSelect) {
    promptFailSelect.addEventListener('change', (e) => {
      const otherInput = document.getElementById('prompt-fail-reason-other');
      if (e.target.value === 'Khác') {
        otherInput.style.display = 'block';
        otherInput.required = true;
      } else {
        otherInput.style.display = 'none';
        otherInput.required = false;
      }
    });
  }
}

function populateSalesDropdown(selectId, selectedId = '') {
  const select = document.getElementById(selectId);
  if (!select) return;
  select.innerHTML = '';

  const salesUsers = AppState.users.filter(u => u.role === 'staff' || u.role === 'manager' || u.role === 'admin');
  const roleLabels = { admin: 'Admin', manager: 'Quản lý', staff: 'Nhân viên' };
  salesUsers.forEach(u => {
    const opt = document.createElement('option');
    opt.value = u.id;
    opt.innerText = `${u.name} (${roleLabels[u.role] || u.role})`;
    if (u.id === selectedId) {
      opt.selected = true;
    }
    select.appendChild(opt);
  });
}

// ==================== RENDERING KANBAN ==================== //
function renderCRMBoard() {
  // Sanitize stage and checklists for all leads
  if (AppState.leads) {
    AppState.leads.forEach(lead => {
      if (!lead.stage || lead.stage === 'Nhận thông tin' || lead.stage === 'khach_moi' || lead.stage === 'Khách mới' || lead.stage === 'Chưa tiếp cận' || lead.stage === 'new') lead.stage = 'receive_info';
      if (lead.stage === 'Lấy SĐT' || lead.stage === 'Lấy sđt' || lead.stage === 'get_phone') lead.stage = 'get_phone';
      if (lead.stage === 'Khai thác thông tin' || lead.stage === 'Khai thác TT' || lead.stage === 'consulting') lead.stage = 'explore_info';
      if (lead.stage === 'Báo giá' || lead.stage === 'quote') lead.stage = 'quotation';
      if (lead.stage === 'Thương lượng' || lead.stage === 'negotiation') lead.stage = 'negotiating';
      if (lead.stage === 'Thành công') lead.stage = 'success';
      if (lead.stage === 'Thất bại') lead.stage = 'failed';
      if (typeof window.initLeadSteps === 'function') {
        window.initLeadSteps(lead);
      }
      if (Array.isArray(lead.steps)) {
        lead.steps.forEach(s => {
          s.checklist = [];
        });
      }
    });
  }

  // Auto-heal tasks for any lead currently in quotation stage
  let stateChanged = false;

  const user = getCurrentUser();
  const searchVal = document.getElementById('crm-search').value.toLowerCase().trim();
  
  // Stages definition
  const stages = ['receive_info', 'get_phone', 'explore_info', 'quotation', 'negotiating', 'success', 'failed'];
  
  // Clear columns content
  stages.forEach(st => {
    const container = document.querySelector(`.kanban-cards-container[data-stage="${st}"]`);
    if (container) container.innerHTML = '';
  });

  // Filter leads by search query and user role permission
  const currentUser = getCurrentUser() || {};
  const filteredLeads = AppState.leads.filter(lead => {
    const isSpecialAccess = true; // Ensure all CRM leads are visible across all user accounts
    if (currentUser && currentUser.id && !isSpecialAccess && lead.salesId && lead.salesId !== currentUser.id) {
      return false;
    }
    const nameVal = String(lead.name || '').toLowerCase();
    const phoneVal = String(lead.phone || '');
    const noteVal = String(lead.note || '').toLowerCase();
    const matchesSearch = nameVal.includes(searchVal) || 
                          phoneVal.includes(searchVal) ||
                          noteVal.includes(searchVal);
    return matchesSearch;
  });

  // Synchronize toggle UI state
  const viewMode = AppState.crmViewMode || 'board';
  const btnBoard = document.getElementById('btn-crm-view-board');
  const btnList = document.getElementById('btn-crm-view-list');
  const kanbanWrapper = document.getElementById('crm-kanban-wrapper');
  const listWrapper = document.getElementById('crm-list-wrapper');

  if (btnBoard && btnList && kanbanWrapper && listWrapper) {
    if (viewMode === 'list') {
      btnList.classList.add('active');
      btnList.style.background = 'var(--color-primary)';
      btnList.style.color = 'white';
      btnBoard.classList.remove('active');
      btnBoard.style.background = 'transparent';
      btnBoard.style.color = 'var(--text-secondary)';
      kanbanWrapper.style.display = 'none';
      listWrapper.style.display = 'block';
    } else {
      btnBoard.classList.add('active');
      btnBoard.style.background = 'var(--color-primary)';
      btnBoard.style.color = 'white';
      btnList.classList.remove('active');
      btnList.style.background = 'transparent';
      btnList.style.color = 'var(--text-secondary)';
      kanbanWrapper.style.display = 'block';
      listWrapper.style.display = 'none';
    }
  }

  if (viewMode === 'list') {
    // Sort leads if in list view and sort configuration is set
    const crmSortField = AppState.crmSortField || 'name';
    const crmSortOrder = AppState.crmSortOrder || 'asc';

    filteredLeads.sort((a, b) => {
      let valA = '';
      let valB = '';
      
      if (crmSortField === 'name') {
        valA = a.name || '';
        valB = b.name || '';
      } else if (crmSortField === 'phone') {
        valA = a.phone || '';
        valB = b.phone || '';
      } else if (crmSortField === 'source') {
        valA = a.source || '';
        valB = b.source || '';
      } else if (crmSortField === 'sales') {
        const uA = AppState.users.find(u => u.id === a.salesId);
        const uB = AppState.users.find(u => u.id === b.salesId);
        valA = uA ? uA.name : '';
        valB = uB ? uB.name : '';
      } else if (crmSortField === 'stage') {
        const stagesOrder = ['receive_info', 'get_phone', 'explore_info', 'quotation', 'negotiating', 'success', 'failed'];
        valA = stagesOrder.indexOf(a.stage);
        valB = stagesOrder.indexOf(b.stage);
      } else if (crmSortField === 'updated') {
        valA = a.updatedTime || a.createdTime || a.date || '';
        valB = b.updatedTime || b.createdTime || b.date || '';
      }
      
      if (valA < valB) return crmSortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return crmSortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    // Update header sort icons
    document.querySelectorAll('.crm-sortable-header').forEach(header => {
      const field = header.getAttribute('data-field');
      const iconSpan = header.querySelector('.sort-icon');
      if (iconSpan) {
        if (field === crmSortField) {
          iconSpan.innerHTML = crmSortOrder === 'asc' ? ' ▲' : ' ▼';
          iconSpan.style.opacity = '1';
        } else {
          iconSpan.innerHTML = ' ⇅';
          iconSpan.style.opacity = '0.3';
        }
      }
    });

    const listBody = document.getElementById('crm-list-table-body');
    if (listBody) {
      listBody.innerHTML = '';
      if (filteredLeads.length === 0) {
        listBody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 20px; color: var(--text-muted);">Không tìm thấy khách hàng nào.</td></tr>`;
      } else {
        filteredLeads.forEach(lead => {
          const salesUser = AppState.users.find(u => u.id === lead.salesId);
          const salesName = salesUser ? salesUser.name : 'Chưa giao';
          
          const stageLabels = {
            receive_info: 'Nhận thông tin',
            get_phone: 'Lấy SĐT',
            explore_info: 'Khai thác thông tin',
            quotation: 'Báo giá',
            negotiating: 'Thương lượng',
            success: 'Thành công',
            failed: 'Thất bại'
          };
          
          const stageColors = {
            receive_info: '#3b82f6',
            get_phone: '#8b5cf6',
            explore_info: '#f97316',
            quotation: '#eab308',
            negotiating: '#f97316',
            success: '#10b981',
            failed: '#ef4444'
          };
          
          const stageBadge = `<span class="badge" style="background: ${stageColors[lead.stage] || '#6b7280'}; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 11px;">${stageLabels[lead.stage] || lead.stage}</span>`;
          
          const tr = document.createElement('tr');
          tr.style.borderBottom = '1px solid var(--border-color)';
          tr.style.cursor = 'pointer';
          tr.addEventListener('click', () => {
            openLeadDetailModal(lead.id);
          });
          
          tr.innerHTML = `
            <td style="padding: 12px 10px; font-weight: bold; color: var(--color-primary);">${cleanVietnameseText(lead.name)}</td>
            <td style="padding: 12px 10px; color: var(--text-secondary);">${lead.phone || 'Chưa có'}</td>
            <td style="padding: 12px 10px; color: var(--text-secondary);">${lead.source || 'Trực tiếp'}</td>
            <td style="padding: 12px 10px; color: var(--text-secondary);">${salesName}</td>
            <td style="padding: 12px 10px;">${stageBadge}</td>
            <td style="padding: 12px 10px; color: var(--text-muted); max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${cleanVietnameseText(lead.note) || ''}">${cleanVietnameseText(lead.note) || 'Không có ghi chú.'}</td>
            <td style="padding: 12px 10px; color: var(--text-secondary); font-size: 12px;">${lead.updatedTime || lead.createdTime || lead.date || ''}</td>
            <td style="padding: 12px 10px; text-align: center;" onclick="event.stopPropagation();">
              <button class="btn btn-sm btn-outline" onclick="openLeadDetailModal('${lead.id}')" style="padding: 4px 8px; font-size: 11px;"><i class="fa-solid fa-pen-to-square"></i> Chi tiết</button>
            </td>
          `;
          listBody.appendChild(tr);
        });
      }
    }
    
    // Still update column counts in background
    stages.forEach(st => {
      const countSpan = document.getElementById(`count-${st}`);
      if (countSpan) {
        const count = AppState.leads.filter(l => l.stage === st).length;
        countSpan.innerText = count;
      }
    });
    return;
  }

  // Render cards
  filteredLeads.forEach(lead => {
    const container = document.querySelector(`.kanban-cards-container[data-stage="${lead.stage}"]`);
    if (!container) return;

    const card = document.createElement('div');
    const isOverdue = typeof checkLeadOverdue === 'function' ? checkLeadOverdue(lead) : false;
    card.className = `kanban-card crm-card ${lead.stage === 'failed' ? 'failed-card' : ''} ${isOverdue ? 'overdue-card' : ''}`;
    card.setAttribute('draggable', (user.role === 'admin' || user.role === 'manager' || user.role === 'staff') ? 'true' : 'false');
    card.setAttribute('data-id', lead.id);

    // Get assigned sales name
    const salesUser = AppState.users.find(u => u.id === lead.salesId);
    const salesName = (salesUser && salesUser.name) ? salesUser.name.split(' ').pop() : 'Chưa giao';

    // Show fail reason badge if failed
    let failReasonHtml = '';
    if (lead.stage === 'failed') {
      const appColor = lead.failApproved ? '#10b981' : '#f59e0b';
      const appIcon = lead.failApproved ? 'fa-circle-check' : 'fa-clock';
      const appText = lead.failApproved ? 'Đã duyệt thất bại' : 'Chờ duyệt thất bại';
      
      failReasonHtml = `
        <div class="card-fail-reason" title="Lý do: ${lead.failReason || 'Chưa rõ'}"><i class="fa-solid fa-circle-xmark"></i> ${lead.failReason || 'Chưa rõ'}</div>
        <div class="card-fail-reason" style="background: rgba(31,41,55,0.2); border: 1px solid ${appColor}; color: ${appColor}; font-weight: bold; margin-top: 4px;" title="Trạng thái duyệt của quản lý">
          <i class="fa-solid ${appIcon}"></i> ${appText}
        </div>
      `;
    }

    // Values formatted
    const valRmbStr = lead.valRmb > 0 ? formatRmb(lead.valRmb) : '';
    const valVndStr = lead.valVnd > 0 ? formatVnd(lead.valVnd) : '';
    const valDisplay = [valRmbStr, valVndStr].filter(Boolean).join(' / ');

    // Highlight if updated today
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
    const isUpdatedToday = (lead.updatedTime && lead.updatedTime.startsWith(todayStr)) || (lead.date && lead.date.startsWith(todayStr));
    const timeClass = isUpdatedToday ? 'time-updated-today' : '';

    const overdueBadge = isOverdue 
      ? `<div class="card-fail-reason" style="background:rgba(239,68,68,0.15); color:#ef4444;" title="Quá hạn chót khâu này!"><i class="fa-solid fa-triangle-exclamation"></i> Quá hạn</div>` 
      : '';

    card.innerHTML = `
      <div class="card-client-name">${cleanVietnameseText(lead.name)}</div>
      <div class="card-desc">${cleanVietnameseText(lead.note) || 'Không có ghi chú thêm.'}</div>
      ${failReasonHtml}
      ${overdueBadge}
      <div class="card-meta">
        <div class="card-phone">
          <i class="fa-solid fa-phone" style="font-size: 10px; margin-right: 4px;"></i>${lead.phone || 'Chưa có SĐT'}
        </div>
        <div class="card-value">${valDisplay}</div>
      </div>
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-top: 4px;">
        <span class="card-sales-assignee" title="Người phụ trách: ${salesUser ? salesUser.name : ''}"><i class="fa-solid fa-headset"></i> ${salesName}</span>
        <div style="font-size: 11.5px; line-height: 1.3; color: var(--text-muted); text-align: right; display: flex; flex-direction: column; gap: 2px;">
          <div><i class="fa-solid fa-clock"></i> Tạo: ${lead.createdTime || lead.date}</div>
          <div class="${timeClass}" style="color: #38bdf8; font-weight: 600;"><i class="fa-solid fa-rotate"></i> Cập nhật: ${lead.updatedTime || lead.createdTime || lead.date}</div>
        </div>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 6px; padding-top: 6px; border-top: 1px solid rgba(255,255,255,0.05);">
        <div style="display: flex; flex-direction: column; gap: 2px;">
          <span style="font-size: 9.5px; color: var(--text-muted); font-weight: bold;"><i class="fa-solid fa-share-nodes"></i> Nguồn KH:</span>
          <select class="card-source-select" style="font-size: 10px; width: 100%; padding: 2px 4px; background: #1f2937; color: #e5e7eb; border: 1px solid #4b5563; border-radius: 4px; cursor: pointer;" onclick="event.stopPropagation();">
            <option value="Fanpage" ${lead.source === 'Fanpage' ? 'selected' : ''}>Fanpage</option>
            <option value="KH cũ" ${lead.source === 'KH cũ' ? 'selected' : ''}>KH cũ</option>
            <option value="BNI" ${lead.source === 'BNI' ? 'selected' : ''}>BNI</option>
            <option value="GT" ${lead.source === 'GT' ? 'selected' : ''}>GT</option>
            <option value="Cá nhân" ${lead.source === 'Cá nhân' ? 'selected' : ''}>Cá nhân</option>
            <option value="Giới thiệu" ${lead.source === 'Giới thiệu' ? 'selected' : ''}>Giới thiệu</option>
          </select>
        </div>
        <div style="display: flex; flex-direction: column; gap: 2px;">
          <span style="font-size: 9.5px; color: var(--text-muted); font-weight: bold;"><i class="fa-solid fa-right-left"></i> Chuyển bước:</span>
          <select class="card-stage-select" style="font-size: 10px; width: 100%; padding: 2px 4px; background: #1f2937; color: #e5e7eb; border: 1px solid #4b5563; border-radius: 4px; cursor: pointer;" onclick="event.stopPropagation();">
            <option value="" disabled selected>Chọn...</option>
            <option value="receive_info" ${lead.stage === 'receive_info' ? 'disabled' : ''}>1. Nhận thông tin</option>
            <option value="get_phone" ${lead.stage === 'get_phone' ? 'disabled' : ''}>2. Lấy SĐT</option>
            <option value="explore_info" ${lead.stage === 'explore_info' ? 'disabled' : ''}>3. Khai thác TT</option>
            <option value="quotation" ${lead.stage === 'quotation' ? 'disabled' : ''}>4. Báo giá</option>
            <option value="negotiating" ${lead.stage === 'negotiating' ? 'disabled' : ''}>5. Thương lượng</option>
            <option value="success" ${lead.stage === 'success' ? 'disabled' : ''}>6. Thành công</option>
            <option value="failed" ${lead.stage === 'failed' ? 'disabled' : ''}>7. Thất bại</option>
          </select>
        </div>
      </div>
    `;

    // Click card to open detail
    card.addEventListener('click', (e) => {
      if (e.target.closest('.card-stage-select') || e.target.closest('.card-source-select')) return;
      if (card.classList.contains('dragging')) return;
      openLeadDetailModal(lead.id);
    });

    const select = card.querySelector('.card-stage-select');
    if (select) {
      select.addEventListener('change', (e) => {
        const val = e.target.value;
        if (val) {
          handleLeadMove(lead.id, val);
        }
      });
    }

    const sourceSelect = card.querySelector('.card-source-select');
    if (sourceSelect) {
      sourceSelect.addEventListener('change', (e) => {
        const val = e.target.value;
        if (val) {
          lead.source = val;
          lead.updatedTime = formatDateTime(new Date());
          saveState();
          
          if (typeof renderDashboard === 'function') renderDashboard();
          if (typeof renderCRMBoard === 'function') renderCRMBoard();
          
          addNotification('Cập nhật Nguồn', `Đã chuyển nguồn khách hàng ${lead.name} sang: ${val}`, 'info');
        }
      });
    }

    // Drag and Drop events
    if (user.role === 'admin' || user.role === 'manager' || user.role === 'staff') {
      card.addEventListener('dragstart', (e) => {
        draggingLeadId = lead.id;
        e.dataTransfer.setData('text/plain', lead.id);
        card.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        document.getElementById('crm-kanban-board')?.classList.add('board-dragging');
      });

      card.addEventListener('dragend', () => {
        card.classList.remove('dragging');
        draggingLeadId = null;
        document.getElementById('crm-kanban-board')?.classList.remove('board-dragging');
      });
    }

    container.appendChild(card);
  });

  // Setup Column Dragover/Drop listeners
  stages.forEach(st => {
    const col = document.getElementById(`col-${st}`);
    if (!col) return;
    const container = col.querySelector('.kanban-cards-container');
    
    const countSpan = document.getElementById(`count-${st}`);
    const count = filteredLeads.filter(l => l.stage === st).length;
    if (countSpan) countSpan.innerText = count;

    if (user.role === 'admin' || user.role === 'manager' || user.role === 'staff') {
      col.ondragover = (e) => {
        e.preventDefault();
        col.classList.add('drag-over');
      };

      col.ondragleave = () => {
        col.classList.remove('drag-over');
      };

      col.ondrop = (e) => {
        e.preventDefault();
        col.classList.remove('drag-over');
        const id = e.dataTransfer.getData('text/plain') || draggingLeadId;
        if (id) {
          handleLeadMove(id, st);
        }
      };
    }
  });
}

// ==================== DRAG & DROP LOGIC ==================== //
function handleLeadMove(leadId, targetStage) {
  const lead = AppState.leads.find(l => l.id === leadId);
  if (!lead) return;

  if (lead.stage === targetStage) return;

  const currentRole = getCurrentUser().role;
  if (currentRole !== 'admin' && currentRole !== 'manager' && currentRole !== 'staff') {
    showToast('Bạn không có quyền chuyển đổi trạng thái khách hàng!', 'danger');
    return;
  }

  // Initialize steps if missing
  window.initLeadSteps(lead);

  const stageToStepNum = {
    receive_info: 1,
    get_phone: 2,
    explore_info: 3,
    quotation: 4,
    negotiating: 5,
    success: 6,
    failed: 7
  };

  const currentStepNum = stageToStepNum[lead.stage] || 1;
  const targetStepNum = stageToStepNum[targetStage] || 1;

  // If attempting to advance stage (target step > current step), validate checklist of CURRENT step
  if (targetStepNum > currentStepNum) {
    const currentStepData = lead.steps.find(s => s.stepNum === currentStepNum);
    if (currentStepData && currentStepData.checklist && currentStepData.checklist.length > 0) {
      const requiredPending = currentStepData.checklist.filter(c => c.required && !c.done);
      if (requiredPending.length > 0) {
        showToast(`Bạn cần hoàn thành các việc bắt buộc (*) ở bước hiện tại (${currentStepData.name}) trước khi chuyển bước!`, 'warning');
        renderCRMBoard(); // Reset visual drag status
        return;
      }
    }
  }

  // Validate files when transitioning from explore_info (Step 3) to quotation (Step 4)
  if (currentStepNum === 3 && targetStepNum === 4) {
    const files = lead.files || [];
    if (files.length === 0) {
      showToast("Để chuyển sang bước Báo giá, bạn bắt buộc phải đính kèm Tài liệu thông tin lô hàng vào mục tài liệu đính kèm!", "warning");
      renderCRMBoard(); // Reset visual drag status
      return;
    }
  }

  // Validate files and tasks when transitioning from quotation (Step 4) to negotiating (Step 5) or success (Step 6)
  if (currentStepNum === 4 && (targetStepNum === 5 || targetStepNum === 6)) {
    const files = lead.files || [];
    const hasImage = files.some(f => 
      /\.(jpg|jpeg|png|webp|gif|bmp)$/i.test(f.url) || 
      f.name.toLowerCase().includes('ảnh') || 
      f.name.toLowerCase().includes('hình') ||
      f.name.toLowerCase().includes('image') ||
      f.name.toLowerCase().includes('img') ||
      f.name.toLowerCase().includes('báo giá') ||
      f.name.toLowerCase().includes('bao gia')
    );
    if (!hasImage) {
      showToast("Để chuyển sang bước Thương lượng, bạn bắt buộc phải chèn Hình ảnh báo giá vào mục tài liệu đính kèm!", "warning");
      renderCRMBoard(); // Reset visual drag status
      return;
    }

    const quoteFeedback = (lead.quoteFeedback || '').trim();
    if (quoteFeedback.length < 3) {
      showToast("Bạn bắt buộc phải nhập rõ Tình trạng khách hàng sau báo giá vào ô nhập liệu ở Bước 4!", "warning");
      renderCRMBoard(); // Reset visual drag status
      return;
    }

    saveState();
  }

  // If moving to FAILED, ask for reason
  if (targetStage === 'failed') {
    const currentUser = getCurrentUser();
    const isAdminOrManager = currentUser && (currentUser.role === 'admin' || currentUser.role === 'manager');
    if (!isAdminOrManager) {
      showToast("Chỉ tài khoản Admin hoặc Quản lý mới có quyền chuyển sang Thất bại! CSKH chỉ được phép chuyển sang cột Thương lượng.", "warning");
      
      // Automatically redirect to negotiation instead
      lead.stage = 'negotiating';
      lead.stageEntryTimes = lead.stageEntryTimes || {};
      lead.stageEntryTimes['negotiating'] = Date.now();
      lead.failReason = null;
      lead.failEvidence = null;
      lead.failApproved = null;
      lead.updatedTime = formatDateTime(new Date());
      
      const currentStepData = lead.steps.find(s => s.stepNum === currentStepNum);
      if (currentStepData) currentStepData.status = 'done';
      const negoStep = lead.steps.find(s => s.stepNum === 5); // Negotiation step
      if (negoStep) negoStep.status = 'doing';

      saveState();
      renderCRMBoard();
      return;
    }

    document.getElementById('fail-prompt-client-name').innerText = lead.name;
    document.getElementById('prompt-fail-reason').value = '';
    document.getElementById('prompt-fail-reason-other').value = '';
    document.getElementById('prompt-fail-reason-other').style.display = 'none';
    document.getElementById('prompt-fail-evidence').value = '';
    
    openModal('modal-fail-reason-prompt');
    
    failPromptCallback = (reason, evidence) => {
      const allowedFailReasons = [
        "Không đủ năng lực xử lý hàng",
        "Hàng khó từ chối",
        "Khách lẻ, hàng khó => chủ động từ chối",
        "Không tìm được hàng cho KH"
      ];
      
      const isNegotiationReason = !allowedFailReasons.includes(reason);
      
      if (isNegotiationReason) {
        showToast("Lý do này thuộc khâu Thương lượng! Hệ thống đã chuyển khách hàng sang cột Thương lượng.", "info");
        
        lead.stage = 'negotiating';
        lead.stageEntryTimes = lead.stageEntryTimes || {};
        lead.stageEntryTimes['negotiating'] = Date.now();
        lead.failReason = null;
        lead.failEvidence = null;
        lead.failApproved = null;
        lead.updatedTime = formatDateTime(new Date());
        
        const currentStepData = lead.steps.find(s => s.stepNum === currentStepNum);
        if (currentStepData) currentStepData.status = 'done';
        const negoStep = lead.steps.find(s => s.stepNum === 5); // Negotiation step
        if (negoStep) negoStep.status = 'doing';

        saveState();
        renderCRMBoard();
        return;
      }

      const oldStage = lead.stage;
      lead.stage = 'failed';
      lead.stageEntryTimes = lead.stageEntryTimes || {};
      lead.stageEntryTimes['failed'] = Date.now();
      lead.failReason = reason;
      lead.failEvidence = evidence;
      lead.failApproved = false; // Initialize to false
      lead.updatedTime = formatDateTime(new Date());
      
      // Update step status
      const currentStepData = lead.steps.find(s => s.stepNum === currentStepNum);
      if (currentStepData) currentStepData.status = 'done';
      const failStep = lead.steps.find(s => s.stepNum === 7);
      if (failStep) failStep.status = 'doing';

      saveState();
      renderCRMBoard();
      addNotification('Cập nhật CRM', `Khách hàng ${lead.name} đã chuyển sang Thất bại: ${reason}`, 'warning');
    };
  } 
  // If moving to SUCCESS, check and reward points
  else if (targetStage === 'success') {
    const oldStage = lead.stage;
    lead.stage = 'success';
    lead.stageEntryTimes = lead.stageEntryTimes || {};
    lead.stageEntryTimes['success'] = Date.now();
    lead.failReason = null;
    lead.updatedTime = formatDateTime(new Date());
    
    // Update step status
    const currentStepData = lead.steps.find(s => s.stepNum === currentStepNum);
    if (currentStepData) currentStepData.status = 'done';
    const successStep = lead.steps.find(s => s.stepNum === 6);
    if (successStep) successStep.status = 'doing';

    // Reward sales owner (+50 points)
    const salesRep = AppState.users.find(u => u.id === lead.salesId);
    if (salesRep) {
      salesRep.points += 50;
      
      const now = new Date();
      const dateStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
      
      AppState.sausageLogs.push({
        id: `log-${Date.now()}`,
        userId: salesRep.id,
        points: 50,
        type: 'success',
        text: `Chốt thành công cơ hội ${lead.name} (+50 Xúc xích)`,
        date: dateStr
      });
      
      saveState();
      renderCRMBoard();
      renderCurrentUser(); // Refresh points display
      addNotification('Đơn Hàng Thành Công 🎉', `Chúc mừng ${salesRep.name} đã chốt đơn hàng từ ${lead.name}! +50 Xúc xích thưởng.`, 'success');
    } else {
      saveState();
      renderCRMBoard();
    }
  } 
  // Standard moves
  else {
    const oldStage = lead.stage;
    lead.stage = targetStage;
    lead.stageEntryTimes = lead.stageEntryTimes || {};
    lead.stageEntryTimes[targetStage] = Date.now();
    lead.failReason = null;
    lead.updatedTime = formatDateTime(new Date());
    
    // Update step status
    const currentStepData = lead.steps.find(s => s.stepNum === currentStepNum);
    if (currentStepData) currentStepData.status = 'done';
    const nextStep = lead.steps.find(s => s.stepNum === targetStepNum);
    if (nextStep) nextStep.status = 'doing';

    if (targetStage === 'quotation') {
      if (typeof createNegotiatingTaskIfNeeded === 'function') {
        createNegotiatingTaskIfNeeded(lead);
      }
    }

    saveState();
    renderCRMBoard();
    
    const stageNames = {
      receive_info: 'Nhận thông tin',
      get_phone: 'Lấy SĐT',
      explore_info: 'Khai thác thông tin',
      quotation: 'Báo giá',
      negotiating: 'Thương lượng'
    };
    addNotification('Cập nhật CRM', `Di chuyển khách hàng ${lead.name} sang bước: ${stageNames[targetStage]}`, 'info');
  }
}

window.initLeadSteps = function initLeadSteps(lead) {
  if (lead.steps && lead.steps.length === 7) return;

  const defaultSteps = [
    {
      stepNum: 1,
      name: "Nhận thông tin",
      assigneeId: lead.salesId || "usr-admin",
      status: lead.stage === "receive_info" ? "doing" : "todo",
      checklist: [],
      comments: [],
      note: lead.stage === "receive_info" ? (lead.note || "") : ""
    },
    {
      stepNum: 2,
      name: "Lấy SĐT",
      assigneeId: lead.salesId || "usr-admin",
      status: lead.stage === "get_phone" ? "doing" : "todo",
      checklist: [],
      comments: [],
      note: lead.stage === "get_phone" ? (lead.note || "") : ""
    },
    {
      stepNum: 3,
      name: "Khai thác thông tin",
      assigneeId: lead.salesId || "usr-admin",
      status: lead.stage === "explore_info" ? "doing" : "todo",
      checklist: [],
      comments: [],
      note: lead.stage === "explore_info" ? (lead.note || "") : ""
    },
    {
      stepNum: 4,
      name: "Báo giá",
      assigneeId: lead.salesId || "usr-admin",
      status: lead.stage === "quotation" ? "doing" : "todo",
      checklist: [],
      comments: [],
      note: lead.stage === "quotation" ? (lead.note || "") : ""
    },
    {
      stepNum: 5,
      name: "Thương lượng",
      assigneeId: lead.salesId || "usr-admin",
      status: lead.stage === "negotiating" ? "doing" : "todo",
      checklist: [],
      comments: [],
      note: lead.stage === "negotiating" ? (lead.note || "") : ""
    },
    {
      stepNum: 6,
      name: "Thành công",
      assigneeId: lead.salesId || "usr-admin",
      status: lead.stage === "success" ? "doing" : "todo",
      checklist: [],
      comments: [],
      note: lead.stage === "success" ? (lead.note || "") : ""
    },
    {
      stepNum: 7,
      name: "Thất bại",
      assigneeId: lead.salesId || "usr-admin",
      status: lead.stage === "failed" ? "doing" : "todo",
      checklist: [],
      comments: [],
      note: lead.stage === "failed" ? (lead.note || "") : ""
    }
  ];

  const stageToStepNum = {
    receive_info: 1,
    get_phone: 2,
    explore_info: 3,
    quotation: 4,
    negotiating: 5,
    success: 6,
    failed: 7
  };
  const currentStepNum = stageToStepNum[lead.stage] || 1;
  for (let i = 0; i < defaultSteps.length; i++) {
    if (defaultSteps[i].stepNum < currentStepNum) {
      defaultSteps[i].status = "done";
      defaultSteps[i].checklist.forEach(c => c.done = true);
    }
  }
  
  lead.steps = defaultSteps;
  lead.files = lead.files || [];
  lead.stageEntryTimes = lead.stageEntryTimes || {};
  if (!lead.stageEntryTimes[lead.stage]) {
    const fallbackTime = lead.createdTime ? new Date(lead.createdTime).getTime() : (lead.date ? new Date(lead.date).getTime() : Date.now());
    lead.stageEntryTimes[lead.stage] = fallbackTime;
  }
};

function openLeadDetailModal(leadId) {
  window.openLeadDetailModal = openLeadDetailModal;
  const lead = AppState.leads.find(l => l.id === leadId);
  if (!lead) return;

  // 1. Open modal FIRST so popup is 100% guaranteed to open on card click!
  if (typeof openModal === 'function') {
    openModal('modal-lead-detail');
  } else if (typeof window.openModal === 'function') {
    window.openModal('modal-lead-detail');
  } else {
    const modalEl = document.getElementById('modal-lead-detail');
    if (modalEl) {
      modalEl.classList.add('active');
      modalEl.style.display = 'flex';
    }
  }

  // 2. Safe rendering of modal contents
  try {
    if (typeof window.initLeadSteps === 'function') window.initLeadSteps(lead);
    currentActiveLeadId = leadId;
    
    const stageToStepNum = {
      receive_info: 1,
      get_phone: 2,
      explore_info: 3,
      quotation: 4,
      negotiating: 5,
      success: 6,
      failed: 7
    };
    currentActiveLeadStepNum = stageToStepNum[lead.stage] || 1;

    const titleEl = document.getElementById('lead-detail-title');
    if (titleEl) titleEl.innerText = lead.name;

    const subtitleEl = document.getElementById('lead-detail-subtitle');
    if (subtitleEl) subtitleEl.innerText = `Nguồn: ${lead.source || 'Fanpage'} - SĐT: ${lead.phone || 'Chưa có'}`;

    const stageSelect = document.getElementById('modal-lead-stage-select');
    if (stageSelect) {
      stageSelect.value = lead.stage;
      stageSelect.onchange = (e) => {
        const val = e.target.value;
        if (val && val !== lead.stage) {
          handleLeadMove(lead.id, val);
          const updatedLead = AppState.leads.find(l => l.id === lead.id);
          if (updatedLead) {
            openLeadDetailModal(updatedLead.id);
          }
        }
      };
    }

    // Render 7 steps timeline bubbles
    const timeline = document.querySelector('.lead-steps-timeline');
    if (timeline) {
      timeline.innerHTML = '';
      
      const stepNames = [
        "Nhận thông tin", "Lấy SĐT", "Khai thác thông tin", "Báo giá", "Thương lượng", "Thành công", "Thất bại"
      ];

      for (let i = 1; i <= 7; i++) {
        const bubble = document.createElement('div');
        const stepData = lead.steps ? (lead.steps.find(s => s.stepNum === i) || {}) : {};
        
        const leadStepNum = stageToStepNum[lead.stage] || 1;
        let stepStatusClass = 'todo';
        if (i < leadStepNum) stepStatusClass = 'done';
        else if (i === leadStepNum) stepStatusClass = 'doing';
        
        bubble.className = `flow-step-bubble ${stepStatusClass} ${i === currentActiveLeadStepNum ? 'active' : ''}`;
        bubble.innerHTML = `
          <div class="flow-step-circle">${i}</div>
          <span class="flow-step-lbl" style="font-size: 10px;">${stepNames[i - 1]}</span>
        `;

        bubble.onclick = () => {
          document.querySelectorAll('#modal-lead-detail .flow-step-bubble').forEach(b => b.classList.remove('active'));
          bubble.classList.add('active');
          currentActiveLeadStepNum = i;
          renderActiveLeadStepPanel();
        };

        timeline.appendChild(bubble);
      }
    }

    renderActiveLeadStepPanel();

    // Wire delete button defensively
    const btnDeleteLead = document.getElementById('btn-lead-delete');
    if (btnDeleteLead) {
      btnDeleteLead.onclick = () => {
        if (confirm(`Bạn chắc chắn muốn xóa cơ hội khách hàng "${lead.name}"? Dữ liệu sẽ mất vĩnh viễn.`)) {
          AppState.leads = AppState.leads.filter(l => l.id !== leadId);
          saveState();
          closeModal('modal-lead-detail');
          renderCRMBoard();
          addNotification('Xóa khách hàng', `Đã xóa khách hàng khỏi CRM.`, 'warning');
        }
      };
    }

    // Wire buttons inside modal defensively
    const btnSaveStep = document.getElementById('btn-lead-step-save');
    if (btnSaveStep) btnSaveStep.onclick = handleSaveActiveLeadStepData;
    
    const chkInput = document.getElementById('lead-step-new-chk');
    const btnAddChk = document.getElementById('btn-lead-step-add-chk');
    if (btnAddChk) btnAddChk.onclick = handleLeadAddStepChecklistItem;
    if (chkInput) {
      chkInput.onkeyup = (e) => {
        if (e.key === 'Enter') handleLeadAddStepChecklistItem();
      };
    }

    const btnAddFile = document.getElementById('btn-lead-step-add-file');
    if (btnAddFile) btnAddFile.onclick = handleLeadAddStepFile;

    const btnAddComment = document.getElementById('btn-lead-step-add-comment');
    if (btnAddComment) btnAddComment.onclick = handleLeadAddStepComment;
  } catch (err) {
    console.warn('openLeadDetailModal populating warning:', err);
  }
}

function renderActiveLeadStepPanel() {
  const lead = AppState.leads.find(l => l.id === currentActiveLeadId);
  if (!lead) return;

  const stepData = lead.steps.find(s => s.stepNum === currentActiveLeadStepNum);
  if (!stepData) return;

  const stepNames = [
    "Nhận thông tin", "Lấy SĐT", "Khai thác thông tin", "Báo giá", "Thương lượng", "Thành công", "Thất bại"
  ];

  const titleEl = document.getElementById('lead-step-panel-title');
  if (titleEl) titleEl.innerText = `Bước ${currentActiveLeadStepNum}: ${stepNames[currentActiveLeadStepNum - 1]}`;

  const assigneeSelect = document.getElementById('lead-step-assignee');
  if (assigneeSelect) {
    assigneeSelect.innerHTML = '';
    if (AppState && AppState.users) {
      AppState.users.forEach(u => {
        const opt = document.createElement('option');
        opt.value = u.id;
        opt.innerText = u.name;
        if (u.id === (stepData.assigneeId || lead.salesId)) opt.selected = true;
        assigneeSelect.appendChild(opt);
      });
    }
  }

  const phoneEl = document.getElementById('lead-step-phone');
  if (phoneEl) phoneEl.value = lead.phone || '';

  const sourceEl = document.getElementById('lead-step-source');
  if (sourceEl) sourceEl.value = lead.source || 'Fanpage';

  const deadlineEl = document.getElementById('lead-step-deadline');
  if (deadlineEl) deadlineEl.value = stepData.deadline || '';

  const noteEl = document.getElementById('lead-step-note');
  if (noteEl) noteEl.value = cleanVietnameseText(stepData.note || lead.note || '');

  const valRow = document.getElementById('lead-step-values-row');
  if (currentActiveLeadStepNum === 6) {
    valRow.style.display = 'flex';
    document.getElementById('lead-step-val-rmb').value = lead.valRmb || 0;
    document.getElementById('lead-step-val-vnd').value = lead.valVnd || 0;
  } else {
    valRow.style.display = 'none';
  }

  const failGroup = document.getElementById('lead-step-fail-group');
  if (currentActiveLeadStepNum === 7) {
    failGroup.style.display = 'block';
    
    const reasonSelect = document.getElementById('lead-step-fail-reason');
    const reasonOtherGroup = document.getElementById('lead-step-fail-reason-other-group');
    const reasonOtherInput = document.getElementById('lead-step-fail-reason-other');
    const evidenceInput = document.getElementById('lead-step-fail-evidence');
    const approvedCheckbox = document.getElementById('lead-step-fail-approved');
    
    const storedReason = lead.failReason || '';
    const stdReasons = [
      'Giá dịch vụ cao',
      'Thời gian vận chuyển lâu',
      'Không cạnh tranh được với đại lý VN',
      'Trả lời chậm',
      'Hàng khó từ chối',
      'Không đủ năng lực xử lý hàng',
      'Không cạnh tranh được giá dịch vụ với đối thủ',
      'Không tìm được hàng cho KH',
      'Khách lẻ, hàng khó => chủ động từ chối',
      'Khách hàng ko quan tâm',
      'Do AI tư vấn chưa tốt'
    ];
    
    if (storedReason && !stdReasons.includes(storedReason)) {
      reasonSelect.value = 'Khác';
      reasonOtherGroup.style.display = 'block';
      reasonOtherInput.value = storedReason;
    } else {
      reasonSelect.value = storedReason;
      reasonOtherGroup.style.display = 'none';
      reasonOtherInput.value = '';
    }

    reasonSelect.onchange = (e) => {
      if (e.target.value === 'Khác') {
        reasonOtherGroup.style.display = 'block';
      } else {
        reasonOtherGroup.style.display = 'none';
        reasonOtherInput.value = '';
      }
    };

    evidenceInput.value = lead.failEvidence || '';
    approvedCheckbox.checked = !!lead.failApproved;
    
    const currentUser = getCurrentUser();
    const isAdminOrManager = currentUser.role === 'admin' || currentUser.role === 'manager' || currentUser.username === 'minhphuong';
    approvedCheckbox.disabled = !isAdminOrManager;
    if (!isAdminOrManager) {
      approvedCheckbox.parentElement.setAttribute('title', 'Chỉ Quản lý mới có quyền duyệt');
    } else {
      approvedCheckbox.parentElement.removeAttribute('title');
    }
  } else {
    failGroup.style.display = 'none';
  }

  const chkContainer = document.getElementById('lead-step-checklist-items') || document.getElementById('lead-step-checklist-container');
  if (chkContainer) {
    chkContainer.innerHTML = '';
    if (stepData.checklist && stepData.checklist.length > 0) {
      stepData.checklist.forEach((item, idx) => {
        const row = document.createElement('div');
        row.style.cssText = 'display:flex; justify-content:space-between; align-items:center; background:#111827; padding:4px 8px; border-radius:4px; margin-bottom: 4px;';
        
        const label = document.createElement('label');
        label.style.cssText = 'display:flex; align-items:center; gap:8px; font-size:12.5px; cursor:pointer; margin: 0;';
        label.innerHTML = `
          <input type="checkbox" ${item.done ? 'checked' : ''}>
          <span style="${item.done ? 'text-decoration:line-through; opacity:0.6;' : ''}">${item.text} ${item.required ? '<span style="color:#ef4444;">*</span>' : ''}</span>
        `;
        
        label.querySelector('input').onchange = (e) => {
          item.done = e.target.checked;
          saveState();
          renderActiveLeadStepPanel();
        };

        const btnDel = document.createElement('button');
        btnDel.type = 'button';
        btnDel.className = 'btn btn-sm btn-outline';
        btnDel.style.cssText = 'padding: 2px 6px; font-size:10px; color:#ef4444; border-color:rgba(239,68,68,0.2);';
        btnDel.innerHTML = '<i class="fa-solid fa-trash"></i>';
        btnDel.onclick = () => {
          stepData.checklist.splice(idx, 1);
          saveState();
          renderActiveLeadStepPanel();
        };

        row.appendChild(label);
        row.appendChild(btnDel);
        chkContainer.appendChild(row);
      });
    }

    // Inject system task textarea dynamically for Step 4 (Báo giá)
    if (currentActiveLeadStepNum === 4) {
      const row = document.createElement('div');
      row.style.cssText = 'background:#1e1b4b; padding:8px; border-radius:4px; border: 1px dashed #6366f1; margin-bottom: 4px;';
      row.innerHTML = `
        <div style="font-size:12.5px; color:#a5b4fc; margin-bottom: 6px; font-weight: bold;">
          [Hệ thống] Nhập tình trạng khách hàng sau báo giá <span style="color:#ef4444;">*</span>
        </div>
        <textarea id="lead-step-quote-feedback" rows="2" style="background:#111827; color:white; border:1px solid #4b5563; font-size:12px; width:100%; border-radius:4px; padding:6px; box-sizing:border-box;" placeholder="Nhập tình trạng chi tiết tại đây (ví dụ: khách chê giá hơi cao đang thương lượng, khách đồng ý cần lên hợp đồng...)...">${lead.quoteFeedback || ''}</textarea>
      `;
      
      const textarea = row.querySelector('textarea');
      textarea.oninput = (e) => {
        const val = e.target.value;
        lead.quoteFeedback = val;
      };
      textarea.onchange = () => {
        saveState();
      };
      
      chkContainer.appendChild(row);
    }

    // Handle empty state
    if (chkContainer.innerHTML === '') {
      chkContainer.innerHTML = `<span class="text-muted" style="font-size:12px; font-style:italic;">Không có checklist.</span>`;
    }
  }

  const filesContainer = document.getElementById('lead-step-files-list');
  if (filesContainer) {
    filesContainer.innerHTML = '';
    const stepFiles = [];
    const seenUrls = new Set();
    ((lead.files || []).concat(stepData.files || [])).forEach(f => {
      if (!f) return;
      const k = (f.name || '') + '|' + (f.url || '');
      if (!seenUrls.has(k)) {
        seenUrls.add(k);
        stepFiles.push(f);
      }
    });
    if (stepFiles.length > 0) {
      stepFiles.forEach((file, idx) => {
        const row = document.createElement('div');
        row.style.cssText = 'display:flex; flex-direction:column; gap:4px; font-size:12px; background:#111827; padding:6px 8px; border-radius:4px; margin-bottom:4px;';
        
        const nameLower = file.name.toLowerCase();
        const isImage = /\.(png|jpe?g|webp|gif)($|\?)/i.test(file.url) || 
                        file.url.toLowerCase().includes('drive.google.com') || 
                        file.url.toLowerCase().includes('googleusercontent.com') ||
                        nameLower.includes('ảnh') || 
                        nameLower.includes('anh') || 
                        nameLower.includes('image') || 
                        nameLower.includes('png') || 
                        nameLower.includes('jpg') || 
                        nameLower.includes('jpeg');

        // Resolve Google Drive direct preview link if applicable
        let displayUrl = file.url;
        if (file.url.toLowerCase().includes('drive.google.com')) {
          let fileId = '';
          const dMatch = file.url.match(/\/d\/([a-zA-Z0-9_-]+)/);
          if (dMatch && dMatch[1]) {
            fileId = dMatch[1];
          } else {
            const idMatch = file.url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
            if (idMatch && idMatch[1]) {
              fileId = idMatch[1];
            }
          }
          if (fileId) {
            displayUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w600`;
          }
        }

        const imgPreview = isImage ? `<img src="${displayUrl}" onerror="this.style.display='none';" style="max-width:100%; max-height:100px; border-radius:4px; margin-top:4px; display:block; border:1px solid var(--border-color);" alt="ảnh hàng hóa" />` : '';

        const fileInfo = document.createElement('div');
        fileInfo.style.cssText = 'display:flex; justify-content:space-between; align-items:center;';
        fileInfo.innerHTML = `
          <a href="${file.url}" target="_blank" style="color:var(--color-info); text-decoration:underline;"><i class="fa-solid fa-file-arrow-up"></i> ${file.name}</a>
          <button type="button" class="btn btn-sm btn-outline" style="padding:2px 6px; font-size:10px; color:#ef4444;" title="Xóa file"><i class="fa-solid fa-trash"></i></button>
        `;
        
        fileInfo.querySelector('button').onclick = () => {
          lead.files.splice(idx, 1);
          saveState();
          renderActiveLeadStepPanel();
        };
        
        row.appendChild(fileInfo);
        if (imgPreview) {
          const previewDiv = document.createElement('div');
          previewDiv.innerHTML = imgPreview;
          row.appendChild(previewDiv.firstChild);
        }
        filesContainer.appendChild(row);
      });
    } else {
      filesContainer.innerHTML = `<span class="text-muted" style="font-size:12px; font-style:italic;">Chưa có tài liệu nào.</span>`;
    }
  }

  const commentsContainer = document.getElementById('lead-step-comments-list') || document.getElementById('lead-step-comments');
  if (commentsContainer) {
    commentsContainer.innerHTML = '';
    if (stepData.comments && stepData.comments.length > 0) {
      stepData.comments.forEach(c => {
        const div = document.createElement('div');
        div.style.cssText = 'font-size:12px; padding:4px 6px; background:rgba(255,255,255,0.03); border-radius:4px; margin-bottom:4px;';
        div.innerHTML = `<strong style="color:var(--color-primary);">${c.user}:</strong> <span>${c.text}</span> <span style="font-size:10px; color:var(--text-muted); float:right; margin-top:2px;">${c.date}</span>`;
        commentsContainer.appendChild(div);
      });
    } else {
      commentsContainer.innerHTML = `<span class="text-muted" style="font-size:12px; font-style:italic;">Chưa có thảo luận nào ở bước này.</span>`;
    }
  }
}

function handleLeadAddStepFile() {
  window.handleLeadAddStepFile = handleLeadAddStepFile;
  let lead = AppState.leads ? AppState.leads.find(l => l.id === currentActiveLeadId) : null;
  if (!lead && AppState.leads && AppState.leads.length > 0) {
    lead = AppState.leads[0];
    currentActiveLeadId = lead.id;
  }
  if (!lead) {
    if (typeof showToast === 'function') showToast("Vui lòng chọn khách hàng!", "warning");
    return;
  }

  const input = document.getElementById('lead-step-file-url');
  const val = input ? input.value.trim() : '';
  
  if (!val) {
    // If input is empty, open file picker dialog
    const picker = document.getElementById('lead-step-file-picker');
    if (picker) {
      picker.click();
      return;
    }
    if (typeof showToast === 'function') showToast("Vui lòng dán link file hoặc chọn tài liệu đính kèm!", "warning");
    return;
  }

  if (!lead.files) lead.files = [];
  const stepData = lead.steps ? lead.steps.find(s => s.stepNum === (currentActiveLeadStepNum || 1)) : null;
  if (stepData && !stepData.files) stepData.files = [];

  let fileName = val;
  if (val.startsWith('http://') || val.startsWith('https://')) {
    try {
      const u = new URL(val);
      fileName = u.pathname.split('/').pop() || val;
      if (!fileName || fileName.length < 2) fileName = val;
    } catch(e) {
      fileName = val;
    }
  } else {
    fileName = val.length > 50 ? val.substring(0, 47) + '...' : val;
  }

  const newFile = {
    name: fileName,
    url: val.startsWith('http') ? val : '#',
    date: new Date().toLocaleString('vi-VN')
  };

  lead.files.push(newFile);
  if (stepData && stepData.files) stepData.files.push(newFile);

  if (input) input.value = '';
  saveState();
  renderActiveLeadStepPanel();
  if (typeof addNotification === 'function') addNotification('Đính kèm tài liệu', `Đã đính kèm "${fileName}" cho khách hàng ${lead.name}`, 'info');
  if (typeof showToast === 'function') showToast(`Đã đính kèm tài liệu "${fileName}" thành công!`, 'success');
}

function handleLeadPickFile(fileInput) {
  window.handleLeadPickFile = handleLeadPickFile;
  if (!fileInput || !fileInput.files || fileInput.files.length === 0) return;
  const lead = AppState.leads.find(l => l.id === currentActiveLeadId);
  if (!lead) return;

  const file = fileInput.files[0];
  const reader = new FileReader();
  reader.onload = function(e) {
    if (!lead.files) lead.files = [];
    lead.files.push({
      name: file.name,
      url: e.target.result,
      date: new Date().toLocaleString('vi-VN')
    });
    fileInput.value = '';
    saveState();
    renderActiveLeadStepPanel();
    if (typeof showToast === 'function') showToast(`Đã tải lên và đính kèm file "${file.name}"!`, 'success');
  };
  reader.readAsDataURL(file);
}

window.handleLeadAddStepFile = handleLeadAddStepFile;
window.handleLeadPickFile = handleLeadPickFile;

function handleLeadAddStepChecklistItem() {
  const lead = AppState.leads.find(l => l.id === currentActiveLeadId);
  if (!lead) return;
  const stepData = lead.steps ? lead.steps.find(s => s.stepNum === currentActiveLeadStepNum) : null;
  if (!stepData) return;

  const input = document.getElementById('lead-step-new-chk');
  if (!input) return;
  const val = input.value.trim();
  if (!val) return;

  if (!stepData.checklist) stepData.checklist = [];
  stepData.checklist.push({
    text: val,
    done: false
  });

  input.value = '';
  saveState();
  renderActiveLeadStepPanel();
}

function handleLeadAddStepComment() {
  const lead = AppState.leads.find(l => l.id === currentActiveLeadId);
  if (!lead) return;
  const stepData = lead.steps ? lead.steps.find(s => s.stepNum === currentActiveLeadStepNum) : null;
  if (!stepData) return;

  const input = document.getElementById('lead-step-new-comment');
  if (!input) return;
  const val = input.value.trim();
  if (!val) return;

  if (!stepData.comments) stepData.comments = [];
  const user = typeof getCurrentUser === 'function' ? getCurrentUser() : { name: 'Admin' };
  stepData.comments.push({
    user: (user && (user.name || user.username)) ? (user.name || user.username) : 'Nhân viên',
    text: val,
    date: new Date().toLocaleString('vi-VN')
  });

  input.value = '';
  saveState();
  renderActiveLeadStepPanel();
}

function handleSaveActiveLeadStepData() {
  const lead = AppState.leads.find(l => l.id === currentActiveLeadId);
  if (!lead) return;

  const stepData = lead.steps.find(s => s.stepNum === currentActiveLeadStepNum);
  if (!stepData) return;

  const stageToStepNum = {
    receive_info: 1,
    get_phone: 2,
    explore_info: 3,
    quotation: 4,
    negotiating: 5,
    success: 6,
    failed: 7
  };
  const stepNumToStage = {
    1: 'receive_info',
    2: 'get_phone',
    3: 'explore_info',
    4: 'quotation',
    5: 'negotiating',
    6: 'success',
    7: 'failed'
  };

  const currentStepNum = stageToStepNum[lead.stage] || 1;

  lead.phone = document.getElementById('lead-step-phone').value.trim();
  lead.source = document.getElementById('lead-step-source').value;
  
  const assigneeId = document.getElementById('lead-step-assignee').value;
  stepData.assigneeId = assigneeId;
  lead.salesId = assigneeId;
  
  stepData.deadline = document.getElementById('lead-step-deadline').value;
  stepData.note = document.getElementById('lead-step-note').value;

  if (currentActiveLeadStepNum === 6) {
    lead.valRmb = parseFloat(document.getElementById('lead-step-val-rmb').value) || 0;
    lead.valVnd = parseFloat(document.getElementById('lead-step-val-vnd').value) || 0;
  }
  if (currentActiveLeadStepNum === 7) {
    const currentUser = getCurrentUser();
    const isAdminOrManager = currentUser && (currentUser.role === 'admin' || currentUser.role === 'manager' || currentUser.username === 'minhphuong');
    if (!isAdminOrManager) {
      showToast("Chỉ tài khoản Admin hoặc Quản lý mới có quyền chuyển sang Thất bại! CSKH chỉ được phép chuyển sang cột Thương lượng.", "warning");
      return;
    }

    const reasonSelect = document.getElementById('lead-step-fail-reason');
    const reasonVal = reasonSelect.value;
    if (!reasonVal) {
      showToast('Vui lòng chọn lý do thất bại!', 'warning');
      return;
    }
    
    let finalReason = reasonVal;
    if (reasonVal === 'Khác') {
      const reasonOtherVal = document.getElementById('lead-step-fail-reason-other').value.trim();
      if (!reasonOtherVal) {
        showToast('Vui lòng nhập chi tiết lý do thất bại khác!', 'warning');
        return;
      }
      finalReason = reasonOtherVal;
    }
    
    const evidenceVal = document.getElementById('lead-step-fail-evidence').value.trim();
    if (!evidenceVal) {
      showToast('Vui lòng nhập link bằng chứng thất bại bắt buộc!', 'warning');
      return;
    }
    
    lead.failReason = finalReason;
    lead.failEvidence = evidenceVal;
    
    // Only verify failApproved if changed by Manager/Admin
    if (isAdminOrManager) {
      lead.failApproved = document.getElementById('lead-step-fail-approved').checked;
    }
  }

  if (currentActiveLeadStepNum !== currentStepNum) {
    if (currentActiveLeadStepNum > currentStepNum) {
      const currentStepData = lead.steps.find(s => s.stepNum === currentStepNum);
      const requiredPending = currentStepData.checklist.filter(c => c.required && !c.done);
      if (requiredPending.length > 0) {
        showToast(`Bạn cần hoàn thành các việc bắt buộc (*) ở bước hiện tại (${currentStepData.name}) trước khi chuyển sang bước tiếp theo!`, 'warning');
        return;
      }
    }

    // Validate files when transitioning from explore_info (Step 3) to quotation (Step 4)
    if (currentStepNum === 3 && currentActiveLeadStepNum === 4) {
      const files = lead.files || [];
      if (files.length === 0) {
        showToast("Để chuyển sang bước Báo giá, bạn bắt buộc phải đính kèm Tài liệu thông tin lô hàng vào mục tài liệu đính kèm!", "warning");
        return;
      }
    }

    // Validate files and tasks when transitioning from quotation (Step 4) to negotiating (Step 5) or success (Step 6)
    if (currentStepNum === 4 && (currentActiveLeadStepNum === 5 || currentActiveLeadStepNum === 6)) {
      const files = lead.files || [];
      const hasImage = files.some(f => 
        /\.(jpg|jpeg|png|webp|gif|bmp)$/i.test(f.url) || 
        f.name.toLowerCase().includes('ảnh') || 
        f.name.toLowerCase().includes('hình') ||
        f.name.toLowerCase().includes('image') ||
        f.name.toLowerCase().includes('img') ||
        f.name.toLowerCase().includes('báo giá') ||
        f.name.toLowerCase().includes('bao gia')
      );
      if (!hasImage) {
        showToast("Để chuyển sang bước Thương lượng, bạn bắt buộc phải chèn Hình ảnh báo giá vào mục tài liệu đính kèm!", "warning");
        return;
      }

      const quoteFeedback = (lead.quoteFeedback || '').trim();
      if (quoteFeedback.length < 3) {
        showToast("Bạn bắt buộc phải nhập rõ Tình trạng khách hàng sau báo giá vào ô nhập liệu ở Bước 4!", "warning");
        return;
      }

      saveState();
    }

    const currentStepData = lead.steps.find(s => s.stepNum === currentStepNum);
    currentStepData.status = 'done';

    const targetStage = stepNumToStage[currentActiveLeadStepNum];
    lead.stageEntryTimes = lead.stageEntryTimes || {};
    lead.stageEntryTimes[targetStage] = Date.now();
    
    if (targetStage === 'success') {
      if (lead.stage !== 'success') {
        const salesRep = AppState.users.find(u => u.id === lead.salesId);
        if (salesRep) {
          salesRep.points = (salesRep.points || 0) + 50;
          
          const now = new Date();
          const dateStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
          
          AppState.sausageLogs.push({
            id: `log-${Date.now()}`,
            userId: salesRep.id,
            points: 50,
            type: 'success',
            text: `Chốt thành công cơ hội ${lead.name} (+50 Xúc xích)`,
            date: dateStr
          });
        }
      }
    }

    lead.stage = targetStage;
    stepData.status = 'doing';
    lead.updatedTime = formatDateTime(new Date());

    const stepNames = [
      "Nhận thông tin", "Lấy SĐT", "Khai thác thông tin", "Báo giá", "Thương lượng", "Thành công", "Thất bại"
    ];
    addNotification('Cập nhật CRM', `Di chuyển khách hàng ${lead.name} sang bước: ${stepNames[currentActiveLeadStepNum - 1]}`, 'info');
  }

  saveState();
  renderCRMBoard();
  closeModal('modal-lead-detail');
  showToast('Lưu thông tin bước thành công!', 'success');
  renderCurrentUser();
}

function handleLeadAddStepChecklistItem() {
  const lead = AppState.leads.find(l => l.id === currentActiveLeadId);
  if (!lead) return;

  const stepData = lead.steps.find(s => s.stepNum === currentActiveLeadStepNum);
  if (!stepData) return;

  const input = document.getElementById('lead-step-new-chk');
  const val = input.value.trim();
  if (!val) return;

  stepData.checklist = stepData.checklist || [];
  stepData.checklist.push({
    text: val,
    done: false,
    required: false
  });

  input.value = '';
  saveState();
  renderActiveLeadStepPanel();
}

function handleLeadAddStepFile() {
  const lead = AppState.leads.find(l => l.id === currentActiveLeadId);
  if (!lead) return;

  const nameInput = document.getElementById('lead-step-new-file-name');
  const urlInput = document.getElementById('lead-step-new-file-url');

  const name = nameInput.value.trim();
  const url = urlInput.value.trim();

  if (!url) {
    alert("Vui lòng nhập đường dẫn liên kết URL!");
    return;
  }
  const finalName = name || (lead.stage === 'quotation' ? "Ảnh báo giá" : "Tài liệu đính kèm");

  lead.files = lead.files || [];
  lead.files.push({
    name: finalName,
    url: url,
    date: formatDateTime(new Date()).substring(0, 10)
  });

  nameInput.value = '';
  urlInput.value = '';
  saveState();
  renderActiveLeadStepPanel();
}

function handleLeadAddStepComment() {
  const lead = AppState.leads.find(l => l.id === currentActiveLeadId);
  if (!lead) return;

  const stepData = lead.steps.find(s => s.stepNum === currentActiveLeadStepNum);
  if (!stepData) return;

  const input = document.getElementById('lead-step-new-comment');
  const val = input.value.trim();
  if (!val) return;

  const currentUser = getCurrentUser();
  stepData.comments = stepData.comments || [];
  stepData.comments.push({
    user: currentUser.name || 'Người dùng',
    text: val,
    date: formatDateTime(new Date()).substring(11, 16) + ' ' + formatDateTime(new Date()).substring(8, 10) + '/' + formatDateTime(new Date()).substring(5, 7)
  });

  input.value = '';
  saveState();
  renderActiveLeadStepPanel();
}

// ==================== AUTO DRAG SCROLL HELPER ==================== //
let dragScrollInterval = null;

document.addEventListener('dragover', (e) => {
  if (!draggingLeadId) return;
  
  const boardWrapper = document.querySelector('.kanban-board-wrapper');
  if (!boardWrapper) return;
  
  const mouseX = e.clientX;
  const width = window.innerWidth;
  const edgeSize = 120; // threshold pixels from screen edge
  const scrollSpeed = 15;
  
  if (mouseX < edgeSize) {
    if (!dragScrollInterval) {
      dragScrollInterval = setInterval(() => {
        boardWrapper.scrollLeft -= scrollSpeed;
      }, 15);
    }
  } else if (width - mouseX < edgeSize) {
    if (!dragScrollInterval) {
      dragScrollInterval = setInterval(() => {
        boardWrapper.scrollLeft += scrollSpeed;
      }, 15);
    }
  } else {
    if (dragScrollInterval) {
      clearInterval(dragScrollInterval);
      dragScrollInterval = null;
    }
  }
});

document.addEventListener('dragend', () => {
  if (dragScrollInterval) {
    clearInterval(dragScrollInterval);
    dragScrollInterval = null;
  }
});

document.addEventListener('drop', () => {
  if (dragScrollInterval) {
    clearInterval(dragScrollInterval);
    dragScrollInterval = null;
  }
});

// ==================== ADD LEAD LOGIC ==================== //
function handleAddLeadSubmit(e) {
  e.preventDefault();

  const name = document.getElementById('lead-name').value.trim();
  const phone = document.getElementById('lead-phone').value.trim();
  const source = document.getElementById('lead-source').value;
  const valRmb = parseInt(document.getElementById('lead-val-rmb').value) || 0;
  const valVnd = parseInt(document.getElementById('lead-val-vnd').value) || 0;
  const note = document.getElementById('lead-note').value.trim();
  const salesId = document.getElementById('lead-sales').value;

  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
  const nowStr = formatDateTime(now);

  const newLead = {
    id: `lead-${Date.now()}`,
    name,
    phone,
    source,
    valRmb,
    valVnd,
    note,
    salesId,
    stage: 'receive_info',
    stageEntryTimes: { receive_info: Date.now() },
    failReason: null,
    date: dateStr,
    createdTime: nowStr,
    updatedTime: nowStr
  };

  window.initLeadSteps(newLead);
  AppState.leads.push(newLead);
  saveState();
  closeModal('modal-add-lead');
  document.getElementById('form-add-lead').reset();
  
  renderCRMBoard();
  
  addNotification('Khách hàng mới', `Đã thêm khách hàng ${name} vào bước Nhận thông tin.`, 'success');
}

function checkLeadOverdue(lead) {
  if (!lead.stageEntryTimes) {
    lead.stageEntryTimes = {};
  }
  const now = Date.now();
  const created = lead.createdTime ? new Date(lead.createdTime).getTime() : now;

  if (lead.stage === 'get_phone') {
    const entered = lead.stageEntryTimes.get_phone || created;
    const elapsed = now - entered;
    return elapsed > 2 * 60 * 60 * 1000; // 2 hours
  }
  if (lead.stage === 'explore_info') {
    const entered = lead.stageEntryTimes.explore_info || created;
    const elapsed = now - entered;
    return elapsed > 12 * 60 * 60 * 1000; // 12 hours
  }
  if (lead.stage === 'quotation') {
    const entered = lead.stageEntryTimes.quotation || created;
    const elapsed = now - entered;
    const hasFeedback = lead.quoteFeedback && lead.quoteFeedback.trim().length >= 3;
    if (!hasFeedback && elapsed > 24 * 60 * 60 * 1000) {
      return true; // Overdue if no feedback after 24h
    }
  }
  return false;
}

function createNegotiatingTaskIfNeeded(lead) {
  if (!AppState.single_tasks) AppState.single_tasks = [];
  const hasTask = AppState.single_tasks.some(t => t.clientId === lead.id && t.title.includes('Tình trạng KH sau báo giá') && t.status !== 'completed');
  if (!hasTask) {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const deadlineStr = tomorrow.toISOString().split('T')[0];
    const newTask = {
      id: `task-ops-${Date.now()}`,
      title: `Tình trạng KH sau báo giá`,
      desc: `Cập nhật tình trạng khách hàng ${lead.name} sau báo giá`,
      assigneeId: lead.salesId || 'usr-admin',
      helperId: null,
      dept: 'sales',
      priority: 'high',
      deadline: deadlineStr,
      status: 'todo',
      projectId: null,
      clientId: lead.id,
      workflowId: null,
      tags: ['CRM', 'Báo giá'],
      checklist: [],
      attachments: [],
      comments: [],
      history: [`${new Date().toISOString().split('T')[0]}: Tự động tạo việc từ CRM`]
    };
    AppState.single_tasks.push(newTask);
  }
}
