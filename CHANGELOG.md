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
- Added real Android `core/*` library modules for runtime, navigation, design system, networking, storage, permissions, observability, and debug capabilities.
- Added a concrete `v0.0.1` baseline release plan, release templates, and release-readiness script.
- Added a preview-only storefront basic version on Android and iOS that demonstrates `builtin-default` adapter selection, supported flow scope, and explicit fallback behavior.
- Added live storefront contract probing from the public hosts so Android and iOS can resolve `/api/store/context` and `/api/themes/active` against a local core runtime.

### Changed

- Repositioned the repository as `mobile-foundation`, a public foundation layer for future private native apps.
- Clarified the public/private boundary in docs and repo structure.
- Replaced the Android template-only build with a real Gradle application module and wrapper.
- Expanded the execution plan from “runnable repo” toward “versioned platform product.”
- Hardened platform capability contracts so both Android and iOS hosts now read from foundation modules instead of only host-local placeholders.
- Clarified that the public hosts currently ship only the baseline storefront adapter preview and must fall back visibly for themes that are still planned, limited, experimental, or unsupported.
- Clarified that documented core storefront endpoints can appear in the public networking layer, while tenant-private and product-private endpoints must still stay out.

### Removed

- Removed the previous Expo / React Native business app implementation from the repository.
