#!/usr/bin/env bash
# Giai ma cac secret dang base64 thanh file that, de Fastlane su dung.
# Neu 1 secret khong duoc thiet lap, BO QUA voi canh bao (khong fail),
# vi khong phai project nao cung deploy ca 3 nen tang cung luc.
set -euo pipefail

mkdir -p credentials

if [ -n "${PLAY_STORE_JSON_KEY_BASE64:-}" ]; then
  echo "${PLAY_STORE_JSON_KEY_BASE64}" | base64 -d > credentials/play-store-key.json
  echo "PLAY_STORE_JSON_KEY_PATH=$(pwd)/credentials/play-store-key.json" >> "${GITHUB_ENV:-/dev/null}"
  echo "✅ Da giai ma Play Store service account key"
else
  echo "⚠️  Bo qua Play Store key (khong co PLAY_STORE_JSON_KEY_BASE64) - chi can neu deploy_target=play_internal"
fi

if [ -n "${FIREBASE_SERVICE_ACCOUNT_BASE64:-}" ]; then
  echo "${FIREBASE_SERVICE_ACCOUNT_BASE64}" | base64 -d > credentials/firebase-key.json
  echo "FIREBASE_SERVICE_ACCOUNT_PATH=$(pwd)/credentials/firebase-key.json" >> "${GITHUB_ENV:-/dev/null}"
  echo "✅ Da giai ma Firebase service account key"
else
  echo "⚠️  Bo qua Firebase key (khong co FIREBASE_SERVICE_ACCOUNT_BASE64) - chi can neu deploy_target=firebase"
fi

if [ -n "${APP_STORE_CONNECT_API_KEY_BASE64:-}" ]; then
  echo "${APP_STORE_CONNECT_API_KEY_BASE64}" | base64 -d > credentials/asc-api-key.p8
  echo "APP_STORE_CONNECT_API_KEY_PATH=$(pwd)/credentials/asc-api-key.p8" >> "${GITHUB_ENV:-/dev/null}"
  echo "✅ Da giai ma App Store Connect API key"
else
  echo "⚠️  Bo qua App Store Connect key (khong co APP_STORE_CONNECT_API_KEY_BASE64) - chi can neu deploy_target=testflight"
fi
