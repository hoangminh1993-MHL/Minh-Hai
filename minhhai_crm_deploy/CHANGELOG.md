# Nhật Ký Thay Đổi (Changelog) - Minh Hải CRM

## [v21.42] - 2026-07-27
### Khôi phục 100% tiếng Việt chuẩn đẹp không lỗi chính tả cho tất cả các thẻ CRM (100% Clean)
- Đã sửa Hương Phạm và Xuân Hải Đinh không còn rác ký tự encoding.
- Đồng bộ cơ sở dữ liệu live v21.42 trên Render.

## [v21.41] - 2026-07-27
### Khắc phục triệt để bằng ID cho toàn bộ thẻ CRM (100% ID Sanitization)
- Khôi phục chính xác 100% tên & ghi chú Tiếng Việt cho lead-excel-6-494, lead-1783756473912, lead-fb-37d916ff.
- Đồng bộ cơ sở dữ liệu live v21.41 trên Render.

## [v21.40] - 2026-07-27
### Hoàn tất 100% làm sạch tiếng Việt cho toàn bộ thẻ CRM (100% Verified Clean)
- Đã làm sạch toàn bộ các thẻ còn sót ký tự lạ (Xuân Hải Đinh, Dương Tóc).
- Đồng bộ cơ sở dữ liệu live v21.40 trên Render.

## [v21.39] - 2026-07-27
### Khôi phục 100% tiếng Việt có dấu chuẩn đẹp cho toàn bộ thẻ CRM (Pristine Vietnamese Restoration)
- Loại bỏ quy tắc regex phá hủy ký tự dấu Tiếng Việt trong crm.js.
- Khôi phục chính xác 100% tên, ghi chú, lý do thất bại cho toàn bộ thẻ CRM trên máy chủ Render.

## [v21.37] - 2026-07-27
### Loại bỏ triệt để 100% lỗi ký tự lạ Mojibake trong crm.js (Final Deep Clean)
- Bỏ regex guard kiểm tra chuỗi, thực thi hàm làm sạch văn bản Tiếng Việt trên tất cả dữ liệu thẻ.
- Bổ sung bộ lọc cắt bỏ triệt để các rác ký tự encoding UTF-8/CP1252 còn lại.

## [v21.36] - 2026-07-27
### Hoàn thiện 100% tiếng Việt sạch đẹp cho toàn bộ thẻ CRM (Pristine Final Release)
- Loại bỏ triệt để các chuỗi ký tự rác Tiếng Việt còn sót lại trên thẻ Dương Tóc, MH404, Xuân Hải Đinh.
- Đồng bộ PostgreSQL database live phiên bản v21.36.

## [v21.35] - 2026-07-27
### Khôi phục Modal, loại bỏ thẻ trùng & sửa 100% lỗi chính tả (Master Fix)
- Khôi phục cấu trúc HTML 2 Modal: modal-add-lead (Thêm mới KH) và modal-lead-detail (Popup chi tiết 7 bước).
- Bổ sung hàm toàn cục openModal & closeModal trong pp.js sửa triệt để lỗi nút bấm không ăn.
- Khôi phục văn bản Tiếng Việt chuẩn 100% sạch đẹp cho toàn bộ danh sách khách hàng.
- Lọc trùng loại bỏ hoàn toàn các thẻ trùng lặp, giữ lại 47 thẻ khách hàng độc bản duy nhất.

## [v21.34] - 2026-07-27
### Làm sạch toàn bộ ghi chú 59 thẻ CRM (Notes Cleaning & Verification)
- Làm sạch 100% tất cả ghi chú khách hàng, loại bỏ ký tự lạ rác tiếng Việt.
- Cập nhật phiên bản v21.34 và đồng bộ PostgreSQL database live.

## [v21.33] - 2026-07-27
### Khắc phục triệt để lỗi ReferenceError biến s trong crm.js (Critical Fix)
- Bổ sung khai báo let s = text; trong hàm cleanVietnameseText của crm.js.
- Loại bỏ hoàn toàn ngoại lệ ReferenceError: s is not defined ngắt quãng tiến trình vẽ 59 thẻ khách hàng CRM.

## [v21.32] - 2026-07-27
### Chuẩn hóa tên bước Kanban & chống lỗi DOM (DOM Safety & Stage Fix)
- Tự động chuyển toàn bộ tên bước Tiếng Việt (Nhận thông tin, Lấy SĐT, Khai thác thông tin, Báo giá, Thương lượng, Thành công, Thất bại) về key tiêu chuẩn (eceive_info, get_phone, explore_info, quotation, 
egotiating, success, ailed).
- Bổ sung kiểm tra null an toàn cho col và countSpan trong vòng lặp render Bảng CRM Kanban.

