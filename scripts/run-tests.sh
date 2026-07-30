#!/usr/bin/env bash
# Chay static analysis + unit/widget test cho project Flutter.
# Xuat coverage report de upload len artifact / codecov sau nay.
set -euo pipefail

echo "==> flutter analyze"
flutter analyze

echo "==> flutter test (co coverage)"
flutter test --coverage
