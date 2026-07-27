const fs = require('fs');
const cp = require('child_process');
const http = require('https');

const raw = cp.execSync('git show 44b7540:db.json', { maxBuffer: 20*1024*1024 }).toString('utf8').replace(/^\uFEFF/, '');
const obj = JSON.parse(raw);

function cleanText(str) {
  if (!str || typeof str !== 'string') return str;
  return str
    .replace(/Kh├ích Messenger Remote/g, 'Khách Messenger Remote')
    .replace(/Kh├ích Messenger/g, 'Khách Messenger')
    .replace(/D├║ng T├║c|D├║ng t├║c|D╞░╞íng T├│c|Dung Tóc/g, 'Dương Tóc')
    .replace(/Anh Ph╞░╞íng|Anh Phuong/g, 'Anh Phương')
    .replace(/Minh Nguyß╗àn|Minh Nguyen/g, 'Minh Nguyễn')
    .replace(/Hu╞░╞íng Phß║ím|Hu╞░╞íng Phạ|Huong Pham/g, 'Huơng Phạm')
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
    .replace(/\uFFFD/g, '');
}

obj.leads.forEach(l => {
  if (l.name) l.name = cleanText(l.name);
  if (l.note) l.note = cleanText(l.note);
  if (l.failReason) l.failReason = cleanText(l.failReason);
});

obj.dbVersion = "21.26";

const cleanedJson = JSON.stringify(obj, null, 2);

fs.writeFileSync('d:/antigravity/db.json', cleanedJson, 'utf8');
fs.writeFileSync('d:/antigravity/minhhai_crm_deploy/db.json', cleanedJson, 'utf8');

console.log('Saved 100% clean db.json v21.26');

// Post to live server
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
