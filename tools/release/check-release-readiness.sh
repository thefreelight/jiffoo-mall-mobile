#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

echo "==> Required release docs"
test -f packages/docs/release/0.0.1-baseline-release-plan.md
test -f packages/docs/release/release-notes-template.md
test -f packages/docs/release/migration-guide-template.md

echo "==> Release manifest"
test -f tools/release/release-manifest.json
rg -q '"version": "0.0.1"' tools/release/release-manifest.json
rg -q '"tag": "v0.0.1"' tools/release/release-manifest.json

echo "==> Changelog discipline"
test -f CHANGELOG.md
rg -q '## \[Unreleased\]' CHANGELOG.md

echo "==> Compatibility lab"
bash tools/ci/check-compatibility-lab.sh

echo "Release readiness checks passed for the current baseline plan."
