#!/usr/bin/env bash
# Cai dependency cho project Flutter.
# Chi lam dung 1 viec: "pub get". Khong lint, khong test o day.
set -euo pipefail

echo "==> flutter pub get"
flutter pub get
