# Fastlane là gì, và lỡ chưa cài đặt thì sao?

## Fastlane là gì

Fastlane là công cụ dòng lệnh (viết bằng Ruby) để tự động hoá các bước build/ký/deploy app
mobile. Thay vì tự tay vào Xcode/Play Console click từng bước, bạn gói các bước đó thành
1 "lane" (định nghĩa trong file `fastlane/Fastfile`) rồi chạy 1 lệnh duy nhất, ví dụ:

```bash
fastlane deploy target:firebase
```

## Lỡ máy/CI chưa cài Fastlane thì sao?

**Không cần lo** — repo này dùng **Bundler** (công cụ quản lý gem chuẩn của Ruby) để tự
cài đúng version Fastlane mỗi khi chạy, không cần bạn cài thủ công trước.

- Version Fastlane được ghim cố định trong file [`Gemfile`](../Gemfile) (`gem "fastlane", "~> 2.224"`),
  để tránh lỗi kiểu "hôm qua chạy được, hôm nay tự nhiên lỗi" do Fastlane tự update lên bản mới.
- Trên GitHub Actions, workflow đã tự cài Ruby + chạy `bundle install` (xem step
  "Cài Ruby + Fastlane" trong `.github/workflows/mobile-ci.yml`) — bạn không cần làm gì thêm.
- Nếu muốn chạy Fastlane **trên máy cá nhân** (để test trước khi đẩy lên CI), làm như sau:

```bash
# 1. Cài Ruby (nếu máy chưa có) — khuyên dùng rbenv hoặc rvm để quản lý version
#    macOS: brew install rbenv
#    Sau đó: rbenv install 3.2.0 && rbenv local 3.2.0

# 2. Cài Bundler
gem install bundler

# 3. Cài Fastlane + plugin theo đúng version trong Gemfile (chỉ cần chạy 1 lần / khi Gemfile đổi)
cd ci-templates
bundle install

# 4. Kiểm tra xem cấu hình đã đủ để deploy chưa (không build, không deploy thật)
bundle exec fastlane doctor
```

Lệnh `fastlane doctor` (lane tự định nghĩa trong `Fastfile` của repo này) sẽ in ra danh sách
✅/⚠️ cho từng biến môi trường cần thiết — biết ngay đang thiếu gì trước khi thử deploy thật.

## Vì sao không cài Fastlane bằng `gem install fastlane` trực tiếp?

Cách đó **vẫn chạy được**, nhưng có 2 vấn đề:
1. Không ghim version → mỗi lần CI chạy có thể tải bản Fastlane mới nhất, dễ bị vỡ đột ngột
   khi Fastlane ra bản mới có breaking change.
2. Không cài được plugin (`fastlane-plugin-firebase_app_distribution`) cùng lúc một cách
   version-controlled.

Dùng `Gemfile` + `bundle install` giải quyết cả 2 vấn đề, đây là cách được khuyến nghị chính
thức bởi tài liệu Fastlane.

## Đọc tiếp

- [`01-setup-play-store.md`](./01-setup-play-store.md) — deploy Android lên Google Play
- [`02-setup-testflight.md`](./02-setup-testflight.md) — deploy iOS lên TestFlight
- [`03-setup-firebase.md`](./03-setup-firebase.md) — deploy lên Firebase App Distribution
- [`04-troubleshooting.md`](./04-troubleshooting.md) — lỗi thường gặp
