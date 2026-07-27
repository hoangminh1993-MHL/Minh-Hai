const fs = require('fs');
const cp = require('child_process');
const http = require('https');

const raw = cp.execSync('git show 44b7540:db.json', { maxBuffer: 20*1024*1024 }).toString('utf8').replace(/^\uFEFF/, '');
const obj = JSON.parse(raw);

function deepCleanText(text) {
  if (!text || typeof text !== 'string') return text || '';
  let s = text.trim();
  
  // Specific broken phrases fixes
  s = s.replace(/\[TIN nhan tu Fanpage\]: Can I ship 200kg of wood to Saigon\?/gi, '[Tin nhắn từ Fanpage]: Cần vận chuyển 200kg gỗ đi Sài Gòn')
       .replace(/C\s*\|-f\s*ần[\s\S]*?ko/gi, 'Cần tìm nguồn hàng ruy băng decor.\n15/6: Làm việc với xưởng ruy băng và lưới Kh gửi. Bên lưới gửi mẫu free 2 cuộn.\n16/6: Xưởng lưới đã gửi 2 cuộn mẫu.\n18/6: Đặt hàng mẫu 2 xưởng ruy băng.\n25/6: Hàng mẫu về đợi khách làm dòng sp cần ko.')
       .replace(/Nh\s*à\s*\|ÆÆ[\s\S]*?m\s*ới\s*xong/gi, 'Nhập sáp vuốt tóc.\nĐang làm thủ tục tự công bố ở VN: dự kiến 1,5 tháng nữa mới xong.\nSau khi xong mới có thể nhập hàng.')
       .replace(/KH\s*y\s*à\s*├╝[\s\S]*?cty/gi, 'KH yêu cầu: Hướng dẫn tạo tài khoản app công ty.')
       .replace(/ΓôC\s*|├æang[\s\S]*?g\s*├╝i/gi, 'Đang xin SĐT hỗ trợ. Đã gửi.')
       .replace(/H\s*ôI\s*KG[\s\S]*?TQ/gi, 'Hỏi KG: bánh đậu xanh, ... gửi sang TQ.')
       .replace(/G\s*├ÖC[\s\S]*?g\s*├╝i\s*├╝i/gi, 'Gửi ảnh sản phẩm và báo giá.')
       .replace(/Nh\s*ậ\s*p\s*kh\s*ẩ\s*u\s*CN[\s\S]*?th\s*check/gi, 'Nhập khẩu CN: Cẩu cần trục.\nĐang xin thông tin check thủ tục.')
       .replace(/Kh├ích Messenger Remote/g, 'Khách Messenger Remote')
       .replace(/Kh├ích Messenger/g, 'Khách Messenger')
       .replace(/D├║ng T├║c|D├║ng t├║c|D╞░╞íng T├│c|Dung Tóc/g, 'Dương Tóc')
       .replace(/Anh Ph╞░╞íng|Anh Phuong/g, 'Anh Phương')
       .replace(/Minh Nguyß╗àn|Minh Nguyen/g, 'Minh Nguyễn')
       .replace(/Hu╞░╞íng Phß║ím|Hu╞░╞íng Phạ|Huong Pham/g, 'Hương Phạm')
       .replace(/Xu├ón H├ái ─É├¡nh|Xu├ón Hß║úi Đinh|Xuân Hải Dinh/g, 'Xuân Hải Đinh')
       .replace(/─É├¡nh Ph├║c An|Dinh Phúc An/g, 'Đinh Phúc An')
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
       .replace(/Diß╗åm Quß╗│nh|Điß╗âm Quß╗│nh/g, 'Điểm Quỳnh');

  // Remove control/garbage characters
  s = s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u7F-\u009F\uFFFD]/g, '');
  s = s.replace(/\|-|fΓô|¬╝|├|╝|├æ|├╝|├Ö|├â|Γô/g, '');
  return s.trim();
}

const stageMapping = {
  'quote': 'quotation',
  'consulting': 'explore_info',
  'negotiation': 'negotiating',
  'khach_moi': 'receive_info',
  'Khách mới': 'receive_info',
  'Chưa tiếp cận': 'receive_info',
  'new': 'receive_info'
};

obj.leads.forEach(l => {
  if (l.name) l.name = deepCleanText(l.name);
  if (l.note) l.note = deepCleanText(l.note);
  if (l.failReason) l.failReason = deepCleanText(l.failReason);
  if (stageMapping[l.stage]) {
    l.stage = stageMapping[l.stage];
  }
});

obj.dbVersion = "21.27";

const cleanedJson = JSON.stringify(obj, null, 2);

fs.writeFileSync('d:/antigravity/db.json', cleanedJson, 'utf8');
fs.writeFileSync('d:/antigravity/minhhai_crm_deploy/db.json', cleanedJson, 'utf8');

console.log('Deep cleaned all 59 leads notes & titles!');

// Post clean state to live server API
const req = http.request('https://minh-hai.onrender.com/api/state', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': Buffer.byteLength(cleanedJson)
    }
}, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
        console.log('Live POST Response:', body);
    });
});

req.write(cleanedJson);
req.end();
