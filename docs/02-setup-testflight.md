# Setup deploy iOS lên TestFlight

Áp dụng khi `deploy_target: testflight`.

## ⚠️ Yêu cầu bắt buộc — không thể bỏ qua

Deploy lên TestFlight **bắt buộc** phải có **Apple Developer Program membership** (phí
**$99 USD/năm**, đăng ký tại https://developer.apple.com/programs/). Đây là yêu cầu từ Apple,
**không có cách nào tự động hoá vượt qua được** nếu chưa có tài khoản này.

Nếu bạn chưa có tài khoản này: đăng ký trước, việc duyệt tài khoản có thể mất 1-2 ngày. Trong
lúc chờ, bạn vẫn có thể dùng phần build (không deploy) — set `build_ios: true`, `deploy_target: none`.

## Trường hợp A — CHƯA có gì (tài khoản mới, app chưa từng đăng ký)

1. Đăng ký Apple Developer Program (xem trên).
2. Vào https://developer.apple.com/account/resources/identifiers/list → **Register a new
   identifier** → tạo App ID khớp `IOS_BUNDLE_ID` (ví dụ `com.yourcompany.appname`, phải khớp
   `PRODUCT_BUNDLE_IDENTIFIER` trong Xcode project của Flutter, thường ở
   `ios/Runner.xcodeproj`).
3. Vào https://appstoreconnect.apple.com → **My Apps → (+) → New App** → tạo record app mới,
   chọn đúng bundle ID vừa đăng ký. TestFlight **chỉ hoạt động** khi app đã có record ở đây.
4. Tiếp tục làm Trường hợp B để lấy API key + setup certificate.

## Trường hợp B — ĐÃ có Apple Developer account + app đã đăng ký, cần nối CI

### B1. Tạo App Store Connect API Key (để CI xác thực, không cần đăng nhập thủ công)

1. Vào https://appstoreconnect.apple.com/access/api → tab **Keys**.
2. Bấm **Generate API Key** (hoặc dấu +) → đặt tên bất kỳ, chọn quyền **App Manager**.
3. Tải file `.p8` về — **chỉ tải được 1 lần duy nhất**, mất là phải tạo key mới.
4. Ghi lại **Key ID** và **Issuer ID** hiển thị trên trang đó.
5. Chuyển file `.p8` sang base64:
   ```bash
   base64 -i AuthKey_XXXXXXXXXX.p8 | tr -d '\n' > asc-api-key.base64.txt
   ```

### B2. Setup `match` (đồng bộ certificate/provisioning profile)

`match` cần 1 **repo git riêng, private** (khác repo code app) để lưu certificate đã mã hoá.

1. Tạo 1 repo GitHub mới, private, ví dụ `your-org/ios-certificates` — repo trống, không cần
   file gì cả.
2. Trên máy cá nhân (đã cài Fastlane qua `bundle install`, xem `00-tong-quan-fastlane.md`):
   ```bash
   export MATCH_GIT_URL="https://github.com/your-org/ios-certificates.git"
   export IOS_BUNDLE_ID="com.yourcompany.appname"
   export APPLE_ID="your-apple-id@email.com"
   bundle exec fastlane match appstore
   ```
   Lệnh này sẽ hỏi bạn đặt 1 **mật khẩu mã hoá** (đây chính là `MATCH_PASSWORD` cần lưu vào
   secret) — **ghi nhớ mật khẩu này, không có cách khôi phục nếu quên**, phải tạo lại toàn bộ
   certificate từ đầu.
3. Sau khi chạy xong, certificate đã được đẩy (mã hoá) lên repo `ios-certificates`.

### B3. Lấy Team ID

- **Team ID** (cho `APPLE_TEAM_ID`): vào https://developer.apple.com/account → mục
  **Membership details**.
- **ITC Team ID** (cho `ITC_TEAM_ID`): vào https://appstoreconnect.apple.com →
  **Business** (góc dưới bên trái) → xem số Team ID hiển thị (thường khác Team ID ở trên).

### B4. Thêm secrets vào repo app trên GitHub

**Settings → Secrets and variables → Actions → New repository secret:**

| Secret | Giá trị |
|---|---|
| `APP_STORE_CONNECT_API_KEY_BASE64` | nội dung file `asc-api-key.base64.txt` |
| `APP_STORE_CONNECT_KEY_ID` | Key ID lấy ở bước B1 |
| `APP_STORE_CONNECT_ISSUER_ID` | Issuer ID lấy ở bước B1 |
| `MATCH_PASSWORD` | mật khẩu bạn đặt ở bước B2 |
| `MATCH_GIT_URL` | URL repo certificates, ví dụ `https://github.com/your-org/ios-certificates.git` |
| `APPLE_ID` | email tài khoản Apple Developer |
| `APPLE_TEAM_ID` | Team ID ở bước B3 |
| `ITC_TEAM_ID` | ITC Team ID ở bước B3 |
| `IOS_BUNDLE_ID` | bundle id app, ví dụ `com.yourcompany.appname` |

## Kiểm tra lại

`bundle exec fastlane doctor` — các mục TestFlight hiện ✅ là sẵn sàng.

## Lỗi thường gặp

- **`Could not find a matching profile`** → certificate chưa được tạo (chưa chạy B2), hoặc
  `MATCH_GIT_URL`/`IOS_BUNDLE_ID` sai.
- **`Invalid API Key`** → Key ID/Issuer ID nhập sai, hoặc file `.p8` bị hỏng khi encode base64
  (kiểm tra không có ký tự xuống dòng thừa).
- **App không hiện trên TestFlight dù upload thành công** → build cần vài phút để Apple xử lý,
  hoặc app chưa có record trên App Store Connect (xem Trường hợp A, bước 3).
