# Troubleshooting chung

## "Thiếu biến môi trường/secret: XXX"

Đây là thông báo do chính repo này chủ động kiểm tra (không phải lỗi mơ hồ từ Fastlane gốc).
Nghĩa là bạn chưa thêm secret đó vào repo app. Xem lại:
- `docs/01-setup-play-store.md` nếu liên quan Android/Play Store
- `docs/02-setup-testflight.md` nếu liên quan iOS/TestFlight
- `docs/03-setup-firebase.md` nếu liên quan Firebase

## "Khong tim thay file build" (APK/AAB/IPA)

Job `deploy` chạy sau job `build-android`/`build-ios` và tải lại artifact đã build. Nếu báo
thiếu file:
- Kiểm tra job build tương ứng có chạy thành công không (tab Actions trên GitHub).
- Với iOS: kiểm tra `build_ios: true` đã được set trong file gọi workflow chưa — mặc định là
  `false`.
- Với Android release (AAB): cần có `ANDROID_KEYSTORE_BASE64` để build bản ký, nếu không sẽ
  chỉ build APK debug (không có AAB).

## `bundle` khong duoc nhan ra

Lỗi này xảy ra trước khi Fastlane kịp chạy, thường là do máy chưa cài Ruby/Bundler hoặc PATH
chưa được nạp lại sau khi cài.

- Kiểm tra nhanh: `ruby -v`, `gem -v`, `bundle -v`
- Nếu thiếu Ruby trên Windows, cài RubyInstaller rồi mở lại PowerShell/terminal mới
- Sau đó chạy lại:

```bash
gem install bundler
bundle install
bundle exec fastlane doctor
```

Nếu `gem install bundler` xong mà `bundle` vẫn không nhận, mở terminal mới hoặc kiểm tra
PATH của RubyInstaller đã được thêm đúng chưa.

## Chạy thử local trước khi đẩy lên CI

```bash
cd ci-templates
bundle install
bundle exec fastlane doctor          # xem thiếu gì
bundle exec fastlane deploy target:firebase   # thử deploy thật (cẩn thận, sẽ deploy thật)
```

## CI chạy được ở nhánh feature nhưng deploy không chạy

Đây là **có chủ đích**: job `deploy` chỉ chạy khi `run_deploy: true`. Trong file mẫu
`examples/caller-workflow-flutter.yml`, giá trị này được set là
`${{ github.ref == 'refs/heads/main' }}` — nghĩa là chỉ deploy khi push vào nhánh `main`. Đây
là để tránh deploy nhầm từ nhánh đang phát triển dở.

## Muốn test toàn bộ pipeline mà chưa muốn deploy thật

Set `deploy_target: none` trong file gọi workflow — vẫn chạy đủ lint/test/build, chỉ bỏ qua
bước deploy thật (job `deploy` sẽ skip vì `needs` fail hoặc lane in ra thông báo "không deploy
gì" tuỳ vào cách bạn set `run_deploy`).

## Vẫn không tìm ra lỗi?

Chạy lại với debug bật lên:
```bash
bundle exec fastlane deploy target:<ten> --verbose
```
Log chi tiết hơn thường chỉ thẳng ra nguyên nhân (sai path, sai quyền, sai định dạng key...).
