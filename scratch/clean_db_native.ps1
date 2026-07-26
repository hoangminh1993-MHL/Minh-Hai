$utf8NoBom = New-Object System.Text.UTF8Encoding $false

# Map of clean notes by Lead ID
$cleanMap = @{
    "lead-excel-24-828" = "Nhập khẩu CN : Cẩu cần trục - đang xin ttin check thủ tục : 83 tấn`n10/7 : đang check thủ tục line sea`n12/7 : Hẹn khách sang tuần báo lại. Minh đang liên hệ thêm lần nữa"
    "lead-excel-24-353" = "Nhập khẩu CN : Cẩu cần trục - đang xin ttin check thủ tục : 83 tấn`n10/7 : đang check thủ tục line sea`n12/7 : Hẹn khách sang tuần báo lại. Minh đang liên hệ thêm lần nữa"
    "lead-excel-13-769" = "3/7 : Báo giá CN : 8 bộ kẹp Phanh cửa Nga`n4/7 : Đã nhắn tin cho KH để hỏi thăm`n11/7 : Liên hệ KH hỏi thăm về đơn hàng"
    "lead-excel-13-584" = "3/7 : Báo giá CN : 8 bộ kẹp Phanh cửa Nga`n4/7 : Đã nhắn tin cho KH để hỏi thăm`n11/7 : Liên hệ KH hỏi thăm về đơn hàng"
    "lead-excel-15-136" = "Hỏi bâng quơ"
    "lead-excel-15-915" = "Hỏi bâng quơ"
    "lead-excel-20-381" = "KH hỏi vu vơ, khai thác thêm và SĐT KH không trả lời"
    "lead-excel-20-352" = "KH hỏi vu vơ, khai thác thêm và SĐT KH không trả lời"
    "lead-excel-18-945" = "Tài khoản quảng cáo kéo Page"
    "lead-excel-18-472" = "Tài khoản quảng cáo kéo Page"
    "lead-1783705531795" = "Tư vấn vận chuyển hàng mẫu`n11/7 : Liên hệ với KH qua Zalo"
    "lead-excel-23-268" = "Tư vấn KH về thủ tục CN`n9/7 : Đã gửi báo giá CN - đợi khách làm việc với sếp TQ"
    "lead-excel-23-865" = "Tư vấn KH về thủ tục CN`n9/7 : Đã gửi báo giá CN - đợi khách làm việc với sếp TQ"
    "lead-excel-16-636" = "Hỏi mua màn hình máy tính. KH check giá ok. Đã báo giá. Đã gđ tư vấn và trao đổi. KH tham khảo sản phẩm, chưa có nhu cầu mua ngay. Dự kiến mua là tháng 9 - mua để chơi Game"
    "lead-excel-16-153" = "Hỏi mua màn hình máy tính. KH check giá ok. Đã báo giá. Đã gđ tư vấn và trao đổi. KH tham khảo sản phẩm, chưa có nhu cầu mua ngay. Dự kiến mua là tháng 9 - mua để chơi Game"
    "lead-excel-8-208"  = "CN : thủ tục chính ngạch hàn vòng bi. Đã tạo nhóm làm việc`n26/6 : Minh đã gọi tư vấn. Đợi KH làm việc với bên TQ về cước vc. Sau đó sẽ báo giá"
    "lead-excel-8-289"  = "CN : thủ tục chính ngạch hàn vòng bi. Đã tạo nhóm làm việc`n26/6 : Minh đã gọi tư vấn. Đợi KH làm việc với bên TQ về cước vc. Sau đó sẽ báo giá"
    "lead-excel-27-206" = "Đang xin SĐT hỗ trợ. Đã gửi"
    "lead-excel-27-902" = "Đang xin SĐT hỗ trợ. Đã gửi"
    "lead-excel-12-541" = "Nhập giày Tiểu ngạch và CN`n3/7 : Đã báo giá CN. Hẹn KH sang tuần qua công ty để làm việc."
    "lead-excel-12-270" = "Nhập giày Tiểu ngạch và CN`n3/7 : Đã báo giá CN. Hẹn KH sang tuần qua công ty để làm việc."
    "lead-excel-22-732" = "KH hỏi vu vơ, khai thác thêm và SĐT KH không trả lời"
    "lead-excel-22-789" = "KH hỏi vu vơ, khai thác thêm và SĐT KH không trả lời"
    "lead-excel-3-180"  = "KG : hàng lẻ và lô quần áo- Tiên Lãng HP. Đang báo giá lẻ : 30k- Lô : 26k. KH phản hồi đang đi hàng Lô về HN là 20k/1kg.`n9/6 : Báo giá hàng lô 22k/1kg - Hàng lẻ: 30k`n11/6 : Gđ cho KH ko nghe máy`n12/6 : Đang chốt lại với KH`n13/6 : KH đợi mấy hôm nữa có đơn sẽ báo lại"
    "lead-excel-3-540"  = "KG : hàng lẻ và lô quần áo- Tiên Lãng HP. Đang báo giá lẻ : 30k- Lô : 26k. KH phản hồi đang đi hàng Lô về HN là 20k/1kg.`n9/6 : Báo giá hàng lô 22k/1kg - Hàng lẻ: 30k`n11/6 : Gđ cho KH ko nghe máy`n12/6 : Đang chốt lại với KH`n13/6 : KH đợi mấy hôm nữa có đơn sẽ báo lại"
    "lead-fb-81326ee0"  = "[Tin nhắn từ Fanpage]: Xin chào shop"
    "lead-excel-17-316" = "KH yêu cầu : Hướng dẫn tạo tài khoản app công ty"
    "lead-excel-17-112" = "KH yêu cầu : Hướng dẫn tạo tài khoản app công ty"
    "lead-excel-5-422"  = "Hỏi giá xách tay cf, bột đậu xanh, hạt điều từ VN sang TQ - Báo giá : 120-150k/1kg tùy số lượng (KH đang ở TQ).`n22/6 : Đã báo giá 140k/1kg cho đoạn 7kg. Trọn gói : 200k/1kg`n10/7 : Báo giá xách tay : quần áo , đồ cá nhân... về VN : 50k/1kg"
    "lead-excel-5-149"  = "Hỏi giá xách tay cf, bột đậu xanh, hạt điều từ VN sang TQ - Báo giá : 120-150k/1kg tùy số lượng (KH đang ở TQ).`n22/6 : Đã báo giá 140k/1kg cho đoạn 7kg. Trọn gói : 200k/1kg`n10/7 : Báo giá xách tay : quần áo , đồ cá nhân... về VN : 50k/1kg"
    "lead-excel-10-495" = "Cửa cuốn tại HP : KG CN bộ cửa : cần báo giá 1 bộ và 10 bộ. Đang check thủ tục và thuế phí`n5/7 : Liên hệ hỏi thăm KH. KH phản hồi giá ok. Hỏi thêm về dv TTH`n11/7 : Liên hệ lại hỏi thăm KH"
    "lead-excel-10-183" = "Cửa cuốn tại HP : KG CN bộ cửa : cần báo giá 1 bộ và 10 bộ. Đang check thủ tục và thuế phí`n5/7 : Liên hệ hỏi thăm KH. KH phản hồi giá ok. Hỏi thêm về dv TTH`n11/7 : Liên hệ lại hỏi thăm KH"
    "lead-excel-11-603" = "Vc hàng nội thất gỗ : dưới 200kg`n2/7 : Đã báo giá 16k về tận nhà ở HP với hàng lô giường nội thất gỗ"
    "lead-excel-11-387" = "Vc hàng nội thất gỗ : dưới 200kg`n2/7 : Đã báo giá 16k về tận nhà ở HP với hàng lô giường nội thất gỗ"
    "lead-excel-14-444" = "[Mã KH: MH408 - Nguyễn Minh Tâm] Đặt set váy : KH lẻ 35k/1kg. 0% phí dv."
    "lead-excel-14-671" = "[Mã KH: MH408 - Nguyễn Minh Tâm] Đặt set váy : KH lẻ 35k/1kg. 0% phí dv."
    "lead-excel-25-788" = "10/7 : Cần tư vấn nhập hàng - Zalo Đinh Chí Thiết bị điện :`n1. Bút thử điện : đi CN`n2. Đàm phán xưởng nhập hàng : Xưởng sx đèn chiếu sáng`n11/7 : Báo giá CN sp Bút thử điện"
    "lead-excel-25-889" = "10/7 : Cần tư vấn nhập hàng - Zalo Đinh Chí Thiết bị điện :`n1. Bút thử điện : đi CN`n2. Đàm phán xưởng nhập hàng : Xưởng sx đèn chiếu sáng`n11/7 : Báo giá CN sp Bút thử điện"
    "lead-excel-26-504" = "CN : Điều hòa cho oto`n9/7 : Bên xưởng TQ đang ảnh hưởng mưa bão nên chưa cập nhật được ttin sp"
    "lead-excel-26-849" = "CN : Điều hòa cho oto`n9/7 : Bên xưởng TQ đang ảnh hưởng mưa bão nên chưa cập nhật được ttin sp"
    "lead-excel-9-806"  = "[Mã KH: MH406 - C. Hồng VPP] 4/7 : Đang chốt lại số lượng thẻ để lên đơn. Sang tuần T2 kế toán ck`n6/7 : Đã ck cọc hàng - đi hàng thẻ trước. Bút sẽ đặt sau"
    "lead-excel-9-512"  = "[Mã KH: MH406 - C. Hồng VPP] 4/7 : Đang chốt lại số lượng thẻ để lên đơn. Sang tuần T2 kế toán ck`n6/7 : Đã ck cọc hàng - đi hàng thẻ trước. Bút sẽ đặt sau"
    "lead-excel-21-298" = "[Mã KH: MH409 - Vũ Huyền] KH cũ trước đó giờ mới đặt lại : 4050 , 30k/1kg, 2% phí dv"
    "lead-excel-21-387" = "[Mã KH: MH409 - Vũ Huyền] KH cũ trước đó giờ mới đặt lại : 4050 , 30k/1kg, 2% phí dv"
    "lead-fb-2790d56a"  = "[Tin nhắn từ Fanpage]: Xin chào shop"
    "lead-excel-28-503" = "CN : đợi KH xin thông tin NCC về lô hàng gạch`n10/7 : KH đang đợi NCC cập nhật ttin sp"
    "lead-excel-28-399" = "CN : đợi KH xin thông tin NCC về lô hàng gạch`n10/7 : KH đang đợi NCC cập nhật ttin sp"
    "lead-excel-4-874"  = "[Mã KH: MH404 - Liên193] Cần tìm nguồn hàng ruy băng decor`n15/6 : Làm việc với xưởng ruy băng và lưới Kh gửi. Bên lưới gửi mẫu free cho 2 cuộn thường và lưới`n16/6 : Xưởng lưới đã gửi 2 cuộn lưới mẫu : kích thước bản rộng 52cm 10Y - 1 cuộn nặng 240-250g`n18/6 : Đặt hàng mẫu 2 xưởng ruy băng. Đang đợi hàng về`n25/6 : Hàng mẫu về đợi khách làm dòng sp cần ko"
    "lead-excel-4-950"  = "[Mã KH: MH404 - Liên193] Cần tìm nguồn hàng ruy băng decor`n15/6 : Làm việc với xưởng ruy băng và lưới Kh gửi. Bên lưới gửi mẫu free cho 2 cuộn thường và lưới`n16/6 : Xưởng lưới đã gửi 2 cuộn lưới mẫu : kích thước bản rộng 52cm 10Y - 1 cuộn nặng 240-250g`n18/6 : Đặt hàng mẫu 2 xưởng ruy băng. Đang đợi hàng về`n25/6 : Hàng mẫu về đợi khách làm dòng sp cần ko"
    "lead-excel-6-494"  = "Nhập sáp vuốt tóc.`nĐang làm tự công bố ở VN : dự kiến 1,5 tháng nữa mới xong`nSau khi xong mới có thể nhập hàng"
    "lead-excel-6-575"  = "Nhập sáp vuốt tóc.`nĐang làm tự công bố ở VN : dự kiến 1,5 tháng nữa mới xong`nSau khi xong mới có thể nhập hàng"
    "lead-excel-2-352"  = "Mua hộ hàng trên TMĐT. Mua máy cân da báo cước. Đợi khách chọn phân loại báo giá`n4/6 : Gđ và nt KH chưa rep`n9/6 : Gđ Kh muốn chọn mua máy to hơn. Sẽ liên hệ lại sau`n13/6 : Lhe Kh hỏi thăm`n23/6 : Gđ cho KH để hỗ trợ. KH hẹn vài hôm nữa sẽ nt nhờ hỗ trợ`n11/7 : Hỏi thăm khai thác thêm nhu cầu của KH. KH ko quan tâm"
    "lead-excel-2-852"  = "Mua hộ hàng trên TMĐT. Mua máy cân da báo cước. Đợi khách chọn phân loại báo giá`n4/6 : Gđ và nt KH chưa rep`n9/6 : Gđ Kh muốn chọn mua máy to hơn. Sẽ liên hệ lại sau`n13/6 : Lhe Kh hỏi thăm`n23/6 : Gđ cho KH để hỗ trợ. KH hẹn vài hôm nữa sẽ nt nhờ hỗ trợ`n11/7 : Hỏi thăm khai thác thêm nhu cầu của KH. KH ko quan tâm"
    "lead-excel-19-165" = "[Mã KH: MH409 - Vũ Huyền] Hỏi KG : bánh đậu xanh, ... gửi sang TQ`nĐang tư vấn báo giá"
    "lead-excel-19-647" = "[Mã KH: MH409 - Vũ Huyền] Hỏi KG : bánh đậu xanh, ... gửi sang TQ`nĐang tư vấn báo giá"
    "lead-fb-37d916ff"  = "[Tin nhắn từ Fanpage]: Xin chào shop"
    "lead-1783756473912" = "Tư vấn vận chuyển linh kiện"
    "lead-excel-7-177"  = "MH : 20 cuộn băng dính 3M. Đã báo giá`n26/6 : Liên hệ KH chưa rep`n27/6 : Gđ ko liên lạc được"
    "lead-excel-7-457"  = "MH : 20 cuộn băng dính 3M. Đã báo giá`n26/6 : Liên hệ KH chưa rep`n27/6 : Gđ ko liên lạc được"
}

