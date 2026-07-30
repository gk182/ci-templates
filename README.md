# ci-templates

Repo chứa **CI/CD dùng chung** cho các app mobile (ưu tiên Flutter, hỗ trợ thêm Android/iOS native).
Mục tiêu: mỗi project app chỉ cần **~10 dòng YAML** để có đầy đủ lint → test → build → deploy,
không phải copy-paste logic CI qua từng repo.

## Cấu trúc repo

```
ci-templates/
├── .github/workflows/
│   └── mobile-ci.yml          # Reusable workflow chính (entry point)
├── Gemfile                     # Ghim version Fastlane, tự cài qua Bundler (không cần cài tay)
├── fastlane/
│   ├── Fastfile                 # Lane build/test/deploy, tự kiểm tra thiếu gì và báo rõ ràng
│   ├── Pluginfile                # Khai báo plugin firebase_app_distribution
│   ├── Appfile.example            # Copy thành Appfile trong repo app, điền package/bundle id
│   └── Matchfile.example          # Copy thành Matchfile trong repo app, cấu hình certificate iOS
├── scripts/
│   ├── setup-flutter.sh        # Cài Flutter SDK + cache pub
│   ├── run-tests.sh            # Chạy flutter analyze + flutter test
│   ├── build-android.sh        # Build APK/AAB
│   ├── build-ios.sh            # Build IPA (cần macOS runner)
│   └── decode-credentials.sh   # Giải mã secret base64 thành file, tự bỏ qua nếu thiếu
├── docs/
│   ├── 00-tong-quan-fastlane.md
│   ├── 01-setup-play-store.md
│   ├── 02-setup-testflight.md
│   ├── 03-setup-firebase.md
│   └── 04-troubleshooting.md
└── examples/
    ├── caller-workflow-flutter.yml   # Ví dụ file cho project Flutter
    └── caller-workflow-android.yml   # Ví dụ file cho project Android native
```

## Dùng như thế nào (cho project mới)

1. Tạo file `.github/workflows/ci.yml` trong repo app của bạn.
2. Copy nội dung từ `examples/caller-workflow-flutter.yml`, chỉnh lại 2-3 biến (`flutter_version`, `android_package_name`...).
3. Thêm các secret cần thiết vào **Settings → Secrets and variables → Actions** của repo app (xem mục "Secrets cần thiết" bên dưới).
4. Push code — CI tự chạy.

Khi cần sửa logic CI (thêm bước, đổi cách deploy...), chỉ sửa **1 chỗ** ở repo `ci-templates` này —
tất cả project gọi vào sẽ tự nhận thay đổi ở lần chạy tiếp theo (nếu dùng tag `@main`).

> Khuyến nghị: dùng `@main` khi mới bắt đầu để dễ cập nhật. Khi đã ổn định, ghim theo tag
> (ví dụ `@v1.2.0`) cho các project quan trọng để tránh thay đổi bất ngờ làm vỡ CI.

## Luồng CI/CD

```
push / pull_request
   │
   ├─ lint-test  (flutter analyze + flutter test, chạy trên ubuntu, nhanh & rẻ)
   │
   ├─ build-android  (flutter build apk/appbundle)
   ├─ build-ios      (flutter build ipa, chỉ chạy trên macOS runner, chỉ khi input ios=true)
   │
   └─ deploy   (chỉ chạy khi push nhánh main/tag, và run_deploy=true)
        ├─ Android → Firebase App Distribution / Play Console internal track
        └─ iOS     → TestFlight qua fastlane pilot
```

`build-android` và `build-ios` chạy **song song** (không phụ thuộc nhau) để tiết kiệm thời gian.

## Tài liệu setup chi tiết (đọc trước khi deploy thật)

| Tài liệu | Nội dung |
|---|---|
| [`docs/00-tong-quan-fastlane.md`](docs/00-tong-quan-fastlane.md) | Fastlane là gì, cách nó tự cài đặt qua Bundler, chạy thử local |
| [`docs/01-setup-play-store.md`](docs/01-setup-play-store.md) | Setup Google Play — cả trường hợp app mới lẫn app đã có |
| [`docs/02-setup-testflight.md`](docs/02-setup-testflight.md) | Setup TestFlight — **cần Apple Developer Program ($99/năm), yêu cầu bắt buộc từ Apple** |
| [`docs/03-setup-firebase.md`](docs/03-setup-firebase.md) | Setup Firebase App Distribution — cả trường hợp project mới lẫn đã có |
| [`docs/04-troubleshooting.md`](docs/04-troubleshooting.md) | Lỗi thường gặp và cách xử lý |

Sau khi thêm secret, chạy `bundle exec fastlane doctor` để kiểm tra nhanh xem đã đủ chưa
(chi tiết trong `docs/00-tong-quan-fastlane.md`) — lệnh này **không** build, **không** deploy
thật, chỉ báo ✅/⚠️ cho từng mục.

## 📋 Bảng tra cứu Tham số Input (`with:`)

Khai báo các tham số này trong mục `with:` của file gọi workflow ở repo app:

