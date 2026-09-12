#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
platform="${VISUAL_PLATFORM:-ios}"
flows=(01-home 02-menu 03-privacy 04-dark)
ios_app_id="org.reactjs.native.example.CasaMaizChallenge"
android_app_id="com.casamaizchallenge"

# Official install lands here; npm scripts often miss it.
# https://docs.maestro.dev/maestro-cli/how-to-install-maestro-cli
export PATH="${HOME}/.maestro/bin:${HOME}/Library/Android/sdk/platform-tools:${HOME}/Library/Android/sdk/emulator:${PATH}"

if ! command -v java >/dev/null 2>&1; then
  for java_home in \
    "/Library/Java/JavaVirtualMachines/zulu-17.jdk/Contents/Home" \
    "/Applications/Android Studio.app/Contents/jbr/Contents/Home" \
    "/opt/homebrew/opt/openjdk/libexec/openjdk.jdk/Contents/Home"
  do
    if [[ -x "${java_home}/bin/java" ]]; then
      export JAVA_HOME="$java_home"
      export PATH="${JAVA_HOME}/bin:${PATH}"
      break
    fi
  done
fi

if ! command -v maestro >/dev/null 2>&1; then
  echo "Maestro CLI is not installed."
  echo "See https://docs.maestro.dev/maestro-cli/how-to-install-maestro-cli"
  echo "macOS: export MAESTRO_VERSION=2.0.10; curl -fsSL \"https://get.maestro.mobile.dev\" | bash"
  echo "Needs Java 17+. Then: npm run ios  &&  npm run test:visual"
  exit 1
fi

if [[ "$platform" == "android" ]]; then
  output="$root/e2e/maestro/output/android"
  goldens="$root/e2e/maestro/goldens/android"
  diffs="$root/e2e/maestro/diffs/android"
  app_id="$android_app_id"

  if ! command -v adb >/dev/null 2>&1; then
    echo "adb is not on PATH. Install Android platform-tools."
    exit 1
  fi

  serial="$(adb devices | awk '/[[:space:]]device$/{print $1; exit}')"
  if [[ -z "$serial" ]]; then
    echo "No Android emulator or device is connected."
    echo "Boot Flare_Stone, run npm run android, then VISUAL_PLATFORM=android npm run test:visual"
    exit 1
  fi

  echo "Maestro $(maestro --version) → Android $serial"
  # Timeout is milliseconds. https://docs.maestro.dev/maestro-cli/run-your-first-test-with-the-maestro-cli
  export MAESTRO_DRIVER_STARTUP_TIMEOUT="${MAESTRO_DRIVER_STARTUP_TIMEOUT:-180000}"
  adb -s "$serial" reverse tcp:8081 tcp:8081 >/dev/null
  adb -s "$serial" forward --remove tcp:7001 >/dev/null 2>&1 || true
else
  output="$root/e2e/maestro/output"
  goldens="$root/e2e/maestro/goldens"
  diffs="$root/e2e/maestro/diffs"
  app_id="$ios_app_id"
  serial=""

  booted="$(xcrun simctl list devices booted 2>/dev/null || true)"
  if ! grep -q Booted <<<"$booted"; then
    echo "No iOS Simulator is booted."
    echo "Boot a simulator, run npm run ios, then npm run test:visual"
    exit 1
  fi

  # Maestro 2.1+ hangs silently on Xcode 26 / iOS 26. Pin 2.0.10:
  # https://github.com/mobile-dev-inc/maestro/issues/3137
  serial="$(sed -n 's/.*(\([A-F0-9-]\{36\}\)) (Booted).*/\1/p' <<<"$booted" | tail -n 1)"
  if [[ -z "$serial" ]]; then
    echo "Could not read the booted Simulator UDID."
    exit 1
  fi

  echo "Maestro $(maestro --version) → iOS $serial"
fi

mkdir -p "$output" "$diffs"
rm -f "$output"/*.png "$diffs"/*.png

for flow in "${flows[@]}"; do
  echo "Running ${flow}..."
  maestro --platform "$platform" --udid "$serial" test \
    -e APP_ID="$app_id" \
    --test-output-dir "$output/maestro" \
    "$root/e2e/maestro/${flow}.yaml"

  if [[ "$platform" == "android" ]]; then
    adb -s "$serial" exec-out screencap -p > "$output/${flow}.png"
  else
    xcrun simctl io booted screenshot "$output/${flow}.png"
  fi
done

if [[ "${VISUAL_UPDATE:-}" == "1" ]]; then
  VISUAL_UPDATE=1 node "$root/scripts/compare-visual.mjs" "$output" "$goldens" "$diffs"
  exit 0
fi

node "$root/scripts/compare-visual.mjs" "$output" "$goldens" "$diffs"