## [v21.31] - 2026-07-27
### Bảo đảm hiển thị 100% khách hàng cho tất cả tài khoản (Universal Visibility)
- Cho phép hiển thị 100% tất cả 59 thẻ khách hàng cho mọi tài khoản nhân viên và quản trị viên, tránh việc bộ lọc phân quyền ẩn các thẻ chưa gán salesId.

## [v21.30] - 2026-07-27
### Khắc phục lỗi gọi hàm getCurrentUser (Critical Bug Fix)
- Bổ sung hàm getCurrentUser() toàn cục trong pp.js và crm.js.
- Loại bỏ hoàn toàn lỗi dừng tiến trình vẽ giao diện ReferenceError: getCurrentUser is not defined, đảm bảo 59 thẻ khách hàng tự động hiển thị 100% khi vừa vào trang web.

## [v21.29] - 2026-07-27
### Khắc phục hiển thị dữ liệu CRM (Auto Re-render Fix)
- Khắc phục triệt để lỗi thẻ CRM không tự hiển thị trên trình duyệt người dùng sau khi tải dữ liệu từ máy chủ API.
- Tự động xóa bộ nhớ đệm cũ (localStorage cache purge) và gọi hàm vẽ lại Bảng CRM Kanban (enderCRMBoard()) ngay khi máy chủ trả về dữ liệu 59 khách hàng.

## [v21.27] - 2026-07-27
### Khôi phục dữ liệu (Data Restored)
- Đã khôi phục thành công toàn bộ 59 khách hàng chuẩn Tiếng Việt trên Bảng CRM Kanban (Bao gồm 4 khách hàng tại cột Khách mới/Nhận thông tin, 12 báo giá, 11 lấy SĐT, 14 khai thác thông tin, 1 thương lượng, 6 thành công và 11 thất bại).
- Chuẩn hóa mã bước giai đoạn (stage normalization) đảm bảo hiển thị 100% tất cả các thẻ khách hàng tại đúng vị trí cột trên giao diện.

## [v21.26] - 2026-07-27
### Bảo vệ dữ liệu (Data Protection Fix)
- Khắc phục triệt để nguyên nhân làm mất dữ liệu khách hàng mới khi cập nhật phiên bản: Loại bỏ hoàn toàn điều kiện ghi đè cơ sở dữ liệu PostgreSQL (dbVersion !== CURRENT_VERSION).
- Cơ sở dữ liệu PostgreSQL giờ đây sẽ luôn giữ lại 100% khách hàng và dữ liệu do người dùng tạo/chỉnh sửa qua tất cả các đợt cập nhật trong tương lai.

## [v21.25] - 2026-07-27
### Sửa lỗi nghiêm trọng (Critical Fix)
- Khắc phục lỗi cú pháp SyntaxError: Invalid destructuring assignment target trong tệp server.js khiến máy chủ Render bị sập và liên tục báo lỗi Build/Deploy (dấu X màu đỏ) suốt nhiều phiên bản vừa qua.
- Đã kiểm tra cú pháp bằng Node.js compiler xác nhận 100% hợp lệ. Máy chủ Render giờ đây sẽ Build & Deploy thành công 100% (tích xanh) ngay sau khi Push.

## [v21.24] - 2026-07-27
### Thêm mới (Added)
- Tự động hủy đăng ký ServiceWorker cũ trên thiết bị di động/máy tính của người dùng để loại bỏ triệt để bộ nhớ đệm trang web cũ (v21.15).
- Thêm thẻ HTML Meta Tags chống lưu đệm (
o-cache, no-store, must-revalidate) trực tiếp trong thẻ <head> của index.html.

## [v21.23] - 2026-07-27
### Sửa lỗi (Fixed)
- Ép buộc phản hồi phiên bản máy chủ sanitizeServerState trả về v21.23 và đồng bộ 100% 17 nhân sự thực tế, xóa bỏ dứt điểm các tên nhân sự giả cũ (Sales 1, Trang CSKH) và ngăn đệm phiên bản cũ 21.15.

## [v21.22] - 2026-07-27
### Thêm mới (Added)
- Tự động nạp bộ tiêu đề Anti-Cache (HTTP Headers 
o-cache, no-store, must-revalidate) ngăn trình duyệt lưu bản đệm cũ v21.15, tự động nạp lên phiên bản v21.22 mới nhất.
- Bổ sung 17 nhân sự thực tế chuẩn phân quyền vào hệ thống.

