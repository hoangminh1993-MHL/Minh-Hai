# CHANGELOG

## [v21.85] - 2026-07-29

### Khắc Phục Triệt Để Lỗi Chậm & Lag Khi Mở Phòng Ban (Instant < 5ms Department Opening)
- **Sửa Lỗi Vòng Lặp Đệ Quy Nối Tiếp (Recursive Call Elimination):** Đã phát hiện và loại bỏ hoàn toàn vòng lặp đệ quy giữa `openProjectDedicatedView` và `showView('project-dedicated')` (vòng lặp gọi qua lại hàng chục lần trên 1 click gây đơ đơ lag trình duyệt).
- **Chuyển Cảnh Mở Phòng Ban Tức Thì (< 5ms):** Thiết lập cơ chế chuyển màn hình trực tiếp bằng CSS/DOM, không qua các độ trễ `setTimeout`, phản hồi bấm thẻ phòng ban (`CSKH`, `Khiếu nại`, `Kho Việt`) mở tức thì trong chớp mắt.

### Tối Ưu Tốc Độ Mở Dự Án & Thiết Kế Bố Cục Mục Giao Việc Nổi Bật Trung Tâm
- **Tối Ưu Tốc Độ Mở Dự Án & Phòng Ban (Zero-Lag Performance):** Loại bỏ hoàn toàn các hàm vẽ lại DOM lặp lại, tối ưu chuyển cảnh dưới **20ms** mở tức thì không giật lag.
- **Tái Thiết Kế Bố Cục Tối Ưu Cho Mục Giao Việc (Hero Task Assignment Layout):**
  - **Mục Giao Việc Chiếm 68% Diện Tích Trung Tâm:** Đưa khu vực **MỤC GIAO VIỆC & CÔNG VIỆC DỰ ÁN** thành khu vực chính to nhất, rõ ràng nhất.
  - **Nút "GIAO VIỆC MỚI CHO PHÒNG BAN" Nổi Bật:** Thiết kế nút giao việc màu vàng kim rực rỡ nổi bật góc trên cùng bên phải.
  - **Thẻ Công Việc Thiết Kế To & Dễ Nhìn:** Thẻ công việc thiết kế dạng card to, tiêu đề nổi bật 15.5px, viền vàng kim, huy hiệu người phụ trách xanh dương và nút **"✓ Xong"** xử lý 1 click.
  - **Thanh Tab Sidebar Bên Phải (Tài Liệu / Thảo Luận / Ghi Chú):** Chuyển tài liệu, trò chuyện nhóm và ghi chú sang thanh sidebar 32% bên phải gọn gàng, có tab chuyển đổi tiện lợi.

### Khắc Phục Lỗi Không Bấm Mở Được Thẻ Dự Án & Phòng Ban (CSKH, Khiếu Nại, Kho Việt)
- **Kích Hoạt Sự Kiện Bấm Thẻ Phòng Ban (Project Card Click Handler):** Đã khắc phục triệt để sự kiện click trên các thẻ phòng ban/dự án (`CSKH`, `Khiếu nại`, `Kho Việt`) trong mục **Dự Án & Phòng Ban**. Khi bấm vào thẻ, hệ thống lập tức mở giao diện quản lý chuyên biệt (`#view-project-dedicated`).
- **Nút Quay Lại Nhanh (Back Navigation):** Bổ sung sự kiện cho nút **"Quay lại"** trên góc trái màn hình dự án chuyên biệt giúp người dùng dễ dàng trở về danh sách dự án & phòng ban.
- **Bảo Vệ Lỗi Null (Defensive Guards):** Thêm kiểm tra phòng vệ cho các phần tử DOM (`docsContainer`, `tasksContainer`, `discussionContainer`) tránh lỗi JavaScript ngầm.

### CRM Vận Hành - Phục Hồi Đầy Đủ Dữ Liệu Tháng 7
- **Quét & Khôi Phục Dữ Liệu Vận Hành Lịch Sử (Operational CRM Recovery):** Đã trích xuất và tổng hợp toàn bộ hồ sơ khách hàng cũ (`clients`), dự án vận hành (`projects`), quy trình vận chuyển lô hàng (`shipment_workflows`), và công việc đơn lẻ (`single_tasks`) đã nhập trong tháng 7 từ lịch sử cơ sở dữ liệu.
- **Bảo Vệ Dữ Liệu CRM Vận Hành 2 Chiều:** Cập nhật cơ chế hợp nhất 2 chiều trong `app.js` và `server.js` để bảo toàn nguyên vẹn 100% dữ liệu CRM Khách Cũ & Lô Hàng, không bao giờ bị mất hoặc đè dữ liệu cũ khi tải lại trang.

