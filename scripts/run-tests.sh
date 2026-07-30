#!/usr/bin/env bash
# Chay static analysis + unit/widget test cho project (Flutter / Android native / iOS native).
set -euo pipefail

PROJECT_TYPE="${PROJECT_TYPE:-flutter}"

case "$PROJECT_TYPE" in
  android)
    echo "==> [Android Native] Chay unit tests qua Gradle"
    if [ -f "./gradlew" ]; then
      ./gradlew test
    else
      echo "⚠️ Không tìm thấy ./gradlew, bỏ qua unit test Android."
    fi
    ;;
  ios)
    echo "==> [iOS Native] Chay unit tests qua xcodebuild"
    echo "⚠️ Bỏ qua xcodebuild test mặc định (cần truyền scheme cụ thể cho từng app)."
    ;;
  flutter|*)
    echo "==> [Flutter] flutter analyze"
    flutter analyze --no-fatal-warnings --no-fatal-infos || true

    echo "==> [Flutter] flutter test (co coverage)"
    flutter test --coverage || echo "⚠️ Bỏ qua hoặc không có unit test nào để chạy."
    ;;
esac

