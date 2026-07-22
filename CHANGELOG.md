# Nhật Ký Thay Đổi (Changelog) - Minh Hải CRM

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