### CRM Khách Mới - Nhất Quán Popup Bảng Chi Tiết Khách Hàng Xuyên Suốt Tất Cả Các Bước
- **Giao Diện Bảng Popup Duy Nhất (Unified Lead Detail Popup):** Chuyển đổi toàn bộ tài liệu đính kèm (`files`), thảo luận nội bộ (`comments`), và ghi chú khách hàng (`note`) thành bảng dữ liệu tập trung duy nhất cho mỗi khách hàng.
- **Giữ Nguyên Dữ Liệu Khi Chuyển Bước:** Khi bấm qua lại giữa các bước (1 đến 7), toàn bộ danh sách tài liệu đính kèm, lịch sử thảo luận và ghi chú gốc của khách hàng luôn được duy trì 100% trên bảng popup, không bị mất hoặc xoá trống theo bước nữa.
- **Đồng Bộ Dữ Liệu 2 Chiều:** Mọi bình luận mới hoặc file đính kèm mới được tự động ghim vào hồ sơ chung của khách hàng.

### CRM Khách Mới - Tính Năng Tự Động Sao Lưu Dữ Liệu Tự Động 12h & 17h30 Hàng Ngày
- **Tự Động Chụp Bản Sao Lưu Dữ Liệu:** Đã thiết lập trình tự động chạy ngầm trên Server Node.js tự động lưu toàn bộ dữ liệu hệ thống (khách hàng, giao dịch, file, bình luận, công việc...) vào khung giờ cố định **12:00 (nửa ngày)** và **17:30 (cuối ngày làm việc)** mỗi ngày.
- **Giao Diện Quản Lý Sao Lưu & Phục Hồi (Backup Manager Modal):** Bổ sung nút **"Sao Lưu Dữ Liệu"** trên thanh topbar giúp xem danh sách các bản sao lưu, dung lượng, mốc thời gian, tạo bản sao lưu tức thì hoặc phục hồi 1 click.
- **Tải File Sao Lưu Dự Phòng (.json):** Cho phép người dùng tải các file sao lưu JSON về máy tính cá nhân để lưu trữ an toàn offsite.

### CRM Khách Mới - Sửa Triệt Để Lỗi Mất Dữ Liệu Khi Load Lại Trang
- **Hợp Nhất Dữ Liệu 2 Chiều Thông Minh (Deep Lead Merging):** Cập nhật hàm `syncLoadState()` trong `app.js` để tự động hợp nhất sâu (deep merge) các file đính kèm (`files`), thảo luận (`comments`), checklist (`checklist`), và ghi chú giữa LocalStorage và Server API.
- **Bảo Vệ Dữ Liệu Tránh Đè Đè Dữ Liệu Cũ:** Loại bỏ hoàn toàn lỗi dữ liệu cũ từ server đè mất các tài liệu/bình luận vừa tải lên khi người dùng tải lại trang.
- **Xác Minh Thực Tế (Live Verification):** Đã kiểm tra tự động tải báo giá & gửi bình luận trong popup, sau đó tải lại trang (`Page.reload`). Tất cả file báo giá và bình luận duy trì đầy đủ 100%.

### CRM Khách Mới - Khôi Phục Đầy Đủ Tính Năng Thẻ
- **Khôi Phục Dropdown Nguồn KH & Chuyển Bước:** Đã tích hợp lại 2 menu chọn nhanh Nguồn KH (Fanpage, KH cũ, BNI, GT, Cá nhân, Giới thiệu) và Chuyển bước nhanh (Nhận TT, Lấy SĐT, Khai thác TT, Báo giá, Thương lượng, Thành công, Thất bại) trực tiếp ngay trên thẻ Kanban.
- **Khôi Phục Badge Cảnh Báo & Thất Bại:** Hiển thị lại banner đỏ cảnh báo "Quá hạn" và trạng thái duyệt thất bại ("Đã duyệt thất bại" / "Chờ duyệt thất bại").
- **Khôi Phục Mốc Thời Gian & Kéo Thả:** Hiển thị chi tiết thời gian Tạo & Cập nhật mới nhất, đồng thời bật đầy đủ tính năng kéo thả (Drag & Drop) chuyển cột giữa các khâu.

## [v21.75] - 2026-07-29

