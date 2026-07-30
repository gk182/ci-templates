# Setup deploy lên Firebase App Distribution

Áp dụng khi `deploy_target: firebase`. Dùng để gửi bản build cho tester nội bộ (không cần
qua App Store/Play Store, cài trực tiếp qua link Firebase gửi).

> ⚠️ Lưu ý quan trọng: Firebase đã **khai tử** cách xác thực cũ bằng `firebase login:ci`
> (sinh ra 1 token, gọi là `firebase_cli_token`). Nhiều hướng dẫn cũ trên mạng vẫn dùng cách
> này — **đừng làm theo**, sẽ lỗi hoặc ngừng hoạt động bất cứ lúc nào. Repo này đã dùng đúng
> cách hiện tại: xác thực bằng **Service Account**.

## Trường hợp A — CHƯA có Firebase project

1. Vào https://console.firebase.google.com → **Add project** → đặt tên, tạo project.
2. Trong project, bấm **Add app** → chọn Android hoặc iOS (làm cả 2 nếu cần):
   - Android: nhập đúng package name (khớp `ANDROID_PACKAGE_NAME`/`applicationId`).
   - iOS: nhập đúng Bundle ID (khớp `IOS_BUNDLE_ID`).
3. Sau khi thêm app, vào **Project settings (⚙️) → General**, kéo xuống mục "Your apps" →
   copy **App ID** (dạng `1:1234567890:android:abcdef123456` hoặc tương tự cho iOS) — đây
   chính là giá trị cho `FIREBASE_APP_ID` (mỗi platform Android/iOS có App ID riêng, nếu
   deploy cả 2 thì cần 2 secret khác tên hoặc chạy deploy riêng từng lần).
4. Vào menu **Release & Monitor → App Distribution** → bấm **Get started** để bật tính năng
   này cho project (nếu chưa bật).
5. Chuyển sang Trường hợp B để lấy service account.

## Trường hợp B — ĐÃ có Firebase project, cần nối CI

### B1. Tạo Service Account

1. Vào **Project settings (⚙️) → Service accounts**.
2. Bấm **Generate new private key** → xác nhận → tải về file JSON.
3. File JSON này mặc định đã có đủ quyền cho các thao tác quản trị project, bao gồm App
   Distribution. Nếu muốn giới hạn quyền tối thiểu, vào Google Cloud Console → IAM, tìm
   service account này → gán thêm role **Firebase App Distribution Admin**.

### B2. Thêm tester

1. Vào **App Distribution → Testers & Groups** → tạo 1 nhóm (ví dụ `internal-testers`), thêm
   email các tester vào nhóm.
2. Tên nhóm này chính là giá trị cho `FIREBASE_TESTER_GROUP` (mặc định repo dùng
   `internal-testers` nếu bạn không set).

### B3. Chuyển key sang base64 và thêm secret

```bash
base64 -i firebase-service-account.json | tr -d '\n' > firebase-key.base64.txt
```

Vào repo app trên GitHub → **Settings → Secrets and variables → Actions**, thêm:

| Secret | Giá trị |
|---|---|
| `FIREBASE_SERVICE_ACCOUNT_BASE64` | nội dung file `firebase-key.base64.txt` |
| `FIREBASE_APP_ID` | App ID lấy ở bước A3 |
| `FIREBASE_TESTER_GROUP` | tên nhóm tester ở bước B2 (tuỳ chọn, có default) |

## Kiểm tra lại

`bundle exec fastlane doctor` — mục Firebase hiện ✅ là sẵn sàng.

## Lỗi thường gặp

- **`App Distribution could not generate credentials`** → dấu hiệu bạn đang dùng cách cũ
  (firebase_cli_token) đã bị khai tử — kiểm tra Fastfile đang dùng `service_credentials_file`
  chứ không phải `firebase_cli_token`.
- **`404 App not found`** → `FIREBASE_APP_ID` sai, hoặc app chưa được add vào đúng project
  Firebase — kiểm tra lại bước A3.
- **Tester không nhận được email mời** → kiểm tra đúng tên nhóm ở `FIREBASE_TESTER_GROUP`,
  email tester đã được thêm đúng nhóm trong bước B2.
