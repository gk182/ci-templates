#!/usr/bin/env bash
# Build IPA cho iOS.
# Mac dinh build khong ky (--no-codesign) de kiem tra build co pass hay khong,
# ma khong can setup certificate ngay tu dau.
# Khi da san sang deploy that, doi sang co-codesign + fastlane match (xem fastlane/Fastfile).
set -euo pipefail

echo "==> flutter build ipa (khong ky, chi de kiem tra build)"
flutter build ipa --no-codesign
