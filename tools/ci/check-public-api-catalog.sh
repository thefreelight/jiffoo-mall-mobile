#!/usr/bin/env bash
set -euo pipefail

catalog="packages/docs/architecture/public-api-catalog.json"

if [[ ! -f "$catalog" ]]; then
  echo "Missing public API catalog: $catalog" >&2
  exit 1
fi

required_ids=(
  "app-shell"
  "design-system"
  "navigation"
  "permissions"
  "storage"
  "observability"
  "debug-tools"
  "networking"
  "design-tokens"
  "demo-gallery"
)

for id in "${required_ids[@]}"; do
  if ! rg -q "\"id\": \"$id\"" "$catalog"; then
    echo "Missing capability id in catalog: $id" >&2
    exit 1
  fi
done

if ! rg -q "\"tier\": \"stable\"" "$catalog"; then
  echo "Catalog must declare at least one stable capability." >&2
  exit 1
fi

if ! rg -q "\"targetTier\": \"stable\"" "$catalog"; then
  echo "Catalog must declare at least one target stable capability." >&2
  exit 1
fi

compacted="$(tr -d '\n\r\t ' < "$catalog")"

if [[ "$compacted" != *"\"id\":\"app-shell\",\"tier\":\"internal\""* ]]; then
  echo "App shell must remain internal." >&2
  exit 1
fi

echo "Public API catalog looks valid."