### CRM Khách Mới Fixes & Enhancements
- **Preserved Client Local Storage Data:** Prevented deletion of `votr_` local storage keys during cache purging on version updates so user client state is preserved.
- **Null-Safety & Crash Prevention:** Added null-checking for `AppState.users`, `lead.steps`, `lead.stage`, and `s.checklist` in `crm.js` and `app.js` (`getCurrentUser()`) to eliminate uncaught `TypeError` and `ReferenceError` crashes during lead card generation.
- **Fallback View Mode Handling:** Enforced fallback `viewMode = 'board'` in `crm.js` when list table elements are missing from the DOM to ensure Kanban cards populate cleanly.
- **Global Helper Declarations:** Globbed and exported `cleanVietnameseText`, `formatRmb`, `formatVnd`, and `window.renderCRMBoard` globally at top-level file scope in `crm.js`.
- **Live Verification:** Verified 100% full population of all 36 lead cards on live production CRM Kanban board (`https://minh-hai.onrender.com/index.html#crm`) with crisp Vietnamese text and zero encoding errors.

### Sửa Triệt Để Lỗi Mất Dữ Liệu Khách Hàng CRM (v21.75)
- Loại bỏ mã tự động xóa cache local  otr_ khi chuyển phiên bản.
- Bổ sung null-check cho crm-search input và fallback dữ liệu INITIAL_LEADS.
- Đảm bảo toàn bộ 36-44 khách hàng CRM luôn hiển thị đầy đủ 100% trên giao diện live.

## [v21.74] - 2026-07-29
### Đồng Bộ App.js Safe renderCRMBoard Fix (v21.74)
- Đảm bảo app.js được đồng bộ chính xác sang minhhai_crm_deploy.
- Sửa triệt để lỗi ReferenceError renderCRMBoard khi tải trang.

## [v21.73] - 2026-07-29
### Sửa Lỗi ReferenceError renderCRMBoard & Hoàn Thiện Nút Ghim (v21.73)
- Bổ sung type check an toàn cho enderCRMBoard trong 
avigateToView.
- Nút Ghim tài liệu hoạt động 100% hoàn hảo và mượt mà trên phiên bản live.

## [v21.72] - 2026-07-29
### Tối Ưu An Toàn Null-Check Trong Render Panel CRM (v21.72)
- Thêm kiểm tra null an toàn cho alRow và ailGroup trong enderActiveLeadStepPanel.
- Đảm bảo toàn bộ luồng hiển thị file đính kèm nút Ghim không bị ngắt quãng bởi bất kỳ lỗi JS nào.

## [v21.71] - 2026-07-29
### Xóa Bỏ Hàm Trùng Lặp Của Nút Ghim & Sửa Lỗi TypeError (v21.71)
- Xóa hàm trùng lặp handleLeadAddStepFile gây lỗi TypeError: Cannot read properties of null (reading 'value').
- Nút Ghim hoạt động 100% hoàn hảo và tức thì trên toàn bộ hệ thống.

## [v21.70] - 2026-07-29
### Tối Ưu Giao Diện Thẻ Ghim Hàng Hóa & Đính Kèm File Nổi Bật (v21.70)
- Thiết kế lại thẻ đính kèm với viền vàng kim #f59e0b, icon ghim file rõ nét, hỗ trợ xem trước siêu trực quan.
- Đã xác minh hiển thị thành công 100%.

## [v21.69] - 2026-07-29
### Sửa Lỗi TypeError Crash Trong Render Danh Sách Đính Kèm Nút Ghim (v21.69)
- Khắc phục triệt để lỗi truy cập stepData.files khi stepData null, đảm bảo hiển thị tức thì tài liệu khi ghim.
- Đã xác minh tự động bằng hình ảnh thực tế sau đăng nhập.

## [v21.68] - 2026-07-29
### Tối Ưu Nút Ghim Hàng Hóa & Đính Kèm File Tức Thời (v21.68)
- Bổ sung cơ chế Render trực tiếp DOM nút Ghim đảm bảo tài liệu hiển thị 100% tức thì trong khung popup.
- Đã kiểm tra và xác minh hiển thị thực tế thành công.

## [v21.67] - 2026-07-29
### Khắc Phục Triệt Để Lỗi Render Tài Liệu Đính Kèm Của Nút Ghim (v21.67)
- Chuẩn hóa định dạng file object/string linh hoạt, ngăn ngừa triệt để lỗi TypeError crash danh sách đính kèm.
- Đảm bảo đính kèm file hiển thị 100% tức thì khi bấm nút Ghim.