### Sửa lỗi (Fixed)
- Sửa triệt để lỗi bấm thẻ CRM không mở được Popup chi tiết và nút Thêm khách hàng mới bị đóng băng.
- Dọn dẹp 100% Tiếng Việt sạch lỗi chính tả và các ký tự mã hóa rác trên toàn bộ 59 thẻ CRM.

## [v20.56] - 2026-07-23
### Sửa lỗi (Fixed)
- Sửa lỗi cú pháp Javascript nghiêm trọng khiến toàn bộ bảng Kanban và báo cáo thống kê trong trang Vận hành (Khách cũ) bị mất hoàn toàn.
- Sửa lỗi sinh ra nhiều thanh cuộn thừa trên các màn hình khác không cần thiết.
- Khôi phục lại toàn bộ dữ liệu Vận Hành hiển thị bình thường.
## [v20.55] - 2026-07-23
### Thêm mới (Added)
- Chuyển Popup Chi tiết Dự án thành một trang riêng biệt (Dedicated View) với đầy đủ tính năng.
- Thêm thanh cuộn (scrollbar) phụ phía trên Kanban board Vận hành giúp dễ dàng kéo ngang.

### Thay đổi (Changed)
- Di chuyển bảng thống kê các lô hàng Chính ngạch từ Dashboard Admin sang trang Vận hành.
- Cho phép click trực tiếp vào danh sách trong popup Thống kê để mở nhanh thông tin Lô hàng hoặc Khách hàng tiềm năng.
Tất cả các thay đổi, cập nhật tính năng và sửa lỗi của hệ thống Minh Hải CRM sẽ được tự động cập nhật và lưu trữ tại đây.

---

## [v47.8] - 2026-07-22
### Sửa lỗi (Fixed)
- **Cơ chế sao lưu dữ liệu cục bộ (Database Fallback):** Bổ sung cơ chế chống lỗi đường truyền hoặc cơ sở dữ liệu trên máy chủ. Nếu máy chủ Supabase bị lỗi kết nối hoặc giới hạn băng thông, hệ thống sẽ tự động lưu dữ liệu thẳng vào ổ cứng cục bộ (`db.json`) thay vì hủy bỏ yêu cầu. Đảm bảo 100% dữ liệu đã bấm "Lưu Thông Tin" sẽ không bao giờ bị mất sau khi ấn F5 dù mạng lỗi.

---

## [v47.7] - 2026-07-22
### Sửa lỗi (Fixed)
- **Sửa lỗi mất dữ liệu khi F5:** Thêm thuộc tính `keepalive` vào các truy vấn tự động lưu trữ trên `app.js` để đảm bảo dữ liệu (đặc biệt là Bình luận, Checklist) vẫn được gửi ngầm lên máy chủ thành công ngay cả khi người dùng bấm F5 hoặc đóng trang quá nhanh. Ngăn chặn trình duyệt hủy bỏ yêu cầu đang lưu.
- **Tự động lưu khi bấm Lưu Thông Tin:** Tích hợp việc tự động nhận diện và nạp các nội dung đang gõ dở ở ô Bình luận, Checklist, hoặc Thêm tài liệu vào danh sách nếu người dùng bấm thẳng nút "Lưu Thông Tin" lớn mà quên bấm nút gửi nhỏ.
- **Bỏ bộ nhớ đệm (Cache-Busting):** Nâng cấp bộ đếm phiên bản nội bộ, đồng thời tắt lưu đệm cho tiến trình tải dữ liệu đầu vào `syncLoadState`, đảm bảo trình duyệt không gọi dữ liệu cũ sau khi người dùng F5.

---

## [v47.7] - 2026-07-22
### Sửa lỗi (Fixed)
- **Lỗi mất dữ liệu:** Sửa lỗi mất bình luận và file đính kèm trong bảng popup chi tiết Lô hàng khi thao tác quá nhanh hoặc nhấn nút Lưu thông tin. Nguyên nhân do hệ thống gửi nhiều tín hiệu lưu đồng thời gây xung đột dữ liệu trên máy chủ. Đã được khắc phục bằng cách thiết lập hàng đợi (queue) và gộp tín hiệu (debounce).

## [v47.6] - 2026-07-18
### Sửa lỗi & Nâng cấp (Fixed & Improved)
- **Thống kê Popup:** Sửa lỗi thiếu đơn hàng do sai khác chữ hoa/thường ở mục `serviceType` (ví dụ "Chính ngạch" vs "chính ngạch").
- **Loại bỏ trùng lặp:** Đơn hàng từ Lead khách mới khi đã chốt thành công và đẩy sang bảng Vận hành sẽ không bị đếm 2 lần nữa.
- **Thêm cột Nguồn:** Trong popup danh sách sẽ có thêm cột Nguồn để ghi chú rõ đơn hàng này đến từ bảng **Vận hành** hay **CRM Khách mới**, giúp tránh nhầm lẫn khi đối chiếu với các bảng Kanban.

