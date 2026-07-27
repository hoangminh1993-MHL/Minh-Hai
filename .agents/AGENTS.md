
# Project Rules & Customizations

## 1. Screenshot Verification Requirement
- ALWAYS capture and provide full screenshot proof of the ACTUAL logged-in feature screen (e.g., populated CRM Kanban board with loaded cards and clean text).
- NEVER provide screenshots of the login screen or blank unauthenticated states when showing verified feature fixes.

## 2. Self-Inspection & Continuous Fix Loop
- After capturing the screenshot proof, self-inspect the image carefully for any remaining font encoding errors (Mojibake), broken text, or missing data cards.
- If ANY error is still observed in the image, DO NOT stop or declare success. Continue diagnosing, fixing code/data, redeploying, and re-capturing screenshots until 100% clean and successful.

## 3. Live Login Verification & Mandatory 100% Completion Loop
- Sau khi khắc phục lỗi, BẮT BUỘC thực hiện đăng nhập vào website live (`https://minh-hai.onrender.com/login.html`), truy cập trực tiếp vào mục/tính năng vừa sửa.
- Tự rà soát lại lỗi vừa sửa trên hình ảnh thực tế đã đăng nhập.
- Nếu thấy vẫn còn bị lỗi, tiếp tục khắc phục mã nguồn/dữ liệu và lặp lại toàn bộ các bước trên cho đến khi giải quyết được 100% mới được phép bàn giao.