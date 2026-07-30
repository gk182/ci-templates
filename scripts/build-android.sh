#!/usr/bin/env bash
# Build APK + AAB cho Android (hỗ trợ Flutter và Android native).
set -euo pipefail

PROJECT_TYPE="${PROJECT_TYPE:-flutter}"

case "$PROJECT_TYPE" in
  android)
    echo "==> [Android Native] Build Android App qua Gradle"
    chmod +x gradlew || true
    if [ -f "app/release.keystore" ] || [ -f "android/app/release.keystore" ]; then
      echo "==> Tìm thấy keystore, build release"
      ./gradlew assembleRelease bundleRelease
    else
      echo "==> Không có keystore, build debug"
      ./gradlew assembleDebug bundleDebug
    fi
    ;;
  flutter|*)
    if [ -f "android/app/release.keystore" ]; then
      echo "==> [Flutter] Tìm thấy keystore, build release (có ký)"
      flutter build apk --release
      flutter build appbundle --release
    else
      echo "==> [Flutter] Không có keystore, build debug (APK + AAB)"
      flutter build apk --debug
      flutter build appbundle --debug
    fi
    ;;
esac

