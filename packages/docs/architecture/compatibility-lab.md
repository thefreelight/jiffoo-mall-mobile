# Compatibility Lab

This document defines the minimum validation chain required before a foundation release is considered trustworthy for consumers.

## Purpose

The goal is not to prove perfection.

The goal is to prove that a release candidate still behaves like a usable platform product for downstream consumers.

## Minimum Lab Checks

### Contract checks

- public API catalog exists and stays valid
- release manifest exists and matches the documented release strategy
- stability tiers are documented

### Host checks

- Android public host builds successfully
- iOS simulator host builds successfully
- macOS preview host builds successfully

### Package checks

- public Swift Packages still compile and pass smoke tests

### Consumer confidence checks

- release notes and migration notes exist when required
- stable modules are not changed without tier-appropriate handling

## Initial Smoke Targets

The first compatibility lab covers:

- `apps/android` host via `assembleDebug`
- `apps/ios` simulator host via `xcodebuild`
- `apps/ios` macOS preview host via `xcodebuild`
- Swift Package smoke tests for:
  - `AppShell`
  - `DesignSystem`
  - `Navigation`
  - `Networking`
  - `Storage`
  - `Permissions`
  - `Observability`
  - `DebugTools`

## What This Does Not Yet Cover

- real downstream sample apps consuming released artifacts
- upgrade-from-previous-version automation
- API diff tooling
- Android artifact publication smoke tests
- Swift Package consumer sample app tests

Those are the next layer after the minimum lab.

## Execution

Run the initial lab with:

```bash
bash tools/ci/check-compatibility-lab.sh
```

## Release Readiness Interpretation

A release candidate should not be called consumer-ready if:

- host builds fail
- package smoke tests fail
- the public API catalog or release manifest is missing
- stable surface changes are undocumented