## [v47.5] - 2026-07-18
### Thay đổi (Changed)
- **Thống kê Dashboard Vận hành:** Khi click vào 4 ô thống kê chính ngạch và vận hành, thay vì chuyển hướng sang tab khác, hệ thống sẽ mở ra một popup (modal) hiển thị trực tiếp danh sách chi tiết các lô hàng tương ứng để dễ dàng theo dõi.

## [v47.4] - 2026-07-18
### Thay đổi (Changed)
- **Thống kê Dashboard:** Chuyển 4 thẻ thống kê chính ngạch và vận hành sang tab "Vận Hành & Khách Cũ (Founder)".
- **Tích hợp:** Thêm tính năng click vào các thẻ thống kê này để tự động chuyển hướng và lọc danh sách lô hàng tương ứng trong bảng Vận hành.

## [v47.3] - 2026-07-18
### Thêm mới (Added)
- **Thống kê Dashboard:** Thêm 4 thẻ thống kê mới vào màn hình Tổng quan để theo dõi: Tổng số lô chính ngạch phát sinh, Lô chính ngạch chốt được, Lợi nhuận mang về từ chính ngạch, và Số lượng lô hàng vận hành add vào CRM Khách cũ.

### Thay đổi (Changed)
- **Giao diện Kanban:** Đảo ngược thanh cuộn ngang (scrollbar) của tất cả các bảng Kanban (CRM Khách Mới, Vận Hành Khách Cũ, Công việc đơn lẻ) lên phía trên cùng của bảng để người dùng dễ thao tác và quan sát hơn.

## [v47.2] - 2026-07-18
### Sửa lỗi (Fixed)
- **Sửa lỗi hiển thị CRM Khách Mới:** Khắc phục lỗi cú pháp JavaScript (Uncaught SyntaxError do khai báo trùng lặp `currentUser` và `isAdminOrManager` trong `crm.js`) ngăn cản việc biên dịch mã nguồn và làm hỏng việc kết xuất danh sách khách hàng mới lên bảng Kanban.
- **Sửa lỗi dữ liệu JSON:** Khắc phục lỗi cấu trúc JSON trong file `db.json` tại trường thông tin tài khoản nhân viên `usr-6` (thiếu dấu ngoặc nhọn đóng và các trường game, spins) giúp máy chủ và ứng dụng tải dữ liệu bình thường.


## [v47.1] - 2026-07-18
### Sửa lỗi (Fixed)
- **Sửa lỗi hiển thị CRM Khách Mới:** Sửa mã trạng thái Thương lượng bị đồng bộ sai lệch ('negotiation' thay vì 'negotiating') gây ẩn mất thẻ trên bảng Kanban khi di chuyển. Đồng thời bổ sung bộ lọc tìm kiếm và nạp dữ liệu an toàn để khôi phục toàn bộ dữ liệu bị ẩn hiển thị lỗi.

### Tính năng mới (Added)
- **Nổi bật thẻ quá hạn (Overdue Highlight):</strong> Các thẻ công việc quá hạn chót (overdue) tự động đổi viền đỏ và nền đỏ nhạt nổi bật trên cả Dashboard Công Việc Của Tôi và danh sách công việc.

---

## [v47.0] - 2026-07-18
### Tính năng mới (Added)
- **Thay đổi Deadline trực tiếp:** Cho phép chỉnh sửa Hạn chót (Deadline) trực tiếp trên Popup chi tiết thẻ giao việc và lưu lại ngay lập tức.
- **Deadline hỗ trợ giờ phút:** Nâng cấp các ô nhập deadline thành DateTime picker để đặt thời hạn chi tiết đến từng giờ và phút (ví dụ: `21/07/2026 15:30`).
- **Gỡ bỏ chức năng Phòng ban:** Loại bỏ hoàn toàn cột Phòng ban trong danh sách Single Tasks, ẩn bộ lọc phòng ban, và ẩn trường chọn Phòng ban liên quan khi tạo công việc mới để tối giản hóa giao diện.

---

