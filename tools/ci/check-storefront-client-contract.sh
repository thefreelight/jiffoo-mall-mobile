#!/usr/bin/env bash
set -euo pipefail

contract_doc="packages/docs/architecture/storefront-client-contract.md"
profile_json="packages/docs/architecture/storefront-client-profile.json"

test -f "$contract_doc"
test -f "$profile_json"

jq -e '.schemaVersion == 1' "$profile_json" >/dev/null
jq -e '.id == "reference-mobile"' "$profile_json" >/dev/null
jq -e '.family == "mobile"' "$profile_json" >/dev/null
jq -e '.sourceOfTruth == "Jiffoo"' "$profile_json" >/dev/null
jq -e '.coreContractPath == "docs/theme-client-platform-contract.md"' "$profile_json" >/dev/null
jq -e '.minimumCoreVersion == "0.0.1"' "$profile_json" >/dev/null

required_modes=(
  "embedded"
  "pack"
  "theme-app"
  "native-adapter"
)

for mode in "${required_modes[@]}"; do
  jq -e --arg mode "$mode" '.supportedThemeModes | index($mode) != null' "$profile_json" >/dev/null
done

required_extensions=(
  "app_block"
  "app_embed"
)

for extension in "${required_extensions[@]}"; do
  jq -e --arg extension "$extension" '.supportedExtensions | index($extension) != null' "$profile_json" >/dev/null
done

required_capabilities=(
  "auth"
  "catalog"
  "cart"
  "checkout"
  "orders"
  "payments"
  "deep-link"
  "auth-session-bridge"
)

for capability in "${required_capabilities[@]}"; do
  jq -e --arg capability "$capability" '.capabilities | index($capability) != null' "$profile_json" >/dev/null
done

rg -q "Source Of Truth" "$contract_doc"
rg -q "Theme Alignment Rules" "$contract_doc"
rg -q "Supported Theme Modes" "$contract_doc"
rg -q "theme-client-official-theme-support.md" "$contract_doc"
rg -q "theme-client-first-wave-rollout.md" "$contract_doc"

echo "Storefront client contract looks valid."
