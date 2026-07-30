# Setup deploy Android lên Google Play Console

Áp dụng khi `deploy_target: play_internal`.

## Trường hợp A — App CHƯA từng tạo trên Play Console

1. Đăng ký tài khoản **Google Play Console Developer** (phí một lần ~$25) tại
   https://play.google.com/console nếu chưa có.
2. Tạo app mới trong Play Console → điền tên app, package name (ví dụ `com.yourcompany.appname`,
   phải khớp `applicationId` trong `android/app/build.gradle` của project Flutter).
3. **Bắt buộc theo yêu cầu của Google**: với app hoàn toàn mới, bạn phải **tự tay upload ít
   nhất 1 bản build** (APK/AAB) qua giao diện web Play Console trước — API tự động (Fastlane)
   **không thể** tạo release đầu tiên cho 1 app chưa từng có release nào. Đây là giới hạn từ
   phía Google, không phải lỗi cấu hình.
   - Vào **Testing → Internal testing → Create new release**, tải lên file `.aab` bạn build
     thủ công 1 lần (`flutter build appbundle --release`).
4. Sau khi đã có ít nhất 1 release, chuyển sang làm theo **Trường hợp B** bên dưới để API
   hoạt động cho các lần deploy tiếp theo.

## Trường hợp B — App ĐÃ có trên Play Console, cần nối API

1. Vào **Play Console → Setup → API access**.
2. Nếu chưa link với Google Cloud project, bấm **Choose a project to link** → tạo project
   mới hoặc chọn project có sẵn.
3. Bấm **Create new service account** → sẽ dẫn sang Google Cloud Console.
4. Trong Google Cloud Console: **IAM & Admin → Service Accounts → Create Service Account**.
   - Đặt tên bất kỳ, ví dụ `play-store-ci-deploy`.
   - Sau khi tạo xong, vào tab **Keys → Add Key → Create new key → JSON** → tải file JSON về
     (đây là "chìa khoá" để API xác thực, **giữ bí mật tuyệt đối**, không commit vào git).
5. Quay lại **Play Console → API access**, tìm service account vừa tạo → **Grant access**.
   - Cấp quyền tối thiểu: **Release manager** (hoặc quyền tuỳ chỉnh cho phép "Release to
     testing tracks" nếu bạn chỉ deploy internal testing, không cần full admin).
6. Chuyển file JSON vừa tải thành base64, để lưu an toàn vào GitHub Secrets:
   ```bash
   base64 -i play-store-key.json | tr -d '\n' > play-store-key.base64.txt
   ```
7. Vào repo app trên GitHub → **Settings → Secrets and variables → Actions → New repository
   secret**, thêm các secret sau:

| Secret | Giá trị |
|---|---|
| `PLAY_STORE_JSON_KEY_BASE64` | nội dung file `play-store-key.base64.txt` ở bước 6 |
| `ANDROID_PACKAGE_NAME` | package name của app, ví dụ `com.yourcompany.appname` |

## Kiểm tra lại

Chạy `bundle exec fastlane doctor` (xem `00-tong-quan-fastlane.md`) — nếu 2 mục Play Store
hiện ✅ là đã sẵn sàng deploy.

## Lỗi thường gặp

- **`no application was found for the given package name`** → app chưa có release nào, quay
  lại Trường hợp A, upload thủ công 1 lần trước.
- **`403 Forbidden` / `The caller does not have permission`** → service account chưa được cấp
  quyền đủ ở bước 5, hoặc cấp nhầm project Google Cloud.
- **Package name không khớp** → kiểm tra `applicationId` trong `android/app/build.gradle` phải
  giống hệt `ANDROID_PACKAGE_NAME` (phân biệt hoa/thường).