| Tham số Input | Kiểu dữ liệu | Mặc định | Mô tả |
|---|---|---|---|
| `project_type` | `string` | **Bắt buộc** | Loại dự án: `flutter`, `android`, hoặc `ios`. |
| `flutter_version` | `string` | `"3.24.0"` | Phiên bản Flutter SDK sử dụng khi build. |
| `build_ios` | `boolean` | `false` | Có build bản iOS không (`true` cần runner `macos-14`, tốn thêm thời gian & chi phí). |
| `run_deploy` | `boolean` | `false` | Cho phép chạy bước Deploy (`true` cho push `main`/`tag`, `false` cho PR/test). |
| `deploy_target` | `string` | `"none"` | Đích đến khi deploy: `firebase`, `play_internal`, `testflight`, hoặc `none`. |

---

## 🔐 Bảng tra cứu Secrets (`secrets:`)

Bảng đầy đủ — chỉ cần khai báo secret của nền tảng bạn thực sự dùng, không cần khai hết:

| Secret | Phân loại | Mô tả & Công dụng | Hướng dẫn |
|---|---|---|---|
| `ANDROID_KEYSTORE_BASE64` | Android Build | Keystore mã hóa dạng Base64 dùng để ký Release APK/AAB | — |
| `ANDROID_KEYSTORE_PASSWORD` | Android Build | Mật khẩu giải mã Keystore | — |
| `PLAY_STORE_JSON_KEY_BASE64` | Google Play | File JSON Service Account mã hóa Base64 để gọi API Google Play | `docs/01-setup-play-store.md` |
| `ANDROID_PACKAGE_NAME` | Google Play | Package Name ứng dụng Android (VD: `com.example.myapp`) | `docs/01-setup-play-store.md` |
| `FIREBASE_APP_ID` | Firebase | App ID trên Firebase Console (VD: `1:1234:android:abcd`) | `docs/03-setup-firebase.md` |
| `FIREBASE_SERVICE_ACCOUNT_BASE64` | Firebase | Service Account JSON Base64 dùng xác thực Firebase | `docs/03-setup-firebase.md` |
| `FIREBASE_TESTER_GROUP` | Firebase | *(Tùy chọn)* Tên nhóm Testers nhận bản build (VD: `internal-testers`) | `docs/03-setup-firebase.md` |
| `APP_STORE_CONNECT_API_KEY_BASE64` | TestFlight | Private Key API (.p8) mã hóa Base64 | `docs/02-setup-testflight.md` |
| `APP_STORE_CONNECT_KEY_ID` | TestFlight | Key ID tạo trên App Store Connect | `docs/02-setup-testflight.md` |
| `APP_STORE_CONNECT_ISSUER_ID` | TestFlight | Issuer ID của tổ chức Developer | `docs/02-setup-testflight.md` |
| `MATCH_PASSWORD` | TestFlight | Mật khẩu giải mã Certificate/Provisioning (Fastlane Match) | `docs/02-setup-testflight.md` |
| `MATCH_GIT_URL` | TestFlight | Git URL chứa kho Certificate riêng | `docs/02-setup-testflight.md` |
| `APPLE_ID` | TestFlight | Email tài khoản Apple Developer | `docs/02-setup-testflight.md` |
| `APPLE_TEAM_ID` | TestFlight | Team ID trên Developer Portal | `docs/02-setup-testflight.md` |
| `ITC_TEAM_ID` | TestFlight | Team ID trên App Store Connect | `docs/02-setup-testflight.md` |
| `IOS_BUNDLE_ID` | TestFlight | Bundle Identifier app iOS (VD: `com.example.myapp.ios`) | `docs/02-setup-testflight.md` |

> ⚠️ **Lưu ý**: TestFlight **bắt buộc** phải có tài khoản Apple Developer Program (trả phí $99/năm). Nếu chưa có, bạn vẫn build được file iOS (`build_ios: true`) và để `deploy_target: none`.

---

## ⚡ Tối ưu Tốc độ Build (Caching)

Workflow đã tích hợp sẵn cơ chế **Cache đa tầng** giúp giảm thời gian build từ **8-10 phút xuống còn 2-3 phút**:
- 📦 **Flutter Pub Cache**: Tự động lưu cache pub packages qua `subosito/flutter-action@v2`.
- ☕ **Gradle Cache**: Tự động lưu Gradle Wrapper & Dependencies qua `setup-java@v4`.
- 🍎 **CocoaPods Cache**: Tự động lưu `Pods` & Podspec Caches cho iOS runner qua `actions/cache@v4`.

## Nguyên tắc thiết kế (để dễ maintain)

- **Mỗi script làm đúng 1 việc** (`build-android.sh` chỉ build Android, không lint, không deploy).
- **Không hard-code giá trị riêng của project** (tên app, bundle id...) trong `ci-templates` —
  tất cả truyền qua `inputs`/`secrets` từ file gọi ở repo app.
- **Fail nhanh, rõ ràng**: mỗi script có `set -euo pipefail` để dừng ngay khi lỗi, tránh build "giả vờ thành công".
- **iOS luôn tách job riêng** vì cần macOS runner (đắt & chậm hơn), để không ép Android phải chờ.
