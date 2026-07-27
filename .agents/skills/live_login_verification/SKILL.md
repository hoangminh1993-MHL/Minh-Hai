---
name: Live Login Verification & Iterative Self-Inspection
description: Sau khi khắc phục lỗi, tự động đăng nhập vào website, truy cập vào mục vừa sửa, rà soát lại lỗi vừa sửa, nếu thấy vẫn bị lỗi tiếp tục khắc phục và lặp lại cho đến khi giải quyết được 100% mới bàn giao.
---

# Live Login Verification & Iterative Self-Inspection Skill

## Quy Trình Thực Hiện Tự Động (Automated Verification Workflow)

1. **Khắc Phục Lỗi (Fix Implementation):**
   - Thực hiện chỉnh sửa mã nguồn hoặc dữ liệu theo yêu cầu của người dùng.
   - Biên dịch, đồng bộ cơ sở dữ liệu và triển khai/bản phát hành mới lên hệ thống.

2. **Đăng Nhập & Truy Cập Website Thực Tế (Live Login & Navigation):**
   - Sử dụng công cụ chạy tự động (Edge Headless / Browser subagent) để thực hiện đăng nhập vào tài khoản trên website live (`https://minh-hai.onrender.com/login.html`).
   - Điều hướng trực tiếp đến đúng trang / tính năng vừa được chỉnh sửa (ví dụ: CRM Khách Mới Page).

3. **Chụp Ảnh Màn Hình & Rà Soát Tự Kiểm Tra (Self-Inspection):**
   - Chụp ảnh màn hình toàn bộ giao diện sau khi đăng nhập và tải dữ liệu đầy đủ.
   - Tự rà soát kỹ lưỡng hình ảnh thu được:
     - Kiểm tra từng văn bản, tiêu đề, thẻ dữ liệu xem có còn lỗi font, lỗi mã hóa ký tự (Mojibake), đúp thẻ hay lệch giao diện hay không.

4. **Vòng Lặp Khắc Phục Liên Tục (Continuous Fix Loop):**
   - **Nếu phát hiện BẤT KỲ lỗi nào còn sót lại trong ảnh:** KHÔNG ĐƯỢC dừng lại hay bàn giao. Tiếp tục quay lại bước 1 để chẩn đoán, sửa code/data, push bản mới, đăng nhập lại và chụp ảnh kiểm tra.
   - **Chỉ bàn giao khi và chỉ khi:** Ảnh chụp màn hình đạt 100% sạch sẽ, hoàn hảo và không còn bất kỳ lỗi nào.

5. **Minh Chứng Bàn Giao (Delivery Proof):**
   - Đính kèm trực tiếp ảnh chụp màn hình đã xác minh thành công vào phản hồi cho người dùng.
