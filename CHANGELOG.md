# Changelog

All notable changes to this repository will be documented in this file.

The format is inspired by Keep a Changelog and follows a lightweight, human-readable structure.

## [Unreleased]

### Added

- Re-founded the repository as a public native mobile foundation instead of a React Native / Expo app.
- Added Android and iOS foundation shells under `apps/`.
- Added local Swift Packages for `AppShell`, `DesignSystem`, `Navigation`, `Networking`, `Storage`, `Permissions`, `Observability`, and `DebugTools`.
- Added shared documentation scaffolding for architecture, PRD, specs, execution planning, ADRs, and contribution guidance.
- Added a public design token source under [packages/design-tokens/tokens.json](/Users/jordan/Projects/jiffoo-mall-mobile/packages/design-tokens/tokens.json).
- Added CI structure checks in [foundation-checks.yml](/Users/jordan/Projects/jiffoo-mall-mobile/.github/workflows/foundation-checks.yml).
- Added a runnable Android Compose host app under [apps/android/app](/Users/jordan/Projects/jiffoo-mall-mobile/apps/android/app).
- Added a macOS preview host to the iOS workspace so the foundation UI can be previewed locally outside the simulator.
- Added clickable foundation demo galleries on Android and iOS so the public repo explains itself through runnable capability screens.
- Added release-model documentation for stability tiers, semantic versioning, distribution strategy, and compatibility validation.
- Added a public API catalog and stability matrix so consumers can see which capabilities are stable, experimental, or internal.
- Added a concrete distribution blueprint and release manifest for Android artifacts and Swift Package products.
- Added a compatibility lab definition and smoke-check script for release readiness.

### Changed

- Repositioned the repository as `mobile-foundation`, a public foundation layer for future private native apps.
- Clarified the public/private boundary in docs and repo structure.
- Replaced the Android template-only build with a real Gradle application module and wrapper.
- Expanded the execution plan from “runnable repo” toward “versioned platform product.”

### Removed

- Removed the previous Expo / React Native business app implementation from the repository.
