#!/usr/bin/env bash
# Build IPA cho iOS (hỗ trợ Flutter và iOS Native).
set -euo pipefail

PROJECT_TYPE="${PROJECT_TYPE:-flutter}"

case "$PROJECT_TYPE" in
  ios)
    echo "==> [iOS Native] Build iOS App qua xcodebuild (no-codesign)"
    mkdir -p build/ios/archive
    xcodebuild archive \
      -no-destination \
      -archivePath build/ios/archive/Runner.xcarchive \
      CODE_SIGNING_ALLOWED=NO \
      CODE_SIGNING_REQUIRED=NO || echo "⚠️ xcodebuild build không tìm thấy project/scheme mặc định."
    ;;
  flutter|*)
    echo "==> [Flutter] flutter build ipa (khong ky, chi de kiem tra build)"
    flutter build ipa --no-codesign
    ;;
esac

