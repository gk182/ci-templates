#!/usr/bin/env bash
# Build APK + AAB cho Android.
# Neu co keystore (release.keystore da duoc giai ma o buoc truoc), build ban release co ky.
# Neu khong, build ban debug de con test nhanh.
set -euo pipefail

if [ -f "android/app/release.keystore" ]; then
  echo "==> Tim thay keystore, build release (co ky)"
  flutter build apk --release
  flutter build appbundle --release
else
  echo "==> Khong co keystore, build debug"
  flutter build apk --debug
fi