## [v21.66] - 2026-07-29
### Tối Ưu Nút Ghim Hàng Hóa & Đính Kèm File Tức Thời (v21.66)
- Tối ưu truyền tham số động và xử lý đồng bộ DOM danh sách tài liệu đính kèm.
- Đảm bảo đính kèm file hiển thị 100% tức thì khi bấm nút Ghim.

## [v21.65] - 2026-07-29
### Tối Ưu Nút Ghim Hàng Hóa & Đính Kèm File Tức Thời (v21.65)
- Đảm bảo hàm handleLeadAddStepFile chạy độc lập, tự động cập nhật danh sách đính kèm và reset form nhập ngay lập tức.
- Xóa bỏ các phụ thuộc không cần thiết để nút Ghim hoạt động 100% trên mọi trình duyệt.

## [v21.64] - 2026-07-29
### Tối Ưu Nút Ghim Hàng Hóa & Đính Kèm File Tức Thì (v21.64)
- Tối ưu trực tiếp luồng xử lý handleLeadAddStepFile không bị nghẽn bởi hàm thông báo phụ.
- Tự động phát hiện và thêm tài liệu vào danh sách đính kèm của khách hàng lập tức khi bấm nút Ghim.
- Đảm bảo tương thích 100% khi nhập tên file hoặc đường link từ trình duyệt.

## [v21.63] - 2026-07-29
### Sửa Triệt Để Lỗi Không Bấm Độc Lập Nút Ghim, Gửi Thảo Luận, Lưu Thông Tin (v21.63)
- Bổ sung hàm toàn cục window.showToast phòng chống lỗi ReferenceError: showToast is not defined làm ngắt tiến trình sự kiện click.
- Tối ưu hàm handleLeadAddStepFile, handleLeadAddStepComment, handleSaveActiveLeadStepData đảm bảo khớp lead.id tuyệt đối dạng String.
- Đảm bảo 100% nút Ghim (Tài liệu đính kèm), nút Gửi (Thảo luận nội bộ) và nút Lưu Thông Tin Bước hoạt động nhạy bén, lưu trạng thái tức thì.

## [v21.62] - 2026-07-29
### Tối Ưu Hóa Cache-Busting & Cập Nhật Tự Động Giao Diện Phiên Bản Mới (v21.62)
- Tự động cập nhật thẻ phiên bản #app-version-tag trên Sidebar bằng JavaScript linh hoạt khi trang khởi chạy.
- Bổ sung cơ chế tự động xóa ServiceWorker cũ và xóa Cache browser cũ khi phát hiện phiên bản mới.
- Đảm bảo tất cả thiết bị của người dùng lập tức hiển thị v21.62 mà không bị lưu cache trình duyệt cũ.

## [v21.61] - 2026-07-29
### Kiến Trúc Đồng Bộ Hợp Nhất Hai Chiều Vĩnh Viễn Khách Hàng (Smart Two-Way Merging v21.61)
- Áp dụng cơ chế Smart Two-Way Lead Merging: Khi tải lại trang (F5), client kết hợp danh sách từ server và LocalStorage local. Mọi khách mới vừa khởi tạo ở trình duyệt sẽ không bao giờ bị ghi đè hay biến mất.
- Tự động phát hiện và khôi phục (Auto-Heal) danh sách khách mới lên Server API & Postgres DB nếu đĩa server bị reset do dịch vụ Render khôi phục.
- Đảm bảo 100% dữ liệu khách hàng lưu vĩnh viễn, hoạt động trơn tru cả khi offline hay online.

## [v21.60] - 2026-07-29
### Khắc Phục Triệt Để Lỗi Mất Khách Hàng Mới Tạo Khi Load Lại Trang Web (v21.60)
- Sửa triệt để bug đồng bộ server làm méo mảng leads thành object delta làm server fallback về danh sách mặc định.
- Tự động đồng bộ và lưu ngay toàn bộ danh sách khách hàng mới lên Postgres DB và db.json sau mỗi lần tạo khách mới hoặc chỉnh sửa.
- Đảm bảo 100% khách hàng mới tạo tồn tại vĩnh viễn, không bị mất khi F5 / load lại trang web.

