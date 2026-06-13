#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

BOOTED_SIMULATOR_ID="${IOS_UDID:-}"
if [[ -z "$BOOTED_SIMULATOR_ID" ]]; then
  BOOTED_SIMULATOR_ID="$(
    xcrun simctl list devices booted -j |
      node -e '
        const fs = require("fs");
        const input = fs.readFileSync(0, "utf8");
        const runtimes = JSON.parse(input).devices || {};
        for (const devices of Object.values(runtimes)) {
          const simulator = devices.find(device => device.state === "Booted");
          if (simulator) {
            process.stdout.write(simulator.udid);
            process.exit(0);
          }
        }
      '
  )"
fi

if [[ -n "$BOOTED_SIMULATOR_ID" ]]; then
  DESTINATION="id=$BOOTED_SIMULATOR_ID"
else
  DESTINATION="platform=iOS Simulator,name=${IOS_SIMULATOR_NAME:-iPhone 17 Pro Max}"
fi

export NODE_BINARY="${NODE_BINARY:-$(command -v node)}"
export ENVFILE="${ENVFILE:-.env.e2e}"

mkdir -p "$ROOT_DIR/ios/build/Build/Products"
printf '%s\n' "$ENVFILE" > /tmp/envfile
BUILD_DIR="$ROOT_DIR/ios/build/Build/Products" \
  "$ROOT_DIR/node_modules/react-native-config/ios/ReactNativeConfig/BuildDotenvConfig.rb" \
  "$ROOT_DIR" \
  "$ROOT_DIR/node_modules/react-native-config/ios/ReactNativeConfig"

GENERATED_ENV="$ROOT_DIR/node_modules/react-native-config/ios/ReactNativeConfig/GeneratedDotEnv.m"
if ! grep -q '"E2E_MODE":@"true"' "$GENERATED_ENV"; then
  echo "GeneratedDotEnv.m does not contain E2E_MODE=true" >&2
  exit 1
fi

xcodebuild \
  -workspace ios/CoLiving.xcworkspace \
  -scheme CoLiving-E2E \
  -configuration Release \
  -sdk iphonesimulator \
  -destination "$DESTINATION" \
  -derivedDataPath ios/build \
  ONLY_ACTIVE_ARCH=YES \
  build