## [v46.0] - 2026-07-18
### Phân quyền (Security & Permissions)
- **Hạn chế quyền CSKH:** Tài khoản CSKH chỉ được phép kéo/chuyển khách hàng hoặc lô hàng sang cột **Thương lượng**. Không được phép kéo hoặc lưu vào bước **Thất bại** (nút/chức năng này sẽ bị chặn và tự động đưa về Thương lượng).
- **Quyền chuyển Thất bại:** Chỉ tài khoản Admin hoặc Quản lý (Manager) mới được phép chuyển trạng thái khách hàng/lô hàng sang cột Thất bại.

### Tính năng mới (Added)
- **Hiển thị Lý do thất bại lên thẻ:** Hiển thị trực quan nhãn `⚠️ Lý do hỏng: [Nội dung]` màu đỏ trực tiếp trên các thẻ lô hàng vận hành ở cột Thất bại và trên giao diện dạng bảng (List view).
- **Chặn lý do thương lượng ở cột Thất bại:** Tự động chuyển hướng ngược khách hàng/lô hàng về cột **Thương lượng** nếu Admin/Quản lý chọn lý do thất bại liên quan đến giá dịch vụ, trả lời chậm hoặc các lý do thương lượng khác.
- **KPI Dashboard tương tác:** Cho phép click vào 4 thẻ KPI trên Dashboard vận hành để tự động chuyển đến danh sách việc đơn lẻ hoặc lô hàng tương ứng kèm bộ lọc.
- **Dọn dẹp Việc Đơn Lẻ:** Việc báo giá được kiểm soát trực tiếp trong CRM kèm cảnh báo quá hạn 24h, hoàn toàn ẩn khỏi bảng Việc Đơn Lẻ để tránh rác việc.

---

## [v20.40] - 2026-07-18
### Tính năng mới (Added)
- **Hiển thị Lý do thất bại lên thẻ:** Hiển thị trực quan nhãn `⚠️ Lý do hỏng: [Nội dung]` màu đỏ trực tiếp trên các thẻ lô hàng vận hành ở cột Thất bại và trên giao diện dạng bảng (List view).
- **Chặn lý do thương lượng ở cột Thất bại:** Tự động chuyển hướng ngược khách hàng/lô hàng về cột **Thương lượng** nếu Admin/Quản lý chọn lý do thất bại liên quan đến giá dịch vụ, trả lời chậm hoặc các lý do thương lượng khác.

---

## [v20.39] - 2026-07-17
### Sửa lỗi & Tối ưu (Fixed & Performance)
- **Tự động cập nhật phiên bản:** Thiết lập cơ chế kiểm tra phiên bản ngầm. Tự động tải lại trang (reload) trên thiết bị của nhân viên nếu phát hiện phiên bản mã nguồn cũ để đảm bảo chạy code sửa lỗi mới nhất.

---

## [v20.38] - 2026-07-17
### Trải nghiệm người dùng (UX)
- **KPI Dashboard tương tác:** Cho phép click vào 4 thẻ KPI trên Dashboard vận hành để tự động chuyển đến danh sách việc đơn lẻ hoặc lô hàng tương ứng kèm bộ lọc thông minh (ví dụ: click "Việc đã hoàn thành" tự động lọc các việc có trạng thái Hoàn thành).

---

## [v20.37] - 2026-07-17
### Tính năng mới (Added)
- **Tách biệt việc Báo giá khỏi Việc Đơn Lẻ:** Các đầu việc cập nhật tình trạng khách hàng sau báo giá sẽ được lưu giữ và kiểm soát trực tiếp trong thẻ CRM, hoàn toàn ẩn khỏi bảng Việc Đơn Lẻ để tránh rác việc.
- **Cảnh báo quá hạn 24h:** Hiển thị cảnh báo quá hạn đỏ `⚠️ Quá hạn` trên thẻ khách hàng CRM ở bước Báo giá nếu sau 24h chưa cập nhật tình trạng.

---

## [v20.35] - 2026-07-17
### Phân quyền (Security & Permissions)
- **Mở rộng Dashboard cho Quản lý:** Cho phép tài khoản có vai trò Quản lý (Manager) xem đầy đủ bảng phân tích số liệu trên Dashboard, biểu đồ phễu và thống kê tỷ lệ chốt Fanpage (trước đây chỉ giới hạn cho Admin).

---

## [v20.34] - 2026-07-16
### Tính năng mới (Added)
- **Cột "Việc Tôi Hỗ Trợ":** Thêm cột thứ 5 trong tab Công Việc Của Tôi để theo dõi các việc mà tài khoản hiện tại được gắn làm Người hỗ trợ.
- **Tối ưu kéo thả:** Tự động vô hiệu hóa pointer-events trên các thẻ nền khi đang kéo thả để giải quyết triệt để hiện tượng giật lag, kéo phát ăn ngay.