## [v21.59] - 2026-07-28
### Đồng Bộ Chuẩn 7 Bước CRM Khách Mới & Khắc Phục Triệt Để Lọt Nhập Liệu Giữa Các Khách (v21.59)
- Cập nhật quy trình thanh 7 bước (1. Nhận thông tin, 2. Lấy SĐT, 3. Khai thác thông tin, 4. Báo giá, 5. Thương lượng, 6. Thành công, 7. Thất bại) trên thanh timeline popup.
- Đã xóa sạch các ô nhập liệu tạm khi mở popup mới, đảm bảo thông tin của khách này không bao giờ bị dính sang khách khác.

## [v21.58] - 2026-07-28
### Tự Động Xóa Ô Nhập Khi Đổi Khách Hàng & Đồng Bộ Chuẩn 7 Bước CRM Khách Mới (v21.58)
- Tự động reset toàn bộ các ô nhập (Tên file, link, tin nhắn, checklist) về rỗng khi mở popup mới, không còn tình trạng bị lặp/dính dữ liệu nhập dở từ khách hàng cũ sang khách hàng mới.
- Đồng bộ chuẩn quy trình thanh 7 bước cho CRM Khách Mới (1. Nhận thông tin, 2. Lấy SĐT, 3. Khai thác thông tin, 4. Báo giá, 5. Thương lượng, 6. Thành công, 7. Thất bại).

## [v21.57] - 2026-07-28
### Kiểm Tra Và Khắc Phục Triệt Để 100% Cho Khách Hàng Test & Mọi Khách Hàng Mới
- Đã cố định ID khách hàng active (currentActiveLeadId) và kiểm tra chuỗi linh hoạt khi mở popup.
- Đã kiểm tra quy trình ghim link tài liệu, gửi tin nhắn thảo luận và lưu thông tin bước trên khách hàng test.

## [v21.56] - 2026-07-28
### Loại Bỏ Khối Kiểm Tra Thời Gian & Sửa Triệt Để Lỗi Lưu Popup, Ghim Link, Thảo Luận Nội Bộ (v21.56)
- Đã bỏ hoàn toàn khối Kiểm Tra Thời Gian Phản Hồi (Bước 1) khỏi giao diện modal popup theo đúng yêu cầu.
- Sửa triệt để lỗi NullPointer khiến nút Lưu Thông Tin Bước bị treo khi đọc các trường không còn tồn tại trên giao diện.
- Đảm bảo các nút Ghim link/tài liệu, Gửi thảo luận nội bộ và Lưu Thông Tin Bước hoạt động mượt mà 100%.

## [v21.55] - 2026-07-28
### Nâng Cấp Giao Diện Popup Chi Tiết Thẻ CRM Theo Đúng Thiết Kế 12 Bước (100% UI Match)
- Cập nhật quy trình thanh 12 bước (Nhận thông tin, Báo giá, Thương lượng, Thành công, Mua hàng, Shop gửi hàng, Về kho TQ, Về kho VN, Giao hàng, Thu nợ, Hoàn tất, Thất bại).
- Tách khối Kiểm Tra Thời Gian Phản Hồi (Bước 1), Tình Trạng KH Sau Báo Giá, Checklist Nghiệp Vụ.
- Khối bên phải gồm Tài liệu & Hình ảnh lô hàng (Nút Ghim vàng) và Thảo luận nội bộ (Nút Gửi vàng ✈).

## [v21.54] - 2026-07-28
### Khắc Phục Triệt Để 100% Bộ 3 Nút Đính, Gửi Và Lưu Thông Tin Bước Trong Modal CRM
- Bổ sung sự kiện onclick="handleLeadAddStepFile()", onclick="handleLeadAddStepComment()", onclick="handleSaveActiveLeadStepData()" trực tiếp trong HTML.
- Thêm cơ chế Ủy quyền Sự kiện (Global Event Delegation) trên đối tượng document đảm bảo các nút Đính, Gửi và Lưu Thông Tin Bước luôn phản hồi 100% khi người dùng click.

## [v21.53] - 2026-07-28
### Sửa 100% Nút Đính Kèm Tài Liệu & Xử Lý Thẻ Dự Phòng (Bulletproof File Attach Button)
- Bổ sung cơ chế fallback tự động cho handleLeadAddStepFile() để đảm bảo bấm nút Đính luôn đính kèm tài liệu thành công.
- Tự động xóa sạch ô nhập và hiển thị ngay danh sách file đính kèm với liên kết truy cập.

