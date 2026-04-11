#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

echo "==> Contract checks"
bash tools/ci/check-public-api-catalog.sh
test -f tools/release/release-manifest.json
test -f packages/docs/architecture/compatibility-lab.md

echo "==> Android host smoke"
if ! command -v java >/dev/null 2>&1; then
  echo "java is required for Android host smoke." >&2
  exit 1
fi

if [[ ! -x apps/android/gradlew ]]; then
  echo "Missing Android Gradle wrapper." >&2
  exit 1
fi

(
  cd apps/android
  JAVA_HOME="${JAVA_HOME:-$(/usr/libexec/java_home -v 17 2>/dev/null || true)}" ./gradlew assembleDebug
)

echo "==> Swift package smoke"
if ! command -v swift >/dev/null 2>&1; then
  echo "swift is required for package smoke tests." >&2
  exit 1
fi

for package_dir in \
  apps/ios/Packages/AppShell \
  apps/ios/Packages/DesignSystem \
  apps/ios/Packages/Navigation \
  apps/ios/Packages/Networking \
  apps/ios/Packages/Storage \
  apps/ios/Packages/Permissions \
  apps/ios/Packages/Observability \
  apps/ios/Packages/DebugTools
do
  echo "   -> $package_dir"
  (cd "$package_dir" && swift test)
done

echo "==> iOS host smoke"
if ! command -v xcodebuild >/dev/null 2>&1; then
  echo "xcodebuild is required for iOS and macOS host smoke." >&2
  exit 1
fi

xcodebuild -project apps/ios/MobileFoundation.xcodeproj -scheme MobileFoundation -destination 'platform=iOS Simulator,name=iPhone 16' build
xcodebuild -project apps/ios/MobileFoundation.xcodeproj -scheme FoundationPreview -destination 'platform=macOS' build

echo "Compatibility lab passed."