# Clean names map
$nameMap = @{
    "lead-excel-24-828" = "Ruby Nguyễn"
    "lead-excel-24-353" = "Ruby Nguyễn"
    "lead-excel-13-769" = "Quốc Khánh"
    "lead-excel-13-584" = "Quốc Khánh"
    "lead-excel-15-136" = "Bảo Ngọc Rice"
    "lead-excel-15-915" = "Bảo Ngọc Rice"
    "lead-excel-20-381" = "Hoàng Cường Biz"
    "lead-excel-20-352" = "Hoàng Cường Biz"
    "lead-excel-18-945" = "Sơn Quang Lâm"
    "lead-excel-18-472" = "Sơn Quang Lâm"
    "lead-1783705531795" = "Điểm Quỳnh"
    "lead-excel-23-268" = "Hương Vũ"
    "lead-excel-23-865" = "Hương Vũ"
    "lead-excel-16-636" = "Bình Minh Trần"
    "lead-excel-16-153" = "Bình Minh Trần"
    "lead-excel-8-208"  = "Vòng bi Phú Quý"
    "lead-excel-8-289"  = "Vòng bi Phú Quý"
    "lead-excel-27-206" = "Xuân Hải Đinh"
    "lead-excel-27-902" = "Xuân Hải Đinh"
    "lead-excel-12-541" = "Huyền Sky"
    "lead-excel-12-270" = "Huyền Sky"
    "lead-excel-22-732" = "Trần Hiếu"
    "lead-excel-22-789" = "Trần Hiếu"
    "lead-excel-3-180"  = "Thu Cao"
    "lead-excel-3-540"  = "Thu Cao"
    "lead-fb-81326ee0"  = "Khách Messenger 999"
    "lead-excel-17-316" = "Huơng Phạm"
    "lead-excel-17-112" = "Huơng Phạm"
    "lead-excel-5-422"  = "Hoangg Yen"
    "lead-excel-5-149"  = "Hoangg Yen"
    "lead-excel-10-495" = "Hoàng Phát Koffmann"
    "lead-excel-10-183" = "Hoàng Phát Koffmann"
    "lead-excel-11-603" = "Nha Phuong Bùi"
    "lead-excel-11-387" = "Nha Phuong Bùi"
    "lead-excel-14-444" = "Minh Tâm"
    "lead-excel-14-671" = "Minh Tâm"
    "lead-excel-25-788" = "Đinh Phúc An"
    "lead-excel-25-889" = "Đinh Phúc An"
    "lead-excel-26-504" = "Anh Pham"
    "lead-excel-26-849" = "Anh Pham"
    "lead-excel-9-806"  = "Mai Hồng VPP"
    "lead-excel-9-512"  = "Mai Hồng VPP"
    "lead-excel-21-298" = "Vũ Ngọc Huyền"
    "lead-excel-21-387" = "Vũ Ngọc Huyền"
    "lead-fb-2790d56a"  = "Minh Nguyễn"
    "lead-excel-28-503" = "Nextstone Vietnam"
    "lead-excel-28-399" = "Nextstone Vietnam"
    "lead-excel-4-874"  = "MH404 - Liên193"
    "lead-excel-4-950"  = "MH404 - Liên193"
    "lead-excel-6-494"  = "Dương Tóc"
    "lead-excel-6-575"  = "Dương Tóc"
    "lead-excel-2-352"  = "Phạm Thuận"
    "lead-excel-2-852"  = "Phạm Thuận"
    "lead-excel-19-165" = "Phạm Thị Anh Ngọc"
    "lead-excel-19-647" = "Phạm Thị Anh Ngọc"
    "lead-fb-37d916ff"  = "Khách Messenger Remote"
    "lead-1783756473912" = "Anh Phương"
    "lead-excel-7-177"  = "Nguyễn Lành"
    "lead-excel-7-457"  = "Nguyễn Lành"
}

$dbPath = "d:\antigravity\db.json"
$dbText = [System.IO.File]::ReadAllText($dbPath, $utf8NoBom)
$db = ConvertFrom-Json $dbText

$count = 0
foreach ($l in $db.leads) {
    if ($cleanMap.ContainsKey($l.id)) {
        $l.note = $cleanMap[$l.id]
        $count++
    }
    if ($nameMap.ContainsKey($l.id)) {
        $l.name = $nameMap[$l.id]
    }
    if ($l.failReason) {
        $l.failReason = "Khách hàng ko quan tâm"
    }
}

$db.dbVersion = "20.85"

$jsonString = ConvertTo-Json $db -Depth 15
[System.IO.File]::WriteAllText("d:\antigravity\db.json", $jsonString, $utf8NoBom)
[System.IO.File]::WriteAllText("d:\antigravity\minhhai_crm_deploy\db.json", $jsonString, $utf8NoBom)

Write-Output "Successfully updated $($count) leads notes and names in db.json to v20.85!"