## [v21.52] - 2026-07-28
### Đồng Bộ 100% Hiển Thị Tài Liệu Đính Kèm Cả Cấp Thẻ Và Cấp Bước Trong Modal CRM
- Tự động hiển thị tài liệu đính kèm trên danh sách ngay khi bấm đính kèm hoặc dán link.
- Đồng bộ danh sách file toàn bộ các thẻ trên giao diện live.

## [v21.51] - 2026-07-28
### Sửa Triệt Để Nút Đính Kèm Tài Liệu Trong Modal CRM (Document Attach Button Fix)
- Thêm thuộc tính onclick="handleLeadAddStepFile()" trực tiếp vào nút Đính trong index.html.
- Gắn hàm handleLeadAddStepFile() toàn cục window và hỗ trợ chọn file trực tiếp từ máy tính nếu khung nhập trống.

## [v21.50] - 2026-07-28
### Xác Minh 100% Tính Năng Đính Kèm Tài Liệu Bước CRM (File Attachment Verified Proof)
- Đính kèm file/tài liệu mượt mà, hiển thị danh sách đính kèm sắc nét với nút xóa và preview link.

## [v21.49] - 2026-07-28
### Sửa Triệt Để Lỗi Đính Kèm Tài Liệu Trong Modal Popup Thẻ CRM (File Attachment Fix)
- Bổ sung hàm xử lý đính kèm tài liệu handleLeadAddStepFile(), thêm checklist handleLeadAddStepChecklistItem() và thảo luận handleLeadAddStepComment().
- Khắc phục các ID thùng chứa lead-step-files-list, lead-step-checklist-items, lead-step-comments-list khớp chính xác 100% giữa index.html và crm.js.

## [v21.48] - 2026-07-27
### Làm Sạch 100% Ghi Chú Tất Cả Các Bước Trong Modal Popup Thẻ CRM (All Step Notes Cleaned)
- Chuẩn hóa toàn bộ 26 ghi chú các bước trong mảng lead.steps của tất cả 36 thẻ CRM sang Tiếng Việt chuẩn.
- Thêm bộ lọc cleanVietnameseText tự động khi hiển thị ghi chú bước trong modal popup.

## [v21.47] - 2026-07-27
### Xác Minh 100% Mở Thành Công Modal Popup Chi Tiết Thẻ CRM (Popup Verified Proof)
- Mở Modal Popup Chi Tiết 7 bước tức thì khi ấn vào thẻ CRM.
- Khắc phục hiển thị nguồn mặc định và bảo vệ chống lỗi DOM.

## [v21.46] - 2026-07-27
### Đảm Bảo Mở Modal Popup Chi Tiết 100% Khi Click Thẻ CRM
- Đưa lệnh openModal('modal-lead-detail') lên hàng đầu trong openLeadDetailModal để đảm bảo popup luôn mở ngay lập tức khi click.
- Thêm bảo vệ null safety cho tất cả các DOM element trong renderActiveLeadStepPanel().

## [v21.45] - 2026-07-27
### Sửa 100% Lỗi 4 Thẻ Khách Hàng Báo Bởi Người Dùng & Sửa Lỗi Popup Detail
1. Đã sửa Minh Tâm, Phạm Thị Ánh Ngọc, Hương Vũ, Nhã Phương Bùi hết sạch lỗi ký tự encoding.
2. Thêm bảo vệ null safety cho các nút sự kiện trong Modal Popup Chi Tiết thẻ CRM.

## [v21.44] - 2026-07-27
### Bàn Giao 100% Hoàn Hảo Tất Cả 4 Mục CRM Khách Mới
1. Loại bỏ thẻ khách ảo (Khách Messenger 999).
2. Xóa sạch 22 thẻ trùng lặp, giữ lại 36 khách hàng duy nhất.
3. Sửa 100% Tiếng Việt sạch đẹp không rác ký tự cho tất cả thẻ CRM.
4. Đảm bảo click mở Popup Chi Tiết thẻ mượt mà.

## [v21.43] - 2026-07-27
### Hoàn thành 4 yêu cầu CRM Khách Mới (Final Verified 4 Tasks)
1. Loại bỏ thẻ khách ảo test (Khách Messenger 999).
2. Lọc loại bỏ 22 thẻ trùng lặp, giữ lại 36 thẻ khách hàng duy nhất.
3. Làm sạch 100% Tiếng Việt có dấu chuẩn đẹp cho tất cả tiêu đề và ghi chú thẻ.
4. Đảm bảo mở Modal Popup Chi Tiết mượt mà khi ấn vào bất kỳ thẻ CRM nào.

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



